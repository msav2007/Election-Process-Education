import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/Card";
import { QuizCard } from "@/components/QuizCard";
import type { AdaptiveLearningPath, QuizResponse, TimelineStep } from "@/lib/types";


export function QuizView({
  activeStep,
  completedCount,
  timelineLength,
  eli10Enabled,
  quiz,
  loading,
  selectedAnswers,
  submitted,
  score,
  adaptivePath,
  highlighted,
  isLastStep,
  onSelect,
  onSubmit,
  onStart,
  onNextStep
}: {
  activeStep: TimelineStep;
  completedCount: number;
  timelineLength: number;
  eli10Enabled: boolean;
  quiz: QuizResponse | null;
  loading: boolean;
  selectedAnswers: Record<string, number>;
  submitted: boolean;
  score: number | null;
  adaptivePath: AdaptiveLearningPath | null;
  highlighted: boolean;
  isLastStep: boolean;
  onSelect: (questionId: string, optionIndex: number) => void;
  onSubmit: () => void;
  onStart: () => void;
  onNextStep: () => void;
}) {
  return (
    <div className="space-y-6">
      <Card className={`p-5 transition duration-200 ${highlighted ? "ring-4 ring-[#DBEAFE]" : ""}`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
              {highlighted ? "Demo step 4" : "Active topic"}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[#111827]">{activeStep.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">{activeStep.summary}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2563EB]">
              {eli10Enabled ? "ELI10 quiz mode" : "Standard quiz mode"}
            </span>
            <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
              <ShieldCheck className="h-5 w-5 text-[#3B82F6]" />
              <div>
                <p className="text-xs text-[#6B7280]">Completed topics</p>
                <p className="text-sm font-semibold text-[#111827]">
                  {completedCount}/{timelineLength}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <QuizCard
        quiz={quiz}
        loading={loading}
        selectedAnswers={selectedAnswers}
        submitted={submitted}
        score={score}
        adaptivePath={adaptivePath}
        highlighted={highlighted}
        isLastStep={isLastStep}
        onSelect={onSelect}
        onSubmit={onSubmit}
        onStart={onStart}
        onNextStep={onNextStep}
      />
    </div>
  );
}
