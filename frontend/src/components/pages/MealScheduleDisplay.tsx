import React from 'react';
import { Utensils, Sun, CloudSun, Moon, Calendar } from 'lucide-react';

interface Meal {
  name_th: string;
  price: number;
}

interface DayMeals {
  day: string;
  dayTh: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}

interface MealScheduleDisplayProps {
  plan: { days: DayMeals[] };
  onSave?: () => void;
}

const MealScheduleDisplay: React.FC<MealScheduleDisplayProps> = ({ plan, onSave }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 my-2 max-w-full overflow-hidden">
      <div className="flex items-center justify-center gap-2 mb-6 border-b pb-3">
        <Utensils className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-bold text-gray-800">Your Weekly Meal Plan</h3>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {plan.days.map((item, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                {item.dayTh || item.day}
              </div>
              <div className="text-[10px] text-gray-500 font-bold">
                Total: ฿{item.breakfast.price + item.lunch.price + item.dinner.price}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 border-2 border-emerald-50 bg-emerald-50 bg-opacity-30 rounded-2xl p-3">
              {/* Breakfast */}
              <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm">
                <Sun className="w-4 h-4 text-orange-400" />
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400">เช้า</p>
                  <p className="text-xs font-bold text-gray-700">{item.breakfast.name_th}</p>
                </div>
                <div className="text-[10px] text-emerald-600 font-bold">฿{item.breakfast.price}</div>
              </div>

              {/* Lunch */}
              <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm">
                <CloudSun className="w-4 h-4 text-yellow-500" />
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400">กลางวัน</p>
                  <p className="text-xs font-bold text-gray-700">{item.lunch.name_th}</p>
                </div>
                <div className="text-[10px] text-emerald-600 font-bold">฿{item.lunch.price}</div>
              </div>

              {/* Dinner */}
              <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm">
                <Moon className="w-4 h-4 text-indigo-400" />
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400">เย็น</p>
                  <p className="text-xs font-bold text-gray-700">{item.dinner.name_th}</p>
                </div>
                <div className="text-[10px] text-emerald-600 font-bold">฿{item.dinner.price}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {onSave && (
        <button
          onClick={onSave}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl transition-all shadow-md active:scale-95"
        >
          <Calendar className="w-5 h-5" />
          <span>Save to My Schedule</span>
        </button>
      )}
    </div>
  );
};

export default MealScheduleDisplay;
