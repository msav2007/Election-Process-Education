import type { KeyboardEvent } from "react";
import { TimelineStep } from "@/components/TimelineStep";
import type { TimelineStep as TimelineStepType } from "@/lib/types";

export function TimelineStepper({
  steps,
  activeStepId,
  completedSteps,
  onSelectStep
}: {
  steps: TimelineStepType[];
  activeStepId: string;
  completedSteps: string[];
  onSelectStep: (stepId: string) => void;
}) {
  const completedSet = new Set(completedSteps);
  const activeIndex = steps.findIndex((step) => step.id === activeStepId);
  const completionPercent = steps.length ? Math.round((completedSet.size / steps.length) * 100) : 0;

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = Math.min(Math.max(activeIndex + direction, 0), steps.length - 1);
    const nextStep = steps[nextIndex];
    if (nextStep) onSelectStep(nextStep.id);
  }

  return (
    <section
      id="timeline"
      className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm"
      onKeyDown={handleKeyDown}
      aria-label="Election timeline"
      tabIndex={0}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">Timeline</p>
          <h2 className="mt-2 text-xl font-semibold text-[#111827]">From registration to results</h2>
        </div>
        <div className="w-full max-w-xl">
          <div className="flex items-center justify-between text-sm">
            <p className="text-[#6B7280]">Move step by step or jump where you need context right now.</p>
            <span className="font-semibold text-[#111827]">{completionPercent}% done</span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#E5E7EB]">
            <div className="h-full rounded-full bg-[#2563EB] transition-all duration-500" style={{ width: `${completionPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto pb-1">
        <div className="grid min-w-[940px] gap-3" style={{ gridTemplateColumns: `repeat(${steps.length || 1}, minmax(0, 1fr))` }}>
          {steps.map((step, index) => (
            <TimelineStep
              key={step.id}
              step={step}
              active={activeStepId === step.id}
              done={completedSet.has(step.id)}
              index={index}
              total={steps.length}
              onSelect={onSelectStep}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
