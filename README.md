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

## Homework: observations from the "bills by hour of day" chart

1. **The shop only operates roughly 07:00–20:00** — there are zero bills recorded outside this window across all five branches, consistent with normal coffee-shop hours.
2. **Lunchtime (12:00) is the single busiest hour overall** (3,741 bills), with a secondary afternoon bump around 15:00 (3,249 bills) — likely an afternoon coffee-break rush.
3. **The peak hour differs by branch type, matching each location's foot traffic:** office-area branches (สีลม, อารีย์) peak at 08:00 (commute-time coffee), mall branches (สยาม, บางนา) peak later at 16:00 (afternoon/evening shoppers), while the university branch (มหาวิทยาลัย) peaks at 12:00 (student lunch break).
