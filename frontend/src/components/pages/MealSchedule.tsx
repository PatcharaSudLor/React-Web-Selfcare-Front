import { useState, useEffect } from 'react'
import { ArrowLeft, Share2, Utensils, Sun, CloudSun, Moon, Calendar } from 'lucide-react'
import type { MealPlanData } from './MealPlanners'
import { supabase } from '../../utils/supabase'

interface Meal {
    id: string
    name: string
    name_th: string
    type: string
    price: number
    ingredients: string[]
    image_url?: string
}

interface DayMeals {
    day: string
    dayTh: string
    breakfast: Meal
    lunch: Meal
    dinner: Meal
    color: string
}

interface MealScheduleProps {
    onBack: () => void
    onSaveToSchedule?: (schedule: DayMeals[]) => void
    mealPlanData: MealPlanData
}

const DEFAULT_MEALS: Meal[] = [
    { id: 'd1', name: 'Chicken Breast with Rice', name_th: 'อกไก่ข้าวกล้อง', price: 60, type: 'rice', ingredients: ['อกไก่', 'ข้าวกล้อง'] },
    { id: 'd2', name: 'Stir-fried Basil with Pork', name_th: 'กะเพราหมูสับ', price: 50, type: 'rice', ingredients: ['หมูสับ', 'ใบกะเพรา'] },
    { id: 'd3', name: 'Salmon Salad', name_th: 'สลัดแซลมอน', price: 120, type: 'salad', ingredients: ['แซลมอน', 'ผักสลัด'] },
    { id: 'd4', name: 'Chicken Noodles', name_th: 'ก๋วยเตี๋ยวไก่', price: 45, type: 'noodles', ingredients: ['เส้นก๋วยเตี๋ยว', 'ไก่'] },
    { id: 'd5', name: 'Beef Steak', name_th: 'สเต็กเนื้อ', price: 180, type: 'steak', ingredients: ['เนื้อวัว', 'มันฝรั่ง'] },
]

const weekDays = [
    { day: 'Monday', dayTh: 'จันทร์' },
    { day: 'Tuesday', dayTh: 'อังคาร' },
    { day: 'Wednesday', dayTh: 'พุธ' },
    { day: 'Thursday', dayTh: 'พฤหัสบดี' },
    { day: 'Friday', dayTh: 'ศุกร์' },
    { day: 'Saturday', dayTh: 'เสาร์' },
    { day: 'Sunday', dayTh: 'อาทิตย์' },
] as const

const dayColorMap: Record<string, string> = {
    Monday: 'bg-yellow-50',
    Tuesday: 'bg-pink-50',
    Wednesday: 'bg-green-50',
    Thursday: 'bg-orange-50',
    Friday: 'bg-blue-50',
    Saturday: 'bg-purple-50',
    Sunday: 'bg-red-50',
}

