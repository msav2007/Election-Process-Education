import { ArrowRight, CheckCircle2, MessageSquareText } from "lucide-react";
import { Card } from "@/components/Card";
import { TimelineStepper } from "@/components/TimelineStepper";
import type { TimelineStep } from "@/lib/types";


export function TimelineView({
  timeline,
  activeStep,
  activeStepId,
  completedSteps,
  nextStepTitle,
  onSelectStep,
  onOpenStepInChat,
  onNextStep
}: {
  timeline: TimelineStep[];
  activeStep: TimelineStep;
  activeStepId: string;
  completedSteps: string[];
  nextStepTitle: string | null;
  onSelectStep: (stepId: string) => void;
  onOpenStepInChat: (stepId: string) => void;
  onNextStep: () => void;
}) {
  return (
    <div className="space-y-6">
      <TimelineStepper
        steps={timeline}
        activeStepId={activeStepId}
        completedSteps={completedSteps}
        onSelectStep={onSelectStep}
      />

      <Card className="p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">Selected step</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#111827]">{activeStep.title}</h2>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2563EB]">
              Step {activeStep.order} of {timeline.length}
            </div>
            <p className="mt-3 text-sm leading-6 text-[#6B7280]">{activeStep.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {activeStep.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#111827]"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onOpenStepInChat(activeStepId)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] transition duration-200 hover:border-[#2563EB] hover:shadow-sm"
            >
              <MessageSquareText className="h-4 w-4 text-[#3B82F6]" />
              Ask copilot
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-[#E5E7EB] pt-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#111827]">
              {completedSteps.includes(activeStepId) ? "Completed step" : "Focus step"}
            </p>
            <p className="mt-1 text-sm text-[#6B7280]">
              {nextStepTitle ? `Next up: ${nextStepTitle}` : "This is the final step in the election journey."}
            </p>
          </div>
          <button
            type="button"
            onClick={onNextStep}
            className="inline-flex w-fit items-center gap-2 rounded-[10px] border border-[#2563EB] bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:brightness-110 hover:shadow-md"
          >
            {nextStepTitle ? "Next Step" : "Journey Completed"}
            {nextStepTitle ? <ArrowRight className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          </button>
        </div>
      </Card>
    </div>
  );
}
