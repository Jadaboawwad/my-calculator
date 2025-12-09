// نظام كتاب مرقوم - تحليل الحروف المقطعة والأنماط الحسابية
// بناءً على القاعدة المستخرجة من الملخص

// جدول الجُمَّل الكلاسيكي
export const jumalStandard = {
  'ا': 1, 'أ': 1, 'إ': 1, 'آ': 1,
  'ب': 2,
  'ج': 3,
  'د': 4,
  'ه': 5, 'ة': 5,
  'و': 6,
  'ز': 7,
  'ح': 8,
  'ط': 9,
  'ي': 10, 'ى': 10,
  'ك': 20,
  'ل': 30,
  'م': 40,
  'ن': 50,
  'س': 60,
  'ع': 70,
  'ف': 80,
  'ص': 90,
  'ق': 100,
  'ر': 200,
  'ش': 300,
  'ت': 400,
  'ث': 500,
  'خ': 600,
  'ذ': 700,
  'ض': 800,
  'ظ': 900,
  'غ': 1000
};

// الجدول الترتيبي الخاص (من الملخص)
export const sequentialOrder = {
  'ا': 1, 'أ': 1, 'إ': 1, 'آ': 1,
  'ب': 2,
  'ج': 3,
  'ه': 4, 'ة': 4,
  'د': 5,
  'ز': 6,
  'ق': 7,
  'م': 8,
  'ع': 9,
  'ط': 10,
  'ض': 11,
  'ي': 12, 'ى': 12,
  'ق': 13, // ملاحظة: ق مكررة (7 و 13)
  'ن': 14
};

// قاعدة بيانات الحروف المقطعة والسور المرتبطة بها
export const muqattaatDatabase = {
  // طسم
  'طسم': {
    surahs: [26, 27, 28], // الشعراء، النمل، القصص
    letters: ['ط', 'س', 'م'],
    name: 'طسم',
    description: 'طاى، سين، ميم'
  },
  // طس
  'طس': {
    surahs: [27], // النمل
    letters: ['ط', 'س'],
    name: 'طس',
    description: 'طاى، سين'
  },
  // الم
  'الم': {
    surahs: [2, 3, 29, 30, 31, 32], // البقرة، آل عمران، العنكبوت، الروم، لقمان، السجدة
    letters: ['ا', 'ل', 'م'],
    name: 'الم',
    description: 'ألف، لام، ميم'
  },
  // الر
  'الر': {
    surahs: [10, 11, 12, 14, 15], // يونس، هود، يوسف، إبراهيم، الحجر
    letters: ['ا', 'ل', 'ر'],
    name: 'الر',
    description: 'ألف، لام، راء'
  },
  // كهيعص
  'كهيعص': {
    surahs: [19], // مريم
    letters: ['ك', 'ه', 'ي', 'ع', 'ص'],
    name: 'كهيعص',
    description: 'كاف، ها، يا، عين، صاد'
  },
  // حم
  'حم': {
    surahs: [40, 41, 42, 43, 44, 45, 46], // غافر، فصلت، الشورى، الزخرف، الدخان، الجاثية، الأحقاف
    letters: ['ح', 'م'],
    name: 'حم',
    description: 'حا، ميم'
  },
  // عسق
  'عسق': {
    surahs: [42], // الشورى
    letters: ['ع', 'س', 'ق'],
    name: 'عسق',
    description: 'عين، سين، قاف'
  },
  // يس
  'يس': {
    surahs: [36], // يس
    letters: ['ي', 'س'],
    name: 'يس',
    description: 'يا، سين'
  },
  // ص
  'ص': {
    surahs: [38], // ص
    letters: ['ص'],
    name: 'ص',
    description: 'صاد'
  },
  // ق
  'ق': {
    surahs: [50], // ق
    letters: ['ق'],
    name: 'ق',
    description: 'قاف'
  },
  // ن
  'ن': {
    surahs: [68], // القلم
    letters: ['ن'],
    name: 'ن',
    description: 'نون'
  }
};

