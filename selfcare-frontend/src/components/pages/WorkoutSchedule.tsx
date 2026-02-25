import { ArrowLeft, Share2, Dumbbell, Calendar } from 'lucide-react';
import { supabase } from '../../utils/supabase.ts';
import type { WeeklyWorkoutPlan } from '../../utils/workoutGenerator';

interface WorkoutScheduleProps {
  onBack: () => void;
  plan: WeeklyWorkoutPlan;
  onSaveToSchedule?: (schedule: { day: string; dayTh: string; workout: string; duration: string; exercises: string[]; color: string }[]) => void;
}

export default function WorkoutSchedule({ onBack, plan, onSaveToSchedule }: WorkoutScheduleProps) {
  // Generate schedule based on user preferences
  const schedule = plan.days.map(day => ({
    day: day.day,
    dayTh: day.day, // map ภาษาไทยทีหลังได้
    workout: day.focus,
    duration: day.duration,
    exercises: day.exercises,
    color: 'bg-emerald-100 border-emerald-200',
  }));


  const handleSave = async () => {
    if (onSaveToSchedule) {
      const localSchedule = schedule.map((item) => ({
        day: item.day,
        dayTh: item.dayTh,
        workout: item.workout,
        duration: `${item.duration} นาที`,
        exercises: item.exercises.length === 0
          ? ['Recovery / Stretching']
          : item.exercises.map((exercise) => `${exercise.name} (${exercise.sets} x ${exercise.reps})`),
        color: dayCardColorMap[item.day] ?? 'border-gray-200 bg-gray-50',
      }));

      onSaveToSchedule(localSchedule);
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const payload = schedule.map(item => ({
          user_id: user.id,
          day: item.day,
          day_th: item.dayTh,
          workout: item.workout,
          duration: item.duration,
          exercises: item.exercises,
        }));

        await supabase
          .from('workout_schedules')
          .delete()
          .eq('user_id', user.id);

        await supabase.from('workout_schedules').insert(payload);
      }
    } catch {}

    alert('บันทึกลงตารางเรียบร้อยแล้ว!');
  };

  const handleShare = () => {
    alert('แชร์แผนออกกำลังกายของคุณ');
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
                        {item.exercises.map((exercise, idx) => (
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