import { useState, useEffect } from 'react'
import { Search, Clock, Bookmark, Sparkles, SlidersHorizontal, ArrowRight, ArrowLeft } from 'lucide-react'
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
    const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [debouncedSearch, setDebouncedSearch] = useState('')

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token
            if (!token) return

            const headers = { 'Authorization': `Bearer ${token}` }

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
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
        }, 400)
        return () => clearTimeout(timer)
    }, [searchQuery])

    useEffect(() => {
        fetchTips()
    }, [selectedCategory, debouncedSearch])

    const fetchTips = async () => {
        setIsLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) { setIsLoading(false); return }

        const params = new URLSearchParams()
        if (selectedCategory !== 'All') params.set('category', selectedCategory)
        if (debouncedSearch) params.set('search', debouncedSearch)

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

    const featuredTip = tips[0]

    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,_#d7f6ef,_#f5f7fb_45%,_#eef2ff_100%)] pb-16">
            <div className="pointer-events-none absolute -left-16 top-8 h-44 w-44 rounded-full bg-emerald-300/30 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-cyan-300/25 blur-3xl" />

            <div className="relative mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
                <div className="mb-3 mt-2">
                    <button
                        onClick={() => navigate('/home')}
                        className="flex items-center gap-2 text-emerald-600 transition-colors hover:text-emerald-700"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="text-sm font-medium">ย้อนกลับ</span>
                    </button>
                </div>

                <section className="mb-7 overflow-hidden rounded-3xl border border-white/70 bg-white/65 p-4 shadow-[0_20px_48px_-30px_rgba(15,23,42,0.35)] backdrop-blur md:p-6">
                    <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr] lg:items-stretch">
                        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-white/75 p-4 sm:p-5">
                            <div>
                                <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                    <Sparkles className="h-3 w-3" />
                                    Daily Wellness Journal
                                </p>
                                <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                                    Tips ที่อ่านง่ายและใช้งานได้จริง
                                </h1>
                                <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">
                                    คัดเนื้อหาเพื่อช่วยให้คุณเริ่มดูแลตัวเองได้ทันที ทั้งโภชนาการ การออกกำลังกาย และสุขภาพใจ
                                </p>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                                    บทความ {tips.length} รายการ
                                </span>
                            </div>
                        </div>

                        {featuredTip ? (
                            <article
                                className="group relative min-h-[220px] cursor-pointer overflow-hidden rounded-2xl border border-white/70"
                                onClick={() => navigate(`/tips/${featuredTip.id}`, { state: { tip: featuredTip } })}
                            >
                                <img
                                    src={featuredTip.image_url}
                                    alt={featuredTip.title_th}
                                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/600x338?text=No+Image' }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/25 to-transparent" />

                                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur">
                                    Featured Tip
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                                    <p className="text-[11px] font-medium text-emerald-200">{featuredTip.category_th}</p>
                                    <h2 className="mt-1 line-clamp-2 text-base font-semibold leading-6 text-white sm:text-lg">
                                        {featuredTip.title_th}
                                    </h2>
                                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-200">
                                        เปิดอ่านบทความ
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </p>
                                </div>
                            </article>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-500">
                                ยังไม่มีบทความแนะนำในตอนนี้
                            </div>
                        )}
                    </div>
                </section>

                <section className="mb-8 rounded-3xl border border-white/80 bg-white/75 p-4 shadow-[0_16px_45px_-32px_rgba(15,23,42,0.45)] backdrop-blur sm:p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-700">ค้นหาและกรองบทความ</p>
                        <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            Filter
                        </p>
                    </div>

                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="ค้นหาบทความที่อยากอ่าน..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-700 shadow-inner outline-none transition-all placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-lg leading-none text-slate-300 transition hover:text-slate-600"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all ${selectedCategory === cat.id
                                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </section>

                {isLoading ? (
                    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="overflow-hidden rounded-2xl border border-slate-100 bg-white animate-pulse">
                                <div className="aspect-video bg-slate-200" />
                                <div className="space-y-2 p-4">
                                    <div className="h-3 w-1/3 rounded bg-slate-200" />
                                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                                    <div className="h-3 w-full rounded bg-slate-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : tips.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 py-20 text-center">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                            <Search className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="mb-2 text-sm text-slate-500">ไม่พบบทความที่ตรงกับการค้นหา</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}
                            className="text-xs font-medium text-emerald-600 hover:underline"
                        >
                            ล้างตัวกรอง
                        </button>
                    </div>
                ) : (
                    <section>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">บทความทั้งหมด</h2>
                            <p className="text-xs text-slate-500">คลิกการ์ดเพื่ออ่านรายละเอียด</p>
                        </div>

                        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                            {tips.map(tip => (
                                <article key={tip.id} className="group flex min-h-[580px] h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_35px_-24px_rgba(15,23,42,0.8)] transition-all hover:-translate-y-1 hover:shadow-[0_22px_45px_-22px_rgba(15,23,42,0.55)]">
                                    <button onClick={() => navigate(`/tips/${tip.id}`, { state: { tip } })} className="flex w-full flex-1 flex-col text-left">
                                        <div className="relative w-full aspect-[5/4] overflow-hidden">
                                            <img
                                                src={tip.image_url}
                                                alt={tip.title_th}
                                                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/600x338?text=No+Image' }}
                                            />
                                            <div className="absolute left-2.5 top-2.5">
                                                <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm">
                                                    {tip.category_th}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1 p-5 pb-3">
                                            <h3 className="mb-2 line-clamp-2 text-base font-semibold text-slate-800 transition-colors group-hover:text-emerald-600">
                                                {tip.title_th}
                                            </h3>
                                            <p className="line-clamp-3 text-sm leading-relaxed text-slate-500">{tip.excerpt_th}</p>
                                        </div>
                                    </button>
                                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 px-5 pt-4 pb-5">
                                        <div className="flex items-center gap-1 text-xs text-slate-400">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>{tip.read_time}</span>
                                        </div>
                                        <button
                                            onClick={(e) => toggleBookmark(e, tip.id)}
                                            className="rounded-lg p-1.5 transition-colors hover:bg-slate-50"
                                        >
                                            {bookmarkedIds.has(tip.id)
                                                ? <Bookmark className="h-4 w-4 text-emerald-500" fill="currentColor" />
                                                : <Bookmark className="h-4 w-4 text-slate-300 hover:text-slate-500" />
                                            }
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/tips/${tip.id}`, { state: { tip } })}
                                        className="flex w-full items-center justify-between border-t border-slate-100 px-5 py-3.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                                    >
                                        อ่านต่อ
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </div>
    )
}