import { useState } from 'react';
import { Heart, Dumbbell, Utensils, Sparkles, Bookmark, Calendar, ChevronLeft, ChevronRight, Activity, Zap, TrendingUp } from 'lucide-react';

const tips = [
  'ดื่มน้ำหลังตื่นนอน 1 แก้ว',
  'ออกกำลังกายอย่างน้อย 30 นาทีต่อวัน',
  'นอนหลับให้ครบ 7-8 ชั่วโมง',
  'ทานผักและผลไม้ให้หลากหลาย',
  'ยืดเหยียดกล้ามเนื้อทุกวัน',
];

interface HomePageProps {
  username?: string;
  bmi?: number;
  bmr?: number;
  tdee?: number;
  onNavigateToWorkouts?: () => void;
  onNavigateToMeals?: () => void;
  onNavigateToAssistant?: () => void;
  onNavigateToFavorite?: () => void;
  onNavigateToSchedule?: () => void;
  onNavigateToBMI?: () => void;
  onNavigateToBMR?: () => void;
  onNavigateToTDEE?: () => void;
  onLogout?: () => void;
}

export default function HomePage({ 
  username = 'User',
  bmi,
  bmr,
  tdee,
  onNavigateToWorkouts, 
  onNavigateToMeals, 
  onNavigateToAssistant,
  onNavigateToFavorite, 
  onNavigateToSchedule,
  onNavigateToBMI,
  onNavigateToBMR,
  onNavigateToTDEE,
}: HomePageProps) {
  const [currentTip, setCurrentTip] = useState(0);
  const [currentHealthCard, setCurrentHealthCard] = useState(0);

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length);
  };

  const nextHealthCard = () => {
    setCurrentHealthCard((prev) => (prev + 1) % 3);
  };

  const prevHealthCard = () => {
    setCurrentHealthCard((prev) => (prev - 1 + 3) % 3);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl pb-24">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-3xl p-6 mb-6 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl text-gray-800 mb-1">สวัสดี {username}</h2>
            <p className="text-gray-700">วันนี้กินน้ำครบ 8 แก้วรึยัง?</p>
          </div>
        </div>

        {/* Daily Tip */}
        <div className="bg-white bg-opacity-50 rounded-2xl p-4 relative">
          <button
            onClick={prevTip}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          
          <div className="px-8">
            <p className="text-sm text-gray-600 mb-1">💡 เคล็ดลับวันนี้:</p>
            <p className="text-gray-800">{tips[currentTip]}</p>
          </div>

          <button
            onClick={nextTip}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>

          {/* Dots indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {tips.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTip(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentTip 
                    ? 'bg-emerald-600 w-6' 
                    : 'bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Health Metrics Swipeable Card */}
      <div className="mb-6 relative">
        <div className="overflow-hidden rounded-3xl">
          {/* Show loading skeleton when data is not ready (0 or undefined) */}
          {!bmi && !bmr && !tdee ? (
            currentHealthCard === 0 ? (
              <MetricCardSkeleton gradient="bg-gradient-to-br from-blue-400 to-blue-500" />
            ) : currentHealthCard === 1 ? (
              <MetricCardSkeleton gradient="bg-gradient-to-br from-amber-400 to-orange-500" />
            ) : (
              <MetricCardSkeleton gradient="bg-gradient-to-br from-emerald-400 to-teal-500" />
            )
          ) : (
            <>
              {currentHealthCard === 0 && bmi && bmi > 0 && (
                <button
                  onClick={onNavigateToBMI}
                  className="w-full bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-white text-opacity-90">Body Mass Index</p>
                        <h3 className="text-2xl font-bold">BMI</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold">{bmi.toFixed(1)}</p>
                    </div>
                  </div>
                </button>
              )}

              {currentHealthCard === 1 && bmr && bmr > 0 && (
                <button
                  onClick={onNavigateToBMR}
                  className="w-full bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-white text-opacity-90">Basal Metabolic Rate</p>
                        <h3 className="text-2xl font-bold">BMR</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">{bmr.toFixed(0)}</p>
                      <p className="text-sm text-white text-opacity-90">kcal/day</p>
                    </div>
                  </div>
                </button>
              )}

              {currentHealthCard === 2 && tdee && tdee > 0 && (
                <button
                  onClick={onNavigateToTDEE}
                  className="w-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-white text-opacity-90">Total Daily Energy</p>
                        <h3 className="text-2xl font-bold">TDEE</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">{tdee.toFixed(0)}</p>
                      <p className="text-sm text-white text-opacity-90">kcal/day</p>
                    </div>
                  </div>
                </button>
              )}

              {/* Show skeleton if current card doesn't have data yet */}
              {(currentHealthCard === 0 && (!bmi || bmi === 0)) && (
                <MetricCardSkeleton gradient="bg-gradient-to-br from-blue-400 to-blue-500" />
              )}
              {(currentHealthCard === 1 && (!bmr || bmr === 0)) && (
                <MetricCardSkeleton gradient="bg-gradient-to-br from-amber-400 to-orange-500" />
              )}
              {(currentHealthCard === 2 && (!tdee || tdee === 0)) && (
                <MetricCardSkeleton gradient="bg-gradient-to-br from-emerald-400 to-teal-500" />
              )}
            </>
          )}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevHealthCard}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-10"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        <button
          onClick={nextHealthCard}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-10"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>

        {/* Dots indicator */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => setCurrentHealthCard(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentHealthCard 
                  ? 'bg-emerald-600 w-6' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Workouts */}
        <button 
          onClick={onNavigateToWorkouts}
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all active:scale-95 flex flex-col items-center gap-3 hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-300 transition-all">
            <Dumbbell className="w-6 h-6 text-orange-600" />
          </div>
          <span className="text-gray-800">Workouts</span>
        </button>

        {/* Meals */}
        <button 
          onClick={onNavigateToMeals}
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all active:scale-95 flex flex-col items-center gap-3 hover:bg-gradient-to-br hover:from-rose-50 hover:to-rose-100"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center transition-all">
            <Utensils className="w-6 h-6 text-rose-600" />
          </div>
          <span className="text-gray-800">Meals</span>
        </button>

        {/* Assistant */}
        <button 
          onClick={onNavigateToAssistant}
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all active:scale-95 flex flex-col items-center gap-3 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-emerald-100"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center transition-all">
            <Sparkles className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-gray-800">AI Assistant</span>
        </button>

        {/* Favorite */}
        <button 
          onClick={onNavigateToFavorite}
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all active:scale-95 flex flex-col items-center gap-3 hover:bg-gradient-to-br hover:from-pink-50 hover:to-pink-100"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center transition-all">
            <Bookmark className="w-6 h-6 text-pink-600" />
          </div>
          <span className="text-gray-800">Favorite</span>
        </button>
      </div>

      {/* Schedule - Full Width */}
      <button 
        onClick={onNavigateToSchedule}
        className="w-full bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all active:scale-95 flex flex-col items-center gap-3 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center transition-all">
          <Calendar className="w-6 h-6 text-blue-600" />
        </div>
        <span className="text-gray-800">Schedule</span>
      </button>
    </div>
  );
}

// Loading skeleton component
function MetricCardSkeleton({ gradient }: { gradient: string }) {
  return (
    <div className={`w-full ${gradient} rounded-3xl p-6 shadow-lg animate-pulse`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white bg-opacity-30 rounded-full" />
          <div>
            <div className="w-24 h-3 bg-white bg-opacity-30 rounded mb-2" />
            <div className="w-16 h-6 bg-white bg-opacity-40 rounded" />
          </div>
        </div>
        <div className="text-right">
          <div className="w-20 h-10 bg-white bg-opacity-40 rounded mb-1" />
        </div>
      </div>
    </div>
  );
}