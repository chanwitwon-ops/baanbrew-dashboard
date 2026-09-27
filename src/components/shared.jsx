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

export const ACCENT = '#9c5f2d';
export const branchColors = ['#5b3a29', '#c98a3e', '#b1502f', '#e6c358', '#7a3b46'];

export const CARD =
  'rounded-xl border border-coffee-200 bg-white p-4 shadow-sm dark:border-coffee-700 dark:bg-coffee-900';
export const SECTION_TITLE = 'mb-2 text-lg font-medium text-coffee-900 dark:text-coffee-100';

export function KpiCard({ label, value }) {
  return (
    <div className={CARD}>
      <p className="text-sm text-coffee-600 dark:text-coffee-300">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-coffee-900 dark:text-coffee-50">{value}</p>
    </div>
  );
}
