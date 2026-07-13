import React from 'react';
import { Info } from 'lucide-react';
import { FRAMEWORK_DISCLAIMER } from '../data/sources';

export default function AboutPanel({ compact = false }) {
  if (compact) {
    return (
      <p className="text-xs leading-relaxed text-[#6B5B45]">
        أداة دراسة تراثية لـ«علم الحروف» — محرك اختزال واحد على كلمة/نص/زمن. المخرجات وصفية تعليمية
        حسب منطق النظام، لا تكهن ولا حكم غيبي. التفاصيل في «عن هذا العلم».
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-[#D9CBA6] bg-[#F5EEDD] p-4 text-[#2B2118]" dir="rtl">
      <div className="mb-2 flex items-center gap-2 font-semibold">
        <Info size={18} />
        <span>عن هذا العلم</span>
      </div>
      <div className="space-y-2 text-sm leading-relaxed">
        <p className="rounded border border-[#D9CBA6] bg-white p-2 text-xs">{FRAMEWORK_DISCLAIMER}</p>
        <p>
          هذه الأداة تطبّق «موحّد الاختزال»: محرك واحد يُشغَّل على ثلاث مقاييس — <strong>كلمة</strong>{' '}
          (اسم)، <strong>نص</strong> (آية/بيت)، <strong>زمن</strong> (سنة). المدخل يتغير، الشبكة
          والمحرك لا يتغيران.
        </p>
        <p>
          <strong>الآية المتنبأ بها</strong> تُحسب حسب قواعد الزمن والحروف (استنطاق + جُمَّل +
          إسقاطات)، ثم تُمرَّر تلقائيًا كمدخل لمحرك الاختزال على مقياس النص — هذا هو الغاية
          المركزية للتطبيق.
        </p>
        <p>
          الغرض خدمة الدارس والباحث — حساب الجُمَّل، التأريخ الشعري، تصنيف الحروف، والعمليات
          الكلاسيكية — <strong>كما وردت في المصادر التراثية</strong> فحسب.
        </p>
        <p className="font-medium">
          هذا «دور عيان» (نشر تعليمي): الأداة تحسب وتشرح، ولا تُصدر حكمًا غيبيًا أو توصية شخصية.
          لا صلة لها بالتنجيم أو الأوفاق أو الرقى. لا يوجد زر «تمنَّ نتيجة» — المخرج دومًا محسوب.
        </p>
      </div>
    </div>
  );
}
