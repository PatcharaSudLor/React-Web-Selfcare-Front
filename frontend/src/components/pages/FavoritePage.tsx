import { ArrowLeft, BookmarkX, Clock, BookOpen, Play, TrendingUp, ChefHat, Flame } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'

interface Tip {
  id: string
  title_th: string
  category_th: string
  read_time: string
  image_url: string
  excerpt_th: string
  content: any
  tags: string[]
}

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
  difficulty: string
}

interface Recipe {
  id: string
  name: string
  name_th: string
  category_th: string
  cook_time: string
  calories: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  image_url: string
  rating: number
  servings: number
  healthy_tags: string[]
}

type TabType = 'all' | 'videos' | 'tips' | 'recipes'

const RECIPE_DIFFICULTY_CONFIG = {
  Easy: { label: 'ง่าย', color: '#22c55e', bg: '#f0fdf4' },
  Medium: { label: 'ปานกลาง', color: '#f59e0b', bg: '#fffbeb' },
  Hard: { label: 'ยาก', color: '#ef4444', bg: '#fef2f2' },
}

function getDifficultyLabel(difficulty: string) {
  switch (difficulty) {
    case 'beginner': return 'มือใหม่'
    case 'intermediate': return 'ปานกลาง'
    case 'advanced': return 'ขั้นสูง'
    default: return difficulty
  }
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-700'
    case 'intermediate': return 'bg-yellow-100 text-yellow-700'
    case 'advanced': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

function getYoutubeThumbnail(youtubeUrl: string) {
  const match = youtubeUrl.match(/[?&]v=([^&]+)/)
  if (!match) return 'https://via.placeholder.com/480x270?text=No+Image'
  return `https://i.ytimg.com/vi/${match[1]}/maxresdefault.jpg`
}

interface FavoritePageProps {
  onHome: () => void
}

export function FavoritePage({ onHome }: FavoritePageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [bookmarkedTips, setBookmarkedTips] = useState<Tip[]>([])
  const [bookmarkedVideos, setBookmarkedVideos] = useState<Video[]>([])
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBookmarks = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) { setIsLoading(false); return }

      const headers = { 'Authorization': `Bearer ${token}` }

      const [tipsRes, videosRes, recipesRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/tips/bookmarks/list`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/workout-videos/bookmarks/list`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/recipes/bookmarks/list`, { headers }),
      ])

      if (tipsRes.ok) setBookmarkedTips(await tipsRes.json())
      if (videosRes.ok) setBookmarkedVideos(await videosRes.json())
      if (recipesRes.ok) setBookmarkedRecipes(await recipesRes.json())

      setIsLoading(false)
    }
    fetchBookmarks()
  }, [])

  const removeTip = async (tipId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tips/bookmarks/toggle`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ tip_id: tipId }),
    })
    if (res.ok) setBookmarkedTips(prev => prev.filter(t => t.id !== tipId))
  }

  const removeVideo = async (videoId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workout-videos/bookmarks/toggle`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_id: videoId }),
    })
    if (res.ok) setBookmarkedVideos(prev => prev.filter(v => v.id !== videoId))
  }

  const removeRecipe = async (recipeId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes/bookmarks/toggle`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe_id: recipeId }),
    })
    if (res.ok) setBookmarkedRecipes(prev => prev.filter(r => r.id !== recipeId))
  }

  const hasNoFavorites = bookmarkedTips.length === 0 && bookmarkedVideos.length === 0 && bookmarkedRecipes.length === 0
  const showVideos = activeTab === 'all' || activeTab === 'videos'
  const showTips = activeTab === 'all' || activeTab === 'tips'
  const showRecipes = activeTab === 'all' || activeTab === 'recipes'
  const totalFavorites = bookmarkedVideos.length + bookmarkedTips.length + bookmarkedRecipes.length

  if (isLoading) return (
    <div className="container mx-auto px-4 py-6 max-w-4xl pb-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        <div className="space-y-1">
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse shadow-sm">
            <div className="aspect-video bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="mx-auto max-w-4xl px-4 pt-6">
        <div className=" mt-3">
          <button
            onClick={onHome}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">ย้อนกลับ</span>
          </button>
        </div>
      </div>


      <div className="container mx-auto px-4 py-6 max-w-4xl pb-24">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl text-gray-800">Favorite</h2>
          <p className="text-sm text-gray-600">รายการโปรดของคุณ ({totalFavorites} รายการ)</p>
        </div>

        {/* Tabs */}
        {!hasNoFavorites && (
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${activeTab === 'all' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              ทั้งหมด ({totalFavorites})
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm font-medium ${activeTab === 'videos' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <Play className="w-4 h-4" />
              วิดีโอ ({bookmarkedVideos.length})
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm font-medium ${activeTab === 'tips' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <BookOpen className="w-4 h-4" />
              บทความ ({bookmarkedTips.length})
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm font-medium ${activeTab === 'recipes' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <ChefHat className="w-4 h-4" />
              สูตรอาหาร ({bookmarkedRecipes.length})
            </button>
          </div>
        )}

        {/* Empty State */}
        {hasNoFavorites && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📌</div>
            <h3 className="text-xl text-gray-800 mb-2">ยังไม่มีรายการโปรด</h3>
            <p className="text-gray-600">กดไอคอนบุ๊คมาร์กที่วิดีโอ บทความ หรือสูตรอาหารที่คุณชอบ</p>
          </div>
        )}

        {activeTab === 'all' && !hasNoFavorites && (
          <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
            <p className="text-sm font-medium text-emerald-800">ทั้งหมด ({totalFavorites})</p>
            <p className="text-xs text-emerald-700/80">หน้านี้แสดงทั้งวิดีโอ บทความ และสูตรอาหารที่คุณบันทึกไว้</p>
          </div>
        )}

        {/* Videos Section */}
        {showVideos && bookmarkedVideos.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg text-gray-800 mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-600" fill="currentColor" />
              วิดีโอ ({bookmarkedVideos.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarkedVideos.map((video) => (
                <div key={video.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden group border border-gray-100">
                  <a href={video.youtube_url} target="_blank" rel="noopener noreferrer" className="relative block overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    <img
                      src={getYoutubeThumbnail(video.youtube_url)}
                      alt={video.title_th || video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement
                        if (img.src.includes('maxresdefault')) {
                          img.src = img.src.replace('maxresdefault', 'hqdefault')
                        } else {
                          img.src = 'https://via.placeholder.com/480x270?text=No+Image'
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all flex items-center justify-center">
                      <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all shadow-lg">
                        <Play className="w-4 h-4 text-emerald-600 ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${getDifficultyColor(video.difficulty)}`}>
                        {getDifficultyLabel(video.difficulty)}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-white flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {video.duration_minutes} นาที
                      </span>
                    </div>
                  </a>
                  <div className="p-4 pb-2">
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors">
                      {video.title_th || video.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      <TrendingUp className="w-3 h-3" />
                      <span>{getDifficultyLabel(video.difficulty)}</span>
                      {video.equipment?.includes('none') && (
                        <><span>·</span><span>🏠 ไม่ใช้อุปกรณ์</span></>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {video.goal_tags?.map(tag => (
                        <span key={tag} className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full font-medium">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="px-4 pb-4 mt-2">
                    <button onClick={() => removeVideo(video.id)} className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                      <BookmarkX className="w-4 h-4" />
                      ลบออกจากรายการโปรด
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips Section */}
        {showTips && bookmarkedTips.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              บทความ ({bookmarkedTips.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarkedTips.map((tip) => (
                <div key={tip.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden group">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={tip.image_url} alt={tip.title_th}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/600x338?text=No+Image' }}
                    />
                    <div className="absolute top-3 right-3">
                      <span className="bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-700">{tip.category_th}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{tip.read_time}</span>
                    </div>
                    <h3 className="text-base text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-2">{tip.title_th}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{tip.excerpt_th}</p>
                  </div>
                  <div className="px-4 pb-4">
                    <button onClick={() => removeTip(tip.id)} className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                      <BookmarkX className="w-4 h-4" />
                      ลบออกจากรายการโปรด
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recipes Section ── */}
        {showRecipes && bookmarkedRecipes.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg text-gray-800 mb-4 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-emerald-600" />
              สูตรอาหาร ({bookmarkedRecipes.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarkedRecipes.map((recipe) => {
                const diff = RECIPE_DIFFICULTY_CONFIG[recipe.difficulty] ?? { label: recipe.difficulty, color: '#6b7280', bg: '#f3f4f6' }
                return (
                  <div key={recipe.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden group border border-gray-100">
                    {/* Image */}
                    <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      <img
                        src={recipe.image_url} alt={recipe.name_th}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/480x270?text=No+Image' }}
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      {/* Difficulty badge */}
                      <div className="absolute top-2.5 right-2.5">
                        <span style={{ background: diff.bg, color: diff.color }} className="px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm">
                          {diff.label}
                        </span>
                      </div>
                      {/* Cook time badge */}
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-white flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {recipe.cook_time}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 pb-2">
                      <p className="text-xs text-gray-400 mb-0.5">{recipe.category_th}</p>
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors">
                        {recipe.name_th}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-400" />
                          {recipe.calories} cal
                        </span>
                        {recipe.healthy_tags?.slice(0, 2).map(tag => (
                          <span key={tag} className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">{tag}</span>
                        ))}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="px-4 pb-4 mt-2">
                      <button
                        onClick={() => removeRecipe(recipe.id)}
                        className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <BookmarkX className="w-4 h-4" />
                        ลบออกจากรายการโปรด
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}