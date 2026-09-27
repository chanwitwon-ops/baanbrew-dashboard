import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ACCENT, branchColors, CARD, SECTION_TITLE } from './shared';

export default function HourlyOrdersChart({ hourly, branches }) {
  const [splitByBranch, setSplitByBranch] = useState(false);

  return (
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
  );
}
