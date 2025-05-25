import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ProcessingProgressProps {
  stage: string
}

export function ProcessingProgress({ stage }: ProcessingProgressProps) {
  return (
    <Card className="animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium">{stage}</span>
        </div>
      </CardContent>
    </Card>
  )
}
