import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
//import App from './App.tsx'
import FirstPage from './components/pages/FirstPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirstPage onLogin={() => console.log('Login')} onSignUp={() => console.log('Sign Up')} />
  </StrictMode>,
)