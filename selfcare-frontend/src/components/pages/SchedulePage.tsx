import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Dumbbell, Utensils, Sun, CloudSun, Moon, Trash2 } from 'lucide-react';

interface Workout {
  day: string;
  dayTh: string;
  workout: string;
  duration: string;
  exercises: string[];
  color: string;
}

interface Meal {
  name: string;
  nameTh: string;
  price: number;
  type: string;
  excludeAllergies: string[];
  image?: string;
}

interface MealDay {
  day: string;
  dayTh: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  color: string;
}

interface SchedulePageProps {
  onBack: () => void;
  workoutSchedules: Workout[][];
  mealSchedules: MealDay[][];
  onDeleteWorkoutSchedule: (index: number) => void;
  onDeleteMealSchedule: (index: number) => void;
}

type TabType = 'workout' | 'meal' | 'all';

export function SchedulePage({ onBack, workoutSchedules, mealSchedules, onDeleteWorkoutSchedule, onDeleteMealSchedule }: SchedulePageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedDate] = useState(new Date());

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Get current day of week (0 = Sunday, 1 = Monday, etc.)
  const currentDayIndex = selectedDate.getDay();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = daysOfWeek[currentDayIndex];

  // Get today's workout from the latest schedule
  const todayWorkout = workoutSchedules.length > 0
    ? workoutSchedules[workoutSchedules.length - 1].find(w => w.day === currentDay)
    : null;

  // Get today's meals from the latest schedule
  const todayMeals = mealSchedules.length > 0
    ? mealSchedules[mealSchedules.length - 1].find(m => m.day === currentDay)
    : null;

  const hasSchedules = workoutSchedules.length > 0 || mealSchedules.length > 0;
  const showWorkout = activeTab === 'all' || activeTab === 'workout';
  const showMeal = activeTab === 'all' || activeTab === 'meal';

  const MealCard = ({ meal, icon, timeLabel }: { meal: Meal; icon: React.ReactNode; timeLabel: string }) => (
    <div className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm">
      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{timeLabel}</p>
        <p className="text-sm text-gray-800">{meal.nameTh}</p>
      </div>
      <div className="text-sm text-emerald-600 font-medium flex-shrink-0">
        ฿{meal.price}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 h-screen w-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col overflow-hidden pt-16">
      <div className="flex-1 px-4 overflow-y-auto pb-24">
        <div className="max-w-2xl mx-auto pt-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl text-gray-800">My Schedule</h2>
            <p className="text-sm text-gray-600">
              {selectedDate.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

        {/* Tabs */}
        {hasSchedules && (
          <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'all'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setActiveTab('workout')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'workout'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            ออกกำลังกาย
          </button>
          <button
            onClick={() => setActiveTab('meal')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'meal'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Utensils className="w-4 h-4" />
            อาหาร
          </button>
          </div>
        )}

      {/* Empty State */}
        {!hasSchedules && (
          <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl text-gray-800 mb-2">ยังไม่มีตารางของคุณ</h3>
          <p className="text-gray-600 mb-4">
            สร้างแผนออกกำลังกายหรือแผนอาหารและบันทึกลงตารางเพื่อดูที่นี่
          </p>
          </div>
        )}

      {/* Today's Schedule */}
        {hasSchedules && (
          <div className="space-y-4">
          {/* Workout Section */}
          {showWorkout && todayWorkout && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Dumbbell className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg text-gray-800">ออกกำลังกายวันนี้</h3>
              </div>
              <div className={`rounded-2xl border-2 p-4 ${todayWorkout.color}`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-gray-800 font-medium">{todayWorkout.workout}</h4>
                  <span className="text-sm text-gray-600 bg-white bg-opacity-50 px-3 py-1 rounded-full">
                    {todayWorkout.duration}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {todayWorkout.exercises.map((exercise, idx) => (
                    <span
                      key={idx}
                      className="text-sm text-gray-600 bg-white bg-opacity-60 px-3 py-1.5 rounded-full"
                    >
                      {exercise}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showWorkout && !todayWorkout && workoutSchedules.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg text-gray-600">วันหยุดพัก</h3>
              </div>
              <p className="text-sm text-gray-500">ไม่มีกำหนดการออกกำลังกายในวันนี้</p>
            </div>
          )}

          {/* Meal Section */}
          {showMeal && todayMeals && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Utensils className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg text-gray-800">แผนอาหารวันนี้</h3>
              </div>
              <div className="space-y-2">
                <MealCard
                  meal={todayMeals.breakfast}
                  icon={<Sun className="w-5 h-5 text-yellow-600" />}
                  timeLabel="มื้อเช้า"
                />
                <MealCard
                  meal={todayMeals.lunch}
                  icon={<CloudSun className="w-5 h-5 text-orange-600" />}
                  timeLabel="มื้อกลางวัน"
                />
                <MealCard
                  meal={todayMeals.dinner}
                  icon={<Moon className="w-5 h-5 text-indigo-600" />}
                  timeLabel="มื้อเย็น"
                />
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">รวมค่าใช้จ่ายวันนี้</span>
                  <span className="text-lg text-emerald-700 font-medium">
                    ฿{todayMeals.breakfast.price + todayMeals.lunch.price + todayMeals.dinner.price}
                  </span>
                </div>
              </div>
            </div>
          )}

          {showMeal && !todayMeals && mealSchedules.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg text-gray-600">ไม่มีแผนอาหาร</h3>
              </div>
              <p className="text-sm text-gray-500">ยังไม่มีแผนอาหารในวันนี้</p>
            </div>
          )}
          </div>
        )}

      {/* Stats */}
        {hasSchedules && (
          <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5">
          <h3 className="text-lg text-gray-800 mb-4">รายการแผนทั้งหมด</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white bg-opacity-60 rounded-xl p-3 text-center">
              <p className="text-sm text-gray-600">แผนออกกำลังกาย</p>
              <p className="text-2xl text-emerald-700 font-medium">{workoutSchedules.length}</p>
            </div>
            <div className="bg-white bg-opacity-60 rounded-xl p-3 text-center">
              <p className="text-sm text-gray-600">แผนอาหาร</p>
              <p className="text-2xl text-emerald-700 font-medium">{mealSchedules.length}</p>
            </div>
          </div>

          {/* Workout Plans List */}
          {workoutSchedules.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm text-gray-700 font-medium mb-2 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-600" />
                แผนออกกำลังกาย ({workoutSchedules.length})
              </h4>
              <div className="space-y-2">
                {workoutSchedules.map((_, index) => (
                  <div key={index} className="bg-white rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-800">แผนออกกำลังกาย #{index + 1}</p>
                      <p className="text-xs text-gray-500">7 วัน</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('คุณต้องการลบแผนนี้หรือไม่?')) {
                          onDeleteWorkoutSchedule(index);
                        }
                      }}
                      className="px-3 h-9 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors"
                      aria-label="ลบแผนออกกำลังกาย"
                      title="ลบแผน"
                    >
                      <Trash2 size={16} strokeWidth={2.5} color="#dc2626" />
                      <span className="text-xs font-medium text-red-600">ลบ</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meal Plans List */}
          {mealSchedules.length > 0 && (
            <div>
              <h4 className="text-sm text-gray-700 font-medium mb-2 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-600" />
                แผนอาหาร ({mealSchedules.length})
              </h4>
              <div className="space-y-2">
                {mealSchedules.map((_, index) => (
                  <div key={index} className="bg-white rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-800">แผนอาหาร #{index + 1}</p>
                      <p className="text-xs text-gray-500">7 วัน</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('คุณต้องการลบแผนนี้หรือไม่?')) {
                          onDeleteMealSchedule(index);
                        }
                      }}
                      className="px-3 h-9 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors"
                      aria-label="ลบแผนอาหาร"
                      title="ลบแผน"
                    >
                      <Trash2 size={16} strokeWidth={2.5} color="#dc2626" />
                      <span className="text-xs font-medium text-red-600">ลบ</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}