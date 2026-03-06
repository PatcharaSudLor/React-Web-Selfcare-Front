import { useState, useEffect } from 'react'
import { Clock, TrendingUp, Play, X } from 'lucide-react'
import { useUser } from '../../contexts/UserContext'
import { supabase } from '../../utils/supabase'


interface Video {
  id: string
  title: string
  title_th: string
  description: string
  youtube_url: string
  thumbnail_url: string
  primary_category: string
  goal_tags: string[]
  equipment: string[]
  duration_minutes: number
  duration_range: string
  difficulty: string
}

const categories = [
  { id: 'for-you', label: '⭐ For You' },
  { id: 'all', label: '🔥 ทั้งหมด' },
  { id: 'full-body', label: '💪 Full Body' },
  { id: 'upper-body', label: '🙌 Upper Body' },
  { id: 'legs', label: '🦵 Legs' },
  { id: 'core', label: '🧱 Core & Abs' },
  { id: 'cardio', label: '❤️ Cardio' },
  { id: 'stretching', label: '🧘 Stretching' },
]

const goalFilters = [
  { id: 'fat-loss', label: '🔥 Fat Loss' },
  { id: 'muscle-gain', label: '💪 Muscle Gain' },
  { id: 'strength', label: '🧱 Strength' },
  { id: 'endurance', label: '❤️ Endurance' },
]

const difficultyFilters = [
  { id: 'beginner', label: 'มือใหม่' },
  { id: 'intermediate', label: 'ปานกลาง' },
  { id: 'advanced', label: 'ขั้นสูง' },
]

const equipmentFilters = [
  { id: 'none', label: '🏠 ไม่ใช้อุปกรณ์' },
  { id: 'dumbbell', label: '🏋️ ดัมเบล' },
  { id: 'resistance-band', label: '🔗 ยางยืด' },
  { id: 'machine', label: '⚙️ เครื่อง' },
]

const durationFilters = [
  { id: '10-15', label: '⏱ 10-15 นาที' },
  { id: '20-30', label: '⏱ 20-30 นาที' },
  { id: '45+', label: '⏱ 45+ นาที' },
]

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-700'
    case 'intermediate': return 'bg-yellow-100 text-yellow-700'
    case 'advanced': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

function getDifficultyLabel(difficulty: string) {
  switch (difficulty) {
    case 'beginner': return 'มือใหม่'
    case 'intermediate': return 'ปานกลาง'
    case 'advanced': return 'ขั้นสูง'
    default: return difficulty
  }
}

// function แปลง YouTube URL → thumbnail อัตโนมัติ
function getYoutubeThumbnail(youtubeUrl: string) {
  const match = youtubeUrl.match(/[?&]v=([^&]+)/)
  if (!match) return 'https://via.placeholder.com/480x270?text=No+Image'
  const videoId = match[1]
  // ลอง maxresdefault ก่อน ถ้าไม่มีจะ fallback เป็น hqdefault
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
}

// Map goal → goal_tags
function getGoalTags(goal: string): string[] {
  switch (goal) {
    case 'lose': return ['fat-loss', 'endurance']
    case 'gain': return ['muscle-gain', 'strength']
    case 'maintain': return ['fat-loss', 'muscle-gain', 'endurance']
    default: return []
  }
}

// Map body_type → goal_tags เพิ่มเติม
function getBodyTypeTags(bodyType: string): string[] {
  switch (bodyType) {
    case 'ectomorph': return ['muscle-gain', 'strength']
    case 'mesomorph': return ['fat-loss', 'muscle-gain']
    case 'endomorph': return ['fat-loss', 'endurance']
    default: return []
  }
}

