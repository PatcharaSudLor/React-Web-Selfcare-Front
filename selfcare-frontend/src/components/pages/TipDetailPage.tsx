import { ArrowLeft } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { ImageWithFallback } from './figma/ImageWithFallback'

export default function TipDetailPage({ onBack }: { onBack: () => void }) {
  const loc = useLocation()
  const tip = (loc.state as any)?.tip

  if (!tip) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-4">
          <button onClick={onBack} className="flex items-center gap-2 text-emerald-600">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm text-center">
          <p className="text-gray-600">ไม่พบเนื้อหาบทความ</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl pb-24">
      <div className="mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-emerald-600">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl mb-4">
          <ImageWithFallback src={tip.image} alt={tip.titleTh} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h1 className="text-2xl font-semibold">{tip.titleTh}</h1>
            <p className="text-sm text-white/90">{tip.categoryTh} • {tip.readTime}</p>
          </div>
        </div>

        <div className="prose max-w-none text-gray-700">
          <p>{tip.content.intro}</p>
          {tip.content.sections.map((s: any, idx: number) => (
            <section key={idx} className="mb-4">
              <h3 className="font-semibold mb-2">{s.heading}</h3>
              <p>{s.text}</p>
            </section>
          ))}
          <p className="font-semibold">{tip.content.conclusion}</p>
        </div>
      </div>
    </div>
  )
}
