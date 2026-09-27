// แปลงแถวดิบจาก CSV (ตัวเลขที่ PapaParse ยังอ่านเป็น string) ให้พร้อมคำนวณ
export function parseSalesRows(rows) {
  return rows
    .filter((r) => r.order_id)
    .map((r) => ({
      ...r,
      qty: Number(r.qty),
      unit_price: Number(r.unit_price),
      revenue: Number(r.qty) * Number(r.unit_price),
      // datetime เป็นเวลาไทยอยู่แล้ว (+07:00) เอา 10 ตัวแรกพอ ไม่ต้องแปลงเป็น UTC
      // (ถ้าใช้ new Date(...).toISOString() วันที่จะเลื่อนไป 1 วันได้)
      date: String(r.datetime).slice(0, 10),
    }));
}

// KPI: ยอดขายรวม, จำนวนบิล (นับ order_id ที่ไม่ซ้ำ ไม่ใช่นับแถว),
// ยอดเฉลี่ยต่อบิล, จำนวนลูกค้าสมาชิกที่ไม่ซ้ำ (customer_id ว่าง = ลูกค้าทั่วไป ไม่นับ)
export function computeKpis(sales) {
  const totalRevenue = sales.reduce((sum, r) => sum + r.revenue, 0);
  const orderIds = new Set(sales.map((r) => r.order_id));
  const orderCount = orderIds.size;
  const avgPerOrder = orderCount > 0 ? totalRevenue / orderCount : 0;
  const memberIds = new Set(
    sales.map((r) => r.customer_id).filter((id) => id && String(id).trim() !== '')
  );

  return {
    totalRevenue,
    orderCount,
    avgPerOrder,
    memberCount: memberIds.size,
  };
}

// ยอดขายรวมรายวัน เรียงตามวันที่
export function dailySales(sales) {
  const byDate = new Map();
  for (const r of sales) {
    byDate.set(r.date, (byDate.get(r.date) || 0) + r.revenue);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, revenue]) => ({ date, revenue }));
}

// ยอดขายแยกสาขา เรียงจากมากไปน้อย
export function salesByBranch(sales) {
  const byBranch = new Map();
  for (const r of sales) {
    byBranch.set(r.branch, (byBranch.get(r.branch) || 0) + r.revenue);
  }
  return [...byBranch.entries()]
    .map(([branch, revenue]) => ({ branch, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}
