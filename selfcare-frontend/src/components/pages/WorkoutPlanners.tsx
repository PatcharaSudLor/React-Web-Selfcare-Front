import { useState } from 'react';
import { ArrowLeft, Info } from 'lucide-react';

interface WorkoutPlannerProps {
  onBack: () => void;
  onGeneratePlan: (data: WorkoutPlanData) => void;
}

export interface WorkoutPlanData {
  selectedTime: number;
  bodyType: BodyType;
  goal: Goal;
  medicalCondition: string;
}

type BodyType = 'ectomorph' | 'mesomorph' | 'endomorph' | null;
type Goal = 'gain' | 'maintain' | 'lose' | null;

export default function WorkoutPlanner({ onBack, onGeneratePlan }: WorkoutPlannerProps) {
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [bodyType, setBodyType] = useState<BodyType>(null);
  const [goal, setGoal] = useState<Goal>(null);
  const [medicalCondition, setMedicalCondition] = useState('');
  const [showBodyTypeInfo, setShowBodyTypeInfo] = useState(false);

  const timeOptions = [15, 30, 45, 60];

  const handleGeneratePlan = () => {
    if (selectedTime && bodyType && goal) {
      onGeneratePlan({
        selectedTime,
        bodyType,
        goal,
        medicalCondition,
      });
    }
  };

  const isFormComplete = selectedTime && bodyType && goal;

  return (
    <div className="fixed inset-0 h-screen w-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col overflow-hidden">
      {/* Header with Back Button */}
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 overflow-y-auto pb-24">
        <div className="max-w-2xl mx-auto pt-4">
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
      <div className="bg-white rounded-3xl shadow-sm p-6">
        <h1 className="text-3xl text-center text-gray-800 mb-8">Workouts</h1>

        {/* Daily Free Time */}
        <div className="mb-8">
          <h3 className="text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-pink-500">•</span>
            Daily Free Time
          </h3>
          <div className="flex gap-3 flex-wrap">
            {timeOptions.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`px-6 py-2.5 rounded-full border-2 transition-all ${
                  selectedTime === time
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
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
          <h3 className="text-gray-700 mb-3 flex items-center gap-2">
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
            <div className="mb-4 p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
              <h4 className="font-semibold text-emerald-700 mb-3">Body Types คืออะไร?</h4>
              <div className="space-y-2 text-sm text-gray-700">
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
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                bodyType === 'ectomorph'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C10.5 2 9.5 3 9.5 4.5V8H8C7 8 6 9 6 10V19C6 20 7 21 8 21H9.5V22H10.5V21H13.5V22H14.5V21H16C17 21 18 20 18 19V10C18 9 17 8 16 8H14.5V4.5C14.5 3 13.5 2 12 2Z" 
                      fill="currentColor" 
                      className={bodyType === 'ectomorph' ? 'text-emerald-600' : 'text-gray-400'}
                />
              </svg>
              <span className={`text-sm ${bodyType === 'ectomorph' ? 'text-emerald-700' : 'text-gray-600'}`}>
                Ectomorph
              </span>
            </button>

            {/* Mesomorph */}
            <button
              onClick={() => setBodyType('mesomorph')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                bodyType === 'mesomorph'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C10.5 2 9 3 9 4.5V7.5H7.5C6.5 7.5 5.5 8.5 5.5 9.5V19C5.5 20 6.5 21 7.5 21H9V22H10V21H14V22H15V21H16.5C17.5 21 18.5 20 18.5 19V9.5C18.5 8.5 17.5 7.5 16.5 7.5H15V4.5C15 3 13.5 2 12 2Z" 
                      fill="currentColor" 
                      className={bodyType === 'mesomorph' ? 'text-emerald-600' : 'text-gray-400'}
                />
              </svg>
              <span className={`text-sm ${bodyType === 'mesomorph' ? 'text-emerald-700' : 'text-gray-600'}`}>
                Mesomorph
              </span>
            </button>

            {/* Endomorph */}
            <button
              onClick={() => setBodyType('endomorph')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                bodyType === 'endomorph'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C10.5 2 8.5 3 8.5 4.5V7H6.5C5.5 7 4 8 4 9.5V19C4 20 5 21 6.5 21H8.5V22H9.5V21H14.5V22H15.5V21H17.5C18.5 21 20 20 20 19V9.5C20 8 18.5 7 17.5 7H15.5V4.5C15.5 3 13.5 2 12 2Z" 
                      fill="currentColor" 
                      className={bodyType === 'endomorph' ? 'text-emerald-600' : 'text-gray-400'}
                />
              </svg>
              <span className={`text-sm ${bodyType === 'endomorph' ? 'text-emerald-700' : 'text-gray-600'}`}>
                Endomorph
              </span>
            </button>
          </div>
        </div>

        {/* Your Goal */}
        <div className="mb-8">
          <h3 className="text-gray-700 mb-1 flex items-center gap-2">
            <span className="text-pink-500">•</span>
            Your Goal
          </h3>
          <p className="text-sm text-gray-500 mb-3 ml-5">Choose what goal you want to achive.</p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setGoal('gain')}
              className={`px-6 py-2.5 rounded-full transition-all ${
                goal === 'gain'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              }`}
            >
              Gain weight
            </button>
            <button
              onClick={() => setGoal('maintain')}
              className={`px-6 py-2.5 rounded-full transition-all ${
                goal === 'maintain'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              }`}
            >
              Maintain health
            </button>
            <button
              onClick={() => setGoal('lose')}
              className={`px-6 py-2.5 rounded-full transition-all ${
                goal === 'lose'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              }`}
            >
              Lose weight
            </button>
          </div>
        </div>

        {/* Medical Condition */}
        <div className="mb-8">
          <h3 className="text-gray-700 mb-3">Medical Condition :</h3>
          <input
            type="text"
            value={medicalCondition}
            onChange={(e) => setMedicalCondition(e.target.value)}
            placeholder="Enter any medical conditions (optional)"
            className="w-full px-4 py-3 rounded-2xl bg-emerald-50 border-2 border-transparent focus:border-emerald-300 outline-none transition-colors text-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Generate Plan Button */}
        <button
          onClick={handleGeneratePlan}
          disabled={!isFormComplete}
          className={`w-full py-4 rounded-2xl text-gray-700 transition-all ${
            isFormComplete
              ? 'bg-emerald-200 hover:bg-emerald-300 active:scale-98'
              : 'bg-gray-200 cursor-not-allowed opacity-50'
          }`}
        >
          Generate plan
        </button>
      </div>
        </div>
      </div>
    </div>
  );
}