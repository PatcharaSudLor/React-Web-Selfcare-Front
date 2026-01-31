import { useState, useEffect } from 'react';
import { ArrowLeft, Info, X, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

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
  <div className="fixed inset-0 h-screen w-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col overflow-hidden">
    {/* Header */}
    <div className="px-6 py-4 flex items-center relative z-10 bg-gradient-to-b from-emerald-50 to-transparent">
      <motion.button
        onClick={onBack}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 text-gray-500 hover:text-emerald-500 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">Back</span>
      </motion.button>
    </div>

    {/* Content */}
    <div className="flex-1 px-8 -mt-12 overflow-y-auto pb-24">
      <motion.div
        className="max-w-2xl mx-auto space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-800">Your TDEE Result</h1>
          <p className="text-gray-500 text-lg">Total Daily Energy Expenditure</p>
        </div>

        {/* TDEE Info Button */}
        <motion.button
          onClick={() => setShowInfo(!showInfo)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="mx-auto flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-100 hover:bg-blue-200 transition-colors"
        >
          <Info className="w-5 h-5 text-blue-600" />
          <span className="text-base font-semibold text-blue-600">What is TDEE?</span>
        </motion.button>

        {/* Info Modal */}
        {showInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black bg-opacity-50">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl p-7 max-w-2xl w-full shadow-2xl"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Info className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">What is TDEE?</h3>
                </div>
                <button
                  onClick={() => setShowInfo(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 text-gray-600 text-base text-left">
                <p>
                  <strong className="text-gray-800 ">Total Daily Energy Expenditure (TDEE)</strong> <br />
                  is the total number of calories you burn in a day, including all activities.
                </p>

                <div className="space-y-2">
                  <p className="font-semibold text-gray-800">Formula:</p>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                    <p className="font-mono text-sm">TDEE = BMR × Activity Level</p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-gray-800 mb-2">Your TDEE includes:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                    <li>BMR (calories at rest)</li>
                    <li>Exercise and physical activity</li>
                    <li>Daily movements (walking, standing)</li>
                    <li>Digestion (thermic effect of food)</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Note:</strong> To maintain your current weight, eat approximately your
                    TDEE in calories. To lose weight, eat less. To gain weight, eat more.
                  </p>
                </div>
              </div>

              <motion.button
                onClick={() => setShowInfo(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-7 py-4 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg transition-colors"
              >
                Got it!
              </motion.button>
            </motion.div>
          </div>
        )}

        {/* BMR Display */}
        <motion.div
          className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <p className="text-sm text-gray-500 mb-1">Your BMR</p>
          <p className="text-2xl font-bold text-gray-800">
            {bmr} <span className="text-base font-normal text-gray-500">cal/day</span>
          </p>
        </motion.div>

        {/* Activity Level Selection */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.22 }}
        >
          <label className="block text-base font-semibold text-gray-700">
            Select Your Activity Level
          </label>

          <div className="space-y-4">
            {activityLevels.map((activity) => (
              <motion.button
                key={activity.id}
                onClick={() => setSelectedActivity(activity.id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full p-6 rounded-3xl border-2 transition-all text-left ${
                  selectedActivity === activity.id
                    ? "border-blue-400 bg-blue-50 shadow-lg"
                    : "border-gray-200 bg-white hover:border-blue-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{activity.icon}</span>

                  <div className="flex-1">
                    <p
                      className={`font-bold text-lg ${
                        selectedActivity === activity.id ? "text-blue-600" : "text-gray-800"
                      }`}
                    >
                      {activity.label}
                    </p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                  </div>

                  <div
                    className={`text-right ${
                      selectedActivity === activity.id ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    <p className="text-sm font-semibold">×{activity.multiplier}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* TDEE Result Card */}
        <motion.div
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-10 shadow-xl text-white"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white bg-opacity-20 mb-2">
              <Zap className="w-8 h-8 text-white" />
            </div>

            <p className="text-base uppercase tracking-wide opacity-90">
              Your Total Daily Energy Expenditure
            </p>

            <div className="flex items-baseline justify-center gap-3">
              <span className="text-6xl font-bold">{tdee}</span>
              <span className="text-xl font-medium opacity-90">calories/day</span>
            </div>

            <div className="bg-white bg-opacity-20 rounded-2xl px-5 py-3 inline-block">
              <p className="text-base opacity-90">
                {selectedActivityLevel.label} • BMR × {selectedActivityLevel.multiplier}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Calorie Goals */}
        <motion.div
          className="bg-white rounded-3xl p-7 border border-blue-200 shadow-sm space-y-5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.38 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Your Calorie Goals</h3>
          </div>

          <div className="space-y-4">
            {/* Weight Loss */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-base font-bold text-red-700">Weight Loss</p>
                <p className="text-sm text-red-600">-0.5 kg/week</p>
              </div>
              <p className="text-3xl font-bold text-red-600">
                {weightLoss} <span className="text-base font-normal">cal/day</span>
              </p>
            </div>

            {/* Mild Weight Loss */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-base font-bold text-orange-700">Mild Weight Loss</p>
                <p className="text-sm text-orange-600">-0.25 kg/week</p>
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {mildWeightLoss} <span className="text-base font-normal">cal/day</span>
              </p>
            </div>

            {/* Maintain Weight */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-base font-bold text-emerald-700">Maintain Weight</p>
                <p className="text-sm text-emerald-600">0 kg/week</p>
              </div>
              <p className="text-3xl font-bold text-emerald-600">
                {maintainWeight} <span className="text-base font-normal">cal/day</span>
              </p>
            </div>

            {/* Mild Weight Gain */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-base font-bold text-blue-700">Mild Weight Gain</p>
                <p className="text-sm text-blue-600">+0.25 kg/week</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {mildWeightGain} <span className="text-base font-normal">cal/day</span>
              </p>
            </div>

            {/* Weight Gain */}
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-base font-bold text-purple-700">Weight Gain</p>
                <p className="text-sm text-purple-600">+0.5 kg/week</p>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {weightGain} <span className="text-base font-normal">cal/day</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tip */}
        <motion.div
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-7 border border-blue-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.46 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <span>Tip</span>
          </h3>
          <p className="text-base text-gray-700 leading-relaxed text-left">
            These calorie goals are estimates. Monitor your progress and adjust as needed. <br /> For best results,
            combine proper nutrition with regular exercise and adequate sleep.
          </p>
        </motion.div>

        {/* Continue Button */}
        <motion.button
          onClick={() => onHome(tdee)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-lg transition-all shadow-lg shadow-emerald-200 hover:shadow-xl"
        >
          Complete Setup
        </motion.button>

        {/* Progress Indicator */}
        <motion.div
          className="flex items-center justify-center gap-3 pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
          <motion.div className="w-3 h-3 -mt-6 rounded-full bg-emerald-400"  transition={{ duration: 1.5, repeat: Infinity }}/>
          <motion.div className="w-3 h-3 -mt-6 rounded-full bg-emerald-400"  transition={{ duration: 1.5, repeat: Infinity }}/>
          <motion.div className="w-3 h-3 -mt-6 rounded-full bg-emerald-400"  transition={{ duration: 1.5, repeat: Infinity }}/>
          <motion.div className="w-10 h-3 -mt-6 rounded-full bg-emerald-400" transition={{ duration: 1.5, repeat: Infinity }}/>
        </motion.div>
      </motion.div>
    </div>
  </div>
);

}