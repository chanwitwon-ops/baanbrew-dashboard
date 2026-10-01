import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ACCENT, CARD, currency, SECTION_TITLE } from './shared';

export default function BranchSalesChart({ byBranch }) {
  return (
    <section className="mt-8">
      <h2 className={SECTION_TITLE}>ยอดขายแยกสาขา</h2>
      <div className={`h-72 ${CARD}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byBranch}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-matcha-200)" />
            <XAxis dataKey="branch" tick={{ fontSize: 12, fill: 'var(--color-matcha-700)' }} />
            <YAxis tickFormatter={(v) => currency.format(v)} tick={{ fontSize: 12, fill: 'var(--color-matcha-700)' }} />
            <Tooltip formatter={(v) => `฿${currency.format(v)}`} />
            <Bar dataKey="revenue" fill={ACCENT} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
