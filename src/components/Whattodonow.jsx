import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, Lightbulb, TrendingUp, AlertCircle, Star } from 'lucide-react';
import { quranicNumbersDatabase, getNumberInfo, getNearestNumberInfo } from '../../Quranicnumbersdatabase';

const WhatToDoNow = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // تحديث الوقت كل ثانية
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // تحليل الوقت الحالي
  useEffect(() => {
    analyzeCurrentTime();
  }, [currentTime]);

  const analyzeCurrentTime = () => {
    setIsLoading(true);
    
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();
    
    // استخراج الأرقام من الوقت
    const timeNumbers = extractNumbersFromTime(hours, minutes, seconds);
    
    // تحليل الأرقام المستخرجة
    const recommendations = analyzeNumbers(timeNumbers);
    
    // حساب طاقة الوقت بناءً على نظرية تسلا 3-6-9
    const teslaEnergy = calculateTeslaEnergy(hours, minutes, seconds);
    
    setAnalysis({
      time: { hours, minutes, seconds },
      numbers: timeNumbers,
      recommendations: recommendations,
      teslaEnergy: teslaEnergy,
      priority: determinePriority(recommendations, teslaEnergy)
    });
    
    setIsLoading(false);
  };

  // استخراج الأرقام من الوقت
  const extractNumbersFromTime = (hours, minutes, seconds) => {
    const numbers = [];
    
    // الساعة
    numbers.push(hours);
    if (hours > 9) {
      numbers.push(Math.floor(hours / 10)); // العشرات
      numbers.push(hours % 10); // الآحاد
    }
    
    // الدقائق
    numbers.push(minutes);
    if (minutes > 9) {
      numbers.push(Math.floor(minutes / 10));
      numbers.push(minutes % 10);
    }
    
    // الثواني
    numbers.push(seconds);
    if (seconds > 9) {
      numbers.push(Math.floor(seconds / 10));
      numbers.push(seconds % 10);
    }
    
    // مجموع الأرقام
    const sum = hours + minutes + seconds;
    numbers.push(sum);
    
    // تقليل الرقم إلى رقم واحد (numerology)
    let reducedSum = sum;
    while (reducedSum > 9 && reducedSum !== 11 && reducedSum !== 22) {
      reducedSum = String(reducedSum).split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    }
    numbers.push(reducedSum);
    
    // إزالة التكرار
    return [...new Set(numbers)].sort((a, b) => b - a);
  };

  // تحليل الأرقام والحصول على التوصيات
  const analyzeNumbers = (numbers) => {
    const recommendations = [];
    
    for (const num of numbers) {
      const info = getNumberInfo(num);
      if (info && info.verses && info.verses.length > 0) {
        const verse = info.verses[0]; // أخذ أول آية
        recommendations.push({
          number: num,
          verse: verse,
          significance: info.significance,
          generalAdvice: info.generalAdvice
        });
      } else {
        // إذا لم يكن الرقم موجوداً، ابحث عن أقرب رقم
        const nearestInfo = getNearestNumberInfo(num);
        if (nearestInfo && nearestInfo.info) {
          const verse = nearestInfo.info.verses[0];
          recommendations.push({
            number: nearestInfo.number,
            isNearest: true,
            originalNumber: num,
            verse: verse,
            significance: nearestInfo.info.significance,
            generalAdvice: nearestInfo.info.generalAdvice
          });
        }
      }
    }
    
    return recommendations.slice(0, 3); // أخذ أفضل 3 توصيات
  };

  // حساب طاقة الوقت بناءً على نظرية تسلا
  const calculateTeslaEnergy = (hours, minutes, seconds) => {
    const sum = hours + minutes + seconds;
    const digits = String(sum).split('').map(Number);
    
    // حساب كم مرة تظهر 3، 6، 9
    const tesla369Count = digits.filter(d => d === 3 || d === 6 || d === 9).length;
    
    // حساب كم مرة يظهر 7 (رقم البركة)
    const allDigits = [
      ...String(hours).split(''),
      ...String(minutes).split(''),
      ...String(seconds).split('')
    ].map(Number);
    const sevenCount = allDigits.filter(d => d === 7).length;
    
    let energy = {
      level: 'medium',
      description: 'طاقة متوازنة',
      color: 'blue',
      teslaScore: tesla369Count,
      blessedScore: sevenCount 
    };
    
    if (tesla369Count >= 3) {
      energy = {
        level: 'very_high',
        description: 'طاقة عالية جداً - توافق مع نظرية تسلا 3-6-9',
        color: 'purple',
        teslaScore: tesla369Count,
        blessedScore: sevenCount
      };
    } else if (sevenCount >= 2) {
      energy = {
        level: 'blessed',
        description: 'وقت مبارك - يحتوي على رقم 7 المبارك',
        color: 'green',
        teslaScore: tesla369Count,
        blessedScore: sevenCount
      };
    } else if (tesla369Count >= 1) {
      energy = {
        level: 'high',
        description: 'طاقة جيدة - يحتوي على أحد أرقام تسلا',
        color: 'teal',
        teslaScore: tesla369Count,
        blessedScore: sevenCount
      };
    }
    
    return energy;
  };

  // تحديد الأولوية
  const determinePriority = (recommendations, teslaEnergy) => {
    if (teslaEnergy.level === 'very_high' || teslaEnergy.level === 'blessed') {
      return 'urgent';
    } else if (recommendations.length >= 2) {
      return 'high';
    } else if (recommendations.length >= 1) {
      return 'medium';
    }
    return 'low';
  };

  // ألوان الطاقة
  const getEnergyColor = (level) => {
    const colors = {
      very_high: 'from-purple-500 to-pink-500',
      blessed: 'from-green-500 to-emerald-500',
      high: 'from-teal-500 to-cyan-500',
      medium: 'from-blue-500 to-indigo-500',
      low: 'from-gray-500 to-slate-500'
    };
    return colors[level] || colors.medium;
  };

  // أيقونة الأولوية
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <Star className="w-6 h-6 text-yellow-400 animate-pulse" />;
      case 'high':
        return <TrendingUp className="w-6 h-6 text-orange-400" />;
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
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6" dir="rtl">
      {/* رأس القسم */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2">
          <Clock className="w-8 h-8" />
          ماذا أفعل الآن؟
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          تحليل ديناميكي بناءً على الوقت الحالي والآيات القرآنية
        </p>
      </div>

      {/* عرض الوقت الحالي */}
      <div className={`bg-gradient-to-r ${getEnergyColor(analysis.teslaEnergy.level)} text-white p-6 rounded-2xl shadow-lg`}>
        <div className="text-center space-y-3">
          <div className="text-5xl font-bold font-mono">
            {String(analysis.time.hours).padStart(2, '0')}:
            {String(analysis.time.minutes).padStart(2, '0')}:
            {String(analysis.time.seconds).padStart(2, '0')}
          </div>
          <div className="text-xl opacity-90">
            {analysis.teslaEnergy.description}
          </div>
          <div className="flex justify-center gap-4 text-sm">
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <span className="opacity-75">طاقة تسلا: </span>
              <span className="font-bold">{analysis.teslaEnergy.teslaScore}</span>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <span className="opacity-75">البركة (7): </span>
              <span className="font-bold">{analysis.teslaEnergy.blessedScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* التوصيات */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            التوصيات القرآنية
          </h3>
          {getPriorityIcon(analysis.priority)}
        </div>

        {analysis.recommendations.length === 0 ? (
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl text-center">
            <p className="text-gray-600 dark:text-gray-300">
              لا توجد توصيات خاصة في هذا الوقت
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {analysis.recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-r-4 border-purple-500 hover:shadow-xl transition-all duration-300"
              >
                <div className="space-y-3">
                  {/* رأس التوصية */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                        {rec.number}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                          {rec.significance}
                        </h4>
                        {rec.isNearest && (
                          <p className="text-sm text-gray-500">
                            (أقرب رقم لـ {rec.originalNumber})
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      rec.verse.energy === 'high' ? 'bg-green-100 text-green-700' :
                      rec.verse.energy === 'warning' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {rec.verse.action.replace(/_/g, ' ')}
                    </div>
                  </div>

                  {/* الآية */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
                    <p className="text-xl text-gray-800 dark:text-gray-200 leading-loose font-arabic">
                      {rec.verse.text}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {rec.verse.surah} - آية {rec.verse.ayah}
                    </p>
                  </div>

                  {/* المعنى */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 font-bold">المعنى:</span>
                      <span className="text-gray-700 dark:text-gray-300">{rec.verse.meaning}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 font-bold">التوصية:</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{rec.verse.recommendation}</span>
                    </div>
                  </div>

                  {/* النصيحة العامة */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border-r-2 border-yellow-400">
                    <p className="text-gray-700 dark:text-gray-300">
                      <Lightbulb className="w-4 h-4 inline-block ml-2 text-yellow-600" />
                      {rec.generalAdvice}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* الأرقام المستخرجة */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
          الأرقام المستخرجة من الوقت الحالي:
        </h4>
        <div className="flex flex-wrap gap-2">
          {analysis.numbers.map((num, index) => (
            <div
              key={index}
              className={`px-4 py-2 rounded-lg font-bold ${
                [3, 6, 9].includes(num)
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                  : num === 7
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* ملاحظة */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>يتم تحديث التحليل تلقائياً كل ثانية</p>
        <p className="mt-1">
          "وَلِتَعْلَمُوا عَدَدَ السِّنِينَ وَالْحِسَابَ"
        </p>
      </div>
    </div>
  );
};

export default WhatToDoNow;