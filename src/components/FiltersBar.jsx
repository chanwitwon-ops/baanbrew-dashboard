import { CARD } from './shared';

const FIELD = 'rounded-md border border-matcha-200 bg-white px-2 py-1.5 text-sm text-matcha-900 focus:border-matcha-500 focus:outline-none dark:border-ink-800 dark:bg-ink-900 dark:text-matcha-50';
const LABEL = 'mb-1 block text-xs font-medium text-matcha-600 dark:text-matcha-400';

export default function FiltersBar({
  branches,
  branch,
  onBranchChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  maxDate,
  onReset,
}) {
  const isFiltered = branch !== 'all' || startDate !== minDate || endDate !== maxDate;

  return (
    <div className={`mt-4 flex flex-wrap items-end gap-4 ${CARD}`}>
      <div>
        <label className={LABEL} htmlFor="filter-start">
          ตั้งแต่วันที่
        </label>
        <input
          id="filter-start"
          type="date"
          className={FIELD}
          value={startDate}
          min={minDate}
          max={endDate}
          onChange={(e) => onStartDateChange(e.target.value)}
        />
      </div>

      <div>
        <label className={LABEL} htmlFor="filter-end">
          ถึงวันที่
        </label>
        <input
          id="filter-end"
          type="date"
          className={FIELD}
          value={endDate}
          min={startDate}
          max={maxDate}
          onChange={(e) => onEndDateChange(e.target.value)}
        />
      </div>

      <div>
        <label className={LABEL} htmlFor="filter-branch">
          สาขา
        </label>
        <select
          id="filter-branch"
          className={FIELD}
          value={branch}
          onChange={(e) => onBranchChange(e.target.value)}
        >
          <option value="all">ทุกสาขา</option>
          {branches.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {isFiltered && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-matcha-600 hover:text-matcha-800 dark:text-matcha-400 dark:hover:text-matcha-200"
        >
          ล้างตัวกรอง
        </button>
      )}
    </div>
  );
}
