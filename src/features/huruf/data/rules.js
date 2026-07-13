// جدول استخراج القواعد (verse → rule) — مرجع تصميمي حي يربط كل ميزة بالبيت المصدر

/**
 * @typedef {Object} ExtractedRule
 * @property {string} id
 * @property {148|149|150|151} page
 * @property {string} verseExcerpt
 * @property {string} rule
 * @property {string} implementsAs
 */

/** @type {ExtractedRule[]} */
export const EXTRACTED_RULES = [
  { id: 'rule-1', page: 148, verseExcerpt: 'النقطة مركز كل شيء', rule: 'اختزال كل مركّب لأصل واحد', implementsAs: 'engine.reduce() — نقطة النهاية المشتركة لكل الحسابات' },
  { id: 'rule-2', page: 148, verseExcerpt: 'المدّ يحوّل النقطة إلى ألف', rule: 'كمون → فعل بعملية مضبوطة', implementsAs: 'engine.activate(seed)' },
  { id: 'rule-3', page: 148, verseExcerpt: 'الدوران والتنويع يولّد الحروف', rule: 'توليد كثرة من قاعدة تحويل واحدة', implementsAs: 'lattice.expand(unit) — توليد ٢٨ حرفًا من قانون واحد' },
  { id: 'rule-4', page: 148, verseExcerpt: 'نسبة العلم لأخنوخ', rule: 'كل نظام يحتاج سندًا موثقًا', implementsAs: 'data/sources.js — كل قاعدة بيانات لها مصدر مذكور' },
  { id: 'rule-5', page: 148, verseExcerpt: 'السبعة الأعلام', rule: 'كل عنصر موسوم بدورة خارجية', implementsAs: 'letter.planet (scheme قابل للاختيار)' },
  { id: 'rule-6', page: 148, verseExcerpt: 'عشرة أصول وأركان الطبيعة', rule: 'إحداثيات متعددة الأبعاد لكل مفردة', implementsAs: 'letter.{rank, nature}' },
  { id: 'rule-7', page: 148, verseExcerpt: 'صورة الصورة', rule: 'البنية تتكرر ذاتيًا عبر المستويات', implementsAs: 'نفس engine.reduce() يُستدعى لثلاث مقاييس (كلمة، نص، زمن)' },
  { id: 'rule-8', page: 148, verseExcerpt: 'جمع المبادئ بقاعدة سرية', rule: 'القيمة من التركيب لا من الأجزاء', implementsAs: 'engine.profile() يجمع كل الأبعاد في تقرير واحد' },
  { id: 'rule-9', page: 149, verseExcerpt: 'نطاق الحق يفتح كل مقفل', rule: 'واجهة واحدة، مفاتيح متعددة', implementsAs: 'ReductionUnifier + NitaqWheel كواجهة موحدة' },
  { id: 'rule-10', page: 149, verseExcerpt: 'كتمه ضنينًا', rule: 'التحكم بالوصول', implementsAs: 'SettingsPanel.disclosureLevel (مبتدئ/متعمق)' },
  { id: 'rule-11', page: 149, verseExcerpt: 'أعِد نظرًا (تكرار)', rule: 'الفهم بالتكرار لا بالنظرة الواحدة', implementsAs: 'زر «أعد النظر» يعيد نفس المدخل بعمق تفسير أعلى' },
  { id: 'rule-12', page: 149, verseExcerpt: 'شرعة مخصوصة', rule: 'بروتوكول دخول محدد', implementsAs: 'تحقق شروط الإدخال قبل التنفيذ (guard)' },
  { id: 'rule-13', page: 149, verseExcerpt: 'استخراج الضمائر / الاسم يشمل الكل', rule: 'اشتقاق ما هو غير ظاهر من المدخل', implementsAs: 'engine.reduce() — scale: word' },
  { id: 'rule-14', page: 149, verseExcerpt: 'لا إيضاح إلا بالرمز', rule: 'التمثيل الرمزي طبقة ضرورية', implementsAs: 'كل نتيجة تُعرض كرمز (لون/موضع على العجلة) + شرح نصي مرافق' },
  { id: 'rule-15', page: 149, verseExcerpt: 'آصف وسليمان وسِفر آدم', rule: 'شواهد تاريخية موثقة (test cases)', implementsAs: 'tests/fixtures — أمثلة الكتاب' },
  { id: 'rule-16', page: 149, verseExcerpt: 'الرشد بالإرشاد لا بالتصريح', rule: 'معلّم موثوق لا وثيقة مجردة', implementsAs: 'LearnMode يربط كل نتيجة بشرح البيت المصدر' },
  { id: 'rule-17', page: 150, verseExcerpt: 'فضّ الجملتين إلى الياء=١٠', rule: 'كل حساب يُختصر لمرجع ثابت', implementsAs: 'isqat(n, 10) كإحدى القيم الافتراضية الأساسية' },
  { id: 'rule-18', page: 150, verseExcerpt: 'لا فتح إلا بهذا المفتاح', rule: 'pivot واحد لكل الحسابات', implementsAs: 'الياء=١٠ هي CANONICAL_MODULUS الافتراضية' },
  { id: 'rule-19', page: 150, verseExcerpt: 'مراتب الفتح الثلاث', rule: 'العملية متدرجة (macro→meso→micro)', implementsAs: 'engine.reduce(input, {depth: 1|2|3})' },
  { id: 'rule-20', page: 150, verseExcerpt: 'صيغتها بإجماع', rule: 'صحة القاعدة بإجماع مصادر', implementsAs: 'data/schemes.js يوثّق كل scheme مع مصدره' },
  { id: 'rule-21', page: 150, verseExcerpt: 'استخراج فوري بلا علاج إن صحّ الشرط', rule: 'نتيجة فورية إذا تحقق الشرط المسبق', implementsAs: 'كل شيء pure function متزامن' },
  { id: 'rule-22', page: 150, verseExcerpt: 'ميقات العشرة (٣+٧، ٣٠+١٠)', rule: 'جدولة مشتقة من ثابت مرجعي', implementsAs: 'chronogram.ts يستخدم نفس المنطق العددي — scale: text' },
  { id: 'rule-23', page: 150, verseExcerpt: '«ربّ اشرح لي صدري» = نداء تفعيل', rule: 'كل تنفيذ يحتاج trigger محدد لا أي مدخل', implementsAs: 'التحقق من صحة/معنى المدخل قبل التشغيل' },
  { id: 'rule-24', page: 151, verseExcerpt: 'الفرد يُبدَل عند الياء', rule: 'overflow → مرتبة جديدة، النظام دوري', implementsAs: 'dawr.ts — عند n % 10 === 0 تُبدأ دورة جديدة' },
  { id: 'rule-25', page: 151, verseExcerpt: 'قلب الأعيان اضطرارًا لا اختيارًا', rule: 'مخرج محدد بالقواعد لا بإرادة المستخدم', implementsAs: 'لا أزرار "تمنَّ نتيجة" — المخرج دومًا محسوب' },
  { id: 'rule-26', page: 151, verseExcerpt: 'الحروف الصامتة تنطق لمن بلغ الأوج', rule: 'نفس المدخل، مخرج يختلف حسب حالة القارئ', implementsAs: 'disclosureLevel يغيّر العمق لا الرقم' },
  { id: 'rule-27', page: 151, verseExcerpt: 'جزّ الرقاب / إلا في دور العيان', rule: 'إفصاح مشروط بالسياق', implementsAs: 'About يوضح: هذا "دور عيان" (نشر تعليمي)' },
  { id: 'rule-28', page: 151, verseExcerpt: 'الاسم = قلبه حال مزجه', rule: 'القلب/المزج ينتج قيمًا مختلفة', implementsAs: 'operations.qalb(), operations.mazj()' },
  { id: 'rule-29', page: 151, verseExcerpt: 'خلوة القلب لا خلوة القالب', rule: 'الشرط داخلي لا شكلي', implementsAs: 'لا طقوس واجهة — فقط حساب شفاف' },
  { id: 'rule-30', page: 151, verseExcerpt: 'جمع الحواس بصدق وإخلاص ووزن', rule: 'ثلاثة شروط دخول ثابتة', implementsAs: 'profile() يعرض: الرقم + الطبيعة + الميزان معًا' },
  { id: 'rule-31', page: 151, verseExcerpt: 'يسقط بالطاء (٩)', rule: 'اختزال تساعي قابل للتركيب', implementsAs: 'isqat(n, 9) قابل للتركيب' },
  { id: 'rule-32', page: 151, verseExcerpt: 'القطب الأصلي والنسب الأولى', rule: 'كل نتيجة تُربط بجذرها', implementsAs: 'sourceTrace + trace قابل للفتح' },
  { id: 'rule-33', page: 151, verseExcerpt: 'الدور يدور إلى الميزان فيعتدل', rule: 'نفس آلة الاختزال تُطبَّق على الزمن', implementsAs: 'engine.reduce() — scale: time' },
];

export const ruleById = (id) => EXTRACTED_RULES.find((r) => r.id === id);

export default EXTRACTED_RULES;
