import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, User, ChevronLeft, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import WorkoutScheduleDisplay from './WorkoutScheduleDisplay';
import MealScheduleDisplay from './MealScheduleDisplay';
import { supabase } from '../../utils/supabase';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  workoutData?: any;
  mealData?: any;
}

// SYSTEM_MESSAGE moved to backend for security

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('chat_history');
    return savedMessages ? JSON.parse(savedMessages) : [
      { role: 'assistant', content: 'สวัสดีค่ะ! ฉันคือผู้ช่วยสุขภาพ AI ของคุณ มีอะไรให้ฉันช่วยดูแลเรื่องการออกกำลังกายหรือสุขภาพในวันนี้ไหมคะ?' }
    ];
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialQuerySent = useRef(false);

  // ฟังก์ชันดึงข้อมูล Preferences เดิมจาก API
  const fetchPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workout/preferences`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUserPreferences(data);
      }
    } catch (e) {
      console.error('Error fetching preferences:', e);
    }
  };


  const handleSend = async (textToSend?: string) => {
    const currentInput = textToSend || input;
    if (!currentInput.trim() || isLoading) return;

    if (!textToSend) setInput('');

    const userMsg: Message = { role: 'user', content: currentInput };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // โหลดแผนที่มีอยู่ (จำกัดขนาดไม่เกิน 3 วันแรกเพื่อไม่ให้ payload ใหญ่เกิน)
      const existingWorkoutPlan = (() => {
        try {
          const full = JSON.parse(localStorage.getItem('active_workout_plan') || 'null')
          return Array.isArray(full) ? full.slice(0, 4) : null // ส่งแค่ 4 วันแรก
        } catch { return null }
      })()
      const existingMealPlan = (() => {
        try {
          const full = JSON.parse(localStorage.getItem('active_meal_plan') || 'null')
          return Array.isArray(full) ? full.slice(0, 3) : null // ส่งแค่ 3 วันแรก
        } catch { return null }
      })()

      // --- REAL API CALL ---
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          // ส่งเฉพาะ user messages (กัน error "history must start with user")
          messages: [...messages, userMsg].filter(m => m.role === 'user'),
          context: userPreferences,
          existingWorkoutPlan,  // แผน Workout เดิม
          existingMealPlan      // แผน Meal เดิม
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `AI Chat failed (${response.status})`)
      }

      const data = await response.json();
      let botResponse = data.message;
      let workoutData = null;
      let mealData = null;

      // ฟังก์ชันช่วยดึง JSON จาก text ที่อาจมี markdown ปน
      const extractJson = (raw: string): string => {
        // ลบ markdown code block
        let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
        // หา { แรกและ } สุดท้าย
        const start = cleaned.indexOf('{')
        const end = cleaned.lastIndexOf('}')
        if (start !== -1 && end !== -1) return cleaned.substring(start, end + 1)
        return cleaned
      }

      // --- JSON DETECTION LOGIC ---
      if (botResponse.includes('[WORKOUT_DATA]')) {
        const parts = botResponse.split('[WORKOUT_DATA]')
        const textContent = parts[0].trim()
        try {
          const jsonStr = extractJson(parts[1] || '')
          if (jsonStr) workoutData = JSON.parse(jsonStr)
          botResponse = textContent
        } catch (e) {
          console.error('Workout JSON Parse Error:', e, '\nRaw:', parts[1])
        }
      } else if (botResponse.includes('[MEAL_DATA]')) {
        const parts = botResponse.split('[MEAL_DATA]')
        const textContent = parts[0].trim()
        try {
          const jsonStr = extractJson(parts[1] || '')
          if (jsonStr) mealData = JSON.parse(jsonStr)
          botResponse = textContent
        } catch (e) {
          console.error('Meal JSON Parse Error:', e, '\nRaw:', parts[1])
        }
      }

      // log เพื่อ debug
      console.log('workoutData:', workoutData ? 'Found ✅' : 'None')
      console.log('mealData:', mealData ? 'Found ✅' : 'None')

      const botMsg: Message = {
        role: 'assistant',
        content: botResponse,
        workoutData: workoutData,
        mealData: mealData
      };

      setMessages(prev => [...prev, botMsg]);
      setIsLoading(false);

    } catch (error: any) {
      console.error('Chat error:', error);
      setIsLoading(false);
      const errMsg = error?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
      setMessages(prev => [...prev, { role: 'assistant', content: `ขออภัยค่ะ: ${errMsg}` }]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Save messages to localStorage whenever they change
    localStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages]);

  // เริ่มต้นโหลดข้อมูล
  useEffect(() => {
    fetchPreferences();

    if (location.state?.initialQuery && !initialQuerySent.current) {
      initialQuerySent.current = true;
      handleSend(location.state.initialQuery);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-100 to-white">
      {/* Header */}
      <div className="sticky top-16 z-50 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto p-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <div className="bg-green-100 p-2 rounded-lg">
            <Sparkles className="text-green-600" size={20} />
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-gray-800 text-lg">Selfcare Assistant</h1>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full animate-pulse"></span>
              Online - พร้อมช่วยคุณเสมอ
            </p>
          </div>
          {/* ปุ่มล้างแชท */}
          <button
            onClick={() => {
              if (window.confirm('ต้องการล้างประวัติแชทหรือไม่?')) {
                localStorage.removeItem('chat_history')
                setMessages([{ role: 'assistant', content: 'สวัสดีค่ะ! ฉันคือผู้ช่วยสุขภาพ AI ของคุณ มีอะไรให้ช่วยไหมคะ?' }])
              }
            }}
            className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-gray-400"
            title="ล้างแชท"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* ช่องแชทโชว์ข้อความ */}
      <div className="flex-1 flex justify-center p-6">
        <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-[70vh]">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`flex gap-3 max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-blue-500' : 'bg-gradient-to-br from-emerald-400 to-green-600'
                    }`}>
                    {msg.role === 'user' ? <User size={16} color="white" /> : <Sparkles size={16} color="white" />}
                  </div>
                  <div className={`p-3 rounded-2xl shadow-sm ${msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                    }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    {/* ถ้ามีข้อมูลการออกกำลังกาย ให้แสดงผลตารางแบบเต็ม */}
                    {msg.workoutData && (
                      <div className="mt-3">
                        <WorkoutScheduleDisplay
                          plan={msg.workoutData}
                          onSave={async () => {
                            // 1. ฟอร์แมตข้อมูลให้ตรงกับที่หน้า SchedulePage ต้องการ (exercises ต้องเป็น string[])
                            const dayCardColorMap: Record<string, string> = {
                              Monday: 'border-yellow-200 bg-yellow-50',
                              Tuesday: 'border-pink-200 bg-pink-50',
                              Wednesday: 'border-green-200 bg-green-50',
                              Thursday: 'border-orange-200 bg-orange-50',
                              Friday: 'border-sky-200 bg-sky-50',
                              Saturday: 'border-purple-200 bg-purple-50',
                              Sunday: 'border-red-200 bg-red-50',
                            };

                            const formattedPlan = msg.workoutData.days.map((item: any) => ({
                              day: item.day,
                              dayTh: item.dayTh || item.day,
                              workout: item.workout,
                              duration: `${item.duration} นาที`,
                              exercises: item.exercises.map((ex: any) =>
                                `${ex.name} (${ex.sets} x ${ex.reps})`
                              ),
                              color: dayCardColorMap[item.day] || 'border-gray-200 bg-gray-50'
                            }));

                            // 2. บันทึกลง LocalCache (Key: active_workout_plan) เพื่อให้หน้า Schedule โหลดทันที
                            localStorage.setItem('active_workout_plan', JSON.stringify(formattedPlan));

                            // 3. บันทึกลง API ทั้ง 2 ที่เพื่อให้ Backend รับทราบการเปลี่ยนแปลง
                            try {
                              const { data: { session } } = await supabase.auth.getSession();
                              const token = session?.access_token;
                              if (token) {
                                const schedulePayload = msg.workoutData.days.map((item: any) => ({
                                  day: item.day,
                                  dayTh: item.dayTh,
                                  workout: item.workout,
                                  duration: String(item.duration),
                                  exercises: item.exercises, // ส่งเป็น Object ตามมาตรฐาน API เดิม
                                }));

                                // บันทึกลงตารางสรุป (Schedule)
                                fetch(`${import.meta.env.VITE_API_URL}/api/workout/schedule`, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: JSON.stringify({ schedule: schedulePayload })
                                }).catch(e => console.error('Save to schedule failed:', e));

                                // ส่งไปที่แสดงผล (Active Plan) - ส่งทั้งสองแบบเพื่อความชัวร์
                                fetch(`${import.meta.env.VITE_API_URL}/api/workout/active-plan`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                  body: JSON.stringify({
                                    planData: schedulePayload,
                                    plan_data: schedulePayload
                                  })
                                }).catch(e => console.error('Update active plan failed:', e));
                              }
                            } catch (e) {
                              console.error('Save error:', e);
                            }

                            alert('อัปเดตตารางหลักของคุณเรียบร้อยแล้ว!');
                          }}
                        />
                      </div>
                    )}

                    {/* ถ้ามีข้อมูลแผนอาหาร ให้แสดงผลตารางอาหาร */}
                    {msg.mealData && (
                      <div className="mt-3">
                        <MealScheduleDisplay
                          plan={msg.mealData}
                          onSave={async () => {
                            const dayColorMap: Record<string, string> = {
                              Monday: 'bg-yellow-50',
                              Tuesday: 'bg-pink-50',
                              Wednesday: 'bg-green-50',
                              Thursday: 'bg-orange-50',
                              Friday: 'bg-blue-50',
                              Saturday: 'bg-purple-50',
                              Sunday: 'bg-red-50',
                            };

                            const formattedMealPlan = msg.mealData.days.map((item: any) => ({
                              ...item,
                              color: dayColorMap[item.day] || 'bg-gray-50'
                            }));

                            // 1. บันทึกลง LocalCache
                            localStorage.setItem('active_meal_plan', JSON.stringify(formattedMealPlan));

                            // 2. บันทึกลง API
                            try {
                              const { data: { session } } = await supabase.auth.getSession();
                              const token = session?.access_token;
                              if (token) {
                                // บันทึกลงตารางรวม (Schedule)
                                fetch(`${import.meta.env.VITE_API_URL}/api/meal/schedule`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                  body: JSON.stringify({ schedule: formattedMealPlan })
                                });

                                // บันทึกลง Active Plan (รองรับทั้ง 2 ชื่อฟิลด์)
                                fetch(`${import.meta.env.VITE_API_URL}/api/meal/active-plan`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                  body: JSON.stringify({
                                    planData: formattedMealPlan,
                                    plan_data: formattedMealPlan
                                  })
                                });
                              }
                            } catch (e) {
                              console.error('Meal save error:', e);
                            }

                            alert('อัปเดตแผนอาหารของคุณเรียบร้อยแล้ว!');
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                  <Loader2 size={16} color="white" className="animate-spin" />
                </div>
                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                  <p className="text-sm text-gray-400 italic">บอทกำลังพิมพ์...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto p-4">

          {/* Quick Actions */}
          {!isLoading && (
            <div className="flex gap-2 mb-3 flex-wrap">
              <button
                onClick={() => handleSend('สร้างตารางออกกำลังกาย 7 วันให้ฉันหน่อย')}
                className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full hover:bg-green-100"
              >
                💪 ตารางออกกำลังกาย
              </button>

              <button
                onClick={() => handleSend('ช่วยวางแผนอาหาร 7 วันหน่อย')}
                className="text-xs px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-full hover:bg-orange-100"
              >
                🍽️ แผนอาหาร
              </button>
              <button
                onClick={() => handleSend('แนะนำวิธีดูแลสุขภาพหน่อย')}
                className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1" >
                ❤️ ดูแลสุขภาพ
              </button>
              <button
                onClick={() => handleSend('ปรับแผนออกกำลังกายให้เหมาะกับฉันมากขึ้น')}
                className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full hover:bg-purple-100 transition-colors flex items-center gap-1" >
                🔄 ปรับแผนเดิม
              </button>
            </div>
          )}

          <div className="flex justify-center">

            <div className="w-full max-w-4xl">

              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-emerald-400 transition">

                <input
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700"
                  value={input}
                  
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="พิมพ์ข้อความของคุณ..."
                />

                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className={`p-2 rounded-full transition ${!input.trim() || isLoading
                      ? 'bg-gray-300'
                      : 'bg-gradient-to-br from-emerald-400 to-green-600 hover:scale-105'
                    }`}
                >
                  <Send size={18} color="white" />
                </button>

              </div>

            </div>

          </div>

          <p className="text-xs text-gray-400 text-center mt-2">
            AI อาจทำผิดพลาดได้ กรุณาตรวจสอบข้อมูลอีกครั้ง
          </p>

        </div>
      </div>
    </div>
  );
};

export default ChatPage;
