# Project status / handoff

Snapshot as of **2026-09-27**, written so this is picked up cleanly from any machine (clone this repo, or open a fresh AI session and point it at this file).

## Links

- **Live site:** https://chanwitwon-ops.github.io/baanbrew-dashboard/
- **GitHub repo:** https://github.com/chanwitwon-ops/baanbrew-dashboard (public, account `chanwitwon-ops`)
- Course: RAISE Batch 2, Module 3 (Data Analytics & AI), Mae Fah Luang University — instructor **Khwunta Kirimasthong**. Base course material (slides/labs) authored by **Nongnuch Ketui, Ph.D. (AIAT/RMUTL)**.

## Done

- **Lab 1** (BaanBrew sales dashboard): KPI cards, daily line chart w/ 7-day moving average, branch bar chart, hourly-bills homework chart. Verified against a manual Excel Pivot Table and against the instructor's own hidden answer key (both matched exactly). Component structure and chart styling matched to the instructor's own live-coding demo (screen-recorded video), not just the slides. Deployed to GitHub Pages, pushed to GitHub. **Submitted.**
- **Homework 2, prep only** (data profiling on `customers.csv`, adding a customer section to the dashboard): the dashboard-side visualization is already live (see "ข้อมูลลูกค้า" section on the site, currently reading the raw `customers.csv`). The Colab notebook for the profiling exercise itself is prepared but **not yet run** — see `homework2-colab/Customer_Profiling.ipynb` in this repo (plus `customers.csv` / `branches.csv` to upload alongside it). User intends to run this themselves in real Google Colab (not have the AI fabricate outputs), then send back `customers_clean.csv` to swap into `public/customers.csv`.

## Deadlines

- **Lab 1 + Homework 2:** Friday 2 Oct 2026, before midnight — submit as a website link (not just a repo link).
- **Project topic proposal** (separate homework, 1 paragraph answering 5 questions: problem / user / data / 3 questions the dashboard must answer / desired AI feature): due Saturday 3 Oct 2026. **Not started.**

## Known but not started (deliberately on hold)

- **Lab 2** (`Lab2/` folder, not in this repo): Lab 2.1 is data profiling/cleaning on `sales_raw.csv` (see `Lab2/lab2.1-colab/`), Lab 2.2 is a "fix the bad charts" exercise (see `Lab2/lab2.2-dashboard/`). User wants to start a **dedicated new session** for this rather than continue in the Lab 1 thread. Open question before starting: the official curriculum's Lab 2.1 uses `sales_raw.csv`, while a separately-pasted "Homework 2" brief asked for `customers.csv` instead — clarify which is actually expected before building anything.
- **Lab 3 / Day 2 PM** (per the instructor's slides, not started at all): migrate the dashboard from CSV to **Firebase Firestore** with real-time updates (`onSnapshot`), add Google-auth login, Firestore Security Rules, and deploy via Firebase Hosting or Vercel.

## Setting up on a different machine

```bash
git clone https://github.com/chanwitwon-ops/baanbrew-dashboard.git
cd baanbrew-dashboard
npm install
npm run dev        # http://localhost:5173 (or whatever port Vite picks)
```

To deploy changes: `npm run build` then `npx gh-pages -d dist`, then `git add -A && git commit && git push` as usual.

- Needs **Node.js v20+**.
- Needs **GitHub CLI** (`gh`) authenticated as the `chanwitwon-ops` account (`gh auth login`) if you want to create repos / push from a fresh machine without an existing git credential.
- To view the instructor's PDF slide decks as images (poppler wasn't preinstalled on the original machine): `winget install oschwartz10612.Poppler`, then use `pdftoppm.exe -png -f <first> -l <last> input.pdf output_prefix`.
- Original lesson materials (Day 1–2 slides, `Lab2/` folder contents, lecture recordings) were downloaded from the instructor's shared Google Drive folder — re-download from there on a new machine rather than copying files by hand; ask the user for the Drive link if it's not already at hand.
