// Lab 3.2C · ฟอร์มบันทึกยอดขาย (uid มาจากผู้ใช้ที่ล็อกอิน · Lab 3.3A)
import { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase.js';
import { BRANCHES, PAYMENTS, MAX_QTY, validateSaleForm, buildSale } from './saleModel.js';
import { CARD, currency, SECTION_TITLE } from '../components/shared';

const EMPTY = { branch: '', product_id: '', qty: '1', payment_method: '', customer_id: '' };
const FIELD =
  'mt-1 w-full rounded-md border border-matcha-200 bg-white px-2 py-1.5 text-sm text-matcha-900 focus:border-matcha-500 focus:outline-none dark:border-ink-800 dark:bg-ink-900 dark:text-matcha-50';
const LABEL = 'block text-xs font-medium text-matcha-600 dark:text-matcha-400';

export default function SaleForm({ products, uid }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const product = products.find((p) => p.product_id === form.product_id);
  const qty = Number(form.qty);
  const total = product && Number.isInteger(qty) && qty > 0 ? product.price * qty : null;

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    const errs = validateSaleForm(form, products);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const sale = buildSale(form, product, { uid });
    setSaving(true);
    try {
      await setDoc(doc(db, 'sales', sale.id), { ...sale.data, created_at: serverTimestamp() });
      setMsg({ ok: true, text: `บันทึกแล้ว ${sale.data.order_id} · ฿${currency.format(sale.data.revenue)}` });
      setForm((f) => ({ ...EMPTY, branch: f.branch, payment_method: f.payment_method }));
    } catch (err) {
      setMsg({
        ok: false,
        text: err.code === 'permission-denied' ? 'ถูกปฏิเสธโดย Security Rules' : `บันทึกไม่สำเร็จ: ${err.message}`,
      });
    } finally {
      setSaving(false);
    }
  }

  const errMsg = (k) => (errors[k] ? <p className="mt-1 text-xs text-red-700">{errors[k]}</p> : null);

  return (
    <form onSubmit={submit} className={`space-y-3 ${CARD}`}>
      <h2 className={SECTION_TITLE}>บันทึกยอดขาย</h2>
      <label className={LABEL}>
        สาขา
        <select className={FIELD} value={form.branch} onChange={set('branch')}>
          <option value="">เลือกสาขา</option>
          {BRANCHES.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
        {errMsg('branch')}
      </label>
      <label className={LABEL}>
        เมนู
        <select className={FIELD} value={form.product_id} onChange={set('product_id')}>
          <option value="">เลือกเมนู</option>
          {products.map((p) => (
            <option key={p.product_id} value={p.product_id}>
              {p.product_name} · ฿{p.price}
            </option>
          ))}
        </select>
        {errMsg('product_id')}
      </label>
      <label className={LABEL}>
        จำนวน (1–{MAX_QTY})
        <input className={FIELD} inputMode="numeric" value={form.qty} onChange={set('qty')} />
        {errMsg('qty')}
      </label>
      <label className={LABEL}>
        วิธีชำระเงิน
        <select className={FIELD} value={form.payment_method} onChange={set('payment_method')}>
          <option value="">เลือกวิธีชำระเงิน</option>
          {PAYMENTS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        {errMsg('payment_method')}
      </label>
      <label className={LABEL}>
        รหัสสมาชิก (ไม่บังคับ)
        <input className={FIELD} placeholder="C01234" value={form.customer_id} onChange={set('customer_id')} />
        {errMsg('customer_id')}
      </label>
      <div className="flex items-center justify-between border-t border-matcha-100 pt-3 dark:border-ink-800">
        <span className="text-sm text-matcha-600 dark:text-matcha-300">ยอดรวม</span>
        <span className="text-xl font-semibold text-matcha-900 dark:text-matcha-50">
          {total == null ? '–' : `฿${currency.format(total)}`}
        </span>
      </div>
      <button
        disabled={saving}
        className="w-full rounded-md bg-matcha-700 py-2 text-sm font-medium text-white hover:bg-matcha-800 disabled:opacity-60"
      >
        {saving ? 'กำลังบันทึก…' : 'บันทึกยอดขาย'}
      </button>
      {msg && <p className={`text-sm ${msg.ok ? 'text-matcha-700 dark:text-matcha-300' : 'text-red-700'}`}>{msg.text}</p>}
    </form>
  );
}
