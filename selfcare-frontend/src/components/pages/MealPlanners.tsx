import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface MealPlannerProps {
  onBack: () => void;
  onGeneratePlan: (data: MealPlanData) => void;
}

export interface MealPlanData {
  likedMeals: string[];
  allergicFoods: string[];
  budget: string;
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
  { id: 'pork', label: 'Pork', labelTh: 'หมู', icon: '🐷' },
  { id: 'beef', label: 'Beef', labelTh: 'เนื้อ', icon: '🐄' },
  { id: 'nuts', label: 'Nuts', labelTh: 'ถั่ว', icon: '🥜' },
  { id: 'seafood', label: 'Seafood', labelTh: 'อาหารทะเล', icon: '🦐' },
  { id: 'dairy', label: 'Dairy', labelTh: 'นม', icon: '🥛' },
  { id: 'eggs', label: 'Eggs', labelTh: 'ไข่', icon: '🥚' },
];

export default function MealPlanner({ onBack, onGeneratePlan }: MealPlannerProps) {
  const [likedMeals, setLikedMeals] = useState<string[]>([]);
  const [allergicFoods, setAllergicFoods] = useState<string[]>([]);
  const [budget, setBudget] = useState('');

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

  const handleGeneratePlan = () => {
    if (likedMeals.length > 0) {
      onGeneratePlan({
        likedMeals,
        allergicFoods,
        budget,
      });
    }
  };

  const isFormComplete = likedMeals.length > 0 && budget;

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl pb-24">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-sm p-6">
        <h1 className="text-3xl text-center text-gray-800 mb-8">Meals</h1>

        {/* Liked Meals */}
        <div className="mb-8">
          <h3 className="text-gray-700 mb-1 flex items-center gap-2">
            <span className="text-pink-500">•</span>
            Liked Meals
          </h3>
          <p className="text-sm text-gray-500 mb-3 ml-5">Select your preferred meal types</p>
          <div className="grid grid-cols-3 gap-3">
            {mealTypes.map((meal) => (
              <button
                key={meal.id}
                onClick={() => toggleMeal(meal.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  likedMeals.includes(meal.id)
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
              >
                <span className="text-3xl">{meal.icon}</span>
                <span className={`text-sm ${likedMeals.includes(meal.id) ? 'text-emerald-700' : 'text-gray-600'}`}>
                  {meal.labelTh}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Allergic Foods */}
        <div className="mb-8">
          <h3 className="text-gray-700 mb-1 flex items-center gap-2">
            <span className="text-pink-500">•</span>
            Allergic Foods
          </h3>
          <p className="text-sm text-gray-500 mb-3 ml-5">Select foods you're allergic to (optional)</p>
          <div className="grid grid-cols-3 gap-3">
            {allergyTypes.map((allergy) => (
              <button
                key={allergy.id}
                onClick={() => toggleAllergy(allergy.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  allergicFoods.includes(allergy.id)
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <span className="text-3xl">{allergy.icon}</span>
                <span className={`text-sm ${allergicFoods.includes(allergy.id) ? 'text-red-700' : 'text-gray-600'}`}>
                  {allergy.labelTh}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div className="mb-8">
          <h3 className="text-gray-700 mb-1 flex items-center gap-2">
            <span className="text-pink-500">•</span>
            Budget per Meal
          </h3>
          <p className="text-sm text-gray-500 mb-3 ml-5">Enter your budget for each meal (฿)</p>
          <div className="relative">
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 100"
              className="w-full px-4 py-3 pl-12 rounded-2xl bg-emerald-50 border-2 border-transparent focus:border-emerald-300 outline-none transition-colors text-gray-700 placeholder:text-gray-400"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">฿</span>
          </div>
        </div>

        {/* Generate Plan Button */}
        <button
          onClick={handleGeneratePlan}
          disabled={!isFormComplete}
          className={`w-full py-4 rounded-2xl text-gray-700 transition-all ${
            isFormComplete
              ? 'bg-emerald-200 hover:bg-emerald-300 active:scale-98'
              : 'bg-gray-200 cursor-not-allowed opacity-50'
          }`}
        >
          Generate meal plan
        </button>
      </div>
    </div>
  );
}