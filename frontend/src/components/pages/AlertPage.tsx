import { useState, useEffect } from 'react';
import { Droplets, Dumbbell, Moon, Apple, Smile, Sparkles, Heart, Flame, ArrowLeft } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useUser } from '../../contexts/UserContext';

interface Alert {
  id: string;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
  questionTh: string;
  detail?: string;
  category: string;
  goals?: string[];
}

interface AlertPage {
  onHome: () => void;
}

interface AlertCardProps {
  alert: Alert;
  answered: 'yes' | 'no' | null;
  onAnswer: (alertId: string, answer: 'yes' | 'no') => void;
  onEdit: (alertId: string) => void;
}

const quotes = [
  'การดูแลสุขภาพของตัวเองคือการลงทุนที่คุ้มค่าที่สุด',
  'ทุกก้าวเล็กๆ คือความก้าวหน้าที่ยิ่งใหญ่',
  'ร่างกายที่แข็งแรงเริ่มต้นจากนิสัยที่ดีทุกวัน',
  'อย่ารอให้พร้อม เริ่มตอนนี้แล้วค่อยพัฒนา',
  'สุขภาพดีไม่ใช่จุดหมาย แต่คือวิถีชีวิต',
  'วันนี้ดีกว่าเมื่อวาน นั่นคือความสำเร็จ',
  'ดูแลตัวเองก่อน แล้วคุณจะดูแลคนอื่นได้ดียิ่งขึ้น',
]

function getTodayQuote() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  return quotes[dayOfYear % quotes.length]
}

