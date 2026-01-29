import { useState, useEffect } from 'react';
import { ArrowLeft, Info, X, Zap, TrendingUp } from 'lucide-react';

interface TDEEResultPageProps {
  onBack: () => void;
  onHome: (tdee: number) => void;
  bmr: number;
}

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';

interface ActivityLevelOption {
  id: ActivityLevel;
  label: string;
  description: string;
  multiplier: number;
  icon: string;
}

export default function TDEEResultPage({ onBack, onHome, bmr }: TDEEResultPageProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLevel>('moderate');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const activityLevels: ActivityLevelOption[] = [
    {
      id: 'sedentary',
      label: 'Sedentary',
      description: 'Little or no exercise',
      multiplier: 1.2,
      icon: '🪑'
    },
    {
      id: 'light',
      label: 'Lightly Active',
      description: 'Exercise 1-3 days/week',
      multiplier: 1.375,
      icon: '🚶'
    },
    {
      id: 'moderate',
      label: 'Moderately Active',
      description: 'Exercise 3-5 days/week',
      multiplier: 1.55,
      icon: '🏃'
    },
    {
      id: 'very',
      label: 'Very Active',
      description: 'Exercise 6-7 days/week',
      multiplier: 1.725,
      icon: '💪'
    },
    {
      id: 'extra',
      label: 'Extra Active',
      description: 'Very intense exercise daily',
      multiplier: 1.9,
      icon: '🔥'
    }
  ];

  const selectedActivityLevel = activityLevels.find(a => a.id === selectedActivity)!;
  const tdee = Math.round(bmr * selectedActivityLevel.multiplier);

  // Calculate calorie goals
  const maintainWeight = tdee;
  const mildWeightLoss = tdee - 250; // Lose 0.25 kg/week
  const weightLoss = tdee - 500; // Lose 0.5 kg/week
  const mildWeightGain = tdee + 250; // Gain 0.25 kg/week
  const weightGain = tdee + 500; // Gain 0.5 kg/week

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 flex items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 overflow-y-auto pb-24">
        <div className="max-w-md mx-auto space-y-6">
          {/* Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Your TDEE Result</h1>
            <p className="text-gray-500 text-sm">Total Daily Energy Expenditure</p>
          </div>

          {/* TDEE Info Button */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="mx-auto flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
          >
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">What is TDEE?</span>
          </button>

          {/* Info Modal */}
          {showInfo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Info className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">What is TDEE?</h3>
                  </div>
                  <button
                    onClick={() => setShowInfo(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-3 text-gray-600 text-sm">
                  <p>
                    <strong className="text-gray-800">Total Daily Energy Expenditure (TDEE)</strong> is the total number of calories you burn in a day, including all activities.
                  </p>
                  <p>
                    <strong className="text-gray-800">Formula:</strong>
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-mono text-xs">TDEE = BMR × Activity Level</p>
                  </div>
                  <p>
                    Your TDEE includes:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs ml-2">
                    <li>BMR (calories at rest)</li>
                    <li>Exercise and physical activity</li>
                    <li>Daily movements (walking, standing)</li>
                    <li>Digestion (thermic effect of food)</li>
                  </ul>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                    <p className="text-blue-800 text-xs">
                      <strong>Note:</strong> To maintain your current weight, eat approximately your TDEE in calories. To lose weight, eat less. To gain weight, eat more.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInfo(false)}
                  className="w-full mt-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          )}

          {/* BMR Display */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Your BMR</p>
            <p className="text-2xl font-bold text-gray-800">{bmr} <span className="text-sm font-normal text-gray-500">cal/day</span></p>
          </div>

          {/* Activity Level Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Select Your Activity Level</label>
            <div className="space-y-3">
              {activityLevels.map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => setSelectedActivity(activity.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedActivity === activity.id
                      ? 'border-blue-400 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{activity.icon}</span>
                    <div className="flex-1">
                      <p className={`font-semibold ${
                        selectedActivity === activity.id ? 'text-blue-600' : 'text-gray-800'
                      }`}>
                        {activity.label}
                      </p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                    </div>
                    <div className={`text-right ${
                      selectedActivity === activity.id ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      <p className="text-xs font-medium">×{activity.multiplier}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* TDEE Result Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 shadow-xl text-white">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white bg-opacity-20 mb-2">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm uppercase tracking-wide opacity-90">Your Total Daily Energy Expenditure</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-6xl font-bold">{tdee}</span>
                <span className="text-xl font-medium opacity-90">calories/day</span>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 inline-block">
                <p className="text-sm opacity-90">
                  {selectedActivityLevel.label} • BMR × {selectedActivityLevel.multiplier}
                </p>
              </div>
            </div>
          </div>

          {/* Calorie Goals */}
          <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-800">Your Calorie Goals</h3>
            </div>

            <div className="space-y-3">
              {/* Weight Loss */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-red-700">Weight Loss</p>
                  <p className="text-xs text-red-600">-0.5 kg/week</p>
                </div>
                <p className="text-2xl font-bold text-red-600">{weightLoss} <span className="text-sm font-normal">cal/day</span></p>
              </div>

              {/* Mild Weight Loss */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-orange-700">Mild Weight Loss</p>
                  <p className="text-xs text-orange-600">-0.25 kg/week</p>
                </div>
                <p className="text-2xl font-bold text-orange-600">{mildWeightLoss} <span className="text-sm font-normal">cal/day</span></p>
              </div>

              {/* Maintain Weight */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-emerald-700">Maintain Weight</p>
                  <p className="text-xs text-emerald-600">0 kg/week</p>
                </div>
                <p className="text-2xl font-bold text-emerald-600">{maintainWeight} <span className="text-sm font-normal">cal/day</span></p>
              </div>

              {/* Mild Weight Gain */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-blue-700">Mild Weight Gain</p>
                  <p className="text-xs text-blue-600">+0.25 kg/week</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">{mildWeightGain} <span className="text-sm font-normal">cal/day</span></p>
              </div>

              {/* Weight Gain */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-purple-700">Weight Gain</p>
                  <p className="text-xs text-purple-600">+0.5 kg/week</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">{weightGain} <span className="text-sm font-normal">cal/day</span></p>
              </div>
            </div>
          </div>

          {/* Tip */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-lg">💡</span>
              <span>Tip</span>
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              These calorie goals are estimates. Monitor your progress and adjust as needed. For best results, combine proper nutrition with regular exercise and adequate sleep.
            </p>
          </div>

          {/* Continue Button */}
          <button
            onClick={() => onHome(tdee)}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold transition-all shadow-lg shadow-emerald-200 hover:shadow-xl"
          >
            Complete Setup
          </button>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <div className="w-8 h-2 rounded-full bg-emerald-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
}