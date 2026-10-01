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
  'rounded-xl border border-matcha-200 bg-white p-4 shadow-sm dark:border-matcha-700 dark:bg-matcha-900';
export const SECTION_TITLE = 'mb-2 text-lg font-medium text-matcha-900 dark:text-matcha-100';

export function KpiCard({ label, value }) {
  return (
    <div className={CARD}>
      <p className="text-sm text-matcha-600 dark:text-matcha-300">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-matcha-900 dark:text-matcha-50">{value}</p>
    </div>
  );
}
