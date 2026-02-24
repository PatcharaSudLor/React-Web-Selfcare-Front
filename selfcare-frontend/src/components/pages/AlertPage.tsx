import { useState } from 'react';
import { Droplets, Dumbbell, Moon, Apple, Smile, Sparkles, Heart } from 'lucide-react';
import { div } from 'framer-motion/m';

interface Alert {
  id: string;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
  question: string;
  questionTh: string;
  detail?: string;
  category: string;
}

interface AlertCardProps {
  alert: Alert;
  answered: 'yes' | 'no' | null;
  onAnswer: (alertId: string, answer: 'yes' | 'no') => void;
  onEdit: (alertId: string) => void;
}

function AlertCard({ alert, answered, onAnswer, onEdit }: AlertCardProps) {
  const handleAnswer = (answer: 'yes' | 'no') => {
    onAnswer(alert.id, answer);
  };

  const handleEdit = () => {
    onEdit(alert.id);
  };

  return (
    <div className={`${alert.bgColor} rounded-2xl p-5 shadow-sm transition-all ${answered ? 'scale-[0.98]' : ''}`}>
      {/* Icon and Question */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-12 h-12 ${alert.iconColor} rounded-2xl flex items-center justify-center flex-shrink-0`}>
          {alert.icon}
        </div>
        <div className="flex-1">
          <p className="text-gray-800 mb-1">{alert.questionTh}</p>
          {alert.detail && (
            <p className="text-sm text-gray-500">{alert.detail}</p>
          )}
        </div>
      </div>

      {/* Answer Buttons or Response */}
      {!answered ? (
        <div className="flex gap-2">
          <button
            onClick={() => handleAnswer('yes')}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl transition-colors text-sm"
          >
            ใช่ ฉันทำแล้ว ✓
          </button>
          <button
            onClick={() => handleAnswer('no')}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2.5 rounded-xl transition-colors text-sm"
          >
            ยังเลย
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <div
            className={`flex-1 text-center py-2.5 rounded-xl ${
              answered === 'yes'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-orange-100 text-orange-700'
            }`}
          >
            {answered === 'yes' ? (
              <span>เยี่ยมมาก! 🎉</span>
            ) : (
              <span>ไว้ครั้งหน้านะ! 💪</span>
            )}
          </div>
          <button
            onClick={handleEdit}
            className="flex-shrink-0 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 rounded-xl transition-colors text-sm font-medium"
          >
            แก้ไข
          </button>
        </div>
      )}
    </div>
  );
}

export default function AlertPage() {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Morning' : currentHour < 18 ? 'Afternoon' : 'Evening';
  const greetingTh = currentHour < 12 ? 'สวัสดีตอนเช้า' : currentHour < 18 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น';

  const [completedCount, setCompletedCount] = useState(0);
  const [answeredAlerts, setAnsweredAlerts] = useState<Record<string, 'yes' | 'no'>>({});

  const alerts: Alert[] = [
    {
      id: '1',
      icon: <Droplets className="w-6 h-6 text-blue-600" />,
      iconColor: 'bg-blue-100',
      bgColor: 'bg-blue-50',
      question: 'Do you drink water yet?',
      questionTh: 'วันนี้ดื่มน้ำครบแล้วหรือยัง?',
      detail: 'เป้าหมาย: 8-10 แก้ว หรือ 2 ลิตรต่อวัน',
      category: 'hydration',
    },
    {
      id: '2',
      icon: <Dumbbell className="w-6 h-6 text-emerald-600" />,
      iconColor: 'bg-emerald-100',
      bgColor: 'bg-emerald-50',
      question: 'Do you exercise today?',
      questionTh: `${greetingTh} วันนี้ออกกำลังกายแล้วหรือยัง?`,
      detail: 'แนะนำ: 30 นาทีต่อวัน',
      category: 'exercise',
    },
    {
      id: '3',
      icon: <Moon className="w-6 h-6 text-indigo-600" />,
      iconColor: 'bg-indigo-100',
      bgColor: 'bg-indigo-50',
      question: 'Did you sleep well last night?',
      questionTh: 'เมื่อคืนนอนหลับพักผ่อนดีไหม?',
      detail: 'แนะนำ: 7-8 ชั่วโมงต่อคืน',
      category: 'sleep',
    },
    {
      id: '4',
      icon: <Apple className="w-6 h-6 text-red-600" />,
      iconColor: 'bg-red-100',
      bgColor: 'bg-red-50',
      question: 'Have you eaten fruits today?',
      questionTh: 'วันนี้ทานผักผลไม้แล้วหรือยัง?',
      detail: 'แนะนำ: 5 ส่วนต่อวัน',
      category: 'nutrition',
    },
    {
      id: '5',
      icon: <Sparkles className="w-6 h-6 text-purple-600" />,
      iconColor: 'bg-purple-100',
      bgColor: 'bg-purple-50',
      question: 'Did you stretch today?',
      questionTh: 'วันนี้ยืดเหยียดร่างกายแล้วหรือยัง?',
      detail: 'แนะนำ: 10-15 นาทีต่อวัน',
      category: 'stretching',
    },
    {
      id: '6',
      icon: <Heart className="w-6 h-6 text-pink-600" />,
      iconColor: 'bg-pink-100',
      bgColor: 'bg-pink-50',
      question: 'How are you feeling today?',
      questionTh: 'วันนี้รู้สึกดีไหม?',
      detail: 'อย่าลืมดูแลสุขภาพใจด้วยนะ',
      category: 'mental',
    },
    {
      id: '7',
      icon: <Smile className="w-6 h-6 text-yellow-600" />,
      iconColor: 'bg-yellow-100',
      bgColor: 'bg-yellow-50',
      question: 'Did you take a break?',
      questionTh: 'วันนี้พักสายตาจากหน้าจอแล้วหรือยัง?',
      detail: 'แนะนำ: พักทุกๆ 20-30 นาที',
      category: 'rest',
    },
  ];

  const handleAlertAnswer = (alertId: string, answer: 'yes' | 'no') => {
    const previousAnswer = answeredAlerts[alertId];

    // If answering 'yes'
    if (answer === 'yes') {
      // Only increase count if it wasn't 'yes' before
      if (previousAnswer !== 'yes') {
        setCompletedCount((prev) => prev + 1);
      }
    }
    // If answering 'no'
    else {
      // Only decrease count if it was 'yes' before
      if (previousAnswer === 'yes') {
        setCompletedCount((prev) => prev - 1);
      }
    }

    // Update the answered state
    setAnsweredAlerts((prev) => ({
      ...prev,
      [alertId]: answer,
    }));
  };

  const handleEditAlert = (alertId: string) => {
    const previousAnswer = answeredAlerts[alertId];

    // If it was 'yes', decrease count
    if (previousAnswer === 'yes') {
      setCompletedCount((prev) => prev - 1);
    }

    // Remove the answered status
    setAnsweredAlerts((prev) => {
      const updated = { ...prev };
      delete updated[alertId];
      return updated;
    });
  };

  const progressPercentage = (completedCount / alerts.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Alerts</h2>
        <p className="text-gray-600">
          {greeting} my love, ตรวจสอบกิจกรรมสุขภาพของคุณวันนี้
        </p>
      </div>

      {/* Stats Summary */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-5 mb-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm opacity-90 mb-1">Daily Progress</p>
            <p className="text-2xl">Keep Going!</p>
          </div>
          <div className="text-5xl">🎯</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-full h-2 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm mt-2 opacity-90">คุณทำได้ {completedCount} จาก {alerts.length} กิจกรรมแล้ว</p>
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            answered={answeredAlerts[alert.id] || null}
            onAnswer={handleAlertAnswer}
            onEdit={handleEditAlert}
          />
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <button className="text-emerald-600 hover:text-emerald-700 text-sm py-2">
          more ...
        </button>
      </div>

      {/* Motivational Quote */}
  <div className="mt-6 bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl p-5 border-2 border-pink-200">
  <div className="flex items-start gap-3">

    <div className="text-3xl mt-1">💡</div>

    <div className="flex flex-col">
      <p className="text-gray-800 text-sm text-left font-semibold m-0 leading-tight -ml-1">
        Quote of the Day
      </p>

      <p className="text-sm text-left text-gray-600 italic m-0">
        "การดูแลสุขภาพของตัวเองคือการลงทุนที่คุ้มค่าที่สุด"
      </p>
    </div>

  </div>
</div>
    </div>
  );
}