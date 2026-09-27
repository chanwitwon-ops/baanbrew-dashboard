import { currency, KpiCard } from './shared';

export default function KpiCards({ kpis }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      <KpiCard label="ยอดขายรวม" value={`฿${currency.format(kpis.totalRevenue)}`} />
      <KpiCard label="จำนวนบิล" value={currency.format(kpis.orderCount)} />
      <KpiCard label="ยอดเฉลี่ยต่อบิล" value={`฿${currency.format(kpis.avgPerOrder)}`} />
      <KpiCard label="ลูกค้าสมาชิก" value={currency.format(kpis.memberCount)} />
    </div>
  );
}
