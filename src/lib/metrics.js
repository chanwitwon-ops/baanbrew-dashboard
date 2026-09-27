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
      hour: Number(String(r.datetime).slice(11, 13)),
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

// ยอดขายรวมรายวัน เรียงตามวันที่ พร้อมค่าเฉลี่ยเคลื่อนที่ 7 วัน (ma7)
// ma7 ของแต่ละวัน = ค่าเฉลี่ยยอดขายของวันนั้นย้อนหลังไป 7 วัน (รวมวันนั้นเอง)
// ใช้ทับเส้นรายวันที่แกว่งเยอะ ให้เห็นแนวโน้มชัดขึ้น
export function dailySales(sales) {
  const byDate = new Map();
  for (const r of sales) {
    byDate.set(r.date, (byDate.get(r.date) || 0) + r.revenue);
  }
  const days = [...byDate.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, revenue]) => ({ date, revenue }));

  return days.map((d, i) => {
    const window = days.slice(Math.max(0, i - 6), i + 1);
    const ma7 = window.reduce((sum, w) => sum + w.revenue, 0) / window.length;
    return { ...d, ma7 };
  });
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

// แปลงแถวดิบจาก customers.csv
export function parseCustomerRows(rows) {
  return rows
    .filter((r) => r.customer_id)
    .map((r) => ({ ...r, joinMonth: String(r.joined_date).slice(0, 7) }));
}

// KPI ลูกค้า: จำนวนลูกค้าทั้งหมด, ลูกค้าใหม่ในเดือนล่าสุดที่มีข้อมูล
export function customerKpis(customers) {
  const total = customers.length;
  const latestMonth = customers.reduce((max, c) => (c.joinMonth > max ? c.joinMonth : max), '');
  const newThisMonth = customers.filter((c) => c.joinMonth === latestMonth).length;
  return { total, latestMonth, newThisMonth };
}

const AGE_GROUP_ORDER = ['ต่ำกว่า 18', '18-24', '25-34', '35-44', '45-54', '55+'];

// จำนวนลูกค้าตามช่วงอายุ เรียงจากอายุน้อยไปมาก
export function customersByAgeGroup(customers) {
  const counts = new Map(AGE_GROUP_ORDER.map((a) => [a, 0]));
  for (const c of customers) counts.set(c.age_group, (counts.get(c.age_group) || 0) + 1);
  return AGE_GROUP_ORDER.map((age) => ({ age, count: counts.get(age) || 0 }));
}

// จำนวนลูกค้าตามเพศ เรียงจากมากไปน้อย
export function customersByGender(customers) {
  const byGender = new Map();
  for (const c of customers) byGender.set(c.gender, (byGender.get(c.gender) || 0) + 1);
  return [...byGender.entries()]
    .map(([gender, count]) => ({ gender, count }))
    .sort((a, b) => b.count - a.count);
}

// จำนวนลูกค้าใหม่รายเดือน เรียงตามเดือน
export function newCustomersByMonth(customers) {
  const byMonth = new Map();
  for (const c of customers) byMonth.set(c.joinMonth, (byMonth.get(c.joinMonth) || 0) + 1);
  return [...byMonth.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([month, count]) => ({ month, count }));
}

// (การบ้าน) จำนวนบิลตามชั่วโมงของวัน (0-23) แยกตามสาขาด้วย
// นับ order_id ที่ไม่ซ้ำต่อ 1 ชั่วโมง (บิลเดียวมีได้หลายแถว แต่เวลาเดียวกัน)
export function ordersByHour(sales) {
  const branches = [...new Set(sales.map((r) => r.branch))].sort();
  const table = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    total: 0,
    ...Object.fromEntries(branches.map((b) => [b, 0])),
  }));

  const seenOrders = new Set();
  for (const r of sales) {
    if (seenOrders.has(r.order_id)) continue;
    seenOrders.add(r.order_id);
    table[r.hour].total += 1;
    table[r.hour][r.branch] += 1;
  }

  return { data: table, branches };
}
