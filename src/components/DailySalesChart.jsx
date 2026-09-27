import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CARD, currency, SECTION_TITLE, thaiShortDate } from './shared';

const MA7_COLOR = '#e2482a';
const DAILY_COLOR = '#6b7280';

function DailyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const ma7 = payload.find((p) => p.dataKey === 'ma7');
  const daily = payload.find((p) => p.dataKey === 'revenue');

  return (
    <div className="rounded-lg border border-coffee-200 bg-white p-2 text-sm shadow dark:border-coffee-700 dark:bg-coffee-900">
      <p className="mb-1 font-medium text-coffee-900 dark:text-coffee-100">{thaiShortDate(label)}</p>
      {ma7 && ma7.value != null && (
        <p className="font-semibold" style={{ color: MA7_COLOR }}>
          เฉลี่ย 7 วัน: ฿{currency.format(ma7.value)}
        </p>
      )}
      {daily && (
        <p className="text-coffee-500 dark:text-coffee-400">ยอดวันนั้น: ฿{currency.format(daily.value)}</p>
      )}
    </div>
  );
}

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
            <Tooltip content={<DailyTooltip />} />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="linear"
              dataKey="revenue"
              name="ยอดรายวัน"
              stroke={DAILY_COLOR}
              strokeOpacity={0.35}
              dot={false}
              strokeWidth={1.25}
            />
            <Line
              type="monotone"
              dataKey="ma7"
              name="เฉลี่ย 7 วัน"
              stroke={MA7_COLOR}
              dot={false}
              strokeWidth={2.75}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
