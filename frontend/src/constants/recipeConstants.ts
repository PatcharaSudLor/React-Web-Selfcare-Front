import thaiFlag from "../assets/flags/thailand.svg"

export const CATEGORIES = [
  { key: 'all', label: 'ทั้งหมด', icon: '🍽️' },
  { key: 'Thai', label: 'อาหารไทย', icon: thaiFlag },
  { key: 'Healthy', label: 'อาหารสุขภาพ', icon: '🥗' },
  { key: 'Breakfast', label: 'อาหารเช้า', icon: '🍳' },
  { key: 'Grilled', label: 'อาหารย่าง', icon: '🔥' },
  { key: 'Soup', label: 'ซุป / ต้ม', icon: '🍲' },
]

export const HEALTHY_TAGS = [
  { key: 'high-protein', label: '💪 High Protein' },
  { key: 'low-carb', label: '🥑 Low Carb' },
  { key: 'low-fat', label: '💧 Low Fat' },
  { key: 'low-calorie', label: '🔥 Low Calorie' },
  { key: 'vegan', label: '🌱 Vegan' },
  { key: 'vegetarian', label: '🥦 Vegetarian' },
  { key: 'gluten-free', label: '🍚 Gluten Free' },
  { key: 'high-fiber', label: '🌾 High Fiber' },
]

export const LIMIT = 15

export const DIFFICULTY_CONFIG = {
    Easy: { label: 'ง่าย', color: '#22c55e', bg: '#f0fdf4', dot: '#16a34a' },
    Medium: { label: 'ปานกลาง', color: '#f59e0b', bg: '#fffbeb', dot: '#d97706' },
    Hard: { label: 'ยาก', color: '#ef4444', bg: '#fef2f2', dot: '#dc2626' },
}