import { useState } from 'react';
import { ArrowLeft, Info, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface BMIResultPageProps {
  onBack: () => void;
  onBMRResult: () => void;
  bmi: number;
  bmiCategory: string;
  height: string;
  weight: string;
}

export default function BMIResultPage({ onBack, onBMRResult, bmi, bmiCategory, height, weight }: BMIResultPageProps) {
  const [showInfo, setShowInfo] = useState(false);

  const getBMIColor = (bmiValue: number) => {
    if (bmiValue < 18.5) return '#3b82f6'; // Blue - Underweight
    if (bmiValue < 25) return '#10b981'; // Green - Normal
    if (bmiValue < 30) return '#f59e0b'; // Yellow - Overweight
    if (bmiValue < 35) return '#f97316'; // Orange - Obese
    return '#ef4444'; // Red - Morbidly Obese
  };

  const getBMIPosition = (bmiValue: number) => {
    // Map BMI to 0-100% position on the scale
    // Scale: 15 (0%) to 40 (100%)
    const minBMI = 15;
    const maxBMI = 40;
    const position = ((bmiValue - minBMI) / (maxBMI - minBMI)) * 100;
    return Math.max(0, Math.min(100, position));
  };

  const getBMIDescription = () => {
    if (bmi < 18.5) {
      return 'Your BMI indicates you are underweight. Consider consulting with a healthcare professional for personalized advice.';
    } else if (bmi < 25) {
      return 'Great! Your BMI is in the normal range. Keep maintaining a healthy lifestyle!';
    } else if (bmi < 30) {
      return 'Your BMI indicates you are overweight. Consider incorporating more physical activity and a balanced diet.';
    } else if (bmi < 35) {
      return 'Your BMI indicates obesity. We recommend consulting with a healthcare professional for guidance.';
    } else {
      return 'Your BMI indicates severe obesity. Please consult with a healthcare professional for personalized support.';
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

      <div className="flex-1 px-8 py-12 overflow-y-auto">
        <motion.div className="max-w-2xl mx-auto space-y-10" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
              <Info className="w-8 h-8 text-emerald-600" />
            </div>
            <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-5xl font-bold text-gray-800">Your BMI Result</motion.h1>
            <p className="text-gray-500 text-lg">Based on your height and weight</p>
          </div>

          <motion.button
            onClick={() => setShowInfo(!showInfo)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="mx-auto flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 hover:bg-emerald-200 transition-colors"
          >
            <Info className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-600">What is BMI?</span>
          </motion.button>

          {showInfo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Info className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">What is BMI?</h3>
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
                    <strong className="text-gray-800">Body Mass Index (BMI)</strong> is a simple calculation using a person's height and weight.
                  </p>
                  <p>
                    Formula: <span className="font-mono bg-gray-100 px-2 py-1 rounded">BMI = weight(kg) / [height(m)]²</span>
                  </p>
                  <p>
                    BMI is a screening tool that can indicate whether a person is underweight, normal weight, overweight, or obese.
                  </p>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-4">
                    <p className="text-emerald-800 text-xs">
                      <strong>Note:</strong> BMI is not a diagnostic tool. It doesn't account for muscle mass, bone density, or overall body composition. Always consult with healthcare professionals for personalized advice.
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowInfo(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
                >
                  Got it!
                </motion.button>
              </motion.div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Height</p>
              <p className="text-2xl font-bold text-gray-800">{height} <span className="text-sm font-normal text-gray-500">cm</span></p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Weight</p>
              <p className="text-2xl font-bold text-gray-800">{weight} <span className="text-sm font-normal text-gray-500">kg</span></p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl border-2" style={{ borderColor: getBMIColor(bmi) }}>
            <div className="text-center space-y-3 mb-6">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Your BMI</p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-6xl font-bold" style={{ color: getBMIColor(bmi) }}>
                  {bmi}
                </span>
                <div className="text-left">
                  <p className="text-xl font-bold text-gray-800">{bmiCategory}</p>
                  <p className="text-sm text-gray-500">kg/m²</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 via-orange-400 to-red-400 shadow-inner">
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-gray-900 shadow-lg transition-all duration-500"
                  style={{ left: `${getBMIPosition(bmi)}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                    <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent border-t-gray-900"></div>
                  </div>
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                    <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-gray-900"></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1 text-center text-xs text-gray-600">
                <div>
                  <p className="font-semibold text-blue-600">Underweight</p>
                  <p className="text-[10px]">&lt;18.5</p>
                </div>
                <div>
                  <p className="font-semibold text-green-600">Normal</p>
                  <p className="text-[10px]">18.5-24.9</p>
                </div>
                <div>
                  <p className="font-semibold text-yellow-600">Overweight</p>
                  <p className="text-[10px]">25-29.9</p>
                </div>
                <div>
                  <p className="font-semibold text-red-600">Obese</p>
                  <p className="text-[10px]">30+</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
            <p className="text-gray-700 text-sm leading-relaxed">
              {getBMIDescription()}
            </p>
          </div>

          <motion.button
            onClick={onBMRResult}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold transition-all shadow-lg shadow-emerald-200 hover:shadow-xl"
          >
            Continue
          </motion.button>

          <div className="flex items-center justify-center gap-2 pt-4">
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            <div className="h-3 rounded-full bg-emerald-400" style={{ width: '40px' }}/>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}