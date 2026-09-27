import Papa from 'papaparse';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { computeKpis, dailySales, parseSalesRows, salesByBranch } from './lib/metrics';

const currency = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 });

function KpiCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}

export default function App() {
  const [sales, setSales] = useState(null);

  useEffect(() => {
    Papa.parse('/sales.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => setSales(parseSalesRows(result.data)),
    });
  }, []);

  if (!sales) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  const kpis = computeKpis(sales);
  const daily = dailySales(sales);
  const byBranch = salesByBranch(sales);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">บ้านบรู Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="ยอดขายรวม" value={`฿${currency.format(kpis.totalRevenue)}`} />
        <KpiCard label="จำนวนบิล" value={currency.format(kpis.orderCount)} />
        <KpiCard label="ยอดเฉลี่ยต่อบิล" value={`฿${currency.format(kpis.avgPerOrder)}`} />
        <KpiCard label="ลูกค้าสมาชิก" value={currency.format(kpis.memberCount)} />
      </div>

      <section className="mt-8">
        <h2 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">ยอดขายรายวัน</h2>
        <div className="h-72 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={30} />
              <YAxis tickFormatter={(v) => currency.format(v)} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `฿${currency.format(v)}`} />
              <Line type="monotone" dataKey="revenue" stroke="#aa3bff" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">ยอดขายแยกสาขา</h2>
        <div className="h-72 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byBranch}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="branch" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => currency.format(v)} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `฿${currency.format(v)}`} />
              <Bar dataKey="revenue" fill="#aa3bff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
