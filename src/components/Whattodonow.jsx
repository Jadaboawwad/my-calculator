import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Star, TrendingUp, Lightbulb, AlertCircle, BookOpen, Sparkles, Zap, Pin, PinOff, ChevronDown, ChevronUp, ExternalLink, Calculator } from 'lucide-react';
import { getNumberInfo, getNearestNumberInfo, calculateNumberEnergy } from './../../Quranicnumbersdatabase';
import { analyzeVerseKitabMarqum, getSurahMuqattaatInfo, jumalStandard, sequentialOrder, reduceToSingleDigit } from './../../KitabMarqumSystem';

const WhatToDoNow = ({ selectedNumber, selectedNumberInfo }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pulseEffect, setPulseEffect] = useState(false);
  const [lastSignificantChange, setLastSignificantChange] = useState(null);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [verseLoading, setVerseLoading] = useState(false);
  const [pinnedVerse, setPinnedVerse] = useState(null); // الآية المثبتة
  const [tafseer, setTafseer] = useState(null); // التفسير
  const [tafseerLoading, setTafseerLoading] = useState(false);
  const [showTafseer, setShowTafseer] = useState(false); // إظهار/إخفاء التفسير
  const [kitabMarqumAnalysis, setKitabMarqumAnalysis] = useState(null); // تحليل كتاب مرقوم
  
  // حالات التنبيه
  const [alerts, setAlerts] = useState({
    teslaChange: false,
    blessedChange: false,
    majorNumberChange: false
  });
  
  // إشعارات التطابق الرقمي
  const [numericMatchAlert, setNumericMatchAlert] = useState(null);

  // ===== نظام التحديث الذكي متعدد المستويات =====
  
  // المستوى 1: تحديث العرض كل ثانية (للساعة فقط)
  useEffect(() => {
    const displayTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(displayTimer);
  }, []);

  // المستوى 2: تحليل سريع كل 4 ثواني (للتغييرات الصغيرة)
  useEffect(() => {
    const quickAnalysisTimer = setInterval(() => {
      quickAnalysis(new Date());
    }, 4000);
    
    return () => clearInterval(quickAnalysisTimer);
  }, []);

  // المستوى 3: تحليل عميق عند تغيير الدقيقة (التغييرات الجوهرية)
  useEffect(() => {
    const deepAnalysisTimer = setInterval(() => {
      const now = new Date();
      if (now.getSeconds() === 0 || !analysis) {
        deepAnalysis(now);
        setPulseEffect(true);
        setTimeout(() => setPulseEffect(false), 1000);
      }
    }, 1000);
    
    return () => clearInterval(deepAnalysisTimer);
  }, [analysis]);

  // تحليل عند التحميل الأول
  useEffect(() => {
    deepAnalysis(new Date());
  }, []);

  // ===== دوال التحليل =====

  // حساب رقم الآية بناءً على النظام 19 والوقت والطاقة والرقم المختار والجُمَّل
  const calculateVerseNumber = (
    hours,
    minutes,
    seconds,
    teslaScore,
    blessedScore,
    recommendations,
    gregorianDate,
    hijriDate,
    selectedNumber = null,
    selectedNumberInfo = null,
    previousMarqumAnalysis = null // تحليل كتاب مرقوم من الآية السابقة
  ) => {
    const TOTAL_VERSES = 6236; // إجمالي آيات القرآن
    const MAGIC_NUMBER = 19; // الرقم 19 المقدس
    
    // حساب الأساس من الوقت (باستخدام عدة عوامل)
    const timeInSeconds = (hours * 3600) + (minutes * 60) + seconds;
    const timeInMinutes = (hours * 60) + minutes;
    const timeProduct = hours * minutes * seconds;
    
    // حساب عامل من طاقة تسلا (مضاعف قوي باستخدام 19)
    const teslaFactor = teslaScore * MAGIC_NUMBER * (teslaScore > 0 ? 2 : 1);
    
    // حساب عامل من البركة (مضاعف باستخدام 7)
    const blessedFactor = blessedScore * 7 * (blessedScore > 0 ? 3 : 1);
    
    // حساب عامل من التوصيات (استخدام أرقام التوصيات والأولوية)
    let recommendationsFactor = 0;
    if (recommendations && recommendations.length > 0) {
      recommendations.forEach(rec => {
        const priorityWeight = rec.priority || 1;
        recommendationsFactor += rec.number * priorityWeight * MAGIC_NUMBER;
      });
    }
    
    // حساب عامل من الرقم المختار (إذا كان موجوداً)
    let selectedNumberFactor = 0;
    if (selectedNumber && selectedNumberInfo) {
      const numValue = Number(selectedNumber) || 0;
      
      // إذا كان الرقم المختار موجوداً في قاعدة البيانات
      if (selectedNumberInfo.verses && selectedNumberInfo.verses.length > 0) {
        // استخدام عدد الآيات المرتبطة بالرقم
        const versesCount = selectedNumberInfo.verses.length;
        selectedNumberFactor = numValue * versesCount * MAGIC_NUMBER;
        
        // إضافة عامل من الطاقة إذا كانت عالية
        if (selectedNumberInfo.energy) {
          const energyLevel = selectedNumberInfo.energy.level;
          if (energyLevel === 'very_high' || energyLevel === 'divine') {
            selectedNumberFactor += numValue * MAGIC_NUMBER * 3;
          } else if (energyLevel === 'blessed' || energyLevel === 'high') {
            selectedNumberFactor += numValue * MAGIC_NUMBER * 2;
          } else {
            selectedNumberFactor += numValue * MAGIC_NUMBER;
          }
        }
        
        // إذا كان الرقم من أرقام تسلا (3، 6، 9)
        const numReduced = numValue > 9 ? numValue % 10 : numValue;
        if ([3, 6, 9].includes(numReduced) || [3, 6, 9].includes(numValue)) {
          selectedNumberFactor += numValue * MAGIC_NUMBER * 2;
        }
        
        // إذا كان الرقم 7 (مبارك)
        if (numValue === 7 || numReduced === 7) {
          selectedNumberFactor += numValue * 7 * 3;
        }
      } else {
        // إذا لم يكن موجوداً في قاعدة البيانات، استخدم القيمة مباشرة
        selectedNumberFactor = numValue * MAGIC_NUMBER;
      }
    }
    
    // حساب عوامل إضافية من الوقت
    const hourMinuteSum = hours + minutes;
    const minuteSecondSum = minutes + seconds;
    const totalTimeSum = hours + minutes + seconds;
    
    // حساب عوامل التاريخ (ميلادي وهجري)
    const { year: gYear = 0, month: gMonth = 0, day: gDay = 0 } = gregorianDate || {};
    const { year: hYear = 0, month: hMonth = 0, day: hDay = 0 } = hijriDate || {};
    
    const gregorianSum = gYear + gMonth + gDay;
    const hijriSum = hYear + hMonth + hDay;
    const dateDifference = Math.abs(gYear - hYear);
    
    const gregorianFactor = (gregorianSum * MAGIC_NUMBER) + ((gYear % 100) * 7);
    const hijriFactor = (hijriSum * 7 * 2) + ((hYear % 100) * MAGIC_NUMBER);
    const dateProduct = (Math.max(gDay, 1) * Math.max(hDay, 1) * MAGIC_NUMBER);
    const combinedDateFactor = gregorianFactor + hijriFactor + (dateDifference * 11);
    
    // === حساب عوامل الجُمَّل من الآية السابقة ===
    let jumalClassicalFactor = 0;
    let jumalSequentialFactor = 0;
    let jumalReducedFactor = 0;
    let sequentialReducedFactor = 0;
    let muqattaatFactor = 0;
    
    if (previousMarqumAnalysis && previousMarqumAnalysis.verseAnalysis) {
      const verseAnalysis = previousMarqumAnalysis.verseAnalysis;
      
      // الجُمَّل الكلاسيكي
      if (verseAnalysis.totalJumal > 0) {
        jumalClassicalFactor = verseAnalysis.totalJumal * MAGIC_NUMBER;
        jumalReducedFactor = verseAnalysis.reducedJumal * MAGIC_NUMBER * 2;
      }
      
      // الجُمَّل الترتيبي
      if (verseAnalysis.totalSequential > 0) {
        jumalSequentialFactor = verseAnalysis.totalSequential * MAGIC_NUMBER;
        sequentialReducedFactor = verseAnalysis.reducedSequential * MAGIC_NUMBER * 2;
      }
      
      // الحروف المقطعة (إذا كانت موجودة)
      if (previousMarqumAnalysis.muqattaatAnalysis && 
          previousMarqumAnalysis.muqattaatAnalysis.analysis) {
        const muqattaatAnalysis = previousMarqumAnalysis.muqattaatAnalysis.analysis;
        if (muqattaatAnalysis.totalJumal > 0) {
          muqattaatFactor = muqattaatAnalysis.totalJumal * MAGIC_NUMBER * 3;
        }
      }
    }
    
    // === حساب عوامل عجيبة 19 ===
    // استخدام 19 بطرق متعددة
    const miracle19Factor1 = MAGIC_NUMBER * MAGIC_NUMBER; // 19² = 361
    const miracle19Factor2 = reduceToSingleDigit(MAGIC_NUMBER * hours); // اختزال 19 × الساعة
    const miracle19Factor3 = reduceToSingleDigit(MAGIC_NUMBER * minutes); // اختزال 19 × الدقيقة
    const miracle19Factor4 = (MAGIC_NUMBER * gDay) % 100; // 19 × اليوم الميلادي
    const miracle19Factor5 = (MAGIC_NUMBER * hDay) % 100; // 19 × اليوم الهجري
    const miracle19Factor6 = reduceToSingleDigit(MAGIC_NUMBER * (gYear % 100)); // اختزال 19 × آخر رقمين من السنة
    const miracle19Factor7 = reduceToSingleDigit(MAGIC_NUMBER * (hYear % 100)); // اختزال 19 × آخر رقمين من السنة الهجرية
    
    const combinedMiracle19Factor = (
      miracle19Factor1 +
      miracle19Factor2 * 10 +
      miracle19Factor3 * 5 +
      miracle19Factor4 +
      miracle19Factor5 +
      miracle19Factor6 * 7 +
      miracle19Factor7 * 7
    ) * MAGIC_NUMBER;
    
    // حساب رقم الآية النهائي باستخدام صيغة متقدمة
    // الصيغة: (وقت × عوامل + تسلا × 19² + بركة × 7² + توصيات × 19 + رقم مختار × 19 + جُمَّل × 19 + عجيبة 19) modulo 6236
    let verseNumber = (
      timeInSeconds +
      (timeInMinutes * 10) +
      (timeProduct % 1000) +
      (hourMinuteSum * 100) +
      (minuteSecondSum * 50) +
      (totalTimeSum * 25) +
      combinedDateFactor +
      dateProduct +
      teslaFactor +
      blessedFactor +
      recommendationsFactor +
      selectedNumberFactor + // إضافة عامل الرقم المختار
      jumalClassicalFactor + // الجُمَّل الكلاسيكي من الآية السابقة
      jumalSequentialFactor + // الجُمَّل الترتيبي من الآية السابقة
      jumalReducedFactor + // اختزال الجُمَّل الكلاسيكي
      sequentialReducedFactor + // اختزال الجُمَّل الترتيبي
      muqattaatFactor + // الحروف المقطعة
      combinedMiracle19Factor + // عوامل عجيبة 19
      (MAGIC_NUMBER * 19) // عامل ثابت من النظام 19
    ) % TOTAL_VERSES;
    
    // التأكد من أن الرقم بين 1 و 6236
    if (verseNumber === 0) {
      verseNumber = TOTAL_VERSES; // إذا كان 0، استخدم آخر آية
    } else if (verseNumber < 1) {
      verseNumber = Math.abs(verseNumber) % TOTAL_VERSES + 1;
    }
    
    // تطبيق تعديل نهائي بناءً على الطاقة
    if (teslaScore >= 5 || blessedScore >= 3) {
      // إذا كانت الطاقة عالية، أضف تعديل طفيف
      verseNumber = (verseNumber + (teslaScore + blessedScore)) % TOTAL_VERSES;
      if (verseNumber === 0) verseNumber = TOTAL_VERSES;
    }
    
    // تعديل إضافي إذا كان هناك رقم مختار
    if (selectedNumber && selectedNumberInfo && selectedNumberInfo.energy) {
      const energyLevel = selectedNumberInfo.energy.level;
      if (energyLevel === 'very_high' || energyLevel === 'divine') {
        verseNumber = (verseNumber + Number(selectedNumber) + 19) % TOTAL_VERSES;
        if (verseNumber === 0) verseNumber = TOTAL_VERSES;
      }
    }
    
    return Math.floor(verseNumber);
  };

  // دالة حساب رقم اليوم في السنة
  const getDayOfYear = useCallback((year, month, day) => {
    const date = new Date(year, month - 1, day);
    const start = new Date(year, 0, 1);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay) + 1;
  }, []);

  // دالة التحقق من التطابق الرقمي الشامل - تفحص جميع التطابقات الممكنة
  const checkNumericMatches = useCallback((hours, minutes, seconds, verseNumber, gregorianDate, hijriDate, marqumAnalysis, selectedNumber = null) => {
    const matches = [];
    
    // === استخراج جميع القيم الرقمية ===
    
    // الوقت
    const hourReduced = reduceToSingleDigit(hours);
    const minuteReduced = reduceToSingleDigit(minutes);
    const secondReduced = reduceToSingleDigit(seconds);
    const timeSum = hours + minutes + seconds;
    const timeSumReduced = reduceToSingleDigit(timeSum);
    const hourMinuteSum = hours + minutes;
    const minuteSecondSum = minutes + seconds;
    
    // الجُمَّل (إذا كانت متاحة)
    let jumalReduced = 0;
    let sequentialReduced = 0;
    let jumalTotal = 0;
    let sequentialTotal = 0;
    let muqattaatJumal = 0;
    let muqattaatReduced = 0;
    
    if (marqumAnalysis && marqumAnalysis.verseAnalysis) {
      jumalReduced = marqumAnalysis.verseAnalysis.reducedJumal;
      sequentialReduced = marqumAnalysis.verseAnalysis.reducedSequential;
      jumalTotal = marqumAnalysis.verseAnalysis.totalJumal;
      sequentialTotal = marqumAnalysis.verseAnalysis.totalSequential;
      
      // الحروف المقطعة
      if (marqumAnalysis.muqattaatAnalysis && marqumAnalysis.muqattaatAnalysis.analysis) {
        muqattaatJumal = marqumAnalysis.muqattaatAnalysis.analysis.totalJumal || 0;
        muqattaatReduced = reduceToSingleDigit(muqattaatJumal);
      }
    }
    
    // التاريخ الميلادي
    let gDay = 0, gMonth = 0, gYear = 0, gYearReduced = 0, gDayOfYear = 0;
    if (gregorianDate) {
      gDay = gregorianDate.day || 0;
      gMonth = gregorianDate.month || 0;
      gYear = gregorianDate.year || 0;
      gYearReduced = reduceToSingleDigit(gYear);
      gDayOfYear = getDayOfYear(gYear, gMonth, gDay);
    }
    
    // التاريخ الهجري
    let hDay = 0, hMonth = 0, hYear = 0, hYearReduced = 0, hDayOfYear = 0;
    if (hijriDate && hijriDate.day > 0) {
      hDay = hijriDate.day || 0;
      hMonth = hijriDate.month || 0;
      hYear = hijriDate.year || 0;
      hYearReduced = reduceToSingleDigit(hYear);
      hDayOfYear = getDayOfYear(hYear, hMonth, hDay);
    }
    
    // الرقم المختار
    const selectedNum = selectedNumber ? Number(selectedNumber) : 0;
    const selectedNumReduced = selectedNum > 0 ? reduceToSingleDigit(selectedNum) : 0;
    
    // === دالة مساعدة للتحقق من التطابق ===
    const checkMatch = (value1, value2, label1, label2, type) => {
      if (value1 > 0 && value2 > 0 && value1 === value2) {
        matches.push({
          type: type,
          message: `🎯 تطابق! ${label1} (${value1}) = ${label2} (${value2})`,
          value: value1,
          matchType: type
        });
      }
    };
    
    // === 1. التطابقات بين الوقت والجُمَّل ===
    if (marqumAnalysis && marqumAnalysis.verseAnalysis) {
      checkMatch(hourReduced, jumalReduced, 'اختزال الساعة', 'اختزال الجُمَّل الكلاسيكي', 'hour_jumal_reduced');
      checkMatch(hourReduced, sequentialReduced, 'اختزال الساعة', 'اختزال الجُمَّل الترتيبي', 'hour_sequential_reduced');
      checkMatch(minuteReduced, jumalReduced, 'اختزال الدقيقة', 'اختزال الجُمَّل الكلاسيكي', 'minute_jumal_reduced');
      checkMatch(minuteReduced, sequentialReduced, 'اختزال الدقيقة', 'اختزال الجُمَّل الترتيبي', 'minute_sequential_reduced');
      checkMatch(secondReduced, jumalReduced, 'اختزال الثانية', 'اختزال الجُمَّل الكلاسيكي', 'second_jumal_reduced');
      checkMatch(secondReduced, sequentialReduced, 'اختزال الثانية', 'اختزال الجُمَّل الترتيبي', 'second_sequential_reduced');
      checkMatch(hours, jumalTotal, 'الساعة', 'الجُمَّل الكلاسيكي', 'hour_jumal_total');
      checkMatch(hours, sequentialTotal, 'الساعة', 'الجُمَّل الترتيبي', 'hour_sequential_total');
      checkMatch(minutes, jumalTotal, 'الدقيقة', 'الجُمَّل الكلاسيكي', 'minute_jumal_total');
      checkMatch(minutes, sequentialTotal, 'الدقيقة', 'الجُمَّل الترتيبي', 'minute_sequential_total');
      checkMatch(seconds, jumalTotal, 'الثانية', 'الجُمَّل الكلاسيكي', 'second_jumal_total');
      checkMatch(seconds, sequentialTotal, 'الثانية', 'الجُمَّل الترتيبي', 'second_sequential_total');
      checkMatch(timeSumReduced, jumalReduced, 'اختزال مجموع الوقت', 'اختزال الجُمَّل الكلاسيكي', 'time_sum_jumal_reduced');
      checkMatch(timeSumReduced, sequentialReduced, 'اختزال مجموع الوقت', 'اختزال الجُمَّل الترتيبي', 'time_sum_sequential_reduced');
    }
    
    // === 2. التطابقات بين الوقت والتاريخ الميلادي ===
    checkMatch(hours, gDay, 'الساعة', 'اليوم الميلادي', 'hour_gregorian_day');
    checkMatch(hours, gMonth, 'الساعة', 'الشهر الميلادي', 'hour_gregorian_month');
    checkMatch(minutes, gDay, 'الدقيقة', 'اليوم الميلادي', 'minute_gregorian_day');
    checkMatch(minutes, gMonth, 'الدقيقة', 'الشهر الميلادي', 'minute_gregorian_month');
    checkMatch(seconds, gDay, 'الثانية', 'اليوم الميلادي', 'second_gregorian_day');
    checkMatch(seconds, gMonth, 'الثانية', 'الشهر الميلادي', 'second_gregorian_month');
    checkMatch(hourReduced, gDay, 'اختزال الساعة', 'اليوم الميلادي', 'hour_reduced_gregorian_day');
    checkMatch(hourReduced, gMonth, 'اختزال الساعة', 'الشهر الميلادي', 'hour_reduced_gregorian_month');
    checkMatch(minuteReduced, gDay, 'اختزال الدقيقة', 'اليوم الميلادي', 'minute_reduced_gregorian_day');
    checkMatch(minuteReduced, gMonth, 'اختزال الدقيقة', 'الشهر الميلادي', 'minute_reduced_gregorian_month');
    checkMatch(hours, gYearReduced, 'الساعة', 'اختزال السنة الميلادية', 'hour_gregorian_year_reduced');
    checkMatch(minutes, gYearReduced, 'الدقيقة', 'اختزال السنة الميلادية', 'minute_gregorian_year_reduced');
    checkMatch(hours, gDayOfYear, 'الساعة', 'رقم اليوم في السنة الميلادية', 'hour_gregorian_day_of_year');
    checkMatch(minutes, gDayOfYear, 'الدقيقة', 'رقم اليوم في السنة الميلادية', 'minute_gregorian_day_of_year');
    
    // === 3. التطابقات بين الوقت والتاريخ الهجري ===
    if (hDay > 0) {
      checkMatch(hours, hDay, 'الساعة', 'اليوم الهجري', 'hour_hijri_day');
      checkMatch(hours, hMonth, 'الساعة', 'الشهر الهجري', 'hour_hijri_month');
      checkMatch(minutes, hDay, 'الدقيقة', 'اليوم الهجري', 'minute_hijri_day');
      checkMatch(minutes, hMonth, 'الدقيقة', 'الشهر الهجري', 'minute_hijri_month');
      checkMatch(seconds, hDay, 'الثانية', 'اليوم الهجري', 'second_hijri_day');
      checkMatch(seconds, hMonth, 'الثانية', 'الشهر الهجري', 'second_hijri_month');
      checkMatch(hourReduced, hDay, 'اختزال الساعة', 'اليوم الهجري', 'hour_reduced_hijri_day');
      checkMatch(hourReduced, hMonth, 'اختزال الساعة', 'الشهر الهجري', 'hour_reduced_hijri_month');
      checkMatch(minuteReduced, hDay, 'اختزال الدقيقة', 'اليوم الهجري', 'minute_reduced_hijri_day');
      checkMatch(minuteReduced, hMonth, 'اختزال الدقيقة', 'الشهر الهجري', 'minute_reduced_hijri_month');
      checkMatch(hours, hYearReduced, 'الساعة', 'اختزال السنة الهجرية', 'hour_hijri_year_reduced');
      checkMatch(minutes, hYearReduced, 'الدقيقة', 'اختزال السنة الهجرية', 'minute_hijri_year_reduced');
      checkMatch(hours, hDayOfYear, 'الساعة', 'رقم اليوم في السنة الهجرية', 'hour_hijri_day_of_year');
      checkMatch(minutes, hDayOfYear, 'الدقيقة', 'رقم اليوم في السنة الهجرية', 'minute_hijri_day_of_year');
    }
    
    // === 4. التطابقات بين الوقت ورقم الآية ===
    if (verseNumber > 0) {
      checkMatch(hours, verseNumber, 'الساعة', 'رقم الآية', 'hour_verse');
      checkMatch(minutes, verseNumber, 'الدقيقة', 'رقم الآية', 'minute_verse');
      checkMatch(seconds, verseNumber, 'الثانية', 'رقم الآية', 'second_verse');
      checkMatch(hourReduced, verseNumber, 'اختزال الساعة', 'رقم الآية', 'hour_reduced_verse');
      checkMatch(minuteReduced, verseNumber, 'اختزال الدقيقة', 'رقم الآية', 'minute_reduced_verse');
      checkMatch(secondReduced, verseNumber, 'اختزال الثانية', 'رقم الآية', 'second_reduced_verse');
      checkMatch(timeSumReduced, verseNumber, 'اختزال مجموع الوقت', 'رقم الآية', 'time_sum_reduced_verse');
    }
    
    // === 5. التطابقات بين الوقت والرقم المختار ===
    if (selectedNum > 0) {
      checkMatch(hours, selectedNum, 'الساعة', 'الرقم المختار', 'hour_selected');
      checkMatch(minutes, selectedNum, 'الدقيقة', 'الرقم المختار', 'minute_selected');
      checkMatch(seconds, selectedNum, 'الثانية', 'الرقم المختار', 'second_selected');
      checkMatch(hourReduced, selectedNum, 'اختزال الساعة', 'الرقم المختار', 'hour_reduced_selected');
      checkMatch(minuteReduced, selectedNum, 'اختزال الدقيقة', 'الرقم المختار', 'minute_reduced_selected');
      checkMatch(hourReduced, selectedNumReduced, 'اختزال الساعة', 'اختزال الرقم المختار', 'hour_reduced_selected_reduced');
      checkMatch(minuteReduced, selectedNumReduced, 'اختزال الدقيقة', 'اختزال الرقم المختار', 'minute_reduced_selected_reduced');
    }
    
    // === 6. التطابقات بين الجُمَّل والتاريخ الميلادي ===
    if (marqumAnalysis && marqumAnalysis.verseAnalysis) {
      checkMatch(jumalReduced, gDay, 'اختزال الجُمَّل الكلاسيكي', 'اليوم الميلادي', 'jumal_reduced_gregorian_day');
      checkMatch(jumalReduced, gMonth, 'اختزال الجُمَّل الكلاسيكي', 'الشهر الميلادي', 'jumal_reduced_gregorian_month');
      checkMatch(sequentialReduced, gDay, 'اختزال الجُمَّل الترتيبي', 'اليوم الميلادي', 'sequential_reduced_gregorian_day');
      checkMatch(sequentialReduced, gMonth, 'اختزال الجُمَّل الترتيبي', 'الشهر الميلادي', 'sequential_reduced_gregorian_month');
      checkMatch(jumalTotal, gDay, 'الجُمَّل الكلاسيكي', 'اليوم الميلادي', 'jumal_total_gregorian_day');
      checkMatch(jumalTotal, gMonth, 'الجُمَّل الكلاسيكي', 'الشهر الميلادي', 'jumal_total_gregorian_month');
      checkMatch(sequentialTotal, gDay, 'الجُمَّل الترتيبي', 'اليوم الميلادي', 'sequential_total_gregorian_day');
      checkMatch(sequentialTotal, gMonth, 'الجُمَّل الترتيبي', 'الشهر الميلادي', 'sequential_total_gregorian_month');
      checkMatch(jumalReduced, gYearReduced, 'اختزال الجُمَّل الكلاسيكي', 'اختزال السنة الميلادية', 'jumal_reduced_gregorian_year');
      checkMatch(sequentialReduced, gYearReduced, 'اختزال الجُمَّل الترتيبي', 'اختزال السنة الميلادية', 'sequential_reduced_gregorian_year');
      checkMatch(jumalTotal, gYear, 'الجُمَّل الكلاسيكي', 'السنة الميلادية', 'jumal_total_gregorian_year');
      checkMatch(sequentialTotal, gYear, 'الجُمَّل الترتيبي', 'السنة الميلادية', 'sequential_total_gregorian_year');
      checkMatch(jumalReduced, gDayOfYear, 'اختزال الجُمَّل الكلاسيكي', 'رقم اليوم في السنة الميلادية', 'jumal_reduced_gregorian_day_of_year');
      checkMatch(sequentialReduced, gDayOfYear, 'اختزال الجُمَّل الترتيبي', 'رقم اليوم في السنة الميلادية', 'sequential_reduced_gregorian_day_of_year');
    }
    
    // === 7. التطابقات بين الجُمَّل والتاريخ الهجري ===
    if (marqumAnalysis && marqumAnalysis.verseAnalysis && hDay > 0) {
      checkMatch(jumalReduced, hDay, 'اختزال الجُمَّل الكلاسيكي', 'اليوم الهجري', 'jumal_reduced_hijri_day');
      checkMatch(jumalReduced, hMonth, 'اختزال الجُمَّل الكلاسيكي', 'الشهر الهجري', 'jumal_reduced_hijri_month');
      checkMatch(sequentialReduced, hDay, 'اختزال الجُمَّل الترتيبي', 'اليوم الهجري', 'sequential_reduced_hijri_day');
      checkMatch(sequentialReduced, hMonth, 'اختزال الجُمَّل الترتيبي', 'الشهر الهجري', 'sequential_reduced_hijri_month');
      checkMatch(jumalTotal, hDay, 'الجُمَّل الكلاسيكي', 'اليوم الهجري', 'jumal_total_hijri_day');
      checkMatch(jumalTotal, hMonth, 'الجُمَّل الكلاسيكي', 'الشهر الهجري', 'jumal_total_hijri_month');
      checkMatch(sequentialTotal, hDay, 'الجُمَّل الترتيبي', 'اليوم الهجري', 'sequential_total_hijri_day');
      checkMatch(sequentialTotal, hMonth, 'الجُمَّل الترتيبي', 'الشهر الهجري', 'sequential_total_hijri_month');
      checkMatch(jumalReduced, hYearReduced, 'اختزال الجُمَّل الكلاسيكي', 'اختزال السنة الهجرية', 'jumal_reduced_hijri_year');
      checkMatch(sequentialReduced, hYearReduced, 'اختزال الجُمَّل الترتيبي', 'اختزال السنة الهجرية', 'sequential_reduced_hijri_year');
      checkMatch(jumalTotal, hYear, 'الجُمَّل الكلاسيكي', 'السنة الهجرية', 'jumal_total_hijri_year');
      checkMatch(sequentialTotal, hYear, 'الجُمَّل الترتيبي', 'السنة الهجرية', 'sequential_total_hijri_year');
      checkMatch(jumalReduced, hDayOfYear, 'اختزال الجُمَّل الكلاسيكي', 'رقم اليوم في السنة الهجرية', 'jumal_reduced_hijri_day_of_year');
      checkMatch(sequentialReduced, hDayOfYear, 'اختزال الجُمَّل الترتيبي', 'رقم اليوم في السنة الهجرية', 'sequential_reduced_hijri_day_of_year');
    }
    
    // === 8. التطابقات بين الجُمَّل ورقم الآية ===
    if (marqumAnalysis && marqumAnalysis.verseAnalysis && verseNumber > 0) {
      checkMatch(jumalReduced, verseNumber, 'اختزال الجُمَّل الكلاسيكي', 'رقم الآية', 'jumal_reduced_verse');
      checkMatch(sequentialReduced, verseNumber, 'اختزال الجُمَّل الترتيبي', 'رقم الآية', 'sequential_reduced_verse');
      checkMatch(jumalTotal, verseNumber, 'الجُمَّل الكلاسيكي', 'رقم الآية', 'jumal_total_verse');
      checkMatch(sequentialTotal, verseNumber, 'الجُمَّل الترتيبي', 'رقم الآية', 'sequential_total_verse');
    }
    
    // === 9. التطابقات بين الجُمَّل والرقم المختار ===
    if (marqumAnalysis && marqumAnalysis.verseAnalysis && selectedNum > 0) {
      checkMatch(jumalReduced, selectedNum, 'اختزال الجُمَّل الكلاسيكي', 'الرقم المختار', 'jumal_reduced_selected');
      checkMatch(sequentialReduced, selectedNum, 'اختزال الجُمَّل الترتيبي', 'الرقم المختار', 'sequential_reduced_selected');
      checkMatch(jumalTotal, selectedNum, 'الجُمَّل الكلاسيكي', 'الرقم المختار', 'jumal_total_selected');
      checkMatch(sequentialTotal, selectedNum, 'الجُمَّل الترتيبي', 'الرقم المختار', 'sequential_total_selected');
      checkMatch(jumalReduced, selectedNumReduced, 'اختزال الجُمَّل الكلاسيكي', 'اختزال الرقم المختار', 'jumal_reduced_selected_reduced');
      checkMatch(sequentialReduced, selectedNumReduced, 'اختزال الجُمَّل الترتيبي', 'اختزال الرقم المختار', 'sequential_reduced_selected_reduced');
    }
    
    // === 10. التطابقات بين الحروف المقطعة والوقت ===
    if (muqattaatJumal > 0) {
      checkMatch(hours, muqattaatJumal, 'الساعة', 'جُمَّل الحروف المقطعة', 'hour_muqattaat');
      checkMatch(minutes, muqattaatJumal, 'الدقيقة', 'جُمَّل الحروف المقطعة', 'minute_muqattaat');
      checkMatch(hourReduced, muqattaatReduced, 'اختزال الساعة', 'اختزال جُمَّل الحروف المقطعة', 'hour_reduced_muqattaat_reduced');
      checkMatch(minuteReduced, muqattaatReduced, 'اختزال الدقيقة', 'اختزال جُمَّل الحروف المقطعة', 'minute_reduced_muqattaat_reduced');
    }
    
    // === 11. التطابقات بين الحروف المقطعة والتاريخ ===
    if (muqattaatJumal > 0) {
      checkMatch(muqattaatJumal, gDay, 'جُمَّل الحروف المقطعة', 'اليوم الميلادي', 'muqattaat_gregorian_day');
      checkMatch(muqattaatJumal, gMonth, 'جُمَّل الحروف المقطعة', 'الشهر الميلادي', 'muqattaat_gregorian_month');
      checkMatch(muqattaatReduced, gDay, 'اختزال جُمَّل الحروف المقطعة', 'اليوم الميلادي', 'muqattaat_reduced_gregorian_day');
      checkMatch(muqattaatReduced, gMonth, 'اختزال جُمَّل الحروف المقطعة', 'الشهر الميلادي', 'muqattaat_reduced_gregorian_month');
      if (hDay > 0) {
        checkMatch(muqattaatJumal, hDay, 'جُمَّل الحروف المقطعة', 'اليوم الهجري', 'muqattaat_hijri_day');
        checkMatch(muqattaatJumal, hMonth, 'جُمَّل الحروف المقطعة', 'الشهر الهجري', 'muqattaat_hijri_month');
        checkMatch(muqattaatReduced, hDay, 'اختزال جُمَّل الحروف المقطعة', 'اليوم الهجري', 'muqattaat_reduced_hijri_day');
        checkMatch(muqattaatReduced, hMonth, 'اختزال جُمَّل الحروف المقطعة', 'الشهر الهجري', 'muqattaat_reduced_hijri_month');
      }
    }
    
    // === 12. التطابقات بين الحروف المقطعة ورقم الآية ===
    if (muqattaatJumal > 0 && verseNumber > 0) {
      checkMatch(muqattaatJumal, verseNumber, 'جُمَّل الحروف المقطعة', 'رقم الآية', 'muqattaat_verse');
      checkMatch(muqattaatReduced, verseNumber, 'اختزال جُمَّل الحروف المقطعة', 'رقم الآية', 'muqattaat_reduced_verse');
    }
    
    // === 13. التطابقات بين رقم الآية والتاريخ الميلادي ===
    if (verseNumber > 0) {
      checkMatch(verseNumber, gDay, 'رقم الآية', 'اليوم الميلادي', 'verse_gregorian_day');
      checkMatch(verseNumber, gMonth, 'رقم الآية', 'الشهر الميلادي', 'verse_gregorian_month');
      checkMatch(verseNumber, gYear, 'رقم الآية', 'السنة الميلادية', 'verse_gregorian_year');
      checkMatch(verseNumber, gYearReduced, 'رقم الآية', 'اختزال السنة الميلادية', 'verse_gregorian_year_reduced');
      checkMatch(verseNumber, gDayOfYear, 'رقم الآية', 'رقم اليوم في السنة الميلادية', 'verse_gregorian_day_of_year');
    }
    
    // === 14. التطابقات بين رقم الآية والتاريخ الهجري ===
    if (verseNumber > 0 && hDay > 0) {
      checkMatch(verseNumber, hDay, 'رقم الآية', 'اليوم الهجري', 'verse_hijri_day');
      checkMatch(verseNumber, hMonth, 'رقم الآية', 'الشهر الهجري', 'verse_hijri_month');
      checkMatch(verseNumber, hYear, 'رقم الآية', 'السنة الهجرية', 'verse_hijri_year');
      checkMatch(verseNumber, hYearReduced, 'رقم الآية', 'اختزال السنة الهجرية', 'verse_hijri_year_reduced');
      checkMatch(verseNumber, hDayOfYear, 'رقم الآية', 'رقم اليوم في السنة الهجرية', 'verse_hijri_day_of_year');
    }
    
    // === 15. التطابقات بين رقم الآية والرقم المختار ===
    if (verseNumber > 0 && selectedNum > 0) {
      checkMatch(verseNumber, selectedNum, 'رقم الآية', 'الرقم المختار', 'verse_selected');
      const verseReduced = reduceToSingleDigit(verseNumber);
      checkMatch(verseReduced, selectedNum, 'اختزال رقم الآية', 'الرقم المختار', 'verse_reduced_selected');
      checkMatch(verseReduced, selectedNumReduced, 'اختزال رقم الآية', 'اختزال الرقم المختار', 'verse_reduced_selected_reduced');
    }
    
    // === 16. التطابقات بين التاريخ الميلادي والهجري ===
    checkMatch(gDay, hDay, 'اليوم الميلادي', 'اليوم الهجري', 'gregorian_hijri_day');
    checkMatch(gMonth, hMonth, 'الشهر الميلادي', 'الشهر الهجري', 'gregorian_hijri_month');
    checkMatch(gYearReduced, hYearReduced, 'اختزال السنة الميلادية', 'اختزال السنة الهجرية', 'gregorian_hijri_year_reduced');
    
    // === 17. التطابقات بين الرقم المختار والتاريخ الميلادي ===
    if (selectedNum > 0) {
      checkMatch(selectedNum, gDay, 'الرقم المختار', 'اليوم الميلادي', 'selected_gregorian_day');
      checkMatch(selectedNum, gMonth, 'الرقم المختار', 'الشهر الميلادي', 'selected_gregorian_month');
      checkMatch(selectedNum, gYearReduced, 'الرقم المختار', 'اختزال السنة الميلادية', 'selected_gregorian_year_reduced');
      checkMatch(selectedNumReduced, gDay, 'اختزال الرقم المختار', 'اليوم الميلادي', 'selected_reduced_gregorian_day');
      checkMatch(selectedNumReduced, gMonth, 'اختزال الرقم المختار', 'الشهر الميلادي', 'selected_reduced_gregorian_month');
    }
    
    // === 18. التطابقات بين الرقم المختار والتاريخ الهجري ===
    if (selectedNum > 0 && hDay > 0) {
      checkMatch(selectedNum, hDay, 'الرقم المختار', 'اليوم الهجري', 'selected_hijri_day');
      checkMatch(selectedNum, hMonth, 'الرقم المختار', 'الشهر الهجري', 'selected_hijri_month');
      checkMatch(selectedNum, hYearReduced, 'الرقم المختار', 'اختزال السنة الهجرية', 'selected_hijri_year_reduced');
      checkMatch(selectedNumReduced, hDay, 'اختزال الرقم المختار', 'اليوم الهجري', 'selected_reduced_hijri_day');
      checkMatch(selectedNumReduced, hMonth, 'اختزال الرقم المختار', 'الشهر الهجري', 'selected_reduced_hijri_month');
    }
    
    // === 19. التطابقات الخاصة (مثل 19، 7، 3، 6، 9) ===
    const specialNumbers = [3, 6, 7, 9, 19];
    specialNumbers.forEach(specialNum => {
      if (hourReduced === specialNum) {
        matches.push({
          type: `hour_special_${specialNum}`,
          message: `✨ تطابق خاص! اختزال الساعة (${hourReduced}) = الرقم المقدس ${specialNum}`,
          value: hourReduced,
          matchType: 'special'
        });
      }
      if (minuteReduced === specialNum) {
        matches.push({
          type: `minute_special_${specialNum}`,
          message: `✨ تطابق خاص! اختزال الدقيقة (${minuteReduced}) = الرقم المقدس ${specialNum}`,
          value: minuteReduced,
          matchType: 'special'
        });
      }
      if (marqumAnalysis && marqumAnalysis.verseAnalysis) {
        if (jumalReduced === specialNum) {
          matches.push({
            type: `jumal_special_${specialNum}`,
            message: `✨ تطابق خاص! اختزال الجُمَّل الكلاسيكي (${jumalReduced}) = الرقم المقدس ${specialNum}`,
            value: jumalReduced,
            matchType: 'special'
          });
        }
        if (sequentialReduced === specialNum) {
          matches.push({
            type: `sequential_special_${specialNum}`,
            message: `✨ تطابق خاص! اختزال الجُمَّل الترتيبي (${sequentialReduced}) = الرقم المقدس ${specialNum}`,
            value: sequentialReduced,
            matchType: 'special'
          });
        }
      }
    });
    
    // إرجاع جميع التطابقات المكتشفة
    return matches.length > 0 ? matches : null;
  }, [getDayOfYear]);

  // جلب الآية من API
  const fetchVerseFromAPI = async (verseNumber, meta = {}) => {
    setVerseLoading(true);
    try {
      // استخدام API alquran.cloud
      const response = await fetch(`https://api.alquran.cloud/v1/ayah/${verseNumber}/editions/quran-uthmani,ar.asad`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.code === 200 && data.data && data.data.length > 0) {
        const verseData = data.data[0]; // نص الآية (quran-uthmani)
        const translationData = data.data.length > 1 ? data.data[1] : null; // الترجمة إن وجدت
        
        const verse = {
          number: verseNumber,
          text: verseData.text,
          surah: verseData.surah?.name || 'غير معروف',
          surahNumber: verseData.surah?.number || 0,
          ayah: verseData.numberInSurah || 0,
          translation: translationData?.text || null,
          gregorianDate: meta.gregorianDate || null,
          hijriDate: meta.hijriDate || null
        };
        
        setSelectedVerse(verse);
        
        // حساب تحليل كتاب مرقوم للآية
        if (verseData.text && verseData.surah?.number && verseData.numberInSurah) {
          try {
            const marqumAnalysis = analyzeVerseKitabMarqum(
              verseData.surah.number,
              verseData.numberInSurah,
              verseData.text
            );
            setKitabMarqumAnalysis(marqumAnalysis);
            
            // التحقق من التطابق الرقمي الشامل
            if (meta.currentTime && meta.gregorianDate && meta.hijriDate) {
              const now = meta.currentTime;
              const hours = now.getHours();
              const minutes = now.getMinutes();
              const seconds = now.getSeconds();
              const matches = checkNumericMatches(
                hours,
                minutes,
                seconds,
                verseNumber,
                meta.gregorianDate,
                meta.hijriDate,
                marqumAnalysis,
                selectedNumber
              );
              
              if (matches && matches.length > 0) {
                setNumericMatchAlert({
                  matches: matches,
                  timestamp: new Date()
                });
                // إخفاء الإشعار بعد 10 ثواني
                setTimeout(() => {
                  setNumericMatchAlert(null);
                }, 10000);
              }
            }
          } catch (error) {
            console.error('Error analyzing Kitab Marqum:', error);
            setKitabMarqumAnalysis(null);
          }
        }
        
        // إذا لم تكن هناك آية مثبتة، أو إذا كانت الآية المثبتة مختلفة، لا نغيرها
        // (يتم التثبيت يدوياً فقط)
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error fetching verse:', error);
      // في حالة الخطأ، نعرض رسالة مفيدة
      setSelectedVerse({
        number: verseNumber,
        text: 'حدث خطأ في تحميل الآية. يرجى تحديث الصفحة.',
        surah: 'خطأ في التحميل',
        surahNumber: 0,
        ayah: 0,
        error: true,
        errorMessage: error.message,
        gregorianDate: meta.gregorianDate || null,
        hijriDate: meta.hijriDate || null
      });
    } finally {
      setVerseLoading(false);
    }
  };

  // جلب التفسير من API (القرطبي فقط)
  const fetchTafseer = async (surahNumber, ayahNumber) => {
    if (!surahNumber || !ayahNumber) return;
    
    // إنشاء روابط التفسير دائماً
    const tafseerLinks = {
      altafsir: `https://www.altafsir.com/Tafasir.asp?tMadhNo=1&tTafsirNo=5&tSoraNo=${surahNumber}&tAyahNo=${ayahNumber}&tDisplay=yes&UserProfile=0&LanguageId=1`,
      islamweb: `https://www.islamweb.net/quran/index.php?page=showquran&sura=${surahNumber}&aya=${ayahNumber}`,
      quran: `https://quran.ksu.edu.sa/tafseer/qurtubi/sura${surahNumber}-aya${ayahNumber}.html`
    };
    
    setTafseerLoading(true);
    try {
      // محاولة 1: استخدام API من alquran.cloud
      const apiUrl = `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.qurtubi`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // التحقق من بنية البيانات المختلفة
        if (data.code === 200 && data.data) {
          // إذا كانت البيانات في data.data.text
          if (data.data.text) {
            setTafseer({
              text: data.data.text,
              author: 'القرطبي',
              type: 'qurtubi',
              links: tafseerLinks
            });
            return;
          }
          // إذا كانت البيانات في data.data[0].text
          if (data.data.length > 0 && data.data[0].text) {
            setTafseer({
              text: data.data[0].text,
              author: 'القرطبي',
              type: 'qurtubi',
              links: tafseerLinks
            });
            return;
          }
        }
      }
      
      // محاولة 2: استخدام API بديل من quran-api.com
      const alternativeUrl = `https://quran-api.com/tafseer/qurtubi/${surahNumber}/${ayahNumber}`;
      
      const altResponse = await fetch(alternativeUrl, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (altResponse.ok) {
        const altData = await altResponse.json();
        if (altData.text || altData.tafseer) {
          setTafseer({
            text: altData.text || altData.tafseer,
            author: 'القرطبي',
            type: 'qurtubi',
            links: tafseerLinks
          });
          return;
        }
      }
      
      // إذا فشلت جميع المحاولات، نعرض روابط مباشرة
      setTafseer({
        text: `التفسير غير متاح حالياً من API. يرجى استخدام الروابط المباشرة أدناه للوصول إلى تفسير القرطبي.`,
        author: 'القرطبي',
        type: 'qurtubi',
        error: true,
        links: tafseerLinks
      });
      
    } catch (error) {
      console.error('Error fetching tafseer:', error);
      
      setTafseer({
        text: 'حدث خطأ في تحميل التفسير. يرجى استخدام الروابط المباشرة أدناه.',
        author: 'القرطبي',
        type: 'qurtubi',
        error: true,
        links: tafseerLinks
      });
    } finally {
      setTafseerLoading(false);
    }
  };

  // تثبيت/إلغاء تثبيت الآية
  const togglePinVerse = () => {
    if (pinnedVerse && pinnedVerse.number === selectedVerse?.number) {
      // إلغاء التثبيت
      setPinnedVerse(null);
      localStorage.removeItem('pinnedVerse');
    } else if (selectedVerse && !selectedVerse.error) {
      // تثبيت الآية
      const verseToPin = {
        ...selectedVerse,
        pinnedAt: new Date().toISOString()
      };
      setPinnedVerse(verseToPin);
      localStorage.setItem('pinnedVerse', JSON.stringify(verseToPin));
    }
  };

  // تحميل الآية المثبتة من localStorage عند التحميل
  useEffect(() => {
    const savedPinnedVerse = localStorage.getItem('pinnedVerse');
    if (savedPinnedVerse) {
      try {
        setPinnedVerse(JSON.parse(savedPinnedVerse));
      } catch (error) {
        console.error('Error loading pinned verse:', error);
      }
    }
  }, []);

  // جلب التفسير عند تغيير الآية
  useEffect(() => {
    if (showTafseer && selectedVerse && !selectedVerse.error && selectedVerse.surahNumber && selectedVerse.ayah) {
      fetchTafseer(selectedVerse.surahNumber, selectedVerse.ayah);
    }
  }, [showTafseer, selectedVerse?.surahNumber, selectedVerse?.ayah]);

  // تحليل سريع - يفحص التغييرات البسيطة فقط
  const quickAnalysis = useCallback((time) => {
    if (!analysis) return;
    
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    
    // فحص تغيير طاقة تسلا والبركة فقط
    const timeNumbers = extractNumbersFromTime(hours, minutes, seconds);
    const newTeslaEnergy = calculateTeslaEnergy(hours, minutes, seconds, timeNumbers);
    
    // مقارنة مع الحالة السابقة
    if (newTeslaEnergy.teslaScore !== analysis.teslaEnergy.teslaScore ||
        newTeslaEnergy.blessedScore !== analysis.teslaEnergy.blessedScore) {
      
      // تنبيه بالتغيير
      setAlerts(prev => ({
        ...prev,
        teslaChange: newTeslaEnergy.teslaScore > (analysis.teslaEnergy.teslaScore || 0),
        blessedChange: newTeslaEnergy.blessedScore > (analysis.teslaEnergy.blessedScore || 0)
      }));
      
      // تحديث طاقة تسلا فقط
      setAnalysis(prev => ({
        ...prev,
        teslaEnergy: newTeslaEnergy,
        time: { hours, minutes, seconds }
      }));
      
      // إخفاء التنبيه بعد 3 ثواني
      setTimeout(() => {
        setAlerts({ teslaChange: false, blessedChange: false, majorNumberChange: false });
      }, 3000);
    }
  }, [analysis]);

  // تحليل عميق - تحليل كامل لكل شيء
  const deepAnalysis = useCallback((time) => {
    setIsLoading(true);
    
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const gregorianDate = {
      year: time.getFullYear(),
      month: time.getMonth() + 1,
      day: time.getDate()
    };
    
    let hijriDate = { year: 0, month: 0, day: 0 };
    try {
      const hijriFormatter = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
      const hijriParts = hijriFormatter.formatToParts(time);
      const hijriMap = hijriParts.reduce((acc, part) => {
        if (part.type === 'year') acc.year = parseInt(part.value, 10);
        if (part.type === 'month') acc.month = parseInt(part.value, 10);
        if (part.type === 'day') acc.day = parseInt(part.value, 10);
        return acc;
      }, {});
      hijriDate = {
        year: hijriMap.year || 0,
        month: hijriMap.month || 0,
        day: hijriMap.day || 0
      };
    } catch (error) {
      console.warn('Hijri date calculation failed:', error);
    }
    
    // استخراج الأرقام
    const timeNumbers = extractNumbersFromTime(hours, minutes, seconds);
    
    // تحليل الأرقام المستخرجة (مع إضافة الرقم المختار)
    const recommendations = analyzeNumbers(timeNumbers, selectedNumber, selectedNumberInfo);
    
    // حساب طاقة الوقت
    const teslaEnergy = calculateTeslaEnergy(hours, minutes, seconds, timeNumbers);
    
    // تحديد الأولوية
    const priority = determinePriority(recommendations, teslaEnergy);
    
    // فحص التغييرات الجوهرية
    if (analysis) {
      const hasSignificantChange = checkSignificantChange(
        recommendations,
        analysis.recommendations,
        teslaEnergy,
        analysis.teslaEnergy
      );
      
      if (hasSignificantChange) {
        setLastSignificantChange(time);
        setAlerts(prev => ({ ...prev, majorNumberChange: true }));
        setTimeout(() => setAlerts(prev => ({ ...prev, majorNumberChange: false })), 5000);
      }
    }
    
    setAnalysis({
      time: { hours, minutes, seconds },
      numbers: timeNumbers,
      recommendations: recommendations,
      teslaEnergy: teslaEnergy,
      priority: priority
    });
    
    // حساب رقم الآية وجلبها من API (مع الأخذ في الاعتبار الرقم المختار والجُمَّل من الآية السابقة)
    const verseNumber = calculateVerseNumber(
      hours,
      minutes,
      seconds,
      teslaEnergy.teslaScore,
      teslaEnergy.blessedScore,
      recommendations,
      gregorianDate,
      hijriDate,
      selectedNumber,
      selectedNumberInfo,
      kitabMarqumAnalysis // تمرير تحليل كتاب مرقوم من الآية السابقة
    );
    
    fetchVerseFromAPI(verseNumber, { gregorianDate, hijriDate, currentTime: time });
    
    setIsLoading(false);
  }, [analysis, selectedNumber, selectedNumberInfo]);

  // فحص التغيير الجوهري
  const checkSignificantChange = (newRecs, oldRecs, newEnergy, oldEnergy) => {
    if (newEnergy.level !== oldEnergy.level) return true;
    if (newRecs.length !== oldRecs.length) return true;
    if (newEnergy.teslaScore !== oldEnergy.teslaScore) return true;
    if (newEnergy.blessedScore !== oldEnergy.blessedScore) return true;
    return false;
  };

  // استخراج الأرقام من الوقت بذكاء محسّن
  const extractNumbersFromTime = (hours, minutes, seconds) => {
    const numbers = new Set();
    
    // القيم الأساسية (وزن عالي)
    numbers.add(hours);
    numbers.add(minutes);
    numbers.add(seconds);
    
    // استخراج الأرقام الفردية من كل قيمة
    [hours, minutes, seconds].forEach(num => {
      if (num >= 10) {
        numbers.add(Math.floor(num / 10));
        numbers.add(num % 10);
      }
    });
    
    // المجاميع المختلفة (وزن متوسط)
    const totalSum = hours + minutes + seconds;
    numbers.add(totalSum);
    
    const hourMinuteSum = hours + minutes;
    numbers.add(hourMinuteSum);
    
    const minuteSecondSum = minutes + seconds;
    numbers.add(minuteSecondSum);
    
    // الاختزال الذكي للمجاميع
    const reduceToSingle = (num) => {
      if (num <= 9 || num === 11 || num === 22 || num === 33) return num;
      let reduced = num;
      while (reduced > 9 && reduced !== 11 && reduced !== 22 && reduced !== 33) {
        reduced = String(reduced)
          .split('')
          .reduce((a, b) => parseInt(a) + parseInt(b), 0);
      }
      return reduced;
    };
    
    numbers.add(reduceToSingle(totalSum));
    numbers.add(reduceToSingle(hourMinuteSum));
    numbers.add(reduceToSingle(minuteSecondSum));
    numbers.add(reduceToSingle(hours));
    numbers.add(reduceToSingle(minutes));
    numbers.add(reduceToSingle(seconds));
    
    // الفروقات (وزن منخفض)
    if (hours > minutes) numbers.add(hours - minutes);
    if (minutes > seconds) numbers.add(minutes - seconds);
    if (hours > seconds) numbers.add(hours - seconds);
    
    // الأرقام الخاصة في الأرقام الكبيرة
    [totalSum, hourMinuteSum, minuteSecondSum].forEach(sum => {
      if (sum >= 100) {
        numbers.add(Math.floor(sum / 100));
        numbers.add(Math.floor((sum % 100) / 10));
        numbers.add(sum % 10);
      } else if (sum >= 10) {
        numbers.add(Math.floor(sum / 10));
        numbers.add(sum % 10);
      }
    });
    
    return Array.from(numbers).filter(n => n >= 0 && n < 10000).sort((a, b) => b - a);
  };

  // تحليل الأرقام (مع إضافة الرقم المختار إذا كان موجوداً)
  const analyzeNumbers = (numbers, selectedNumber = null, selectedNumberInfo = null) => {
    const recommendations = [];
    const priorities = {
      tesla: 10,
      blessed: 9,
      fundamental: 8,
      compound: 7,
      decade: 6,
      large: 5
    };
    
    // إضافة الرقم المختار إلى قائمة الأرقام للتحليل
    const numbersToAnalyze = [...numbers];
    if (selectedNumber && selectedNumberInfo) {
      const numValue = Number(selectedNumber) || 0;
      if (numValue > 0 && !numbersToAnalyze.includes(numValue)) {
        numbersToAnalyze.push(numValue);
      }
    }
    
    for (const num of numbersToAnalyze) {
      const info = getNumberInfo(num);
      const energy = calculateNumberEnergy(num);
      
      // إذا كان هذا الرقم هو الرقم المختار، أعطيه أولوية أعلى
      const isSelected = selectedNumber && Number(selectedNumber) === num;
      const basePriority = priorities[energy.classification] || 0;
      const finalPriority = isSelected ? basePriority + 5 : basePriority; // إضافة 5 نقاط إضافية للرقم المختار
      
      if (info && info.verses && info.verses.length > 0) {
        const verse = selectBestVerse(info.verses, energy);
        recommendations.push({
          number: num,
          verse: verse,
          significance: info.significance,
          generalAdvice: info.generalAdvice,
          energy: energy,
          priority: finalPriority,
          isSelected: isSelected // علامة للرقم المختار
        });
      } else {
        const nearestInfo = getNearestNumberInfo(num);
        if (nearestInfo && nearestInfo.info) {
          const verse = selectBestVerse(nearestInfo.info.verses, energy);
          recommendations.push({
            number: nearestInfo.number,
            isNearest: true,
            originalNumber: num,
            verse: verse,
            significance: nearestInfo.info.significance,
            generalAdvice: nearestInfo.info.generalAdvice,
            energy: energy,
            priority: finalPriority,
            isSelected: isSelected
          });
        }
      }
    }
    
    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 4);
  };

  // اختيار أفضل آية
  const selectBestVerse = (verses, energy) => {
    if (verses.length === 1) return verses[0];
    
    if (energy.level === 'very_high' || energy.level === 'blessed') {
      const highEnergyVerse = verses.find(v => 
        v.energy === 'high' || v.energy === 'powerful' || v.energy === 'blessed'
      );
      if (highEnergyVerse) return highEnergyVerse;
    }
    
    if (energy.level === 'warning') {
      const warningVerse = verses.find(v => v.energy === 'warning' || v.energy === 'critical');
      if (warningVerse) return warningVerse;
    }
    
    return verses[0];
  };

  // حساب طاقة الوقت المحسّن
  const calculateTeslaEnergy = (hours, minutes, seconds, numbers) => {
    const teslaNumbers = [3, 6, 9];
    let teslaScore = 0;
    let blessedScore = 0;
    
    // حساب نقاط تسلا مع أوزان مختلفة
    numbers.forEach(num => {
      // الرقم الكامل يساوي 3، 6، أو 9 (وزن عالي: 2 نقطة)
      if (teslaNumbers.includes(num)) {
        teslaScore += 2;
      }
      // الرقم ينتهي بـ 3، 6، أو 9 (وزن متوسط: 1 نقطة)
      else if (num > 9 && teslaNumbers.includes(num % 10)) {
        teslaScore += 1;
      }
      // الرقم يحتوي على 3، 6، أو 9 في منتصفه (وزن منخفض: 0.5 نقطة)
      else if (num > 99) {
        const digits = String(num).split('').map(Number);
        digits.forEach(d => {
          if (teslaNumbers.includes(d)) teslaScore += 0.5;
        });
      }
    });
    
    // حساب نقاط البركة (7) مع أوزان مختلفة
    numbers.forEach(num => {
      // الرقم الكامل يساوي 7 (وزن عالي: 3 نقطة)
      if (num === 7) {
        blessedScore += 3;
      }
      // الرقم ينتهي بـ 7 (وزن متوسط: 1.5 نقطة)
      else if (num > 9 && num % 10 === 7) {
        blessedScore += 1.5;
      }
      // الرقم يحتوي على 7 في منتصفه (وزن منخفض: 1 نقطة)
      else if (num > 99) {
        const digits = String(num).split('').map(Number);
        digits.forEach(d => {
          if (d === 7) blessedScore += 1;
        });
      }
      // الرقم 17، 27، 37... (وزن متوسط: 1 نقطة)
      else if (num > 7 && num < 100 && num % 10 === 7) {
        blessedScore += 1;
      }
    });
    
    // حساب نقاط إضافية من الأرقام الفردية في الوقت الأصلي
    const allDigits = [
      ...String(hours).padStart(2, '0').split(''),
      ...String(minutes).padStart(2, '0').split(''),
      ...String(seconds).padStart(2, '0').split('')
    ].map(Number);
    
    allDigits.forEach(d => {
      if (teslaNumbers.includes(d)) teslaScore += 1; // وزن عالي للأرقام الأصلية
      if (d === 7) blessedScore += 2; // وزن عالي جداً لرقم 7 في الوقت الأصلي
    });
    
    // نقاط إضافية للأنماط الخاصة
    // نمط 3-6-9 كامل في نفس الوقت
    const has3 = allDigits.includes(3);
    const has6 = allDigits.includes(6);
    const has9 = allDigits.includes(9);
    if (has3 && has6 && has9) {
      teslaScore += 5; // مكافأة كبيرة للنمط الكامل
    }
    
    // نمط 7-7 (رقم 7 متكرر)
    const sevenCount = allDigits.filter(d => d === 7).length;
    if (sevenCount >= 2) {
      blessedScore += 3; // مكافأة للتكرار
    }
    
    // تقريب النقاط إلى أعداد صحيحة للعرض
    const totalTeslaScore = Math.round(teslaScore);
    const totalBlessedScore = Math.round(blessedScore);
    
    // تحديد مستوى الطاقة بشكل محسّن
    let energy = {
      level: 'medium',
      description: 'طاقة متوازنة',
      color: 'blue',
      teslaScore: totalTeslaScore,
      blessedScore: totalBlessedScore
    };
    
    // طاقة إلهية استثنائية (تسلا + بركة عالية معاً)
    if (totalTeslaScore >= 5 && totalBlessedScore >= 3) {
      energy = {
        level: 'divine',
        description: '🌟 طاقة إلهية استثنائية - تسلا + البركة معاً',
        color: 'purple',
        teslaScore: totalTeslaScore,
        blessedScore: totalBlessedScore
      };
    }
    // طاقة تسلا عالية جداً
    else if (totalTeslaScore >= 6) {
      energy = {
        level: 'very_high',
        description: '⚡ طاقة تسلا عالية جداً (3-6-9)',
        color: 'purple',
        teslaScore: totalTeslaScore,
        blessedScore: totalBlessedScore
      };
    }
    // وقت مبارك جداً (بركة عالية)
    else if (totalBlessedScore >= 5) {
      energy = {
        level: 'blessed',
        description: '✨ وقت مبارك جداً - رقم 7 المبارك',
        color: 'green',
        teslaScore: totalTeslaScore,
        blessedScore: totalBlessedScore
      };
    }
    // طاقة تسلا جيدة
    else if (totalTeslaScore >= 4) {
      energy = {
        level: 'high',
        description: '🔥 طاقة تسلا جيدة',
        color: 'teal',
        teslaScore: totalTeslaScore,
        blessedScore: totalBlessedScore
      };
    }
    // وقت مبارك
    else if (totalBlessedScore >= 3) {
      energy = {
        level: 'blessed_medium',
        description: '🌙 وقت مبارك - يحتوي على الرقم 7',
        color: 'emerald',
        teslaScore: totalTeslaScore,
        blessedScore: totalBlessedScore
      };
    }
    // طاقة تسلا متوسطة
    else if (totalTeslaScore >= 2) {
      energy = {
        level: 'medium_high',
        description: '💫 طاقة متوسطة - يحتوي على أحد أرقام تسلا',
        color: 'cyan',
        teslaScore: totalTeslaScore,
        blessedScore: totalBlessedScore
      };
    }
    // بركة خفيفة
    else if (totalBlessedScore >= 1) {
      energy = {
        level: 'blessed_light',
        description: '🌙 وقت مبارك خفيف - يحتوي على الرقم 7',
        color: 'emerald',
        teslaScore: totalTeslaScore,
        blessedScore: totalBlessedScore
      };
    }
    
    return energy;
  };

  // تحديد الأولوية
  const determinePriority = (recommendations, teslaEnergy) => {
    if (teslaEnergy.level === 'divine' || teslaEnergy.level === 'very_high') {
      return 'urgent';
    } else if (teslaEnergy.level === 'blessed' || teslaEnergy.level === 'high') {
      return 'high';
    } else if (recommendations.length >= 2) {
      return 'medium';
    }
    return 'normal';
  };

  // ألوان الطاقة
  const getEnergyColor = (level) => {
    const colors = {
      divine: 'from-purple-600 via-pink-500 to-yellow-500',
      very_high: 'from-purple-500 to-pink-500',
      blessed: 'from-green-500 to-emerald-500',
      blessed_medium: 'from-emerald-400 to-green-400',
      blessed_light: 'from-green-300 to-emerald-300',
      high: 'from-teal-500 to-cyan-500',
      medium_high: 'from-cyan-400 to-blue-400',
      medium: 'from-blue-500 to-indigo-500',
      low: 'from-gray-500 to-slate-500'
    };
    return colors[level] || colors.medium;
  };

  // أيقونة الأولوية
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <Star className="w-6 h-6 text-yellow-400 animate-pulse" fill="currentColor" />;
      case 'high':
        return <TrendingUp className="w-6 h-6 text-orange-400 animate-bounce" />;
      case 'medium':
        return <Lightbulb className="w-6 h-6 text-blue-400" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  if (isLoading || !analysis) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6" dir="rtl">
      {/* التنبيهات */}
      {(alerts.teslaChange || alerts.blessedChange || alerts.majorNumberChange) && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce px-2 w-full max-w-md">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-2xl flex items-center gap-2 sm:gap-3">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-spin flex-shrink-0" />
            <span className="font-bold text-sm sm:text-base md:text-lg truncate">
              {alerts.teslaChange && '⚡ تغيرت طاقة تسلا!'}
              {alerts.blessedChange && '✨ تغيرت طاقة البركة!'}
              {alerts.majorNumberChange && '🌟 تغيير جوهري في الأرقام!'}
            </span>
          </div>
        </div>
      )}

      {/* إشعار التطابق الرقمي */}
      {numericMatchAlert && numericMatchAlert.matches && numericMatchAlert.matches.length > 0 && (
        <div className="fixed top-20 sm:top-24 left-1/2 transform -translate-x-1/2 z-50 px-2 w-full max-w-lg animate-pulse">
          <div className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-2xl border-2 border-yellow-300">
            <div className="flex items-start gap-3">
              <Star className="w-6 h-6 sm:w-8 sm:h-8 animate-spin flex-shrink-0 mt-1 fill-current" />
              <div className="flex-1">
                <h4 className="font-bold text-base sm:text-lg mb-2">🎯 تطابق رقمي مذهل!</h4>
                <div className="space-y-2">
                  {numericMatchAlert.matches.map((match, idx) => (
                    <div key={idx} className="bg-white/20 rounded-lg p-2 sm:p-3 text-sm sm:text-base">
                      <p className="font-semibold">{match.message}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setNumericMatchAlert(null)}
                  className="mt-3 text-xs sm:text-sm underline hover:no-underline opacity-80 hover:opacity-100"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* رأس القسم */}
      <div className="text-center space-y-2 px-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2">
          <Clock className="w-6 h-6 sm:w-8 sm:h-8" />
          ماذا أفعل الآن؟
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          تحليل ديناميكي ذكي بناءً على الوقت الحالي والآيات القرآنية
        </p>
        {lastSignificantChange && (
          <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400">
            آخر تغيير جوهري: {lastSignificantChange.toLocaleTimeString('ar-SA')}
          </p>
        )}
      </div>

      {/* عرض الوقت الحالي */}
      <div className={`bg-gradient-to-r ${getEnergyColor(analysis.teslaEnergy.level)} text-white p-4 sm:p-8 rounded-2xl shadow-2xl transition-all duration-500 ${
        pulseEffect ? 'scale-105' : 'scale-100'
      }`}>
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="text-4xl sm:text-5xl md:text-6xl font-bold font-mono tracking-wider break-words">
            {String(analysis.time.hours).padStart(2, '0')}:
            {String(analysis.time.minutes).padStart(2, '0')}:
            {String(analysis.time.seconds).padStart(2, '0')}
          </div>
          <div className="text-lg sm:text-xl md:text-2xl opacity-95 font-semibold px-2">
            {analysis.teslaEnergy.description}
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 text-sm px-2">
            <div className="bg-white/30 backdrop-blur-sm px-4 py-2 sm:px-5 sm:py-3 rounded-xl shadow-lg">
              <span className="opacity-90 text-xs sm:text-sm">طاقة تسلا (3-6-9): </span>
              <span className="font-bold text-xl sm:text-2xl">{analysis.teslaEnergy.teslaScore}</span>
              {analysis.teslaEnergy.teslaScore >= 3 && <Zap className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-1 sm:mr-2 animate-pulse" />}
            </div>
            <div className="bg-white/30 backdrop-blur-sm px-4 py-2 sm:px-5 sm:py-3 rounded-xl shadow-lg">
              <span className="opacity-90 text-xs sm:text-sm">البركة (7): </span>
              <span className="font-bold text-xl sm:text-2xl">{analysis.teslaEnergy.blessedScore}</span>
              {analysis.teslaEnergy.blessedScore >= 2 && <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-1 sm:mr-2 animate-pulse" />}
            </div>
          </div>
        </div>
      </div>

      {/* الآية المثبتة (إن وجدت) */}
      {pinnedVerse && pinnedVerse.number !== selectedVerse?.number && (
        <div className="bg-gradient-to-br from-yellow-900/40 via-orange-900/40 to-red-900/40 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border-2 border-yellow-400/50 shadow-xl mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl sm:text-2xl font-bold text-yellow-300 flex items-center gap-2">
              <Pin className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
              📌 الآية المثبتة
            </h3>
            <button
              onClick={() => {
                setPinnedVerse(null);
                localStorage.removeItem('pinnedVerse');
              }}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <PinOff className="w-4 h-4" />
              إلغاء التثبيت
            </button>
          </div>
          <div className="bg-gradient-to-r from-yellow-800/30 to-orange-800/30 p-4 sm:p-6 rounded-lg border border-yellow-400/30">
            <p className="text-2xl sm:text-3xl md:text-4xl text-white leading-loose text-center font-arabic mb-4">
              {pinnedVerse.text}
            </p>
            <div className="text-center text-yellow-200">
              {pinnedVerse.surah} - آية {pinnedVerse.ayah}
            </div>
          </div>
        </div>
      )}

      {/* الآية المختارة بناءً على النظام 19 */}
      {selectedVerse && (
        <div className={`bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-indigo-900/40 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border-2 ${pinnedVerse && pinnedVerse.number === selectedVerse.number ? 'border-yellow-400/70 ring-2 ring-yellow-300/50' : 'border-purple-400/50'} shadow-xl`}>
          <div className="text-center mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-purple-300 flex items-center justify-center gap-2 flex-1">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
                📖 الآية المختارة لك الآن (بناءً على النظام 19)
                {pinnedVerse && pinnedVerse.number === selectedVerse.number && (
                  <Pin className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 fill-current" />
                )}
              </h3>
              <button
                onClick={togglePinVerse}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                  pinnedVerse && pinnedVerse.number === selectedVerse.number
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
                title={pinnedVerse && pinnedVerse.number === selectedVerse.number ? 'إلغاء التثبيت' : 'تثبيت الآية'}
              >
                {pinnedVerse && pinnedVerse.number === selectedVerse.number ? (
                  <>
                    <PinOff className="w-4 h-4" />
                    إلغاء التثبيت
                  </>
                ) : (
                  <>
                    <Pin className="w-4 h-4" />
                    تثبيت
                  </>
                )}
              </button>
            </div>
            <p className="text-sm sm:text-base text-purple-200 mt-2">
              الآية رقم {selectedVerse.number} من أصل 6236 آية
            </p>
            {selectedNumber && selectedNumberInfo && (
              <div className="mt-3 p-3 bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-lg border border-yellow-400/50">
                <p className="text-sm sm:text-base text-yellow-200 text-center">
                  ⭐ هذه الآية تأثرت بالرقم المختار: <span className="font-bold text-yellow-300">{selectedNumber}</span> ({selectedNumberInfo.significance})
                </p>
              </div>
            )}
          </div>

          {verseLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <span className="mr-3 text-purple-300">جاري تحميل الآية...</span>
            </div>
          ) : selectedVerse.error ? (
            <div className="text-center p-4 text-red-300">
              <p>حدث خطأ في تحميل الآية. يرجى المحاولة لاحقاً.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* نص الآية */}
              <div className="bg-gradient-to-r from-purple-800/30 to-blue-800/30 p-4 sm:p-6 rounded-lg border border-purple-400/30">
                <p className="text-2xl sm:text-3xl md:text-4xl text-white leading-loose text-center font-arabic mb-4">
                  {selectedVerse.text}
                </p>
              </div>

              {/* معلومات الآية */}
              <div className="bg-white/10 rounded-lg p-4 border border-purple-300/30">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xs sm:text-sm text-purple-300 mb-1">السورة</div>
                    <div className="text-lg sm:text-xl font-bold text-purple-100">
                      {selectedVerse.surah} ({selectedVerse.surahNumber})
                    </div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-purple-300 mb-1">رقم الآية في السورة</div>
                    <div className="text-lg sm:text-xl font-bold text-purple-100">
                      {selectedVerse.ayah}
                    </div>
                  </div>
                </div>
              </div>

              {/* معلومات التاريخ */}
              {(selectedVerse.gregorianDate || selectedVerse.hijriDate) && (
                <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-400/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                    {selectedVerse.gregorianDate && (
                      <div>
                        <div className="text-xs sm:text-sm text-purple-300 mb-1">التاريخ الميلادي</div>
                        <div className="text-base sm:text-lg font-bold text-purple-100">
                          {selectedVerse.gregorianDate.year}/{selectedVerse.gregorianDate.month}/{selectedVerse.gregorianDate.day}
                        </div>
                      </div>
                    )}
                    {selectedVerse.hijriDate && (
                      <div>
                        <div className="text-xs sm:text-sm text-purple-300 mb-1">التاريخ الهجري</div>
                        <div className="text-base sm:text-lg font-bold text-purple-100">
                          {selectedVerse.hijriDate.year}/{selectedVerse.hijriDate.month}/{selectedVerse.hijriDate.day}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* معلومات الحساب */}
              <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg p-3 border border-indigo-400/30">
                <div className="text-xs sm:text-sm text-indigo-200 text-center">
                  <p className="mb-1">💡 تم اختيار هذه الآية بناءً على:</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    <span className="bg-purple-700/50 px-2 py-1 rounded">⏰ الوقت: {analysis.time.hours}:{String(analysis.time.minutes).padStart(2, '0')}:{String(analysis.time.seconds).padStart(2, '0')}</span>
                    <span className="bg-purple-700/50 px-2 py-1 rounded">⚡ تسلا: {analysis.teslaEnergy.teslaScore}</span>
                    <span className="bg-purple-700/50 px-2 py-1 rounded">✨ بركة: {analysis.teslaEnergy.blessedScore}</span>
                    <span className="bg-purple-700/50 px-2 py-1 rounded">🔢 النظام: 19</span>
                  </div>
                </div>
              </div>

              {/* تحليل كتاب مرقوم - الجُمَّل */}
              {kitabMarqumAnalysis && kitabMarqumAnalysis.verseAnalysis && (
                <div className="bg-gradient-to-br from-amber-900/40 via-orange-900/40 to-red-900/40 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border-2 border-amber-400/50 shadow-xl">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-amber-300" />
                    <h3 className="text-xl sm:text-2xl font-bold text-amber-300 text-center">
                      📐 حساب الجُمَّل - كتاب مرقوم
                    </h3>
                  </div>

                  {/* الحروف المقطعة للسورة */}
                  {kitabMarqumAnalysis.muqattaatAnalysis && kitabMarqumAnalysis.muqattaatAnalysis.muqattaat && (
                    <div className="bg-amber-900/30 rounded-lg p-4 mb-4 border border-amber-400/30">
                      <div className="text-center mb-3">
                        <p className="text-sm sm:text-base text-amber-200 mb-2">
                          <span className="font-bold">الحروف المقطعة للسورة:</span>
                        </p>
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                          <span className="text-2xl sm:text-3xl font-bold text-amber-300">
                            {kitabMarqumAnalysis.muqattaatAnalysis.muqattaat}
                          </span>
                          <span className="text-sm sm:text-base text-amber-200">
                            ({kitabMarqumAnalysis.muqattaatAnalysis.analysis?.description || ''})
                          </span>
                        </div>
                      </div>
                      
                      {kitabMarqumAnalysis.muqattaatAnalysis.analysis && (
                        <div className="mt-3 space-y-2">
                          {kitabMarqumAnalysis.muqattaatAnalysis.analysis.letterValues && kitabMarqumAnalysis.muqattaatAnalysis.analysis.letterValues.length > 0 && (
                            <div className="text-xs sm:text-sm text-amber-200">
                              <p className="mb-2 font-bold">قيم الحروف:</p>
                              <div className="flex flex-wrap justify-center gap-2">
                                {kitabMarqumAnalysis.muqattaatAnalysis.analysis.letterValues.map((lv, idx) => (
                                  <span key={idx} className="bg-amber-800/50 px-2 py-1 rounded">
                                    {lv.letter}: {lv.sequentialValue}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {kitabMarqumAnalysis.muqattaatAnalysis.analysis.simplePattern && (
                            <div className="text-xs sm:text-sm text-amber-200 mt-3">
                              <p className="mb-1 font-bold">النمط البسيط:</p>
                              <p className="text-center">
                                {kitabMarqumAnalysis.muqattaatAnalysis.analysis.simplePattern.pattern} = {kitabMarqumAnalysis.muqattaatAnalysis.analysis.simplePattern.sum}
                                {kitabMarqumAnalysis.muqattaatAnalysis.analysis.simplePattern.reduced !== kitabMarqumAnalysis.muqattaatAnalysis.analysis.simplePattern.sum && (
                                  <span className="mr-2"> → {kitabMarqumAnalysis.muqattaatAnalysis.analysis.simplePattern.reduced}</span>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* حساب الجُمَّل للآية */}
                  <div className="space-y-4">
                    {/* الجُمَّل الكلاسيكي */}
                    <div className="bg-amber-800/30 rounded-lg p-4 border border-amber-400/30">
                      <h4 className="text-base sm:text-lg font-bold text-amber-200 mb-3 text-center">
                        🔢 الجُمَّل الكلاسيكي
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-xs sm:text-sm text-amber-300 mb-1">المجموع الكلي</div>
                          <div className="text-2xl sm:text-3xl font-bold text-amber-100">
                            {kitabMarqumAnalysis.verseAnalysis.totalJumal}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-amber-300 mb-1">الاختزال</div>
                          <div className="text-2xl sm:text-3xl font-bold text-amber-100">
                            {kitabMarqumAnalysis.verseAnalysis.reducedJumal}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* الجُمَّل الترتيبي */}
                    <div className="bg-orange-800/30 rounded-lg p-4 border border-orange-400/30">
                      <h4 className="text-base sm:text-lg font-bold text-orange-200 mb-3 text-center">
                        📊 الجُمَّل الترتيبي (كتاب مرقوم)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-xs sm:text-sm text-orange-300 mb-1">المجموع الكلي</div>
                          <div className="text-2xl sm:text-3xl font-bold text-orange-100">
                            {kitabMarqumAnalysis.verseAnalysis.totalSequential}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-orange-300 mb-1">الاختزال</div>
                          <div className="text-2xl sm:text-3xl font-bold text-orange-100">
                            {kitabMarqumAnalysis.verseAnalysis.reducedSequential}
                          </div>
                        </div>
                      </div>
                      
                      {kitabMarqumAnalysis.verseAnalysis.sequentialPattern && (
                        <div className="mt-3 text-xs sm:text-sm text-orange-200 text-center">
                          <p className="mb-1 font-bold">النمط:</p>
                          <p className="text-base sm:text-lg">
                            {kitabMarqumAnalysis.verseAnalysis.sequentialPattern.pattern} = {kitabMarqumAnalysis.verseAnalysis.sequentialPattern.sum}
                            {kitabMarqumAnalysis.verseAnalysis.sequentialPattern.reduced !== kitabMarqumAnalysis.verseAnalysis.sequentialPattern.sum && (
                              <span className="mr-2"> → {kitabMarqumAnalysis.verseAnalysis.sequentialPattern.reduced}</span>
                            )}
                          </p>
                        </div>
                      )}
                      {!kitabMarqumAnalysis.verseAnalysis.sequentialPattern && (
                        <div className="mt-3 text-xs sm:text-sm text-orange-300 text-center">
                          <p>النمط: غير متاح</p>
                        </div>
                      )}
                    </div>

                    {/* التطابقات الرقمية */}
                    {numericMatchAlert && numericMatchAlert.matches && numericMatchAlert.matches.length > 0 && (
                      <div className="bg-gradient-to-r from-green-800/40 to-emerald-800/40 rounded-lg p-4 border-2 border-green-400/70 shadow-xl">
                        <h4 className="text-base sm:text-lg font-bold text-green-200 mb-3 text-center flex items-center justify-center gap-2">
                          <Star className="w-5 h-5 fill-current animate-pulse" />
                          🎯 التطابقات الرقمية المكتشفة
                        </h4>
                        <div className="space-y-2">
                          {numericMatchAlert.matches.map((match, idx) => (
                            <div key={idx} className="bg-green-900/50 rounded-lg p-3 border border-green-400/50">
                              <p className="text-sm sm:text-base text-green-100 text-center font-semibold">
                                {match.message}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 text-xs text-green-300 text-center">
                          <p>⏰ الوقت: {analysis.time.hours}:{String(analysis.time.minutes).padStart(2, '0')}</p>
                          {selectedVerse && (
                            <p className="mt-1">📖 رقم الآية: {selectedVerse.number}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* تفاصيل الحروف */}
                    {kitabMarqumAnalysis.verseAnalysis.letterValues && kitabMarqumAnalysis.verseAnalysis.letterValues.length > 0 && (
                      <div className="bg-red-800/30 rounded-lg p-4 border border-red-400/30">
                        <h4 className="text-base sm:text-lg font-bold text-red-200 mb-3 text-center">
                          🔤 تفاصيل الحروف
                        </h4>
                        <div className="max-h-48 overflow-y-auto">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs sm:text-sm">
                            {kitabMarqumAnalysis.verseAnalysis.letterValues
                              .filter((lv, idx, arr) => arr.findIndex(l => l.letter === lv.letter) === idx)
                              .slice(0, 20)
                              .map((lv, idx) => (
                                <div key={idx} className="bg-red-900/40 p-2 rounded text-center">
                                  <div className="font-bold text-red-100 text-lg">{lv.letter}</div>
                                  <div className="text-red-300 text-xs">
                                    ترتيبي: {lv.sequentialValue || '-'}
                                  </div>
                                  <div className="text-red-300 text-xs">
                                    كلاسيكي: {lv.jumalValue || '-'}
                                  </div>
                                  <div className="text-red-200 text-xs mt-1">
                                    التكرار: {lv.count}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* التفسير */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {selectedVerse && !selectedVerse.error && selectedVerse.surahNumber && selectedVerse.ayah && (
                      <a
                        href={`https://www.altafsir.com/Tafasir.asp?tMadhNo=1&tTafsirNo=5&tSoraNo=${selectedVerse.surahNumber}&tAyahNo=${selectedVerse.ayah}&tDisplay=yes&UserProfile=0&LanguageId=1`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                        title="فتح تفسير القرطبي في صفحة جديدة"
                      >
                        <ExternalLink className="w-2 h-4" />
                        تصفح التفسير
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setShowTafseer(!showTafseer);
                        if (!showTafseer && selectedVerse && !selectedVerse.error) {
                          fetchTafseer(selectedVerse.surahNumber, selectedVerse.ayah);
                        }
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      {showTafseer ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          إخفاء التفسير
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          عرض التفسير
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {showTafseer && (
                  <div className="bg-gradient-to-r from-purple-800/40 to-indigo-800/40 rounded-lg p-4 border border-purple-400/30">
                    {tafseerLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        <span className="mr-3 text-purple-300">جاري تحميل التفسير...</span>
                      </div>
                    ) : tafseer ? (
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <h5 className="text-base font-bold text-purple-200">
                            تفسير {tafseer.author}
                          </h5>
                          {tafseer.error && (
                            <span className="text-xs text-yellow-300 bg-yellow-900/30 px-2 py-1 rounded">
                              ⚠️ غير متاح
                            </span>
                          )}
                        </div>
                        <div className="text-sm sm:text-base text-gray-200 leading-relaxed font-arabic bg-purple-900/30 p-4 rounded-lg border border-purple-500/20">
                          {tafseer.text}
                        </div>
                        
                        {/* روابط تصفح التفسير الكامل - تظهر دائماً */}
                        {tafseer.links && (
                          <div className="mt-3 text-xs text-purple-300 bg-purple-900/30 p-3 rounded border border-purple-500/20">
                            <p className="mb-2 font-bold">🔗 تصفح التفسير الكامل على:</p>
                            <ul className="list-none mt-2 space-y-2">
                              <li>
                                <a 
                                  href={tafseer.links.altafsir} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-300 hover:text-blue-200 hover:underline flex items-center gap-2 bg-blue-900/30 px-3 py-2 rounded border border-blue-500/30 transition-colors"
                                >
                                  <BookOpen className="w-4 h-4" />
                                  موقع التفسير (altafsir.com)
                                </a>
                              </li>
                              <li>
                                <a 
                                  href={tafseer.links.islamweb} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-300 hover:text-blue-200 hover:underline flex items-center gap-2 bg-blue-900/30 px-3 py-2 rounded border border-blue-500/30 transition-colors"
                                >
                                  <BookOpen className="w-4 h-4" />
                                  إسلام ويب (islamweb.net)
                                </a>
                              </li>
                              <li>
                                <a 
                                  href={tafseer.links.quran} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-300 hover:text-blue-200 hover:underline flex items-center gap-2 bg-blue-900/30 px-3 py-2 rounded border border-blue-500/30 transition-colors"
                                >
                                  <BookOpen className="w-4 h-4" />
                                  القرآن الكريم (quran.ksu.edu.sa)
                                </a>
                              </li>
                            </ul>
                          </div>
                        )}
                        
                        {tafseer.error && (
                          <div className="mt-2 text-xs text-yellow-300 bg-yellow-900/30 px-2 py-1 rounded text-center">
                            ⚠️ التفسير غير متاح من API، استخدم الروابط أعلاه
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center p-4 text-purple-300">
                        اضغط على "عرض التفسير" لتحميل التفسير
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* الأرقام المستخرجة */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl shadow-inner">
        <h4 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
          <span>🔢</span>
          الأرقام المستخرجة من الوقت الحالي:
        </h4>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {analysis.numbers.map((num, index) => {
            const isTesla = [3, 6, 9].includes(num % 10) || [3, 6, 9].includes(num);
            const isBlessed = num === 7 || num % 10 === 7;
            
            return (
              <div
                key={index}
                className={`px-3 py-2 sm:px-5 sm:py-3 rounded-xl font-bold text-base sm:text-lg shadow-lg transform hover:scale-110 transition-transform ${
                  isTesla
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white animate-pulse'
                    : isBlessed
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {num}
                {isTesla && <Zap className="w-3 h-3 sm:w-4 sm:h-4 inline-block mr-1" />}
                {isBlessed && <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 inline-block mr-1" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* ملاحظة */}
      <div className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-y-2 px-2">
        <p className="flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          التحليل العميق يتم تلقائياً كل دقيقة
        </p>
        <p className="flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          فحص سريع للتغييرات كل 4 ثواني
        </p>
        <p className="mt-3 text-purple-600 dark:text-purple-400 font-arabic text-sm sm:text-base">
          "وَلِتَعْلَمُوا عَدَدَ السِّنِينَ وَالْحِسَابَ"
        </p>
      </div>
    </div>
  );
};

export default WhatToDoNow;