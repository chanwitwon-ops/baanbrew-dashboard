import Papa from 'papaparse';
import { useEffect, useMemo, useState } from 'react';
import BranchSalesChart from './components/BranchSalesChart';
import CustomerSection from './components/CustomerSection';
import DailySalesChart from './components/DailySalesChart';
import FiltersBar from './components/FiltersBar';
import HourlyOrdersChart from './components/HourlyOrdersChart';
import KpiCards from './components/KpiCards';
import Lab2Page from './lab2/Lab2Page';
import CustomersTab from './lab4/CustomersTab.jsx';
import ForecastTab from './lab4/ForecastTab.jsx';
import { createDemoSource, firestoreSource } from './lab3/dataSource.js';
import { isConfigured } from './lab3/firebase.js';
import LiveTab from './lab3/LiveTab.jsx';
import RulesTester from './lab3/RulesTester.jsx';
import SetupGuide from './lab3/SetupGuide.jsx';
import { ChartIcon, TabButton, thaiFullDate, UsersIcon } from './components/shared';
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

const loadCsv = (url) =>
  new Promise((resolve) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => resolve(result.data),
    });
  });

// เปิดโหมดสาธิต (คำนวณ Lab 4 ในเบราว์เซอร์ ไม่ใช้ Firebase) ด้วย ?demo
const DEMO = new URLSearchParams(location.search).has('demo');

