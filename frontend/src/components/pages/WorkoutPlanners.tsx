import { useState, useEffect } from 'react';
import { ArrowLeft, Info, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import {
  type BodyType,
  type Goal,
} from '../../utils/workoutGenerator';

interface WorkoutPlannerProps {
  onHome: () => void;
}


export default function WorkoutPlanner({ onHome }: WorkoutPlannerProps) {
  const navigate = useNavigate();
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [bodyType, setBodyType] = useState<BodyType | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [medicalCondition, setMedicalCondition] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showBodyTypeInfo, setShowBodyTypeInfo] = useState(false);

  const timeOptions = [15, 30, 45, 60];

  const handleGeneratePlan = async () => {

    if (!selectedTime || !bodyType || !goal) {
      alert('Please complete all required fields')
      return
    }

    try {

      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        alert('Please login first')
        return
      }

      // save preference
      await fetch(`${import.meta.env.VITE_API_URL}/api/workout/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dailyTime: selectedTime,
          bodyType,
          goal,
          medicalCondition,
        })
      }).catch(err => console.error(err))

      // navigate ไป schedule
      navigate('/workouts/schedule', {
        state: {
          loading: true,
          preferences: {
            bodyType,
            goal,
            dailyTime: selectedTime,
            medicalCondition
          }
        }
      })

    } catch (err) {
      console.error(err)
      alert('Something went wrong')
    }
  }

  useEffect(() => {
    const loadPreference = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workout/preferences`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) return

      const data = await response.json()
      if (data) {
        setSelectedTime(data.daily_time);
        setBodyType(data.body_type);
        setGoal(data.goal);
        setMedicalCondition(data.medical_condition ?? '');
      }
    };

    loadPreference();
  }, []);

  const isFormComplete = selectedTime && bodyType && goal;

  return (
    <div className="fixed inset-0 h-screen w-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col overflow-hidden pt-16">
      {/* Content */}
      <div className="flex-1 px-4 overflow-y-auto pb-24">
        <div className="max-w-4xl mx-auto pt-6">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={onHome}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <h1 className="text-3xl text-center text-gray-800 mb-10">Workouts</h1>

            {/* Daily Free Time */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
                <span className="text-pink-500">•</span>
                Daily Free Time
              </h3>
              <div className="flex gap-3 flex-wrap">
                {timeOptions.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`px-6 py-2.5 rounded-full border-2 transition-all ${selectedTime === time
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium'
                      : 'border-gray-300 text-gray-600 hover:border-emerald-300'
                      }`}
                  >
                    {time} min
                  </button>
                ))}
              </div>
            </div>

            {/* Body Type */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
                <span className="text-pink-500">•</span>
                Body type
                <button
                  onClick={() => setShowBodyTypeInfo(!showBodyTypeInfo)}
                  className="text-gray-400 hover:text-emerald-500 transition-colors"
                >
                  <Info className="w-5 h-5" />
                </button>
              </h3>

              {/* Info Popup */}
              {showBodyTypeInfo && (
                <div className="mb-4 p-5 text-left bg-emerald-50 rounded-2xl border-2 border-emerald-200">
                  <h4 className="font-semibold text-emerald-700 mb-3">Body Types คืออะไร?</h4>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div>
                      <strong className="text-emerald-600">🔹 Ectomorph:</strong> รูปร่างผอม เพิ่มน้ำหนักยาก เผาผลาญอาหารเร็ว เหมาะกับการเล่นกล้ามเนื้อและกินโปรตีนสูง
                    </div>
                    <div>
                      <strong className="text-emerald-600">🔹 Mesomorph:</strong> รูปร่างนักกีฬา สร้างกล้ามเนื้อง่าย เผาผลาญพอดี เหมาะกับการออกกำลังกายหลากหลาย
                    </div>
                    <div>
                      <strong className="text-emerald-600">🔹 Endomorph:</strong> รูปร่างอวบ น้ำหนักเพิ่มง่าย เผาผลาญช้า เหมาะกับคาร์ดิโอและควบคุมอาหาร
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                {/* Ectomorph */}
                <button
                  onClick={() => setBodyType('ectomorph')}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${bodyType === 'ectomorph'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                    }`}
                >
                  <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C10.5 2 9.5 3 9.5 4.5V8H8C7 8 6 9 6 10V19C6 20 7 21 8 21H9.5V22H10.5V21H13.5V22H14.5V21H16C17 21 18 20 18 19V10C18 9 17 8 16 8H14.5V4.5C14.5 3 13.5 2 12 2Z"
                      fill="currentColor"
                      className={bodyType === 'ectomorph' ? 'text-emerald-600' : 'text-gray-400'}
                    />
                  </svg>
                  <span className={`text-sm font-medium ${bodyType === 'ectomorph' ? 'text-emerald-700' : 'text-gray-600'}`}>
                    Ectomorph
                  </span>
                </button>

                {/* Mesomorph */}
                <button
                  onClick={() => setBodyType('mesomorph')}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${bodyType === 'mesomorph'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                    }`}
                >
                  <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C10.5 2 9 3 9 4.5V7.5H7.5C6.5 7.5 5.5 8.5 5.5 9.5V19C5.5 20 6.5 21 7.5 21H9V22H10V21H14V22H15V21H16.5C17.5 21 18.5 20 18.5 19V9.5C18.5 8.5 17.5 7.5 16.5 7.5H15V4.5C15 3 13.5 2 12 2Z"
                      fill="currentColor"
                      className={bodyType === 'mesomorph' ? 'text-emerald-600' : 'text-gray-400'}
                    />
                  </svg>
                  <span className={`text-sm font-medium ${bodyType === 'mesomorph' ? 'text-emerald-700' : 'text-gray-600'}`}>
                    Mesomorph
                  </span>
                </button>

                {/* Endomorph */}
                <button
                  onClick={() => setBodyType('endomorph')}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${bodyType === 'endomorph'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                    }`}
                >
                  <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C10.5 2 8.5 3 8.5 4.5V7H6.5C5.5 7 4 8 4 9.5V19C4 20 5 21 6.5 21H8.5V22H9.5V21H14.5V22H15.5V21H17.5C18.5 21 20 20 20 19V9.5C20 8 18.5 7 17.5 7H15.5V4.5C15.5 3 13.5 2 12 2Z"
                      fill="currentColor"
                      className={bodyType === 'endomorph' ? 'text-emerald-600' : 'text-gray-400'}
                    />
                  </svg>
                  <span className={`text-sm font-medium ${bodyType === 'endomorph' ? 'text-emerald-700' : 'text-gray-600'}`}>
                    Endomorph
                  </span>
                </button>
              </div>
            </div>

            {/* Your Goal */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-700 mb-1 flex items-center gap-2">
                <span className="text-pink-500">•</span>
                Your Goal
              </h3>
              <p className="text-sm text-left text-gray-500 mb-4 ml-5">Choose what goal you want to achieve.</p>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setGoal('gain')}
                  className={`px-6 py-2.5 rounded-full transition-all ${goal === 'gain'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                >
                  Gain weight
                </button>
                <button
                  onClick={() => setGoal('maintain')}
                  className={`px-6 py-2.5 rounded-full transition-all ${goal === 'maintain'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                >
                  Maintain health
                </button>
                <button
                  onClick={() => setGoal('lose')}
                  className={`px-6 py-2.5 rounded-full transition-all ${goal === 'lose'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                >
                  Lose weight
                </button>
              </div>
            </div>

            {/* Medical Condition */}
            <div className="mb-8">
              <h3 className="text-lg text-left font-medium text-gray-700 mb-3">Medical Condition</h3>
              <input
                type="text"
                value={medicalCondition}
                onChange={(e) => setMedicalCondition(e.target.value)}
                placeholder="Enter any medical conditions (optional)"
                className="w-full px-4 py-3 rounded-2xl bg-emerald-50 border-2 border-transparent focus:border-emerald-300 outline-none transition-colors text-gray-700 placeholder:text-gray-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleGeneratePlan}
                disabled={!isFormComplete || isGenerating}
                className={`w-full py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${isFormComplete && !isGenerating
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.98] shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                  }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>AI Analyzing...</span>
                  </>
                ) : (
                  <span>Generate plan</span>
                )}
              </button>

              <button
                onClick={() => {
                  if (!isFormComplete) {
                    alert('Please complete all required fields for AI analysis');
                    return;
                  }
                  const initialQuery = `ช่วยวางแผนออกกำลังกายให้หน่อยครับ ฉันมีเวลา ${selectedTime} นาทีต่อวัน รูปร่างแบบ ${bodyType} เป้าหมายคือ ${goal === 'gain' ? 'เพิ่มน้ำหนัก' : goal === 'lose' ? 'ลดน้ำหนัก' : 'รักษาสุขภาพ'} ${medicalCondition ? `และมีข้อจำกัดทางร่างกายคือ ${medicalCondition}` : ''}`;
                  navigate('/chat', { state: { initialQuery } });
                }}
                className={`w-full py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${isFormComplete
                  ? 'bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 shadow-sm'
                  : 'bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <Sparkles className="w-5 h-5 text-emerald-500" />
                Ask AI Assistant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}