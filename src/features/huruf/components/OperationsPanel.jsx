import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { isqat, ISQAT_PRESETS } from '../lib/isqat';
import { numberToLetters, lettersToNumber, speakWord } from '../lib/istintaq';
import { qalb, qalbPermutations, mazj, taksir, bast } from '../lib/operations';
import { useHurufSettings } from './SettingsContext';

const TABS = [
  { id: 'isqat', label: 'إسقاط' },
  { id: 'istintaq', label: 'استنطاق' },
  { id: 'qalb', label: 'قلب' },
  { id: 'mazj', label: 'مزج' },
  { id: 'taksir', label: 'تكسير' },
  { id: 'bast', label: 'بسط' },
];

function Trace({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2 rounded-lg border border-[#D9CBA6] bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-[#6B4F2A]"
      >
        <span>{title || 'كيف حُسِب؟'}</span>
        <ChevronDown size={14} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>
      {open && <div className="border-t border-[#EFE6CC] p-3 text-xs">{children}</div>}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-[#2B2118]">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  'w-full rounded-lg border border-[#D9CBA6] bg-white px-3 py-2 text-lg focus:outline focus:outline-2 focus:outline-[#2B2118]';

function IsqatTab() {
  const [n, setN] = useState('786');
  const [modulus, setModulus] = useState(9);
  const num = Number(n) || 0;
  const result = isqat(num, modulus);

  return (
    <div className="space-y-3" dir="rtl">
      <Field label="العدد">
        <input className={inputCls} value={n} onChange={(e) => setN(e.target.value)} inputMode="numeric" />
      </Field>
      <Field label="القياس (المعامل)">
        <div className="flex flex-wrap gap-2">
          {Object.values(ISQAT_PRESETS).map((p) => (
            <button
              key={p.modulus}
              onClick={() => setModulus(p.modulus)}
              className={`rounded-full border px-3 py-1 text-xs ${
                modulus === p.modulus ? 'border-[#2B2118] bg-[#2B2118] text-white' : 'border-[#D9CBA6]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </Field>
      <div className="rounded-lg bg-[#F5EEDD] p-3 text-center text-2xl font-bold">{result}</div>
      <Trace>
        <p dir="ltr" className="text-left font-mono">
          isqat({num}, {modulus}) = ((({num} − 1) mod {modulus}) + {modulus}) mod {modulus} + 1 = {result}
        </p>
        <p className="mt-1 text-[#6B5B45]">
          قاعدة «خذه صحيحًا مكمَّلا»: لو كان الباقي صفرًا تُعاد القيمة الكاملة {modulus}، لا صفر.
        </p>
      </Trace>
    </div>
  );
}

function IstintaqTab() {
  const [mode, setMode] = useState('numberToLetters');
  const [numberInput, setNumberInput] = useState('1394');
  const [textInput, setTextInput] = useState('غشصد');
  const { computeOptions } = useHurufSettings();

  const n = Number(numberInput) || 0;
  const decomposition = mode === 'numberToLetters' && n > 0 ? numberToLetters(n) : null;
  const speak = mode === 'numberToLetters' && n > 0 ? speakWord(n) : null;
  const fromLetters = mode === 'lettersToNumber' ? lettersToNumber(textInput, computeOptions) : null;

  return (
    <div className="space-y-3" dir="rtl">
      <div className="flex gap-2">
        <button
          onClick={() => setMode('numberToLetters')}
          className={`rounded-full border px-3 py-1 text-xs ${mode === 'numberToLetters' ? 'border-[#2B2118] bg-[#2B2118] text-white' : 'border-[#D9CBA6]'}`}
        >
          عدد ← حروف
        </button>
        <button
          onClick={() => setMode('lettersToNumber')}
          className={`rounded-full border px-3 py-1 text-xs ${mode === 'lettersToNumber' ? 'border-[#2B2118] bg-[#2B2118] text-white' : 'border-[#D9CBA6]'}`}
        >
          حروف ← عدد
        </button>
      </div>

      {mode === 'numberToLetters' ? (
        <>
          <Field label="العدد (مثال المنظومة: ١٣٩٤)">
            <input className={inputCls} value={numberInput} onChange={(e) => setNumberInput(e.target.value)} inputMode="numeric" />
          </Field>
          {decomposition && (
            <div className="rounded-lg bg-[#F5EEDD] p-3 text-center text-3xl" style={{ fontFamily: '"Amiri","Scheherazade New",serif' }}>
              {decomposition.text}
            </div>
          )}
          {decomposition && (
            <Trace>
              <ul className="space-y-0.5">
                {decomposition.letters.map((l, i) => (
                  <li key={i}>
                    {l.char} ({l.name}) = {l.kabir}
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-[#6B5B45]">
                تفكيك حسب المنازل العشرية (آحاد/عشرات/مئات/ألوف) بالطريقة الجشعة الأكبر-أولًا.
              </p>
            </Trace>
          )}
          {speak && (
            <Trace title="محاولة نطق (تجريبي)">
              <p className="mb-1 font-medium text-[#B5432A]">تجريبي — معجم بذرة صغير جدًا، ليس شاملًا.</p>
              <p>الترتيبات: {speak.allOrderings.slice(0, 12).join('، ')}</p>
              <p>مطابقات المعجم: {speak.dictionaryMatches.join('، ') || '—'}</p>
            </Trace>
          )}
        </>
      ) : (
        <>
          <Field label="الحروف">
            <input dir="rtl" className={inputCls} value={textInput} onChange={(e) => setTextInput(e.target.value)} style={{ fontFamily: '"Amiri","Scheherazade New",serif' }} />
          </Field>
          <div className="rounded-lg bg-[#F5EEDD] p-3 text-center text-2xl font-bold">{fromLetters}</div>
          <Trace>
            <p>حروف ← عدد يكافئ حساب الجمل الكبير لنفس النص.</p>
          </Trace>
        </>
      )}
    </div>
  );
}

function QalbTab() {
  const [word, setWord] = useState('ابجد');
  const [showPerms, setShowPerms] = useState(false);
  const result = qalb(word);
  const perms = showPerms ? qalbPermutations(word, { cap: 24 }) : [];

  return (
    <div className="space-y-3" dir="rtl">
      <Field label="الكلمة">
        <input dir="rtl" className={inputCls} value={word} onChange={(e) => setWord(e.target.value)} style={{ fontFamily: '"Amiri","Scheherazade New",serif' }} />
      </Field>
      <div className="rounded-lg bg-[#F5EEDD] p-3 text-center text-3xl" style={{ fontFamily: '"Amiri","Scheherazade New",serif' }}>
        {result.text}
      </div>
      <button className="text-xs text-[#6B4F2A] underline" onClick={() => setShowPerms((v) => !v)}>
        {showPerms ? 'إخفاء كل الترتيبات' : 'عرض أول ٢٤ ترتيبًا ممكنًا'}
      </button>
      {showPerms && (
        <Trace title={`الترتيبات (${perms.length})`}>
          <p className="leading-loose">{perms.join('، ')}</p>
        </Trace>
      )}
    </div>
  );
}

function MazjTab() {
  const [a, setA] = useState('ابج');
  const [b, setB] = useState('دهو');
  const result = mazj(a, b);

  return (
    <div className="space-y-3" dir="rtl">
      <div className="grid grid-cols-2 gap-3">
        <Field label="الكلمة الأولى">
          <input dir="rtl" className={inputCls} value={a} onChange={(e) => setA(e.target.value)} style={{ fontFamily: '"Amiri","Scheherazade New",serif' }} />
        </Field>
        <Field label="الكلمة الثانية">
          <input dir="rtl" className={inputCls} value={b} onChange={(e) => setB(e.target.value)} style={{ fontFamily: '"Amiri","Scheherazade New",serif' }} />
        </Field>
      </div>
      <div className="rounded-lg bg-[#F5EEDD] p-3 text-center text-3xl" style={{ fontFamily: '"Amiri","Scheherazade New",serif' }}>
        {result.text}
      </div>
      <Trace>
        <p>طريقة التشبيك: حرف من الأولى ثم حرف من الثانية بالتناوب، ويُلحق باقي الأطول عند اختلاف الطولين.</p>
      </Trace>
    </div>
  );
}

function TaksirTab() {
  const [word, setWord] = useState('ابجد');
  const { rows } = useMemo(() => taksir(word), [word]);

  return (
    <div className="space-y-3" dir="rtl">
      <Field label="الكلمة">
        <input dir="rtl" className={inputCls} value={word} onChange={(e) => setWord(e.target.value)} style={{ fontFamily: '"Amiri","Scheherazade New",serif' }} />
      </Field>
      <div className="rounded-lg border border-[#D9CBA6] bg-white p-3">
        <div className="mb-1 text-xs text-[#6B5B45]">دائرة الكلمة (تكسير صدر ومؤخر) — الصف الأخير يعيد الصف الأول</div>
        <ol className="space-y-1 text-xl" style={{ fontFamily: '"Amiri","Scheherazade New",serif' }}>
          {rows.map((r, i) => (
            <li key={i} className={i === 0 || i === rows.length - 1 ? 'font-bold text-[#B5432A]' : ''}>
              {i + 1}. {r}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function BastTab() {
  const [letter, setLetter] = useState('ب');
  const { computeOptions } = useHurufSettings();
  const result = bast(letter, computeOptions);

  return (
    <div className="space-y-3" dir="rtl">
      <Field label="حرف أو كلمة">
        <input dir="rtl" className={inputCls} value={letter} onChange={(e) => setLetter(e.target.value)} style={{ fontFamily: '"Amiri","Scheherazade New",serif' }} />
      </Field>
      <div className="rounded-lg bg-[#F5EEDD] p-3 text-center">
        <div className="text-2xl" style={{ fontFamily: '"Amiri","Scheherazade New",serif' }}>
          {result.expandedText}
        </div>
        <div className="mt-1 text-lg font-bold">{result.total}</div>
      </div>
      <Trace>
        <ul>
          {result.trace.map((t, i) => (
            <li key={i}>
              {t.normalized} = {t.value}
            </li>
          ))}
        </ul>
      </Trace>
    </div>
  );
}

export default function OperationsPanel() {
  const [tab, setTab] = useState('isqat');

  return (
    <div dir="rtl">
      <div className="mb-4 flex flex-wrap gap-2 border-b border-[#D9CBA6] pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg px-3 py-1.5 text-sm ${
              tab === t.id ? 'bg-[#2B2118] text-white' : 'text-[#6B4F2A] hover:bg-[#F5EEDD]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'isqat' && <IsqatTab />}
      {tab === 'istintaq' && <IstintaqTab />}
      {tab === 'qalb' && <QalbTab />}
      {tab === 'mazj' && <MazjTab />}
      {tab === 'taksir' && <TaksirTab />}
      {tab === 'bast' && <BastTab />}
    </div>
  );
}
