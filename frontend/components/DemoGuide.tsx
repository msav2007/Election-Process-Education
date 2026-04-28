import { ArrowRight, Compass, PlayCircle, Sparkles, X } from "lucide-react";
import type { DemoStepId } from "@/lib/types";

const demoSteps: Array<{ id: DemoStepId; title: string; hint: string }> = [
  { id: "select_profile", title: "Select profile", hint: "Choose a learner mode to begin." },
  { id: "view_timeline", title: "View timeline", hint: "Show the election journey structure." },
  { id: "ask_scenario", title: "Ask a scenario question", hint: "Open a real-life case and continue it in chat." },
  { id: "take_quiz", title: "Take quiz", hint: "Trigger adaptive scoring with one quick check." },
  { id: "view_insights", title: "View adaptive insights", hint: "Return to the dashboard and show the AI insights." }
];

export function DemoGuide({
  active,
  currentStep,
  primaryLabel,
  summary,
  onStart,
  onPrimaryAction,
  onDismiss
}: {
  active: boolean;
  currentStep: DemoStepId;
  primaryLabel: string | null;
  summary: string;
  onStart: () => void;
  onPrimaryAction: () => void;
  onDismiss: () => void;
}) {
  if (!active) {
    return (
      <div className="rounded-2xl border border-[#DBEAFE] bg-[linear-gradient(135deg,#EFF6FF_0%,#FFFFFF_100%)] p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
              <Compass className="h-3.5 w-3.5" />
              Demo mode
            </div>
            <p className="mt-2 text-sm leading-6 text-[#475569]">
              Launch a guided 90-second walkthrough that shows judges the timeline, scenario flow, adaptive quiz loop, and learning insights in the right order.
            </p>
          </div>
          <button
            type="button"
            onClick={onStart}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:scale-[1.01] hover:bg-[#1D4ED8] active:scale-[0.99]"
          >
            <PlayCircle className="h-4 w-4" />
            Start Demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#BFDBFE] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
              <Sparkles className="h-3.5 w-3.5" />
              Guided judge demo
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475569]">{summary}</p>
          </div>
          <div className="flex items-center gap-2">
            {primaryLabel ? (
              <button
                type="button"
                onClick={onPrimaryAction}
                className="inline-flex items-center gap-2 rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:scale-[1.01] hover:bg-[#1D4ED8] active:scale-[0.99]"
              >
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm font-medium text-[#475569] transition duration-200 hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
            >
              <span className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Exit
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-5">
          {demoSteps.map((step, index) => {
            const activeStep = currentStep === step.id;
            const complete =
              demoSteps.findIndex((item) => item.id === currentStep) > index || currentStep === "complete";

            return (
              <div
                key={step.id}
                className={`rounded-2xl border px-4 py-3 transition duration-200 ${
                  activeStep
                    ? "border-[#2563EB] bg-[#EFF6FF] shadow-sm ring-2 ring-[#DBEAFE]"
                    : complete
                      ? "border-[#BBF7D0] bg-[#F0FDF4]"
                      : "border-[#E5E7EB] bg-[#F8FAFC]"
                }`}
              >
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">Step {index + 1}</div>
                <p className="mt-2 text-sm font-semibold text-[#111827]">{step.title}</p>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">{step.hint}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
