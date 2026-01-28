import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import FirstPage from './components/pages/FirstPage'
import SignUpPage from './components/pages/SignUpPage'
import LoginPage from './components/pages/LoginPage'
import UserInfoPage from './components/pages/UserInfoPage'
import './App.css'
import { useNavigate } from 'react-router-dom'

function AppContent() {
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate('/login')
  }

  const handleSignUp = () => {
    navigate('/signup')
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleLoginSuccess = (email: string) => {
    console.log('Login successful:', email)
    navigate('/userinfo')
  }

  const handleConfirm = () => {
    navigate('/bmiresults')
    }

  return (
    <Routes>
      <Route path="/" element={<FirstPage onLogin={handleLogin} onSignUp={handleSignUp} />} />
      <Route path="/signup" element={<SignUpPage onBack={handleBack} onLogin={handleLogin} />} />
      <Route path="/login" element={<LoginPage onBack={handleBack} onSignUp={handleSignUp} onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/userinfo" element={<UserInfoPage onBack={handleBack} onConfirm={handleConfirm}/>} />
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