export default function MealSchedule({ onBack, onSaveToSchedule, mealPlanData }: MealScheduleProps) {
    const { likedMeals, allergicFoods, budget } = mealPlanData
    const budgetNumber = parseInt(budget) || 100

    const [weekSchedule, setWeekSchedule] = useState<DayMeals[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchMeals = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token
            if (!token) return

            const params = new URLSearchParams({
                types: likedMeals.join(','),
                budget: String(budgetNumber),
            })
            if (allergicFoods.length > 0) {
                params.set('allergies', allergicFoods.join(','))
            }

            let meals: Meal[] = []
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/meal/items?${params}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                )
                if (res.ok) {
                    meals = await res.json()
                }
            } catch (err) {
                console.error('Fetch meals error, using defaults:', err)
            }

            // ถ้าไม่มีข้อมูลจาก API ให้ใช้ตัวสำรอง
            if (meals.length === 0) {
                meals = DEFAULT_MEALS.filter(m => m.price <= budgetNumber)
                if (meals.length === 0) meals = DEFAULT_MEALS // ถ้าถูกเกินจนไม่มี ให้เอาทั้งหมดมาสำรองไว้ก่อน
            }

            const getRandomMeal = (seed: number): Meal => {
                if (meals.length === 0) {
                    return { id: '', name: 'No meal', name_th: 'ไม่มีเมนู', price: 0, type: '', ingredients: [] }
                }
                return meals[seed % meals.length]
            }

            const schedule: DayMeals[] = weekDays.map(({ day, dayTh }, index) => ({
                day,
                dayTh,
                breakfast: getRandomMeal(index * 3),
                lunch: getRandomMeal(index * 3 + 1),
                dinner: getRandomMeal(index * 3 + 2),
                color: dayColorMap[day] ?? 'bg-gray-50',
            }))

            setWeekSchedule(schedule)
            setIsLoading(false)
        }

        fetchMeals()
    }, [])

    const handleSave = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token
            if (!token) return

            const scheduleRes = await fetch(`${import.meta.env.VITE_API_URL}/api/meal/schedule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ schedule: weekSchedule, plan: mealPlanData })
            })
            if (!scheduleRes.ok) {
                const err = await scheduleRes.json()
                alert(err.error || 'Failed to save schedule')
                return
            }

            const activePlanRes = await fetch(`${import.meta.env.VITE_API_URL}/api/meal/active-plan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ planData: weekSchedule })
            })
            if (!activePlanRes.ok) {
                const err = await activePlanRes.json()
                alert(err.error || 'Failed to save active plan')
                return
            }

            if (onSaveToSchedule) onSaveToSchedule(weekSchedule)

        } catch (err) {
            console.error(err)
            alert('เกิดข้อผิดพลาด')
            return
        }
        alert('บันทึกลงตารางเรียบร้อยแล้ว!')
    }

    const handleShare = () => {
        if (weekSchedule.length === 0) {
            alert('ไม่มีข้อมูลแผนอาหารให้แชร์')
            return
        }

        const canvas = document.createElement('canvas')
        const width = 1200
        const padding = 48
        const headerHeight = 150
        const cardGap = 18
        const cardHeight = 145
        const footerHeight = 105
        const height = padding * 2 + headerHeight + weekSchedule.length * cardHeight + (weekSchedule.length - 1) * cardGap + footerHeight

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
            alert('ไม่สามารถสร้างรูปภาพได้')
            return
        }

        const dayColorMapForShare: Record<string, { label: string; card: string }> = {
            Monday: { label: '#f59e0b', card: '#fffbeb' },
            Tuesday: { label: '#ec4899', card: '#fdf2f8' },
            Wednesday: { label: '#22c55e', card: '#f0fdf4' },
            Thursday: { label: '#f97316', card: '#fff7ed' },
            Friday: { label: '#0ea5e9', card: '#f0f9ff' },
            Saturday: { label: '#a855f7', card: '#faf5ff' },
            Sunday: { label: '#ef4444', card: '#fef2f2' },
        }

        const bg = ctx.createLinearGradient(0, 0, 0, height)
        bg.addColorStop(0, '#ecfdf5')
        bg.addColorStop(1, '#ffffff')
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, width, height)

        const totalWeeklyBudget = weekSchedule.reduce((total, day) => total + day.breakfast.price + day.lunch.price + day.dinner.price, 0)

        ctx.fillStyle = '#065f46'
        ctx.font = '700 46px Arial'
        ctx.fillText('Meal Plan', padding, padding + 34)

        ctx.fillStyle = '#6b7280'
        ctx.font = '400 24px Arial'
        ctx.fillText(`Budget per meal: ฿${budgetNumber}`, padding, padding + 72)
        ctx.fillText(`Weekly total: ฿${totalWeeklyBudget}`, padding, padding + 106)

        let y = padding + headerHeight
        weekSchedule.forEach((dayMeals) => {
            const colors = dayColorMapForShare[dayMeals.day] ?? { label: '#10b981', card: '#f9fafb' }

            const dayLabelX = padding
            const dayLabelY = y + 14
            const dayLabelW = 170
            const dayLabelH = 46

            ctx.fillStyle = colors.label
            ctx.beginPath()
            ctx.roundRect(dayLabelX, dayLabelY, dayLabelW, dayLabelH, 24)
            ctx.fill()

            ctx.fillStyle = '#ffffff'
            ctx.font = '700 22px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(dayMeals.day, dayLabelX + dayLabelW / 2, dayLabelY + dayLabelH / 2)

            const cardX = dayLabelX + dayLabelW + 20
            const cardW = width - padding - cardX

            ctx.fillStyle = colors.card
            ctx.beginPath()
            ctx.roundRect(cardX, y, cardW, cardHeight, 20)
            ctx.fill()

            ctx.strokeStyle = '#d1d5db'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.roundRect(cardX, y, cardW, cardHeight, 20)
            ctx.stroke()

            const dailyTotal = dayMeals.breakfast.price + dayMeals.lunch.price + dayMeals.dinner.price

            ctx.textAlign = 'left'
            ctx.textBaseline = 'alphabetic'
            ctx.fillStyle = '#374151'
            ctx.font = '600 23px Arial'
            ctx.fillText(`Breakfast: ${dayMeals.breakfast.name_th} (฿${dayMeals.breakfast.price})`, cardX + 20, y + 42)
            ctx.fillText(`Lunch: ${dayMeals.lunch.name_th} (฿${dayMeals.lunch.price})`, cardX + 20, y + 77)
            ctx.fillText(`Dinner: ${dayMeals.dinner.name_th} (฿${dayMeals.dinner.price})`, cardX + 20, y + 112)

            ctx.fillStyle = '#059669'
            ctx.font = '700 22px Arial'
            ctx.fillText(`฿${dailyTotal}`, cardX + cardW - 95, y + 42)

            y += cardHeight + cardGap
        })

        ctx.fillStyle = '#6b7280'
        ctx.font = '500 20px Arial'
        ctx.textAlign = 'left'
        ctx.fillText('Generated by Selfcare App', padding, height - padding + 8)

        const dataUrl = canvas.toDataURL('image/png')
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `meal-plan-${new Date().toISOString().slice(0, 10)}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    const MealCard = ({ meal, icon, timeLabel }: { meal: Meal; icon: React.ReactNode; timeLabel: string }) => (
        <div className="flex items-center gap-2 bg-white rounded-xl p-2 shadow-sm">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{timeLabel}</p>
                <p className="text-sm text-gray-800 truncate">{meal.name_th}</p>
            </div>
            <div className="text-xs text-emerald-600 font-medium flex-shrink-0">
                ฿{meal.price}
            </div>
        </div>
    )

    if (isLoading) return (
        <div className="fixed inset-0 flex items-center justify-center bg-white">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="fixed inset-0 h-screen w-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-white border-b border-gray-100">
                <button onClick={onBack} className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Back</span>
                </button>
            </div>

            <div className="flex-1 px-4 overflow-y-auto pb-6">
                <div className="max-w-2xl mx-auto pt-4">
                    <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <Utensils className="w-6 h-6 text-emerald-600" />
                            <h2 className="text-2xl font-semibold text-gray-800">Meal Plan</h2>
                            <Utensils className="w-6 h-6 text-emerald-600" />
                        </div>

                        <div className="bg-emerald-50 rounded-2xl p-4 mb-6 text-center">
                            <p className="text-sm text-gray-600 mb-1">งบประมาณต่อมื้อ</p>
                            <p className="text-2xl font-semibold text-emerald-700">฿{budget}</p>
                        </div>

                        {weekSchedule.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">ไม่มีเมนูที่ตรงกับเงื่อนไข กรุณาปรับ preferences</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {weekSchedule.map((dayMeals, index) => (
                                    <div key={index} className={`rounded-2xl p-4 ${dayMeals.color} border border-gray-200`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                                                {dayMeals.day}
                                            </div>
                                            <div className="text-xs font-medium text-gray-600">
                                                รวม ฿{dayMeals.breakfast.price + dayMeals.lunch.price + dayMeals.dinner.price}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <MealCard meal={dayMeals.breakfast} icon={<Sun className="w-4 h-4 text-yellow-600" />} timeLabel="เช้า" />
                                            <MealCard meal={dayMeals.lunch} icon={<CloudSun className="w-4 h-4 text-orange-600" />} timeLabel="กลางวัน" />
                                            <MealCard meal={dayMeals.dinner} icon={<Moon className="w-4 h-4 text-indigo-600" />} timeLabel="เย็น" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-gray-600">มื้อทั้งหมด</p>
                                    <p className="text-xl text-gray-800 font-semibold">21 มื้อ</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">งบรวมต่อสัปดาห์</p>
                                    <p className="text-xl text-emerald-700 font-semibold">
                                        ฿{weekSchedule.reduce((total, day) =>
                                            total + day.breakfast.price + day.lunch.price + day.dinner.price, 0
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-around gap-4">
                                <button onClick={onBack} className="flex flex-col items-center gap-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all rounded-2xl p-3 min-w-[80px]">
                                    <ArrowLeft className="w-6 h-6" />
                                    <span className="text-sm font-medium">Back</span>
                                </button>
                                <button onClick={handleSave} className="flex flex-col items-center gap-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all rounded-2xl p-3 min-w-[80px]">
                                    <Calendar className="w-6 h-6" />
                                    <span className="text-sm font-medium">Save</span>
                                </button>
                                <button onClick={handleShare} className="flex flex-col items-center gap-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all rounded-2xl p-3 min-w-[80px]">
                                    <Share2 className="w-6 h-6" />
                                    <span className="text-sm font-medium">Share</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}