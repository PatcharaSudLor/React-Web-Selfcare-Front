import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Utensils } from 'lucide-react';

interface MealPlannerProps {
  onBack: () => void;
  onGeneratePlan: (data: MealPlanData) => void;
}

export interface MealPlanData {
  likedMeals: string[];
  allergicFoods: string[];
  budget: string;
  excludedProteins?: string[];
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
  { id: 'chicken', label: 'Chicken', labelTh: 'ไก่', icon: '🐔' },
  { id: 'nuts', label: 'Nuts', labelTh: 'ถั่ว', icon: '🥜' },
  { id: 'seafood', label: 'Seafood', labelTh: 'อาหารทะเล', icon: '🦐' },
  { id: 'dairy', label: 'Dairy', labelTh: 'นม', icon: '🥛' },
  { id: 'eggs', label: 'Eggs', labelTh: 'ไข่', icon: '🥚' },
];

const proteinOptions = [
  { id: 'pork', label: 'Pork', labelTh: 'หมู', icon: '🐷' },
  { id: 'beef', label: 'Beef', labelTh: 'เนื้อ', icon: '🐄' },
  { id: 'chicken', label: 'Chicken', labelTh: 'ไก่', icon: '🐔' },
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
  const [excludedProteins, setExcludedProteins] = useState<string[]>([]);
  const toggleProtein = (proteinId: string) => {
  setExcludedProteins((prev) =>
    prev.includes(proteinId)
      ? prev.filter((id) => id !== proteinId)
      : [...prev, proteinId]
  );
};

  
  const handleGeneratePlan = () => {
    if (likedMeals.length > 0) {
      onGeneratePlan({
        likedMeals,
        allergicFoods,
        budget,
        excludedProteins,
      });
    }
  };


  const isFormComplete = likedMeals.length > 0 && budget;

   return (
    <div className="fixed inset-0 h-screen w-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col overflow-hidden">
      {/* Content */}
      <div className="flex-1 px-4 overflow-y-auto pb-6 pt-16">
        <div className="max-w-4xl mx-auto pt-4">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>

          {/* Main Card */}
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
                <span className="text-emerald-500 text-xl">•</span>
                Liked Meals
              </h3>
              <p className="text-sm text-left text-gray-500 mb-4 ml-4">Select your preferred meal types</p>
              <div className="grid grid-cols-3 gap-3">
                {mealTypes.map((meal) => (
                  <button
                    key={meal.id}
                    onClick={() => toggleMeal(meal.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all hover:shadow-md ${
                      likedMeals.includes(meal.id)
                        ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                        : 'border-gray-200 hover:border-emerald-300 bg-white'
                    }`}
                  >
                    <span className="text-3xl">{meal.icon}</span>
                    <span className={`text-sm font-medium ${likedMeals.includes(meal.id) ? 'text-emerald-700' : 'text-gray-600'}`}>
                      {meal.labelTh}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Allergic Foods */}
            <div className="mb-8">
              <h3 className="text-gray-800 font-semibold mb-1 flex items-center gap-2">
                <span className="text-red-500 text-xl">•</span>
                Allergic Foods
              </h3>
              <p className="text-sm text-left text-gray-500 mb-4 ml-4">Select foods you're allergic to (optional)</p>
              <div className="grid grid-cols-3 gap-3">
                {allergyTypes.map((allergy) => (
                  <button
                    key={allergy.id}
                    onClick={() => toggleAllergy(allergy.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all hover:shadow-md ${
                      allergicFoods.includes(allergy.id)
                        ? 'border-red-500 bg-red-50 shadow-sm'
                        : 'border-gray-200 hover:border-red-300 bg-white'
                    }`}
                  >
                    <span className="text-3xl">{allergy.icon}</span>
                    <span className={`text-sm font-medium ${allergicFoods.includes(allergy.id) ? 'text-red-700' : 'text-gray-600'}`}>
                      {allergy.labelTh}
                    </span>
                  </button>
                ))}
              </div>
            </div>
           {/* Excluded Proteins */}
            <div className="mb-8">
              <h3 className="text-gray-800 font-semibold mb-1 flex items-center gap-2">
                <span className="text-orange-500 text-xl">•</span>
                Excluded Proteins
              </h3>
              <p className="text-sm text-left text-gray-500 mb-4 ml-4">
                Select proteins you want to avoid (optional)
              </p>

              <div className="grid grid-cols-3 gap-4">
                {proteinOptions.map((protein) => {
                  const active = excludedProteins.includes(protein.id);

                  return (
                    <button
                      key={protein.id}
                      type="button"
                      onClick={() => toggleProtein(protein.id)}
                      className={[
                        'h-28 w-full rounded-2xl border transition-all',
                        'flex flex-col items-center justify-center gap-2',
                        'bg-white hover:shadow-sm',
                        active
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300',
                      ].join(' ')}
                    >
                      <span className="text-3xl leading-none">{protein.icon}</span>
                      <span className={active ? 'text-sm font-medium text-orange-700' : 'text-sm font-medium text-gray-700'}>
                        {protein.labelTh}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget */}
            <div className="mb-8">
              <h3 className="text-gray-800 font-semibold mb-1 flex items-center gap-2">
                <span className="text-amber-500 text-xl">•</span>
                Budget per Meal
              </h3>
              <p className="text-sm text-left text-gray-500 mb-4 ml-4">Enter your budget for each meal (฿)</p>
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

            {/* Generate Plan Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleGeneratePlan}
                disabled={!isFormComplete}
                className={`w-full py-4 rounded-2xl font-semibold transition-all shadow-sm ${
                  isFormComplete
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-md active:scale-98'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                }`}
              >
                Generate Meal Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}