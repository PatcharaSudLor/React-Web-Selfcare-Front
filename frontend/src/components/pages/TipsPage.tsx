import { useState, useEffect } from 'react'
import { Search, Clock, Bookmark } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase'

interface Tip {
    id: string
    title: string
    title_th: string
    category: string
    category_th: string
    read_time: string
    image_url: string
    excerpt_th: string
    content: any
    tags: string[]
    goal_tags: string[]
}

const categories = [
    { id: 'All', name: 'ทั้งหมด' },
    { id: 'Workout', name: 'ออกกำลังกาย' },
    { id: 'Nutrition', name: 'โภชนาการ' },
    { id: 'Mental Health', name: 'สุขภาพจิต' },
    { id: 'Sleep', name: 'การนอนหลับ' },
    { id: 'Yoga', name: 'โยคะ' },
    { id: 'Hydration', name: 'การดื่มน้ำ' },
    { id: 'Wellness', name: 'การดูแลตัวเอง' },
]

export default function TipsPage() {
    const navigate = useNavigate()
    const [tips, setTips] = useState<Tip[]>([])
    const [recommendedTips, setRecommendedTips] = useState<Tip[]>([])
    const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [userGoal, setUserGoal] = useState('')

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token
            if (!token) return

            const headers = { 'Authorization': `Bearer ${token}` }

            // ดึง goal จาก workout preferences
            const prefRes = await fetch(`${import.meta.env.VITE_API_URL}/api/workout/preferences`, { headers })
            if (prefRes.ok) {
                const pref = await prefRes.json()
                setUserGoal(pref.goal ?? '')
            }

            // ดึง bookmarks
            const bmRes = await fetch(`${import.meta.env.VITE_API_URL}/api/tips/bookmarks/list`, { headers })
            if (bmRes.ok) {
                const bms = await bmRes.json()
                setBookmarkedIds(new Set(bms.map((t: Tip) => t.id)))
            }
        }
        init()
    }, [])

    useEffect(() => {
        fetchTips()
    }, [selectedCategory, searchQuery])

    // fetch recommended แยก เมื่อ userGoal พร้อม
    useEffect(() => {
        if (!userGoal) return
        const fetchRecommended = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token
            if (!token) return
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/tips?goal=${userGoal}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            )
            if (res.ok) {
                const data = await res.json()
                setRecommendedTips(data.slice(0, 3))
            }
        }
        fetchRecommended()
    }, [userGoal])

    const fetchTips = async () => {
        setIsLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) { setIsLoading(false); return }

        const params = new URLSearchParams()
        if (selectedCategory !== 'All') params.set('category', selectedCategory)
        if (searchQuery) params.set('search', searchQuery)

        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/tips?${params}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        if (res.ok) setTips(await res.json())
        setIsLoading(false)
    }

    const toggleBookmark = async (e: React.MouseEvent, tipId: string) => {
        e.stopPropagation()
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) return

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tips/bookmarks/toggle`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ tip_id: tipId }),
        })
        if (res.ok) {
            const { bookmarked } = await res.json()
            setBookmarkedIds(prev => {
                const next = new Set(prev)
                bookmarked ? next.add(tipId) : next.delete(tipId)
                return next
            })
        }
    }

    return (
    <div className="min-h-screen bg-gray-50 pb-16">
        <div className="max-w-6xl mx-auto px-6 py-8">

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-emerald-500 uppercase mb-2">Health & Wellness</p>
                        <h2 className="text-4xl font-bold text-gray-900 leading-none">Tips</h2>
                        <p className="text-gray-400 mt-2 text-sm">บทความรู้เพื่อสุขภาพที่ดีของคุณ</p>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-3xl font-bold text-gray-100">{tips.length}</p>
                        <p className="text-xs text-gray-400 -mt-1">บทความ</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาบทความ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 outline-none shadow-sm text-sm transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-xl leading-none"
                        >×</button>
                    )}
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-8">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all font-medium ${
                            selectedCategory === cat.id
                                ? 'bg-gray-900 text-white shadow-sm'
                                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Recommended Section */}
{selectedCategory === 'All' && !searchQuery && recommendedTips.length > 0 && (
    <div className="mb-10">
        <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-5 bg-emerald-500 rounded-full" />
            <h3 className="text-base font-semibold text-gray-800">แนะนำสำหรับคุณ</h3>
            <span className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-medium">
                {userGoal === 'lose' ? '🔥 ลดน้ำหนัก' : userGoal === 'gain' ? '💪 เพิ่มกล้าม' : '✨ รักษาสุขภาพ'}
            </span>
        </div>

        {/* Scroll container — เต็มความกว้างพอดี */}
        <div className="-mx-6 px-6">
            <div
                className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide"
                style={{ scrollPaddingLeft: '24px' }}
            >
                {recommendedTips.map((tip) => (
                    <div
                        key={tip.id}
                        className="relative rounded-2xl overflow-hidden cursor-pointer group snap-start shrink-0"
                        style={{ width: 'calc(85vw - 48px)', maxWidth: '340px', height: '200px' }}
                        onClick={() => navigate(`/tips/${tip.id}`, { state: { tip } })}
                    >
                        <img
                            src={tip.image_url}
                            alt={tip.title_th}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/600x338?text=No+Image' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Bookmark */}
                        <button
                            onClick={(e) => toggleBookmark(e, tip.id)}
                            className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center transition-all z-10"
                        >
                            <Bookmark
                                className="w-4 h-4 text-white"
                                fill={bookmarkedIds.has(tip.id) ? '#34d399' : 'none'}
                                stroke={bookmarkedIds.has(tip.id) ? '#34d399' : 'white'}
                            />
                        </button>

                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <span className="text-xs text-emerald-300 font-medium">{tip.category_th}</span>
                            <p className="text-white font-semibold text-sm mt-0.5 line-clamp-2">{tip.title_th}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Scroll dots indicator */}
            {recommendedTips.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                    {recommendedTips.map((_, i) => (
                        <div key={i} className={`rounded-full bg-gray-300 transition-all ${i === 0 ? 'w-4 h-1.5 bg-emerald-500' : 'w-1.5 h-1.5'}`} />
                    ))}
                </div>
            )}
        </div>

        <div className="border-t border-gray-200 mt-6 mb-2" />
    </div>
)}
            {/* Tips Grid */}
            {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse shadow-sm">
                            <div className="aspect-video bg-gray-200" />
                            <div className="p-4 space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-1/3" />
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-3 bg-gray-100 rounded w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : tips.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-gray-500 text-sm mb-2">ไม่พบบทความที่ตรงกับการค้นหา</p>
                    <button
                        onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}
                        className="text-xs text-emerald-600 hover:underline"
                    >
                        ล้างตัวกรอง
                    </button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {tips.map(tip => (
                        <div key={tip.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden group border border-gray-100">
                            <button onClick={() => navigate(`/tips/${tip.id}`, { state: { tip } })} className="w-full text-left">
                                <div className="relative w-full aspect-[16/9] overflow-hidden">
                                    <img
                                        src={tip.image_url}
                                        alt={tip.title_th}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/600x338?text=No+Image' }}
                                    />
                                    <div className="absolute top-2.5 left-2.5">
                                        <span className="text-xs bg-white/90 backdrop-blur-sm text-gray-600 px-2.5 py-1 rounded-full font-medium shadow-sm">
                                            {tip.category_th}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 pb-2">
                                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1.5 group-hover:text-emerald-600 transition-colors">
                                        {tip.title_th}
                                    </h3>
                                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{tip.excerpt_th}</p>
                                </div>
                            </button>
                            <div className="px-4 pb-4 flex items-center justify-between mt-1">
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{tip.read_time}</span>
                                </div>
                                <button
                                    onClick={(e) => toggleBookmark(e, tip.id)}
                                    className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    {bookmarkedIds.has(tip.id)
                                        ? <Bookmark className="w-4 h-4 text-emerald-500" fill="currentColor" />
                                        : <Bookmark className="w-4 h-4 text-gray-300 hover:text-gray-500" />
                                    }
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    </div>
)
}