# บ้านบรู Dashboard

Lab 1: Basic Data Analytics & Visualization using AI Vibe Coding — RAISE Module 3

React + Vite + Tailwind CSS v4 + Recharts + PapaParse dashboard for BaanBrew coffee shop sales data.

## Getting started

```bash
npm install
npm run dev
```

## What's in the dashboard

- KPI cards: total revenue, order count, average order value, unique member customers
- Daily revenue line chart
- Branch revenue bar chart (sorted descending)
- Homework: bills-by-hour-of-day bar chart, with a toggle to split by branch

Calculation logic lives in [src/lib/metrics.js](src/lib/metrics.js).

## How `computeKpis` counts bills (and why counting rows would be wrong)

`sales.csv` has one row per line item, not per bill — a single order (`order_id`) can span several rows if the customer bought more than one product. `computeKpis` counts bills like this:

```js
const orderIds = new Set(sales.map((r) => r.order_id));
const orderCount = orderIds.size;
```

It builds a `Set` of every `order_id` it sees; a `Set` automatically drops duplicates, so `orderIds.size` is the count of *distinct* bills, no matter how many rows each one took up.

If you counted rows instead (`sales.length`), you'd get **53,092** instead of the correct **34,791** bills — 53% too high — because roughly 1 in 3 bills has 2+ items. It would also drag `avgPerOrder` (`totalRevenue / orderCount`) down to about ฿84 instead of the real ฿128.39, making the average bill look far smaller than it actually is.

## Homework: observations from the "bills by hour of day" chart

1. **The shop only operates roughly 07:00–20:00** — there are zero bills recorded outside this window across all five branches, consistent with normal coffee-shop hours.
2. **Lunchtime (12:00) is the single busiest hour overall** (3,741 bills), with a secondary afternoon bump around 15:00 (3,249 bills) — likely an afternoon coffee-break rush.
3. **The peak hour differs by branch type, matching each location's foot traffic:** office-area branches (สีลม, อารีย์) peak at 08:00 (commute-time coffee), mall branches (สยาม, บางนา) peak later at 16:00 (afternoon/evening shoppers), while the university branch (มหาวิทยาลัย) peaks at 12:00 (student lunch break).
