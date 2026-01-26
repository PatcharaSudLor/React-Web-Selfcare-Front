import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-primary-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-primary-600 mb-4">
          Selfcare App 💚
        </h1>
        <p className="text-gray-600">
          ถ้าเห็นข้อความนี้เป็นสีเขียว แสดงว่า Tailwind ทำงานแล้ว!
        </p>
      </div>
    </div>
  )
}

export default App
