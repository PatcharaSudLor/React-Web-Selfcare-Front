import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import FirstPage from './components/pages/FirstPage'
import SignUpPage from './components/pages/SignUpPage'
import './App.css'
import { useNavigate } from 'react-router-dom'

function AppContent() {
  const navigate = useNavigate()

  const handleLogin = () => {
    // TODO: Implement login logic
    console.log('Login clicked')
  }

  const handleSignUp = () => {
    navigate('/signup')
  }

  const handleBack = () => {
    navigate('/')
  }

  return (
    <Routes>
      <Route path="/" element={<FirstPage onLogin={handleLogin} onSignUp={handleSignUp} />} />
      <Route path="/signup" element={<SignUpPage onBack={handleBack} onLogin={handleLogin} />} />
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
