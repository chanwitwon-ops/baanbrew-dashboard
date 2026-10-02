export const currency = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 });
export const currency2 = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const thaiShortDate = (dateStr) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  });

export const thaiFullDate = (dateStr) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const ACCENT = '#577b2b';
export const branchColors = ['#32491a', '#7fa83f', '#c9a227', '#b5451b', '#a7c98f'];

export const CARD =
  'rounded-xl border border-matcha-200 bg-white p-4 shadow-sm dark:border-ink-800 dark:bg-ink-900';
export const SECTION_TITLE = 'mb-2 text-lg font-medium text-matcha-900 dark:text-matcha-100';

export function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V10M12 20V4M20 20v-6" />
    </svg>
  );
}

export function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M8.5 10.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM20 19v-1.5a3.5 3.5 0 0 0-2.5-3.35M14.5 4.65a3 3 0 0 1 0 5.7"
      />
    </svg>
  );
}

export function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'flex items-center gap-1.5 rounded-md bg-white px-4 py-1.5 text-sm font-medium text-matcha-800 shadow-sm dark:bg-ink-800 dark:text-matcha-100'
          : 'flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium text-matcha-600 hover:text-matcha-800 dark:text-matcha-400 dark:hover:text-matcha-200'
      }
    >
      {icon}
      {children}
    </button>
  );
}

export function KpiCard({ label, value }) {
  return (
    <div className={CARD}>
      <p className="text-sm text-matcha-600 dark:text-matcha-300">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-matcha-900 dark:text-matcha-50">{value}</p>
    </div>
  );
}
