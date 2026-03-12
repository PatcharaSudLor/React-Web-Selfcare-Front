import { useState, useEffect, useCallback } from 'react';
import { Search, ChefHat, Filter, X, Soup, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import type { Recipe } from "../../types/recipe"
import { CATEGORIES, HEALTHY_TAGS, LIMIT } from "../../constants/recipeConstants"
import RecipeCard from "../../components/recipes/RecipeCard"
import Pagination from "../../components/recipes/Pagination"
import SkeletonCard from "../../components/recipes/SkeletonCard"


const SORT_OPTIONS = [
    { key: 'latest', label: 'ล่าสุด' },
    { key: 'rating', label: '⭐ Rating' },
    { key: 'calories', label: '🔥 Calories' },
    { key: 'cook_time', label: '⏱ Cook Time' },
    { key: 'difficulty', label: '📊 Difficulty' },
]


// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RecipePage() {
    const navigate = useNavigate()
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [difficultyFilter, setDifficultyFilter] = useState('all')
    const [healthyTagFilter, setHealthyTagFilter] = useState('all')
    const [sortBy, setSortBy] = useState('calories')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const bookmarkCount = bookmarkedIds.size
    const [debouncedSearch, setDebouncedSearch] = useState(search)

    // init — load bookmarks once
    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token
            if (!token) return
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes/bookmarks/list`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const bms = await res.json()
                setBookmarkedIds(new Set(bms.map((r: Recipe) => r.id)))
                setBookmarkedIds(new Set(bms.map((r: Recipe) => r.id)))
            }
        }
        init()
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
        }, 400)

        return () => clearTimeout(timer)
    }, [search])

    // fetch recipes
    const fetchRecipes = useCallback(async () => {
        setIsLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) { setIsLoading(false); return }

        const params = new URLSearchParams()
        if (categoryFilter !== 'all') params.set('category', categoryFilter)
        if (difficultyFilter !== 'all') params.set('difficulty', difficultyFilter)
        if (healthyTagFilter !== 'all') params.set('healthy_tag', healthyTagFilter)
        if (debouncedSearch) params.set('search', debouncedSearch)
        params.set('sort', sortBy)
        params.set('page', String(currentPage))
        params.set('limit', String(LIMIT))

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
            const json = await res.json()
            setRecipes(json.data ?? [])
            setTotalPages(json.totalPages ?? 1)
            setTotalCount(json.total ?? 0)
        }
        setIsLoading(false)
    }, [categoryFilter, difficultyFilter, healthyTagFilter, debouncedSearch, sortBy, currentPage])

    useEffect(() => { fetchRecipes() }, [fetchRecipes])

    // reset page when any filter changes
    useEffect(() => { setCurrentPage(1) }, [categoryFilter, difficultyFilter, healthyTagFilter, search, sortBy])

    const toggleBookmark = async (e: React.MouseEvent, recipeId: string) => {
        e.stopPropagation()
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) return

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes/bookmarks/toggle`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipe_id: recipeId }),
        })
        if (res.ok) {
            const { bookmarked } = await res.json()
            setBookmarkedIds(prev => {
                const next = new Set(prev)
                bookmarked ? next.add(recipeId) : next.delete(recipeId)
                return next
            })
        }
    }

    const hasActiveFilter = categoryFilter !== 'all' || difficultyFilter !== 'all' || healthyTagFilter !== 'all' || search !== ''

    const clearFilters = () => {
        setSearch(''); setCategoryFilter('all')
        setDifficultyFilter('all'); setHealthyTagFilter('all')
        setSortBy('latest'); setCurrentPage(1)
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8faf9', marginTop: 29}}>
            <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

            {/* ── Sticky Nav ── */}
            <div style={{ position: 'sticky', top: 64, zIndex: 40, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e5e7eb', padding: '0 40px' }}>
                <div style={{ maxWidth: 1920, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', gap: 24 }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #059669, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ChefHat style={{ width: 20, height: 20, color: '#fff' }} />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: 20, color: '#111827' }}>สูตรอาหาร</span>
                    </div>

                    {/* Search */}
                    <div style={{ flex: 1, maxWidth: 480, position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9ca3af' }} />
                        <input
                            type="text" placeholder="ค้นหาสูตรอาหาร..." value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', paddingLeft: 40, paddingRight: search ? 36 : 16, paddingTop: 9, paddingBottom: 9, border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 14, background: '#f9fafb', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#059669'; (e.target as HTMLInputElement).style.background = '#fff' }}
                            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'; (e.target as HTMLInputElement).style.background = '#f9fafb' }}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2 }}>
                                <X style={{ width: 14, height: 14 }} />
                            </button>
                        )}
                    </div>

                    {/* Sort */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <SlidersHorizontal style={{ width: 15, height: 15, color: '#9ca3af' }} />
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                            style={{ padding: '7px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#f9fafb', fontSize: 13, color: '#374151', cursor: 'pointer', outline: 'none' }}>
                            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                        </select>
                    </div>

                    {/* Stats */}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 20 }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#059669' }}>{totalCount}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af' }}>สูตรทั้งหมด</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#059669' }}>{bookmarkCount}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af' }}>บันทึกแล้ว</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div style={{ width: '100%', margin: '0 auto', padding: '12px 40px 32px' }}>
                <div style={{ display: 'flex', gap: 32 }}>

                    {/* ── Sidebar ── */}
                    <aside style={{ width: 220, flexShrink: 0 }}>

                        {/* Category */}
                        <div style={{ marginBottom: 28 }}>
                            <h4 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>หมวดหมู่</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {CATEGORIES.map((cat) => (
                                    <button key={cat.key} onClick={() => setCategoryFilter(cat.key)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left', background: categoryFilter === cat.key ? '#ecfdf5' : 'transparent', color: categoryFilter === cat.key ? '#059669' : '#374151', fontWeight: categoryFilter === cat.key ? 700 : 400, fontSize: 14, transition: 'background 0.15s' }}>
                                        <span style={{ display: 'flex', alignItems: 'center' }}>
                                            {typeof cat.icon === "string" && cat.icon.startsWith("data:image")
                                                ? <img src={cat.icon} alt="flag" style={{ width: 20, height: 14 }} />
                                                : typeof cat.icon === "string"
                                                    ? cat.icon
                                                    : <img src={cat.icon} alt="flag" style={{ width: 20, height: 14 }} />
                                            }
                                        </span>                                    {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Difficulty */}
                        <div style={{ marginBottom: 28 }}>
                            <h4 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>ระดับความยาก</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {[
                                    { key: 'all', label: 'ทั้งหมด', color: '#6b7280' },
                                    { key: 'Easy', label: 'ง่าย', color: '#22c55e' },
                                    { key: 'Medium', label: 'ปานกลาง', color: '#f59e0b' },
                                    { key: 'Hard', label: 'ยาก', color: '#ef4444' },
                                ].map((d) => (
                                    <button key={d.key} onClick={() => setDifficultyFilter(d.key)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left', background: difficultyFilter === d.key ? '#ecfdf5' : 'transparent', color: difficultyFilter === d.key ? '#059669' : '#374151', fontWeight: difficultyFilter === d.key ? 700 : 400, fontSize: 14, transition: 'background 0.15s' }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block', flexShrink: 0 }} />
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Healthy Tags */}
                        <div style={{ marginBottom: 28 }}>
                            <h4 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>สุขภาพ</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <button onClick={() => setHealthyTagFilter('all')}
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left', background: healthyTagFilter === 'all' ? '#ecfdf5' : 'transparent', color: healthyTagFilter === 'all' ? '#059669' : '#374151', fontWeight: healthyTagFilter === 'all' ? 700 : 400, fontSize: 14 }}>
                                    🍽️ ทั้งหมด
                                </button>
                                {HEALTHY_TAGS.map(tag => (
                                    <button key={tag.key} onClick={() => setHealthyTagFilter(tag.key)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left', background: healthyTagFilter === tag.key ? '#ecfdf5' : 'transparent', color: healthyTagFilter === tag.key ? '#059669' : '#374151', fontWeight: healthyTagFilter === tag.key ? 700 : 400, fontSize: 14, transition: 'background 0.15s' }}>
                                        {tag.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {hasActiveFilter && (
                            <button onClick={clearFilters}
                                style={{ width: '100%', padding: '9px 14px', borderRadius: 12, border: '1.5px dashed #d1d5db', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <X style={{ width: 14, height: 14 }} /> ล้างตัวกรอง
                            </button>
                        )}
                    </aside>

                    {/* ── Grid ── */}
                    <main style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Filter style={{ width: 16, height: 16, color: '#9ca3af' }} />
                                <span style={{ fontSize: 15, color: '#6b7280' }}>
                                    พบ <strong style={{ color: '#111827' }}>{totalCount}</strong> สูตรอาหาร
                                    {search && <span> สำหรับ "<strong>{search}</strong>"</span>}
                                </span>
                            </div>
                        </div>

                        {isLoading ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                                {Array.from({ length: LIMIT }).map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        ) : recipes.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', borderRadius: 20, border: '1px solid #f3f4f6' }}>
                                <Soup style={{ width: 56, height: 56, color: '#d1fae5', margin: '0 auto 16px' }} />
                                <p style={{ color: '#6b7280', fontSize: 18, margin: 0 }}>ไม่พบสูตรอาหารที่ค้นหา</p>
                                <p style={{ color: '#9ca3af', fontSize: 16, marginTop: 4 }}>ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
                                <button onClick={clearFilters} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 10, border: 'none', background: '#ecfdf5', color: '#059669', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                                    ล้างตัวกรองทั้งหมด
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                                {recipes.map((recipe) => (
                                    <RecipeCard
                                        key={recipe.id}
                                        recipe={recipe}
                                        isBookmarked={bookmarkedIds.has(recipe.id)}
                                        onSelect={() => navigate(`/recipes/${recipe.id}`, { state: { recipe } })}
                                        onToggleBookmark={(e) => toggleBookmark(e, recipe.id)}
                                    />
                                ))}
                            </div>
                        )}

                        {!isLoading && totalPages > 1 && (
                            <Pagination
                                current={currentPage}
                                total={totalPages}
                                onChange={setCurrentPage}
                            />
                        )}                    </main>
                </div>
            </div>
        </div>
    )
}