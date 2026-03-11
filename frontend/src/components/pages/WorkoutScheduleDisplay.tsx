import React from 'react';
import { Dumbbell, Calendar, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
}

interface DayWorkout {
  day: string;
  dayTh?: string;
  workout: string;
  duration: number | string;
  exercises: Exercise[];
}

interface WorkoutScheduleDisplayProps {
  plan: { days: DayWorkout[] };
  onSave?: () => void;
}

const dayLabelColorMap: Record<string, string> = {
  Monday: 'bg-yellow-400 text-white',
  Tuesday: 'bg-pink-400 text-white',
  Wednesday: 'bg-green-400 text-white',
  Thursday: 'bg-orange-400 text-white',
  Friday: 'bg-sky-400 text-white',
  Saturday: 'bg-purple-400 text-white',
  Sunday: 'bg-red-400 text-white',
};

const dayCardColorMap: Record<string, string> = {
  Monday: 'border-yellow-200 bg-yellow-50',
  Tuesday: 'border-pink-200 bg-pink-50',
  Wednesday: 'border-green-200 bg-green-50',
  Thursday: 'border-orange-200 bg-orange-50',
  Friday: 'border-sky-200 bg-sky-50',
  Saturday: 'border-purple-200 bg-purple-50',
  Sunday: 'border-red-200 bg-red-50',
};

const WorkoutScheduleDisplay: React.FC<WorkoutScheduleDisplayProps> = ({ plan, onSave }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 my-2 max-w-full overflow-hidden">
      <div className="flex items-center justify-center gap-2 mb-6 border-b pb-3">
        <Dumbbell className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-bold text-gray-800">Your New Workout Schedule</h3>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {plan.days.map((item, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              {/* Day Label */}
              <div className={`${dayLabelColorMap[item.day] ?? 'bg-emerald-400 text-white'} px-4 py-1.5 rounded-full text-xs font-bold min-w-[90px] text-center shadow-sm`}>
                {item.dayTh || item.day}
              </div>
              
              <div className="flex-1 h-[2px] bg-gray-100"></div>
            </div>

            {/* Workout Card */}
            <div className={`rounded-2xl border-2 p-3 ${dayCardColorMap[item.day] ?? 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-gray-800 font-bold text-sm">{item.workout}</h4>
                <span className="text-[10px] font-bold text-gray-600 bg-white bg-opacity-70 px-2 py-1 rounded-full shadow-sm">
                  {item.duration === 0 ? 'Rest day' : `${item.duration} min`}
                </span>
              </div>
              
              {item.exercises.length === 0 ? (
                 <div className="text-[10px] text-gray-500 italic px-2">Recovery / Stretching</div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {item.exercises.map((ex, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => navigate('/workouts/videos')}
                      className="bg-white bg-opacity-80 px-2 py-1 rounded-lg border border-gray-100 shadow-sm flex items-center gap-1.5 hover:bg-emerald-50 transition-colors group"
                    >
                      <Play className="w-2.5 h-2.5 text-emerald-500 group-hover:scale-110 transition-transform" fill="currentColor" />
                      <span className="text-[10px] font-bold text-gray-700">{ex.name}</span>
                      <span className="text-[9px] text-emerald-600 font-medium">{ex.sets}x{ex.reps}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {onSave && (
        <button
          onClick={onSave}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl transition-all shadow-md active:scale-95"
        >
          <Calendar className="w-5 h-5" />
          <span>Save to My Schedule</span>
        </button>
      )}
    </div>
  );
};

export default WorkoutScheduleDisplay;
