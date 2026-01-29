import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import type { UserInfoData } from './components/pages/UserInfoPage'
import FirstPage from './components/pages/FirstPage'
import SignUpPage from './components/pages/SignUpPage'
import LoginPage from './components/pages/LoginPage'
import UserInfoPage from './components/pages/UserInfoPage'
import BMIResultPage from './components/pages/BMIResultPage'
import './App.css'
import { useNavigate } from 'react-router-dom'

function AppContent() {
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState<UserInfoData | null>(null)

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

  return (
    <Routes>
      <Route path="/" element={<FirstPage onLogin={handleLogin} onSignUp={handleSignUp} />} />
      <Route path="/signup" element={<SignUpPage onBack={handleBack} onLogin={handleLogin} />} />
      <Route path="/login" element={<LoginPage onBack={handleBack} onSignUp={handleSignUp} onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/userinfo" element={<UserInfoPage onBack={handleBack} onConfirm={handleConfirm}/>} />
      <Route path="/bmiresults" element={<BMIResultPage onBack={handleBack} onNext={() => console.log('Continue from BMI results')} bmi={userInfo?.bmi ?? 0} bmiCategory={userInfo?.bmiCategory ?? ''} height={userInfo?.height ?? '0'} weight={userInfo?.weight ?? '0'} />} />
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
