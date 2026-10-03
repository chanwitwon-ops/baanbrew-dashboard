// Lab 2.2 · กราฟที่ซ่อมแล้ว FixedChart1 … FixedChart5 (รับ props { rows, products })
// ทุกกราฟ: สีหลักสีเดียว ตัวเลขมี ฿ และจุลภาค และมีข้อสรุป 1 บรรทัดที่คำนวณจากข้อมูลจริง
import { useMemo } from "react";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, LabelList,
} from "recharts";
import { ACCENT, currency } from "../components/shared";
import {
  revenueByProduct, monthlyRevenue, daysInMonth, branchPerformance, weeklyRevenue, thaiMonth,
} from "./lab2Metrics.js";

const baht = (n) => `฿${currency.format(Math.round(n))}`;
const shortBaht = (n) => (n >= 1_000_000 ? `฿${(n / 1_000_000).toFixed(1)} ล.` : n >= 1000 ? `฿${Math.round(n / 1000)}k` : `฿${n}`);
const pct = (x) => `${(x * 100).toFixed(1)}%`;
const GRID = "#e5e7eb";
const TICK = { fontSize: 12, fill: "#44403c" };
const thaiDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

function Frame({ summary, note, children }) {
  return (
    <div className="flex h-full flex-col">
      <p className="mb-1 text-sm font-semibold leading-snug text-stone-800">{summary}</p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
      {note && <p className="mt-1 text-xs text-stone-500">{note}</p>}
    </div>
  );
}

/** กราฟ 1: 10 เมนูที่ทำเงินสูงสุด เป็นแท่งแนวนอนเรียงมากไปน้อย แทน pie 40 ชิ้น */
export function FixedChart1({ rows, products }) {
  const all = useMemo(() => revenueByProduct(rows, products), [rows, products]);
  const top = all.slice(0, 10);
  const top10Share = top.reduce((s, d) => s + d.share, 0);
  const summary = `เมนูอันดับ 1 คือ ${top[0].name} ทำเงิน ${baht(top[0].revenue)} (${pct(top[0].share)} ของยอดรวม) และ 10 เมนูแรกรวมกันคิดเป็น ${pct(top10Share)}`;
  return (
    <Frame summary={summary}>
      <BarChart data={top} layout="vertical" margin={{ left: 0, right: 80, top: 4, bottom: 4 }}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={120} tick={TICK} interval={0} />
        <Tooltip formatter={(v) => [baht(v), "ยอดขาย"]} />
        <Bar dataKey="revenue" fill={ACCENT} isAnimationActive={false}>
          <LabelList dataKey="revenue" position="right" formatter={baht} style={{ fontSize: 11, fill: "#44403c" }} />
        </Bar>
      </BarChart>
    </Frame>
  );
}

/** กราฟ 2: ยอดขายแยกสาขา แกนเริ่มที่ 0 เรียงมากไปน้อย สีเดียว พร้อมตัวเลขบนแท่ง */
export function FixedChart2({ rows }) {
  const data = useMemo(() => branchPerformance(rows).sort((a, b) => b.revenue - a.revenue), [rows]);
  const hi = data[0], lo = data[data.length - 1];
  const summary = `ยอดรวมของ${hi.branch} (${baht(hi.revenue)}) เป็น ${(hi.revenue / lo.revenue).toFixed(1)} เท่าของ${lo.branch} (${baht(lo.revenue)})`;
  return (
    <Frame summary={summary}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 90, top: 4, bottom: 4 }}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" domain={[0, "dataMax"]} hide />
        <YAxis type="category" dataKey="branch" width={90} tick={TICK} />
        <Tooltip formatter={(v) => [baht(v), "ยอดขาย"]} />
        <Bar dataKey="revenue" fill={ACCENT} isAnimationActive={false}>
          <LabelList dataKey="revenue" position="right" formatter={baht} style={{ fontSize: 12, fill: "#44403c" }} />
        </Bar>
      </BarChart>
    </Frame>
  );
}

