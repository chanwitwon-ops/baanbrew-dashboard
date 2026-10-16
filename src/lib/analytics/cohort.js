// Lab 4.2 · ใช้ Claude Code เขียนฟังก์ชันที่ยังว่าง (Prompt 4.2A ใน PROMPTS_LAB4.md) จนกว่า npm test จะผ่าน · ห้ามแก้ไฟล์ test
// Lab 4.2 · Cohort retention รายเดือน
// cohort = เดือนแรกที่ลูกค้าสมาชิกซื้อ · retention[k] = สัดส่วนลูกค้าใน cohort ที่กลับมาซื้อในเดือนที่ k (k=0 คือเดือนแรก = 100%)

/** จำนวนเดือนจาก a ถึง b เช่น monthIndex("2025-11", "2026-02") = 3 */
export function monthIndex(a, b) {
  const [ya, ma] = a.split("-").map(Number);
  const [yb, mb] = b.split("-").map(Number);
  return (yb - ya) * 12 + (mb - ma);
}

/**
 * @param rows  แถวยอดขาย (ไม่นับ customer_id ว่าง)
 * @param asOf  วันสุดท้ายของข้อมูล YYYY-MM-DD ใช้บอกว่าเดือนสุดท้ายข้อมูลไม่ครบหรือไม่
 * @returns {{ cohorts: {cohort, size, retention: number[]}[], lastMonth, lastMonthPartial, daysInLastMonth }}
 *   retention ยาวเท่าจำนวนเดือนที่สังเกตได้ของ cohort นั้น (ถึง lastMonth)
 */
export function computeCohorts(rows, asOf) {
  const lastMonth = asOf.slice(0, 7);
  const [ly, lm] = lastMonth.split("-").map(Number);
  const daysInLastMonth = Number(asOf.slice(8, 10));
  // จำนวนวันจริงของเดือน ใช้ Date.UTC จึงไม่เพี้ยนเพราะ timezone
  const lastMonthPartial = daysInLastMonth < new Date(Date.UTC(ly, lm, 0)).getUTCDate();

  // เดือนที่แต่ละคนซื้อ (Set ทำให้ซื้อหลายบิลในเดือนเดียวนับครั้งเดียว)
  const months = new Map();
  for (const row of rows) {
    if (!row.customer_id) continue;
    if (!months.has(row.customer_id)) months.set(row.customer_id, new Set());
    months.get(row.customer_id).add(row.date.slice(0, 7));
  }
  const groups = new Map(); // cohort → รายการ Set เดือนของสมาชิก
  for (const set of months.values()) {
    const first = [...set].sort()[0];
    if (!groups.has(first)) groups.set(first, []);
    groups.get(first).push(set);
  }
  const cohorts = [...groups.keys()].sort().map((cohort) => {
    const members = groups.get(cohort);
    const span = monthIndex(cohort, lastMonth) + 1;
    const retention = Array.from({ length: span }, (_, k) => {
      const [y, m] = cohort.split("-").map(Number);
      const t = y * 12 + (m - 1) + k;
      const key = `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, "0")}`;
      return members.filter((s) => s.has(key)).length / members.length;
    });
    return { cohort, size: members.length, retention };
  });
  return { cohorts, lastMonth, lastMonthPartial, daysInLastMonth };
}
