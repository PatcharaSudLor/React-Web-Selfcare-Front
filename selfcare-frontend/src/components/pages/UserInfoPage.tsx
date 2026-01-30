import { useState } from 'react';
import { supabase } from '../../utils/supabase';
import { ArrowLeft, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserInfoPageProps {
  onBack: () => void;
  onConfirm: (data: UserInfoData) => void;
}

export interface UserInfoData {
  username: string;
  gender: 'male' | 'female' | '';
  height: string;
  weight: string;
  age: string;
  bloodType: string;
  bmi: number;
  bmiCategory: string;
  bmr?: number;
  tdee?: number;
}

// Custom Gender Icons
const MaleIcon = ({ className }: { className?: string }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="10" cy="14" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M14 5h5v5M19 5l-5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FemaleIcon = ({ className }: { className?: string }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="9" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M12 15v6M9 18h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function UserInfoPage({ onBack, onConfirm }: UserInfoPageProps) {
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [bloodType, setBloodType] = useState('');

  const bloodTypes = ['A', 'B', 'AB', 'O', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleConfirm = async () => {
    if (!username || !gender || !height || !weight || !age || !bloodType) {
      alert('Please fill in all fields');
      return;
    }

    // Calculate BMI
    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);
    const bmiValue = weightInKg / (heightInMeters * heightInMeters);
    const bmi = parseFloat(bmiValue.toFixed(1));
    
    let bmiCategory = '';
    if (bmiValue < 18.5) {
      bmiCategory = 'Underweight';
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      bmiCategory = 'Normal';
    } else if (bmiValue >= 25 && bmiValue < 30) {
      bmiCategory = 'Overweight';
    } else if (bmiValue >= 30 && bmiValue < 35) {
      bmiCategory = 'Obese';
    } else {
      bmiCategory = 'Morbidly Obese';
    }

    // Attach authenticated user's id (if available) and save to Supabase.
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        alert('You must be signed in to save your profile.');
        return;
      }

      const { error } = await supabase.from('users').insert([{ 
        user_id: user.id,
        username,
        gender,
        height: parseFloat(height),
        weight: parseFloat(weight),
        age: parseInt(age, 10),
        blood_type: bloodType,
        bmi,
        bmi_category: bmiCategory,
      }]);

      if (error) {
        console.error('Supabase insert error:', error);
        alert('Failed to save user info. Please try again.');
        return;
      }
    } catch (err) {
      console.error('Unexpected error saving to Supabase:', err);
      alert('Failed to save user info. Please try again.');
      return;
    }

    // Notify parent after successful save
    onConfirm({
      username,
      gender,
      height,
      weight,
      age,
      bloodType,
      bmi,
      bmiCategory,
    });
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
        <motion.div className="max-w-2xl mx-auto space-y-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
              <Activity className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-800">Tell Us About Yourself</h1>
            <p className="text-gray-500 text-lg">Help us personalize your health journey</p>
          </div>

          <motion.div className="space-y-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <label className="block text-base font-semibold text-gray-700 text-left">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" className="w-full px-5 py-4 rounded-2xl border border-gray-300 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all text-gray-700 text-lg" />
          </motion.div>

          <motion.div className="space-y-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <label className="block text-base font-semibold text-gray-700 text-left">Gender</label>
            <div className="grid grid-cols-2 gap-5">
              <motion.button onClick={() => setGender('male')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className={`p-8 rounded-3xl border-2 transition-all ${gender === 'male' ? 'border-blue-400 bg-blue-50 shadow-lg' : 'border-gray-200 bg-white hover:border-blue-200'}`}>
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${gender === 'male' ? 'bg-blue-400' : 'bg-gray-200'}`}>
                    <MaleIcon className={`w-8 h-8 ${gender === 'male' ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <span className={`font-semibold text-lg ${gender === 'male' ? 'text-blue-600' : 'text-gray-600'}`}>Male</span>
                </div>
              </motion.button>

              <motion.button onClick={() => setGender('female')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className={`p-8 rounded-3xl border-2 transition-all ${gender === 'female' ? 'border-pink-400 bg-pink-50 shadow-lg' : 'border-gray-200 bg-white hover:border-pink-200'}`}>
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${gender === 'female' ? 'bg-pink-400' : 'bg-gray-200'}`}>
                    <FemaleIcon className={`w-8 h-8 ${gender === 'female' ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <span className={`font-semibold text-lg ${gender === 'female' ? 'text-pink-600' : 'text-gray-600'}`}>Female</span>
                </div>
              </motion.button>
            </div>
          </motion.div>

          <motion.div className="grid grid-cols-2 gap-5" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <div className="space-y-3">
              <label className="block text-base font-semibold text-gray-700 text-left">Height (cm)</label>
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="170" className="w-full px-5 py-4 rounded-2xl border border-gray-300 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all text-gray-700 text-lg" />
            </div>
            <div className="space-y-3">
              <label className="block text-base font-semibold text-gray-700 text-left">Age</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" className="w-full px-5 py-4 rounded-2xl border border-gray-300 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all text-gray-700 text-lg" />
            </div>
          </motion.div>

          <motion.div className="grid grid-cols-2 gap-5" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
            <div className="space-y-3">
              <label className="block text-base font-semibold text-gray-700 text-left">Weight (kg)</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="65" className="w-full px-5 py-4 rounded-2xl border border-gray-300 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all text-gray-700 text-lg" />
            </div>
            <div className="space-y-3">
              <label className="block text-base font-semibold text-gray-700 text-left">Blood Type</label>
              <select value={bloodType} onChange={(e) => setBloodType(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-gray-300 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all text-gray-700 bg-white appearance-none cursor-pointer text-lg" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px' }}>
                <option value="">Select</option>
                {bloodTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </motion.div>

          <motion.button onClick={handleConfirm} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-lg transition-all shadow-lg shadow-emerald-200 hover:shadow-xl">Confirm</motion.button>

          <motion.div className="flex items-center justify-center gap-3 pt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.7 }}>
            <div className="w-10 h-3 rounded-full bg-emerald-400"  />
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <div className="w-3 h-3 rounded-full bg-gray-300" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}