import { ArrowLeft, Share2, Utensils, Sun, CloudSun, Moon, Calendar } from 'lucide-react';
import type { MealPlanData } from './MealPlanners';

interface MealScheduleProps {
  onBack: () => void;
  onSaveToSchedule?: (schedule: DayMeals[]) => void;
  mealPlanData: MealPlanData;
}

interface Meal {
  name: string;
  nameTh: string;
  price: number;
  type: string;
  protein: string;
  excludeAllergies: string[];
  image?: string;
}

interface DayMeals {
  day: string;
  dayTh: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  color: string;
}

// Database of meals
const mealDatabase: Meal[] = [
  // Rice-based meals
  { name: 'Fried Rice', nameTh: 'ข้าวผัด', price: 50, type: 'rice', protein: 'eggs', excludeAllergies: [] , image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400' },
  { name: 'Rice with Omelette', nameTh: 'ข้าวไข่เจียว', price: 45, type: 'rice', protein: 'eggs', excludeAllergies: [], image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400' },
  { name: 'Chicken Rice', nameTh: 'ข้าวมันไก่', price: 60, type: 'rice', protein: 'chicken', excludeAllergies: [], image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400' },
  { name: 'Pork Rice', nameTh: 'ข้าวหมูแดง', price: 55, type: 'rice', protein: 'pork', excludeAllergies: [], image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400' },
  
  // Noodle-based meals
  { name: 'Pad Thai', nameTh: 'ผัดไทย', price: 60, type: 'noodles', protein: 'seafood', excludeAllergies: ['seafood'], image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400' },
  { name: 'Tom Yum Noodle', nameTh: 'ก้วยเตี๋ยวต้มยำ', price: 65, type: 'noodles', protein: 'seafood', excludeAllergies: ['seafood'], image: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400' },
  { name: 'Chicken Noodle', nameTh: 'ก้วยเตี๋ยวไก่', price: 50, type: 'noodles', protein: 'chicken', excludeAllergies: [], image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400' },
  
  // Steak meals
  { name: 'Beef Steak', nameTh: 'สเต็กเนื้อ', price: 150, type: 'steak', protein: 'beef', excludeAllergies: [], image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
  { name: 'Pork Steak', nameTh: 'สเต็กหมู', price: 120, type: 'steak', protein: 'pork', excludeAllergies: [], image: 'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=400' },
  { name: 'Chicken Steak', nameTh: 'สเต็กไก่', price: 100, type: 'steak', protein: 'chicken', excludeAllergies: [], image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400' },
  
  // Soup meals
  { name: 'Tom Yum Soup', nameTh: 'ต้มยำกุ้ง', price: 80, type: 'soup', protein:'seafood', excludeAllergies: ['seafood'], image: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400' },
  { name: 'Chicken Soup', nameTh: 'ซุปไก่', price: 60, type: 'soup', protein:'chicken', excludeAllergies: [], image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400' },
  { name: 'Vegetable Soup', nameTh: 'ซุปผัก', price: 50, type: 'soup', protein:'vegetables', excludeAllergies: [], image: 'https://images.unsplash.com/photo-1588566565463-180a5b2090d2?w=400' },
  
  // Bread meals
  { name: 'Sandwich', nameTh: 'แซนวิช', price: 55, type: 'bread', protein: 'eggs', excludeAllergies: [], image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400' },
  { name: 'Toast with Eggs', nameTh: 'ขนมปังไข่', price: 45, type: 'bread', protein: 'eggs', excludeAllergies: ['eggs'], image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400' },
  { name: 'Burger', nameTh: 'เบอร์เกอร์', price: 80, type: 'bread', protein: 'beef', excludeAllergies: ['beef'], image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
  
  // Salad meals
  { name: 'Caesar Salad', nameTh: 'ซีซาร์สลัด', price: 90, type: 'salad', protein: 'chicken', excludeAllergies: [], image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400' },
  { name: 'Chicken Salad', nameTh: 'สลัดไก่', price: 85, type: 'salad', protein: 'chicken', excludeAllergies: [], image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400' },
  { name: 'Seafood Salad', nameTh: 'สลัดซีฟู้ด', price: 100, type: 'salad', protein: 'seafood', excludeAllergies: [], image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400' },
];

export default function MealSchedule({ onBack, onSaveToSchedule, mealPlanData }: MealScheduleProps) {
  const { likedMeals, allergicFoods, budget, excludedProteins } = mealPlanData;
  const budgetNumber = parseInt(budget) || 100;

  // Filter meals based on preferences
  const getFilteredMeals = (): Meal[] => {
  return mealDatabase.filter((meal) => {
    
    if (!likedMeals.includes(meal.type)) return false;
    if (meal.price > budgetNumber) return false;

    const hasAllergy = meal.excludeAllergies.some((allergy) =>
      allergicFoods.includes(allergy)
    );
    if (hasAllergy) return false;

   const hasExcludedProtein = excludedProteins?.includes(meal.protein);
if (hasExcludedProtein) return false;

    return true;
  });
};

  const filteredMeals = getFilteredMeals();

  // Generate random meal for a specific meal time
  const getRandomMeal = (seed: number): Meal => {
    if (filteredMeals.length === 0) {
      return { name: 'No meal available', nameTh: 'ไม่มีเมนู', price: 0, type: '', protein: '', excludeAllergies: [] };
    }
    const index = seed % filteredMeals.length;
    return filteredMeals[index];
  };

  // Generate weekly schedule
  const weekSchedule: DayMeals[] = [
    {
      day: 'Monday',
      dayTh: 'จันทร์',
      breakfast: getRandomMeal(0),
      lunch: getRandomMeal(1),
      dinner: getRandomMeal(2),
      color: 'bg-pink-50',
    },
    {
      day: 'Tuesday',
      dayTh: 'อังคาร',
      breakfast: getRandomMeal(3),
      lunch: getRandomMeal(4),
      dinner: getRandomMeal(5),
      color: 'bg-purple-50',
    },
    {
      day: 'Wednesday',
      dayTh: 'พุธ',
      breakfast: getRandomMeal(6),
      lunch: getRandomMeal(7),
      dinner: getRandomMeal(8),
      color: 'bg-blue-50',
    },
    {
      day: 'Thursday',
      dayTh: 'พฤหัสบดี',
      breakfast: getRandomMeal(9),
      lunch: getRandomMeal(10),
      dinner: getRandomMeal(11),
      color: 'bg-green-50',
    },
    {
      day: 'Friday',
      dayTh: 'ศุกร์',
      breakfast: getRandomMeal(12),
      lunch: getRandomMeal(13),
      dinner: getRandomMeal(14),
      color: 'bg-yellow-50',
    },
    {
      day: 'Saturday',
      dayTh: 'เสาร์',
      breakfast: getRandomMeal(15),
      lunch: getRandomMeal(16),
      dinner: getRandomMeal(17),
      color: 'bg-orange-50',
    },
    {
      day: 'Sunday',
      dayTh: 'อาทิตย์',
      breakfast: getRandomMeal(18),
      lunch: getRandomMeal(19),
      dinner: getRandomMeal(20),
      color: 'bg-red-50',
    },
  ];

  const handleSave = () => {
    if (onSaveToSchedule) {
      onSaveToSchedule(weekSchedule);
    }
    alert('บันทึกลงตารางเรียบร้อยแล้ว!');
  };

  const handleShare = () => {
    alert('แชร์แผนอาหารของคุณ');
  };

  const MealCard = ({ meal, icon, timeLabel }: { meal: Meal; icon: React.ReactNode; timeLabel: string }) => (
    <div className="flex items-center gap-2 bg-white rounded-xl p-2 shadow-sm">
      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{timeLabel}</p>
        <p className="text-sm text-gray-800 truncate">{meal.nameTh}</p>
      </div>
      <div className="text-xs text-emerald-600 font-medium flex-shrink-0">
        ฿{meal.price}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 h-screen w-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col overflow-hidden">
      {/* Header with Back Button */}
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 overflow-y-auto pb-6">
        <div className="max-w-2xl mx-auto pt-4">
          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            {/* Header */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <Utensils className="w-6 h-6 text-emerald-600" />
              <h2 className="text-2xl font-semibold text-gray-800">Meal Plan</h2>
              <Utensils className="w-6 h-6 text-emerald-600" />
            </div>

            {/* Budget Info */}
            <div className="bg-emerald-50 rounded-2xl p-4 mb-6 text-center">
              <p className="text-sm text-gray-600 mb-1">งบประมาณต่อมื้อ</p>
              <p className="text-2xl font-semibold text-emerald-700">฿{budget}</p>
            </div>

            {/* Weekly Schedule Grid */}
            <div className="space-y-4">
              {weekSchedule.map((dayMeals, index) => (
                <div key={index} className={`rounded-2xl p-4 ${dayMeals.color} border border-gray-200`}>
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                      {dayMeals.day}
                    </div>
                    <div className="text-xs font-medium text-gray-600">
                      รวม ฿{dayMeals.breakfast.price + dayMeals.lunch.price + dayMeals.dinner.price}
                    </div>
                  </div>

                  {/* Meals Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <MealCard 
                      meal={dayMeals.breakfast} 
                      icon={<Sun className="w-4 h-4 text-yellow-600" />}
                      timeLabel="เช้า"
                    />
                    <MealCard 
                      meal={dayMeals.lunch} 
                      icon={<CloudSun className="w-4 h-4 text-orange-600" />}
                      timeLabel="กลางวัน"
                    />
                    <MealCard 
                      meal={dayMeals.dinner} 
                      icon={<Moon className="w-4 h-4 text-indigo-600" />}
                      timeLabel="เย็น"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">มื้อทั้งหมด</p>
                  <p className="text-xl text-gray-800 font-semibold">21 มื้อ</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">งบรวมต่อสัปดาห์</p>
                  <p className="text-xl text-emerald-700 font-semibold">
                    ฿{weekSchedule.reduce((total, day) => 
                      total + day.breakfast.price + day.lunch.price + day.dinner.price, 0
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons - ย้ายมาอยู่ใน Card เดียวกัน */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-around gap-4">
                {/* Back */}
                <button
                  onClick={onBack}
                  className="flex flex-col items-center gap-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all rounded-2xl p-3 min-w-[80px]"
                >
                  <ArrowLeft className="w-6 h-6" />
                  <span className="text-sm font-medium">Back</span>
                </button>

                {/* Save */}
                <button
                  onClick={handleSave}
                  className="flex flex-col items-center gap-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all rounded-2xl p-3 min-w-[80px]"
                >
                  <Calendar className="w-6 h-6" />
                  <span className="text-sm font-medium">Save</span>
                </button>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="flex flex-col items-center gap-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all rounded-2xl p-3 min-w-[80px]"
                >
                  <Share2 className="w-6 h-6" />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}