/** กราฟ 3: ยอดขายรายสัปดาห์ (เฉพาะสัปดาห์ที่ข้อมูลครบ 7 วัน) เห็นแนวโน้มชัดกว่ารายวัน */
export function FixedChart3({ rows }) {
  const data = useMemo(() => weeklyRevenue(rows), [rows]);
  const n = 8;
  const first = mean(data.slice(0, n).map((d) => d.revenue));
  const last = mean(data.slice(-n).map((d) => d.revenue));
  const change = (last - first) / first;
  const summary = `ยอดขายเฉลี่ยต่อสัปดาห์ ${n} สัปดาห์ล่าสุด ${baht(last)} ${change >= 0 ? "สูงกว่า" : "ต่ำกว่า"} ${n} สัปดาห์แรก (${baht(first)}) อยู่ ${pct(Math.abs(change))}`;
  return (
    <Frame summary={summary} note="รวมรายสัปดาห์ (จันทร์–อาทิตย์) ตัดสัปดาห์ที่ข้อมูลไม่ครบ 7 วันออก">
      <LineChart data={data} margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="week" tickFormatter={thaiDate} tick={TICK} minTickGap={50} />
        <YAxis domain={[0, "auto"]} tickFormatter={shortBaht} width={55} tick={TICK} />
        <Tooltip labelFormatter={(w) => `สัปดาห์เริ่ม ${thaiDate(w)}`} formatter={(v) => [baht(v), "ยอดขายรายสัปดาห์"]} />
        <Line dataKey="revenue" stroke={ACCENT} strokeWidth={2.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </Frame>
  );
}

/** กราฟ 4: ยอดเฉลี่ยต่อวันของแต่ละเดือน แทนยอดรวม เพราะเดือนล่าสุดมีข้อมูลไม่ครบเดือน */
export function FixedChart4({ rows }) {
  const data = useMemo(
    () =>
      monthlyRevenue(rows).map((m) => {
        const full = m.days === daysInMonth(m.month);
        return { ...m, full, label: thaiMonth(m.month) + (full ? "" : "*") };
      }),
    [rows]
  );
  const last = data[data.length - 1], prev = data[data.length - 2];
  const change = (last.perDay - prev.perDay) / prev.perDay;
  const summary = `${thaiMonth(last.month)} มีข้อมูลแค่ ${last.days} จาก ${daysInMonth(last.month)} วัน แต่ยอดเฉลี่ยต่อวัน ${baht(last.perDay)} ${change >= 0 ? "สูงกว่า" : "ต่ำกว่า"}เดือนก่อน (${baht(prev.perDay)}) ${pct(Math.abs(change))}`;
  return (
    <Frame summary={summary} note="* เดือนที่ข้อมูลไม่ครบทั้งเดือน · แสดงยอดเฉลี่ยต่อวัน ไม่ใช่ยอดรวม">
      <BarChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#44403c" }} interval={0} angle={-40} textAnchor="end" height={44} />
        <YAxis domain={[0, "auto"]} tickFormatter={shortBaht} width={50} tick={TICK} />
        <Tooltip
          labelFormatter={(l) => l}
          formatter={(v, _n, p) => [baht(v), `เฉลี่ยต่อวัน (${p.payload.days} วัน)`]}
        />
        <Bar dataKey="perDay" isAnimationActive={false}>
          {data.map((d) => <Cell key={d.month} fill={ACCENT} fillOpacity={d.full ? 1 : 0.5} />)}
        </Bar>
      </BarChart>
    </Frame>
  );
}

/** กราฟ 5: ยอดเฉลี่ยต่อวันของแต่ละสาขา (ยุติธรรมกับสาขาที่เปิดทีหลัง) พร้อมจำนวนวันที่เปิดขาย */
export function FixedChart5({ rows }) {
  const data = useMemo(
    () =>
      branchPerformance(rows)
        .sort((a, b) => b.perDay - a.perDay)
        .map((b) => ({ ...b, label: `${b.branch} (${b.days} วัน)` })),
    [rows]
  );
  const hi = data[0], lo = data[data.length - 1];
  const summary = `เทียบเป็นยอดเฉลี่ยต่อวัน ${lo.branch} ต่ำสุดที่ ${baht(lo.perDay)}/วัน เทียบกับ ${hi.branch} สูงสุด ${baht(hi.perDay)}/วัน`;
  return (
    <Frame summary={summary} note="วงเล็บ = จำนวนวันที่สาขามียอดขายในข้อมูล · ควรดูประเภทสาขา/ทำเลประกอบก่อนประเมินผู้จัดการ">
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 90, top: 4, bottom: 4 }}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" domain={[0, "dataMax"]} hide />
        <YAxis type="category" dataKey="label" width={130} tick={TICK} interval={0} />
        <Tooltip formatter={(v) => [baht(v), "เฉลี่ยต่อวัน"]} />
        <Bar dataKey="perDay" fill={ACCENT} isAnimationActive={false}>
          <LabelList dataKey="perDay" position="right" formatter={(v) => `${baht(v)}/วัน`} style={{ fontSize: 12, fill: "#44403c" }} />
        </Bar>
      </BarChart>
    </Frame>
  );
}
