import { Loader2 } from "lucide-react"

export default function AiGenerating() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center space-y-4">

        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto" />

        <p className="text-lg font-semibold">
          AI is generating your workout plan...
        </p>

        <p className="text-sm text-gray-500">
          Analyzing your body type
        </p>

        <p className="text-sm text-gray-500">
          Creating weekly workout structure
        </p>

        <p className="text-sm text-gray-500">
          Optimizing exercises for your goal
        </p>

      </div>
    </div>
  )
}