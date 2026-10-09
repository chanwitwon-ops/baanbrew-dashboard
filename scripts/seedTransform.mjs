// Lab 3.1 · แปลงแถวจาก sales.csv (ผลลัพธ์ Lab 2.1) เป็นเอกสาร Firestore
// scripts/seed.mjs เรียกใช้ฟังก์ชันเหล่านี้
import { addDays, daysBetween } from "../src/lab3/time.js";

export const BRANCHES = ["สยาม", "สีลม", "อารีย์", "บางนา", "มหาวิทยาลัย"];

const dateOf = (row) => row.datetime.slice(0, 10);

/**
 * เลือกเฉพาะ N วันล่าสุดของข้อมูล นับจากวันล่าสุดในไฟล์ (ไม่ใช่วันนี้) รวมวันสุดท้ายด้วย
 * @returns {{ rows: object[], start: string, end: string }}  start/end เป็น YYYY-MM-DD
 */
export function selectLastDays(rows, days) {
  const end = rows.reduce((m, r) => (dateOf(r) > m ? dateOf(r) : m), "");
  const start = addDays(end, -(days - 1));
  return { rows: rows.filter((r) => dateOf(r) >= start), start, end };
}

/** จำนวนวันที่ต้องเลื่อน ให้วันล่าสุดของข้อมูลกลายเป็น "เมื่อวาน" ของ today · ห้ามติดลบ */
export function computeShift(lastDataDate, today) {
  return Math.max(0, daysBetween(lastDataDate, today) - 1);
}

/** เลื่อนวันที่ใน datetime ("2026-09-20T16:05:09+07:00") ไป days วัน โดยคงเวลาและ +07:00 */
export function shiftDateTime(iso, days) {
  return addDays(iso.slice(0, 10), days) + iso.slice(10);
}

/**
 * แปลง 1 แถว CSV (ทุกค่าเป็นข้อความ) เป็น { id, data }
 * id = order_id + "-" + product_id (1 บิลมีหลายรายการ จึงต้องใช้ทั้งคู่ และทำให้รันซ้ำแล้วเขียนทับ ไม่ซ้ำ)
 * ต้อง throw Error ถ้าข้อมูลยังไม่สะอาด
 */
export function toSaleDoc(row, shiftDays = 0) {
  const qty = Number(row.qty);
  const unitPrice = Number(row.unit_price);
  if (!/^\d+$/.test(row.qty ?? "") || qty < 1) throw new Error(`${row.order_id}: qty ไม่ใช่จำนวนเต็มบวก ("${row.qty}")`);
  if (!/^\d+(\.\d+)?$/.test(row.unit_price ?? "") || !(unitPrice > 0)) throw new Error(`${row.order_id}: ราคาไม่ใช่ตัวเลขบวก ("${row.unit_price}")`);
  if (!BRANCHES.includes(row.branch)) throw new Error(`${row.order_id}: สาขาไม่รู้จัก ("${row.branch}")`);
  if (!/^20\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\+07:00$/.test(row.datetime ?? "")) throw new Error(`${row.order_id}: datetime รูปแบบผิด ("${row.datetime}")`);

  const datetime = shiftDateTime(row.datetime, shiftDays);
  return {
    id: `${row.order_id}-${row.product_id}`,
    data: {
      order_id: row.order_id,
      datetime,
      date: datetime.slice(0, 10),
      hour: Number(datetime.slice(11, 13)),
      branch: row.branch,
      product_id: row.product_id,
      qty,
      unit_price: unitPrice,
      revenue: qty * unitPrice,
      // ว่าง = ลูกค้า walk-in ใช้ null เพื่อให้ query/rules แยก "ไม่มีค่า" ออกจากสตริงว่างได้ชัดเจน
      customer_id: row.customer_id ? row.customer_id : null,
      payment_method: row.payment_method,
      channel: row.channel,
      source: "import",
    },
  };
}

/** สรุป: { docs, bills (นับ order_id ไม่ซ้ำ), revenue, byBranch: {สาขา: ยอด}, start, end } */
export function summarize(docs) {
  const bills = new Set();
  const byBranch = {};
  let revenue = 0, start = "", end = "";
  for (const { data: d } of docs) {
    bills.add(d.order_id);
    revenue += d.revenue;
    byBranch[d.branch] = (byBranch[d.branch] ?? 0) + d.revenue;
    if (!start || d.date < start) start = d.date;
    if (d.date > end) end = d.date;
  }
  return { docs: docs.length, bills: bills.size, revenue, byBranch, start, end };
}