export default function WorkoutVideos() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('for-you')
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [selectedDuration, setSelectedDuration] = useState<string[]>([])
  const [userGoal, setUserGoal] = useState('')
  const [userBodyType, setUserBodyType] = useState('')

  const { userInfo } = useUser()

  // fetch workout preferences
  useEffect(() => {
    const fetchUserPrefs = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workout/preferences`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUserGoal(data.goal ?? '')
        setUserBodyType(data.bodyType ?? '')
      }
    }
    fetchUserPrefs()
  }, [])

  useEffect(() => {
    if (activeCategory === 'for-you' && recommendedTags.length === 0) {
      setIsLoading(false)
      return
    }
    fetchVideos()
  }, [activeCategory, selectedGoals, selectedDifficulty, selectedEquipment, selectedDuration, userGoal, userBodyType])

  const fetchVideos = async () => {
    setIsLoading(true)
    const params = new URLSearchParams()

    if (activeCategory === 'for-you') {
      // ส่ง goal tags ของ user ไป filter
      if (recommendedTags.length > 0) {
        params.set('goal', recommendedTags.join(','))
      }
    } else {
      if (activeCategory !== 'all') params.set('category', activeCategory)
    }

    if (selectedGoals.length > 0) params.set('goal', selectedGoals.join(','))
    if (selectedDifficulty.length > 0) params.set('difficulty', selectedDifficulty.join(','))
    if (selectedEquipment.length > 0) params.set('equipment', selectedEquipment.join(','))
    if (selectedDuration.length > 0) params.set('duration', selectedDuration.join(','))

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workout-videos?${params}`)
    if (res.ok) {
      const data = await res.json()
      setVideos(data)
    }
    setIsLoading(false)
  }

  const toggleFilter = (value: string, selected: string[], setSelected: (v: string[]) => void) => {
    setSelected(selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value]
    )
  }

  const clearFilters = () => {
    setActiveCategory('for-you')
    setSelectedGoals([])
    setSelectedDifficulty([])
    setSelectedEquipment([])
    setSelectedDuration([])
  }

  const hasActiveFilters = activeCategory !== 'for-you' ||
    selectedGoals.length > 0 ||
    selectedDifficulty.length > 0 ||
    selectedEquipment.length > 0 ||
    selectedDuration.length > 0

  const FilterChip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${active
        ? 'bg-emerald-500 text-white shadow-sm'
        : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300'
        }`}
    >
      {label}
    </button>
  )

  // รวม tags จาก goal + body_type ไม่ซ้ำกัน
  const recommendedTags = Array.from(new Set([
    ...getGoalTags(userGoal),
    ...getBodyTypeTags(userBodyType),
  ]))

  const isRecommended = (video: Video) =>
    recommendedTags.length > 0 &&
    video.goal_tags?.some(tag => recommendedTags.includes(tag))

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-12">
      <div className="max-w-6xl mx-auto px-6">

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 space-y-3">

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map(cat => (
              <FilterChip
                key={cat.id}
                label={cat.label}
                active={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
              />
            ))}
          </div>

          <div className="border-t border-gray-100" />

          {/* Goal Row */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide items-center">
            <span className="text-xs font-medium text-gray-400 whitespace-nowrap w-16 shrink-0">เป้าหมาย</span>
            {goalFilters.map(f => (
              <FilterChip key={f.id} label={f.label}
                active={selectedGoals.includes(f.id)}
                onClick={() => toggleFilter(f.id, selectedGoals, setSelectedGoals)} />
            ))}
          </div>

          {/* Level Row */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide items-center">
            <span className="text-xs font-medium text-gray-400 whitespace-nowrap w-16 shrink-0">ระดับ</span>
            {difficultyFilters.map(f => (
              <FilterChip key={f.id} label={f.label}
                active={selectedDifficulty.includes(f.id)}
                onClick={() => toggleFilter(f.id, selectedDifficulty, setSelectedDifficulty)} />
            ))}
            <div className="w-px h-5 bg-gray-200 shrink-0 mx-1" />
            <span className="text-xs font-medium text-gray-400 whitespace-nowrap shrink-0">อุปกรณ์</span>
            {equipmentFilters.map(f => (
              <FilterChip key={f.id} label={f.label}
                active={selectedEquipment.includes(f.id)}
                onClick={() => toggleFilter(f.id, selectedEquipment, setSelectedEquipment)} />
            ))}
          </div>

          {/* Duration Row */}
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-xs font-medium text-gray-400 whitespace-nowrap w-16 shrink-0">เวลา</span>
            {durationFilters.map(f => (
              <FilterChip key={f.id} label={f.label}
                active={selectedDuration.includes(f.id)}
                onClick={() => toggleFilter(f.id, selectedDuration, setSelectedDuration)} />
            ))}
          </div>

          {/* Active filter summary */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
              <p className="text-xs text-gray-400">พบ <span className="font-semibold text-emerald-600">{videos.length}</span> วิดีโอ</p>
              <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                <X className="w-3 h-3" /> ล้างตัวกรอง
              </button>
            </div>
          )}
        </div>

        {/* For You Banner */}
        {activeCategory === 'for-you' && userGoal && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 mb-6 text-white">
            <p className="text-sm font-semibold mb-1">⭐ แนะนำสำหรับคุณ</p>
            <p className="text-xs opacity-90">
              จาก Body Type: <span className="font-medium capitalize">{userBodyType}</span>
              {' · '}
              เป้าหมาย: <span className="font-medium">
                {userGoal === 'lose' ? 'ลดน้ำหนัก'
                  : userGoal === 'gain' ? 'เพิ่มกล้าม'
                    : 'รักษาสุขภาพ'}
              </span>
            </p>
          </div>
        )}

        {/* Video Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse shadow-sm">
                <div className="aspect-video bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded-full w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                  <div className="h-3 bg-gray-100 rounded-full w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 mb-3">ไม่พบวิดีโอที่ตรงกับตัวกรอง</p>
            <button onClick={clearFilters} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map(video => (
              <div key={video.id} className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border group ${isRecommended(video)
                ? 'border-emerald-400 ring-2 ring-emerald-100'  // ✅ highlight
                : 'border-gray-100'
                }`}>
                {/* Thumbnail */}
                <a href={video.youtube_url} target="_blank" rel="noopener noreferrer"
                  className="relative block overflow-hidden" style={{ aspectRatio: '16/9' }}>

                  {/* ✅ For You badge */}
                  {isRecommended(video) && activeCategory !== 'for-you' && (
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-sm">
                        ⭐ For You
                      </span>
                    </div>
                  )}

                  <img
                    src={getYoutubeThumbnail(video.youtube_url)}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement
                      // ถ้า maxresdefault ไม่มี fallback เป็น hqdefault
                      if (img.src.includes('maxresdefault')) {
                        img.src = img.src.replace('maxresdefault', 'hqdefault')
                      } else {
                        img.src = 'https://via.placeholder.com/480x270?text=No+Image'
                      }
                    }}
                  />
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all flex items-center justify-center">
                    <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all shadow-lg">
                      <Play className="w-4 h-4 text-emerald-600 ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                  {/* Difficulty badge */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${getDifficultyColor(video.difficulty)}`}>
                      {getDifficultyLabel(video.difficulty)}
                    </span>
                  </div>
                  {/* Duration badge */}
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-white flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {video.duration_minutes} นาที
                    </span>
                  </div>
                </a>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 leading-snug group-hover:text-emerald-600 transition-colors">
                    {video.title_th || video.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    <TrendingUp className="w-3 h-3" />
                    <span>{getDifficultyLabel(video.difficulty)}</span>
                    {video.equipment?.includes('none') && (
                      <>
                        <span>·</span>
                        <span>🏠 ไม่ใช้อุปกรณ์</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                    {video.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {video.goal_tags?.map(tag => (
                      <span key={tag} className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}