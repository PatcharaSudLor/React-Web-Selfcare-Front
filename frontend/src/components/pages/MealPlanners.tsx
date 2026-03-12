import { useState } from 'react';
import { ArrowLeft, Utensils, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';

interface MealPlannerProps {
  onHome: () => void;
  onGeneratePlan: (data: MealPlanData) => void;
}

export interface MealPlanData {
  likedMeals: string[];
  allergicFoods: string[];
  otherAllergies: string;
  budget: string;
  goal: string;
}

type MealType = {
  id: string;
  label: string;
  labelTh: string;
  icon: string;
};

type AllergyType = {
  id: string;
  label: string;
  labelTh: string;
  icon: string;
  group: 'protein' | 'other';
};

const mealTypes: MealType[] = [
  { id: 'rice', label: 'Rice', labelTh: 'ข้าว', icon: '🍚' },
  { id: 'noodles', label: 'Noodles', labelTh: 'เส้น', icon: '🍜' },
  { id: 'steak', label: 'Steak', labelTh: 'สเต็ก', icon: '🥩' },
  { id: 'soup', label: 'Soup', labelTh: 'ซุป', icon: '🍲' },
  { id: 'bread', label: 'Bread', labelTh: 'ขนมปัง', icon: '🍞' },
  { id: 'salad', label: 'Salad', labelTh: 'สลัด', icon: '🥗' },
];

const allergyTypes: AllergyType[] = [
  // โปรตีน
  { id: 'pork', label: 'Pork', labelTh: 'หมู', icon: '🐷', group: 'protein' },
  { id: 'beef', label: 'Beef', labelTh: 'เนื้อ', icon: '🐄', group: 'protein' },
  { id: 'chicken', label: 'Chicken', labelTh: 'ไก่', icon: '🐔', group: 'protein' },
  { id: 'seafood', label: 'Seafood', labelTh: 'อาหารทะเล', icon: '🦐', group: 'protein' },
  // วัตถุดิบอื่น
  { id: 'dairy', label: 'Dairy', labelTh: 'นม/เนย', icon: '🥛', group: 'other' },
  { id: 'eggs', label: 'Eggs', labelTh: 'ไข่', icon: '🥚', group: 'other' },
  { id: 'nuts', label: 'Tree Nuts', labelTh: 'ถั่วเปลือกแข็ง', icon: '🌰', group: 'other' },
  { id: 'peanuts', label: 'Peanuts', labelTh: 'ถั่วลิสง', icon: '🥜', group: 'other' },
  { id: 'gluten', label: 'Gluten', labelTh: 'กลูเตน', icon: '🌾', group: 'other' },
  { id: 'soy', label: 'Soy', labelTh: 'ถั่วเหลือง', icon: '🌱', group: 'other' },
];

const proteinAllergies = allergyTypes.filter(a => a.group === 'protein');
const otherAllergiesList = allergyTypes.filter(a => a.group === 'other');

export default function MealPlanner({ onHome, onGeneratePlan }: MealPlannerProps) {
  const navigate = useNavigate();
  const [likedMeals, setLikedMeals] = useState<string[]>([]);
  const [allergicFoods, setAllergicFoods] = useState<string[]>([]);
  const [otherAllergies, setOtherAllergies] = useState('');
  const [budget, setBudget] = useState('');
  const [goal, setGoal] = useState('maintain');
  const [isGenerating, setIsGenerating] = useState(false);

  const goals = [
    { id: 'lose', label: 'Lose Weight', labelTh: 'ลดน้ำหนัก', icon: '🔥' },
    { id: 'gain', label: 'Muscle Gain', labelTh: 'เพิ่มกล้ามเนื้อ', icon: '💪' },
    { id: 'maintain', label: 'Maintain', labelTh: 'รักษาสุขภาพ', icon: '⚖️' },
  ];

  const toggleMeal = (mealId: string) => {
    setLikedMeals((prev) =>
      prev.includes(mealId) ? prev.filter((id) => id !== mealId) : [...prev, mealId]
    );
  };

  const toggleAllergy = (allergyId: string) => {
    setAllergicFoods((prev) =>
      prev.includes(allergyId) ? prev.filter((id) => id !== allergyId) : [...prev, allergyId]
    );
  };

  const handleGeneratePlan = async () => {
    if (likedMeals.length === 0 || !budget || !goal || isGenerating) {
      alert('Please complete all required fields')
      return
    }

    setIsGenerating(true);

    // จำลองสถานะ AI Analyzing (2 วินาที)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 1. ส่งข้อมูลไปสร้างแผนทันที
    onGeneratePlan({ likedMeals, allergicFoods, otherAllergies, budget, goal });

    // 2. บันทึกข้อมูลลง API ในพื้นหลัง (Background)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (token) {
        fetch(`${import.meta.env.VITE_API_URL}/api/meal/preferences`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            likedMeals,
            allergicFoods,
            otherAllergies,
            budget: Number(budget),
          })
        }).catch(err => console.error('Background meal save failed:', err));
      }
    } catch (err) {
      console.error('Meal preference error:', err);
    }
  };

  const isFormComplete = likedMeals.length > 0 && budget && goal;

  const AllergyButton = ({ allergy }: { allergy: AllergyType }) => (
    <button
      key={allergy.id}
      onClick={() => toggleAllergy(allergy.id)}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all hover:shadow-md ${allergicFoods.includes(allergy.id)
        ? 'border-red-500 bg-red-50 shadow-sm'
        : 'border-gray-200 hover:border-red-300 bg-white'
        }`}
    >
      <span className="text-3xl">{allergy.icon}</span>
      <span className={`text-sm font-medium text-center ${allergicFoods.includes(allergy.id) ? 'text-red-700' : 'text-gray-600'
        }`}>
        {allergy.labelTh}
      </span>
    </button>
  );

  return (
    <div className="fixed inset-0 h-screen w-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col overflow-hidden">
      <div className="flex-1 px-4 overflow-y-auto pb-6 pt-16">
        <div className="max-w-4xl mx-auto pt-4">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={onHome}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            {/* Header */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <Utensils className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-semibold text-gray-800">Meal Preferences</h1>
              <Utensils className="w-6 h-6 text-emerald-600" />
            </div>

            {/* Liked Meals */}
            <div className="mb-8">
              <h3 className="text-gray-800 font-semibold mb-1 flex items-center gap-2">
                <span className="text-emerald-500 text-3xl">•</span>
                <span className="text-xl">Liked Meals</span>
              </h3>
              <p className="text-xm text-left text-gray-500 mb-4 ml-4">เลือกประเภทอาหารที่คุณชื่นชอบ(ระบุได้มากกว่า 1 อย่าง)</p>
              <div className="grid grid-cols-3 gap-3">
                {mealTypes.map((meal) => (
                  <button
                    key={meal.id}
                    onClick={() => toggleMeal(meal.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all hover:shadow-md ${likedMeals.includes(meal.id)
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                      : 'border-gray-200 hover:border-emerald-300 bg-white'
                      }`}
                  >
                    <span className="text-3xl">{meal.icon}</span>
                    <span className={`text-sm font-medium ${likedMeals.includes(meal.id) ? 'text-emerald-700' : 'text-gray-600'
                      }`}>
                      {meal.labelTh}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Allergic Foods */}
            <div className="mb-8">
              <h3 className="text-gray-800 font-semibold mb-1 flex items-center gap-2">
                <span className="text-red-500 text-3xl">•</span>
                <span className="text-xl">Allergic Foods</span>
              </h3>
              <p className="text-xm text-left text-gray-500 mb-4 ml-4">
                เลือกอาหารที่คุณแพ้ (ระบุได้มากกว่า 1 อย่าง)
              </p>

              {/* โปรตีน */}
              <p className="text-xm font-semibold text-gray-400 uppercase tracking-wide mb-2 ml-1">🥩 โปรตีน</p>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {proteinAllergies.map((allergy) => (
                  <AllergyButton key={allergy.id} allergy={allergy} />
                ))}
              </div>

              {/* วัตถุดิบอื่น */}
              <p className="text-xm font-semibold text-gray-400 uppercase tracking-wide mb-2 ml-1">🌿 วัตถุดิบอื่น</p>
              <div className="grid grid-cols-3 gap-3">
                {otherAllergiesList.map((allergy) => (
                  <AllergyButton key={allergy.id} allergy={allergy} />
                ))}
              </div>
            </div>

            {/* Other Allergies Text Input */}
            <div className="mb-8">
              <h3 className="text-lg text-left font-medium text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-emerald-500 text-3xl">•</span>
                <span className="text-xl">More</span>
              </h3>
              <input
                type="text"
                value={otherAllergies}
                onChange={(e) => setOtherAllergies(e.target.value)}
                placeholder="ระบุข้อมูลอาหารที่แพ้อื่นๆ (ระบุหรือไม่ก็ได้)"
                className="w-full px-4 py-3 rounded-2xl bg-emerald-50 border-2 border-transparent focus:border-emerald-300 outline-none transition-colors text-gray-700 placeholder:text-gray-400"
              />
            </div>

            {/* Goals */}
            <div className="mb-8">
              <h3 className="text-gray-800 font-semibold mb-1 flex items-center gap-2">
                <span className="text-emerald-500 text-3xl">•</span>
                <span className="text-xl">เป้าหมายสุขภาพ</span>
              </h3>
              <p className="text-xm text-left text-gray-500 mb-4 ml-4">เลือกเป้าหมายหลักในการกิน</p>
              <div className="grid grid-cols-3 gap-3">
                {goals.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all hover:shadow-md ${goal === g.id
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                      : 'border-gray-200 hover:border-emerald-300 bg-white'
                      }`}
                  >
                    <span className="text-3xl">{g.icon}</span>
                    <span className={`text-sm font-medium ${goal === g.id ? 'text-emerald-700' : 'text-gray-600'}`}>
                      {g.labelTh}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="mb-8">
              <h3 className="text-gray-800 font-semibold mb-1 flex items-center gap-2">
                <span className="text-amber-500 text-3xl">•</span>
                <span className="text-xl">Budget per Meal</span>
              </h3>
              <p className="text-xm text-left text-gray-500 mb-4 ml-4">ระบุงบประมาณสำหรับอาหารแต่ละมื้อ (฿)</p>
              <div className="relative">
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-4 py-3 pl-12 rounded-2xl bg-emerald-50 border-2 border-emerald-200 focus:border-emerald-400 focus:bg-white outline-none transition-all text-gray-700 placeholder:text-gray-400 shadow-sm"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 text-xl font-semibold">฿</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-200 flex flex-col gap-3">
              <button
                onClick={handleGeneratePlan}
                disabled={!isFormComplete || isGenerating}
                className={`w-full py-4 rounded-2xl font-semibold transition-all shadow-sm flex items-center justify-center gap-2 ${isFormComplete && !isGenerating
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-md active:scale-98'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                  }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>AI Analyzing...</span>
                  </>
                ) : (
                  <span>Generate Meal Plan</span>
                )}
              </button>

              <button
                onClick={() => {
                  if (!isFormComplete) {
                    alert('Please complete all required fields for AI analysis');
                    return;
                  }
                  const initialQuery = `ช่วยวางแผนอาหารให้หน่อยครับ ฉันชอบกิน ${likedMeals.map(m => mealTypes.find(t => t.id === m)?.labelTh).join(', ')} งบประมาณต่อมื้อคือ ฿${budget} ${allergicFoods.length > 0 ? `ฉันแพ้อาหารประเภท: ${allergicFoods.map(a => allergyTypes.find(t => t.id === a)?.labelTh).join(', ')}` : ''} ${otherAllergies ? `และแพ้อาหารอื่นๆ คือ: ${otherAllergies}` : ''}`;
                  navigate('/chat', { state: { initialQuery } });
                }}
                className={`w-full py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${isFormComplete
                  ? 'bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 shadow-sm'
                  : 'bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <Sparkles className="w-5 h-5 text-emerald-500" />
                Ask AI Assistant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}