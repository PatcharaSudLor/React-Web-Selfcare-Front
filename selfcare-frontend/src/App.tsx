import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { UserProvider } from './contexts/UserContext'
import FirstPage from './components/pages/FirstPage'
import SignUpPage from './components/pages/SignUpPage'
import LoginPage from './components/pages/LoginPage'
import UserInfoPage from './components/pages/UserInfoPage'
import BMIResultPage from './components/pages/BMIResultPage'
import BMRResultPage from './components/pages/BMRResultPage'
import TDEEResultPage from './components/pages/TDEEResultPage'
import HomePage from './components/pages/HomePage'
import MealPlanner from './components/pages/MealPlanners'
import MainLayout from './components/pages/layout/MainLayout'
import MealSchedule from './components/pages/MealSchedule'
import type { MealPlanData } from './components/pages/MealPlanners'
import WorkoutPlanner from './components/pages/WorkoutPlanners'
import WorkoutSchedule from './components/pages/WorkoutSchedule'
import WorkoutVideos from './components/pages/WorkoutVideos'
import ProfilePage from './components/pages/ProfilePage'
import TipsPage from './components/pages/TipsPage'
import type { Tip } from './components/pages/TipsPage'
import TipDetailPage from './components/pages/TipDetailPage'
import type { WeeklyWorkoutPlan } from './utils/workoutGenerator'
import './App.css'
import { useState } from 'react'

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mealPlanData, setMealPlanData] = useState<MealPlanData | null>(null)
  const [workoutPlan, setWorkoutPlanData] = useState<WeeklyWorkoutPlan | null>(null)
  const [bookmarkedTips, setBookmarkedTips] = useState<Tip[]>([])

  const handleLogin = () => {
    navigate('/login')
  }

  const handleSignUp = () => {
    navigate('/signup')
  }

  const handleBack = () => {
    navigate(-1)
  }

  const handleLoginSuccess = (page: string) => {
    console.log('Login successful:', page)
    navigate(`/${page}`)
  }

  const handleLogout = () => {
    navigate('/')
  }

  const handleSelectTip = (tip: Tip) => {
    navigate('/tips/detail', { state: { tip } })
  }

  const handleToggleBookmark = (tip: Tip) => {
    setBookmarkedTips((prev) => (prev.some(t => t.id === tip.id) ? prev.filter(t => t.id !== tip.id) : [...prev, tip]))
  }

  // Wrapper to parse query param and pass a bodyPart to WorkoutVideos
  function WorkoutVideosWrapper() {
    const nav = useNavigate()
    const loc = useLocation()
    const params = new URLSearchParams(loc.search)
    const partId = params.get('part') || 'upper-body'
    const nameMap: Record<string, string> = {
      'upper-body': 'Upper Body',
      core: 'Core',
      legs: 'Legs',
      stretching: 'Stretching',
    }

    const bodyPart = { id: partId, name: nameMap[partId] ?? partId }

    return <WorkoutVideos bodyPart={bodyPart} onBack={() => nav('/workouts')} />
  }

  return (
    <Routes>
      <Route path="/" element={<FirstPage onLogin={handleLogin} onSignUp={handleSignUp} />} />
      <Route path="/signup" element={<SignUpPage onBack={handleBack} onLogin={handleLogin} />} />
      <Route path="/login" element={<LoginPage onBack={handleBack} onSignUp={handleSignUp} onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/userinfo" element={<UserInfoPage onBack={handleBack} />} />
      <Route path="/bmiresults" element={<BMIResultPage onBack={handleBack} />} />
      <Route path="/bmrresults" element={<BMRResultPage onBack={handleBack} />} />
      <Route path="/tdeeresults" element={<TDEEResultPage onBack={handleBack} />} />

      {/* Pages within MainLayout */}
      <Route element={<MainLayout currentPage={location.pathname} onNavigate={(path) => navigate(path)} onLogout={handleLogout} />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage onBack={() => navigate('/home')} profileImage="https://api.dicebear.com/7.x/avataaars/svg?seed=default" onLogout={handleLogout} />} />
        <Route path="/meals" element={<MealPlanner onBack={() => navigate('/home')} onGeneratePlan={(data) => { setMealPlanData(data); navigate('/meals/schedule'); }} />} />
        <Route path="/workouts" element={<WorkoutPlanner onBack={() => navigate('/home')} onGeneratePlan={(data) => { setWorkoutPlanData(data); navigate('/workouts/schedule'); }} />} />
        <Route
          path="/workouts/schedule"
          element={
            workoutPlan ? (
              <WorkoutSchedule
                onBack={() => navigate('/workouts')}
                plan={workoutPlan}
              />
            ) : (
              <div className="p-6 text-center">
                <p>ไม่พบแผนออกกำลังกาย กรุณาสร้างแผนใหม่</p>
              </div>
            )
          }
        />
        <Route path="/meals/schedule" element={<MealSchedule onBack={() => navigate('/meals')} onSaveToSchedule={(s) => { console.log('Saved schedule:', s); }} mealPlanData={mealPlanData ?? { likedMeals: [], allergicFoods: [], budget: '' }} />} />
        <Route path="/workouts/videos" element={<WorkoutVideosWrapper />} />
        <Route path="/tips" element={<TipsPage onSelectTip={handleSelectTip} bookmarkedTips={bookmarkedTips} onToggleBookmark={handleToggleBookmark} />} />
        <Route path="/tips/detail" element={<TipDetailPage onBack={() => navigate('/tips')} />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  )
}

export default App