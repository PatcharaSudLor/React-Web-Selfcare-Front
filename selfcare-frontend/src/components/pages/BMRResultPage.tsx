import { useState } from 'react';
import { ArrowLeft, Info, X, Flame, Activity } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col">
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
      <div className="flex-1 px-6 py-8 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-8">
          {/* Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
              <Flame className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Your BMR Result</h1>
            <p className="text-gray-500 text-sm">Basal Metabolic Rate</p>
          </div>

          {/* BMR Info Button */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="mx-auto flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 hover:bg-orange-200 transition-colors"
          >
            <Info className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-600">What is BMR?</span>
          </button>

          {/* Info Modal */}
          {showInfo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <Info className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">What is BMR?</h3>
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
                    <strong className="text-gray-800">Basal Metabolic Rate (BMR)</strong> is the number of calories your body needs to accomplish its most basic life-sustaining functions.
                  </p>
                  <p>
                    <strong className="text-gray-800">Formula (Mifflin-St Jeor):</strong>
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                    <p className="font-mono text-xs">Men: (10 × weight) + (6.25 × height) - (5 × age) + 5</p>
                    <p className="font-mono text-xs">Women: (10 × weight) + (6.25 × height) - (5 × age) - 161</p>
                  </div>
                  <p>
                    Your BMR includes calories burned for:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs ml-2">
                    <li>Breathing and circulation</li>
                    <li>Cell production and repair</li>
                    <li>Processing nutrients</li>
                    <li>Brain and nerve function</li>
                  </ul>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
                    <p className="text-orange-800 text-xs">
                      <strong>Note:</strong> BMR represents calories burned at complete rest. Your actual daily calorie needs will be higher when you account for physical activity (TDEE).
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInfo(false)}
                  className="w-full mt-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          )}

          {/* Your Info Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Gender</p>
              <p className="text-lg font-bold text-gray-800 capitalize">{gender}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Age</p>
              <p className="text-lg font-bold text-gray-800">{age} <span className="text-sm font-normal text-gray-500">years</span></p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Height</p>
              <p className="text-lg font-bold text-gray-800">{height} <span className="text-sm font-normal text-gray-500">cm</span></p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Weight</p>
              <p className="text-lg font-bold text-gray-800">{weight} <span className="text-sm font-normal text-gray-500">kg</span></p>
            </div>
          </div>

          {/* BMR Result Card */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 shadow-xl text-white">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white bg-opacity-20 mb-2">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm uppercase tracking-wide opacity-90">Your Basal Metabolic Rate</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-6xl font-bold">{bmr}</span>
                <span className="text-xl font-medium opacity-90">calories/day</span>
              </div>
              <p className="text-sm opacity-90 max-w-xs mx-auto pt-2">
                Calories burned while at complete rest
              </p>
            </div>
          </div>

          {/* What This Means */}
          <div className="bg-white rounded-2xl p-6 border border-orange-200 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">What This Means</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {getBMRDescription()}
                </p>
              </div>
            </div>
          </div>

          {/* Fun Facts */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-lg">💡</span>
              <span>Did You Know?</span>
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>Your brain uses about 20% of your BMR calories</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>Muscle tissue burns more calories at rest than fat tissue</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>BMR typically decreases by 1-2% per decade after age 20</span>
              </li>
            </ul>
          </div>

          {/* Continue Button */}
          <button
            onClick={() => onTDEEResult(bmr)}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold transition-all shadow-lg shadow-emerald-200 hover:shadow-xl"
          >
            Continue to TDEE
          </button>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <div className="w-8 h-2 rounded-full bg-emerald-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
