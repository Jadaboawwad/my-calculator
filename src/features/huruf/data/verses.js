// دروس المنظومة — أبيات المنظومة نفسها لم تُدرَج بعد (بانتظار أن يُدخلها المستخدم من المخطوطة).
// كل درس هنا هيكل جاهز: نص البيت (فراغ مؤقت)، شرح مختصر للمفهوم، وربط بعرض حي في الواجهة.

/**
 * @typedef {Object} VerseLesson
 * @property {string} id
 * @property {string} verse        نص البيت — فراغ بانتظار الإدخال من المخطوطة الأصلية
 * @property {string} explanation  شرح مختصر
 * @property {{ component: 'wheel'|'jummal'|'isqat'|'istintaq'|'taksir', props?: object }} [demo]
 */

/** @type {VerseLesson[]} */
export const VERSE_LESSONS = [
  {
    id: 'point-to-alif',
    verse: '',
    explanation:
      'أصل النظام كله: النقطة تتحول إلى الألف (الواحد)، ومنه تتوزع ثمانية وعشرون حرفًا. النقطة والألف مرسومان في مركز الدولاب.',
    demo: { component: 'wheel', props: {} },
  },
  {
    id: 'ten-ranks-ya',
    verse: '',
    explanation:
      'المراتب العشر: الحروف تُختزل إلى آحادها (١..٩)، والياء (١٠) هي «تمام المراتب» — عندها يُغلق الدولاب ويُعاد ميلاد الألف في مرتبة أعلى (١ ← ١٠ ← ١٠٠).',
    demo: { component: 'wheel', props: { activeChars: ['ي'] } },
  },
  {
    id: 'four-natures',
    verse: '',
    explanation:
      'الطبائع الأربع (نار، هواء، ماء، تراب) تُوزَّع دوريًا على الحروف الثمانية والعشرين، كل رابع حرف من ترتيب الأبجد يحمل نفس الطبيعة.',
    demo: { component: 'wheel', props: {} },
  },
  {
    id: 'seven-planets',
    verse: '',
    explanation:
      'السبعة الأعلام: توزيع دوري آخر للحروف على الكواكب السبعة بالترتيب الكلداني (زحل، المشتري، المريخ، الشمس، الزهرة، عطارد، القمر)، أربعة حروف لكل كوكب.',
    demo: { component: 'wheel', props: {} },
  },
  {
    id: 'complete-ten',
    verse: '',
    explanation: '«تلك عشرة كاملة» — قاعدة الإسقاط: أي باقٍ يساوي صفرًا يعود إلى القياس كاملًا، لا صفر.',
    demo: { component: 'isqat', props: { n: 18, modulus: 9 } },
  },
  {
    id: 'istintaq-1394',
    verse: '',
    explanation:
      'الاستنطاق: تفكيك عام هجري إلى حروف حسب المنازل — المثال المذكور في الكتاب: ١٣٩٤ ← غ ش ص د (١٠٠٠+٣٠٠+٩٠+٤).',
    demo: { component: 'istintaq', props: { n: 1394 } },
  },
];

export default VERSE_LESSONS;
