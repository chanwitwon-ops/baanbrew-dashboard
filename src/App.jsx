import Papa from 'papaparse';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  computeKpis,
  customerKpis,
  customersByAgeGroup,
  customersByGender,
  dailySales,
  newCustomersByMonth,
  ordersByHour,
  parseCustomerRows,
  parseSalesRows,
  salesByBranch,
} from './lib/metrics';

const currency = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 });
const ACCENT = '#9c5f2d';
const branchColors = ['#7c4a26', '#ba7638', '#d9a441', '#c2703a', '#8a6d55'];

const CARD = 'rounded-xl border border-coffee-200 bg-white p-4 shadow-sm dark:border-coffee-700 dark:bg-coffee-900';
const SECTION_TITLE = 'mb-2 text-lg font-medium text-coffee-900 dark:text-coffee-100';

const loadCsv = (url) =>
  new Promise((resolve) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => resolve(result.data),
    });
  });

function KpiCard({ label, value }) {
  return (
    <div className={CARD}>
      <p className="text-sm text-coffee-600 dark:text-coffee-300">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-coffee-900 dark:text-coffee-50">{value}</p>
    </div>
  );
}

export default function App() {
  const [sales, setSales] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [splitByBranch, setSplitByBranch] = useState(false);

  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    Promise.all([loadCsv(`${base}sales.csv`), loadCsv(`${base}customers.csv`)]).then(
      ([salesRows, customerRows]) => {
        setSales(parseSalesRows(salesRows));
        setCustomers(parseCustomerRows(customerRows));
      }
    );
  }, []);

  if (!sales || !customers) {
    return (
      <div className="flex min-h-screen items-center justify-center text-coffee-500">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  const kpis = computeKpis(sales);
  const daily = dailySales(sales);
  const byBranch = salesByBranch(sales);
  const { data: hourly, branches } = ordersByHour(sales);

  const custKpis = customerKpis(customers);
  const byAgeGroup = customersByAgeGroup(customers);
  const byGender = customersByGender(customers);
  const newByMonth = newCustomersByMonth(customers);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight text-coffee-800 dark:text-coffee-100">
        ☕ บ้านบรู Dashboard
      </h1>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="ยอดขายรวม" value={`฿${currency.format(kpis.totalRevenue)}`} />
        <KpiCard label="จำนวนบิล" value={currency.format(kpis.orderCount)} />
        <KpiCard label="ยอดเฉลี่ยต่อบิล" value={`฿${currency.format(kpis.avgPerOrder)}`} />
        <KpiCard label="ลูกค้าสมาชิก" value={currency.format(kpis.memberCount)} />
      </div>

      <section className="mt-8">
        <h2 className={SECTION_TITLE}>ยอดขายรายวัน</h2>
        <div className={`h-72 ${CARD}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ead2b3" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#7c4a26' }} minTickGap={30} />
              <YAxis tickFormatter={(v) => currency.format(v)} tick={{ fontSize: 12, fill: '#7c4a26' }} />
              <Tooltip formatter={(v) => `฿${currency.format(v)}`} />
              <Line type="monotone" dataKey="revenue" stroke={ACCENT} dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-8">
        <h2 className={SECTION_TITLE}>ยอดขายแยกสาขา</h2>
        <div className={`h-72 ${CARD}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byBranch}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ead2b3" />
              <XAxis dataKey="branch" tick={{ fontSize: 12, fill: '#7c4a26' }} />
              <YAxis tickFormatter={(v) => currency.format(v)} tick={{ fontSize: 12, fill: '#7c4a26' }} />
              <Tooltip formatter={(v) => `฿${currency.format(v)}`} />
              <Bar dataKey="revenue" fill={ACCENT} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className={SECTION_TITLE}>จำนวนบิลตามชั่วโมงของวัน</h2>
          <button
            type="button"
            onClick={() => setSplitByBranch((v) => !v)}
            className="mb-2 rounded-lg border border-coffee-300 px-3 py-1 text-sm text-coffee-700 hover:bg-coffee-100 dark:border-coffee-600 dark:text-coffee-200 dark:hover:bg-coffee-800"
          >
            {splitByBranch ? 'ดูรวมทุกสาขา' : 'แยกตามสาขา'}
          </button>
        </div>
        <div className={`h-72 ${CARD}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ead2b3" />
              <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#7c4a26' }} tickFormatter={(h) => `${h}:00`} />
              <YAxis tick={{ fontSize: 12, fill: '#7c4a26' }} />
              <Tooltip labelFormatter={(h) => `เวลา ${h}:00`} />
              {splitByBranch ? (
                <>
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {branches.map((b, i) => (
                    <Bar key={b} dataKey={b} stackId="hour" fill={branchColors[i % branchColors.length]} />
                  ))}
                </>
              ) : (
                <Bar dataKey="total" fill={ACCENT} radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <h2 className="mt-12 text-2xl font-semibold tracking-tight text-coffee-800 dark:text-coffee-100">
        ข้อมูลลูกค้า
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <KpiCard label="ลูกค้าทั้งหมด" value={currency.format(custKpis.total)} />
        <KpiCard
          label={`ลูกค้าใหม่เดือนล่าสุด (${custKpis.latestMonth})`}
          value={currency.format(custKpis.newThisMonth)}
        />
      </div>

      <section className="mt-8">
        <h2 className={SECTION_TITLE}>ลูกค้าใหม่รายเดือน</h2>
        <div className={`h-72 ${CARD}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={newByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ead2b3" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#7c4a26' }} />
              <YAxis tick={{ fontSize: 12, fill: '#7c4a26' }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke={ACCENT} dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section>
          <h2 className={SECTION_TITLE}>ลูกค้าตามช่วงอายุ</h2>
          <div className={`h-72 ${CARD}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byAgeGroup}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ead2b3" />
                <XAxis dataKey="age" tick={{ fontSize: 11, fill: '#7c4a26' }} />
                <YAxis tick={{ fontSize: 12, fill: '#7c4a26' }} />
                <Tooltip />
                <Bar dataKey="count" fill={ACCENT} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section>
          <h2 className={SECTION_TITLE}>ลูกค้าตามเพศ</h2>
          <div className={`h-72 ${CARD}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byGender}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ead2b3" />
                <XAxis dataKey="gender" tick={{ fontSize: 12, fill: '#7c4a26' }} />
                <YAxis tick={{ fontSize: 12, fill: '#7c4a26' }} />
                <Tooltip />
                <Bar dataKey="count" fill={ACCENT} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
