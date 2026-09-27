import Papa from 'papaparse';
import { useEffect, useState } from 'react';
import BranchSalesChart from './components/BranchSalesChart';
import CustomerSection from './components/CustomerSection';
import DailySalesChart from './components/DailySalesChart';
import HourlyOrdersChart from './components/HourlyOrdersChart';
import KpiCards from './components/KpiCards';
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

      <KpiCards kpis={kpis} />
      <DailySalesChart daily={daily} />
      <BranchSalesChart byBranch={byBranch} />
      <HourlyOrdersChart hourly={hourly} branches={branches} />
      <CustomerSection custKpis={custKpis} newByMonth={newByMonth} byAgeGroup={byAgeGroup} byGender={byGender} />
    </div>
  );
}
