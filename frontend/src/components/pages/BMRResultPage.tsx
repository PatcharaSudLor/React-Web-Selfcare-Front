import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, X, Flame, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../utils/supabase';

interface BMRResultPageProps {
  onBack: () => void;
}

export default function BMRResultPage({ onBack }: BMRResultPageProps) {
  const navigate = useNavigate();
  const { userInfo, updateUserInfo } = useUser();
  const [showInfo, setShowInfo] = useState(false);
  const [bmr, setBmr] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const gender = userInfo.gender || 'male';
  const height = userInfo.height || '0';
  const weight = userInfo.weight || '0';
  const age = userInfo.age || '0';

  useEffect(() => {
    const fetchBMR = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token

      //Token validate
      if (!token) {
        alert('เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง')
        navigate('/')
        return
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/bmr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gender,
          height: parseFloat(height),
          weight: parseFloat(weight),
          age: parseFloat(age),
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setBmr(result.bmr);
        updateUserInfo({ bmr: result.bmr });
      }
      setIsLoading(false);
    };

    fetchBMR();
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white">
        <div className="text-center space-y-4">
          <Flame className="w-12 h-12 text-orange-500 animate-pulse mx-auto" />
          <p className="text-gray-500 text-lg">กำลังคำนวณค่า BMR ของคุณ...</p>
        </div>
      </div>
    );
  }

  const getBMRDescription = () => {
    return <>นี่คือปริมาณแคลอรี่ที่ร่างกายต้องใช้เพื่อคงการทำงานพื้นฐาน เช่น การหายใจ การไหลเวียนเลือด และการสร้างเซลล์ <br /> ในขณะพัก</>;
  };

  const handleContinue = () => {
    navigate('/tdeeresults');
  };

  return (
    <div className="fixed inset-0 w-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col overflow-y-auto">
      <div className="px-6 py-4 flex items-center relative z-10 bg-gradient-to-b from-emerald-50 to-transparent">
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

      <div className="flex-1 px-8 -mt-12 overflow-y-auto">
        <motion.div
          className="max-w-2xl mx-auto space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
              <Flame className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-800">Your BMR Result</h1>
            <p className="text-gray-500 text-lg">Basal Metabolic Rate</p>
          </div>

          <motion.button
            onClick={() => setShowInfo(!showInfo)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="mx-auto flex items-center gap-2 px-5 py-3 rounded-2xl bg-orange-100 hover:bg-orange-200 transition-colors"
          >
            <Info className="w-5 h-5 text-orange-600" />
            <span className="text-base font-semibold text-orange-600">What is BMR?</span>
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

                <div className="space-y-4 text-gray-600">
                  <p className="text-base leading-relaxed text-left">
                    <strong className="text-gray-800 ">Basal Metabolic Rate (BMR)</strong> <br /> คือจำนวนแคลอรี่ที่ร่างกายต้องใช้เพื่อคงการทำงานพื้นฐานที่จำเป็นต่อการมีชีวิต
                  </p>

                  <div className="space-y-2">
                    <p className="font-semibold text-gray-800 text-left">Formula (Mifflin-St Jeor):</p>
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-200">
                      <p className="font-mono text-sm leading-relaxed text-left">
                        <span className="font-semibold text-gray-700 ">Men:</span> (10 × weight) + (6.25 × height) - (5 × age) + 5
                      </p>
                      <p className="font-mono text-sm leading-relaxed text-left">
                        <span className="font-semibold text-gray-700">Women:</span> (10 × weight) + (6.25 × height) - (5 × age) - 161
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-800 text-left mb-3">Your BMR includes calories burned for:</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span className="leading-relaxed">การหายใจและการไหลเวียนเลือด</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span className="leading-relaxed">การสร้างและซ่อมแซมเซลล์</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span className="leading-relaxed">การเผาผลาญและใช้งานสารอาหาร</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span className="leading-relaxed">การทำงานของสมองและระบบประสาท</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                    <p className="text-orange-800 text-sm leading-relaxed text-left">
                      <strong>หมายเหตุ:</strong> <br /> BMR คือพลังงานที่เผาผลาญขณะพักอย่างสมบูรณ์ <br /> ความต้องการพลังงานต่อวันจริงจะสูงกว่านี้เมื่อรวมกิจกรรมทางกาย (TDEE)
                    </p>
                  </div>
                </div>

                <motion.button
                  onClick={() => setShowInfo(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-7 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  เข้าใจแล้ว
                </motion.button>
              </motion.div>
            </div>
          )}

          <motion.div
            className="grid grid-cols-2 gap-5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">เพศ</p>
              <p className="text-2xl font-bold text-gray-800 capitalize">{gender === 'male' ? 'ชาย' : gender === 'female' ? 'หญิง' : gender === 'other' ? 'อื่นๆ' : gender}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">อายุ</p>
              <p className="text-2xl font-bold text-gray-800">
                {age} <span className="text-base font-normal text-gray-500">ปี</span>
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">ส่วนสูง</p>
              <p className="text-2xl font-bold text-gray-800">
                {height} <span className="text-base font-normal text-gray-500">cm</span>
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">น้ำหนัก</p>
              <p className="text-2xl font-bold text-gray-800">
                {weight} <span className="text-base font-normal text-gray-500">kg</span>
              </p>
            </div>
          </motion.div>

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
                <span className="text-xl font-medium opacity-90">แคลอรี่/วัน</span>
              </div>
              <p className="text-base opacity-90 max-w-md mx-auto pt-1">
                พลังงานที่เผาผลาญในขณะพักอย่างสมบูรณ์
              </p>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-3xl p-7 border border-orange-200 shadow-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <div className="flex items-start gap-4 text-left">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 ">What This Means</h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  {getBMRDescription()}
                </p>
              </div>
            </div>
          </motion.div>

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
                <span>สมองของคุณใช้พลังงานประมาณ 20% ของแคลอรี่จาก BMR</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>มวลกล้ามเนื้อเผาผลาญพลังงานขณะพักมากกว่าเนื้อเยื่อไขมัน</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>โดยทั่วไป BMR จะลดลงประมาณ 1-2% ต่อทุกช่วงอายุ 10 ปีหลังอายุ 20 ปี</span>
              </li>
            </ul>
          </motion.div>

          <motion.button
            onClick={handleContinue}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-lg transition-all shadow-lg shadow-emerald-200 hover:shadow-xl"
          >
            ไปต่อที่ TDEE
          </motion.button>

          <motion.div
            className="flex items-center justify-center gap-3 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.65 }}
          >
            <div className="w-3 h-3 -mt-10 rounded-full bg-emerald-400" />
            <div className="w-3 h-3 -mt-10 rounded-full bg-emerald-400" />
            <div className="w-10 h-3 -mt-10 rounded-full bg-emerald-400" />
            <div className="w-3 h-3 -mt-10 rounded-full bg-gray-300"></div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}