// دالة اختزال الرقم لخانة واحدة
export function reduceToSingleDigit(number) {
  let num = Math.abs(number);
  while (num > 9) {
    num = String(num).split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
}

// دالة حساب النمط البسيط (مثل 4+5+4)
export function calculateSimplePattern(numbers) {
  const sum = numbers.reduce((a, b) => a + b, 0);
  const reduced = reduceToSingleDigit(sum);
  
  return {
    pattern: numbers.join(' + '),
    sum: sum,
    reduced: reduced,
    numbers: numbers
  };
}

// دالة حساب النمط المعقد (مجموعات داخل مجموعات)
export function calculateComplexPattern(groups) {
  const groupResults = groups.map(group => {
    const sum = group.values.reduce((a, b) => a + b, 0);
    return {
      values: group.values,
      sum: sum,
      pattern: group.values.join(' + ')
    };
  });
  
  const total = groupResults.reduce((sum, group) => sum + group.sum, 0);
  const reduced = reduceToSingleDigit(total);
  
  return {
    groups: groupResults,
    total: total,
    reduced: reduced
  };
}

// دالة تحليل الحروف المقطعة للسورة
export function analyzeSurahMuqattaat(surahNumber) {
  const result = {
    surahNumber: surahNumber,
    muqattaat: null,
    letters: [],
    analysis: null
  };
  
  // البحث عن الحروف المقطعة للسورة
  for (const [key, data] of Object.entries(muqattaatDatabase)) {
    if (data.surahs.includes(surahNumber)) {
      result.muqattaat = key;
      result.letters = data.letters;
      
      // حساب القيم باستخدام الجدول الترتيبي
      const letterValues = result.letters.map(letter => {
        return {
          letter: letter,
          sequentialValue: sequentialOrder[letter] || jumalStandard[letter] || 0,
          jumalValue: jumalStandard[letter] || 0
        };
      });
      
      // حساب النمط البسيط
      const sequentialValues = letterValues.map(lv => lv.sequentialValue);
      const simplePattern = calculateSimplePattern(sequentialValues);
      
      // حساب النمط المعقد (مثل المثال: 4+2+5, 4+13+4, 17+2+17)
      // هذا مثال - يمكن تخصيصه حسب السورة
      let complexPattern = null;
      if (sequentialValues.length >= 3) {
        // تقسيم الحروف إلى مجموعات
        const group1 = sequentialValues.slice(0, Math.ceil(sequentialValues.length / 3));
        const group2 = sequentialValues.slice(group1.length, group1.length + Math.ceil(sequentialValues.length / 3));
        const group3 = sequentialValues.slice(group1.length + group2.length);
        
        complexPattern = calculateComplexPattern([
          { values: group1 },
          { values: group2 },
          { values: group3 }
        ]);
      }
      
      result.analysis = {
        letterValues: letterValues,
        simplePattern: simplePattern,
        complexPattern: complexPattern,
        description: data.description
      };
      
      break;
    }
  }
  
  return result;
}

// دالة تحليل الآية بناءً على نظام كتاب مرقوم
export function analyzeVerseKitabMarqum(surahNumber, ayahNumber, verseText) {
  const result = {
    surahNumber: surahNumber,
    ayahNumber: ayahNumber,
    muqattaatAnalysis: analyzeSurahMuqattaat(surahNumber),
    verseAnalysis: null
  };
  
  // تحليل نص الآية
  if (verseText) {
    // استخراج الحروف من نص الآية
    const arabicLetters = verseText.match(/[\u0600-\u06FF]/g) || [];
    
    // حساب القيم - عد كل حرف مرة واحدة فقط
    const letterCounts = {};
    const uniqueLetters = new Set();
    
    arabicLetters.forEach(letter => {
      if (!letterCounts[letter]) {
        letterCounts[letter] = 0;
      }
      letterCounts[letter]++;
      uniqueLetters.add(letter);
    });
    
    // إنشاء قائمة بالقيم الفريدة
    const letterValues = Array.from(uniqueLetters)
      .map(letter => {
        const sequentialValue = sequentialOrder[letter] || jumalStandard[letter] || 0;
        const jumalValue = jumalStandard[letter] || 0;
        
        return {
          letter: letter,
          sequentialValue: sequentialValue,
          jumalValue: jumalValue,
          count: letterCounts[letter]
        };
      })
      .filter(lv => lv.sequentialValue > 0 || lv.jumalValue > 0)
      .sort((a, b) => (b.sequentialValue || b.jumalValue) - (a.sequentialValue || a.jumalValue));
    
    // حساب مجموع القيم الترتيبية (القيمة × التكرار)
    const totalSequential = letterValues.reduce((sum, lv) => sum + (lv.sequentialValue * lv.count), 0);
    const totalJumal = letterValues.reduce((sum, lv) => sum + (lv.jumalValue * lv.count), 0);
    
    // حساب النمط من القيم الفريدة فقط (بدون التكرار)
    const uniqueSequentialValues = letterValues
      .map(lv => lv.sequentialValue)
      .filter(v => v > 0)
      .slice(0, 10); // أول 10 حروف فقط لتجنب النمط الطويل
    
    const sequentialPattern = uniqueSequentialValues.length > 0 
      ? calculateSimplePattern(uniqueSequentialValues)
      : null;
    
    result.verseAnalysis = {
      letterCounts: letterCounts,
      letterValues: letterValues,
      totalSequential: totalSequential,
      totalJumal: totalJumal,
      sequentialPattern: sequentialPattern,
      reducedSequential: reduceToSingleDigit(totalSequential),
      reducedJumal: reduceToSingleDigit(totalJumal)
    };
  }
  
  return result;
}

// دالة الحصول على معلومات السورة والحروف المقطعة
export function getSurahMuqattaatInfo(surahNumber) {
  const analysis = analyzeSurahMuqattaat(surahNumber);
  
  if (analysis.muqattaat) {
    const muqattaatData = muqattaatDatabase[analysis.muqattaat];
    return {
      hasMuqattaat: true,
      muqattaat: analysis.muqattaat,
      description: muqattaatData.description,
      letters: analysis.letters,
      analysis: analysis.analysis
    };
  }
  
  return {
    hasMuqattaat: false,
    muqattaat: null,
    description: null,
    letters: [],
    analysis: null
  };
}

