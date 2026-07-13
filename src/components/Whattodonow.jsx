import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Star, TrendingUp, Lightbulb, AlertCircle, BookOpen, Sparkles, Zap, Pin, PinOff, ChevronDown, ChevronUp, ExternalLink, Calculator } from 'lucide-react';
import { getNumberInfo, getNearestNumberInfo, calculateNumberEnergy } from './../../Quranicnumbersdatabase';
import { analyzeVerseKitabMarqum, getSurahMuqattaatInfo, jumalStandard, sequentialOrder, reduceToSingleDigit } from './../../KitabMarqumSystem';
import { predictVerseWithReduction, isqat, NATURE_LABELS } from '../features/huruf';

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

  // 🔍 البحث عن الآية المثالية مع التطابق التام
  const findPerfectMatchingVerse = async (
    baseVerseNumber,
    hours,
    minutes,
    seconds,
    teslaScore,
    blessedScore,
    recommendations,
    gregorianDate,
    hijriDate,
    selectedNumber = null,
    selectedNumberInfo = null
  ) => {
    const TOTAL_VERSES = 6236;
    const SEARCH_RANGE = 50; // تقليل النطاق لتجنب Rate Limiting من API
    const MIN_START = Math.max(1, baseVerseNumber - SEARCH_RANGE);
    const MAX_END = Math.min(TOTAL_VERSES, baseVerseNumber + SEARCH_RANGE);
    
    let bestVerse = {
      number: baseVerseNumber,
      score: 0,
      matches: []
    };
    
    // حساب قيم الوقت للبحث
    const hourReduced = reduceToSingleDigit(hours);
    const minuteReduced = reduceToSingleDigit(minutes);
    const secondReduced = reduceToSingleDigit(seconds);
    const timeSum = hours + minutes + seconds;
    const timeSumReduced = reduceToSingleDigit(timeSum);
    const hourMinuteSum = hours + minutes;
    const minuteSecondSum = minutes + seconds;
    
    // دالة مساعدة لحساب نقاط التطابق - محسّنة لعرض المزيد من التطابقات
    const calculateMatchScore = (verseNum, marqumAnalysis) => {
      if (!marqumAnalysis || !marqumAnalysis.verseAnalysis) return { score: 0, matches: [] };
      
      const { totalJumal, reducedJumal, totalSequential, reducedSequential } = marqumAnalysis.verseAnalysis;
      const surahNum = marqumAnalysis.surahNumber || 0;
      const ayahInSurah = marqumAnalysis.ayahNumber || 0;
      
      let matchScore = 0;
      const matches = [];
      
      // تطابقات الوقت مع الجُمَّل الكلاسيكي (مفصلة)
      if (hours === totalJumal) { matchScore += 50; matches.push(`اختزال الساعة (${hours}) = الجُمَّل الكلاسيكي الكامل (${totalJumal})`); }
      if (hours === reducedJumal) { matchScore += 45; matches.push(`الساعة (${hours}) = اختزال الجُمَّل الكلاسيكي (${reducedJumal})`); }
      if (minutes === totalJumal) { matchScore += 50; matches.push(`الدقيقة (${minutes}) = الجُمَّل الكلاسيكي الكامل (${totalJumal})`); }
      if (minutes === reducedJumal) { matchScore += 45; matches.push(`الدقيقة (${minutes}) = اختزال الجُمَّل الكلاسيكي (${reducedJumal})`); }
      if (seconds === totalJumal) { matchScore += 50; matches.push(`الثانية (${seconds}) = الجُمَّل الكلاسيكي الكامل (${totalJumal})`); }
      if (seconds === reducedJumal) { matchScore += 45; matches.push(`الثانية (${seconds}) = اختزال الجُمَّل الكلاسيكي (${reducedJumal})`); }
      if (hourReduced === reducedJumal) { matchScore += 40; matches.push(`اختزال الساعة (${hourReduced}) = اختزال الجُمَّل الكلاسيكي (${reducedJumal})`); }
      if (hourReduced === totalJumal) { matchScore += 42; matches.push(`اختزال الساعة (${hourReduced}) = الجُمَّل الكلاسيكي الكامل (${totalJumal})`); }
      if (minuteReduced === reducedJumal) { matchScore += 40; matches.push(`اختزال الدقيقة (${minuteReduced}) = اختزال الجُمَّل الكلاسيكي (${reducedJumal})`); }
      if (minuteReduced === totalJumal) { matchScore += 42; matches.push(`اختزال الدقيقة (${minuteReduced}) = الجُمَّل الكلاسيكي الكامل (${totalJumal})`); }
      if (secondReduced === reducedJumal) { matchScore += 40; matches.push(`اختزال الثانية (${secondReduced}) = اختزال الجُمَّل الكلاسيكي (${reducedJumal})`); }
      if (secondReduced === totalJumal) { matchScore += 42; matches.push(`اختزال الثانية (${secondReduced}) = الجُمَّل الكلاسيكي الكامل (${totalJumal})`); }
      
      // تطابقات الوقت مع الجُمَّل الترتيبي (مفصلة)
      if (hours === totalSequential) { matchScore += 50; matches.push(`الساعة (${hours}) = الجُمَّل الترتيبي الكامل (${totalSequential})`); }
      if (hours === reducedSequential) { matchScore += 45; matches.push(`الساعة (${hours}) = اختزال الجُمَّل الترتيبي (${reducedSequential})`); }
      if (minutes === totalSequential) { matchScore += 50; matches.push(`الدقيقة (${minutes}) = الجُمَّل الترتيبي الكامل (${totalSequential})`); }
      if (minutes === reducedSequential) { matchScore += 45; matches.push(`الدقيقة (${minutes}) = اختزال الجُمَّل الترتيبي (${reducedSequential})`); }
      if (seconds === totalSequential) { matchScore += 50; matches.push(`الثانية (${seconds}) = الجُمَّل الترتيبي الكامل (${totalSequential})`); }
      if (seconds === reducedSequential) { matchScore += 45; matches.push(`الثانية (${seconds}) = اختزال الجُمَّل الترتيبي (${reducedSequential})`); }
      if (hourReduced === reducedSequential) { matchScore += 40; matches.push(`اختزال الساعة (${hourReduced}) = اختزال الجُمَّل الترتيبي (${reducedSequential})`); }
      if (hourReduced === totalSequential) { matchScore += 42; matches.push(`اختزال الساعة (${hourReduced}) = الجُمَّل الترتيبي الكامل (${totalSequential})`); }
      if (minuteReduced === reducedSequential) { matchScore += 40; matches.push(`اختزال الدقيقة (${minuteReduced}) = اختزال الجُمَّل الترتيبي (${reducedSequential})`); }
      if (minuteReduced === totalSequential) { matchScore += 42; matches.push(`اختزال الدقيقة (${minuteReduced}) = الجُمَّل الترتيبي الكامل (${totalSequential})`); }
      if (secondReduced === reducedSequential) { matchScore += 40; matches.push(`اختزال الثانية (${secondReduced}) = اختزال الجُمَّل الترتيبي (${reducedSequential})`); }
      if (secondReduced === totalSequential) { matchScore += 42; matches.push(`اختزال الثانية (${secondReduced}) = الجُمَّل الترتيبي الكامل (${totalSequential})`); }
      
      // تطابقات مجموع الوقت (مفصلة)
      if (timeSum === totalJumal) { matchScore += 60; matches.push(`مجموع الوقت (${timeSum}) = الجُمَّل الكلاسيكي الكامل (${totalJumal})`); }
      if (timeSum === totalSequential) { matchScore += 60; matches.push(`مجموع الوقت (${timeSum}) = الجُمَّل الترتيبي الكامل (${totalSequential})`); }
      if (timeSumReduced === reducedJumal) { matchScore += 50; matches.push(`اختزال مجموع الوقت (${timeSumReduced}) = اختزال الجُمَّل الكلاسيكي (${reducedJumal})`); }
      if (timeSumReduced === reducedSequential) { matchScore += 50; matches.push(`اختزال مجموع الوقت (${timeSumReduced}) = اختزال الجُمَّل الترتيبي (${reducedSequential})`); }
      if (timeSumReduced === totalJumal) { matchScore += 52; matches.push(`اختزال مجموع الوقت (${timeSumReduced}) = الجُمَّل الكلاسيكي الكامل (${totalJumal})`); }
      if (timeSumReduced === totalSequential) { matchScore += 52; matches.push(`اختزال مجموع الوقت (${timeSumReduced}) = الجُمَّل الترتيبي الكامل (${totalSequential})`); }
      if (hourMinuteSum === totalJumal) { matchScore += 45; matches.push(`الساعة+الدقيقة (${hourMinuteSum}) = الجُمَّل الكلاسيكي (${totalJumal})`); }
      if (hourMinuteSum === totalSequential) { matchScore += 45; matches.push(`الساعة+الدقيقة (${hourMinuteSum}) = الجُمَّل الترتيبي (${totalSequential})`); }
      if (minuteSecondSum === totalJumal) { matchScore += 45; matches.push(`الدقيقة+الثانية (${minuteSecondSum}) = الجُمَّل الكلاسيكي (${totalJumal})`); }
      if (minuteSecondSum === totalSequential) { matchScore += 45; matches.push(`الدقيقة+الثانية (${minuteSecondSum}) = الجُمَّل الترتيبي (${totalSequential})`); }
      
      // تطابقات رقم الآية مع الوقت (مفصلة)
      if (verseNum === hours) { matchScore += 70; matches.push(`رقم الآية الكلي (${verseNum}) = الساعة (${hours})`); }
      if (verseNum === minutes) { matchScore += 70; matches.push(`رقم الآية الكلي (${verseNum}) = الدقيقة (${minutes})`); }
      if (verseNum === seconds) { matchScore += 70; matches.push(`رقم الآية الكلي (${verseNum}) = الثانية (${seconds})`); }
      const verseReduced = reduceToSingleDigit(verseNum);
      if (verseReduced === hourReduced) { matchScore += 55; matches.push(`اختزال رقم الآية (${verseReduced}) = اختزال الساعة (${hourReduced})`); }
      if (verseReduced === minuteReduced) { matchScore += 55; matches.push(`اختزال رقم الآية (${verseReduced}) = اختزال الدقيقة (${minuteReduced})`); }
      if (verseReduced === secondReduced) { matchScore += 55; matches.push(`اختزال رقم الآية (${verseReduced}) = اختزال الثانية (${secondReduced})`); }
      if (verseNum === timeSum) { matchScore += 65; matches.push(`رقم الآية الكلي (${verseNum}) = مجموع الوقت الكامل (${timeSum})`); }
      if (verseNum === hourMinuteSum) { matchScore += 63; matches.push(`رقم الآية الكلي (${verseNum}) = الساعة+الدقيقة (${hourMinuteSum})`); }
      if (verseNum === minuteSecondSum) { matchScore += 63; matches.push(`رقم الآية الكلي (${verseNum}) = الدقيقة+الثانية (${minuteSecondSum})`); }
      
      // تطابقات رقم الآية في السورة مع الوقت
      if (ayahInSurah > 0) {
        const ayahReduced = reduceToSingleDigit(ayahInSurah);
        if (ayahInSurah === hours) { matchScore += 65; matches.push(`رقم الآية في السورة (${ayahInSurah}) = الساعة (${hours})`); }
        if (ayahInSurah === minutes) { matchScore += 65; matches.push(`رقم الآية في السورة (${ayahInSurah}) = الدقيقة (${minutes})`); }
        if (ayahInSurah === seconds) { matchScore += 65; matches.push(`رقم الآية في السورة (${ayahInSurah}) = الثانية (${seconds})`); }
        if (ayahReduced === hourReduced) { matchScore += 50; matches.push(`اختزال رقم الآية في السورة (${ayahReduced}) = اختزال الساعة (${hourReduced})`); }
        if (ayahReduced === minuteReduced) { matchScore += 50; matches.push(`اختزال رقم الآية في السورة (${ayahReduced}) = اختزال الدقيقة (${minuteReduced})`); }
      }
      
      // تطابقات رقم السورة
      if (surahNum > 0) {
        const surahReduced = reduceToSingleDigit(surahNum);
        if (surahNum === hours) { matchScore += 60; matches.push(`رقم السورة (${surahNum}) = الساعة (${hours})`); }
        if (surahNum === minutes) { matchScore += 60; matches.push(`رقم السورة (${surahNum}) = الدقيقة (${minutes})`); }
        if (surahReduced === hourReduced) { matchScore += 45; matches.push(`اختزال رقم السورة (${surahReduced}) = اختزال الساعة (${hourReduced})`); }
        if (surahReduced === minuteReduced) { matchScore += 45; matches.push(`اختزال رقم السورة (${surahReduced}) = اختزال الدقيقة (${minuteReduced})`); }
        if (surahNum === totalJumal || surahNum === totalSequential) { matchScore += 55; matches.push(`رقم السورة (${surahNum}) = الجُمَّل`); }
      }
      
      // تطابقات رقم الآية مع الجُمَّل (مفصلة)
      if (verseNum === totalJumal) { matchScore += 60; matches.push(`رقم الآية الكلي (${verseNum}) = الجُمَّل الكلاسيكي الكامل (${totalJumal})`); }
      if (verseNum === reducedJumal) { matchScore += 58; matches.push(`رقم الآية الكلي (${verseNum}) = اختزال الجُمَّل الكلاسيكي (${reducedJumal})`); }
      if (verseNum === totalSequential) { matchScore += 60; matches.push(`رقم الآية الكلي (${verseNum}) = الجُمَّل الترتيبي الكامل (${totalSequential})`); }
      if (verseNum === reducedSequential) { matchScore += 58; matches.push(`رقم الآية الكلي (${verseNum}) = اختزال الجُمَّل الترتيبي (${reducedSequential})`); }
      if (verseReduced === reducedJumal) { matchScore += 50; matches.push(`اختزال رقم الآية (${verseReduced}) = اختزال الجُمَّل الكلاسيكي (${reducedJumal})`); }
      if (verseReduced === reducedSequential) { matchScore += 50; matches.push(`اختزال رقم الآية (${verseReduced}) = اختزال الجُمَّل الترتيبي (${reducedSequential})`); }
      if (verseReduced === totalJumal) { matchScore += 52; matches.push(`اختزال رقم الآية (${verseReduced}) = الجُمَّل الكلاسيكي الكامل (${totalJumal})`); }
      if (verseReduced === totalSequential) { matchScore += 52; matches.push(`اختزال رقم الآية (${verseReduced}) = الجُمَّل الترتيبي الكامل (${totalSequential})`); }
      
      // تطابقات الرقم المختار (مفصلة)
      if (selectedNumber) {
        const selectedNum = Number(selectedNumber);
        const selectedReduced = reduceToSingleDigit(selectedNum);
        if (selectedNum === totalJumal) { matchScore += 80; matches.push(`⭐ الرقم المختار (${selectedNum}) = الجُمَّل الكلاسيكي الكامل (${totalJumal})`); }
        if (selectedNum === totalSequential) { matchScore += 80; matches.push(`⭐ الرقم المختار (${selectedNum}) = الجُمَّل الترتيبي الكامل (${totalSequential})`); }
        if (selectedReduced === reducedJumal) { matchScore += 70; matches.push(`⭐ اختزال الرقم المختار (${selectedReduced}) = اختزال الجُمَّل الكلاسيكي (${reducedJumal})`); }
        if (selectedReduced === reducedSequential) { matchScore += 70; matches.push(`⭐ اختزال الرقم المختار (${selectedReduced}) = اختزال الجُمَّل الترتيبي (${reducedSequential})`); }
        if (selectedNum === verseNum) { matchScore += 90; matches.push(`⭐ الرقم المختار (${selectedNum}) = رقم الآية الكلي (${verseNum})`); }
        if (selectedNum === hours) { matchScore += 75; matches.push(`⭐ الرقم المختار (${selectedNum}) = الساعة (${hours})`); }
        if (selectedNum === minutes) { matchScore += 75; matches.push(`⭐ الرقم المختار (${selectedNum}) = الدقيقة (${minutes})`); }
        if (selectedReduced === hourReduced) { matchScore += 65; matches.push(`⭐ اختزال الرقم المختار (${selectedReduced}) = اختزال الساعة (${hourReduced})`); }
        if (selectedReduced === minuteReduced) { matchScore += 65; matches.push(`⭐ اختزال الرقم المختار (${selectedReduced}) = اختزال الدقيقة (${minuteReduced})`); }
      }
      
      // تطابقات خاصة — إسقاطات نطاق الحروف (٤ طبائع، ٧ كواكب، ٩ مراتب، ١٢ بروج، ٢٨ منازل)
      const hurufModuli = [4, 7, 9, 12, 28];
      hurufModuli.forEach((modulus) => {
        const jumalIsqat = isqat(totalJumal, modulus);
        const seqIsqat = isqat(totalSequential, modulus);
        const timeIsqat = isqat(timeSum, modulus);
        if (jumalIsqat === hourReduced || jumalIsqat === minuteReduced) {
          matchScore += 28;
          matches.push(`🔤 إسقاط ${modulus} للجُمَّل (${jumalIsqat}) يطابق اختزال الوقت`);
        }
        if (seqIsqat === hourReduced || seqIsqat === minuteReduced) {
          matchScore += 28;
          matches.push(`🔤 إسقاط ${modulus} للجُمَّل الترتيبي (${seqIsqat}) يطابق اختزال الوقت`);
        }
        if (jumalIsqat === timeIsqat) {
          matchScore += 25;
          matches.push(`🔤 إسقاط ${modulus}: الجُمَّل (${jumalIsqat}) = مجموع الوقت (${timeIsqat})`);
        }
      });
      
      // تطابقات إضافية - تسلا (3-6-9)
      const teslaNumbers = [3, 6, 9];
      const isTeslaJumal = teslaNumbers.includes(reducedJumal) || teslaNumbers.includes(reducedSequential);
      const isTeslaTime = teslaNumbers.includes(hourReduced) || teslaNumbers.includes(minuteReduced);
      if (isTeslaJumal && isTeslaTime) {
        matchScore += 35; matches.push(`⚡ تطابق تسلا: اختزال الجُمَّل (${reducedJumal || reducedSequential}) مع اختزال الوقت (${hourReduced || minuteReduced})`);
      }
      
      return { score: matchScore, matches };
    };
    
    // أولاً: فحص الآية الأولية نفسها (الأكثر أهمية)
    try {
      const baseResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${baseVerseNumber}/editions/quran-uthmani`, {
        headers: { 'Accept': 'application/json' }
      });
      if (baseResponse.ok) {
        const baseData = await baseResponse.json();
        if (baseData.code === 200 && baseData.data && baseData.data.length && baseData.data[0].text) {
          const surahNumber = baseData.data[0].surah?.number || 0;
          const ayahNumber = baseData.data[0].numberInSurah || 0;
          if (surahNumber && ayahNumber) {
            const marqumAnalysis = analyzeVerseKitabMarqum(surahNumber, ayahNumber, baseData.data[0].text);
            if (marqumAnalysis && marqumAnalysis.verseAnalysis) {
              const { score, matches } = calculateMatchScore(baseVerseNumber, marqumAnalysis);
              const matchesCount = matches?.length || 0;
              const bestMatchesCount = bestVerse.matches?.length || 0;
              
              // تحديث أفضل آية بناءً على عدد التطابقات أولاً
              if (matchesCount > bestMatchesCount || 
                  (matchesCount === bestMatchesCount && score > bestVerse.score)) {
                bestVerse = { number: baseVerseNumber, score, matches, marqumAnalysis };
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn('Error checking base verse:', error);
    }
    
    // البحث في النطاق (بخطوة أكبر لتقليل عدد الطلبات)
    const searchPromises = [];
    const MAX_SEARCH_VERSE_COUNT = 15; // تقليل عدد الآيات المفحوصة لتجنب Rate Limiting
    const searchStep = Math.max(5, Math.floor((SEARCH_RANGE * 2) / MAX_SEARCH_VERSE_COUNT));
    
    for (let verseNum = MIN_START; verseNum <= MAX_END; verseNum += searchStep) {
      // تجنب فحص الآية الأولية مرة أخرى
      if (verseNum === baseVerseNumber) continue;
      searchPromises.push(
        (async () => {
          try {
            // جلب نص الآية
            const response = await fetch(`https://api.alquran.cloud/v1/ayah/${verseNum}/editions/quran-uthmani`, {
              headers: { 'Accept': 'application/json' }
            });
            
            // معالجة Rate Limiting (429)
            if (response.status === 429) {
              console.warn(`Rate limit exceeded for verse ${verseNum}`);
              return null;
            }
            
            if (!response.ok) return null;
            
            const data = await response.json();
            if (data.code !== 200 || !data.data || !data.data.length) return null;
            
            const verseText = data.data[0].text;
            if (!verseText) return null;
            
            // حساب تحليل كتاب مرقوم
            const surahNumber = data.data[0].surah?.number || 0;
            const ayahNumber = data.data[0].numberInSurah || 0;
            if (!surahNumber || !ayahNumber) return null;
            
            const marqumAnalysis = analyzeVerseKitabMarqum(surahNumber, ayahNumber, verseText);
            if (!marqumAnalysis || !marqumAnalysis.verseAnalysis) return null;
            
            // استخدام الدالة المساعدة لحساب نقاط التطابق
            const { score, matches } = calculateMatchScore(verseNum, marqumAnalysis);
            
            return {
              number: verseNum,
              score: score,
              matches: matches,
              marqumAnalysis: marqumAnalysis
            };
          } catch (error) {
            return null;
          }
        })()
      );
    }
    
    // تنفيذ البحث المتوازي (مع حد أقصى 2 طلبات متزامنة لتجنب Rate Limiting)
    const results = [];
    const BATCH_SIZE = 2; // تقليل batch size لتجنب 429 errors
    const BATCH_DELAY = 300; // تأخير 300ms بين الـ batches
    
    for (let i = 0; i < searchPromises.length; i += BATCH_SIZE) {
      const batch = searchPromises.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch);
      results.push(...batchResults.filter(r => r !== null));
      
      // إضافة تأخير بين الـ batches لتجنب Rate Limiting
      if (i + BATCH_SIZE < searchPromises.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }
    
    // ترتيب النتائج بناءً على عدد التطابقات أولاً، ثم النقاط
    results.sort((a, b) => {
      const aMatches = a?.matches?.length || 0;
      const bMatches = b?.matches?.length || 0;
      
      // الأولوية لأكبر عدد تطابقات
      if (aMatches !== bMatches) {
        return bMatches - aMatches; // ترتيب تنازلي (الأكبر أولاً)
      }
      
      // إذا كان نفس عدد التطابقات، نرتب حسب النقاط
      return (b?.score || 0) - (a?.score || 0);
    });
    
    // تحديث أفضل آية من النتائج - الأولوية لأكبر عدد تطابقات
    results.forEach(result => {
      if (result) {
        const resultMatchesCount = result.matches?.length || 0;
        const bestMatchesCount = bestVerse.matches?.length || 0;
        
        // أولاً: اختر الآية التي لديها أكبر عدد تطابقات
        if (resultMatchesCount > bestMatchesCount) {
          bestVerse = result;
        }
        // ثانياً: إذا كانت نفس عدد التطابقات، اختر التي لديها أعلى نقاط
        else if (resultMatchesCount === bestMatchesCount && result.score > bestVerse.score) {
          bestVerse = result;
        }
        // ثالثاً: إذا كان عدد التطابقات أقل ولكن النقاط أعلى بكثير جداً (أكثر من 100 نقطة)
        // فقط في هذه الحالة نفضل النقاط على عدد التطابقات
        else if (resultMatchesCount < bestMatchesCount && 
                 bestMatchesCount > 0 && // لا نفضل النقاط إذا لم يكن هناك تطابقات أصلاً
                 result.score > bestVerse.score + 100) {
          // نفضل الآية التي لديها نقاط أعلى بكثير جداً فقط
          bestVerse = result;
        }
      }
    });
    
    return bestVerse;
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
          hijriDate: meta.hijriDate || null,
          hurufMeta: meta.hurufMeta || null,
          reduction: meta.reduction || null,
          sourceTrace: meta.sourceTrace || null,
        };
        
        setSelectedVerse(verse);
        
        let marqumAnalysis = null;
        
        if (!marqumAnalysis && verseData.text && verseData.surah?.number && verseData.numberInSurah) {
          try {
            marqumAnalysis = analyzeVerseKitabMarqum(
              verseData.surah.number,
              verseData.numberInSurah,
              verseData.text
            );
          } catch (error) {
            console.error('Error analyzing Kitab Marqum:', error);
            marqumAnalysis = null;
          }
        }
        
        if (marqumAnalysis) {
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
                matches,
                timestamp: new Date(),
                reduction: meta.reduction || null,
              });
              // إخفاء الإشعار بعد 15 ثانية للتطابق التام
              setTimeout(() => {
                setNumericMatchAlert(null);
              }, 15000);
            }
          }
        } else {
          setKitabMarqumAnalysis(null);
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
    
    // الآية المتنبأ بها عبر محرك الاختزال الموحّد (استنطاق + جُمَّل + إسقاط → reduce)
    predictVerseWithReduction(time, {
      selectedNumber,
      previousMarqumAnalysis: kitabMarqumAnalysis,
    })
      .then((predicted) => {
        fetchVerseFromAPI(predicted.verseNumber, {
          gregorianDate,
          hijriDate,
          currentTime: time,
          hurufMeta: predicted.hurufMeta,
          reduction: predicted.reduction,
          sourceTrace: predicted.sourceTrace,
        });
      })
      .catch((error) => {
        console.error('Error predicting verse via reduction engine:', error);
      });
    
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

      {/* إشعار التطابق الرقمي - محسّن لعرض المزيد من التطابقات */}
      {numericMatchAlert && numericMatchAlert.matches && numericMatchAlert.matches.length > 0 && (
        <div className="fixed top-20 sm:top-24 left-1/2 transform -translate-x-1/2 z-50 px-2 w-full max-w-2xl animate-pulse">
          <div className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-2xl border-2 border-yellow-300">
            <div className="flex items-start gap-3">
              <Star className="w-6 h-6 sm:w-8 sm:h-8 animate-spin flex-shrink-0 mt-1 fill-current" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-base sm:text-lg">🎯 تطابق رقمي مذهل!</h4>
                  {numericMatchAlert.reduction && (
                    <span className="text-xs sm:text-sm bg-yellow-400/30 px-2 py-1 rounded-full">
                      اختزال: {numericMatchAlert.reduction.canonicalNumber}
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-yellow-100 mb-3 text-center">
                  ({numericMatchAlert.matches.length} تطابق مكتشف)
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto bg-white/10 rounded-lg p-2 border border-white/20">
                  {numericMatchAlert.matches.map((match, idx) => (
                    <div 
                      key={idx} 
                      className={`rounded-lg p-2 sm:p-3 text-xs sm:text-sm ${
                        match.matchType === 'perfect' 
                          ? 'bg-yellow-500/40 border border-yellow-300/50' 
                          : 'bg-white/20 border border-white/30'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-yellow-200 min-w-[25px]">{idx + 1}.</span>
                        <p className="font-semibold flex-1 text-right">
                          {typeof match === 'string' ? match : match.message}
                          {match.matchType === 'perfect' && ' ⭐'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {numericMatchAlert.reduction && (
                  <div className="mt-3 p-2 bg-yellow-500/30 rounded-lg border border-yellow-300/50">
                    <div className="text-xs text-center text-yellow-100">
                      🔤 اختزال الآية: الرقم المرجعي {numericMatchAlert.reduction.canonicalNumber}
                      {' · '}
                      البرج {numericMatchAlert.reduction.lattice.burj?.name || '—'}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setNumericMatchAlert(null)}
                  className="mt-3 w-full text-xs sm:text-sm bg-white/20 hover:bg-white/30 rounded-lg py-2 transition-colors font-semibold"
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

      {/* الآية المختارة بناءً على نطاق الحروف */}
      {selectedVerse && (
        <div className={`bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-indigo-900/40 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border-2 ${pinnedVerse && pinnedVerse.number === selectedVerse.number ? 'border-yellow-400/70 ring-2 ring-yellow-300/50' : 'border-purple-400/50'} shadow-xl`}>
          <div className="text-center mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-purple-300 flex items-center justify-center gap-2 flex-1">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
                📖 الآية المختارة لك الآن (نطاق الحروف — علم الحروف)
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
            {selectedVerse.reduction && (
              <div className="mt-3 p-3 bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-lg border border-green-400/50">
                <p className="text-sm sm:text-base text-green-200 text-center font-bold mb-1">
                  🔤 تم اختيار هذه الآية عبر محرك الاختزال الموحّد
                </p>
                <p className="text-xs sm:text-sm text-green-300 text-center">
                  الرقم المرجعي:{' '}
                  <span className="font-bold text-green-100 text-base">
                    {selectedVerse.reduction.canonicalNumber}
                    {selectedVerse.reduction.canonicalNumber === 10 ? ' (الياء)' : ''}
                  </span>
                  {' · '}
                  جُمَّل النص:{' '}
                  <span className="font-bold text-green-100">{selectedVerse.reduction.rawTotal}</span>
                </p>
                <p className="text-xs text-green-400 text-center mt-1">
                  المرتبة {selectedVerse.reduction.lattice.rank}
                  {' · '}
                  الطبيعة{' '}
                  {selectedVerse.reduction.lattice.nature
                    ? NATURE_LABELS[selectedVerse.reduction.lattice.nature]?.ar
                    : '—'}
                  {' · '}
                  البرج {selectedVerse.reduction.lattice.burj?.name || '—'}
                </p>
              </div>
            )}
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
                    <span className="bg-purple-700/50 px-2 py-1 rounded">🔤 محرك الاختزال</span>
                    <span className="bg-purple-700/50 px-2 py-1 rounded">📜 مقياس النص</span>
                  </div>
                  {selectedVerse.hurufMeta && (
                    <div className="mt-2 space-y-1 text-xs text-indigo-300">
                      {selectedVerse.hurufMeta.hijriYearIstintaq && (
                        <p>استنطاق العام الهجري: <span className="font-bold text-indigo-100">{selectedVerse.hurufMeta.hijriYearIstintaq}</span></p>
                      )}
                      {selectedVerse.hurufMeta.timeIstintaq && (
                        <p className="break-words">استنطاق الوقت: <span className="font-bold text-indigo-100">{selectedVerse.hurufMeta.timeIstintaq}</span></p>
                      )}
                      {selectedVerse.hurufMeta.profiles?.hijriYear && (
                        <p>
                          جُمَّل العام: {selectedVerse.hurufMeta.profiles.hijriYear.kabir}
                          {' · '}إسقاط ٩: {selectedVerse.hurufMeta.profiles.hijriYear.isqat9}
                          {' · '}إسقاط ٢٨: {selectedVerse.hurufMeta.profiles.hijriYear.isqat28}
                        </p>
                      )}
                    </div>
                  )}
                  {selectedVerse.reduction && (
                    <div className="mt-2 pt-2 border-t border-indigo-500/30">
                      <p className="text-yellow-300 font-bold text-sm">
                        🎯 معيار الاختيار:{' '}
                        <span className="text-yellow-200">محرك الاختزال — reduce(scale: text)</span>
                      </p>
                      <p className="text-xs text-indigo-300 mt-1 text-center">
                        {selectedVerse.reduction.reading}
                      </p>
                      {selectedVerse.reduction.trace?.steps && (
                        <div className="mt-2 flex flex-wrap justify-center gap-1">
                          {selectedVerse.reduction.trace.steps.map((step, idx) => (
                            <span key={idx} className="bg-indigo-800/50 px-2 py-0.5 rounded text-[10px]">
                              {step.label}: {step.value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
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

                    {/* التطابقات الرقمية - العلاقة الموحدة */}
                    {numericMatchAlert && numericMatchAlert.matches && numericMatchAlert.matches.length > 0 && (
                      <div className="bg-gradient-to-r from-green-800/40 via-emerald-800/40 to-teal-800/40 rounded-lg p-4 border-2 border-green-400/70 shadow-xl">
                        <h4 className="text-base sm:text-lg font-bold text-green-200 mb-4 text-center flex items-center justify-center gap-2">
                          <Star className="w-6 h-6 fill-current animate-pulse" />
                          🎯 العلاقة الموحدة - التطابق التام
                        </h4>
                        
                        {/* ملخص العلاقة */}
                        <div className="bg-green-900/60 rounded-lg p-4 mb-4 border border-green-300/50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center mb-3">
                            <div>
                              <div className="text-xs sm:text-sm text-green-300 mb-1">⏰ الوقت الحالي</div>
                              <div className="text-xl sm:text-2xl font-bold text-green-100">
                                {analysis.time.hours}:{String(analysis.time.minutes).padStart(2, '0')}:{String(analysis.time.seconds).padStart(2, '0')}
                              </div>
                            </div>
                            {selectedVerse && (
                              <div>
                                <div className="text-xs sm:text-sm text-green-300 mb-1">📖 رقم الآية</div>
                                <div className="text-xl sm:text-2xl font-bold text-green-100">
                                  {selectedVerse.number}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {kitabMarqumAnalysis && kitabMarqumAnalysis.verseAnalysis && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                              <div>
                                <div className="text-xs sm:text-sm text-green-300 mb-1">🔢 الجُمَّل الكلاسيكي</div>
                                <div className="text-lg sm:text-xl font-bold text-green-100">
                                  {kitabMarqumAnalysis.verseAnalysis.totalJumal} → {kitabMarqumAnalysis.verseAnalysis.reducedJumal}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs sm:text-sm text-green-300 mb-1">📊 الجُمَّل الترتيبي</div>
                                <div className="text-lg sm:text-xl font-bold text-green-100">
                                  {kitabMarqumAnalysis.verseAnalysis.totalSequential} → {kitabMarqumAnalysis.verseAnalysis.reducedSequential}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* التطابقات المكتشفة */}
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {numericMatchAlert.matches.map((match, idx) => (
                            <div key={idx} className={`rounded-lg p-3 border ${
                              match.matchType === 'perfect' 
                                ? 'bg-yellow-900/60 border-yellow-400/70' 
                                : 'bg-green-900/50 border-green-400/50'
                            }`}>
                              <p className={`text-sm sm:text-base text-center font-semibold ${
                                match.matchType === 'perfect' ? 'text-yellow-100' : 'text-green-100'
                              }`}>
                                {typeof match === 'string' ? match : match.message}
                                {match.matchType === 'perfect' && ' ⭐'}
                              </p>
                            </div>
                          ))}
                        </div>
                        
                        {/* معلومات إضافية */}
                        {numericMatchAlert.reduction && (
                          <div className="mt-3 p-4 bg-yellow-900/50 rounded-lg border-2 border-yellow-400/60">
                            <div className="text-sm sm:text-base text-yellow-200 text-center mb-3">
                              <p className="font-bold text-lg mb-1">🔤 اختزال محرك الحروف</p>
                              <p className="text-base">
                                الرقم المرجعي:{' '}
                                <span className="font-bold text-yellow-100 text-lg">
                                  {numericMatchAlert.reduction.canonicalNumber}
                                </span>
                              </p>
                              <p className="text-xs text-yellow-300 mt-1">
                                {numericMatchAlert.reduction.reading}
                              </p>
                            </div>
                          </div>
                        )}
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