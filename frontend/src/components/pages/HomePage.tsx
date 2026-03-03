import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Dumbbell, Utensils, MessageCircle, TrendingUp, ChevronRight, Activity, Flame, PlayCircle } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

const tips = [
  {
    icon: '💧',
    title: 'ดื่มน้ำให้เพียงพอ',
    description: 'ดื่มน้ำอย่างน้อย 8 แก้วต่อวัน เพื่อกระตุ้นการเผาผลาญของร่างกายและช่วยในการขับเสีย',
  },
  {
    icon: '🥗',
    title: 'ทานผักและผลไม้',
    description: 'รับประทานผักและผลไม้หลากหลายสีอย่างน้อย 5 ส่วนต่อวัน เพื่อวิตามินและแร่ธาตุที่จำเป็น',
  },
  {
    icon: '🏃',
    title: 'ออกกำลังกายสม่ำเสมอ',
    description: 'ออกกำลังกายอย่างน้อย 30 นาทีต่อวัน 5 วันต่อสัปดาห์ เพื่อสุขภาพหัวใจและร่างกายที่แข็งแรง',
  },
  {
    icon: '😴',
    title: 'นอนหลับให้เพียงพอ',
    description: 'นอนหลับ 7-8 ชั่วโมงต่อคืน เพื่อให้ร่างกายได้พักผ่อนและฟื้นฟูอย่างเต็มที่',
  },
  {
    icon: '🧘',
    title: 'จัดการความเครียด',
    description: 'ฝึกสมาธิ โยคะ หรือทำกิจกรรมผ่อนคลาย เพื่อลดความเครียดและเพิ่มความสุข',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { userInfo } = useUser();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const getBMIStatus = (bmiValue?: number) => {
    if (!bmiValue) return { text: '-', color: 'text-gray-500' };
    if (bmiValue < 18.5) return { text: 'ผอม', color: 'text-blue-600' };
    if (bmiValue < 23) return { text: 'ปกติ ✓', color: 'text-green-600' };
    if (bmiValue < 25) return { text: 'น้ำหนักเกิน', color: 'text-yellow-600' };
    return { text: 'อ้วน', color: 'text-red-600' };
  };

  const bmiStatus = getBMIStatus(userInfo.bmi);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="space-y-6">
          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-lg text-white">
            <h1 className="text-3xl font-bold mb-2">
              ยินดีต้อนรับกลับมา, {userInfo.username || 'User'}! 👋
            </h1>
            <p className="text-emerald-50 text-lg">
              พร้อมดูแลสุขภาพของคุณวันนี้แล้วหรือยัง?
            </p>
          </div>

          {/* Health Metrics - 3 Cards in Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* BMI Card */}
            <button
              onClick={() => navigate('/bmiviews')}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all active:scale-95 text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 font-medium">BMI</span>
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-bold text-gray-900">
                  {userInfo.bmi ? userInfo.bmi.toFixed(1) : '-'}
                </p>
                <p className={`text-sm font-medium ${bmiStatus.color}`}>
                  {bmiStatus.text}
                </p>
              </div>
            </button>

            {/* BMR Card */}
            <button
              onClick={() => navigate('/bmrresults')}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all active:scale-95 text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 font-medium">BMR</span>
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-bold text-gray-900">
                  {userInfo.bmr ? userInfo.bmr.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '-'}
                </p>
                <p className="text-sm text-gray-500">kcal/วัน</p>
              </div>
            </button>

            {/* TDEE Card */}
            <button
              onClick={() => navigate('/tdeeresults')}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all active:scale-95 text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 font-medium">TDEE</span>
                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-500" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-bold text-gray-900">
                  {userInfo.tdee ? userInfo.tdee.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '-'}
                </p>
                <p className="text-sm text-gray-500">kcal/วัน</p>
              </div>
            </button>
          </div>

          {/* Daily Health Tips Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">เคล็ดลับสุขภาพวันนี้</h2>
              <button 
                onClick={() => navigate('/tips')}
                className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
              >
                ดูทั้งหมด
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Tip Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                  {tips[currentTipIndex].icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {tips[currentTipIndex].title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {tips[currentTipIndex].description}
                  </p>
                </div>
              </div>

              {/* Dots Indicator */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {tips.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTipIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentTipIndex 
                        ? 'bg-emerald-600 w-6' 
                        : 'bg-gray-300 w-2'
                    }`}
                    aria-label={`Go to tip ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions Menu */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">เมนูด่วน</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Workouts */}
              <button 
                onClick={() => navigate('/workouts')}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all active:scale-95 flex flex-col items-center gap-4"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-3xl flex items-center justify-center">
                  <Dumbbell className="w-10 h-10 text-emerald-600" />
                </div>
                <span className="text-gray-800 font-medium">ออกกำลังกาย</span>
              </button>

              {/* Videos */}
              <button
                onClick={() => navigate('/workouts/videos?part=upper-body')}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all active:scale-95 flex flex-col items-center gap-4"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-sky-200 rounded-3xl flex items-center justify-center">
                  <PlayCircle className="w-10 h-10 text-sky-600" />
                </div>
                <span className="text-gray-800 font-medium">วิดีโอ</span>
              </button>

              {/* Meals */}
              <button 
                onClick={() => navigate('/meals')}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all active:scale-95 flex flex-col items-center gap-4"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-200 rounded-3xl flex items-center justify-center">
                  <Utensils className="w-10 h-10 text-orange-600" />
                </div>
                <span className="text-gray-800 font-medium">รวมเมนูอาหาร</span>
              </button>

              {/* AI Assistant */}
              <button 
                onClick={() => navigate('/assistant')}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all active:scale-95 flex flex-col items-center gap-4"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center">
                  <MessageCircle className="w-10 h-10 text-blue-600" />
                </div>
                <span className="text-gray-800 font-medium">ผู้ช่วย AI</span>
              </button>

              {/* Favorite */}
              <button 
                onClick={() => navigate('/favorite')}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all active:scale-95 flex flex-col items-center gap-4"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-200 rounded-3xl flex items-center justify-center">
                  <Heart className="w-10 h-10 text-pink-600" />
                </div>
                <span className="text-gray-800 font-medium">รายการโปรด</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}