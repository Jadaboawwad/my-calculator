// جدول استخراج القواعد (verse → rule) — مرجع توثيقي حي يربط كل ميزة في الكود
// بالبيت الذي استُخرجت منه (SPEC v2 §1). لا ميزة "مخترعة" بلا سند نصّي.
//
// أرقام الصفحات تقريبية (المنظومة في الصفحات ١٤٨–١٥١) بانتظار مطابقة المخطوطة — راجعها المستخدم.

/**
 * @typedef {Object} ExtractedRule
 * @property {string} id            'R1'..'R33'
 * @property {148|149|150|151} page
 * @property {string} verseExcerpt  البيت أو جزء منه
 * @property {string} rule          القاعدة المجردة
 * @property {string} implementsAs  أين تتحقق في الكود
 */

/** @type {ExtractedRule[]} */
export const RULES = [
  { id: 'R1', page: 148, verseExcerpt: 'النقطة مركز كل شيء', rule: 'اختزال كل مركّب لأصل واحد', implementsAs: 'lib/engine.js reduce() — نقطة النهاية المشتركة لكل الحسابات' },
  { id: 'R2', page: 148, verseExcerpt: 'المدّ يحوّل النقطة إلى ألف', rule: 'كمون → فعل بعملية مضبوطة', implementsAs: 'lib/istintaq.js numberToLetters() — تفعيل العدد حروفًا' },
  { id: 'R3', page: 148, verseExcerpt: 'الدوران والتنويع يولّد الحروف', rule: 'توليد كثرة من قاعدة تحويل واحدة', implementsAs: 'data/letters.js — توليد سجلات الحروف الـ٢٨ من قانون واحد' },
  { id: 'R4', page: 148, verseExcerpt: 'نسبة العلم لأخنوخ', rule: 'كل نظام يحتاج سندًا موثقًا', implementsAs: 'data/quranNumeric.js — حقل source إلزامي لكل مدخلة' },
  { id: 'R5', page: 148, verseExcerpt: 'السبعة الأعلام', rule: 'كل عنصر موسوم بدورة خارجية', implementsAs: 'data/schemes.js PLANET_SCHEMES — إسناد الكواكب للحروف' },
  { id: 'R6', page: 148, verseExcerpt: 'عشرة أصول وأركان الطبيعة', rule: 'إحداثيات متعددة الأبعاد لكل مفردة', implementsAs: 'data/letters.js — rank و nature لكل حرف' },
  { id: 'R7', page: 148, verseExcerpt: 'صورة الصورة', rule: 'البنية تتكرر ذاتيًا عبر المستويات', implementsAs: 'lib/engine.js — نفس reduce() يُستدعى للمقاييس الثلاثة (كلمة/نص/زمن)' },
  { id: 'R8', page: 148, verseExcerpt: 'جمع المبادئ بقاعدة سرية', rule: 'القيمة من التركيب لا من الأجزاء', implementsAs: 'lib/profile.js computeProfile() — يجمع كل الأبعاد في تقرير واحد' },
  { id: 'R9', page: 148, verseExcerpt: 'نطاق الحق يفتح كل مقفل', rule: 'واجهة واحدة، مفاتيح متعددة', implementsAs: 'components/NitaqWheel.jsx — واجهة موحدة لكل الأدوات' },
  { id: 'R10', page: 148, verseExcerpt: 'كتمه ضنينًا', rule: 'التحكم بالوصول', implementsAs: 'components/SettingsPanel.jsx disclosureLevel (مبتدئ/متعمق)' },
  { id: 'R11', page: 149, verseExcerpt: 'أعِد نظرًا (تكرار)', rule: 'الفهم بالتكرار لا بالنظرة الواحدة', implementsAs: 'components/UnifiedReducer.jsx — زر «أعد النظر» يعيد نفس المدخل بعمق أعلى' },
  { id: 'R12', page: 149, verseExcerpt: 'شرعة مخصوصة', rule: 'بروتوكول دخول محدد', implementsAs: 'lib/engine.js — تحقق شروط الإدخال قبل التنفيذ (guard)' },
  { id: 'R13', page: 149, verseExcerpt: 'استخراج الضمائر / الاسم يشمل الكل', rule: 'اشتقاق ما هو غير ظاهر من المدخل', implementsAs: 'lib/engine.js reduce() — هذا هو تعريف "استخراج الضمير" برمجيًا' },
  { id: 'R14', page: 149, verseExcerpt: 'لا إيضاح إلا بالرمز', rule: 'التمثيل الرمزي طبقة ضرورية', implementsAs: 'components/UnifiedReducer.jsx — كل نتيجة تُعرض كرمز (لون/موضع على العجلة) + شرح نصي' },
  { id: 'R15', page: 149, verseExcerpt: 'آصف وسليمان وسِفر آدم', rule: 'شواهد تاريخية موثقة (test cases)', implementsAs: 'lib/__tests__/ — الاختبارات مبنية على أمثلة النظام نفسها' },
  { id: 'R16', page: 149, verseExcerpt: 'الرشد بالإرشاد لا بالتصريح', rule: 'معلّم موثوق لا وثيقة مجردة', implementsAs: 'components/LearnMode.jsx — يربط كل نتيجة بشرح البيت المصدر' },
  { id: 'R17', page: 149, verseExcerpt: 'فضّ الجملتين إلى الياء=١٠', rule: 'كل حساب يُختصر لمرجع ثابت', implementsAs: 'lib/isqat.js isqat(n, 10) — إحدى القيم الافتراضية الأساسية' },
  { id: 'R18', page: 149, verseExcerpt: 'لا فتح إلا بهذا المفتاح', rule: 'pivot واحد لكل الحسابات', implementsAs: 'lib/engine.js CANONICAL_MODULUS = 10 (الياء) الافتراضية' },
  { id: 'R19', page: 149, verseExcerpt: 'مراتب الفتح الثلاث', rule: 'العملية متدرجة (macro→meso→micro)', implementsAs: 'lib/engine.js reduce(input, {depth: 1|2|3})' },
  { id: 'R20', page: 150, verseExcerpt: 'صيغتها بإجماع', rule: 'صحة القاعدة بإجماع مصادر', implementsAs: 'data/schemes.js — يوثّق كل scheme مع مصدره ويعلّم الاختلاف' },
  { id: 'R21', page: 150, verseExcerpt: 'استخراج فوري بلا علاج إن صحّ الشرط', rule: 'نتيجة فورية إذا تحقق الشرط المسبق', implementsAs: 'lib/engine.js — كل شيء pure function متزامن، لا حسابات تدريجية' },
  { id: 'R22', page: 150, verseExcerpt: 'ميقات العشرة (٣+٧، ٣٠+١٠)', rule: 'جدولة مشتقة من ثابت مرجعي', implementsAs: 'lib/chronogram.js — نفس المنطق العددي للتأريخ' },
  { id: 'R23', page: 150, verseExcerpt: '«ربّ اشرح لي صدري» = نداء تفعيل', rule: 'كل تنفيذ يحتاج trigger محدد لا أي مدخل', implementsAs: 'lib/engine.js — التحقق من صحة/معنى المدخل قبل التشغيل (لا garbage in)' },
  { id: 'R24', page: 150, verseExcerpt: 'الفرد يُبدَل عند الياء', rule: 'overflow → مرتبة جديدة، النظام دوري', implementsAs: 'lib/dawr.js + engine cyclesCompleted — عند تمام العشرة تُبدأ دورة جديدة' },
  { id: 'R25', page: 150, verseExcerpt: 'قلب الأعيان اضطرارًا لا اختيارًا', rule: 'مخرج محدد بالقواعد لا بإرادة المستخدم', implementsAs: 'لا أزرار "تمنَّ نتيجة" في الواجهة — المخرج دومًا محسوب لا مُنتقى' },
  { id: 'R26', page: 150, verseExcerpt: 'الحروف الصامتة تنطق لمن بلغ الأوج', rule: 'نفس المدخل، مخرج يختلف حسب حالة القارئ', implementsAs: 'disclosureLevel يغيّر عمق القراءة لا الرقم' },
  { id: 'R27', page: 150, verseExcerpt: 'جزّ الرقاب / إلا في دور العيان', rule: 'إفصاح مشروط بالسياق', implementsAs: 'components/AboutPanel.jsx — هذا "دور عيان" (نشر تعليمي) بشروطه' },
  { id: 'R28', page: 150, verseExcerpt: 'الاسم = قلبه حال مزجه', rule: 'القلب/المزج ينتج قيمًا مختلفة', implementsAs: 'lib/operations.js qalb() و mazj()' },
  { id: 'R29', page: 151, verseExcerpt: 'خلوة القلب لا خلوة القالب', rule: 'الشرط داخلي لا شكلي', implementsAs: 'لا "طقوس واجهة" (عدّادات صمت، توقيت خلوة…) — فقط حساب شفاف' },
  { id: 'R30', page: 151, verseExcerpt: 'جمع الحواس بصدق وإخلاص ووزن', rule: 'ثلاثة شروط دخول ثابتة', implementsAs: 'components/UnifiedReducer.jsx — يعرض دومًا: الرقم + الطبيعة + الميزان معًا، لا رقمًا مجردًا' },
  { id: 'R31', page: 151, verseExcerpt: 'يسقط بالطاء (٩)', rule: 'اختزال تساعي قابل للتركيب', implementsAs: 'lib/isqat.js isqat(n, 9) — قابل للتركيب مع أي إسقاط آخر' },
  { id: 'R32', page: 151, verseExcerpt: 'القطب الأصلي والنسب الأولى', rule: 'كل نتيجة تُربط بجذرها', implementsAs: 'engine sourceTrace + واجهة «من أين جاء هذا الرقم؟» (trace)' },
  { id: 'R33', page: 151, verseExcerpt: 'الدور يدور إلى الميزان فيعتدل', rule: 'نفس آلة الاختزال تُطبَّق على الزمن', implementsAs: 'lib/engine.js reduce({scale:"time"}) + dawr nextAlignment(سنة، الميزان=٧)' },
];

/** @param {string} id */
export const ruleById = (id) => RULES.find((r) => r.id === id);

/** مفاتيح القواعد الأكثر استعمالًا في الكود — لتجنب السلاسل الحرّة المبعثرة */
export const CANONICAL_RULE_IDS = {
  reduction: 'R1',
  selfSimilar: 'R7',
  repeat: 'R11',
  guard: 'R12',
  istikhraj: 'R13',
  symbol: 'R14',
  learn: 'R16',
  yaPivot: 'R17',
  canonicalModulus: 'R18',
  depth: 'R19',
  pure: 'R21',
  chronogram: 'R22',
  trigger: 'R23',
  cycles: 'R24',
  computedNotChosen: 'R25',
  disclosure: 'R26',
  operations: 'R28',
  threeConditions: 'R30',
  isqat9: 'R31',
  trace: 'R32',
  timeScale: 'R33',
};

export default RULES;
