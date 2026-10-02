import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ACCENT, CARD, currency, KpiCard, SECTION_TITLE } from './shared';

export default function CustomerSection({ custKpis, newByMonth, byAgeGroup, byGender }) {
  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-4">
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
    </>
  );
}
