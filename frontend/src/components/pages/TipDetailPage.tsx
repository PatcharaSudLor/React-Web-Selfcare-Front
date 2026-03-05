import { useEffect, useState } from 'react'
import { ArrowLeft, Bookmark, Clock } from 'lucide-react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { supabase } from '../../utils/supabase'

export default function TipDetailPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const location = useLocation()
    const [tip, setTip] = useState<any>((location.state as any)?.tip ?? null)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [isLoading, setIsLoading] = useState(!tip)

    // fetch tip ถ้าไม่มีใน state (กรณี refresh)
    useEffect(() => {
        if (tip) return
        const fetchTip = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token
            if (!token) return
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tips/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) setTip(await res.json())
            setIsLoading(false)
        }
        fetchTip()
    }, [id])

    // check bookmark status
    useEffect(() => {
        if (!tip) return
        const checkBookmark = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token
            if (!token) return
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tips/bookmarks/list`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const bms = await res.json()
                setIsBookmarked(bms.some((b: any) => b.id === tip.id))
            }
        }
        checkBookmark()
    }, [tip])

    const toggleBookmark = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) return
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tips/bookmarks/toggle`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ tip_id: tip.id }),
        })
        if (res.ok) {
            const { bookmarked } = await res.json()
            setIsBookmarked(bookmarked)
        }
    }

    if (isLoading) return (
        <div className="max-w-3xl mx-auto px-4 py-6 animate-pulse">
            <div className="h-6 w-16 bg-gray-200 rounded mb-4" />
            <div className="aspect-video bg-gray-200 rounded-2xl mb-6" />
            <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-5/6" />
            </div>
        </div>
    )

    if (!tip) return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-emerald-600 mb-4">
                <ArrowLeft className="w-5 h-5" /> Back
            </button>
            <div className="p-6 bg-white rounded-2xl text-center">
                <p className="text-gray-500">ไม่พบเนื้อหาบทความ</p>
            </div>
        </div>
    )

    return (
    <div className="min-h-screen bg-gray-50 pb-24">
        <div className="max-w-3xl mx-auto px-4 py-6">

            {/* Back + Bookmark */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors group"
                >
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Back</span>
                </button>

                <button
                    onClick={toggleBookmark}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${
                        isBookmarked
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white text-gray-500 hover:text-gray-700 border border-gray-200'
                    }`}
                >
                    <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
                    {isBookmarked ? 'บุ๊กมาร์กแล้ว' : 'บุ๊กมาร์ก'}
                </button>
            </div>

            {/* Hero Image */}
            <div className="relative aspect-[16/9] overflow-hidden rounded-3xl mb-6 shadow-md">
                <img
                    src={tip.image_url}
                    alt={tip.title_th}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/600x338?text=No+Image' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* Category + time badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full font-medium border border-white/20">
                        {tip.category_th}
                    </span>
                    <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full flex items-center gap-1 border border-white/20">
                        <Clock className="w-3 h-3" />
                        {tip.read_time}
                    </span>
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h1 className="text-xl font-bold text-white leading-snug">{tip.title_th}</h1>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">

                {/* Intro */}
                <div className="p-6 pb-4 border-b border-gray-50">
                    <p className="text-gray-600 leading-relaxed text-sm">{tip.content.intro}</p>
                </div>

                {/* Sections */}
                <div className="p-6 space-y-0 divide-y divide-gray-50">
                    {tip.content.sections?.map((s: any, idx: number) => (
                        <div key={idx} className="py-5 first:pt-0 last:pb-0">
                            <div className="flex gap-4">
                                {/* Number indicator */}
                                <div className="w-7 h-7 bg-emerald-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-emerald-600">{idx + 1}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-gray-800 mb-1.5">{s.heading}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed">{s.text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Conclusion */}
                {tip.content.conclusion && (
                    <div className="mx-6 mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
                        <div className="flex gap-3">
                            <span className="text-lg shrink-0">💡</span>
                            <p className="text-sm text-emerald-800 leading-relaxed font-medium">{tip.content.conclusion}</p>
                        </div>
                    </div>
                )}

                {/* Tags */}
                {tip.tags?.length > 0 && (
                    <div className="px-6 pb-6 flex flex-wrap gap-2 border-t border-gray-50 pt-4">
                        {tip.tags.map((tag: string) => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-400 px-3 py-1 rounded-full">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

        </div>
    </div>
)
}