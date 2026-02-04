import { ArrowLeft, Share2, Dumbbell, Calendar } from 'lucide-react';

interface WorkoutScheduleProps {
  onBack: () => void;
  onSaveToSchedule?: (schedule: DaySchedule[]) => void;
  selectedTime?: number;
  bodyType?: string;
  goal?: string;
}

interface DaySchedule {
  day: string;
  dayTh: string;
  workout: string;
  duration: string;
  exercises: string[];
  color: string;
}

export default function WorkoutSchedule({ onBack, onSaveToSchedule, selectedTime = 30 }: WorkoutScheduleProps) {
  // Generate schedule based on user preferences
  const schedule: DaySchedule[] = [
    {
      day: 'Monday',
      dayTh: 'จันทร์',
      workout: 'Upper Body & Chest',
      duration: `${selectedTime} min`,
      exercises: ['Push-ups', 'Dumbbell Press', 'Shoulder Raises'],
      color: 'bg-pink-100 border-pink-200',
    },
    {
      day: 'Tuesday',
      dayTh: 'อังคาร',
      workout: 'Core & Abs',
      duration: `${selectedTime} min`,
      exercises: ['Planks', 'Crunches', 'Leg Raises'],
      color: 'bg-green-100 border-green-200',
    },
    {
      day: 'Wednesday',
      dayTh: 'พุธ',
      workout: 'Lower Body & Legs',
      duration: `${selectedTime} min`,
      exercises: ['Squats', 'Lunges', 'Calf Raises'],
      color: 'bg-orange-100 border-orange-200',
    },
    {
      day: 'Thursday',
      dayTh: 'พฤหัสบดี',
      workout: 'Back & Arms',
      duration: `${selectedTime} min`,
      exercises: ['Pull-ups', 'Rows', 'Bicep Curls'],
      color: 'bg-purple-100 border-purple-200',
    },
    {
      day: 'Friday',
      dayTh: 'ศุกร์',
      workout: 'Full Body & Cardio',
      duration: `${selectedTime} min`,
      exercises: ['Burpees', 'Mountain Climbers', 'Jumping Jacks'],
      color: 'bg-emerald-100 border-emerald-200',
    },
  ];

  const handleSave = () => {
    if (onSaveToSchedule) {
      onSaveToSchedule(schedule);
    }
    alert('บันทึกลงตารางเรียบร้อยแล้ว!');
  };

  const handleShare = () => {
    alert('แชร์แผนออกกำลังกายของคุณ');
  };

  return (
    <div className="fixed inset-0 h-screen w-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col overflow-hidden">
      {/* Content */}
      <div className="flex-1 px-4 overflow-y-auto pb-32">
        <div className="max-w-2xl mx-auto">
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
          <h2 className="text-2xl text-gray-800">Workout Schedule</h2>
          <Dumbbell className="w-6 h-6 text-emerald-600" />
        </div>

        {/* Schedule List */}
        <div className="space-y-4">
          {schedule.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              {/* Day Label */}
              <div className="flex-shrink-0">
                <div className="bg-emerald-400 text-white px-4 py-2 rounded-full text-sm min-w-[90px] text-center">
                  {item.day}
                </div>
              </div>

              {/* Workout Details */}
              <div className={`flex-1 rounded-2xl border-2 p-4 ${item.color} min-h-[80px]`}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-gray-800">{item.workout}</h3>
                  <span className="text-sm text-gray-600 bg-white bg-opacity-50 px-2 py-1 rounded-full">
                    {item.duration}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.exercises.map((exercise, idx) => (
                    <span
                      key={idx}
                      className="text-xs text-gray-600 bg-white bg-opacity-60 px-2.5 py-1 rounded-full"
                    >
                      {exercise}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Weekend Note */}
        <div className="mt-6 p-4 bg-gray-50 rounded-2xl text-center">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Weekend:</span> Rest days or light stretching 🧘‍♀️
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-20 left-0 right-0 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-3xl shadow-lg p-4">
            <div className="flex items-center justify-around">
              {/* Back */}
              <button
                onClick={onBack}
                className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-600 transition-colors min-w-[70px]"
              >
                <ArrowLeft className="w-6 h-6" />
                <span className="text-sm">Back</span>
              </button>

              {/* Save */}
              <button
                onClick={handleSave}
                className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-600 transition-colors min-w-[70px]"
              >
                <Calendar className="w-6 h-6" />
                <span className="text-sm">Save</span>
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-600 transition-colors min-w-[70px]"
              >
                <Share2 className="w-6 h-6" />
                <span className="text-sm">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}