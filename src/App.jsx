import Papa from 'papaparse';
import { useEffect, useState } from 'react';
import BranchSalesChart from './components/BranchSalesChart';
import CustomerSection from './components/CustomerSection';
import DailySalesChart from './components/DailySalesChart';
import FiltersBar from './components/FiltersBar';
import HourlyOrdersChart from './components/HourlyOrdersChart';
import KpiCards from './components/KpiCards';
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

export default function App() {
  const [sales, setSales] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [tab, setTab] = useState('sales');
  const [branch, setBranch] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

      <div className="mt-6 flex w-fit gap-1 rounded-lg bg-matcha-100 p-1 dark:bg-ink-900">
        <TabButton active={tab === 'sales'} onClick={() => setTab('sales')} icon={<ChartIcon />}>
          ยอดขาย
        </TabButton>
        <TabButton active={tab === 'customers'} onClick={() => setTab('customers')} icon={<UsersIcon />}>
          ข้อมูลลูกค้า
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
    </div>
  );
}
