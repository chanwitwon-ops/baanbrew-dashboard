import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ACCENT, CARD, currency, SECTION_TITLE, thaiShortDate } from './shared';

export default function DailySalesChart({ daily }) {
  return (
    <section className="mt-8">
      <h2 className={SECTION_TITLE}>ยอดขายรายวัน</h2>
      <div className={`h-72 ${CARD}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={daily}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ead2b3" />
            <XAxis
              dataKey="date"
              tickFormatter={thaiShortDate}
              tick={{ fontSize: 12, fill: '#7c4a26' }}
              minTickGap={40}
            />
            <YAxis tickFormatter={(v) => currency.format(v)} tick={{ fontSize: 12, fill: '#7c4a26' }} />
            <Tooltip labelFormatter={thaiShortDate} formatter={(v) => `฿${currency.format(v)}`} />
            <Line
              type="monotone"
              dataKey="revenue"
              name="รายวัน"
              stroke={ACCENT}
              strokeOpacity={0.3}
              dot={false}
              strokeWidth={1.5}
            />
            <Line type="monotone" dataKey="ma7" name="เฉลี่ย 7 วัน" stroke={ACCENT} dot={false} strokeWidth={2.5} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