export default function App() {
  const [sales, setSales] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [products, setProducts] = useState(null);
  const [cleanSales, setCleanSales] = useState(null);
  const TAB_IDS = ['lab2', 'live', 'menu', 'forecast', 'rules'];
  const [tab, setTab] = useState(() => TAB_IDS.find((id) => location.hash === `#${id}`) ?? 'sales');
  const [branch, setBranch] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    Promise.all([
      loadCsv(`${base}sales.csv`),
      loadCsv(`${base}customers.csv`),
      loadCsv(`${base}products.csv`),
    ]).then(([salesRows, customerRows, productRows]) => {
      setSales(parseSalesRows(salesRows));
      setCustomers(parseCustomerRows(customerRows));
      setProducts(productRows);
    });
  }, []);

  // Lab 2.2 ใช้ข้อมูลที่ทำความสะอาดแล้วจาก Lab 2.1 โหลดเมื่อเปิดแท็บนี้เท่านั้น
  useEffect(() => {
    if (tab !== 'lab2' || cleanSales) return;
    loadCsv(`${import.meta.env.BASE_URL}sales_clean.csv`).then((rows) => setCleanSales(parseSalesRows(rows)));
  }, [tab, cleanSales]);

  // Lab 4 · แหล่งข้อมูลของแท็บวิเคราะห์: Firestore (analytics 5 เอกสาร) หรือโหมดสาธิต
  const [demoSource, setDemoSource] = useState(null);
  useEffect(() => {
    if (!DEMO || demoSource || !['menu', 'forecast'].includes(tab) || !products) return;
    const base = import.meta.env.BASE_URL;
    Promise.all([loadCsv(`${base}sales_clean.csv`), loadCsv(`${base}thai_holidays.csv`)]).then(([rows, hol]) => {
      const holidays = Object.fromEntries(hol.map((h) => [h.date, h.holiday]));
      setDemoSource(createDemoSource(parseSalesRows(rows), products, holidays));
    });
  }, [tab, products, demoSource]);
  const analyticsSource = useMemo(
    () => (DEMO ? demoSource : isConfigured ? firestoreSource : null),
    [demoSource]
  );
  const analyticsTab = (Tab) =>
    analyticsSource ? <Tab source={analyticsSource} /> : DEMO ? <p className="text-matcha-500">กำลังโหลดข้อมูลสาธิต...</p> : <SetupGuide />;

  const chooseTab = (id) => {
    setTab(id);
    history.replaceState(null, '', TAB_IDS.includes(id) ? `${location.search}#${id}` : location.search || location.pathname);
  };

  if (!sales || !customers || !products) {
    return (
      <div className="flex min-h-screen items-center justify-center text-matcha-500">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  const allDates = sales.map((r) => r.date);
  const minDate = allDates.reduce((min, d) => (d < min ? d : min), allDates[0]);
  const maxDate = allDates.reduce((max, d) => (d > max ? d : max), allDates[0]);
  const effectiveStart = startDate || minDate;
  const effectiveEnd = endDate || maxDate;
  const branchOptions = [...new Set(sales.map((r) => r.branch))].sort();

  const filteredSales = sales.filter(
    (r) => r.date >= effectiveStart && r.date <= effectiveEnd && (branch === 'all' || r.branch === branch)
  );

  const kpis = computeKpis(filteredSales);
  const daily = dailySales(filteredSales);
  const byBranch = salesByBranch(filteredSales);
  const { data: hourly, branches } = ordersByHour(filteredSales);

  const custKpis = customerKpis(customers);
  const byAgeGroup = customersByAgeGroup(customers);
  const byGender = customersByGender(customers);
  const newByMonth = newCustomersByMonth(customers);

  const rangeStart = daily[0]?.date;
  const rangeEnd = daily[daily.length - 1]?.date;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-matcha-800 dark:text-matcha-100">
          🍵 บ้านบรู Dashboard
        </h1>
        {rangeStart && rangeEnd && (
          <p className="text-sm text-matcha-500 dark:text-matcha-400">
            {thaiFullDate(rangeStart)} ถึง {thaiFullDate(rangeEnd)}
          </p>
        )}
      </div>

      <div className="mt-6 flex w-fit max-w-full flex-wrap gap-1 rounded-lg bg-matcha-100 p-1 dark:bg-ink-900">
        <TabButton active={tab === 'sales'} onClick={() => chooseTab('sales')} icon={<ChartIcon />}>
          ยอดขาย
        </TabButton>
        <TabButton active={tab === 'customers'} onClick={() => chooseTab('customers')} icon={<UsersIcon />}>
          ข้อมูลลูกค้า
        </TabButton>
        <TabButton active={tab === 'lab2'} onClick={() => chooseTab('lab2')} icon={<ChartIcon />}>
          Lab 2.2 · ซ่อมกราฟ
        </TabButton>
        <TabButton active={tab === 'live'} onClick={() => chooseTab('live')} icon={<ChartIcon />}>
          สด · Firestore
        </TabButton>
        <TabButton active={tab === 'menu'} onClick={() => chooseTab('menu')} icon={<UsersIcon />}>
          ลูกค้า &amp; เมนู
        </TabButton>
        <TabButton active={tab === 'forecast'} onClick={() => chooseTab('forecast')} icon={<ChartIcon />}>
          พยากรณ์ &amp; ผิดปกติ
        </TabButton>
        <TabButton active={tab === 'rules'} onClick={() => chooseTab('rules')} icon={<ChartIcon />}>
          ทดสอบ Rules
        </TabButton>
      </div>

      {tab === 'sales' && (
        <>
          <FiltersBar
            branches={branchOptions}
            branch={branch}
            onBranchChange={setBranch}
            startDate={effectiveStart}
            endDate={effectiveEnd}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            minDate={minDate}
            maxDate={maxDate}
            onReset={() => {
              setBranch('all');
              setStartDate('');
              setEndDate('');
            }}
          />
          <KpiCards kpis={kpis} />
          <DailySalesChart daily={daily} />
          <BranchSalesChart byBranch={byBranch} />
          <HourlyOrdersChart hourly={hourly} branches={branches} />
        </>
      )}

      {tab === 'customers' && (
        <CustomerSection custKpis={custKpis} newByMonth={newByMonth} byAgeGroup={byAgeGroup} byGender={byGender} />
      )}

      {tab === 'live' && (isConfigured ? <LiveTab /> : <SetupGuide />)}

      {tab === 'menu' && <div className="mt-6 rounded-xl bg-stone-100 p-4 text-stone-900">{analyticsTab(CustomersTab)}</div>}

      {tab === 'forecast' && <div className="mt-6 rounded-xl bg-stone-100 p-4 text-stone-900">{analyticsTab(ForecastTab)}</div>}

      {tab === 'rules' && <div className="mt-6">{isConfigured ? <RulesTester /> : <SetupGuide />}</div>}

      {tab === 'lab2' && (
        <div className="mt-6">
          <p className="mb-4 rounded-lg bg-matcha-100 px-4 py-2 text-sm text-matcha-800">
            แท็บนี้ใช้ข้อมูลที่ทำความสะอาดแล้วจาก Lab 2.1 (sales_clean.csv · ตัดบิลยกเลิกและแถวที่ไม่มีรหัสสินค้า 35 แถว)
            ตัวเลขจึงต่างจากแท็บ "ยอดขาย" ซึ่งใช้ข้อมูลของ Lab 1 เล็กน้อย
          </p>
          {cleanSales ? (
            <Lab2Page rows={cleanSales} products={products} />
          ) : (
            <p className="text-matcha-500">กำลังโหลดข้อมูลที่ทำความสะอาดแล้ว...</p>
          )}
        </div>
      )}
    </div>
  );
}
