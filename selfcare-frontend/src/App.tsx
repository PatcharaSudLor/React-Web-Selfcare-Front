import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { UserProvider } from './contexts/UserContext'
import FirstPage from './components/pages/FirstPage'
import SignUpPage from './components/pages/SignUpPage'
import LoginPage from './components/pages/LoginPage'
import UserInfoPage from './components/pages/UserInfoPage'
import BMIResultPage from './components/pages/BMIResultPage'
import BMIViewPage from './components/pages/BMIViewPage'
import BMRResultPage from './components/pages/BMRResultPage'
import BMRViewPage from './components/pages/BMRViewPage'
import TDEEResultPage from './components/pages/TDEEResultPage'
import TDEEViewPage from './components/pages/TDEEViewPage'
import HomePage from './components/pages/HomePage'
import ResetPasswordPage from './components/pages/ResetPasswordPage'
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
import AlertPage from './components/pages/AlertPage'
import { SchedulePage } from './components/pages/SchedulePage'
import type { WeeklyWorkoutPlan } from './utils/workoutGenerator'
import './App.css'
import { useEffect, useState } from 'react'

interface SavedWorkoutDay {
  day: string;
  dayTh: string;
  workout: string;
  duration: string;
  exercises: string[];
  color: string;
}

interface SavedMeal {
  name: string;
  nameTh: string;
  price: number;
  type: string;
  excludeAllergies: string[];
  image?: string;
}

interface SavedMealDay {
  day: string;
  dayTh: string;
  breakfast: SavedMeal;
  lunch: SavedMeal;
  dinner: SavedMeal;
  color: string;
}

const WORKOUT_SCHEDULES_STORAGE_KEY = 'savedWorkoutSchedules'
const MEAL_SCHEDULES_STORAGE_KEY = 'savedMealSchedules'
const WORKOUT_PLAN_STORAGE_KEY = 'savedWorkoutPlan'
const MEAL_PLAN_STORAGE_KEY = 'savedMealPlanData'

const parseDurationToNumber = (duration: string): number => {
  const matched = duration.match(/\d+/)
  return matched ? Number(matched[0]) : 0
}

