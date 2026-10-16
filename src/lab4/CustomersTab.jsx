// Lab 4.1–4.2 · ลูกค้าและเมนู: RFM, Cohort, ABC
import { useEffect, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LabelList, Cell, ReferenceLine, ScatterChart, Scatter,
} from "recharts";
import { AnalyticsShell, Card, Pending, Insight, GREEN, MAIN, MUTED, INK, pct, thaiMonth } from "./ui.jsx";
import { useAnalytics } from "./useAnalytics.js";
import { SEGMENTS } from "../lib/analytics/rfm.js";
import { fmtBaht } from "../lib/metrics.js";

const SEG_TH = Object.fromEntries(SEGMENTS.map((s) => [s.id, s]));

// ---------------- RFM ----------------
function RfmCard({ rfm, onPick, picked }) {
  if (rfm.error) return <Card title="RFM · กลุ่มลูกค้า"><Pending lab="Lab 4.1" error={rfm.error} /></Card>;
  const data = rfm.segments.map((s) => ({ ...s, label: SEG_TH[s.segment].th }));
  const ch = rfm.segments.find((s) => s.segment === "Champions");
  const risk = rfm.segments.find((s) => s.segment === "At Risk");
  return (
    <Card title="RFM · กลุ่มลูกค้าสมาชิก" sub="สัดส่วนจำนวนลูกค้า เทียบกับสัดส่วนยอดซื้อ">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 48 }} barGap={2}>
            <CartesianGrid horizontal={false} stroke="#eee" />
            <XAxis type="number" tickFormatter={(v) => pct(v)} domain={[0, 0.45]} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="label" width={96} tick={{ fontSize: 13 }} />
            <Tooltip formatter={(v, n) => [pct(v, 1), n]} cursor={{ fill: "#f5f5f4" }} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Bar name="% ลูกค้า" dataKey="customerShare" fill={MUTED} radius={[0, 4, 4, 0]} isAnimationActive={false}
                 onClick={(d) => onPick?.(d.payload?.segment ?? d.segment)} style={{ cursor: "pointer" }} />
            <Bar name="% ยอดซื้อ" dataKey="revenueShare" fill={MAIN} radius={[0, 4, 4, 0]} isAnimationActive={false}
                 onClick={(d) => onPick?.(d.payload?.segment ?? d.segment)} style={{ cursor: "pointer" }}>
              {data.map((d) => <Cell key={d.segment} fill={picked && picked !== d.segment ? GREEN[2] : MAIN} />)}
              <LabelList dataKey="revenueShare" position="right" formatter={(v) => pct(v)} style={{ fontSize: 12, fill: INK }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Insight>
        ลูกค้าชั้นยอด {ch.customers.toLocaleString()} คน ({pct(ch.customerShare)} ของสมาชิก) ทำยอด {pct(ch.revenueShare)} ·
        กลุ่มเสี่ยงหาย {risk.customers.toLocaleString()} คน ยังถือยอด {pct(risk.revenueShare)} เป็นเป้าหมายแรกของแคมเปญดึงกลับ
      </Insight>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="text-left text-stone-500"><tr><th className="py-1 font-medium">กลุ่ม</th><th className="text-right font-medium">ลูกค้า</th><th className="text-right font-medium">ยอดซื้อ</th><th className="pl-4 font-medium">ควรทำอะไร</th></tr></thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.segment} onClick={() => onPick?.(d.segment)}
                  className={`cursor-pointer border-t border-stone-100 hover:bg-stone-50 ${picked === d.segment ? "bg-emerald-50" : ""}`}>
                <td className="py-1.5">{d.label} <span className="text-stone-400">{d.segment}</span></td>
                <td className="text-right tabular-nums">{d.customers.toLocaleString()}</td>
                <td className="text-right tabular-nums">{fmtBaht(d.revenue)}</td>
                <td className="pl-4 text-stone-600">{SEG_TH[d.segment].action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ---------------- Cohort ----------------
function CohortCard({ cohort }) {
  if (cohort.error) return <Card title="Cohort · การกลับมาซื้อซ้ำ"><Pending lab="Lab 4.2" error={cohort.error} /></Card>;
  const MAXK = 12;
  const shade = (v) => GREEN[Math.min(5, Math.floor(v * 6))];
  const avg1 = (() => {
    const xs = cohort.cohorts.filter((c) => c.retention.length > 2).map((c) => c.retention[1]);
    return xs.reduce((a, b) => a + b, 0) / xs.length;
  })();
  return (
    <Card title="Cohort · การกลับมาซื้อซ้ำ" sub="แถว = เดือนแรกที่ซื้อ · คอลัมน์ = เดือนที่เท่าไรหลังจากนั้น · ช่องลายขีด = เดือนล่าสุดที่ข้อมูลยังไม่ครบ">
      <div className="overflow-x-auto">
        <div className="inline-grid gap-[2px] text-xs tabular-nums" style={{ gridTemplateColumns: `72px 44px repeat(${MAXK + 1}, 40px)` }}>
          <div className="font-medium text-stone-500">เดือนแรก</div><div className="text-right font-medium text-stone-500">คน</div>
          {Array.from({ length: MAXK + 1 }, (_, k) => <div key={k} className="text-center font-medium text-stone-500">{k}</div>)}
          {cohort.cohorts.map((c) => (
            <Row key={c.cohort} c={c} MAXK={MAXK} shade={shade} partial={cohort.lastMonthPartial} />
          ))}
        </div>
      </div>
      <Insight>
        โดยเฉลี่ยลูกค้าใหม่กลับมาซื้อในเดือนถัดไป {pct(avg1)} · ช่องแนวทแยงล่างขวาดูต่ำผิดปกติเพราะ{thaiMonth(cohort.lastMonth)}มีข้อมูล{" "}
        {cohort.daysInLastMonth} จาก {cohort.daysInMonth} วัน (กับดักเดียวกับกราฟ 4 ใน Lab 2.2)
      </Insight>
    </Card>
  );
}
function Row({ c, MAXK, shade, partial }) {
  const last = c.retention.length - 1;
  return (
    <>
      <div className="py-1">{thaiMonth(c.cohort)}</div>
      <div className="py-1 text-right text-stone-500">{c.size}</div>
      {Array.from({ length: MAXK + 1 }, (_, k) => {
        const v = c.retention[k];
        if (v === undefined) return <div key={k} />;
        const isPartial = partial && k === last && k > 0;
        return (
          <div key={k} title={`${thaiMonth(c.cohort)} เดือนที่ ${k}: ${pct(v, 1)}${isPartial ? " (เดือนไม่ครบ)" : ""}`}
               className="flex h-7 items-center justify-center rounded-[3px]"
               style={{
                 background: isPartial ? `repeating-linear-gradient(45deg, ${shade(v)}, ${shade(v)} 4px, #fff 4px, #fff 6px)` : shade(v),
                 color: v >= 0.5 ? "#fff" : INK,
               }}>
            {k === 0 ? "" : Math.round(v * 100)}
          </div>
        );
      })}
    </>
  );
}

// ---------------- ABC ----------------
function AbcCard({ abc }) {
  if (abc.error) return <Card title="Pareto · ABC ของเมนู"><Pending lab="Lab 4.2" error={abc.error} /></Card>;
  const items = abc.items;
  const nA = items.filter((i) => i.cls === "A").length;
  const C = items.filter((i) => i.cls === "C");
  const fill = { A: MAIN, B: GREEN[2], C: "#d6d3d1" };
  return (
    <Card title="Pareto · ABC ของเมนู" sub="แท่ง = สัดส่วนยอดขายแต่ละเมนู · เส้น = ยอดสะสม · แกนเดียวกันเป็น %">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={items} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#eee" />
            <XAxis dataKey="rank" tick={{ fontSize: 11 }} interval={4} label={{ value: "อันดับเมนู", position: "insideBottomRight", offset: -2, fontSize: 12 }} />
            <YAxis tickFormatter={(v) => pct(v)} domain={[0, 1]} width={44} tick={{ fontSize: 12 }} />
            <Tooltip labelFormatter={(r) => { const it = items[r - 1]; return `#${r} ${it.name} · กลุ่ม ${it.cls}`; }}
                     formatter={(v, n) => [pct(v, 1), n]} />
            <ReferenceLine y={0.8} stroke={MUTED} strokeDasharray="4 4" label={{ value: "80%", position: "right", fontSize: 11, fill: INK }} />
            <Bar name="สัดส่วนยอดขาย" dataKey="share" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {items.map((i) => <Cell key={i.product_id} fill={fill[i.cls]} />)}
            </Bar>
            <Line name="ยอดสะสม" dataKey="cumShare" stroke={INK} strokeWidth={2} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-4 text-sm text-stone-600">
        {["A", "B", "C"].map((k) => (
          <span key={k}><i className="mr-1.5 inline-block h-3 w-3 rounded-sm align-[-1px]" style={{ background: fill[k] }} />
            กลุ่ม {k} {items.filter((i) => i.cls === k).length} เมนู</span>
        ))}
      </div>
      <Insight>
        {nA} เมนูจาก {items.length} ทำยอด 80% · กลุ่ม C ({C.map((i) => i.name).join(", ")}) รวมกันแค่ {pct(C.reduce((s, i) => s + i.share, 0), 1)} ควรทบทวนก่อนเพิ่มเมนูใหม่
      </Insight>
    </Card>
  );
}

// ---------------- Lab 4.1B · เจาะดูรายชื่อ ----------------
function SegmentList({ rfm, picked, onClose }) {
  const th = SEG_TH[picked].th;
  const members = rfm.customers.filter((c) => c.segment === picked).sort((a, b) => b.M - a.M);
  const download = () => {
    const head = "รหัสลูกค้า,ไม่ได้มา(วัน),จำนวนบิล,ยอดซื้อรวม,R,F,M";
    const lines = members.map((c) => [c.id, c.R, c.F, c.M, c.r, c.f, c.m].join(","));
    // BOM (U+FEFF) ให้ Excel อ่านภาษาไทยในหัวคอลัมน์ได้ถูกต้อง
    const blob = new Blob(["\uFEFF" + [head, ...lines].join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `rfm-${picked.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <Card title={`รายชื่อกลุ่ม${th} · ${members.length.toLocaleString()} คน`} sub="เรียงตามยอดซื้อรวม แสดง 15 คนแรก"
          right={<div className="flex gap-2">
            <button onClick={download} className="rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-stone-700">ดาวน์โหลด CSV</button>
            <button onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm text-stone-600 ring-1 ring-stone-300 hover:bg-stone-50">ปิด</button>
          </div>}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm tabular-nums">
          <thead className="text-left text-stone-500">
            <tr><th className="py-1 font-medium">รหัส</th><th className="text-right font-medium">ไม่ได้มา (วัน)</th><th className="text-right font-medium">บิล</th><th className="text-right font-medium">ยอดซื้อ</th><th className="pl-4 font-medium">R-F-M</th></tr>
          </thead>
          <tbody>
            {members.slice(0, 15).map((c) => (
              <tr key={c.id} className="border-t border-stone-100">
                <td className="py-1.5">{c.id}</td>
                <td className="text-right">{c.R.toLocaleString()}</td>
                <td className="text-right">{c.F}</td>
                <td className="text-right">{fmtBaht(c.M)}</td>
                <td className="pl-4 text-stone-600">{c.r}-{c.f}-{c.m}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-stone-500">⚠️ ไฟล์ CSV มีรหัสลูกค้าและพฤติกรรมการซื้อ เป็นข้อมูลส่วนบุคคลตาม PDPA ใช้เฉพาะงานดูแลลูกค้า ไม่ส่งต่อหรือเก็บเกินจำเป็น</p>
    </Card>
  );
}

// ---------------- เพิ่มเติม · ยอดซื้อรวมเฉลี่ยต่อคน แยกกลุ่ม (ไม่ใช่ส่วนของโจทย์) ----------------
// M = ยอดซื้อรวมตลอดประวัติของลูกค้า 1 คน ไม่ใช่ยอดต่อบิล จึงเฉลี่ยต่อคนในกลุ่มได้ตรง ๆ
function AvgSpendCard({ rfm }) {
  if (rfm.error) return null;
  const data = SEGMENTS.map(({ id, th }) => {
    const mine = rfm.customers.filter((c) => c.segment === id);
    const n = mine.length || 1;
    const spend = mine.reduce((a, c) => a + c.M, 0);
    const bills = mine.reduce((a, c) => a + c.F, 0);
    return { segment: id, label: th, customers: mine.length, avgSpend: spend / n, avgBills: bills / n, avgPerBill: bills ? spend / bills : 0 };
  });
  const best = data.reduce((a, b) => (b.avgSpend > a.avgSpend ? b : a));
  const all = rfm.customers;
  const overall = all.reduce((a, c) => a + c.M, 0) / (all.length || 1);
  return (
    <Card title="ยอดซื้อรวมเฉลี่ยต่อคน แยกกลุ่ม" sub="ลูกค้า 1 คนซื้อกับร้านรวมทั้งหมดกี่บาทตลอดประวัติ (ไม่ใช่ยอดต่อบิล) · ค่าเฉลี่ยทุกกลุ่ม">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 56 }}>
            <CartesianGrid horizontal={false} stroke="#eee" />
            <XAxis type="number" tickFormatter={(v) => fmtBaht(v)} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="label" width={96} tick={{ fontSize: 13 }} />
            <Tooltip cursor={{ fill: "#f5f5f4" }}
                     formatter={(v) => [fmtBaht(v), "ยอดซื้อรวมเฉลี่ยต่อคน"]}
                     labelFormatter={(l, p) => { const d = p?.[0]?.payload; return d ? `${l} · ${d.customers.toLocaleString()} คน · มาซื้อเฉลี่ย ${d.avgBills.toFixed(1)} บิล` : l; }} />
            <ReferenceLine x={overall} stroke={MUTED} strokeDasharray="4 4" label={{ value: "เฉลี่ยทุกคน", position: "top", fontSize: 11, fill: INK }} />
            <Bar dataKey="avgSpend" fill={MAIN} radius={[0, 4, 4, 0]} isAnimationActive={false}>
              <LabelList dataKey="avgSpend" position="right" formatter={(v) => fmtBaht(v)} style={{ fontSize: 12, fill: INK }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm tabular-nums">
          <thead className="text-left text-stone-500"><tr><th className="py-1 font-medium">กลุ่ม</th><th className="text-right font-medium">ลูกค้า (คน)</th><th className="text-right font-medium">มาซื้อเฉลี่ย (บิล)</th><th className="text-right font-medium">ยอดซื้อรวมต่อคน</th><th className="text-right font-medium">ยอดเฉลี่ยต่อบิล</th></tr></thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.segment} className="border-t border-stone-100">
                <td className="py-1.5">{d.label}</td>
                <td className="text-right">{d.customers.toLocaleString()}</td>
                <td className="text-right">{d.avgBills.toFixed(1)}</td>
                <td className="text-right">{fmtBaht(d.avgSpend)}</td>
                <td className="text-right">{fmtBaht(d.avgPerBill)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Insight>
        {best.label} ซื้อรวมเฉลี่ย {fmtBaht(best.avgSpend)} ต่อคน สูงกว่าค่าเฉลี่ยทุกคน ({fmtBaht(overall)}) {(best.avgSpend / overall).toFixed(1)} เท่า ·
        ยอดต่อบิลของทุกกลุ่มใกล้กัน ({fmtBaht(Math.min(...data.map((d) => d.avgPerBill)))}–{fmtBaht(Math.max(...data.map((d) => d.avgPerBill)))}) ความต่างอยู่ที่ "มาซื้อกี่ครั้ง" ·
        กลุ่ม "เสี่ยงหาย" ซื้อรวมสูงเช่นกัน แต่ไม่ได้มานานแล้ว จึงเป็นกลุ่มที่ควรดึงกลับก่อน
      </Insight>
    </Card>
  );
}

// ---------------- เพิ่มเติม · เมนูไหนควรทำอะไร (ขายดี × กำไรต่อชิ้น) ----------------
// ความนิยมใช้ยอดขายจาก analytics/abc · กำไรต่อชิ้น = ราคา − ต้นทุน จากเอกสาร products (อ่านครั้งเดียว ~40 เอกสาร)
const median = (xs) => { const a = [...xs].sort((x, y) => x - y); const n = a.length; return n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2; };
const QUADS = {
  star: { th: "รักษาไว้", sub: "ขายดี · กำไรสูง", color: "#2F7D5B" },
  promote: { th: "ควรโปรโมต", sub: "ขายน้อย · กำไรสูง", color: "#d97706" },
  reprice: { th: "ทบทวนราคา/ต้นทุน", sub: "ขายดี · กำไรต่ำ", color: "#2563eb" },
  review: { th: "ทบทวนว่าจะเก็บไหม", sub: "ขายน้อย · กำไรต่ำ", color: "#a8a29e" },
};
function MenuActionCard({ abc, source }) {
  const [products, setProducts] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => { source.loadProducts().then(setProducts).catch((e) => setErr(e.message)); }, [source]);
  if (abc.error) return null;
  if (err) return <Card title="เมนูไหนควรทำอะไร"><Pending lab="ข้อมูลต้นทุน" error={err} /></Card>;
  if (!products) return <Card title="เมนูไหนควรทำอะไร"><p className="text-stone-500">กำลังโหลดต้นทุนเมนู…</p></Card>;
  const cost = Object.fromEntries(products.map((p) => [p.product_id, p]));
  const items = abc.items.filter((i) => cost[i.product_id]).map((i) => {
    const p = cost[i.product_id];
    return { ...i, profit: p.price - p.cost, margin: (p.price - p.cost) / p.price };
  });
  const shareCut = median(items.map((i) => i.share));
  const profitCut = median(items.map((i) => i.profit));
  const data = items.map((i) => ({
    ...i,
    x: i.share * 100,
    quad: i.share >= shareCut ? (i.profit >= profitCut ? "star" : "reprice") : (i.profit >= profitCut ? "promote" : "review"),
  }));
  return (
    <Card title="เมนูไหนควรทำอะไร" sub={`แกนนอน = สัดส่วนยอดขาย · แกนตั้ง = กำไรต่อชิ้น (ราคา − ต้นทุน) · เส้นประ = ค่ากลางของทุกเมนู (ยอดขาย ${pct(shareCut, 1)}, กำไร ${fmtBaht(profitCut)}/ชิ้น)`}>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 16 }}>
            <CartesianGrid stroke="#eee" />
            <XAxis type="number" dataKey="x" name="สัดส่วนยอดขาย" unit="%" tick={{ fontSize: 12 }} label={{ value: "สัดส่วนยอดขาย (%)", position: "insideBottom", offset: -8, fontSize: 12 }} />
            <YAxis type="number" dataKey="profit" name="กำไรต่อชิ้น" tickFormatter={(v) => fmtBaht(v)} width={56} tick={{ fontSize: 12 }} />
            <ReferenceLine x={shareCut * 100} stroke={MUTED} strokeDasharray="4 4" />
            <ReferenceLine y={profitCut} stroke={MUTED} strokeDasharray="4 4" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }}
                     content={({ active, payload }) => {
                       const d = active && payload?.[0]?.payload;
                       return d ? (
                         <div className="rounded-lg bg-white p-2 text-sm shadow ring-1 ring-stone-200">
                           <div className="font-medium">{d.name}</div>
                           <div>ยอดขาย {pct(d.share, 1)} · กำไร {fmtBaht(d.profit)}/ชิ้น ({pct(d.margin)})</div>
                           <div style={{ color: QUADS[d.quad].color }}>{QUADS[d.quad].th}</div>
                         </div>
                       ) : null;
                     }} />
            <Scatter data={data} isAnimationActive={false}>
              {data.map((d) => <Cell key={d.product_id} fill={QUADS[d.quad].color} />)}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {Object.entries(QUADS).map(([k, q]) => {
          const names = data.filter((d) => d.quad === k).sort((a, b) => b.share - a.share).map((d) => d.name);
          return (
            <div key={k} className="rounded-lg bg-stone-50 p-3 text-sm">
              <div className="font-medium" style={{ color: q.color }}>{q.th} <span className="font-normal text-stone-500">· {q.sub} · {names.length} เมนู</span></div>
              <div className="mt-1 text-stone-700">{names.join(", ") || "–"}</div>
            </div>
          );
        })}
      </div>
      <Insight>
        กราฟนี้ใช้ตัดสินใจได้ตรงกว่ากราฟ Pareto: "ควรโปรโมต" คือเมนูที่ขายแต่ละชิ้นได้กำไรดีแต่ยังขายน้อย ส่วน "ทบทวนราคา/ต้นทุน" คือเมนูที่ลูกค้าชอบแต่แต่ละชิ้นกำไรต่ำ
        (ใช้ค่ากลางของเมนูเป็นเส้นแบ่ง เป็นแนวทางเบื้องต้น ไม่ใช่กฎตายตัว)
      </Insight>
    </Card>
  );
}

export default function CustomersTab({ source }) {
  const state = useAnalytics(source);
  const [picked, setPicked] = useState(null);
  return (
    <AnalyticsShell source={source} state={state} title="ลูกค้าและเมนู">
      {(d) => (
        <div className="space-y-6">
          <RfmCard rfm={d.rfm} picked={picked} onPick={(s) => setPicked((p) => (p === s ? null : s))} />
          {picked && !d.rfm.error && <SegmentList rfm={d.rfm} picked={picked} onClose={() => setPicked(null)} />}
          <CohortCard cohort={d.cohort} />
          <AbcCard abc={d.abc} />
          <AvgSpendCard rfm={d.rfm} />
          <MenuActionCard abc={d.abc} source={source} />
        </div>
      )}
    </AnalyticsShell>
  );
}
