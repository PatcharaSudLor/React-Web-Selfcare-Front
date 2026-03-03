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
import { useAuthRedirect } from './utils/useAuthRedirect';
import './App.css'
import { useEffect, useState, useRef } from 'react'
import { supabase } from './utils/supabase'

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
const MEAL_PLAN_STORAGE_KEY = 'savedMealPlanData'

const DAY_CARD_COLOR_MAP: Record<string, string> = {
  Monday: 'border-yellow-200 bg-yellow-50',
  Tuesday: 'border-pink-200 bg-pink-50',
  Wednesday: 'border-green-200 bg-green-50',
  Thursday: 'border-orange-200 bg-orange-50',
  Friday: 'border-sky-200 bg-sky-50',
  Saturday: 'border-purple-200 bg-purple-50',
  Sunday: 'border-red-200 bg-red-50',
}

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
  const [authUserId, setAuthUserId] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const prevAuthUserIdRef = useRef<string | null | undefined>(undefined)
  
  useAuthRedirect();

  const resetUserScopedState = () => {
    setWorkoutSchedules([])
    setMealSchedules([])
    setWorkoutPlanData(null)
    setMealPlanData(null)
  }

  const getActiveUserId = async () => {
    if (authUserId) return authUserId
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      console.error('getActiveUserId error:', error)
      return null
    }
    return data.user?.id ?? null
  }

  useEffect(() => {
    let isMounted = true

    const syncUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (!isMounted) return

      if (error) {
        console.error('Failed to get user for storage scoping:', error)
      }

      setAuthUserId(data.user?.id ?? null)
      setAuthReady(true)
    }

    syncUser()

    const { data: listener } = supabase.auth.onAuthStateChange((event: import('@supabase/supabase-js').AuthChangeEvent, session: import('@supabase/supabase-js').Session | null) => {
      if (!isMounted) return

      setAuthUserId(session?.user?.id ?? null)
      setAuthReady(true)

      if (event === 'SIGNED_OUT') {
        resetUserScopedState()
      }
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])


  useEffect(() => {
    if (!authReady) return

    // Only reset when user actually changes (not just on initial load)
    const prevId = prevAuthUserIdRef.current
    const isUserChange = prevId !== undefined && prevId !== authUserId
    prevAuthUserIdRef.current = authUserId

    if (isUserChange) {
      resetUserScopedState()
    }

    // Clean up legacy unscoped keys to avoid accidental reuse
    localStorage.removeItem(WORKOUT_SCHEDULES_STORAGE_KEY)
    localStorage.removeItem(MEAL_SCHEDULES_STORAGE_KEY)
    localStorage.removeItem(MEAL_PLAN_STORAGE_KEY)
  }, [authReady, authUserId])

  useEffect(() => {
    if (!authReady) return

    const loadFromSupabase = async () => {
      const userId = await getActiveUserId()
      if (!userId) return

      try {
        const { data, error } = await supabase
          .from('workout_schedules')
          .select('*')
          .eq('user_id', userId)

        if (error) {
          console.error('Load workout_schedules error:', error)
          return
        }

        if (!data || data.length === 0) {
          console.log('Load workout_schedules: no rows for user', userId)
          return
        }

        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

        const mapped: SavedWorkoutDay[] = data
          .slice()
          .sort((a: Record<string, any>, b: Record<string, any>) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day))
          .map((item: Record<string, any>) => {
            const exercisesArray = Array.isArray(item.exercises) ? item.exercises : []

            const exercises = exercisesArray.map((ex: any) => {
              if (typeof ex === 'string') return ex
              if (ex && typeof ex === 'object' && ex.name) {
                const sets = ex.sets ?? '?'
                const reps = ex.reps ?? '?'
                return `${ex.name} (${sets} x ${reps})`
              }
              return 'Exercise'
            })

            const durationNumber = typeof item.duration === 'number' ? item.duration : Number(item.duration) || 0

            return {
              day: item.day,
              dayTh: item.day_th ?? item.day,
              workout: item.workout,
              duration: `${durationNumber} นาที`,
              exercises,
              color: DAY_CARD_COLOR_MAP[item.day] ?? 'border-gray-200 bg-gray-50',
            }
          })

        if (mapped.length > 0) {
          setWorkoutSchedules([mapped])
          setWorkoutPlanData(mapSavedScheduleToPlan(mapped))
        }
      } catch (err) {
        console.error('Unexpected error loading workout schedules:', err)
      }
    }

    loadFromSupabase()
  }, [authReady, authUserId])

  useEffect(() => {
    if (!authReady) return

    const loadMealsFromSupabase = async () => {
      const userId = await getActiveUserId()
      if (!userId) return

      try {
        const { data, error } = await supabase
          .from('meal_schedules')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        if (error) {
          console.error('Load meal_schedules error:', error)
          return
        }

        if (!data) {
          console.log('Load meal_schedules: no row for user', userId)
          return
        }

        if (Array.isArray(data.schedule)) {
          setMealSchedules([data.schedule])
        }

        if (data.plan) {
          setMealPlanData(data.plan as MealPlanData)
        }
      } catch (err) {
        console.error('Unexpected error loading meal schedules:', err)
      }
    }

    loadMealsFromSupabase()
  }, [authReady, authUserId])

  // Meal schedules now live in Supabase (no localStorage write)

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

  const handleSaveWorkoutSchedule = async (schedule: SavedWorkoutDay[]) => {
    console.log('handleSaveWorkoutSchedule called with days:', schedule.length)
    setWorkoutSchedules([schedule])

    const userId = await getActiveUserId()
    if (!userId) {
      console.error('Save workout_schedules error: missing userId')
      return
    }

    const payload = schedule.map((item) => ({
      user_id: userId,
      day: item.day,
      day_th: item.dayTh,
      workout: item.workout,
      duration: parseDurationToNumber(item.duration),
      exercises: item.exercises,
    }))

    try {
      const { error: delError } = await supabase
        .from('workout_schedules')
        .delete()
        .eq('user_id', userId)

      if (delError) {
        console.error('Delete workout_schedules error:', delError)
      }

      const { error: insError } = await supabase.from('workout_schedules').insert(payload)

      if (insError) {
        console.error('Save workout_schedules error:', insError)
      } else {
        console.log('Save workout_schedules success for user', userId)
      }
    } catch (err) {
      console.error('Unexpected save workout_schedules error:', err)
    }
  }

  const handleSaveMealSchedule = async (schedule: SavedMealDay[]) => {
    console.log('handleSaveMealSchedule called with days:', schedule.length)
    setMealSchedules([schedule])

    const userId = await getActiveUserId()
    if (!userId) {
      console.error('Save meal_schedules error: missing userId')
      return
    }

    const payload = {
      user_id: userId,
      schedule,
      plan: mealPlanData ?? null,
    }

    try {
      const { error } = await supabase
        .from('meal_schedules')
        .upsert(payload, { onConflict: 'user_id' })

      if (error) {
        console.error('Save meal_schedules error:', error)
      } else {
        console.log('Save meal_schedules success for user', userId)
      }
    } catch (err) {
      console.error('Unexpected save meal_schedules error:', err)
    }
  }

  const handleDeleteWorkoutSchedule = async (index: number) => {
    setWorkoutSchedules((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      if (updated.length === 0) {
        setWorkoutPlanData(null)
      }
      return updated
    })

    // Remove from Supabase so other sessions/devices stay in sync
    const userId = await getActiveUserId()
    if (!userId) return

    supabase
      .from('workout_schedules')
      .delete()
      .eq('user_id', userId)
      .then(({ error }: { error: any }) => {
        if (error) {
          console.error('Delete workout_schedules error:', error)
        }
      })
  }

  const handleDeleteMealSchedule = async (index: number) => {
    setMealSchedules((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      if (updated.length === 0) {
        setMealPlanData(null)
      }
      return updated
    })

    const userId = await getActiveUserId()
    if (!userId) return

    supabase
      .from('meal_schedules')
      .delete()
      .eq('user_id', userId)
      .then(({ error }: { error: any }) => {
        if (error) {
          console.error('Delete meal_schedules error:', error)
        }
      })

    if (authUserId) {
      supabase
        .from('meal_schedules')
        .delete()
        .eq('user_id', authUserId)
        .then(({ error }: { error: any }) => {
          if (error) {
            console.error('Delete meal_schedules error:', error)
          }
        })
    }
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

    return <WorkoutVideos bodyPart={bodyPart} onBack={() => nav('/home')} />
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
      <Route path="/bmiviews" element={<BMIViewPage />} />
      <Route path="/bmrviews" element={<BMRViewPage />} />
      <Route path="/tdeeviews" element={<TDEEViewPage />} />

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
                skipSupabasePersist
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
                skipSupabasePersist
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