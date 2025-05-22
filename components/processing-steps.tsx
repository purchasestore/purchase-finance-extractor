import { CheckCircle2, Circle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type ProcessingStep = {
  id: string
  label: string
  status: "pending" | "processing" | "completed"
}

interface ProcessingStepsProps {
  steps: ProcessingStep[]
  className?: string
}

export function ProcessingSteps({ steps, className }: ProcessingStepsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {steps.map((step) => (
        <div key={step.id} className="flex items-center gap-3">
          {step.status === "pending" && <Circle className="h-5 w-5 text-muted-foreground" />}
          {step.status === "processing" && <Loader2 className="h-5 w-5 text-primary animate-spin" />}
          {step.status === "completed" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          <span
            className={cn(
              "text-sm",
              step.status === "pending" && "text-muted-foreground",
              step.status === "processing" && "text-primary font-medium",
              step.status === "completed" && "text-green-500",
            )}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  )
}
