import React, { useState, useEffect } from "react";
import { Clock, Zap, BookOpen, Calculator, TrendingUp, Moon, Sun, Star, Sparkles, ChevronDown } from "lucide-react";
import WhatToDoNow from "./Whattodonow";
import { quranicNumbersDatabase, getNumberInfo, calculateNumberEnergy } from "../../Quranicnumbersdatabase";

const UnifiedSystemComplete = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [analysis, setAnalysis] = useState({});
  const [nextPowerTimes, setNextPowerTimes] = useState([]);
  const [cycles, setCycles] = useState({});
  const [quranMiracles, setQuranMiracles] = useState({});
  const [tesla369Times, setTesla369Times] = useState([]);
  const [quranNumbers, setQuranNumbers] = useState({});
  const [prayerTimes, setPrayerTimes] = useState(null); // Changed from {} to null
  const [selectedNumber, setSelectedNumber] = useState(null); // Selected number from dropdown
  const [selectedNumberInfo, setSelectedNumberInfo] = useState(null); // Info about selected number

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const reduceToSingle = (num) => {
    while (num > 9) {
      num = num
        .toString()
        .split("")
        .reduce((a, b) => parseInt(a) + parseInt(b), 0);
    }
    return num;
  };

  // 🕌 جلب مواعيد الصلاة الحية من API حسب الموقع الجغرافي
  // افتراض أن الدوال المساعدة (reduceToSingle، calculateFullPower، findBestIqamaWith7) مُعرفة مسبقًا
  // (تم إبقاؤها كما هي في منطق حساب الأرقام في الكود الأصلي).

  const calculatePrayerTimes = async (selectedNumber = null, selectedNumberInfo = null) => {
    // تحديد قيم افتراضية للمساعدة في حساب الأرقام لاحقًا
    let latitude = "31.9539"; // إحداثيات عمان الافتراضية
    let longitude = "35.9106";
    let city = "Amman";
    let country = "Jordan";
    let methodDescription = "رابطة العالم الإسلامي"; // وصف طريقة الحساب

    try {
      const now = new Date();
      const day = now.getDate();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const date = `${day}-${month}-${year}`; // تنسيق التاريخ المطلوب: يوم-شهر-سنة

      // 🔹 إعداد المتغيرات لعمّان (استبدال قيم .env بـ عمان)
      // *تم إزالة منطق جلب الموقع من المتصفح (navigator.geolocation)*

      // ⚠️ الطريقة 3 (رابطة العالم الإسلامي) هي الأكثر شيوعاً كخيار عام في المنطقة
      // يمكن استخدام 1 (جامعة كراتشي) أو 8 (الهيئة الأردنية غير مدعومة بالرقم)
      const method = 3;

      // جلب مواقيت الصلاة من Aladhan API باستخدام العنوان (timingsByAddress)
      const apiUrl = `https://api.aladhan.com/v1/timingsByAddress/${date}?address=${city}, ${country}&method=${method}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.code !== 200 || !data.data || !data.data.timings) {
        throw new Error(`Failed to fetch prayer times for ${city}, ${country}`);
      }

      const timings = data.data.timings;

      // تحويل الأوقات من صيغة "HH:MM" إلى [hour, minute]
      const parseTime = (timeStr) => {
        const [hour, minute] = timeStr.split(":").map(Number);
        return [hour, minute];
      };

      const prayers = {
        fajr: {
          name: "الفجر",
          time: parseTime(timings.Fajr),
          icon: "🌅",
          apiTime: timings.Fajr,
        },
        sunrise: {
          name: "الشروق",
          time: parseTime(timings.Sunrise),
          icon: "☀️",
          apiTime: timings.Sunrise,
        },
        dhuhr: {
          name: "الظهر",
          time: parseTime(timings.Dhuhr),
          icon: "🌞",
          apiTime: timings.Dhuhr,
        },
        asr: {
          name: "العصر",
          time: parseTime(timings.Asr),
          icon: "🌤️",
          apiTime: timings.Asr,
        },
        maghrib: {
          name: "المغرب",
          time: parseTime(timings.Maghrib),
          icon: "🌅",
          apiTime: timings.Maghrib,
        },
        isha: {
          name: "العشاء",
          time: parseTime(timings.Isha),
          icon: "🌙",
          apiTime: timings.Isha,
        },
      };

      // حساب الأرقام والطاقة لكل صلاة (بقي كما هو)
      Object.keys(prayers).forEach((key) => {
        const prayer = prayers[key];
        const [h, m] = prayer.time;

        // الأرقام
        const hReduced = reduceToSingle(h);
        const mReduced = reduceToSingle(m);
        const total = h + m;
        const totalReduced = reduceToSingle(total);

        // حساب الطاقة
        const power = calculateFullPower(h, m).power;

        // أفضل أوقات الإقامة حيث يظهر رقم 7 أو الرقم المختار
        const iqamaTimes = findBestIqamaWith7(h, m, selectedNumber, selectedNumberInfo);

        prayer.numbers = {
          hour: h,
          minute: m,
          hReduced,
          mReduced,
          total,
          totalReduced,
          power,
        };

        prayer.iqama = iqamaTimes;
      });

      // إضافة معلومات الموقع (تحديث بيانات الموقع بناءً على نتيجة API)
      prayers.location = {
        // نستخدم بيانات الموقع المرجعة من API (meta)
        city: data.data.meta.timezone.split("/")[1].replace("_", " ") || city, // Amman
        country: country,
        latitude: data.data.meta.latitude.toFixed(4), // الإحداثيات الفعلية لعمّان
        longitude: data.data.meta.longitude.toFixed(4),
        method: methodDescription,
        date: data.data.date.readable,
        hijri: data.data.date.hijri.date,
        hijriMonth: data.data.date.hijri.month.ar,
        gregorian: data.data.date.gregorian.date,
      };

      return prayers;
    } catch (error) {
      console.error("Error fetching prayer times:", error);

      // في حالة الخطأ، نرجع أوقات افتراضية (تم تحديث رسالة الخطأ لتناسب عمان)
      const now = new Date();
      const month = now.getMonth() + 1;

      let defaultPrayers = {};

      if (month >= 4 && month <= 9) {
        // صيف
        defaultPrayers = {
          fajr: { name: "الفجر", time: [4, 30], icon: "🌅", apiTime: "04:30" },
          sunrise: { name: "الشروق", time: [6, 0], icon: "☀️", apiTime: "06:00" },
          dhuhr: { name: "الظهر", time: [12, 30], icon: "🌞", apiTime: "12:30" },
          asr: { name: "العصر", time: [16, 0], icon: "🌤️", apiTime: "16:00" },
          maghrib: { name: "المغرب", time: [19, 30], icon: "🌅", apiTime: "19:30" },
          isha: { name: "العشاء", time: [21, 0], icon: "🌙", apiTime: "21:00" },
        };
      } else {
        // شتاء
        defaultPrayers = {
          fajr: { name: "الفجر", time: [5, 30], icon: "🌅", apiTime: "05:30" },
          sunrise: { name: "الشروق", time: [7, 0], icon: "☀️", apiTime: "07:00" },
          dhuhr: { name: "الظهر", time: [12, 0], icon: "🌞", apiTime: "12:00" },
          asr: { name: "العصر", time: [15, 0], icon: "🌤️", apiTime: "15:00" },
          maghrib: { name: "المغرب", time: [17, 30], icon: "🌅", apiTime: "17:30" },
          isha: { name: "العشاء", time: [19, 0], icon: "🌙", apiTime: "19:00" },
        };
      }

      // حساب الأرقام للأوقات الافتراضية (بقي كما هو)
      Object.keys(defaultPrayers).forEach((key) => {
        const prayer = defaultPrayers[key];
        const [h, m] = prayer.time;

        const hReduced = reduceToSingle(h);
        const mReduced = reduceToSingle(m);
        const total = h + m;
        const totalReduced = reduceToSingle(total);
        const power = calculateFullPower(h, m).power;
        const iqamaTimes = findBestIqamaWith7(h, m, selectedNumber, selectedNumberInfo);

        prayer.numbers = {
          hour: h,
          minute: m,
          hReduced,
          mReduced,
          total,
          totalReduced,
          power,
        };

        prayer.iqama = iqamaTimes;
      });

      defaultPrayers.location = {
        city: "عمّان (افتراضي)",
        country: "Jordan",
        latitude: "31.9539",
        longitude: "35.9106",
        method: "رابطة العالم الإسلامي (افتراضي)",
        date: new Date().toLocaleDateString("ar-JO"),
        error: "فشل جلب مواقيت الصلاة من API - استخدام عمّان كموقع افتراضي",
      };

      return defaultPrayers;
    }
  };

  // 🎯 إيجاد أفضل أوقات الإقامة حيث يظهر رقم 7 أو الرقم المختار
  const findBestIqamaWith7 = (prayerHour, prayerMinute, selectedNumber = null, selectedNumberInfo = null) => {
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
      const has7InDigits = h.toString().includes("7") || m.toString().includes("7");

      // نبحث عن ظهور الرقم المختار (إذا كان موجوداً)
      let hasSelectedNumber = false;
      let selectedNumberScore = 0;
      let selectedNumberReasons = [];
      
      if (selectedNumber && selectedNumberInfo) {
        const numValue = Number(selectedNumber) || 0;
        const numReduced = numValue > 9 ? reduceToSingle(numValue) : numValue;
        
        // البحث عن الرقم في الأرقام الكاملة
        if ([h, m, total].includes(numValue)) {
          hasSelectedNumber = true;
          selectedNumberScore += 8; // نقاط أعلى للرقم المختار
          if (h === numValue) selectedNumberReasons.push(`الساعة ${numValue} (رقم مختار)`);
          if (m === numValue) selectedNumberReasons.push(`الدقيقة ${numValue} (رقم مختار)`);
          if (total === numValue) selectedNumberReasons.push(`المجموع ${numValue} (رقم مختار)`);
        }
        
        // البحث عن الرقم في الأرقام المختزلة
        if ([hReduced, mReduced, totalReduced].includes(numReduced) || [hReduced, mReduced, totalReduced].includes(numValue)) {
          hasSelectedNumber = true;
          selectedNumberScore += 6;
          if (hReduced === numReduced || hReduced === numValue) selectedNumberReasons.push(`اختزال الساعة ${numReduced} (رقم مختار)`);
          if (mReduced === numReduced || mReduced === numValue) selectedNumberReasons.push(`اختزال الدقيقة ${numReduced} (رقم مختار)`);
          if (totalReduced === numReduced || totalReduced === numValue) selectedNumberReasons.push(`اختزال المجموع ${numReduced} (رقم مختار)`);
        }
        
        // البحث عن الرقم في الأرقام الفردية
        const hStr = h.toString();
        const mStr = m.toString();
        if (hStr.includes(selectedNumber) || mStr.includes(selectedNumber)) {
          hasSelectedNumber = true;
          selectedNumberScore += 4;
          selectedNumberReasons.push(`يحتوي على الرقم المختار ${selectedNumber}`);
        }
        
        // إذا كان الرقم المختار من أرقام تسلا (3، 6، 9) أو 7، أضف نقاط إضافية
        if ([3, 6, 9].includes(numReduced) || [3, 6, 9].includes(numValue)) {
          selectedNumberScore += 2;
          selectedNumberReasons.push(`⚡ رقم تسلا مختار`);
        }
        
        if (numValue === 7 || numReduced === 7) {
          selectedNumberScore += 3;
          selectedNumberReasons.push(`✨ رقم مبارك مختار`);
        }
      }

      let score = 0;
      let reasons = [];

      if (has7InNumbers) {
        score += 5;
        if (h === 7) reasons.push("الساعة 7");
        if (m === 7) reasons.push("الدقيقة 7");
        if (total === 7) reasons.push("المجموع 7");
      }

      if (has7InReduced) {
        score += 3;
        if (hReduced === 7) reasons.push("اختزال الساعة 7");
        if (mReduced === 7) reasons.push("اختزال الدقيقة 7");
        if (totalReduced === 7) reasons.push("اختزال المجموع 7");
      }

      if (has7InDigits) {
        score += 2;
        reasons.push("يحتوي على رقم 7");
      }

      // إضافة نقاط الرقم المختار
      score += selectedNumberScore;
      reasons = [...selectedNumberReasons, ...reasons];

      // نقاط إضافية للأوقات المثالية (10، 15، 20 دقيقة)
      if ([10, 15, 20].includes(addMinutes)) {
        score += 1;
      }

      // حساب طاقة الوقت
      const power = calculateFullPower(h, m).power;

      // إضافة الأوقات التي تحتوي على الرقم المختار أو رقم 7 أو طاقة عالية
      if (score > 0 || power >= 6 || hasSelectedNumber) {
        suggestions.push({
          hour: h,
          minute: m,
          afterAdhan: addMinutes,
          hReduced,
          mReduced,
          totalReduced,
          score,
          power,
          reasons: reasons.join(" + "),
          has7: has7InNumbers || has7InReduced || has7InDigits,
          hasSelectedNumber: hasSelectedNumber,
          selectedNumber: selectedNumber
        });
      }
    }

    // ترتيب حسب النقاط ثم الطاقة (الأوقات التي تحتوي على الرقم المختار تأتي أولاً)
    suggestions.sort((a, b) => {
      // أولوية للرقم المختار
      if (a.hasSelectedNumber && !b.hasSelectedNumber) return -1;
      if (!a.hasSelectedNumber && b.hasSelectedNumber) return 1;
      
      // ثم حسب النقاط
      if (b.score !== a.score) return b.score - a.score;
      
      // ثم حسب الطاقة
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
    [hReduced, mReduced, totalReduced].forEach((num) => {
      if (versesDB[num]) {
        meanings.push({
          num,
          meaning: versesDB[num].meaning,
          icon: versesDB[num].icon,
        });
      }
    });

    return {
      meanings,
      power,
      isSpecial: power >= 6,
      message: power >= 10 ? "⭐ وقت قوي جداً للصلاة!" : power >= 6 ? "✨ وقت مبارك" : "🕌 وقت الصلاة",
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
            totalReduced: power.totalReduced,
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
        verses: ["قُلْ هُوَ اللَّهُ أَحَدٌ (الإخلاص:1)", "وَإِلَٰهُكُمْ إِلَٰهٌ وَاحِدٌ لَّا إِلَٰهَ إِلَّا هُوَ الرَّحْمَٰنُ الرَّحِيمُ (البقرة:163)"],
        meaning: "التوحيد المطلق - الوحدانية",
        action: "قرار التوحيد والبداية الجديدة",
        wisdom: "الواحد هو الأساس - ابدأ بالله",
        icon: "☝️",
      },
      2: {
        verses: ["ثَانِيَ اثْنَيْنِ إِذْ هُمَا فِي الْغَارِ (التوبة:40)", "وَمِن كُلِّ شَيْءٍ خَلَقْنَا زَوْجَيْنِ (الذاريات:49)"],
        meaning: "الزوجية والشراكة - الشهادة العادلة",
        action: "قرار الشراكة والعمل الثنائي",
        wisdom: "الاثنان قوة - تعاون مع الآخرين",
        icon: "👥",
      },
      3: {
        verses: ["مَا يَكُونُ مِن نَّجْوَىٰ ثَلَاثَةٍ إِلَّا هُوَ رَابِعُهُمْ (المجادلة:7)"],
        meaning: "الثبات والاستقرار - المثلث المتوازن",
        action: "قرار الثبات على ثلاث ركائز",
        wisdom: "الثلاثة توازن - ثبّت أركانك",
        icon: "🔺",
      },
      4: {
        verses: ["فَانكِحُوا مَا طَابَ لَكُم مِّنَ النِّسَاءِ مَثْنَىٰ وَثُلَاثَ وَرُبَاعَ (النساء:3)"],
        meaning: "النظام والعدل - الشهادة الكاملة",
        action: "قرار النظام والتنظيم",
        wisdom: "الأربعة نظام - نظّم حياتك",
        icon: "⬛",
      },
      5: {
        verses: ["مَا يَكُونُ مِن نَّجْوَىٰ ثَلَاثَةٍ إِلَّا هُوَ رَابِعُهُمْ وَلَا خَمْسَةٍ إِلَّا هُوَ سَادِسُهُمْ (المجادلة:7)"],
        meaning: "الصلوات الخمس - أركان الإسلام",
        action: "قرار المحافظة على العبادات الخمس",
        wisdom: "الخمسة عبادة - صلِّ وتقرّب",
        icon: "🕌",
      },
      6: {
        verses: ["إِنَّ رَبَّكُمُ اللَّهُ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ فِي سِتَّةِ أَيَّامٍ (الأعراف:54)"],
        meaning: "الخلق المتقن - الإبداع المنظم",
        action: "قرار الإبداع والخلق المنظم",
        wisdom: "الستة إبداع - أبدع في عملك",
        icon: "🌍",
      },
      7: {
        verses: ["سَبْعَ سَمَاوَاتٍ طِبَاقًا (الملك:3)", "ثُمَّ اسْتَوَىٰ إِلَى السَّمَاءِ فَسَوَّاهُنَّ سَبْعَ سَمَاوَاتٍ (البقرة:29)"],
        meaning: "الكمال الروحي - السماوات السبع",
        action: "قرار الارتقاء الروحي للسماء السابعة",
        wisdom: "السبعة كمال - ارتقِ للأعلى",
        icon: "🌌",
      },
      8: {
        verses: ["وَيَحْمِلُ عَرْشَ رَبِّكَ فَوْقَهُمْ يَوْمَئِذٍ ثَمَانِيَةٌ (الحاقة:17)"],
        meaning: "حملة العرش الثمانية - القوة العظمى",
        action: "قرار القوة والثبات الإيماني",
        wisdom: "الثمانية قوة - تقوَّ بالإيمان",
        icon: "👼",
      },
      9: {
        verses: ["وَكَانَ فِي الْمَدِينَةِ تِسْعَةُ رَهْطٍ يُفْسِدُونَ فِي الْأَرْضِ (النمل:48)"],
        meaning: "الإتمام والكمال - النهاية قبل البداية",
        action: "قرار إتمام المشاريع المعلقة",
        wisdom: "التسعة إتمام - أكمل ما بدأت",
        icon: "✅",
      },
      10: {
        verses: ["تِلْكَ عَشَرَةٌ كَامِلَةٌ (البقرة:196)", "مَن جَاءَ بِالْحَسَنَةِ فَلَهُ عَشْرُ أَمْثَالِهَا (الأنعام:160)"],
        meaning: "الكمال والمضاعفة - العشرة الكاملة",
        action: "قرار فعل الخير للمضاعفة × 10",
        wisdom: "العشرة مضاعفة - افعل الخير يتضاعف",
        icon: "🌟",
      },
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
    allNumbers.forEach((num) => {
      if (versesDB[num] && !meanings.find((m) => m.num === num)) {
        const data = versesDB[num];
        meanings.push({
          num: num,
          title: data.meaning,
          verse: data.verses[0],
          icon: data.icon,
          details: data.wisdom,
          action: data.action,
          allVerses: data.verses,
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
    meanings.forEach((meaning) => {
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
      decisions.unshift("🌟 وقت استثنائي - اطلب المستحيل!");
    } else if (power >= 10) {
      decisions.unshift("👑 وقت مثالي - اتخذ قرارات كبرى");
    } else if (power >= 6) {
      decisions.unshift("⚡ وقت قوي - استغله جيداً");
    }

    // إزالة التكرارات والحد من العدد
    const uniqueDecisions = [...new Set(decisions)];
    return uniqueDecisions.slice(0, 10);
  };

  const getRecommendations = (h, m, power, reasons) => {
    // قاعدة بيانات التوصيات المرتبطة بالأرقام القرآنية
    const quranicRecommendations = {
      // رقم 1 - التوحيد
      1: {
        type: "عبادة روحانية",
        actions: ["🤲 دعاء التوحيد والإخلاص", "📖 قراءة سورة الإخلاص", "🕌 صلاة نافلة بخشوع", "💭 التفكر في وحدانية الله", "🎯 التركيز على هدف واحد مهم"],
      },
      // رقم 2 - التوازن
      2: {
        type: "توازن وتدبر",
        actions: ["⚖️ إعادة التوازن بين الأعمال", "🤲 التوكل على الله", "📖 قراءة قرآن بتدبر", "📝 مراجعة الأولويات", "💼 عمل متوازن بين دنيا وآخرة"],
      },
      // رقم 3 - الصبر (Tesla)
      3: {
        type: "صبر وثبات",
        actions: ["💪 الصبر على الابتلاء", "⛰️ الثبات على الحق", "🤲 دعاء الفرج والتيسير", "💼 عمل مهم يحتاج صبر", "📖 قراءة آيات الصبر"],
      },
      // رقم 6 - التأني (Tesla)
      6: {
        type: "حكمة وتأني",
        actions: ["⏳ التأني في اتخاذ القرارات", "🤲 الدعاء بالتوفيق والسداد", "💭 التفكر في حكمة التوقيت", "📝 تأجيل القرارات المستعجلة", "🎯 التخطيط طويل المدى"],
      },
      // رقم 7 - البركة ⭐
      7: {
        type: "وقت مبارك",
        actions: ["🌟 دعاء مهم - وقت مبارك!", "📖 قراءة قرآن بخشوع", "🕌 صلاة نافلة مباركة", "💼 عمل مثمر ومبارك", "🌙 ذكر الله والاستغفار"],
      },
      // رقم 9 - الحذر (Tesla)
      9: {
        type: "حذر وتوبة",
        actions: ["⚠️ الابتعاد عن المعاصي", "🤲 الاستعاذة بالله من الشر", "📝 مراجعة الأعمال والنوايا", "💚 التوبة والاستغفار", "✨ عمل صالح يمحو السيئات"],
      },
      // رقم 11 - البشارة
      11: {
        type: "بشائر وأمل",
        actions: ["⭐ الانتباه للإشارات الإيجابية", "💭 التفكر في البشائر", "🤲 دعاء تحقيق الأحلام", "📝 تخطيط مستقبلي واعد", "🎯 كتابة الأهداف والطموحات"],
      },
      // رقم 12 - التنظيم
      12: {
        type: "تنظيم ودقة",
        actions: ["📅 التخطيط الدقيق", "⏰ تنظيم الوقت بحكمة", "✅ الالتزام بالمواعيد", "📝 مراجعة الجدول اليومي", "🎯 تحديد أولويات العمل"],
      },
      // رقم 19 - التحذير
      19: {
        type: "استعاذة ومغفرة",
        actions: ["🔥 الاستعاذة من النار", "💚 التوبة الصادقة", "📖 قراءة آيات الرحمة", "🤲 الدعاء بالمغفرة", "✨ عمل صالح يثقل الميزان"],
      },
    };

    // استخراج الأرقام من الوقت
    const numbers = [h, m];

    if (h > 9) {
      numbers.push(Math.floor(h / 10), h % 10);
    }
    if (m > 9) {
      numbers.push(Math.floor(m / 10), m % 10);
    }

    // إضافة الأرقام المختزلة
    const hReduced =
      h > 9
        ? String(h)
            .split("")
            .reduce((a, b) => parseInt(a) + parseInt(b), 0)
        : h;
    const mReduced =
      m > 9
        ? String(m)
            .split("")
            .reduce((a, b) => parseInt(a) + parseInt(b), 0)
        : m;
    numbers.push(hReduced, mReduced);

    // مجموع الساعة والدقيقة
    const sum = h + m;
    numbers.push(sum);

    // التحقق من وجود أرقام خاصة
    const has7 = numbers.includes(7) || String(h).includes("7") || String(m).includes("7");
    const hasTesla = numbers.some((n) => [3, 6, 9].includes(n));
    const has11 = h === m; // مثل 11:11, 14:14

    // اختيار أفضل مجموعة توصيات
    let selectedRec = null;
    let priority = 0;

    // ترتيب الأولوية
    const priorityOrder = {
      7: 10, // أعلى أولوية
      11: 9,
      3: 8,
      6: 8,
      9: 8,
      19: 7,
      12: 6,
      2: 5,
      1: 5,
    };

    for (const num of numbers) {
      if (quranicRecommendations[num]) {
        const currentPriority = priorityOrder[num] || 1;

        if (currentPriority > priority) {
          selectedRec = quranicRecommendations[num];
          priority = currentPriority;
        }
      }
    }

    // إذا كان الوقت يحتوي على 11:11 أو أرقام متماثلة
    if (has11 && quranicRecommendations[11]) {
      selectedRec = quranicRecommendations[11];
      priority = 9;
    }

    // إذا لم نجد توصيات قرآنية محددة، نستخدم توصيات عامة بناءً على القوة
    if (!selectedRec) {
      if (power >= 10) {
        // وقت قوي جداً
        selectedRec = {
          type: "وقت قوي",
          actions: ["🌟 دعاء مهم", "📖 قراءة قرآن", "💼 عمل مثمر", "📝 تخطيط دقيق", "🎯 إنجاز هدف"],
        };
      } else if (power >= 6) {
        // وقت جيد
        selectedRec = {
          type: "وقت جيد",
          actions: ["🕌 عبادة خاصة", "💼 عمل مهم", "📚 دراسة وتعلم", "💬 تواصل فعال", "🧘 راحة مفيدة"],
        };
      } else {
        // وقت عادي
        selectedRec = {
          type: "وقت عادي",
          actions: ["🌙 ذكر الله", "📖 قراءة نافعة", "✅ عمل خفيف", "📝 تنظيم أمور", "💭 تأمل وتفكر"],
        };
      }
    }

    // إرجاع التوصيات
    return {
      actionType: selectedRec.type,
      recommendations: selectedRec.actions,
      hasBlessedNumber: has7,
      hasTesla: hasTesla,
      has11: has11,
    };
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
      reasons.push("☝️ الواحد الأحد");
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
      reasons.push("📖 الأربعة");
    }

    if (h === 5 || m === 5 || total === 5 || hReduced === 5 || mReduced === 5 || totalReduced === 5) {
      power += 3;
      reasons.push("🕌 الخمسة");
    }

    if (total === 7 || totalReduced === 7 || h === 7 || m === 7) {
      power += 2;
      reasons.push("📖 السبع");
    }

    if (h === 8 || m === 8 || total === 8 || hReduced === 8 || mReduced === 8 || totalReduced === 8) {
      power += 2;
      reasons.push("👼 الثمانية");
    }

    if (total === 12 || total % 12 === 0 || h === 12 || m === 12) {
      power += 3;
      reasons.push("📖 الاثنا عشر");
    }

    if (total === 19 || h === 19 || m === 19) {
      power += 4;
      reasons.push("👑 التسعة عشر");
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
      actionType: recs.actionType,
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
            minutesUntil,
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
      month: month,
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
      quran: [7, 1, 9, 5].includes(reduceToSingle(h + m)),
    };
  };

  const getQuranStats = () => {
    return {
      basics: [
        { label: "حروف القرآن", value: "323,671", icon: "✍️", detail: "حرف" },
        { label: "كلمات القرآن", value: "77,439", icon: "📝", detail: "كلمة" },
        { label: "آيات القرآن", value: "6,236", icon: "📖", detail: "آية → 8" },
        { label: "سور القرآن", value: "114", icon: "📚", detail: "سورة" },
      ],
      surahs: [
        { label: "سور مكية", value: "86", icon: "🕋" },
        { label: "سور مدنية", value: "28", icon: "🕌" },
        { label: "سجدات التلاوة", value: "15", icon: "🤲" },
      ],
      wordsBalance: [
        { label: "الدنيا", value: "115", pair: "الآخرة", icon: "🌍" },
        { label: "الآخرة", value: "115", pair: "الدنيا", icon: "✨" },
        { label: "الليل", value: "74", pair: "", icon: "🌙" },
        { label: "النهار", value: "54", pair: "", icon: "☀️" },
      ],
    };
  };

  // Get all available numbers from database
  const getAvailableNumbers = () => {
    return Object.keys(quranicNumbersDatabase).sort((a, b) => {
      // Sort numeric keys first, then text keys
      const aIsNum = !isNaN(a);
      const bIsNum = !isNaN(b);
      if (aIsNum && bIsNum) return Number(a) - Number(b);
      if (aIsNum) return -1;
      if (bIsNum) return 1;
      return a.localeCompare(b);
    });
  };

  // Handle number selection change
  useEffect(() => {
    if (selectedNumber) {
      const info = getNumberInfo(selectedNumber);
      if (info) {
        setSelectedNumberInfo({
          number: selectedNumber,
          ...info,
          energy: calculateNumberEnergy(Number(selectedNumber) || 0)
        });
      } else {
        setSelectedNumberInfo(null);
      }
    } else {
      setSelectedNumberInfo(null);
    }
  }, [selectedNumber]);

  useEffect(() => {
    const h = currentTime.getHours();
    const m = currentTime.getMinutes();
    
    // If a number is selected, modify calculations to incorporate it
    let modifiedAnalysis = calculateFullPower(h, m);
    
    if (selectedNumber && selectedNumberInfo) {
      // Modify analysis based on selected number
      const numValue = Number(selectedNumber) || 0;
      const numReduced = reduceToSingle(numValue);
      
      // Add energy from selected number
      if (selectedNumberInfo.energy) {
        const energyLevel = selectedNumberInfo.energy.level;
        if (energyLevel === 'very_high' || energyLevel === 'divine') {
          modifiedAnalysis.power += 5;
          modifiedAnalysis.reasons.push(`🌟 رقم مختار: ${selectedNumber} (${selectedNumberInfo.significance})`);
        } else if (energyLevel === 'blessed' || energyLevel === 'high') {
          modifiedAnalysis.power += 3;
          modifiedAnalysis.reasons.push(`✨ رقم مختار: ${selectedNumber} (${selectedNumberInfo.significance})`);
        } else {
          modifiedAnalysis.power += 1;
          modifiedAnalysis.reasons.push(`📖 رقم مختار: ${selectedNumber}`);
        }
      }
      
      // Check if selected number is Tesla number
      if ([3, 6, 9].includes(numReduced) || [3, 6, 9].includes(numValue)) {
        modifiedAnalysis.power += 2;
        modifiedAnalysis.reasons.push(`⚡ رقم تسلا: ${selectedNumber}`);
      }
      
      // Check if selected number is 7 (blessed)
      if (numValue === 7 || numReduced === 7) {
        modifiedAnalysis.power += 3;
        modifiedAnalysis.reasons.push(`✨ رقم مبارك: ${selectedNumber}`);
      }
      
      // Update isPerfect and isSuper flags
      modifiedAnalysis.isPerfect = modifiedAnalysis.power >= 10;
      modifiedAnalysis.isSuper = modifiedAnalysis.power >= 15;
    }
    
    setAnalysis(modifiedAnalysis);
    setNextPowerTimes(findNextPowerTimes());
    setCycles(calculateCycles());
    setQuranMiracles(calculateQuranMiracles());
    setTesla369Times(findNext369Times());
    setQuranNumbers(getQuranStats());

    // جلب مواقيت الصلاة الحية (مع الأخذ في الاعتبار الرقم المختار)
    calculatePrayerTimes(selectedNumber, selectedNumberInfo)
      .then((prayers) => {
        setPrayerTimes(prayers);
      })
      .catch((error) => {
        console.error("Error setting prayer times:", error);
      });
  }, [currentTime, selectedNumber, selectedNumberInfo]);

  const formatTime = (h, m) => {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const getPowerColor = (power, isSuper) => {
    if (isSuper) return "from-yellow-400 via-orange-400 to-red-500";
    if (power >= 10) return "from-yellow-500 to-orange-500";
    if (power >= 6) return "from-purple-500 to-pink-500";
    if (power >= 3) return "from-blue-500 to-cyan-500";
    return "from-gray-500 to-slate-500";
  };

  const getPowerBorder = (power, isSuper) => {
    if (isSuper) return "border-yellow-300 shadow-yellow-500/70 shadow-lg";
    if (power >= 10) return "border-yellow-400 shadow-yellow-500/50";
    if (power >= 6) return "border-purple-400 shadow-purple-500/50";
    if (power >= 3) return "border-blue-400 shadow-blue-500/50";
    return "border-gray-400";
  };

  const h = currentTime.getHours();
  const m = currentTime.getMinutes();
  const total = h + m;
  let meanings = getQuranMeaning(h, m, total);
  let decisions = getDecisions(meanings, h, m, analysis.power);
  
  // If a number is selected, add its meanings to the existing ones
  if (selectedNumber && selectedNumberInfo && selectedNumberInfo.verses) {
    const selectedMeanings = selectedNumberInfo.verses.slice(0, 2).map((verse, idx) => ({
      num: selectedNumber,
      title: selectedNumberInfo.significance,
      verse: `${verse.text} (${verse.surah}:${verse.ayah})`,
      icon: "⭐",
      details: verse.meaning,
      action: verse.action,
      allVerses: [verse.text]
    }));
    meanings = [...selectedMeanings, ...meanings];
    
    // Add decisions based on selected number
    const selectedDecisions = [
      `⭐ ${selectedNumberInfo.generalAdvice}`,
      ...selectedNumberInfo.verses.slice(0, 2).map(v => `📖 ${v.action}: ${v.recommendation}`)
    ];
    decisions = [...selectedDecisions, ...decisions].slice(0, 10);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">النظام المتين الكامل</h1>
          <p className="text-purple-300 text-sm md:text-base">﴿وَلِتَعْلَمُوا عَدَدَ السِّنِينَ وَالْحِسَابَ﴾</p>
          <p className="text-blue-300 text-xs md:text-sm mt-1">الإعجاز العددي القرآني × نظرية تسلا 3-6-9</p>
        </div>

        {/* Number Selection Dropdown */}
        <div className="mb-6 bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-lg rounded-2xl p-4 md:p-6 border-2 border-purple-400/50">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <label htmlFor="number-select" className="block text-lg font-bold text-purple-300 mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                اختر رقم من قاعدة البيانات القرآنية:
              </label>
              <div className="relative w-full md:w-auto min-w-[200px]">
                <select
                  id="number-select"
                  value={selectedNumber || ""}
                  onChange={(e) => setSelectedNumber(e.target.value || null)}
                  className="w-full bg-slate-800 text-white border-2 border-purple-400/50 rounded-lg px-4 py-3 pr-10 text-lg font-semibold focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 cursor-pointer appearance-none"
                >
                <option value="">-- اختر رقم --</option>
                {getAvailableNumbers().map((num) => {
                  const info = getNumberInfo(num);
                  const displayName = info ? `${num} - ${info.significance}` : num;
                  return (
                    <option key={num} value={num}>
                      {displayName}
                    </option>
                  );
                })}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              {selectedNumber && (
                <button
                  onClick={() => setSelectedNumber(null)}
                  className="mt-2 md:mt-0 md:mr-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  إلغاء الاختيار
                </button>
              )}
            </div>
          </div>

          {/* Display Selected Number Info */}
          {selectedNumberInfo && (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-800/30 to-blue-800/30 rounded-lg border border-purple-400/30">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-yellow-300 flex items-center gap-2">
                  <Star className="w-6 h-6" />
                  معلومات الرقم المختار: {selectedNumber}
                </h3>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  selectedNumberInfo.energy?.level === 'very_high' || selectedNumberInfo.energy?.level === 'divine' 
                    ? 'bg-yellow-500/30 text-yellow-300' 
                    : selectedNumberInfo.energy?.level === 'blessed' || selectedNumberInfo.energy?.level === 'high'
                    ? 'bg-green-500/30 text-green-300'
                    : 'bg-blue-500/30 text-blue-300'
                }`}>
                  {selectedNumberInfo.energy?.description || 'طاقة متوازنة'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-purple-200">
                  <span className="font-bold text-purple-300">الدلالة:</span> {selectedNumberInfo.significance}
                </div>
                <div className="text-blue-200">
                  <span className="font-bold text-blue-300">النصيحة العامة:</span> {selectedNumberInfo.generalAdvice}
                </div>
                
                {selectedNumberInfo.verses && selectedNumberInfo.verses.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-bold text-purple-300 mb-2">الآيات المرتبطة:</div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedNumberInfo.verses.slice(0, 3).map((verse, idx) => (
                        <div key={idx} className="bg-purple-900/30 p-3 rounded-lg border border-purple-400/20">
                          <div className="text-sm text-purple-200 mb-1">
                            <span className="font-bold">{verse.surah}</span> - آية {verse.ayah}
                          </div>
                          <div className="text-base text-white font-arabic leading-relaxed mb-2">
                            {verse.text}
                          </div>
                          <div className="text-xs text-purple-300 mb-1">
                            <span className="font-bold">المعنى:</span> {verse.meaning}
                          </div>
                          <div className="text-xs text-blue-300">
                            <span className="font-bold">التوصية:</span> {verse.recommendation}
                          </div>
                          <div className="mt-2">
                            <span className="inline-block px-2 py-1 bg-cyan-900/50 text-cyan-200 rounded text-xs font-semibold">
                              {verse.action}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Current Time */}
            <div className={`bg-gradient-to-br ${getPowerColor(analysis.power, analysis.isSuper)} p-1 rounded-2xl ${analysis.isSuper ? "animate-pulse" : ""}`}>
              <div className="bg-slate-900/90 backdrop-blur-lg rounded-2xl p-4 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <Clock className="text-yellow-400" size={28} />
                  <h2 className="text-xl md:text-2xl font-bold">الوقت الحالي</h2>
                </div>

                <div className="text-center">
                  <div className="text-5xl md:text-7xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">{formatTime(h, m)}</div>

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
                    <div className="text-xl font-bold mb-2">{analysis.isSuper ? "🌟 استثنائي" : analysis.isPerfect ? "👑 مثالي" : `⚡ قوة: ${analysis.power}`}</div>
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

                  {/* What to Do Now - Enhanced Dynamic Version */}
                  {analysis.recommendations && analysis.recommendations.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {/* العنوان الرئيسي */}
                      <div className="p-4 rounded-lg bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-2 border-green-400/50">
                        {/* الربط بالآيات القرآنية - الجزء الجديد */}
                        <WhatToDoNow selectedNumber={selectedNumber} selectedNumberInfo={selectedNumberInfo} />
                      </div>
                    </div>
                  )}
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
                  <div key={i} className={`p-3 rounded-lg border ${getPowerBorder(time.power, time.isSuper)} bg-slate-900/50`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-lg font-bold text-yellow-400">{formatTime(time.hour, time.minute)}</div>
                        <div className="text-xs text-gray-400">
                          بعد {time.hoursUntil > 0 && `${time.hoursUntil}س `}
                          {time.minutesUntil}د
                        </div>
                      </div>
                      <div className="text-sm font-bold text-yellow-300">{time.isSuper ? "🌟" : time.isPerfect ? "👑" : `⚡${time.power}`}</div>
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

            {/* Quranic Meanings */}
            {meanings.length > 0 && (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-blue-500/20">
                <div className="flex items-center justify-between mb-3">
                  <BookOpen className="text-blue-400" size={20} />
                  <h2 className="text-lg font-bold">📖 الدلالة القرآنية للوقت</h2>
                </div>

                <div className="space-y-3 max-h-[470px] overflow-y-auto">
                  {meanings.map((meaning, i) => (
                    <div key={i} className="p-3 bg-blue-900/30 rounded-lg border border-blue-300/30">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-2xl">{meaning.icon}</span>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-yellow-300 mb-1">
                            {meaning.num} - {meaning.title}
                          </div>
                          <div className="text-xs text-blue-200 italic mb-2 leading-relaxed">"{meaning.verse}"</div>
                          {meaning.details && <div className="text-xs text-gray-300 mb-2 bg-blue-900/30 rounded p-2">💡 {meaning.details}</div>}
                          {meaning.action && (
                            <div className="text-xs text-cyan-200 bg-cyan-900/30 rounded p-2 border border-cyan-400/30">
                              🎯 <span className="font-bold">{meaning.action}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {decisions.length > 0 && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 rounded-lg border border-cyan-400/50">
                      <div className="text-sm font-bold text-cyan-300 mb-2 flex items-center gap-2">
                        <span className="text-xl">🎯</span>
                        قرارات مستوحاة من الآيات:
                      </div>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {decisions.map((decision, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-xs bg-cyan-900/30 rounded p-2 border border-cyan-400/20 hover:bg-cyan-900/50 transition-colors cursor-pointer"
                          >
                            <span className="text-cyan-400 font-bold min-w-[20px]">{i + 1}.</span>
                            <span className="text-gray-200 flex-1">{decision}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🕌 قسم مواعيد الصلاة وأفضل أوقات الإقامة */}
        {prayerTimes && Object.keys(prayerTimes).length > 0 && (
          <div className="mt-6 bg-gradient-to-br from-green-900/30 via-teal-900/30 to-emerald-900/30 rounded-2xl p-6 border-2 border-green-400/50 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent">
                🕌 مواعيد الصلاة وأفضل أوقات الإقامة
              </h2>
              <p className="text-green-200 text-sm mb-3">﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا﴾</p>

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
                        <div className="text-xs text-blue-200">
                          {prayerTimes.location.hijri} {prayerTimes.location.hijriMonth}
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-blue-300 font-bold">🕋 طريقة الحساب</div>
                      <div className="text-blue-100 text-xs">{prayerTimes.location.method}</div>
                      <div className="text-xs text-green-300 mt-1">⚡ مواقيت حية من API</div>
                    </div>
                  </div>
                  {prayerTimes.location.error && <div className="mt-2 text-xs text-yellow-300 text-center">⚠️ {prayerTimes.location.error}</div>}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(prayerTimes)
                .filter(([key]) => key !== "sunrise" && key !== "location") // إخفاء الشروق والموقع
                .map(([key, prayer]) => {
                  const analysis = analyzePrayerNumbers(prayer);
                  const [h, m] = prayer.time;

                  return (
                    <div
                      key={key}
                      className="bg-gradient-to-br from-green-800/40 to-teal-800/40 rounded-xl p-4 border border-green-400/30 hover:border-green-300/60 transition-all"
                    >
                      {/* اسم الصلاة */}
                      <div className="text-center mb-3">
                        <div className="text-3xl mb-2">{prayer.icon}</div>
                        <h3 className="text-2xl font-bold text-green-200">{prayer.name}</h3>
                        <div className="text-4xl font-bold text-green-100 my-2">
                          {h.toString().padStart(2, "0")}:{m.toString().padStart(2, "0")}
                        </div>
                      </div>

                      {/* الأرقام والطاقة */}
                      <div className="mb-4 p-3 bg-green-950/50 rounded-lg border border-green-500/30">
                        <div className="text-sm text-green-200 mb-2 font-bold">🔢 تحليل الأرقام:</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="text-green-300">الساعة</div>
                            <div className="font-bold text-green-100">
                              {h} → {prayer.numbers.hReduced}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-green-300">الدقيقة</div>
                            <div className="font-bold text-green-100">
                              {m} → {prayer.numbers.mReduced}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-green-300">المجموع</div>
                            <div className="font-bold text-green-100">
                              {prayer.numbers.total} → {prayer.numbers.totalReduced}
                            </div>
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

                      {/* أفضل أوقات الإقامة مع رقم 7 أو الرقم المختار */}
                      {prayer.iqama && prayer.iqama.length > 0 && (
                        <div className="p-3 bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-lg border border-yellow-400/50">
                          <div className="text-sm font-bold text-yellow-200 mb-3 text-center">
                            ⭐ أفضل أوقات الإقامة
                            {selectedNumber && selectedNumberInfo && (
                              <span className="block text-xs text-yellow-300 mt-1">
                                (رقم {selectedNumber} ظاهر)
                              </span>
                            )}
                            {!selectedNumber && (
                              <span className="block text-xs text-yellow-300 mt-1">(رقم 7 ظاهر)</span>
                            )}
                          </div>
                          <div className="space-y-2 max-h-80 overflow-y-auto">
                            {prayer.iqama.slice(0, 5).map((iqama, idx) => (
                              <div key={idx} className={`p-2 rounded-lg border ${
                                iqama.hasSelectedNumber 
                                  ? "bg-gradient-to-r from-purple-900/60 to-pink-900/60 border-purple-400/70 ring-2 ring-purple-300/50" 
                                  : iqama.has7 
                                  ? "bg-yellow-900/50 border-yellow-400/60" 
                                  : "bg-green-900/30 border-green-400/30"
                              }`}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className={`font-bold ${
                                    iqama.hasSelectedNumber ? "text-purple-100" : "text-yellow-100"
                                  }`}>
                                    {iqama.hour.toString().padStart(2, "0")}:{iqama.minute.toString().padStart(2, "0")}
                                  </span>
                                  <span className="text-xs text-yellow-200">بعد {iqama.afterAdhan} دقيقة</span>
                                </div>

                                {(iqama.has7 || iqama.hasSelectedNumber) && (
                                  <div className="text-xs mb-1">
                                    <span className={`font-bold ${
                                      iqama.hasSelectedNumber ? "text-purple-300" : "text-yellow-300"
                                    }`}>
                                      {iqama.hasSelectedNumber && "⭐ "}
                                      {iqama.has7 && "🎯 "}
                                      {iqama.reasons}
                                    </span>
                                  </div>
                                )}

                                <div className="text-xs text-green-200">
                                  {iqama.hReduced === 7 && <span className="mr-1">✨ س→7</span>}
                                  {iqama.mReduced === 7 && <span className="mr-1">✨ د→7</span>}
                                  {iqama.totalReduced === 7 && <span className="mr-1">✨ ج→7</span>}
                                  {iqama.hasSelectedNumber && iqama.selectedNumber && (
                                    <span className="mr-1">⭐ رقم مختار: {iqama.selectedNumber}</span>
                                  )}
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
              <p className="text-xs text-green-400 mb-2">يستخدم النظام موقعك (GPS) لتحديد المواقيت الدقيقة. إذا لم يتوفر الموقع، يستخدم الرياض كموقع افتراضي</p>
              <p className="text-xs text-green-400">رقم 7 له دلالة عميقة: السماوات السبع، أيام الأسبوع، الطواف سبعاً، السعي سبعاً</p>
              <p className="text-xs text-yellow-300 mt-2">⭐ الأوقات المميزة بالأصفر تحتوي على رقم 7 بشكل ظاهر أو مختزل - أوقات مباركة للإقامة!</p>
              <p className="text-xs text-blue-300 mt-2">🔄 يتم تحديث المواقيت تلقائياً كل دقيقة</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedSystemComplete;
