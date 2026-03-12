import { useState, useEffect } from 'react';
import { Calendar, Dumbbell, Utensils, Sun, CloudSun, Moon, Trash2 } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

interface Workout {
    day: string;
    dayTh: string;
    workout: string;
    duration: string;
    exercises: string[];
    color: string;
}

interface Meal {
    id: string
    name: string
    name_th: string
    type: string
    price: number
    ingredients: string[]
    image_url?: string
}

interface MealDay {
    day: string;
    dayTh: string;
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    color: string;
}

type TabType = 'workout' | 'meal' | 'all';

const dayCardColorMap: Record<string, string> = {
    Monday: 'border-yellow-200 bg-yellow-50',
    Tuesday: 'border-pink-200 bg-pink-50',
    Wednesday: 'border-green-200 bg-green-50',
    Thursday: 'border-orange-200 bg-orange-50',
    Friday: 'border-sky-200 bg-sky-50',
    Saturday: 'border-purple-200 bg-purple-50',
    Sunday: 'border-red-200 bg-red-50',
};

export function SchedulePage() {
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [selectedDate] = useState(new Date());
    const [workoutPlan, setWorkoutPlan] = useState<Workout[] | null>(null);
    const [mealPlan, setMealPlan] = useState<MealDay[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = daysOfWeek[selectedDate.getDay()];

    useEffect(() => {

        const newPlan = location.state?.newWorkoutPlan

        if (newPlan) {

            setWorkoutPlan(newPlan)

            localStorage.setItem(
                'active_workout_plan',
                JSON.stringify(newPlan)
            )

            // ⭐ clear location state ป้องกัน rerender
            navigate('/schedule', { replace: true })

        }

    }, [location.state, navigate])

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const fetchPlans = async () => {
            // 1. ดึงข้อมูลจาก Cache (LocalStorage) มาแสดงก่อนทันที
            const cachedWorkout = localStorage.getItem('active_workout_plan');
            const cachedMeal = localStorage.getItem('active_meal_plan');

            if (cachedWorkout) {
                const parsed = JSON.parse(cachedWorkout);
                if (Array.isArray(parsed) && parsed.length > 0) setWorkoutPlan(parsed);
            }
            if (cachedMeal) {
                const parsed = JSON.parse(cachedMeal);
                if (Array.isArray(parsed) && parsed.length > 0) setMealPlan(parsed);
            }

            // ถ้ามีข้อมูลใน Cache แล้ว ให้หยุดหมุน Loader
            if (
                (cachedWorkout && JSON.parse(cachedWorkout).length > 0) ||
                (cachedMeal && JSON.parse(cachedMeal).length > 0)
            ) {
                setIsLoading(false)
            }

            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token
            if (!token) {
                if (!cachedWorkout && !cachedMeal) setIsLoading(false);
                return;
            }

            const headers = { 'Authorization': `Bearer ${token}` }

            try {
                const [workoutRes, mealRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/api/workout/active-plan`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL}/api/meal/active-plan`, { headers }),
                ])

                if (workoutRes.ok) {
                    const data = await workoutRes.json()
                    const actualPlanData = data ? (data.plan_data || data.planData) : null;
                    if (actualPlanData && Array.isArray(actualPlanData) && actualPlanData.length > 0) {
                        setWorkoutPlan(actualPlanData);
                        localStorage.setItem('active_workout_plan', JSON.stringify(actualPlanData));
                    } else {
                        setWorkoutPlan(null);
                        localStorage.removeItem('active_workout_plan');
                        localStorage.removeItem('user_workout_plan');
                        localStorage.removeItem('workout_plan');
                    }
                } else if (workoutRes.status === 404) {
                    // หาก API แจ้งว่าไม่พบแผน (404) ให้ล้างข้อมูลทิ้งทันที
                    setWorkoutPlan(null);
                    localStorage.removeItem('active_workout_plan');
                    localStorage.removeItem('user_workout_plan');
                    localStorage.removeItem('workout_plan');
                }

                if (mealRes.ok) {
                    const data = await mealRes.json()
                    const actualMealData = data ? (data.plan_data || data.planData) : null;
                    if (actualMealData && Array.isArray(actualMealData) && actualMealData.length > 0) {
                        setMealPlan(actualMealData);
                        localStorage.setItem('active_meal_plan', JSON.stringify(actualMealData));
                    } else {
                        setMealPlan(null);
                        localStorage.removeItem('active_meal_plan');
                        localStorage.removeItem('user_meal_plan');
                        localStorage.removeItem('meal_plan');
                    }
                } else if (mealRes.status === 404) {
                    setMealPlan(null);
                    localStorage.removeItem('active_meal_plan');
                    localStorage.removeItem('user_meal_plan');
                    localStorage.removeItem('meal_plan');
                }
            } catch (err) {
                console.error("Background fetch failed:", err);
            }

            setIsLoading(false)
        }
        fetchPlans()
    }, []);

    const handleDeleteWorkout = async () => {
        if (!confirm('คุณต้องการลบแผนออกกำลังกายหรือไม่')) return
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) return

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workout/active-plan`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
            // 1. ล้าง State
            setWorkoutPlan(null);

            // 2. ล้าง LocalStorage ทั้งหมดที่เกี่ยวข้อง
            localStorage.removeItem('active_workout_plan');
            localStorage.removeItem('user_workout_plan');
            localStorage.removeItem('workout_plan');
            localStorage.removeItem('user_workout_preferences'); // เพิ่มคีย์อื่นๆ ที่อาจเกี่ยวข้อง

            alert('ลบแผนออกกำลังกายเรียบร้อยแล้ว');
            // ไม่ต้องใช้ reload เพราะ React State อัตเดตแล้ว UI จะเปลี่ยนเอง
        } else {
            const errData = await res.json().catch(() => ({}));
            alert(`ไม่สามารถลบแผนได้: ${errData.error || res.statusText}`);
        }
    }

    const handleDeleteMeal = async () => {
        if (!confirm('คุณต้องการลบแผนอาหารหรือไม่')) return
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) return

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/meal/active-plan`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
            // 1. ล้าง State
            setMealPlan(null);

            // 2. ล้าง LocalStorage
            localStorage.removeItem('active_meal_plan');
            localStorage.removeItem('user_meal_plan');
            localStorage.removeItem('meal_plan');

            alert('ลบแผนอาหารเรียบร้อยแล้ว');
        } else {
            const errData = await res.json().catch(() => ({}));
            alert(`ไม่สามารถลบแผนอาหารได้: ${errData.error || res.statusText}`);
        }
    }

    const todayWorkout = workoutPlan?.find(w => w.day === currentDay) ?? null
    const todayMeals = mealPlan?.find(m => m.day === currentDay) ?? null
    const hasSchedules = (workoutPlan && workoutPlan.length > 0) || (mealPlan && mealPlan.length > 0)
    const showWorkout = activeTab === 'all' || activeTab === 'workout';
    const showMeal = activeTab === 'all' || activeTab === 'meal';

    const MealCard = ({ meal, icon, timeLabel }: { meal: Meal; icon: React.ReactNode; timeLabel: string }) => (
        <div className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{timeLabel}</p>
                <p className="text-sm text-gray-800">{meal.name_th}</p>
            </div>
            <div className="text-sm text-emerald-600 font-medium flex-shrink-0">
                ฿{meal.price}
            </div>
        </div>
    );

    if (isLoading) return (
        <div className="fixed inset-0 h-screen w-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col overflow-hidden pt-16">
            <div className="flex-1 px-4 overflow-y-auto pb-24">
                <div className="max-w-2xl mx-auto pt-6 animate-pulse">
                    {/* Header skeleton */}
                    <div className="mb-6">
                        <div className="h-7 w-36 bg-gray-200 rounded-lg mb-2" />
                        <div className="h-4 w-56 bg-gray-100 rounded-lg" />
                    </div>

                    {/* Tabs skeleton */}
                    <div className="flex gap-2 mb-6">
                        <div className="h-10 w-20 bg-gray-200 rounded-xl" />
                        <div className="h-10 w-32 bg-gray-200 rounded-xl" />
                        <div className="h-10 w-24 bg-gray-200 rounded-xl" />
                    </div>

                    {/* Card skeleton 1 */}
                    <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 bg-gray-200 rounded" />
                            <div className="h-5 w-40 bg-gray-200 rounded" />
                        </div>
                        <div className="rounded-2xl border-2 border-gray-100 p-4">
                            <div className="flex justify-between mb-3">
                                <div className="h-5 w-32 bg-gray-200 rounded" />
                                <div className="h-5 w-16 bg-gray-100 rounded-full" />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <div className="h-7 w-24 bg-gray-100 rounded-full" />
                                <div className="h-7 w-32 bg-gray-100 rounded-full" />
                                <div className="h-7 w-20 bg-gray-100 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Card skeleton 2 */}
                    <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 bg-gray-200 rounded" />
                            <div className="h-5 w-36 bg-gray-200 rounded" />
                        </div>
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="h-3 w-12 bg-gray-200 rounded mb-1" />
                                        <div className="h-4 w-32 bg-gray-200 rounded" />
                                    </div>
                                    <div className="h-4 w-10 bg-gray-200 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active plans skeleton */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5">
                        <div className="h-5 w-36 bg-gray-200 rounded mb-4" />
                        <div className="bg-white rounded-xl p-3 flex items-center justify-between mb-3">
                            <div>
                                <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
                                <div className="h-3 w-10 bg-gray-100 rounded" />
                            </div>
                            <div className="h-9 w-16 bg-gray-200 rounded-lg" />
                        </div>
                        <div className="bg-white rounded-xl p-3 flex items-center justify-between">
                            <div>
                                <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
                                <div className="h-3 w-10 bg-gray-100 rounded" />
                            </div>
                            <div className="h-9 w-16 bg-gray-200 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="fixed inset-0 h-screen w-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col overflow-hidden pt-16">
            <div className="flex-1 px-4 overflow-y-auto pb-24">
                <div className="max-w-2xl mx-auto pt-6">
                    <div className="mb-6">
                        <h2 className="text-2xl text-gray-800">My Schedule</h2>
                        <p className="text-sm text-gray-600">
                            {selectedDate.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    {/* Tabs */}
                    {hasSchedules && (
                        <div className="flex gap-2 mb-6">
                            <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'all' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                                ทั้งหมด
                            </button>
                            <button onClick={() => setActiveTab('workout')} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${activeTab === 'workout' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                                <Dumbbell className="w-4 h-4" /> ออกกำลังกาย
                            </button>
                            <button onClick={() => setActiveTab('meal')} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${activeTab === 'meal' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                                <Utensils className="w-4 h-4" /> อาหาร
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!hasSchedules && (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl text-gray-800 mb-2">ยังไม่มีตารางของคุณ</h3>
                            <p className="text-gray-500 text-sm mb-8">เริ่มสร้างแผนเพื่อดูตารางประจำวันของคุณที่นี่</p>

                            <div className="flex flex-col gap-3 max-w-xs mx-auto">
                                <button
                                    onClick={() => navigate('/workouts/planner')}
                                    className="flex items-center gap-3 px-5 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-2xl transition-colors shadow-sm"
                                >
                                    <Dumbbell className="w-5 h-5" />
                                    <span>สร้างแผนออกกำลังกาย</span>
                                </button>
                                <button
                                    onClick={() => navigate('/meals/planner')}
                                    className="flex items-center gap-3 px-5 py-3.5 bg-white hover:bg-emerald-50 text-emerald-600 font-medium rounded-2xl transition-colors shadow-sm border-2 border-emerald-200"
                                >
                                    <Utensils className="w-5 h-5" />
                                    <span>สร้างแผนอาหาร</span>
                                </button>
                            </div>
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
                                    <div className={`rounded-2xl border-2 p-4 ${dayCardColorMap[todayWorkout.day] ?? 'border-gray-200 bg-gray-50'}`}>
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="text-gray-800 font-medium">{todayWorkout.workout}</h4>
                                            <span className="text-sm text-gray-600 bg-white bg-opacity-50 px-3 py-1 rounded-full">{todayWorkout.duration}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {todayWorkout.exercises.map((exercise: any, idx: number) => (
                                                <span key={idx} className="text-sm text-gray-600 bg-white bg-opacity-60 px-3 py-1.5 rounded-full">
                                                    {typeof exercise === 'string'
                                                        ? exercise
                                                        : `${exercise.name} (${exercise.sets} x ${exercise.reps})`
                                                    }
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ไม่มีแผน workout */}
                            {showWorkout && !workoutPlan && (
                                <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Dumbbell className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <p className="text-gray-700 font-medium mb-1">ยังไม่มีแผนออกกำลังกาย</p>
                                    <p className="text-sm text-gray-500 mb-4">สร้างแผนและบันทึกเพื่อดูตารางประจำวัน</p>
                                    <button
                                        onClick={() => navigate('/workouts/planner')}
                                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors"
                                    >
                                        สร้างแผนออกกำลังกาย
                                    </button>
                                </div>
                            )}

                            {showMeal && todayMeals && (
                                <div className="bg-white rounded-2xl shadow-sm p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Utensils className="w-5 h-5 text-emerald-600" />
                                        <h3 className="text-lg text-gray-800">แผนอาหารวันนี้</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <MealCard meal={todayMeals.breakfast} icon={<Sun className="w-5 h-5 text-yellow-600" />} timeLabel="มื้อเช้า" />
                                        <MealCard meal={todayMeals.lunch} icon={<CloudSun className="w-5 h-5 text-orange-600" />} timeLabel="มื้อกลางวัน" />
                                        <MealCard meal={todayMeals.dinner} icon={<Moon className="w-5 h-5 text-indigo-600" />} timeLabel="มื้อเย็น" />
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

                            {/* ไม่มีแผน meal */}
                            {showMeal && !mealPlan && (
                                <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Utensils className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <p className="text-gray-700 font-medium mb-1">ยังไม่มีแผนอาหาร</p>
                                    <p className="text-sm text-gray-500 mb-4">สร้างแผนและบันทึกเพื่อดูเมนูประจำวัน</p>
                                    <button
                                        onClick={() => navigate('/meals/planner')}
                                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors"
                                    >
                                        สร้างแผนอาหาร
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Active Plans */}
                    {hasSchedules && (
                        <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5">
                            <h3 className="text-lg text-gray-800 mb-4">แผนที่ active อยู่</h3>

                            {workoutPlan && workoutPlan.length > 0 && (
                                <div className="bg-white rounded-xl p-3 flex items-center justify-between mb-3">
                                    <div className="text-left min-w-[170px]">
                                        <p className="text-sm text-gray-800 flex items-center gap-2">
                                            <Dumbbell className="w-4 h-4 text-emerald-600" /> แผนออกกำลังกาย
                                        </p>
                                        <p className="text-xs text-gray-500">7 วัน</p>
                                    </div>
                                    <button onClick={handleDeleteWorkout} className="px-3 h-9 bg-red-50 border border-red-200 rounded-lg flex items-center gap-1.5 hover:bg-red-100 transition-colors">
                                        <Trash2 size={16} strokeWidth={2.5} color="#dc2626" />
                                        <span className="text-xs font-medium text-red-600">ลบ</span>
                                    </button>
                                </div>
                            )}

                            {mealPlan && mealPlan.length > 0 && (
                                <div className="bg-white rounded-xl p-3 flex items-center justify-between">
                                    <div className="text-left min-w-[170px]">
                                        <p className="text-sm text-gray-800 flex items-center gap-2">
                                            <Utensils className="w-4 h-4 text-emerald-600" /> แผนอาหาร
                                        </p>
                                        <p className="text-xs text-gray-500">7 วัน</p>
                                    </div>
                                    <button onClick={handleDeleteMeal} className="px-3 h-9 bg-red-50 border border-red-200 rounded-lg flex items-center gap-1.5 hover:bg-red-100 transition-colors">
                                        <Trash2 size={16} strokeWidth={2.5} color="#dc2626" />
                                        <span className="text-xs font-medium text-red-600">ลบ</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}