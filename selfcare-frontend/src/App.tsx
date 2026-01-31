import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import type { UserInfoData } from './components/pages/UserInfoPage'
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
import './App.css'

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [userInfo, setUserInfo] = useState<UserInfoData | null>(null)
  const [mealPlanData, setMealPlanData] = useState<MealPlanData | null>(null)

  const handleLogin = () => {
    navigate('/login')
  }

  const handleSignUp = () => {
    navigate('/signup')
  }

  const handleBack = () => {
    navigate(-1)
  }

  const handleLoginSuccess = (email: string) => {
    console.log('Login successful:', email)
    navigate('/userinfo')
  }

  const handleConfirm = (data: UserInfoData) => {
    setUserInfo(data)
    navigate('/bmiresults')
  }


  const goToBMRResult = () => {
    navigate('/bmrresults')
  }

  const goToTDEEResult = (bmr: number) => {
    setUserInfo(prev => prev ? { ...prev, bmr } : prev);
    navigate('/tdeeresults');
  }

  const goToHome = (tdee: number) => {
    setUserInfo(prev => prev ? { ...prev, tdee } : prev);
    navigate('/home');
  };

  const handleLogout = () => {
    setUserInfo(null);
    navigate('/');
  }

  return (
    <Routes>
      <Route path="/" element={<FirstPage onLogin={handleLogin} onSignUp={handleSignUp} />} />
      <Route path="/signup" element={<SignUpPage onBack={handleBack} onLogin={handleLogin} />} />
      <Route path="/login" element={<LoginPage onBack={handleBack} onSignUp={handleSignUp} onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/userinfo" element={<UserInfoPage onBack={handleBack} onConfirm={handleConfirm} />} />
      <Route path="/bmiresults" element={<BMIResultPage onBack={handleBack} onBMRResult={goToBMRResult} bmi={userInfo?.bmi ?? 0} bmiCategory={userInfo?.bmiCategory ?? ''} height={userInfo?.height ?? '0'} weight={userInfo?.weight ?? '0'} />} />
      <Route path="/bmrresults" element={<BMRResultPage onBack={handleBack} onTDEEResult={goToTDEEResult} gender={userInfo?.gender || 'male'} height={userInfo?.height ?? '0'} weight={userInfo?.weight ?? '0'} age={userInfo?.age ?? '0'} />} />
      <Route path="/tdeeresults" element={<TDEEResultPage onBack={handleBack} onHome={goToHome} bmr={userInfo?.bmr ?? 0} />} />

      {/*Page within MainLayout*/}
      <Route element={<MainLayout currentPage={location.pathname} onNavigate={(path) => navigate(path)} onLogout={handleLogout}/>}>
        <Route path="/home" element={<HomePage username={userInfo?.username} bmi={userInfo?.bmi} bmr={userInfo?.bmr} tdee={userInfo?.tdee}
            onNavigateToBMI={() => navigate('/bmiresults')}
            onNavigateToBMR={() => navigate('/bmrresults')}
            onNavigateToTDEE={() => navigate('/tdeeresults')}
            onNavigateToWorkouts={() => navigate('/workouts')}
            onNavigateToMeals={() => navigate('/meals')}
            onNavigateToAssistant={() => navigate('/assistant')}
            onNavigateToFavorite={() => navigate('/favorite')}
            onNavigateToSchedule={() => navigate('/schedule')}
            onLogout={ handleLogout}
          />
        }
        />
        <Route path="/meals" element={<MealPlanner onBack={() => navigate('/home')} onGeneratePlan={(data) => { setMealPlanData(data); navigate('/meals/schedule'); }} />} />
        <Route path="/meals/schedule" element={<MealSchedule onBack={() => navigate('/meals')} onSaveToSchedule={(s) => { console.log('Saved schedule:', s); }} mealPlanData={mealPlanData ?? { likedMeals: [], allergicFoods: [], budget: '' }} />} />
      </Route>
    </Routes>
    
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
