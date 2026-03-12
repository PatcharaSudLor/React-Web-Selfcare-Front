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
            AI is generating your workout plan
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            This may take a few seconds
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-3 text-left">

          <div className="flex items-center gap-3 text-gray-600">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Analyzing your body type
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Creating weekly workout structure
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Optimizing exercises for your goal
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Finalizing your personalized plan
          </div>

        </div>

      </div>

    </div>
  )
}