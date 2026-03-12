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
  { key: 'high-protein', label: '💪 โปรตีนสูง' },
  { key: 'low-carb', label: '🥑 คาร์โบไฮเดรตต่ำ' },
  { key: 'low-fat', label: '💧 ไขมันต่ำ' },
  { key: 'low-calorie', label: '🔥 แคลอรี่ต่ำ' },
  { key: 'vegan', label: '🌱 วีแกน' },
  { key: 'vegetarian', label: '🥦 เวอร์จีเทเรียน' },
  { key: 'gluten-free', label: '🍚 ไม่มีกลูเตน' },
  { key: 'high-fiber', label: '🌾 ไฟเบอร์สูง' },
]

export const LIMIT = 15

export const DIFFICULTY_CONFIG = {
    Easy: { label: 'ง่าย', color: '#22c55e', bg: '#f0fdf4', dot: '#16a34a' },
    Medium: { label: 'ปานกลาง', color: '#f59e0b', bg: '#fffbeb', dot: '#d97706' },
    Hard: { label: 'ยาก', color: '#ef4444', bg: '#fef2f2', dot: '#dc2626' },
}