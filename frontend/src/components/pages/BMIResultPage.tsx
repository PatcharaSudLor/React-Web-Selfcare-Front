import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';

interface BMIResultPageProps {
  onBack: () => void;
}

export default function BMIResultPage({ onBack }: BMIResultPageProps) {
  const navigate = useNavigate();
  const { userInfo } = useUser();
  const [showInfo, setShowInfo] = useState(false);

  const bmi = userInfo.bmi || 0;
  const bmiCategory = userInfo.bmiCategory || '';
  const height = userInfo.height || '0';
  const weight = userInfo.weight || '0';

  const getBMIColor = (bmiValue: number) => {
    if (bmiValue < 18.5) return '#3b82f6'; // Blue - Underweight
    if (bmiValue < 25) return '#10b981'; // Green - Normal
    if (bmiValue < 30) return '#f59e0b'; // Yellow - Overweight
    if (bmiValue < 35) return '#f97316'; // Orange - Obese
    return '#ef4444'; // Red - Morbidly Obese
  };

  const getBMIPosition = (bmiValue: number) => {
    const minBMI = 15;
    const maxBMI = 40;
    const position = ((bmiValue - minBMI) / (maxBMI - minBMI)) * 100;
    return Math.max(0, Math.min(100, position));
  };

  const getBMIDescription = () => {
    if (bmi < 18.5) {
      return 'ค่าดัชนีมวลกาย (BMI) ของคุณอยู่ในเกณฑ์น้ำหนักน้อย แนะนำให้ปรึกษาผู้เชี่ยวชาญด้านสุขภาพเพื่อรับคำแนะนำที่เหมาะสมกับคุณ';
    } else if (bmi < 25) {
      return 'ยอดเยี่ยม! ค่า BMI ของคุณอยู่ในเกณฑ์ปกติ รักษาพฤติกรรมการใช้ชีวิตที่ดีต่อสุขภาพแบบนี้ต่อไป';
    } else if (bmi < 30) {
      return 'ค่า BMI ของคุณอยู่ในเกณฑ์น้ำหนักเกิน แนะนำให้เพิ่มการออกกำลังกายและเลือกรับประทานอาหารที่สมดุลมากขึ้น';
    } else if (bmi < 35) {
      return 'ค่า BMI ของคุณอยู่ในเกณฑ์โรคอ้วน แนะนำให้ปรึกษาผู้เชี่ยวชาญด้านสุขภาพเพื่อรับคำแนะนำที่เหมาะสม';
    } else {
      return 'ค่า BMI ของคุณอยู่ในเกณฑ์โรคอ้วนระดับรุนแรง ควรปรึกษาผู้เชี่ยวชาญด้านสุขภาพเพื่อรับการดูแลและคำแนะนำที่เหมาะสมกับคุณ';
    }
  };

  const handleContinue = () => {
    navigate('/bmrresults');
  };

  return (
    <div className="fixed inset-0 w-screen bg-gradient-to-b from-emerald-50 to-white overflow-y-auto">
      <div className="px-6 py-4 flex items-center shrink-0 z-20 bg-transparent">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-gray-500 hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">ย้อนกลับ</span>
        </motion.button>
      </div>

      <div className="flex-1 px-8 -mt-12 overflow-y-auto pb-10">
        <motion.div className="max-w-2xl mx-auto space-y-7" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
              <Info className="w-8 h-8 text-emerald-600" />
            </div>
            <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-5xl font-bold text-gray-800">Your BMI Result</motion.h1>
            <p className="text-gray-500 text-lg">คำนวณจากส่วนสูงและน้ำหนักของคุณ</p>
          </div>

          <motion.button
            onClick={() => setShowInfo(!showInfo)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="mx-auto flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 hover:bg-emerald-200 transition-colors "
          >
            <Info className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-600">BMI คืออะไร?</span>
          </motion.button>

          {showInfo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Info className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">BMI คืออะไร?</h3>
                  </div>
                  <button
                    onClick={() => setShowInfo(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-3 text-gray-600 text-sm text-left">
                  <p>
                    <strong className="text-gray-800">ดัชนีมวลกาย (Body Mass Index: BMI)</strong> <br/> เป็นการคำนวณอย่างง่ายโดยใช้ส่วนสูงและน้ำหนักของบุคคล
                  </p>
                  <p>
                    สูตรคำนวณ: <span className="font-mono bg-gray-100 px-2 py-1 rounded">BMI = น้ำหนัก (กก.) / [ส่วนสูง (ม.)]²</span>
                  </p>
                  <p>
                    BMI เป็นเครื่องมือคัดกรองที่ใช้ประเมินเบื้องต้นว่าน้ำหนักของบุคคลอยู่ในเกณฑ์น้ำหนักน้อย ปกติ น้ำหนักเกิน หรือโรคอ้วน
                  </p>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-4">
                    <p className="text-emerald-800 text-xs">
                      <strong>หมายเหตุ:</strong> <br/> BMI ไม่ใช่เครื่องมือสำหรับการวินิจฉัยโรค และไม่ได้คำนึงถึงมวลกล้ามเนื้อ ความหนาแน่นของกระดูก หรือองค์ประกอบของร่างกายโดยรวม ควรปรึกษาผู้เชี่ยวชาญด้านสุขภาพเพื่อรับคำแนะนำที่เหมาะสมกับคุณ
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
              <p className="text-xs text-gray-500 mb-1">ส่วนสูง</p>
              <p className="text-2xl font-bold text-gray-800">{height} <span className="text-sm font-normal text-gray-500">ซม.</span></p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">น้ำหนัก</p>
              <p className="text-2xl font-bold text-gray-800">{weight} <span className="text-sm font-normal text-gray-500">กก.</span></p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl border-2" style={{ borderColor: getBMIColor(bmi) }}>
            <div className="text-center space-y-3 mb-6">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Your BMI</p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-6xl font-bold" style={{ color: getBMIColor(bmi) }}>
                  {bmi.toFixed(1)}
                </span>
                <div className="text-left">
                  <p className="text-xl font-bold text-gray-800">{bmiCategory}</p>
                  <p className="text-sm text-gray-500">กก./ม²</p>
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
                  <p className="font-semibold text-blue-600">น้ำหนักน้อย</p>
                  <p className="text-[10px]">&lt;18.5</p>
                </div>
                <div>
                  <p className="font-semibold text-green-600">ปกติ</p>
                  <p className="text-[10px]">18.5-24.9</p>
                </div>
                <div>
                  <p className="font-semibold text-yellow-600">น้ำหนักเกิน</p>
                  <p className="text-[10px]">25-29.9</p>
                </div>
                <div>
                  <p className="font-semibold text-red-600">โรคอ้วน</p>
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
            onClick={handleContinue}
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