const mapSavedScheduleToPlan = (savedSchedule: SavedWorkoutDay[]): WeeklyWorkoutPlan => {
  return {
    days: savedSchedule.map((day) => ({
      day: day.day,
      focus: day.workout,
      duration: parseDurationToNumber(day.duration),
      exercises: day.exercises.map((exerciseText) => ({
        name: exerciseText,
        sets: 3,
        reps: '10-12',
      })),
    })),
  }
}

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mealPlanData, setMealPlanData] = useState<MealPlanData | null>(null)
  const [workoutPlan, setWorkoutPlanData] = useState<WeeklyWorkoutPlan | null>(null)
  const [bookmarkedTips, setBookmarkedTips] = useState<Tip[]>([])
  const [workoutSchedules, setWorkoutSchedules] = useState<SavedWorkoutDay[][]>([])
  const [mealSchedules, setMealSchedules] = useState<SavedMealDay[][]>([])

  useEffect(() => {
    const storedWorkoutSchedules = localStorage.getItem(WORKOUT_SCHEDULES_STORAGE_KEY)
    const storedMealSchedules = localStorage.getItem(MEAL_SCHEDULES_STORAGE_KEY)
    const storedWorkoutPlan = localStorage.getItem(WORKOUT_PLAN_STORAGE_KEY)
    const storedMealPlan = localStorage.getItem(MEAL_PLAN_STORAGE_KEY)

    if (storedWorkoutSchedules) {
      try {
        setWorkoutSchedules(JSON.parse(storedWorkoutSchedules))
      } catch {
        setWorkoutSchedules([])
      }
    }

    if (storedMealSchedules) {
      try {
        setMealSchedules(JSON.parse(storedMealSchedules))
      } catch {
        setMealSchedules([])
      }
    }

    if (storedWorkoutPlan) {
      try {
        setWorkoutPlanData(JSON.parse(storedWorkoutPlan))
      } catch {
        setWorkoutPlanData(null)
      }
    }

    if (storedMealPlan) {
      try {
        setMealPlanData(JSON.parse(storedMealPlan))
      } catch {
        setMealPlanData(null)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(WORKOUT_SCHEDULES_STORAGE_KEY, JSON.stringify(workoutSchedules))
  }, [workoutSchedules])

  useEffect(() => {
    localStorage.setItem(MEAL_SCHEDULES_STORAGE_KEY, JSON.stringify(mealSchedules))
  }, [mealSchedules])

  useEffect(() => {
    if (mealPlanData) {
      localStorage.setItem(MEAL_PLAN_STORAGE_KEY, JSON.stringify(mealPlanData))
    } else {
      localStorage.removeItem(MEAL_PLAN_STORAGE_KEY)
    }
  }, [mealPlanData])

  useEffect(() => {
    if (workoutPlan) {
      localStorage.setItem(WORKOUT_PLAN_STORAGE_KEY, JSON.stringify(workoutPlan))
    } else {
      localStorage.removeItem(WORKOUT_PLAN_STORAGE_KEY)
    }
  }, [workoutPlan])

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

  const handleSaveWorkoutSchedule = (schedule: SavedWorkoutDay[]) => {
    setWorkoutSchedules([schedule])
  }

  const handleSaveMealSchedule = (schedule: SavedMealDay[]) => {
    setMealSchedules([schedule])
  }

  const handleDeleteWorkoutSchedule = (index: number) => {
    setWorkoutSchedules((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      if (updated.length === 0) {
        setWorkoutPlanData(null)
      }
      return updated
    })
  }

  const handleDeleteMealSchedule = (index: number) => {
    setMealSchedules((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      if (updated.length === 0) {
        setMealPlanData(null)
      }
      return updated
    })
  }

  // Wrapper to parse query param and pass a bodyPart to WorkoutVideos
  const currentWorkoutPlan: WeeklyWorkoutPlan | null = workoutPlan
    ?? (workoutSchedules.length > 0 ? mapSavedScheduleToPlan(workoutSchedules[0]) : null)

  const currentMealPlanData: MealPlanData | null = mealPlanData

  const hasSavedWorkoutSchedule = workoutSchedules.length > 0
  const hasSavedMealSchedule = mealSchedules.length > 0

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
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/userinfo" element={<UserInfoPage onBack={handleBack} />} />
      <Route path="/bmiresults" element={<BMIResultPage onBack={handleBack} />} />
      <Route path="/bmrresults" element={<BMRResultPage onBack={handleBack} />} />
      <Route path="/tdeeresults" element={<TDEEResultPage onBack={handleBack} />} />
      <Route path="/bmiviews" element={<BMIViewPage /> } />
      <Route path="/bmrviews" element={<BMRViewPage /> } />
      <Route path="/tdeeviews" element={<TDEEViewPage /> } />

      {/* Pages within MainLayout */}
      <Route element={<MainLayout currentPage={location.pathname} onNavigate={(path) => navigate(path)} onLogout={handleLogout} />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/alerts" element={<AlertPage />} />
        <Route path="/profile" element={<ProfilePage onBack={() => navigate('/home')} profileImage="https://api.dicebear.com/7.x/avataaars/svg?seed=default" onLogout={handleLogout} />} />
        <Route
          path="/meals"
          element={
            hasSavedMealSchedule && currentMealPlanData ? (
              <MealSchedule
                onBack={() => navigate('/home')}
                onSaveToSchedule={handleSaveMealSchedule}
                mealPlanData={currentMealPlanData}
              />
            ) : (
              <MealPlanner
                onBack={() => navigate('/home')}
                onGeneratePlan={(data) => {
                  setMealPlanData(data)
                  navigate('/meals/schedule')
                }}
              />
            )
          }
        />
        <Route
          path="/workouts"
          element={
            hasSavedWorkoutSchedule && currentWorkoutPlan ? (
              <WorkoutSchedule
                onBack={() => navigate('/home')}
                plan={currentWorkoutPlan}
                onSaveToSchedule={handleSaveWorkoutSchedule}
              />
            ) : (
              <WorkoutPlanner
                onBack={() => navigate('/home')}
                onGeneratePlan={(data) => {
                  setWorkoutPlanData(data)
                  navigate('/workouts/schedule')
                }}
              />
            )
          }
        />
        <Route
          path="/workouts/schedule"
          element={
            currentWorkoutPlan ? (
              <WorkoutSchedule
                onBack={() => navigate('/workouts')}
                plan={currentWorkoutPlan}
                onSaveToSchedule={handleSaveWorkoutSchedule}
              />
            ) : (
              <Navigate to="/workouts" replace />
            )
          }
        />
      
        <Route
          path="/meals/schedule"
          element={
            currentMealPlanData ? (
              <MealSchedule
                onBack={() => navigate('/meals')}
                onSaveToSchedule={handleSaveMealSchedule}
                mealPlanData={currentMealPlanData}
              />
            ) : (
              <Navigate to="/meals" replace />
            )
          }
        />
        <Route
          path="/schedule"
          element={
            <SchedulePage
              onBack={() => navigate('/home')}
              workoutSchedules={workoutSchedules}
              mealSchedules={mealSchedules}
              onDeleteWorkoutSchedule={handleDeleteWorkoutSchedule}
              onDeleteMealSchedule={handleDeleteMealSchedule}
            />
          }
        />
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