import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
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
import MainLayout from './components/pages/layout/MainLayout'
import WorkoutVideos from './components/pages/WorkoutVideos'
import ProfilePage from './components/pages/ProfilePage'
import TipsPage from './components/pages/TipsPage'
import TipDetailPage from './components/pages/TipDetailPage'
import AlertPage from './components/pages/AlertPage'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'
import WorkoutPlanner from './components/pages/WorkoutPlanners'
import WorkoutSchedule from './components/pages/WorkoutSchedule'
import MealPlanner from './components/pages/MealPlanners'
import MealSchedule from './components/pages/MealSchedule'
import { SchedulePage } from './components/pages/SchedulePage'


function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogin = () => {
    navigate('/login')
  }

  const handleSignUp = () => {
    navigate('/signup')
  }

  const handleBack = () => {
    navigate(-1)
  }

  const handleLogout = () => {
    navigate('/')
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<FirstPage onLogin={handleLogin} onSignUp={handleSignUp} />} />
      <Route path="/signup" element={<SignUpPage onBack={handleBack} onLogin={handleLogin} />} />
      <Route path="/login" element={<LoginPage onBack={handleBack} onSignUp={handleSignUp} />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Setup routes — ครอบด้วย ProtectedRoute */}
      <Route path="/userinfo" element={<ProtectedRoute><UserInfoPage onBack={handleBack} /></ProtectedRoute>} />
      <Route path="/bmiresults" element={<ProtectedRoute><BMIResultPage onBack={handleBack} /></ProtectedRoute>} />
      <Route path="/bmrresults" element={<ProtectedRoute><BMRResultPage onBack={handleBack} /></ProtectedRoute>} />
      <Route path="/tdeeresults" element={<ProtectedRoute><TDEEResultPage onBack={handleBack} /></ProtectedRoute>} />
      <Route path="/bmiviews" element={<ProtectedRoute><BMIViewPage /></ProtectedRoute>} />
      <Route path="/bmrviews" element={<ProtectedRoute><BMRViewPage /></ProtectedRoute>} />
      <Route path="/tdeeviews" element={<ProtectedRoute><TDEEViewPage /></ProtectedRoute>} />

      {/* Main routes — ครอบ ProtectedRoute ครั้งเดียวรอบนอกสุด */}
      <Route element={
        <ProtectedRoute>
          <MainLayout currentPage={location.pathname} onNavigate={(path) => navigate(path)} onLogout={handleLogout} />
        </ProtectedRoute>
      }>
        <Route path="/home" element={<HomePage />} />
        <Route
          path="/workouts/planner"
          element={
            <WorkoutPlanner
              onBack={() => navigate(-1)}
              onGeneratePlan={(plan) =>
                navigate('/workouts/schedule', { state: { plan } })
              }
            />
          }
        />
        <Route
          path="/workouts/schedule"
          element={
            <WorkoutSchedule
              onBack={() => navigate('/workouts/planner')}
              plan={location.state?.plan}
              onSaveToSchedule={() => navigate('/schedule')}
            />
          }
        />
        <Route
          path="/meals/planner"
          element={
            <MealPlanner
              onBack={() => navigate(-1)}
              onGeneratePlan={(data) => navigate('/meals/schedule', { state: { mealPlanData: data } })}
            />
          }
        />
        <Route
          path="/meals/schedule"
          element={
            <MealSchedule
              onBack={() => navigate('/meals/planner')}
              mealPlanData={location.state?.mealPlanData}
              onSaveToSchedule={() => navigate('/schedule')}
            />
          }
        />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/alerts" element={<AlertPage />} />
        <Route path="/profile" element={<ProfilePage onBack={() => navigate('/home')} profileImage="https://api.dicebear.com/7.x/avataaars/svg?seed=default" onLogout={handleLogout} />} />
        <Route path="/workouts/videos" element={<WorkoutVideos />} />
        <Route path="/tips" element={<TipsPage />} />
<Route path="/tips/:id" element={<TipDetailPage />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </Router>
  )
}

export default App