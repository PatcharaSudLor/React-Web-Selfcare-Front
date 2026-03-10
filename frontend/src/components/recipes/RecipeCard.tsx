import { useState } from "react"
import {
    Clock,
    Users,
    Flame,
    ChevronRight,
    Soup
} from "lucide-react"
import { DIFFICULTY_CONFIG } from "../../constants/recipeConstants"
import StarRating from "./StarRating"
import type { Recipe } from "../../types/recipe"

// ─── Recipe Card ──────────────────────────────────────────────────────────────
function RecipeCard({ recipe, isBookmarked, onSelect, onToggleBookmark }: {
    recipe: Recipe
    isBookmarked: boolean
    onSelect: () => void
    onToggleBookmark: (e: React.MouseEvent) => void
}) {
    const [imgError, setImgError] = useState(false)
    const diff = DIFFICULTY_CONFIG[recipe.difficulty as keyof typeof DIFFICULTY_CONFIG]

    return (
        <div
            style={{
                background: '#fff', borderRadius: 20, overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f3f4f6',
                transition: 'box-shadow 0.2s, transform 0.2s',
                display: 'flex', flexDirection: 'column', cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.13)'
                    ; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'
                    ; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
            }}
            onClick={onSelect}
        >
            {/* Image */}
            <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
                {!imgError ? (
                    <img
                        src={recipe.image_url} alt={recipe.name_th}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                        onError={() => setImgError(true)}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.07)' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)' }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Soup style={{ width: 48, height: 48, color: '#d1fae5' }} />
                    </div>
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3) 100%)' }} />

                {/* Category badge */}
                <div style={{ position: 'absolute', top: 12, left: 12 }}>
                    <span style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 99, fontSize: 12, color: '#374151', fontWeight: 500 }}>
                        {recipe.category_th}
                    </span>
                </div>

                {/* Difficulty badge */}
                <div style={{ position: 'absolute', top: 12, right: 48, marginRight: 5 }}>
                    <span style={{ background: diff.bg, color: diff.color, padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: diff.dot, display: 'inline-block' }} />
                        {diff.label}
                    </span>
                </div>

                {/* Bookmark button */}
                <button
                    style={{
                        position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', zIndex: 3,
                        background: isBookmarked ? '#059669' : 'rgba(255,255,255,0.9)',
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(8px)', transition: 'background 0.2s, transform 0.15s',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                    onClick={(e) => { e.stopPropagation(); onToggleBookmark(e) }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.15)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={isBookmarked ? "#fff" : "none"}
                        stroke={isBookmarked ? "#fff" : "#374151"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z" />
                    </svg>
                </button>

                {/* Healthy tags */}
                {recipe.healthy_tags?.length > 0 && (
                    <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {recipe.healthy_tags.slice(0, 2).map(tag => (
                            <span key={tag} style={{ background: 'rgba(5,150,105,0.85)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, backdropFilter: 'blur(4px)' }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>{recipe.name_th}</h3>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>{recipe.name}</p>
                </div>

                {recipe.rating > 0 && <StarRating rating={recipe.rating} />}

                <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280', fontSize: 13 }}>
                        <Clock style={{ width: 14, height: 14, color: '#059669' }} />
                        {recipe.cook_time}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280', fontSize: 13 }}>
                        <Users style={{ width: 14, height: 14, color: '#059669' }} />
                        {recipe.servings} ที่
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280', fontSize: 13 }}>
                        <Flame style={{ width: 14, height: 14, color: '#f59e0b' }} />
                        {recipe.calories} cal
                    </div>
                </div>

                {/* Nutrition mini bar */}
                {recipe.nutrition && (
                    <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid #f9fafb' }}>
                        {[
                            { label: 'Protein', value: recipe.nutrition.protein, color: '#3b82f6' },
                            { label: 'Carbs', value: recipe.nutrition.carbs, color: '#f59e0b' },
                            { label: 'Fat', value: recipe.nutrition.fat, color: '#ef4444' },
                        ].map(n => (
                            <div key={n.label} style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: n.color }}>{n.value}g</div>
                                <div style={{ fontSize: 10, color: '#9ca3af' }}>{n.label}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ padding: '12px 16px', borderTop: '1px solid #f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' }}>
                <span style={{ fontSize: 13, color: '#059669', fontWeight: 600 }}>ดูสูตรอาหาร</span>
                <ChevronRight style={{ width: 16, height: 16, color: '#059669' }} />
            </div>
        </div>
    )
}
export default RecipeCard