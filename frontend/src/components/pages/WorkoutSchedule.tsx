import { ArrowLeft, Share2, Dumbbell, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import type { WeeklyWorkoutPlan } from '../../utils/workoutGenerator';
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react';

interface WorkoutScheduleProps {
  onBack: () => void;
  plan: WeeklyWorkoutPlan;
  onSaveToSchedule?: (schedule: { day: string; dayTh: string; workout: string; duration: string; exercises: string[]; color: string }[]) => void;
}

export default function WorkoutSchedule({ onBack, plan, onSaveToSchedule }: WorkoutScheduleProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const preferences = location.state?.preferences
  const loading = location.state?.loading
  const [workoutPlan, setWorkoutPlan] = useState<WeeklyWorkoutPlan | null>(
    loading ? null : plan
  )
  const [hasGenerated, setHasGenerated] = useState(false)

  useEffect(() => {

    const generateAIPlan = async () => {

      if (!loading || !preferences || hasGenerated) return

      try {

        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/generate-workout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(preferences)
        })

        const data = await response.json()

        setWorkoutPlan(data)
        setHasGenerated(true)

      } catch (err) {
        console.error(err)
      }

    }

    generateAIPlan()

  }, [loading, preferences, hasGenerated])

  const dayThMap: Record<string, string> = {
    Monday: 'จันทร์',
    Tuesday: 'อังคาร',
    Wednesday: 'พุธ',
    Thursday: 'พฤหัสบดี',
    Friday: 'ศุกร์',
    Saturday: 'เสาร์',
    Sunday: 'อาทิตย์',
  }

  // Generate schedule based on user preferences
  const schedule = workoutPlan?.days?.map((day: any) => ({
    day: day.day,
    dayTh: day.dayTh || dayThMap[day.day] || day.day,
    workout: day.workout || day.focus,
    duration: day.duration,
    exercises: day.exercises,
    color: 'bg-emerald-100 border-emerald-200',
  })) || []


  const handleSave = async () => {
    const dayCardColorMap: Record<string, string> = {
      Monday: 'border-yellow-200 bg-yellow-50',
      Tuesday: 'border-pink-200 bg-pink-50',
      Wednesday: 'border-green-200 bg-green-50',
      Thursday: 'border-orange-200 bg-orange-50',
      Friday: 'border-sky-200 bg-sky-50',
      Saturday: 'border-purple-200 bg-purple-50',
      Sunday: 'border-red-200 bg-red-50',
    };

    // 1. บันทึกลง LocalCache ทันที (Dual Save) เพื่อให้หน้า Schedule โหลดได้ไว
    const activePlanData = schedule.map(item => ({
      day: item.day,
      dayTh: item.dayTh,
      workout: item.workout,
      duration: `${item.duration} นาที`,
      exercises: item.exercises.map((ex: any) =>
        typeof ex === 'string' ? ex : `${ex.name} (${ex.sets} x ${ex.reps})`),
      color: dayCardColorMap[item.day] ?? 'border-gray-200 bg-gray-50',
    }));
    localStorage.setItem('active_workout_plan', JSON.stringify(activePlanData));

    // 2. ส่งข้อมูลให้ Parent component (ถ้ามี)
    if (onSaveToSchedule) {
      onSaveToSchedule(activePlanData);
    }

    // 3. บันทึกลง API ในพื้นหลัง
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const schedulePayload = schedule.map(item => ({
        day: item.day,
        dayTh: item.dayTh,
        workout: item.workout,
        duration: `${item.duration} นาที`,
        exercises: item.exercises.map((ex: any) =>
          typeof ex === 'string'
            ? ex
            : `${ex.name} (${ex.sets} x ${ex.reps})`
        ),
        color: dayCardColorMap[item.day] ?? 'border-gray-200 bg-gray-50'
      }))

      const scheduleRes = await fetch(`${import.meta.env.VITE_API_URL}/api/workout/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ schedule: schedulePayload })
      });

      if (scheduleRes.ok) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/workout/active-plan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            planData: schedulePayload,
            plan_data: schedulePayload // ส่งทั้ง 2 ชื่อเพื่อรองรับ Backend ทุกเวอร์ชัน
          })
        });
      }
    } catch (err) {
      console.error('Save to API failed:', err);
    }

    navigate('/schedule', {
      state: {
        newWorkoutPlan: activePlanData
      }
    })

    setTimeout(() => {
      alert('บันทึกลงตารางเรียบร้อยแล้ว!');
    }, 300)
  };

  const handleShare = () => {
    const canvas = document.createElement('canvas');
    const width = 1200;
    const padding = 48;
    const headerHeight = 130;
    const cardGap = 20;
    const baseCardHeight = 78;
    const lineHeight = 28;

    const getExerciseLines = (exercises: any[]) => {
      if (exercises.length === 0) return ['Recovery / Stretching'];

      return exercises.map((exercise) =>
        typeof exercise === 'string'
          ? exercise
          : `${exercise.name} (${exercise.sets} x ${exercise.reps})`
      );
    };

    const cardHeights = schedule.map((item) => {
      const lines = getExerciseLines(item.exercises);
      return baseCardHeight + lines.length * lineHeight;
    });

    const contentHeight = cardHeights.reduce((sum, h) => sum + h, 0) + cardGap * (schedule.length - 1);
    const footerHeight = 90;
    const height = headerHeight + contentHeight + footerHeight + padding * 2;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      alert('ไม่สามารถสร้างรูปภาพได้');
      return;
    }

    const dayColorMap: Record<string, { label: string; card: string }> = {
      Monday: { label: '#f59e0b', card: '#fffbeb' },
      Tuesday: { label: '#ec4899', card: '#fdf2f8' },
      Wednesday: { label: '#22c55e', card: '#f0fdf4' },
      Thursday: { label: '#f97316', card: '#fff7ed' },
      Friday: { label: '#0ea5e9', card: '#f0f9ff' },
      Saturday: { label: '#a855f7', card: '#faf5ff' },
      Sunday: { label: '#ef4444', card: '#fef2f2' },
    };

    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, '#ecfdf5');
    bg.addColorStop(1, '#ffffff');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#065f46';
    ctx.font = '700 46px Arial';
    ctx.fillText('Workout Schedule', padding, padding + 34);

    ctx.fillStyle = '#6b7280';
    ctx.font = '400 26px Arial';
    ctx.fillText('7-Day Personal Plan', padding, padding + 76);

    let y = padding + headerHeight;

    schedule.forEach((item, index) => {
      const rowHeight = cardHeights[index];
      const colors = dayColorMap[item.day] ?? { label: '#10b981', card: '#f9fafb' };

      const labelX = padding;
      const labelW = 170;
      const labelH = 50;
      const labelY = y + 14;

      ctx.fillStyle = colors.label;
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, labelW, labelH, 24);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.day, labelX + labelW / 2, labelY + labelH / 2);

      const cardX = labelX + labelW + 22;
      const cardW = width - padding - cardX;

      ctx.fillStyle = colors.card;
      ctx.beginPath();
      ctx.roundRect(cardX, y, cardW, rowHeight, 20);
      ctx.fill();

      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(cardX, y, cardW, rowHeight, 20);
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#111827';
      ctx.font = '700 28px Arial';
      ctx.fillText(item.workout, cardX + 22, y + 38);

      const durationText = item.duration === 0 ? 'Rest day' : `${item.duration} min`;
      ctx.fillStyle = '#4b5563';
      ctx.font = '600 20px Arial';
      ctx.fillText(durationText, cardX + cardW - 150, y + 38);

      const exerciseLines = getExerciseLines(item.exercises);
      ctx.fillStyle = '#374151';
      ctx.font = '500 19px Arial';
      exerciseLines.forEach((line, i) => {
        ctx.fillText(`• ${line}`, cardX + 24, y + 72 + i * lineHeight);
      });

      y += rowHeight + cardGap;
    });

    ctx.fillStyle = '#6b7280';
    ctx.font = '500 20px Arial';
    ctx.fillText('Generated by Selfcare App', padding, height - padding + 8);

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `workout-schedule-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // สีพาสเทลประจำวัน - ป้าย Day Label
  const dayLabelColorMap: Record<string, string> = {
    Monday: 'bg-yellow-400 text-white',
    Tuesday: 'bg-pink-400 text-white',
    Wednesday: 'bg-green-400 text-white',
    Thursday: 'bg-orange-400 text-white',
    Friday: 'bg-sky-400 text-white',
    Saturday: 'bg-purple-400 text-white',
    Sunday: 'bg-red-400 text-white',
  };

  // สีพาสเทลประจำวัน - กล่อง Workout
  const dayCardColorMap: Record<string, string> = {
    Monday: 'border-yellow-200 bg-yellow-50',
    Tuesday: 'border-pink-200 bg-pink-50',
    Wednesday: 'border-green-200 bg-green-50',
    Thursday: 'border-orange-200 bg-orange-50',
    Friday: 'border-sky-200 bg-sky-50',
    Saturday: 'border-purple-200 bg-purple-50',
    Sunday: 'border-red-200 bg-red-50',
  };

  if (!workoutPlan) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center space-y-3">

          <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto" />

          <p className="text-lg font-semibold">
            AI is generating your workout plan...
          </p>

          <p className="text-sm text-gray-500">
            Analyzing your body type and goal
          </p>

        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 h-screen w-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col overflow-hidden">
      {/* Content */}
      <div className="flex-1 px-4 overflow-y-auto pb-6">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <div className="mb-6 pt-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            {/* Header */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <Dumbbell className="w-6 h-6 text-emerald-600" />
              <h2 className="text-2xl font-semibold text-gray-800">Workout Schedule</h2>
              <Dumbbell className="w-6 h-6 text-emerald-600" />
            </div>

            {/* Schedule List */}
            <div className="space-y-4">
              {schedule.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  {/* Day Label - ใช้สีพาสเทล */}
                  <div className="flex-shrink-0">
                    <div className={`${dayLabelColorMap[item.day] ?? 'bg-emerald-400 text-white'} px-5 py-2.5 rounded-full text-sm font-medium min-w-[110px] text-center shadow-sm`}>
                      {item.day}
                    </div>
                  </div>

                  {/* Workout Details - ใช้สีพาสเทล */}
                  <div className={`flex-1 rounded-2xl border-2 p-4 transition-all hover:shadow-md ${dayCardColorMap[item.day] ?? 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-gray-800 font-semibold text-lg">{item.workout}</h3>
                      <span className="text-xs font-medium text-gray-600 bg-white bg-opacity-70 px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                        {item.duration === 0 ? 'Rest day' : `${item.duration} min`}
                      </span>
                    </div>
                    {item.exercises.length === 0 ? (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-gray-700 bg-white bg-opacity-70 px-3 py-1.5 rounded-full shadow-sm">
                          Recovery / Stretching
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {item.exercises.map((exercise: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs text-gray-700 bg-white bg-opacity-70 px-3 py-1.5 rounded-full shadow-sm"
                          >
                            <span className="font-medium">{exercise.name}</span>
                            <span className="text-gray-500">
                              {exercise.sets} x {exercise.reps}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Weekend Note */}
            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl text-center border border-emerald-100">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Weekend:</span> Rest days or light stretching 🧘‍♀️
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-around gap-4">
                {/* Back */}
                <button
                  onClick={onBack}
                  className="flex flex-col items-center gap-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all rounded-2xl p-3 min-w-[80px]"
                >
                  <ArrowLeft className="w-6 h-6" />
                  <span className="text-sm font-medium">Back</span>
                </button>

                {/* Save */}
                <button
                  onClick={handleSave}
                  className="flex flex-col items-center gap-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all rounded-2xl p-3 min-w-[80px]"
                >
                  <Calendar className="w-6 h-6" />
                  <span className="text-sm font-medium">Save</span>
                </button>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="flex flex-col items-center gap-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all rounded-2xl p-3 min-w-[80px]"
                >
                  <Share2 className="w-6 h-6" />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}