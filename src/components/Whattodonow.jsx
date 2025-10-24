import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Star, TrendingUp, Lightbulb, AlertCircle, BookOpen, Sparkles, Zap } from 'lucide-react';
import { getNumberInfo, getNearestNumberInfo, calculateNumberEnergy } from './quranicNumbersDatabase';

const WhatToDoNow = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pulseEffect, setPulseEffect] = useState(false);
  const [lastSignificantChange, setLastSignificantChange] = useState(null);
  
  // حالات التنبيه
  const [alerts, setAlerts] = useState({
    teslaChange: false,
    blessedChange: false,
    majorNumberChange: false
  });

  // ===== نظام التحديث الذكي متعدد المستويات =====
  
  // المستوى 1: تحديث العرض كل ثانية (للساعة فقط)
  useEffect(() => {
    const displayTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(displayTimer);
  }, []);

  // المستوى 2: تحليل سريع كل 5 ثواني (للتغييرات الصغيرة)
  useEffect(() => {
    const quickAnalysisTimer = setInterval(() => {
      quickAnalysis(new Date());
    }, 5000);
    
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
    
    // استخراج الأرقام
    const timeNumbers = extractNumbersFromTime(hours, minutes, seconds);
    
    // تحليل الأرقام المستخرجة
    const recommendations = analyzeNumbers(timeNumbers);
    
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
    
    setIsLoading(false);
  }, [analysis]);

  // فحص التغيير الجوهري
  const checkSignificantChange = (newRecs, oldRecs, newEnergy, oldEnergy) => {
    if (newEnergy.level !== oldEnergy.level) return true;
    if (newRecs.length !== oldRecs.length) return true;
    if (newEnergy.teslaScore !== oldEnergy.teslaScore) return true;
    if (newEnergy.blessedScore !== oldEnergy.blessedScore) return true;
    return false;
  };

  // استخراج الأرقام من الوقت بذكاء
  const extractNumbersFromTime = (hours, minutes, seconds) => {
    const numbers = new Set();
    
    numbers.add(hours);
    numbers.add(minutes);
    numbers.add(seconds);
    
    [hours, minutes, seconds].forEach(num => {
      if (num >= 10) {
        numbers.add(Math.floor(num / 10));
        numbers.add(num % 10);
      }
    });
    
    const totalSum = hours + minutes + seconds;
    numbers.add(totalSum);
    
    let reducedSum = totalSum;
    while (reducedSum > 9 && reducedSum !== 11 && reducedSum !== 22 && reducedSum !== 33) {
      reducedSum = String(reducedSum)
        .split('')
        .reduce((a, b) => parseInt(a) + parseInt(b), 0);
    }
    numbers.add(reducedSum);
    
    numbers.add(hours + minutes);
    if (minutes > seconds) numbers.add(minutes - seconds);
    
    return Array.from(numbers).sort((a, b) => b - a);
  };

  // تحليل الأرقام
  const analyzeNumbers = (numbers) => {
    const recommendations = [];
    const priorities = {
      tesla: 10,
      blessed: 9,
      fundamental: 8,
      compound: 7,
      decade: 6,
      large: 5
    };
    
    for (const num of numbers) {
      const info = getNumberInfo(num);
      const energy = calculateNumberEnergy(num);
      
      if (info && info.verses && info.verses.length > 0) {
        const verse = selectBestVerse(info.verses, energy);
        recommendations.push({
          number: num,
          verse: verse,
          significance: info.significance,
          generalAdvice: info.generalAdvice,
          energy: energy,
          priority: priorities[energy.classification] || 0
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
            priority: priorities[energy.classification] || 0
          });
        }
      }
    }
    
    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);
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

  // حساب طاقة الوقت
  const calculateTeslaEnergy = (hours, minutes, seconds, numbers) => {
    const teslaNumbers = [3, 6, 9];
    const teslaScore = numbers.filter(n => teslaNumbers.includes(n % 10) || teslaNumbers.includes(n)).length;
    
    const blessedScore = numbers.filter(n => n === 7 || n % 10 === 7).length;
    
    const allDigits = [
      ...String(hours).split(''),
      ...String(minutes).split(''),
      ...String(seconds).split('')
    ].map(Number);
    
    const digitTeslaScore = allDigits.filter(d => teslaNumbers.includes(d)).length;
    const digitBlessedScore = allDigits.filter(d => d === 7).length;
    
    const totalTeslaScore = teslaScore + digitTeslaScore;
    const totalBlessedScore = blessedScore + digitBlessedScore;
    
    let energy = {
      level: 'medium',
      description: 'طاقة متوازنة',
      color: 'blue',
      teslaScore: totalTeslaScore,
      blessedScore: totalBlessedScore
    };
    
    if (totalTeslaScore >= 4 && totalBlessedScore >= 2) {
      energy = {
        level: 'divine',
        description: '🌟 طاقة إلهية استثنائية - تسلا + البركة معاً',
        color: 'purple',
        teslaScore: totalTeslaScore,
        blessedScore: totalBlessedScore
      };
    } else if (totalTeslaScore >= 5) {
      energy = {
        level: 'very_high',
        description: '⚡ طاقة تسلا عالية جداً (3-6-9)',
        color: 'purple',
        teslaScore: totalTeslaScore,
        blessedScore: totalBlessedScore
      };
    } else if (totalBlessedScore >= 3) {
      energy = {
        level: 'blessed',
        description: '✨ وقت مبارك جداً - رقم 7 المبارك',
        color: 'green',
        teslaScore: totalTeslaScore,
        blessedScore: totalBlessedScore
      };
    } else if (totalTeslaScore >= 3) {
      energy = {
        level: 'high',
        description: '🔥 طاقة تسلا جيدة',
        color: 'teal',
        teslaScore: totalTeslaScore,
        blessedScore: totalBlessedScore
      };
    } else if (totalBlessedScore >= 2) {
      energy = {
        level: 'blessed_medium',
        description: '🌙 وقت مبارك - يحتوي على الرقم 7',
        color: 'emerald',
        teslaScore: totalTeslaScore,
        blessedScore: totalBlessedScore
      };
    } else if (totalTeslaScore >= 1) {
      energy = {
        level: 'medium_high',
        description: '💫 طاقة متوسطة - يحتوي على أحد أرقام تسلا',
        color: 'cyan',
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

      {/* التوصيات */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 px-2">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            التوصيات القرآنية
          </h3>
          <div className="flex items-center gap-2">
            {getPriorityIcon(analysis.priority)}
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              الأولوية: {
                analysis.priority === 'urgent' ? 'عاجلة' :
                analysis.priority === 'high' ? 'عالية' :
                analysis.priority === 'medium' ? 'متوسطة' : 'عادية'
              }
            </span>
          </div>
        </div>

        {analysis.recommendations.length === 0 ? (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 sm:p-6 rounded-xl text-center">
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              لا توجد توصيات خاصة في هذا الوقت
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {analysis.recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border-r-4 border-purple-500 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg ${
                        rec.energy.classification === 'tesla' ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 animate-pulse' :
                        rec.energy.classification === 'blessed' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' :
                        'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                      }`}>
                        {rec.number}
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
                          {rec.significance}
                        </h4>
                        {rec.isNearest && (
                          <p className="text-xs sm:text-sm text-gray-500">
                            (أقرب رقم لـ {rec.originalNumber})
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rec.energy.classification === 'tesla' && (
                            <span className="inline-block px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                              ⚡ رقم تسلا
                            </span>
                          )}
                          {rec.energy.classification === 'blessed' && (
                            <span className="inline-block px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full">
                              ✨ رقم مبارك
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                      rec.verse.energy === 'high' || rec.verse.energy === 'powerful' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      rec.verse.energy === 'warning' || rec.verse.energy === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {rec.verse.action}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 sm:p-5 rounded-lg shadow-inner">
                    <p className="text-base sm:text-lg md:text-xl text-gray-800 dark:text-gray-200 leading-loose font-arabic text-center">
                      {rec.verse.text}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 sm:mt-3 text-center">
                      {rec.verse.surah} - آية {rec.verse.ayah}
                    </p>
                  </div>

                  <div className="space-y-2 bg-gray-50 dark:bg-gray-900/50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 font-bold text-xs sm:text-sm">📖 المعنى:</span>
                      <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{rec.verse.meaning}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 font-bold text-xs sm:text-sm">💡 التوصية:</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm">{rec.verse.recommendation}</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-3 sm:p-4 rounded-lg border-r-2 border-yellow-400">
                    <p className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm">{rec.generalAdvice}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
          فحص سريع للتغييرات كل 5 ثواني
        </p>
        <p className="mt-3 text-purple-600 dark:text-purple-400 font-arabic text-sm sm:text-base">
          "وَلِتَعْلَمُوا عَدَدَ السِّنِينَ وَالْحِسَابَ"
        </p>
      </div>
    </div>
  );
};

export default WhatToDoNow;