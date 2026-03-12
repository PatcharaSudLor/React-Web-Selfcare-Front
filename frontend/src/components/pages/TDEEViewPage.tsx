import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, X, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';

interface ActivityLevelOption {
  id: ActivityLevel;
  label: string;
  description: string;
  multiplier: number;
  icon: string;
}

export default function TDEEViewPage() {
  const navigate = useNavigate();
  const { userInfo } = useUser();
  const [showInfo, setShowInfo] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLevel>('moderate');

  const bmr = userInfo.bmr || 0;

  useEffect(() => {
    if (!userInfo.bmr) {
      navigate('/userinfo');
    }
  }, [userInfo.bmr, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const activityLevels: ActivityLevelOption[] = [
    {
      id: 'sedentary',
      label: 'ไม่ค่อยเคลื่อนไหว',
      description: 'แทบไม่ได้ออกกำลังกาย',
      multiplier: 1.2,
      icon: '🪑'
    },
    {
      id: 'light',
      label: 'เคลื่อนไหวเล็กน้อย',
      description: 'ออกกำลังกาย 1-3 วัน/สัปดาห์',
      multiplier: 1.375,
      icon: '🚶'
    },
    {
      id: 'moderate',
      label: 'เคลื่อนไหวปานกลาง',
      description: 'ออกกำลังกาย 3-5 วัน/สัปดาห์',
      multiplier: 1.55,
      icon: '🏃'
    },
    {
      id: 'very',
      label: 'เคลื่อนไหวมาก',
      description: 'ออกกำลังกาย 6-7 วัน/สัปดาห์',
      multiplier: 1.725,
      icon: '💪'
    },
    {
      id: 'extra',
      label: 'เคลื่อนไหวหนักมาก',
      description: 'ออกกำลังกายหนักมากทุกวัน',
      multiplier: 1.9,
      icon: '🔥'
    }
  ];

  const selectedActivityLevel = activityLevels.find(a => a.id === selectedActivity)!;
  const tdee = Math.round(bmr * selectedActivityLevel.multiplier);

  const maintainWeight = tdee;
  const mildWeightLoss = tdee - 250;
  const weightLoss = tdee - 500;
  const mildWeightGain = tdee + 250;
  const weightGain = tdee + 500;


  const handleHome = () => {
    navigate('/home');
  }

  const handleBack = () => {
    navigate(-1);
  }

  return (
    <div className="fixed inset-0 w-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col overflow-y-auto">
      <div className="px-6 py-4 flex items-center relative z-10 bg-gradient-to-b from-emerald-50 to-transparent">
        <motion.button
          onClick={handleBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-gray-500 hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">ย้อนกลับ</span>
        </motion.button>
      </div>

      <div className="flex-1 px-8 -mt-12 overflow-y-auto pb-24">
        <motion.div
          className="max-w-2xl mx-auto space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-800">Your TDEE Result</h1>
            <p className="text-gray-500 text-lg">พลังงานที่ใช้ต่อวันทั้งหมด</p>
          </div>

          <motion.button
            onClick={() => setShowInfo(!showInfo)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="mx-auto flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-100 hover:bg-blue-200 transition-colors"
          >
            <Info className="w-5 h-5 text-blue-600" />
            <span className="text-base font-semibold text-blue-600">TDEE คืออะไร?</span>
          </motion.button>

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
                    <h3 className="text-2xl font-bold text-gray-800">TDEE คืออะไร?</h3>
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
                    คือจำนวนแคลอรี่ทั้งหมดที่คุณเผาผลาญใน 1 วัน รวมทุกกิจกรรม
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
                      <li>BMR (พลังงานที่ใช้ขณะพัก)</li>
                      <li>การออกกำลังกายและกิจกรรมทางกาย</li>
                      <li>การเคลื่อนไหวระหว่างวัน (เดิน ยืน)</li>
                      <li>การย่อยอาหาร (ผลของความร้อนจากอาหาร)</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>หมายเหตุ:</strong> หากต้องการคงน้ำหนักปัจจุบัน ควรรับพลังงานใกล้เคียงกับ
                      TDEE ของคุณ หากต้องการลดน้ำหนักให้กินน้อยลง และหากต้องการเพิ่มน้ำหนักให้กินมากขึ้น
                    </p>
                  </div>
                </div>

                <motion.button
                  onClick={() => setShowInfo(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-7 py-4 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg transition-colors"
                >
                  เข้าใจแล้ว
                </motion.button>
              </motion.div>
            </div>
          )}

          <motion.div
            className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <p className="text-sm text-gray-500 mb-1">ค่า BMR ของคุณ</p>
            <p className="text-2xl font-bold text-gray-800">
              {bmr} <span className="text-base font-normal text-gray-500">แคลอรี่/วัน</span>
            </p>
          </motion.div>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
          >
            <label className="block text-base font-semibold text-gray-700">
              เลือกระดับกิจกรรมของคุณ
            </label>

            <div className="space-y-4">
              {activityLevels.map((activity) => (
                <motion.button
                  key={activity.id}
                  onClick={() => setSelectedActivity(activity.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full p-6 rounded-3xl border-2 transition-all text-left ${selectedActivity === activity.id
                    ? "border-blue-400 bg-blue-50 shadow-lg"
                    : "border-gray-200 bg-white hover:border-blue-200"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{activity.icon}</span>

                    <div className="flex-1">
                      <p
                        className={`font-bold text-lg ${selectedActivity === activity.id ? "text-blue-600" : "text-gray-800"
                          }`}
                      >
                        {activity.label}
                      </p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                    </div>

                    <div
                      className={`text-right ${selectedActivity === activity.id ? "text-blue-600" : "text-gray-500"
                        }`}
                    >
                      <p className="text-sm font-semibold">×{activity.multiplier}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

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
                พลังงานที่ใช้ต่อวันทั้งหมดของคุณ
              </p>

              <div className="flex items-baseline justify-center gap-3">
                <span className="text-6xl font-bold">{tdee}</span>
                <span className="text-xl font-medium opacity-90">แคลอรี่/วัน</span>
              </div>

              <div className="bg-white bg-opacity-20 rounded-2xl px-5 py-3 inline-block">
                <p className="text-base opacity-90">
                  {selectedActivityLevel.label} • BMR × {selectedActivityLevel.multiplier}
                </p>
              </div>
            </div>
          </motion.div>

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
              <h3 className="text-xl font-bold text-gray-800">เป้าหมายแคลอรี่ของคุณ</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-base font-bold text-red-700">ลดน้ำหนัก</p>
                  <p className="text-sm text-red-600">-0.5 กก./สัปดาห์</p>
                </div>
                <p className="text-3xl font-bold text-red-600">
                  {weightLoss} <span className="text-base font-normal">แคลอรี่/วัน</span>
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-base font-bold text-orange-700">ลดน้ำหนักเล็กน้อย</p>
                  <p className="text-sm text-orange-600">-0.25 กก./สัปดาห์</p>
                </div>
                <p className="text-3xl font-bold text-orange-600">
                  {mildWeightLoss} <span className="text-base font-normal">แคลอรี่/วัน</span>
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-base font-bold text-emerald-700">คงน้ำหนัก</p>
                  <p className="text-sm text-emerald-600">0 กก./สัปดาห์</p>
                </div>
                <p className="text-3xl font-bold text-emerald-600">
                  {maintainWeight} <span className="text-base font-normal">แคลอรี่/วัน</span>
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-base font-bold text-blue-700">เพิ่มน้ำหนักเล็กน้อย</p>
                  <p className="text-sm text-blue-600">+0.25 กก./สัปดาห์</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {mildWeightGain} <span className="text-base font-normal">แคลอรี่/วัน</span>
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-base font-bold text-purple-700">เพิ่มน้ำหนัก</p>
                  <p className="text-sm text-purple-600">+0.5 กก./สัปดาห์</p>
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  {weightGain} <span className="text-base font-normal">แคลอรี่/วัน</span>
                </p>
              </div>
            </div>
          </motion.div>

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
              เป้าหมายแคลอรี่เหล่านี้เป็นค่าประมาณ ควรติดตามผลลัพธ์ของตัวเองและปรับตามความเหมาะสม <br />
              เพื่อผลลัพธ์ที่ดี ควรรับประทานอาหารให้เหมาะสม ควบคู่กับการออกกำลังกายสม่ำเสมอและนอนหลับให้เพียงพอ
            </p>
          </motion.div>

          <motion.button
            onClick={handleHome}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-lg transition-all shadow-lg shadow-emerald-200 hover:shadow-xl"
          >
            กลับหน้าหลัก
          </motion.button>

          <motion.div
            className="flex items-center justify-center gap-3 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.65 }}
          >
            <div className="w-3 h-3 -mt-6 rounded-full bg-emerald-400" />
            <div className="w-3 h-3 -mt-6 rounded-full bg-emerald-400" />
            <div className="w-10 h-3 -mt-6 rounded-full bg-emerald-400" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}