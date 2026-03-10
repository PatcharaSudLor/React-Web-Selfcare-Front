import { Star } from "lucide-react"

export default function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1,2,3,4,5].map((s)=>(
        <Star
          key={s}
          style={{
            width:12,
            height:12,
            fill: s <= Math.round(rating) ? '#f59e0b' : 'none',
            color: s <= Math.round(rating) ? '#f59e0b' : '#d1d5db'
          }}
        />
      ))}
      <span style={{ fontSize:12,color:'#6b7280',marginLeft:4 }}>
        {rating}
      </span>
    </div>
  )
}