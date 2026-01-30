import { useState } from 'react';
import { ArrowLeft, Info, X, Flame, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface BMRResultPageProps {
  onBack: () => void;
  onTDEEResult: (bmr: number) => void;
  gender: 'male' | 'female';
  height: string;
  weight: string;
  age: string;
}

export default function BMRResultPage({ onBack, onTDEEResult, gender, height, weight, age }: BMRResultPageProps) {
  const [showInfo, setShowInfo] = useState(false);

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = () => {
    const weightKg = parseFloat(weight);
    const heightCm = parseFloat(height);
    const ageYears = parseFloat(age);

    let bmr: number;
    if (gender === 'male') {
      // Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) + 5;
    } else {
      // Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) - 161;
    }

    return Math.round(bmr);
  };

  const bmr = calculateBMR();

  const getBMRDescription = () => {
    if (gender === 'male') {
      return 'This is the amount of calories your body needs to maintain basic physiological functions like breathing, circulation, and cell production while at rest.';
    } else {
      return 'This is the amount of calories your body needs to maintain basic physiological functions like breathing, circulation, and cell production while at rest.';
    }
  };

 return (
  <div className="fixed inset-0 h-screen w-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col overflow-hidden">
    <div className="px-6 py-4 flex items-center">
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
    <div className="flex-1 px-8 py-12 overflow-y-auto">
      <motion.div
        className="max-w-2xl mx-auto space-y-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
            <Flame className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-800">Your BMR Result</h1>
          <p className="text-gray-500 text-lg">Basal Metabolic Rate</p>
        </div>

        {/* BMR Info Button */}
        <motion.button
          onClick={() => setShowInfo(!showInfo)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="mx-auto flex items-center gap-2 px-5 py-3 rounded-2xl bg-orange-100 hover:bg-orange-200 transition-colors"
        >
          <Info className="w-5 h-5 text-orange-600" />
          <span className="text-base font-semibold text-orange-600">What is BMR?</span>
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
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <Info className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">What is BMR?</h3>
                </div>
                <button
                  onClick={() => setShowInfo(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 text-gray-600 text-base">
                <p>
                  <strong className="text-gray-800">Basal Metabolic Rate (BMR)</strong>{" "}
                  is the number of calories your body needs to accomplish its most basic
                  life-sustaining functions.
                </p>

                <div className="space-y-2">
                  <p className="font-semibold text-gray-800">Formula (Mifflin-St Jeor):</p>
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-200">
                    <p className="font-mono text-sm">
                      Men: (10 × weight) + (6.25 × height) - (5 × age) + 5
                    </p>
                    <p className="font-mono text-sm">
                      Women: (10 × weight) + (6.25 × height) - (5 × age) - 161
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-gray-800 mb-2">Your BMR includes calories burned for:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                    <li>Breathing and circulation</li>
                    <li>Cell production and repair</li>
                    <li>Processing nutrients</li>
                    <li>Brain and nerve function</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                  <p className="text-orange-800 text-sm">
                    <strong>Note:</strong> BMR represents calories burned at complete rest.
                    Your actual daily calorie needs will be higher when you account for physical
                    activity (TDEE).
                  </p>
                </div>
              </div>

              <motion.button
                onClick={() => setShowInfo(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-7 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg transition-colors"
              >
                Got it!
              </motion.button>
            </motion.div>
          </div>
        )}

        {/* Your Info Summary */}
        <motion.div
          className="grid grid-cols-2 gap-5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Gender</p>
            <p className="text-2xl font-bold text-gray-800 capitalize">{gender}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Age</p>
            <p className="text-2xl font-bold text-gray-800">
              {age} <span className="text-base font-normal text-gray-500">years</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Height</p>
            <p className="text-2xl font-bold text-gray-800">
              {height} <span className="text-base font-normal text-gray-500">cm</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Weight</p>
            <p className="text-2xl font-bold text-gray-800">
              {weight} <span className="text-base font-normal text-gray-500">kg</span>
            </p>
          </div>
        </motion.div>

        {/* BMR Result Card */}
        <motion.div
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-10 shadow-xl text-white"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white bg-opacity-20 mb-2">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <p className="text-base uppercase tracking-wide opacity-90">Your Basal Metabolic Rate</p>
            <div className="flex items-baseline justify-center gap-3">
              <span className="text-6xl font-bold">{bmr}</span>
              <span className="text-xl font-medium opacity-90">calories/day</span>
            </div>
            <p className="text-base opacity-90 max-w-md mx-auto pt-1">
              Calories burned while at complete rest
            </p>
          </div>
        </motion.div>

        {/* What This Means */}
        <motion.div
          className="bg-white rounded-3xl p-7 border border-orange-200 shadow-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">What This Means</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                {getBMRDescription()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Fun Facts */}
        <motion.div
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-7 border border-orange-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <span>Did You Know?</span>
          </h3>
          <ul className="space-y-3 text-base text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <span>Your brain uses about 20% of your BMR calories</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <span>Muscle tissue burns more calories at rest than fat tissue</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <span>BMR typically decreases by 1-2% per decade after age 20</span>
            </li>
          </ul>
        </motion.div>

        {/* Continue Button */}
        <motion.button
          onClick={() => onTDEEResult(bmr)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-lg transition-all shadow-lg shadow-emerald-200 hover:shadow-xl"
        >
          Continue to TDEE
        </motion.button>

        {/* Progress Indicator */}
        <motion.div
          className="flex items-center justify-center gap-3 pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <div className="w-10 h-3 rounded-full bg-emerald-400" />
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
        </motion.div>
      </motion.div>
    </div>
  </div>
);

}
