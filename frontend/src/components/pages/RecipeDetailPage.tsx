import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Bookmark, Clock, Users, Flame, ChefHat,
    CheckCircle2, Star, Soup, ShoppingBasket
} from 'lucide-react'
import { supabase } from '../../utils/supabase'

// ─── Types ───────────────────────────────────────────────────────────────────
interface Ingredient {
    item: string
    amount: string
}

interface Recipe {
    id: string
    name: string
    name_th: string
    category: string
    category_th: string
    cook_time: string
    cook_time_minutes: number
    difficulty: 'Easy' | 'Medium' | 'Hard'
    image_url: string
    calories: number
    servings: number
    rating: number
    review_count: number
    nutrition: { protein: number; carbs: number; fat: number }
    ingredients: Ingredient[]
    instructions: string[]
    healthy_tags: string[]
    goal_tags: string[]
}

const DIFFICULTY_CONFIG = {
    Easy: { label: 'ง่าย', color: '#22c55e', bg: '#f0fdf4', dot: '#16a34a' },
    Medium: { label: 'ปานกลาง', color: '#f59e0b', bg: '#fffbeb', dot: '#d97706' },
    Hard: { label: 'ยาก', color: '#ef4444', bg: '#fef2f2', dot: '#dc2626' },
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
    return (
        <div style={{ minHeight: '100vh', background: '#f8faf9' }}>
            <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
            {/* hero */}
            <div style={{ height: 380, background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[80, 50, 100, 60, 80].map((w, i) => (
                    <div key={i} style={{ height: 16, borderRadius: 8, width: `${w}%`, background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                ))}
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RecipeDetailPage() {
    const { id } = useParams<{ id: string }>()
    const location = useLocation()
    const navigate = useNavigate()

    const [recipe, setRecipe] = useState<Recipe | null>(location.state?.recipe ?? null)
    const [isLoading, setIsLoading] = useState(!recipe)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set())
    const [imgError, setImgError] = useState(false)
    const [activeTab, setActiveTab] = useState<'ingredients' | 'steps'>('ingredients')

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, []);

    // fallback fetch ถ้าไม่มี state (เช่น refresh หน้า)
    useEffect(() => {
        if (recipe) return
        const fetch_ = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token
            if (!token) { navigate('/recipes'); return }
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) setRecipe(await res.json())
            setIsLoading(false)
        }
        fetch_()
    }, [id])

    // check bookmark status
    useEffect(() => {
        if (!recipe) return
        const checkBM = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token
            if (!token) return
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes/bookmarks/list`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const bms = await res.json()
                setIsBookmarked(bms.some((r: Recipe) => r.id === recipe.id))
            }
        }
        checkBM()
    }, [recipe])

    const toggleBookmark = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token || !recipe) return
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes/bookmarks/toggle`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipe_id: recipe.id }),
        })
        if (res.ok) {
            const { bookmarked } = await res.json()
            setIsBookmarked(bookmarked)
        }
    }

    const toggleStep = (idx: number) => {
        setCheckedSteps(prev => {
            const next = new Set(prev)
            next.has(idx) ? next.delete(idx) : next.add(idx)
            return next
        })
    }

    if (isLoading) return <Skeleton />
    if (!recipe) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Soup style={{ width: 64, height: 64, color: '#d1fae5' }} />
            <p style={{ color: '#6b7280' }}>ไม่พบสูตรอาหาร</p>
            <button onClick={() => navigate('/recipes')} style={{ padding: '10px 24px', borderRadius: 12, border: 'none', background: '#059669', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                กลับหน้าสูตรอาหาร
            </button>
        </div>
    )

    const diff = DIFFICULTY_CONFIG[recipe.difficulty]
    const doneCount = checkedSteps.size
    const totalSteps = recipe.instructions?.length ?? 0
    const progress = totalSteps > 0 ? Math.round((doneCount / totalSteps) * 100) : 0

    return (
        <div style={{ minHeight: '100vh', background: '#f8faf9', paddingBottom: 80, marginTop: '10px' }}>
            <style>{`
                @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
                @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
            `}</style>

            {/* ── Hero Image ── */}
            <div style={{ position: 'relative', height: 380, overflow: 'hidden' }}>
                {!imgError ? (
                    <img
                        src={recipe.image_url} alt={recipe.name_th}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Soup style={{ width: 80, height: 80, color: '#a7f3d0' }} />
                    </div>
                )}
                {/* gradient overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        position: 'absolute', top: 20, left: 20, width: 40, height: 40, zIndex: 3,
                        background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.15)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
                >
                    <span style={{
                        width: 32, height: 32, borderRadius: '50%', background: '#ffffff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}>
                        <ArrowLeft style={{ width: 18, height: 18, color: '#374151' }} />
                    </span>
                </button>

                {/* Bookmark button (icon with circle behind) */}
                <button
                    onClick={toggleBookmark}
                    style={{
                        position: 'absolute', top: 20, right: 20, width: 40, height: 40, zIndex: 3,
                        background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.15)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
                >
                    <span style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: isBookmarked ? '#059669' : '#ffffff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}>
                        <Bookmark
                            style={{ width: 18, height: 18, color: isBookmarked ? '#fde047' : '#374151' }}
                            fill={isBookmarked ? '#fde047' : 'none'}
                        />
                    </span>
                </button>

                {/* Title overlay */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 28px', animation: 'fadeUp 0.5s ease' }}>
                    <p style={{ margin: '0 0 4px', fontSize: 25, color: 'rgba(255,255,255,0.75)' }}>{recipe.name}</p>
                    <h1 style={{ margin: 0, fontSize: 45, fontWeight: 800, color: '#fff', lineHeight: 1.25 }}>{recipe.name_th}</h1>

                    {/* Tags row */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                        <span style={{ background: diff.bg, color: diff.color, padding: '3px 10px', borderRadius: 99, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: diff.dot, display: 'inline-block' }} />
                            {diff.label}
                        </span>
                        <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', color: '#fff', padding: '3px 10px', borderRadius: 99, fontSize: 14 }}>
                            {recipe.category_th}
                        </span>
                        {recipe.healthy_tags?.slice(0, 3).map(tag => (
                            <span key={tag} style={{ background: 'rgba(5,150,105,0.75)', backdropFilter: 'blur(4px)', color: '#fff', padding: '3px 10px', borderRadius: 99, fontSize: 14, fontWeight: 500 }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px', animation: 'fadeUp 0.4s ease' }}>

                {/* ── Stats Row ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
                    {[
                        { icon: <Clock style={{ width: 22, height: 22, color: '#059669' }} />, label: 'เวลาทำ', value: recipe.cook_time },
                        { icon: <Users style={{ width: 22, height: 22, color: '#3b82f6' }} />, label: 'จำนวน', value: `${recipe.servings} ที่` },
                        { icon: <Flame style={{ width: 22, height: 22, color: '#f59e0b' }} />, label: 'แคลอรี่', value: `${recipe.calories} cal` },
                        { icon: <Star style={{ width: 22, height: 22, color: '#f59e0b' }} fill="#f59e0b" />, label: 'Rating', value: recipe.rating > 0 ? `${recipe.rating}/5` : 'N/A' },
                    ].map((s, i) => (
                        <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '14px 12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{s.icon}</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{s.value}</div>
                            <div style={{ fontSize: 16, color: '#9ca3af', marginTop: 2 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Nutrition Card ── */}
                <div style={{ background: '#fff', borderRadius: 20, padding: '20px 24px', marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <ChefHat style={{ width: 22, height: 22, color: '#059669' }} />
                        <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>โภชนาการต่อหนึ่งที่</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                        {[
                            { label: 'โปรตีน', value: recipe.nutrition?.protein ?? 0, unit: 'g', color: '#3b82f6', bg: '#eff6ff', bar: '#93c5fd' },
                            { label: 'คาร์โบไฮเดรต', value: recipe.nutrition?.carbs ?? 0, unit: 'g', color: '#f59e0b', bg: '#fffbeb', bar: '#fcd34d' },
                            { label: 'ไขมัน', value: recipe.nutrition?.fat ?? 0, unit: 'g', color: '#ef4444', bg: '#fef2f2', bar: '#fca5a5' },
                        ].map((n) => {
                            const total = (recipe.nutrition?.protein ?? 0) + (recipe.nutrition?.carbs ?? 0) + (recipe.nutrition?.fat ?? 0)
                            const pct = total > 0 ? Math.round((n.value / total) * 100) : 0
                            return (
                                <div key={n.label} style={{ background: n.bg, borderRadius: 14, padding: '14px 16px' }}>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: n.color }}>{n.value}<span style={{ fontSize: 13, fontWeight: 500 }}>{n.unit}</span></div>
                                    <div style={{ fontSize: 17, color: '#6b7280', marginTop: 2 }}>{n.label}</div>
                                    {/* mini bar */}
                                    <div style={{ height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 99, marginTop: 8, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: n.bar, borderRadius: 99, transition: 'width 0.8s ease' }} />
                                    </div>
                                    <div style={{ fontSize: 16, color: n.color, marginTop: 4, fontWeight: 600 }}>{pct}%</div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    {[
                        { key: 'ingredients', label: '🛒 วัตถุดิบ', count: recipe.ingredients?.length ?? 0 },
                        { key: 'steps', label: '📋 วิธีทำ', count: totalSteps },
                    ].map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key as 'ingredients' | 'steps')}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, border: '1.5px solid', borderColor: activeTab === t.key ? '#059669' : '#e5e7eb', background: activeTab === t.key ? '#059669' : '#fff', color: activeTab === t.key ? '#fff' : '#6b7280', cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.2s' }}>
                            {t.label}
                            <span style={{ background: activeTab === t.key ? 'rgba(255,255,255,0.25)' : '#f3f4f6', color: activeTab === t.key ? '#fff' : '#9ca3af', fontSize: 16, fontWeight: 700, padding: '1px 7px', borderRadius: 99 }}>
                                {t.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* ── Ingredients Tab ── */}
                {activeTab === 'ingredients' && (
                    <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ShoppingBasket style={{ width: 22, height: 22, color: '#059669' }} />
                            <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>วัตถุดิบทั้งหมด</span>
                            <span style={{ marginLeft: 'auto', fontSize: 16, color: '#9ca3af' }}>สำหรับ {recipe.servings} ที่</span>
                        </div>
                        <div>
                            {recipe.ingredients?.map((ing, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 20px', borderBottom: i < recipe.ingredients.length - 1 ? '1px solid #f9fafb' : 'none', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', flexShrink: 0 }} />
                                        <span style={{ fontSize: 17, color: '#374151' }}>{ing.item}</span>
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '3px 10px', borderRadius: 99 }}>
                                        {ing.amount}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Steps Tab ── */}
                {activeTab === 'steps' && (
                    <div>
                        {/* Progress bar */}
                        {totalSteps > 0 && (
                            <div style={{ background: '#fff', borderRadius: 16, padding: '14px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>ความคืบหน้า</span>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>{doneCount}/{totalSteps} ขั้นตอน ({progress}%)</span>
                                </div>
                                <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #059669, #34d399)', borderRadius: 99, transition: 'width 0.4s ease' }} />
                                </div>
                                {progress === 100 && (
                                    <div style={{ marginTop: 10, padding: '8px 12px', background: '#ecfdf5', borderRadius: 10, fontSize: 16, color: '#059669', fontWeight: 600, textAlign: 'center' }}>
                                        🎉 เสร็จแล้ว! สนุกกับมื้ออาหารนะ
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Steps list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {recipe.instructions?.map((step, i) => {
                                const done = checkedSteps.has(i)
                                return (
                                    <div key={i}
                                        onClick={() => toggleStep(i)}
                                        style={{ display: 'flex', gap: 16, padding: '18px 20px', background: done ? '#f0fdf4' : '#fff', borderRadius: 18, border: `1.5px solid ${done ? '#a7f3d0' : '#f3f4f6'}`, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                                        onMouseEnter={(e) => { if (!done) (e.currentTarget as HTMLDivElement).style.borderColor = '#d1fae5' }}
                                        onMouseLeave={(e) => { if (!done) (e.currentTarget as HTMLDivElement).style.borderColor = '#f3f4f6' }}
                                    >
                                        {/* Step number / check */}
                                        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                            {done
                                                ? <CheckCircle2 style={{ width: 31, height: 31, color: '#059669' }} />
                                                : <div style={{ width: 31, height: 31, borderRadius: '50%', background: '#f3f4f6', border: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ fontSize: 17, fontWeight: 700, color: '#9ca3af' }}>{i + 1}</span>
                                                </div>
                                            }
                                            {/* connector line */}
                                            {i < recipe.instructions.length - 1 && (
                                                <div style={{ width: 4, flex: 1, minHeight: 16, background: done ? '#a7f3d0' : '#f3f4f6', borderRadius: 99 }} />
                                            )}
                                        </div>

                                        {/* Step text */}
                                        <div style={{ flex: 1, paddingTop: 4 }}>
                                            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: done ? '#6b7280' : '#374151', textDecoration: done ? 'line-through' : 'none', transition: 'color 0.2s' }}>
                                                {step}
                                            </p>
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