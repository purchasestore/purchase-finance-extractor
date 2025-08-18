import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ProcessingProgressProps {
  stage: string
}

export function ProcessingProgress({ stage }: ProcessingProgressProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-xl animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 p-2">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
          <div>
            <div className="text-base font-semibold text-blue-800 mb-1">⚡ Processando...</div>
            <span className="text-sm font-medium text-blue-600">{stage}</span>
          </div>
        </div>
        
        {/* Progress bar animation */}
        <div className="mt-4 w-full bg-blue-200/50 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse" style={{width: '100%'}}></div>
        </div>
      </CardContent>
    </Card>
  )
}