function AlertCard({ alert, answered, onAnswer, onEdit }: AlertCardProps) {
  return (
    <div className={`${alert.bgColor} rounded-2xl p-4 shadow-sm transition-all ${answered ? 'opacity-90' : ''}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-11 h-11 ${alert.iconColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
          {alert.icon}
        </div>
        <div className="flex-1">
          <p className="text-base text-gray-800 font-medium leading-snug">{alert.questionTh}</p>
          {alert.detail && (
            <p className="text-xs text-gray-500 mt-0.5">{alert.detail}</p>
          )}
        </div>
      </div>

      {!answered ? (
        <div className="flex gap-2">
          <button onClick={() => onAnswer(alert.id, 'yes')}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl transition-colors text-sm font-medium">
            ใช่ ฉันทำแล้ว ✓
          </button>
          <button onClick={() => onAnswer(alert.id, 'no')}
            className="flex-1 bg-white bg-opacity-70 hover:bg-opacity-100 text-gray-600 py-2.5 rounded-xl transition-colors text-sm font-medium border border-gray-200">
            ยังเลย
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className={`flex-1 text-center py-2.5 rounded-xl text-sm font-medium ${answered === 'yes'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-orange-100 text-orange-700'
            }`}>
            {answered === 'yes' ? 'เยี่ยมมาก! 🎉' : 'ไว้ครั้งหน้านะ! 💪'}
          </div>
          <button onClick={() => onEdit(alert.id)}
            className="px-4 bg-white bg-opacity-70 hover:bg-opacity-100 text-gray-600 py-2.5 rounded-xl transition-colors text-sm border border-gray-200">
            แก้ไข
          </button>
        </div>
      )}
    </div>
  )
}

export default function AlertPage({ onHome }: AlertPage) {
  const { userInfo } = useUser()
  const currentHour = new Date().getHours();
  const greetingTh = currentHour < 12 ? 'สวัสดีตอนเช้า' : currentHour < 18 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น';

  const [completedCount, setCompletedCount] = useState(0);
  const [answeredAlerts, setAnsweredAlerts] = useState<Record<string, 'yes' | 'no'>>({});
  const [streak, setStreak] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const allAlerts: Alert[] = [
    {
      id: '1',
      icon: <Droplets className="w-6 h-6 text-blue-600" />,
      iconColor: 'bg-blue-100', bgColor: 'bg-blue-50',
      questionTh: 'วันนี้ดื่มน้ำครบแล้วหรือยัง?',
      detail: 'เป้าหมาย: 8-10 แก้ว หรือ 2 ลิตรต่อวัน',
      category: 'hydration',
    },
    {
      id: '2',
      icon: <Dumbbell className="w-6 h-6 text-emerald-600" />,
      iconColor: 'bg-emerald-100', bgColor: 'bg-emerald-50',
      questionTh: `${greetingTh} วันนี้ออกกำลังกายแล้วหรือยัง?`,
      detail: 'แนะนำ: 30 นาทีต่อวัน',
      category: 'exercise',
    },
    {
      id: '3',
      icon: <Moon className="w-6 h-6 text-indigo-600" />,
      iconColor: 'bg-indigo-100', bgColor: 'bg-indigo-50',
      questionTh: 'เมื่อคืนนอนหลับพักผ่อนดีไหม?',
      detail: 'แนะนำ: 7-8 ชั่วโมงต่อคืน',
      category: 'sleep',
    },
    {
      id: '4',
      icon: <Apple className="w-6 h-6 text-red-600" />,
      iconColor: 'bg-red-100', bgColor: 'bg-red-50',
      questionTh: 'วันนี้ทานผักผลไม้แล้วหรือยัง?',
      detail: 'แนะนำ: 5 ส่วนต่อวัน',
      category: 'nutrition',
      goals: ['lose', 'gain'],
    },
    {
      id: '5',
      icon: <Sparkles className="w-6 h-6 text-purple-600" />,
      iconColor: 'bg-purple-100', bgColor: 'bg-purple-50',
      questionTh: 'วันนี้ยืดเหยียดร่างกายแล้วหรือยัง?',
      detail: 'แนะนำ: 10-15 นาทีต่อวัน',
      category: 'stretching',
    },
    {
      id: '6',
      icon: <Heart className="w-6 h-6 text-pink-600" />,
      iconColor: 'bg-pink-100', bgColor: 'bg-pink-50',
      questionTh: 'วันนี้รู้สึกดีไหม?',
      detail: 'อย่าลืมดูแลสุขภาพใจด้วยนะ',
      category: 'mental',
    },
    {
      id: '7',
      icon: <Smile className="w-6 h-6 text-yellow-600" />,
      iconColor: 'bg-yellow-100', bgColor: 'bg-yellow-50',
      questionTh: 'วันนี้พักสายตาจากหน้าจอแล้วหรือยัง?',
      detail: 'แนะนำ: พักทุกๆ 20-30 นาที',
      category: 'rest',
    },
  ]

  const alerts = allAlerts

  // ✅ แยก fetchStreak ออกมาเพื่อเรียกซ้ำได้
  const fetchStreak = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/alerts/streak`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (res.ok) {
      const data = await res.json()
      setStreak(data.streak)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) { setIsLoading(false); return }

      const headers = { 'Authorization': `Bearer ${token}` }
      const today = new Date().toLocaleDateString('en-CA') // ✅ timezone-safe

      const [checkinsRes, streakRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/alerts/checkins?date=${today}`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/alerts/streak`, { headers }),
      ])

      if (checkinsRes.ok) {
        const checkins = await checkinsRes.json()
        const answeredMap: Record<string, 'yes' | 'no'> = {}
        let count = 0
        checkins.forEach((c: any) => {
          const alert = allAlerts.find(a => a.category === c.category)
          if (alert) {
            answeredMap[alert.id] = c.answered ? 'yes' : 'no'
            if (c.answered) count++
          }
        })
        setAnsweredAlerts(answeredMap)
        setCompletedCount(count)
      }

      if (streakRes.ok) {
        const data = await streakRes.json()
        setStreak(data.streak)
      }

      setIsLoading(false)
    }
    fetchData()
  }, [])

  const saveCheckin = async (category: string, answered: boolean) => {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return

    await fetch(`${import.meta.env.VITE_API_URL}/api/alerts/checkins`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category, answered }),
    })
  }

  const handleAlertAnswer = async (alertId: string, answer: 'yes' | 'no') => {
    const alert = alerts.find(a => a.id === alertId)
    if (!alert) return

    const previousAnswer = answeredAlerts[alertId]
    if (answer === 'yes' && previousAnswer !== 'yes') {
      setCompletedCount(prev => prev + 1)
    } else if (answer === 'no' && previousAnswer === 'yes') {
      setCompletedCount(prev => prev - 1)
    }

    setAnsweredAlerts(prev => ({ ...prev, [alertId]: answer }))
    await saveCheckin(alert.category, answer === 'yes')
    await fetchStreak() // ✅ อัพเดท streak ทันทีหลังกด
  }

  const handleEditAlert = async (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId)
    if (!alert) return

    const previousAnswer = answeredAlerts[alertId]
    if (previousAnswer === 'yes') {
      setCompletedCount(prev => prev - 1)
    }

    setAnsweredAlerts(prev => {
      const updated = { ...prev }
      delete updated[alertId]
      return updated
    })
    await saveCheckin(alert.category, false)
    await fetchStreak() // ✅ อัพเดท streak เมื่อแก้ไขด้วย
  }

  const progressPercentage = (completedCount / alerts.length) * 100
  const userName = userInfo?.username || userInfo?.email?.split('@')[0] || ''

  if (isLoading) return (
    <div className="w-full max-w-4xl mx-auto animate-pulse space-y-4 pt-4">
      <div className="h-8 w-32 bg-gray-200 rounded-lg" />
      <div className="h-32 bg-gray-200 rounded-3xl" />
      {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full  max-w-2xl mx-auto px-4 py-6">

        <div className="mb-1 mt-4">
          <button
            onClick={onHome}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        <div className="mb-2">
          <h2 className="text-3xl text-gray-800 mb-1">Daily Check-in</h2>
          <p className="text-base text-gray-500">
            {greetingTh}{userName ? `, ${userName}` : ''} 👋
          </p>
          <p className="text-sm text-gray-400 mt-0.5">ตรวจสอบกิจกรรมสุขภาพของคุณวันนี้</p>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-left opacity-80 mb-1">Daily Progress</p>
              <p className="text-2xl font-semibold">
                {completedCount === alerts.length ? 'ครบแล้ววันนี้! 🎉' : 'Keep Going! 💪'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-white bg-opacity-20 rounded-2xl px-4 py-3">
              <Flame className="w-5 h-5 text-orange-300" />
              <div className="text-center">
                <p className="text-2xl font-bold leading-none">{streak}</p>
                <p className="text-xs opacity-80">day streak</p>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-20 rounded-full h-3 overflow-hidden mb-2">
            <div className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm opacity-90">
              ทำได้ <span className="font-semibold">{completedCount}</span> จาก {alerts.length} กิจกรรม
            </p>
            <p className="text-sm opacity-80">{Math.round(progressPercentage)}%</p>
          </div>
        </div>

        <div className="space-y-3">
          {alerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              answered={answeredAlerts[alert.id] || null}
              onAnswer={handleAlertAnswer}
              onEdit={handleEditAlert}
            />
          ))}
        </div>

        <div className="mt-6 bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl p-5 border border-pink-200">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <p className="text-sm text-left font-semibold text-gray-700 mb-1">Quote of the Day</p>
              <p className="text-sm text-gray-500 italic leading-relaxed">"{getTodayQuote()}"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}