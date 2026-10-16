// ยอดขายต่อเมนูแยกสาขา (ข้อมูลเสริมนอกโจทย์ Lab 4 ใช้ทำการ์ด "เมนูไหนทำเงินให้ร้านเท่าไร" รายสาขา)
// rows = ผลจาก prepareRows() (มี branch, product_id, qty, revenue)

/** @returns {{ branch, product_id, qty, revenue }[]} เรียงตามสาขา แล้วตามรหัสเมนู */
export function menuByBranch(rows) {
  const map = new Map();
  for (const r of rows) {
    const k = `${r.branch}|${r.product_id}`;
    const c = map.get(k) ?? { branch: r.branch, product_id: r.product_id, qty: 0, revenue: 0 };
    c.qty += r.qty;
    c.revenue += r.revenue;
    map.set(k, c);
  }
  return [...map.values()].sort((a, b) => a.branch.localeCompare(b.branch) || a.product_id.localeCompare(b.product_id));
}
