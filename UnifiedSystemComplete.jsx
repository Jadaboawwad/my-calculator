import React, { useState, useEffect } from 'react';
import { Clock, Zap, BookOpen, Calculator, TrendingUp, Moon, Sun, Star, Sparkles } from 'lucide-react';

const UnifiedSystemComplete = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [analysis, setAnalysis] = useState({});
  const [nextPowerTimes, setNextPowerTimes] = useState([]);
  const [cycles, setCycles] = useState({});
  const [quranMiracles, setQuranMiracles] = useState({});
  const [tesla369Times, setTesla369Times] = useState([]);
  const [quranNumbers, setQuranNumbers] = useState({});
  const [prayerTimes, setPrayerTimes] = useState(null); // Changed from {} to null

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const reduceToSingle = (num) => {
    while (num > 9) {
      num = num.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    }
    return num;
  };

  // 🕌 جلب مواعيد الصلاة الحية من API حسب الموقع الجغرافي
  const calculatePrayerTimes = async () => {
    try {
      const now = new Date();
      const day = now.getDate();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      
      // محاولة الحصول على الموقع الجغرافي
      let latitude = 24.7136; // الرياض افتراضياً
      let longitude = 46.6753;
      let city = 'الرياض';
      let country = 'Saudi Arabia';
      
      // جلب الموقع من المتصفح
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              maximumAge: 300000 // 5 دقائق
            });
          });
          
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          
          // جلب اسم المدينة من coordinates
          try {
            const geoResponse = await fetch(
              `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=4`
            );
            const geoData = await geoResponse.json();
            if (geoData.data && geoData.data.meta) {
              city = geoData.data.meta.timezone || city;
            }
          } catch (error) {
            console.log('Error getting city name:', error);
          }
        } catch (error) {
          console.log('Geolocation not available, using default Riyadh');
        }
      }
      
      // جلب مواقيت الصلاة من Aladhan API
      const apiUrl = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=4`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.code !== 200 || !data.data || !data.data.timings) {
        throw new Error('Failed to fetch prayer times');
      }
      
      const timings = data.data.timings;
      
      // تحويل الأوقات من صيغة "HH:MM" إلى [hour, minute]
      const parseTime = (timeStr) => {
        const [hour, minute] = timeStr.split(':').map(Number);
        return [hour, minute];
      };
      
      const prayers = {
        fajr: {
          name: 'الفجر',
          time: parseTime(timings.Fajr),
          icon: '🌅',
          apiTime: timings.Fajr
        },
        sunrise: {
          name: 'الشروق',
          time: parseTime(timings.Sunrise),
          icon: '☀️',
          apiTime: timings.Sunrise
        },
        dhuhr: {
          name: 'الظهر',
          time: parseTime(timings.Dhuhr),
          icon: '🌞',
          apiTime: timings.Dhuhr
        },
        asr: {
          name: 'العصر',
          time: parseTime(timings.Asr),
          icon: '🌤️',
          apiTime: timings.Asr
        },
        maghrib: {
          name: 'المغرب',
          time: parseTime(timings.Maghrib),
          icon: '🌅',
          apiTime: timings.Maghrib
        },
        isha: {
          name: 'العشاء',
          time: parseTime(timings.Isha),
          icon: '🌙',
          apiTime: timings.Isha
        }
      };
      
      // حساب الأرقام والطاقة لكل صلاة
      Object.keys(prayers).forEach(key => {
        const prayer = prayers[key];
        const [h, m] = prayer.time;
        
        // الأرقام
        const hReduced = reduceToSingle(h);
        const mReduced = reduceToSingle(m);
        const total = h + m;
        const totalReduced = reduceToSingle(total);
        
        // حساب الطاقة
        const power = calculateFullPower(h, m).power;
        
        // أفضل أوقات الإقامة حيث يظهر رقم 7
        const iqamaTimes = findBestIqamaWith7(h, m);
        
        prayer.numbers = {
          hour: h,
          minute: m,
          hReduced,
          mReduced,
          total,
          totalReduced,
          power
        };
        
        prayer.iqama = iqamaTimes;
      });
      
      // إضافة معلومات الموقع
      prayers.location = {
        city,
        country,
        latitude: latitude.toFixed(4),
        longitude: longitude.toFixed(4),
        method: 'أم القرى - مكة المكرمة',
        date: data.data.date.readable,
        hijri: data.data.date.hijri.date,
        hijriMonth: data.data.date.hijri.month.ar,
        gregorian: data.data.date.gregorian.date
      };
      
      return prayers;
      
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      
      // في حالة الخطأ، نرجع أوقات افتراضية
      const now = new Date();
      const month = now.getMonth() + 1;
      
      let defaultPrayers = {};
      
      if (month >= 4 && month <= 9) { // صيف
        defaultPrayers = {
          fajr: { name: 'الفجر', time: [4, 30], icon: '🌅', apiTime: '04:30' },
          sunrise: { name: 'الشروق', time: [6, 0], icon: '☀️', apiTime: '06:00' },
          dhuhr: { name: 'الظهر', time: [12, 30], icon: '🌞', apiTime: '12:30' },
          asr: { name: 'العصر', time: [16, 0], icon: '🌤️', apiTime: '16:00' },
          maghrib: { name: 'المغرب', time: [19, 30], icon: '🌅', apiTime: '19:30' },
          isha: { name: 'العشاء', time: [21, 0], icon: '🌙', apiTime: '21:00' }
        };
      } else { // شتاء
        defaultPrayers = {
          fajr: { name: 'الفجر', time: [5, 30], icon: '🌅', apiTime: '05:30' },
          sunrise: { name: 'الشروق', time: [7, 0], icon: '☀️', apiTime: '07:00' },
          dhuhr: { name: 'الظهر', time: [12, 0], icon: '🌞', apiTime: '12:00' },
          asr: { name: 'العصر', time: [15, 0], icon: '🌤️', apiTime: '15:00' },
          maghrib: { name: 'المغرب', time: [17, 30], icon: '🌅', apiTime: '17:30' },
          isha: { name: 'العشاء', time: [19, 0], icon: '🌙', apiTime: '19:00' }
        };
      }
      
      // حساب الأرقام للأوقات الافتراضية
      Object.keys(defaultPrayers).forEach(key => {
        const prayer = defaultPrayers[key];
        const [h, m] = prayer.time;
        
        const hReduced = reduceToSingle(h);
        const mReduced = reduceToSingle(m);
        const total = h + m;
        const totalReduced = reduceToSingle(total);
        const power = calculateFullPower(h, m).power;
        const iqamaTimes = findBestIqamaWith7(h, m);
        
        prayer.numbers = {
          hour: h,
          minute: m,
          hReduced,
          mReduced,
          total,
          totalReduced,
          power
        };
        
        prayer.iqama = iqamaTimes;
      });
      
      defaultPrayers.location = {
        city: 'الرياض (افتراضي)',
        country: 'Saudi Arabia',
        latitude: '24.7136',
        longitude: '46.6753',
        method: 'أم القرى - مكة المكرمة',
        date: new Date().toLocaleDateString('ar-SA'),
        error: 'تعذر جلب الموقع - استخدام الرياض كموقع افتراضي'
      };
      
      return defaultPrayers;
    }
  };
  
  // 🎯 إيجاد أفضل أوقات الإقامة حيث يظهر رقم 7
  const findBestIqamaWith7 = (prayerHour, prayerMinute) => {
    const suggestions = [];
    
    // نبحث في الدقائق من 5 إلى 30 دقيقة بعد الأذان
    for (let addMinutes = 5; addMinutes <= 30; addMinutes++) {
      let iqamaHour = prayerHour;
      let iqamaMinute = prayerMinute + addMinutes;
      
      // تعديل الساعة إذا تجاوزت الدقائق 60
      if (iqamaMinute >= 60) {
        iqamaHour++;
        iqamaMinute -= 60;
      }
      if (iqamaHour >= 24) {
        iqamaHour -= 24;
      }
      
      const h = iqamaHour;
      const m = iqamaMinute;
      const total = h + m;
      
      const hReduced = reduceToSingle(h);
      const mReduced = reduceToSingle(m);
      const totalReduced = reduceToSingle(total);
      
      // نبحث عن ظهور رقم 7
      const has7InNumbers = [h, m, total].includes(7);
      const has7InReduced = [hReduced, mReduced, totalReduced].includes(7);
      const has7InDigits = h.toString().includes('7') || m.toString().includes('7');
      
      let score = 0;
      let reasons = [];
      
      if (has7InNumbers) {
        score += 5;
        if (h === 7) reasons.push('الساعة 7');
        if (m === 7) reasons.push('الدقيقة 7');
        if (total === 7) reasons.push('المجموع 7');
      }
      
      if (has7InReduced) {
        score += 3;
        if (hReduced === 7) reasons.push('اختزال الساعة 7');
        if (mReduced === 7) reasons.push('اختزال الدقيقة 7');
        if (totalReduced === 7) reasons.push('اختزال المجموع 7');
      }
      
      if (has7InDigits) {
        score += 2;
        reasons.push('يحتوي على رقم 7');
      }
      
      // نقاط إضافية للأوقات المثالية (10، 15، 20 دقيقة)
      if ([10, 15, 20].includes(addMinutes)) {
        score += 1;
      }
      
      // حساب طاقة الوقت
      const power = calculateFullPower(h, m).power;
      
      if (score > 0 || power >= 6) {
        suggestions.push({
          hour: h,
          minute: m,
          afterAdhan: addMinutes,
          hReduced,
          mReduced,
          totalReduced,
          score,
          power,
          reasons: reasons.join(' + '),
          has7: score > 0
        });
      }
    }
    
    // ترتيب حسب النقاط ثم الطاقة
    suggestions.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.power - a.power;
    });
    
    return suggestions.slice(0, 5); // أفضل 5 أوقات
  };
  
  // 📊 تحليل شامل لأرقام الصلاة
  const analyzePrayerNumbers = (prayer) => {
    if (!prayer || !prayer.numbers) return {};
    
    const { hour, minute, hReduced, mReduced, total, totalReduced, power } = prayer.numbers;
    const versesDB = getQuranVersesByNumber();
    
    const meanings = [];
    
    // إضافة معاني الأرقام
    [hReduced, mReduced, totalReduced].forEach(num => {
      if (versesDB[num]) {
        meanings.push({
          num,
          meaning: versesDB[num].meaning,
          icon: versesDB[num].icon
        });
      }
    });
    
    return {
      meanings,
      power,
      isSpecial: power >= 6,
      message: power >= 10 ? '⭐ وقت قوي جداً للصلاة!' : 
               power >= 6 ? '✨ وقت مبارك' : 
               '🕌 وقت الصلاة'
    };
  };

  const isTesla369Perfect = (hour, minute) => {
    const h = hour;
    const m = minute;
    const total = h + m;
    
    const hReduced = reduceToSingle(h);
    const mReduced = reduceToSingle(m);
    const totalReduced = reduceToSingle(total);
    
    const has3 = [hReduced, mReduced, totalReduced].includes(3);
    const has6 = [hReduced, mReduced, totalReduced].includes(6);
    const has9 = [hReduced, mReduced, totalReduced].includes(9);
    
    return has3 && has6 && has9;
  };

  const findNext369Times = () => {
    const now = currentTime;
    let hour = now.getHours();
    let minute = now.getMinutes();
    
    const perfectTimes = [];
    
    for (let h = 0; h < 48; h++) {
      for (let m = 0; m < 60; m++) {
        const testHour = h % 24;
        
        if (h === hour && testHour === hour && m <= minute) continue;
        
        if (isTesla369Perfect(testHour, m)) {
          const currentDate = new Date(now);
          const targetDate = new Date(currentDate);
          
          if (h >= 24) {
            targetDate.setDate(targetDate.getDate() + 1);
          } else if (testHour < hour || (testHour === hour && m <= minute)) {
            targetDate.setDate(targetDate.getDate() + 1);
          }
          
          targetDate.setHours(testHour, m, 0, 0);
          
          const diff = targetDate - currentDate;
          const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
          const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          
          const power = calculateFullPower(testHour, m);
          
          perfectTimes.push({
            hour: testHour,
            minute: m,
            hoursUntil,
            minutesUntil,
            totalMinutes: hoursUntil * 60 + minutesUntil,
            power: power.power,
            hReduced: power.hReduced,
            mReduced: power.mReduced,
            totalReduced: power.totalReduced
          });
        }
      }
    }
    
    perfectTimes.sort((a, b) => a.totalMinutes - b.totalMinutes);
    
    return perfectTimes.slice(0, 10);
  };

  // قاعدة بيانات شاملة للآيات القرآنية بالأرقام ومعانيها العميقة
  const getQuranVersesByNumber = () => {
    return {
      1: {
        verses: [
          'قُلْ هُوَ اللَّهُ أَحَدٌ (الإخلاص:1)',
          'وَإِلَٰهُكُمْ إِلَٰهٌ وَاحِدٌ لَّا إِلَٰهَ إِلَّا هُوَ الرَّحْمَٰنُ الرَّحِيمُ (البقرة:163)'
        ],
        meaning: 'التوحيد المطلق - الوحدانية',
        action: 'قرار التوحيد والبداية الجديدة',
        wisdom: 'الواحد هو الأساس - ابدأ بالله',
        icon: '☝️'
      },
      2: {
        verses: [
          'ثَانِيَ اثْنَيْنِ إِذْ هُمَا فِي الْغَارِ (التوبة:40)',
          'وَمِن كُلِّ شَيْءٍ خَلَقْنَا زَوْجَيْنِ (الذاريات:49)'
        ],
        meaning: 'الزوجية والشراكة - الشهادة العادلة',
        action: 'قرار الشراكة والعمل الثنائي',
        wisdom: 'الاثنان قوة - تعاون مع الآخرين',
        icon: '👥'
      },
      3: {
        verses: [
          'مَا يَكُونُ مِن نَّجْوَىٰ ثَلَاثَةٍ إِلَّا هُوَ رَابِعُهُمْ (المجادلة:7)'
        ],
        meaning: 'الثبات والاستقرار - المثلث المتوازن',
        action: 'قرار الثبات على ثلاث ركائز',
        wisdom: 'الثلاثة توازن - ثبّت أركانك',
        icon: '🔺'
      },
      4: {
        verses: [
          'فَانكِحُوا مَا طَابَ لَكُم مِّنَ النِّسَاءِ مَثْنَىٰ وَثُلَاثَ وَرُبَاعَ (النساء:3)'
        ],
        meaning: 'النظام والعدل - الشهادة الكاملة',
        action: 'قرار النظام والتنظيم',
        wisdom: 'الأربعة نظام - نظّم حياتك',
        icon: '⬛'
      },
      5: {
        verses: [
          'مَا يَكُونُ مِن نَّجْوَىٰ ثَلَاثَةٍ إِلَّا هُوَ رَابِعُهُمْ وَلَا خَمْسَةٍ إِلَّا هُوَ سَادِسُهُمْ (المجادلة:7)'
        ],
        meaning: 'الصلوات الخمس - أركان الإسلام',
        action: 'قرار المحافظة على العبادات الخمس',
        wisdom: 'الخمسة عبادة - صلِّ وتقرّب',
        icon: '🕌'
      },
      6: {
        verses: [
          'إِنَّ رَبَّكُمُ اللَّهُ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ فِي سِتَّةِ أَيَّامٍ (الأعراف:54)'
        ],
        meaning: 'الخلق المتقن - الإبداع المنظم',
        action: 'قرار الإبداع والخلق المنظم',
        wisdom: 'الستة إبداع - أبدع في عملك',
        icon: '🌍'
      },
      7: {
        verses: [
          'سَبْعَ سَمَاوَاتٍ طِبَاقًا (الملك:3)',
          'ثُمَّ اسْتَوَىٰ إِلَى السَّمَاءِ فَسَوَّاهُنَّ سَبْعَ سَمَاوَاتٍ (البقرة:29)'
        ],
        meaning: 'الكمال الروحي - السماوات السبع',
        action: 'قرار الارتقاء الروحي للسماء السابعة',
        wisdom: 'السبعة كمال - ارتقِ للأعلى',
        icon: '🌌'
      },
      8: {
        verses: [
          'وَيَحْمِلُ عَرْشَ رَبِّكَ فَوْقَهُمْ يَوْمَئِذٍ ثَمَانِيَةٌ (الحاقة:17)'
        ],
        meaning: 'حملة العرش الثمانية - القوة العظمى',
        action: 'قرار القوة والثبات الإيماني',
        wisdom: 'الثمانية قوة - تقوَّ بالإيمان',
        icon: '👼'
      },
      9: {
        verses: [
          'وَكَانَ فِي الْمَدِينَةِ تِسْعَةُ رَهْطٍ يُفْسِدُونَ فِي الْأَرْضِ (النمل:48)'
        ],
        meaning: 'الإتمام والكمال - النهاية قبل البداية',
        action: 'قرار إتمام المشاريع المعلقة',
        wisdom: 'التسعة إتمام - أكمل ما بدأت',
        icon: '✅'
      },
      10: {
        verses: [
          'تِلْكَ عَشَرَةٌ كَامِلَةٌ (البقرة:196)',
          'مَن جَاءَ بِالْحَسَنَةِ فَلَهُ عَشْرُ أَمْثَالِهَا (الأنعام:160)'
        ],
        meaning: 'الكمال والمضاعفة - العشرة الكاملة',
        action: 'قرار فعل الخير للمضاعفة × 10',
        wisdom: 'العشرة مضاعفة - افعل الخير يتضاعف',
        icon: '🌟'
      }
    };
  };

  const getQuranMeaning = (h, m, total) => {
    const hReduced = reduceToSingle(h);
    const mReduced = reduceToSingle(m);
    const totalReduced = reduceToSingle(total);
    
    const meanings = [];
    const allNumbers = [hReduced, mReduced, totalReduced, total, h, m];
    const versesDB = getQuranVersesByNumber();
    
    // البحث عن الأرقام في قاعدة البيانات
    allNumbers.forEach(num => {
      if (versesDB[num] && !meanings.find(m => m.num === num)) {
        const data = versesDB[num];
        meanings.push({
          num: num,
          title: data.meaning,
          verse: data.verses[0],
          icon: data.icon,
          details: data.wisdom,
          action: data.action,
          allVerses: data.verses
        });
      }
    });
    
    return meanings;
  };

  const getDecisions = (meanings, hour, minute, power) => {
    const decisions = [];
    const h = hour;
    const m = minute;
    const total = h + m;
    const versesDB = getQuranVersesByNumber();
    
    // قرارات مباشرة من قاعدة بيانات الآيات
    meanings.forEach(meaning => {
      const num = meaning.num;
      const verseData = versesDB[num];
      
      if (verseData) {
        // إضافة القرار الرئيسي من الآية
        decisions.push(`${verseData.icon} ${verseData.action}`);
        
        // إضافة الحكمة
        decisions.push(`💡 ${verseData.wisdom}`);
      }
    });
    
    // قرارات إضافية حسب قوة الوقت
    if (power >= 15) {
      decisions.unshift('🌟 وقت استثنائي - اطلب المستحيل!');
    } else if (power >= 10) {
      decisions.unshift('👑 وقت مثالي - اتخذ قرارات كبرى');
    } else if (power >= 6) {
      decisions.unshift('⚡ وقت قوي - استغله جيداً');
    }
    
    // إزالة التكرارات والحد من العدد
    const uniqueDecisions = [...new Set(decisions)];
    return uniqueDecisions.slice(0, 10);
  };

  const getRecommendations = (hour, minute, power, reasons) => {
    const h = hour;
    const m = minute;
    const total = h + m;
    const hReduced = reduceToSingle(h);
    const mReduced = reduceToSingle(m);
    const totalReduced = reduceToSingle(total);
    
    let recommendations = [];
    let actionType = 'عادي';
    
    const numbers = [hReduced, mReduced, totalReduced];
    const has1 = numbers.includes(1);
    const has3 = numbers.includes(3);
    const has5 = numbers.includes(5);
    const has6 = numbers.includes(6);
    const has7 = numbers.includes(7);
    const has8 = numbers.includes(8);
    const has9 = numbers.includes(9);
    
    if (power >= 15 || (has1 && (total === 19 || h === 19))) {
      actionType = 'استثنائي';
      recommendations = [
        `🤲 ادعُ بأهم حاجاتك ${total === 19 ? '(×19 مرة)' : '(×' + totalReduced + ' مرات)'}`,
        `📝 اكتب هدفك الأكبر (×${has9 ? '9' : totalReduced} مرات)`,
        '🕌 صلِّ ركعتي حاجة بخشوع',
        '💚 الصلاة على النبي (×100 مرة)',
        '📖 اتخذ قراراً مصيرياً',
        '✨ وقت نادر - لا تضيعه!'
      ];
    } else if (power >= 10) {
      actionType = 'مثالي';
      recommendations = [
        '🤲 دعاء مهم',
        '📖 قراءة قرآن',
        '💼 عمل مثمر',
        '📝 تخطيط دقيق',
        '🎯 إنجاز هدف'
      ];
    } else if (power >= 6) {
      actionType = 'قوي';
      recommendations = [
        '💼 مهام مهمة',
        '📊 مراجعة عمل',
        '🤲 دعاء قصير',
        '📚 قراءة مفيدة',
        '💪 نشاط إيجابي'
      ];
    } else if (power >= 3) {
      actionType = 'مناسب';
      recommendations = [
        '✅ مهام عادية',
        '📧 رد على رسائل',
        '☕ استراحة قصيرة',
        '📖 قراءة خفيفة',
        '🚶 نشاط بسيط'
      ];
    } else {
      actionType = 'عادي';
      recommendations = [
        '😌 استرخاء',
        '🍽️ تناول طعام',
        '👨‍👩‍👧‍👦 عائلة وأصدقاء',
        '🎮 ترفيه',
        '💤 راحة'
      ];
    }
    
    return { recommendations, actionType };
  };

  const calculateFullPower = (hour, minute) => {
    const h = hour;
    const m = minute;
    const total = h + m;
    
    const hReduced = reduceToSingle(h);
    const mReduced = reduceToSingle(m);
    const totalReduced = reduceToSingle(total);
    
    let power = 0;
    let reasons = [];
    
    if (h === 1 || m === 1 || hReduced === 1 || mReduced === 1 || totalReduced === 1) {
      power += 5;
      reasons.push('☝️ الواحد الأحد');
    }
    
    if ([3, 6, 9].includes(hReduced)) {
      power += hReduced === 9 ? 3 : hReduced === 3 ? 2 : 1;
      reasons.push(`⚡ تسلا: ${hReduced}`);
    }
    if ([3, 6, 9].includes(mReduced)) {
      power += mReduced === 9 ? 3 : mReduced === 3 ? 2 : 1;
      reasons.push(`⚡ تسلا: ${mReduced}`);
    }
    if ([3, 6, 9].includes(totalReduced)) {
      power += totalReduced === 9 ? 3 : totalReduced === 3 ? 2 : 1;
      reasons.push(`⚡ تسلا: ${totalReduced}`);
    }
    
    if (h === 4 || m === 4 || total === 4 || hReduced === 4 || mReduced === 4 || totalReduced === 4) {
      power += 2;
      reasons.push('📖 الأربعة');
    }
    
    if (h === 5 || m === 5 || total === 5 || hReduced === 5 || mReduced === 5 || totalReduced === 5) {
      power += 3;
      reasons.push('🕌 الخمسة');
    }
    
    if (total === 7 || totalReduced === 7 || h === 7 || m === 7) {
      power += 2;
      reasons.push('📖 السبع');
    }
    
    if (h === 8 || m === 8 || total === 8 || hReduced === 8 || mReduced === 8 || totalReduced === 8) {
      power += 2;
      reasons.push('👼 الثمانية');
    }
    
    if (total === 12 || total % 12 === 0 || h === 12 || m === 12) {
      power += 3;
      reasons.push('📖 الاثنا عشر');
    }
    
    if (total === 19 || h === 19 || m === 19) {
      power += 4;
      reasons.push('👑 التسعة عشر');
    }
    
    const recs = getRecommendations(h, m, power, reasons);
    
    return {
      power,
      reasons,
      hReduced,
      mReduced,
      totalReduced,
      total,
      isPerfect: power >= 10,
      isSuper: power >= 15,
      recommendations: recs.recommendations,
      actionType: recs.actionType
    };
  };

  const findNextPowerTimes = () => {
    const now = currentTime;
    let hour = now.getHours();
    let minute = now.getMinutes();
    
    const times = [];
    
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m++) {
        if (h === hour && m <= minute) continue;
        
        const power = calculateFullPower(h, m);
        
        if (power.power >= 3) {
          const currentDate = new Date(now);
          const targetDate = new Date(currentDate);
          
          if (h < hour || (h === hour && m <= minute)) {
            targetDate.setDate(targetDate.getDate() + 1);
          }
          
          targetDate.setHours(h, m, 0, 0);
          
          const diff = targetDate - currentDate;
          const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
          const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          
          times.push({
            hour: h,
            minute: m,
            power: power.power,
            reasons: power.reasons,
            isPerfect: power.isPerfect,
            isSuper: power.isSuper,
            hoursUntil,
            minutesUntil
          });
        }
      }
    }
    
    times.sort((a, b) => {
      if (b.power !== a.power) return b.power - a.power;
      const aTime = a.hoursUntil * 60 + a.minutesUntil;
      const bTime = b.hoursUntil * 60 + b.minutesUntil;
      return aTime - bTime;
    });
    
    return times.slice(0, 10);
  };

  const calculateQuranMiracles = () => {
    const now = currentTime;
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    const dayOfMonth = now.getDate();
    const month = now.getMonth() + 1;
    
    return {
      dayOfYear: dayOfYear,
      daysRemaining: 365 - dayOfYear,
      dayOfMonth: dayOfMonth,
      month: month
    };
  };

  const calculateCycles = () => {
    const h = currentTime.getHours();
    const m = currentTime.getMinutes();
    const d = currentTime.getDate();
    const month = currentTime.getMonth() + 1;
    
    return {
      dailyCycle: reduceToSingle(h + m),
      monthlyCycle: reduceToSingle(d),
      yearlyCycle: reduceToSingle(month),
      masterCycle: reduceToSingle(h + m + d + month),
      tesla369: [3, 6, 9].includes(reduceToSingle(h + m)),
      quran: [7, 1, 9, 5].includes(reduceToSingle(h + m))
    };
  };

  const getQuranStats = () => {
    return {
      basics: [
        { label: 'حروف القرآن', value: '323,671', icon: '✍️', detail: 'حرف' },
        { label: 'كلمات القرآن', value: '77,439', icon: '📝', detail: 'كلمة' },
        { label: 'آيات القرآن', value: '6,236', icon: '📖', detail: 'آية → 8' },
        { label: 'سور القرآن', value: '114', icon: '📚', detail: 'سورة' }
      ],
      surahs: [
        { label: 'سور مكية', value: '86', icon: '🕋' },
        { label: 'سور مدنية', value: '28', icon: '🕌' },
        { label: 'سجدات التلاوة', value: '15', icon: '🤲' }
      ],
      wordsBalance: [
        { label: 'الدنيا', value: '115', pair: 'الآخرة', icon: '🌍' },
        { label: 'الآخرة', value: '115', pair: 'الدنيا', icon: '✨' },
        { label: 'الليل', value: '74', pair: '', icon: '🌙' },
        { label: 'النهار', value: '54', pair: '', icon: '☀️' }
      ]
    };
  };

  useEffect(() => {
    const h = currentTime.getHours();
    const m = currentTime.getMinutes();
    setAnalysis(calculateFullPower(h, m));
    setNextPowerTimes(findNextPowerTimes());
    setCycles(calculateCycles());
    setQuranMiracles(calculateQuranMiracles());
    setTesla369Times(findNext369Times());
    setQuranNumbers(getQuranStats());
    
    // جلب مواقيت الصلاة الحية
    calculatePrayerTimes().then(prayers => {
      setPrayerTimes(prayers);
    }).catch(error => {
      console.error('Error setting prayer times:', error);
    });
  }, [currentTime]);

  const formatTime = (h, m) => {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const getPowerColor = (power, isSuper) => {
    if (isSuper) return 'from-yellow-400 via-orange-400 to-red-500';
    if (power >= 10) return 'from-yellow-500 to-orange-500';
    if (power >= 6) return 'from-purple-500 to-pink-500';
    if (power >= 3) return 'from-blue-500 to-cyan-500';
    return 'from-gray-500 to-slate-500';
  };

  const getPowerBorder = (power, isSuper) => {
    if (isSuper) return 'border-yellow-300 shadow-yellow-500/70 shadow-lg';
    if (power >= 10) return 'border-yellow-400 shadow-yellow-500/50';
    if (power >= 6) return 'border-purple-400 shadow-purple-500/50';
    if (power >= 3) return 'border-blue-400 shadow-blue-500/50';
    return 'border-gray-400';
  };

  const h = currentTime.getHours();
  const m = currentTime.getMinutes();
  const total = h + m;
  const meanings = getQuranMeaning(h, m, total);
  const decisions = getDecisions(meanings, h, m, analysis.power);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            النظام المتين الكامل
          </h1>
          <p className="text-purple-300 text-sm md:text-base">
            ﴿وَلِتَعْلَمُوا عَدَدَ السِّنِينَ وَالْحِسَابَ﴾
          </p>
          <p className="text-blue-300 text-xs md:text-sm mt-1">
            الإعجاز العددي القرآني × نظرية تسلا 3-6-9
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Current Time */}
            <div className={`bg-gradient-to-br ${getPowerColor(analysis.power, analysis.isSuper)} p-1 rounded-2xl ${analysis.isSuper ? 'animate-pulse' : ''}`}>
              <div className="bg-slate-900/90 backdrop-blur-lg rounded-2xl p-4 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <Clock className="text-yellow-400" size={28} />
                  <h2 className="text-xl md:text-2xl font-bold">الوقت الحالي</h2>
                </div>
                
                <div className="text-center">
                  <div className="text-5xl md:text-7xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    {formatTime(h, m)}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-purple-900/50 rounded-lg p-3 border border-purple-500/30">
                      <div className="text-xs text-purple-300">الساعة</div>
                      <div className="text-2xl font-bold">{analysis.hReduced}</div>
                    </div>
                    <div className="bg-blue-900/50 rounded-lg p-3 border border-blue-500/30">
                      <div className="text-xs text-blue-300">الدقيقة</div>
                      <div className="text-2xl font-bold">{analysis.mReduced}</div>
                    </div>
                    <div className="bg-green-900/50 rounded-lg p-3 border border-green-500/30">
                      <div className="text-xs text-green-300">المجموع</div>
                      <div className="text-2xl font-bold">{analysis.totalReduced}</div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${getPowerBorder(analysis.power, analysis.isSuper)}`}>
                    <div className="text-xl font-bold mb-2">
                      {analysis.isSuper ? '🌟 استثنائي' : analysis.isPerfect ? '👑 مثالي' : `⚡ قوة: ${analysis.power}`}
                    </div>
                    {analysis.reasons && analysis.reasons.length > 0 && (
                      <div className="text-xs space-y-1 mt-2 max-h-24 overflow-y-auto">
                        {analysis.reasons.map((reason, i) => (
                          <div key={i} className="bg-white/10 rounded px-2 py-1">
                            {reason}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* What to Do Now */}
                  {analysis.recommendations && analysis.recommendations.length > 0 && (
                    <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-2 border-green-400/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-lg font-bold text-green-300">💡 ماذا أفعل الآن؟</div>
                        <div className="text-xs px-3 py-1 rounded bg-green-500/30 text-green-200">
                          {analysis.actionType}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {analysis.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm bg-white/10 rounded p-3">
                            <span className="text-yellow-400 font-bold">{i + 1}.</span>
                            <span className="text-gray-200">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quranic Meanings */}
            {meanings.length > 0 && (
              <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 backdrop-blur-lg rounded-2xl p-4 md:p-6 border-2 border-blue-400/50">
                <div className="flex items-center justify-between mb-4">
                  <BookOpen className="text-blue-400" size={24} />
                  <h2 className="text-xl font-bold text-blue-300">📖 الدلالة القرآنية للوقت</h2>
                </div>
                
                {meanings.map((meaning, i) => (
                  <div key={i} className="mb-4 p-4 bg-white/10 rounded-lg border border-blue-300/30">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-4xl">{meaning.icon}</span>
                      <div className="flex-1">
                        <div className="text-lg font-bold text-yellow-300 mb-2">
                          {meaning.num} - {meaning.title}
                        </div>
                        <div className="text-sm text-blue-200 italic mb-2 leading-relaxed">
                          "{meaning.verse}"
                        </div>
                        {meaning.details && (
                          <div className="text-xs text-gray-300 mb-2 bg-blue-900/30 rounded p-2">
                            💡 {meaning.details}
                          </div>
                        )}
                        {meaning.action && (
                          <div className="text-sm text-cyan-200 bg-cyan-900/30 rounded p-2 border border-cyan-400/30">
                            🎯 <span className="font-bold">{meaning.action}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {decisions.length > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 rounded-lg border-2 border-cyan-400/50">
                    <div className="text-lg font-bold text-cyan-300 mb-3 flex items-center gap-2">
                      <span className="text-2xl">🎯</span>
                      قرارات مستوحاة من الآيات - اختر واحداً الآن:
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {decisions.map((decision, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm bg-cyan-900/30 rounded p-3 border border-cyan-400/20 hover:bg-cyan-900/50 transition-colors cursor-pointer">
                          <span className="text-cyan-400 font-bold min-w-[24px]">{i + 1}.</span>
                          <span className="text-gray-200 flex-1">{decision}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tesla 369 Times */}
            {tesla369Times.length > 0 && (
              <div className="bg-gradient-to-br from-yellow-900/30 via-orange-900/30 to-red-900/30 backdrop-blur-lg rounded-2xl p-4 md:p-6 border-2 border-yellow-400/50 shadow-lg shadow-yellow-500/20">
                <div className="flex items-center justify-between mb-4">
                  <Zap className="text-yellow-400 animate-pulse" size={28} />
                  <h2 className="text-xl font-bold text-yellow-300">⚡ أوقات تسلا 3-6-9 المثالية</h2>
                </div>
                
                <div className="mb-4 p-4 bg-yellow-500/20 rounded-lg border border-yellow-400/50">
                  <div className="text-sm text-yellow-200 text-center mb-3">
                    🌟 الأوقات التي تحتوي 3 و 6 و 9 معاً - أقوى أوقات اليوم!
                  </div>
                  {tesla369Times[0] && (
                    <div className="p-4 bg-gradient-to-r from-yellow-600/30 to-orange-600/30 rounded border border-yellow-300">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-yellow-200">الوقت القادم:</div>
                          <div className="text-4xl font-bold text-yellow-100">
                            {formatTime(tesla369Times[0].hour, tesla369Times[0].minute)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-yellow-200">بعد:</div>
                          <div className="text-3xl font-bold text-orange-200">
                            {tesla369Times[0].hoursUntil > 0 && `${tesla369Times[0].hoursUntil}س `}
                            {tesla369Times[0].minutesUntil}د
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <div className="text-xs font-bold text-yellow-300 mb-2">الأوقات التالية:</div>
                  {tesla369Times.slice(1, 8).map((time, i) => (
                    <div 
                      key={i}
                      className="p-3 rounded bg-gradient-to-r from-yellow-800/20 to-orange-800/20 border border-yellow-500/30"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 font-bold text-lg">
                            {formatTime(time.hour, time.minute)}
                          </span>
                          <div className="flex gap-1 text-xs">
                            <span className="bg-purple-500/30 rounded px-2 py-1">{time.hReduced}</span>
                            <span className="bg-blue-500/30 rounded px-2 py-1">{time.mReduced}</span>
                            <span className="bg-green-500/30 rounded px-2 py-1">{time.totalReduced}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-300">
                          بعد {time.hoursUntil > 0 && `${time.hoursUntil}س `}{time.minutesUntil}د
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Complete Quran Statistics */}
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 backdrop-blur-lg rounded-2xl p-4 md:p-6 border-2 border-green-400/50">
              <div className="flex items-center justify-between mb-4">
                <Sparkles className="text-green-400" size={24} />
                <h2 className="text-xl font-bold text-green-300">📊 الإحصائيات القرآنية الكاملة</h2>
              </div>

              {/* Basics */}
              <div className="mb-4">
                <div className="text-base font-bold text-green-300 mb-3">🔢 الأساسيات:</div>
                <div className="grid grid-cols-2 gap-2">
                  {quranNumbers.basics && quranNumbers.basics.map((item, i) => (
                    <div key={i} className="bg-green-900/20 rounded-lg p-3 border border-green-500/30">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{item.icon}</span>
                        <div className="text-right">
                          <div className="text-xs text-green-300">{item.label}</div>
                          <div className="text-lg font-bold text-yellow-300">{item.value}</div>
                          {item.detail && <div className="text-xs text-gray-400">{item.detail}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Surahs */}
              <div className="mb-4">
                <div className="text-base font-bold text-blue-300 mb-3">📚 السور:</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {quranNumbers.surahs && quranNumbers.surahs.map((item, i) => (
                    <div key={i} className="bg-blue-900/20 rounded-lg p-2 border border-blue-500/30">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <div className="text-xs text-blue-300">{item.label}</div>
                          <div className="text-base font-bold text-yellow-300">{item.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Words Balance */}
              <div className="mb-4">
                <div className="text-base font-bold text-purple-300 mb-3">⚖️ التوازن العددي:</div>
                <div className="space-y-2">
                  {quranNumbers.wordsBalance && quranNumbers.wordsBalance.map((item, i) => (
                    <div key={i} className={`rounded-lg p-3 border ${item.pair ? 'bg-purple-900/30 border-purple-400/50' : 'bg-purple-900/20 border-purple-500/30'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item.icon}</span>
                          <span className="text-sm text-purple-300">{item.label}</span>
                        </div>
                        <div className="text-base font-bold text-yellow-300">{item.value}</div>
                      </div>
                      {item.pair && (
                        <div className="text-xs text-purple-200 mt-1 text-center">
                          = {item.pair} ({item.value})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Next Power Times */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-purple-500/20">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="text-purple-400" size={20} />
                <h2 className="text-lg font-bold">الأوقات القوية</h2>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {nextPowerTimes.map((time, i) => (
                  <div 
                    key={i}
                    className={`p-3 rounded-lg border ${getPowerBorder(time.power, time.isSuper)} bg-slate-900/50`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-lg font-bold text-yellow-400">
                          {formatTime(time.hour, time.minute)}
                        </div>
                        <div className="text-xs text-gray-400">
                          بعد {time.hoursUntil > 0 && `${time.hoursUntil}س `}{time.minutesUntil}د
                        </div>
                      </div>
                      <div className="text-sm font-bold text-yellow-300">
                        {time.isSuper ? '🌟' : time.isPerfect ? '👑' : `⚡${time.power}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cycles */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-purple-500/20">
              <div className="flex items-center justify-between mb-3">
                <Calculator className="text-blue-400" size={20} />
                <h2 className="text-lg font-bold">الدورات</h2>
              </div>
              
              <div className="space-y-2">
                <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30">
                  <div className="text-xs text-purple-300">اليومية</div>
                  <div className="text-2xl font-bold">{cycles.dailyCycle}</div>
                </div>
                
                <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                  <div className="text-xs text-blue-300">الشهرية</div>
                  <div className="text-2xl font-bold">{cycles.monthlyCycle}</div>
                </div>
                
                <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                  <div className="text-xs text-green-300">السنوية</div>
                  <div className="text-2xl font-bold">{cycles.yearlyCycle}</div>
                </div>
                
                <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30">
                  <div className="text-xs text-yellow-300">الرئيسية</div>
                  <div className="text-2xl font-bold">{cycles.masterCycle}</div>
                </div>

                {cycles.tesla369 && (
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded p-2 border border-purple-400">
                    <div className="text-sm">⚡ دورة تسلا نشطة</div>
                  </div>
                )}
                
                {cycles.quran && (
                  <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded p-2 border border-blue-400">
                    <div className="text-sm">📖 دورة قرآنية نشطة</div>
                  </div>
                )}
              </div>
            </div>

            {/* Year Progress */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-green-500/20">
              <div className="flex items-center justify-between mb-3">
                <BookOpen className="text-green-400" size={20} />
                <h2 className="text-lg font-bold">تقدم السنة</h2>
              </div>
              
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-lg p-3 border border-green-400/50">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-bold text-green-300">أيام السنة</div>
                    <Sun className="text-yellow-400" size={18} />
                  </div>
                  <div className="text-2xl font-bold text-yellow-300">{quranMiracles.dayOfYear}/365</div>
                </div>

                <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 rounded-lg p-3 border border-blue-400/50">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-bold text-blue-300">أيام الشهر</div>
                    <Moon className="text-blue-300" size={18} />
                  </div>
                  <div className="text-2xl font-bold text-blue-200">{quranMiracles.dayOfMonth}/30</div>
                </div>

                <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-lg p-3 border border-yellow-400/50">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-bold text-yellow-300">المتبقي</div>
                    <Star className="text-yellow-300" size={18} />
                  </div>
                  <div className="text-2xl font-bold text-yellow-200">{quranMiracles.daysRemaining}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🕌 قسم مواعيد الصلاة وأفضل أوقات الإقامة */}
        {prayerTimes && Object.keys(prayerTimes).length > 0 && (
          <div className="mt-6 bg-gradient-to-br from-green-900/30 via-teal-900/30 to-emerald-900/30 rounded-2xl p-6 border-2 border-green-400/50 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent">
                🕌 مواعيد الصلاة وأفضل أوقات الإقامة
              </h2>
              <p className="text-green-200 text-sm mb-3">
                ﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا﴾
              </p>
              
              {/* معلومات الموقع والتاريخ */}
              {prayerTimes.location && (
                <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 rounded-lg p-4 border border-blue-400/30 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                      <div className="text-blue-300 font-bold">📍 الموقع</div>
                      <div className="text-blue-100">{prayerTimes.location.city}</div>
                      <div className="text-xs text-blue-200">
                        {prayerTimes.location.latitude}°, {prayerTimes.location.longitude}°
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-300 font-bold">📅 التاريخ</div>
                      <div className="text-blue-100">{prayerTimes.location.date}</div>
                      {prayerTimes.location.hijri && (
                        <div className="text-xs text-blue-200">{prayerTimes.location.hijri} {prayerTimes.location.hijriMonth}</div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-blue-300 font-bold">🕋 طريقة الحساب</div>
                      <div className="text-blue-100 text-xs">{prayerTimes.location.method}</div>
                      <div className="text-xs text-green-300 mt-1">⚡ مواقيت حية من API</div>
                    </div>
                  </div>
                  {prayerTimes.location.error && (
                    <div className="mt-2 text-xs text-yellow-300 text-center">
                      ⚠️ {prayerTimes.location.error}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(prayerTimes)
                .filter(([key]) => key !== 'sunrise' && key !== 'location') // إخفاء الشروق والموقع
                .map(([key, prayer]) => {
                  const analysis = analyzePrayerNumbers(prayer);
                  const [h, m] = prayer.time;
                  
                  return (
                    <div key={key} className="bg-gradient-to-br from-green-800/40 to-teal-800/40 rounded-xl p-4 border border-green-400/30 hover:border-green-300/60 transition-all">
                      {/* اسم الصلاة */}
                      <div className="text-center mb-3">
                        <div className="text-3xl mb-2">{prayer.icon}</div>
                        <h3 className="text-2xl font-bold text-green-200">{prayer.name}</h3>
                        <div className="text-4xl font-bold text-green-100 my-2">
                          {h.toString().padStart(2, '0')}:{m.toString().padStart(2, '0')}
                        </div>
                      </div>

                      {/* الأرقام والطاقة */}
                      <div className="mb-4 p-3 bg-green-950/50 rounded-lg border border-green-500/30">
                        <div className="text-sm text-green-200 mb-2 font-bold">🔢 تحليل الأرقام:</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="text-green-300">الساعة</div>
                            <div className="font-bold text-green-100">{h} → {prayer.numbers.hReduced}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-green-300">الدقيقة</div>
                            <div className="font-bold text-green-100">{m} → {prayer.numbers.mReduced}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-green-300">المجموع</div>
                            <div className="font-bold text-green-100">{prayer.numbers.total} → {prayer.numbers.totalReduced}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-center">
                          <span className="text-yellow-300 font-bold">⚡ طاقة: {prayer.numbers.power}</span>
                          <span className="text-xs text-green-200 mr-2">{analysis.message}</span>
                        </div>
                      </div>

                      {/* المعاني القرآنية */}
                      {analysis.meanings && analysis.meanings.length > 0 && (
                        <div className="mb-4 p-3 bg-purple-950/50 rounded-lg border border-purple-500/30">
                          <div className="text-sm text-purple-200 mb-2 font-bold">📖 المعاني:</div>
                          <div className="space-y-1">
                            {analysis.meanings.slice(0, 2).map((meaning, idx) => (
                              <div key={idx} className="text-xs text-purple-100">
                                {meaning.icon} {meaning.num}: {meaning.meaning.substring(0, 40)}...
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* أفضل أوقات الإقامة مع رقم 7 */}
                      {prayer.iqama && prayer.iqama.length > 0 && (
                        <div className="p-3 bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-lg border border-yellow-400/50">
                          <div className="text-sm font-bold text-yellow-200 mb-3 text-center">
                            ⭐ أفضل أوقات الإقامة (رقم 7 ظاهر)
                          </div>
                          <div className="space-y-2">
                            {prayer.iqama.slice(0, 3).map((iqama, idx) => (
                              <div 
                                key={idx} 
                                className={`p-2 rounded-lg border ${
                                  iqama.has7 
                                    ? 'bg-yellow-900/50 border-yellow-400/60' 
                                    : 'bg-green-900/30 border-green-400/30'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-yellow-100">
                                    {iqama.hour.toString().padStart(2, '0')}:{iqama.minute.toString().padStart(2, '0')}
                                  </span>
                                  <span className="text-xs text-yellow-200">
                                    بعد {iqama.afterAdhan} دقيقة
                                  </span>
                                </div>
                                
                                {iqama.has7 && (
                                  <div className="text-xs mb-1">
                                    <span className="text-yellow-300 font-bold">🎯 {iqama.reasons}</span>
                                  </div>
                                )}
                                
                                <div className="text-xs text-green-200">
                                  {iqama.hReduced === 7 && <span className="mr-1">✨ س→7</span>}
                                  {iqama.mReduced === 7 && <span className="mr-1">✨ د→7</span>}
                                  {iqama.totalReduced === 7 && <span className="mr-1">✨ ج→7</span>}
                                  <span className="mr-2">⚡ طاقة: {iqama.power}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* ملاحظة */}
            <div className="mt-6 text-center text-green-300 text-sm bg-green-950/30 p-4 rounded-lg border border-green-500/30">
              <p className="mb-2">
                <span className="text-2xl">🌍</span> <strong>مواقيت حية:</strong> يتم جلب المواقيت تلقائياً حسب موقعك الجغرافي من Aladhan API
              </p>
              <p className="text-xs text-green-400 mb-2">
                يستخدم النظام موقعك (GPS) لتحديد المواقيت الدقيقة. إذا لم يتوفر الموقع، يستخدم الرياض كموقع افتراضي
              </p>
              <p className="text-xs text-green-400">
                رقم 7 له دلالة عميقة: السماوات السبع، أيام الأسبوع، الطواف سبعاً، السعي سبعاً
              </p>
              <p className="text-xs text-yellow-300 mt-2">
                ⭐ الأوقات المميزة بالأصفر تحتوي على رقم 7 بشكل ظاهر أو مختزل - أوقات مباركة للإقامة!
              </p>
              <p className="text-xs text-blue-300 mt-2">
                🔄 يتم تحديث المواقيت تلقائياً كل دقيقة
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedSystemComplete;