// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #f3f4f6' }}>
            <div style={{ aspectRatio: '4/3', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ height: 16, background: '#f0f0f0', borderRadius: 8, width: '70%' }} />
                <div style={{ height: 12, background: '#f0f0f0', borderRadius: 8, width: '40%' }} />
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ height: 12, background: '#f0f0f0', borderRadius: 8, width: 60 }} />
                    <div style={{ height: 12, background: '#f0f0f0', borderRadius: 8, width: 40 }} />
                    <div style={{ height: 12, background: '#f0f0f0', borderRadius: 8, width: 60 }} />
                </div>
            </div>
        </div>
    )
}
export default SkeletonCard