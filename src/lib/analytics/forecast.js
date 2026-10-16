// Lab 4.4 · ใช้ Claude Code เขียนฟังก์ชันที่ยังว่าง (Prompt 4.4A ใน PROMPTS_LAB4.md) จนกว่า npm test จะผ่าน · ห้ามแก้ไฟล์ test
// Lab 4.4 · พยากรณ์ยอดขายแบบอธิบายได้ และวัดความแม่นด้วยการย้อนทดสอบ (backtest)
import { addDays } from "../../lab3/time.js";

const dow = (ymd) => new Date(ymd + "T00:00:00Z").getUTCDay(); // 0 = อาทิตย์

/** ค่าเฉลี่ยยอดขายวันเดียวกันของสัปดาห์ K ครั้งล่าสุด (ฤดูกาลรายสัปดาห์) */
export function seasonalForecast(series, horizon, K = 8) {
  const last = series[series.length - 1].date;
  return Array.from({ length: horizon }, (_, i) => {
    const date = addDays(last, i + 1);
    // วันเดียวกันของสัปดาห์ K ครั้งล่าสุดในข้อมูล (ถ้ามีไม่ถึง K ใช้เท่าที่มี)
    const same = series.filter((s) => dow(s.date) === dow(date)).slice(-K);
    const forecast = same.length ? same.reduce((a, s) => a + s.revenue, 0) / same.length : 0;
    return { date, forecast };
  });
}

/** ค่าเฉลี่ย K วันล่าสุด เส้นตรง (ตัวเปรียบเทียบที่ไม่สนวันในสัปดาห์) */
export function flatForecast(series, horizon, K = 28) {
  const recent = series.slice(-K);
  const avg = recent.reduce((a, s) => a + s.revenue, 0) / recent.length;
  const last = series[series.length - 1].date;
  return Array.from({ length: horizon }, (_, i) => ({ date: addDays(last, i + 1), forecast: avg }));
}

/** Mean Absolute Percentage Error (%) · ข้ามวันที่ยอดจริงเป็น 0 เพราะหารไม่ได้ */
export function mape(actual, forecast) {
  const errs = [];
  actual.forEach((a, i) => { if (a !== 0) errs.push(Math.abs((a - forecast[i]) / a)); });
  return errs.length ? (100 * errs.reduce((x, y) => x + y, 0)) / errs.length : 0;
}

/**
 * ย้อนทดสอบ: ซ่อน horizon วันสุดท้าย พยากรณ์จากข้อมูลก่อนหน้า แล้วเทียบกับของจริง
 * band = ±1.28 × ส่วนเบี่ยงเบนมาตรฐานของ % ความคลาดเคลื่อน (ช่วงประมาณ 80%)
 */
export function backtest(series, horizon = 28, K = 8) {
  const train = series.slice(0, -horizon);
  const test = series.slice(-horizon);
  const seasonal = seasonalForecast(train, horizon, K);
  const flat = flatForecast(train, horizon);
  const actual = test.map((t) => t.revenue);
  // % ความคลาดเคลื่อนแบบมีเครื่องหมาย (จริง − คาด) / คาด ใช้หาความกว้างของแถบ
  const errs = actual.map((a, i) => (seasonal[i].forecast ? (a - seasonal[i].forecast) / seasonal[i].forecast : 0));
  const mean = errs.reduce((x, y) => x + y, 0) / errs.length;
  const sd = Math.sqrt(errs.reduce((x, e) => x + (e - mean) ** 2, 0) / errs.length);
  return {
    mapeSeasonal: mape(actual, seasonal.map((f) => f.forecast)),
    mapeFlat: mape(actual, flat.map((f) => f.forecast)),
    band: 1.28 * sd,
    test: test.map((t, i) => ({ date: t.date, actual: t.revenue, seasonal: seasonal[i].forecast, flat: flat[i].forecast })),
  };
}
