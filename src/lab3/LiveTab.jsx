// Lab 3.2B + 3.3A · แท็บยอดขายสดแบบ real-time จาก Firestore (ต้องล็อกอินด้วย Google ก่อน)
// ใช้ฟังก์ชันคำนวณและกราฟเดิมจาก Lab 1 ทั้งหมด (parseSalesRows, computeKpis, dailySales, ...)
import { useEffect, useMemo, useRef, useState } from 'react';
import { collection, getDocs, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import BranchSalesChart from '../components/BranchSalesChart';
import DailySalesChart from '../components/DailySalesChart';
import HourlyOrdersChart from '../components/HourlyOrdersChart';
import KpiCards from '../components/KpiCards';
import { CARD, currency, SECTION_TITLE } from '../components/shared';
import { computeKpis, dailySales, ordersByHour, parseSalesRows, salesByBranch } from '../lib/metrics';
import { auth, db, googleProvider } from './firebase.js';
import { BRANCHES } from './saleModel.js';
import SaleForm from './SaleForm.jsx';
import { addDays, todayBangkok } from './time.js';

const RANGES = [
  { id: 'today', label: 'วันนี้', days: 0 },
  { id: '7d', label: '7 วัน', days: 6 },
  { id: '30d', label: '30 วัน', days: 29 },
];

const AUTH_ERRORS = {
  'auth/unauthorized-domain':
    'โดเมนนี้ยังไม่ได้รับอนุญาต เพิ่มใน Firebase → Authentication → Settings → Authorized domains',
  'auth/operation-not-allowed': 'ยังไม่ได้เปิด Google ใน Firebase → Authentication → Sign-in method',
  'auth/popup-blocked': 'เบราว์เซอร์บล็อกหน้าต่างล็อกอิน กรุณาอนุญาต popup แล้วลองใหม่',
  'auth/popup-closed-by-user': 'ปิดหน้าต่างล็อกอินก่อนเสร็จ ลองใหม่อีกครั้ง',
};

const FIELD =
  'rounded-md border border-matcha-200 bg-white px-2 py-1.5 text-sm text-matcha-900 focus:border-matcha-500 focus:outline-none dark:border-ink-800 dark:bg-ink-900 dark:text-matcha-50';

function explain(e) {
  if (e.code === 'permission-denied') return 'Security Rules ไม่อนุญาตให้อ่านข้อมูล (ตรวจว่าล็อกอินแล้วและ deploy rules ถูกต้อง)';
  if (e.code === 'resource-exhausted') return 'โควตาฟรีของ Firestore วันนี้หมดแล้ว ลองใหม่พรุ่งนี้หรือเลือกช่วงวันที่สั้นลง';
  if (e.code === 'failed-precondition') return 'Firestore ต้องการ index เพิ่ม ดูลิงก์ใน console ของเบราว์เซอร์';
  return e.message;
}

function LoginCard() {
  const [err, setErr] = useState(null);
  const login = () =>
    signInWithPopup(auth, googleProvider).catch((e) =>
      setErr(AUTH_ERRORS[e.code] ?? `ล็อกอินไม่สำเร็จ: ${e.message}`)
    );
  return (
    <div className={`mt-6 max-w-md ${CARD}`}>
      <h2 className={SECTION_TITLE}>ยอดขายสด</h2>
      <p className="text-sm text-matcha-600 dark:text-matcha-300">เข้าสู่ระบบก่อนจึงจะดูแดชบอร์ดและบันทึกยอดขายได้</p>
      <button
        onClick={login}
        className="mt-4 rounded-md bg-matcha-700 px-4 py-2 text-sm font-medium text-white hover:bg-matcha-800"
      >
        เข้าสู่ระบบด้วย Google
      </button>
      {err && <p className="mt-3 text-sm text-red-700">{err}</p>}
    </div>
  );
}

export default function LiveTab() {
  const [user, setUser] = useState(undefined); // undefined = กำลังตรวจสอบ
  useEffect(() => onAuthStateChanged(auth, setUser), []);

  if (user === undefined) return <p className="mt-6 text-matcha-500">กำลังตรวจสอบการเข้าสู่ระบบ…</p>;
  if (!user) return <LoginCard />;
  return <Dashboard user={user} />;
}

function Dashboard({ user }) {
  const [range, setRange] = useState('7d');
  const [branch, setBranch] = useState('all');
  const [docs, setDocs] = useState(null);
  const [error, setError] = useState(null);
  const [reads, setReads] = useState(0);
  const [fresh, setFresh] = useState(() => new Set());
  const [products, setProducts] = useState([]);
  const first = useRef(true);

  useEffect(() => {
    getDocs(collection(db, 'products'))
      .then((s) => setProducts(s.docs.map((d) => d.data()).sort((a, b) => a.product_id.localeCompare(b.product_id))))
      .catch((e) => setError(explain(e)));
  }, []);

  useEffect(() => {
    const today = todayBangkok();
    const start = addDays(today, -RANGES.find((r) => r.id === range).days);
    first.current = true;
    setDocs(null);
    setError(null);
    const q = query(collection(db, 'sales'), where('date', '>=', start), where('date', '<=', today), orderBy('date'));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setReads((n) => n + snap.docChanges().length);
        if (!first.current) {
          const added = snap.docChanges().filter((c) => c.type === 'added').map((c) => c.doc.id);
          if (added.length) {
            setFresh((s) => new Set([...s, ...added]));
            setTimeout(
              () =>
                setFresh((s) => {
                  const n = new Set(s);
                  added.forEach((i) => n.delete(i));
                  return n;
                }),
              4000
            );
          }
        }
        first.current = false;
        setDocs(snap.docs.map((d) => ({ _id: d.id, ...d.data() })));
      },
      (e) => setError(explain(e))
    );
    return unsubscribe; // ยกเลิกการฟังเมื่อเปลี่ยนช่วงเวลาหรือออกจากแท็บ
  }, [range]);

  const view = useMemo(() => {
    if (!docs) return null;
    const rows = parseSalesRows(docs).map((r, i) => ({ ...r, _id: docs[i]._id }));
    const filtered = branch === 'all' ? rows : rows.filter((r) => r.branch === branch);
    return {
      kpis: computeKpis(filtered),
      daily: dailySales(filtered),
      byBranch: salesByBranch(filtered),
      hourly: ordersByHour(filtered),
      latest: [...filtered].sort((a, b) => b.datetime.localeCompare(a.datetime)).slice(0, 8),
    };
  }, [docs, branch]);

  const productName = (id) => products.find((p) => p.product_id === id)?.product_name ?? id;

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
      <section className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-matcha-100 p-1 dark:bg-ink-900">
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRange(r.id)}
                className={
                  range === r.id
                    ? 'rounded-md bg-white px-3 py-1 text-sm font-medium text-matcha-800 shadow-sm dark:bg-ink-800 dark:text-matcha-100'
                    : 'rounded-md px-3 py-1 text-sm font-medium text-matcha-600 hover:text-matcha-800 dark:text-matcha-400'
                }
              >
                {r.label}
              </button>
            ))}
          </div>
          <select value={branch} onChange={(e) => setBranch(e.target.value)} className={FIELD}>
            <option value="all">ทุกสาขา</option>
            {BRANCHES.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <span className="text-xs text-matcha-500">อ่านเอกสารไปแล้ว {currency.format(reads)}</span>
          <div className="ml-auto flex items-center gap-2 text-sm text-matcha-700 dark:text-matcha-200">
            {user.photoURL && (
              <img src={user.photoURL} alt="" className="h-7 w-7 rounded-full" referrerPolicy="no-referrer" />
            )}
            <span>{user.displayName ?? user.email}</span>
            <button
              onClick={() => signOut(auth)}
              className="rounded-md border border-matcha-300 px-2 py-1 text-xs hover:bg-matcha-100 dark:border-matcha-600 dark:hover:bg-ink-800"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>

        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {!error && !view && <p className="mt-4 text-matcha-500">กำลังโหลดข้อมูล…</p>}
        {view && (
          <>
            <KpiCards kpis={view.kpis} />
            {range === 'today' ? (
              <HourlyOrdersChart hourly={view.hourly.data} branches={view.hourly.branches} />
            ) : (
              <DailySalesChart daily={view.daily} />
            )}
            <BranchSalesChart byBranch={view.byBranch} />

            <section className="mt-8">
              <h2 className={SECTION_TITLE}>รายการล่าสุด</h2>
              <div className={`overflow-x-auto ${CARD}`}>
                <table className="w-full text-sm text-matcha-900 dark:text-matcha-50">
                  <thead className="text-left text-xs text-matcha-600 dark:text-matcha-400">
                    <tr>
                      <th className="pb-2">เวลา</th>
                      <th className="pb-2">สาขา</th>
                      <th className="pb-2">เมนู</th>
                      <th className="pb-2 text-right">ยอด</th>
                      <th className="pb-2 text-right">ที่มา</th>
                    </tr>
                  </thead>
                  <tbody>
                    {view.latest.map((r) => (
                      <tr
                        key={r._id}
                        className={`border-t border-matcha-100 transition-colors dark:border-ink-800 ${
                          fresh.has(r._id) ? 'bg-matcha-100 dark:bg-matcha-900' : ''
                        }`}
                      >
                        <td className="py-1.5">{r.datetime.slice(5, 16).replace('T', ' ')}</td>
                        <td>{r.branch}</td>
                        <td>
                          {productName(r.product_id)} × {r.qty}
                        </td>
                        <td className="text-right">฿{currency.format(r.revenue)}</td>
                        <td className="text-right text-matcha-500">{r.source}</td>
                      </tr>
                    ))}
                    {!view.latest.length && (
                      <tr>
                        <td colSpan={5} className="py-3 text-matcha-500">
                          ไม่มียอดขายในช่วงนี้ (ข้อมูลที่นำเข้าจบที่เมื่อวาน ลองเลือก 7 หรือ 30 วัน)
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </section>

      <aside>
        {products.length > 0 ? (
          <SaleForm products={products} uid={user.uid} />
        ) : (
          <p className="text-sm text-matcha-500">กำลังโหลดเมนู…</p>
        )}
      </aside>
    </div>
  );
}
