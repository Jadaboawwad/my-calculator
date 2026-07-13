import React from 'react';
import { Info } from 'lucide-react';

export default function AboutPanel({ compact = false }) {
  if (compact) {
    return (
      <p className="text-xs leading-relaxed text-[#6B5B45]">
        أداة دراسة تراثية لـ«علم الحروف» حسب منظومة القرن التاسع عشر — الحساب والتصنيف فقط، دون
        أي ادعاء غيبي أو توصية شخصية. التفاصيل في «عن هذا العلم».
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
        <p>
          هذه الأداة نافذة على «علم الحروف» (نطاق الحروف) كما ورد في منظومة تعليمية من القرن التاسع
          عشر: النقطة تتحول إلى الألف، ومنه تتوزع ثمانية وعشرون حرفًا على عشر مراتب عددية، وأربع
          طبائع، وسبعة كواكب، واثني عشر برجًا.
        </p>
        <p>
          الغرض منها خدمة الدارس والباحث في المخطوطات — حساب الجُمَّل، فكّ التواريخ الشعرية، تصنيف
          الحروف، وإجراء العمليات الكلاسيكية (إسقاط، استنطاق، قلب، مزج، تكسير) — <strong>كما وردت في
          المصادر التراثية</strong> فحسب.
        </p>
        <p className="font-medium">
          كل نتيجة هنا موصوفة بـ«حسب المنظومة» أو «حسب التراث»: الأداة تحسب وتشرح، ولا تُصدر أي حكم
          غيبي أو توصية شخصية أو تكهنًا بمصير أو قرار. لا صلة لها بالتنجيم أو الأوفاق أو الرقى.
        </p>
      </div>
    </div>
  );
}
