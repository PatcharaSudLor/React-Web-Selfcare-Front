import { Loader2 } from "lucide-react"

export default function AiGenerating() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-white">

      <div className="bg-white shadow-xl rounded-2xl p-10 w-[420px] text-center space-y-6">

        {/* Spinner */}
        <div className="flex justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            AI กำลังสร้างแผนการออกกำลังกายของคุณ
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            อาจใช้เวลาสักครู่
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-3 text-left">

          <div className="flex items-center gap-3 text-gray-600">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            กำลังวิเคราะห์สรีระร่างกายของคุณ
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            กำลังจัดโครงสร้างตารางออกกำลังกายรายสัปดาห์
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            กำลังปรับการออกกำลังกายให้เหมาะกับเป้าหมายของคุณ
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            กำลังจัดทำแผนเฉพาะบุคคลของคุณให้เสร็จสมบูรณ์
          </div>

        </div>

      </div>

    </div>
  )
}