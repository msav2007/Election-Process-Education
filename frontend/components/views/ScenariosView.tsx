import {
  BadgeCheck,
  Fingerprint,
  MapPinned,
  Sparkles
} from "lucide-react";
import { Card } from "@/components/Card";
import { scenarioOptions } from "@/lib/local-data";
import type { ContentVersion } from "@/lib/types";


const scenarioIcons: Record<string, typeof MapPinned> = {
  lost_voter_id: BadgeCheck,
  moved_city: MapPinned,
  first_time_vote: Fingerprint
};

function SolutionSteps({ content }: { content: ContentVersion }) {
  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm font-medium text-[#111827]">Overview</p>
        <p className="mt-2 text-sm leading-6 text-[#6B7280]">{content.simple_explanation}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-[#111827]">Step-by-step solution</p>
        <ol className="mt-3 space-y-3">
          {content.steps.map((step, index) => (
            <li key={`${step}-${index}`} className="flex gap-3 text-sm leading-6 text-[#111827]">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm leading-6 text-[#6B7280]">
        {content.what_to_do_next}
      </div>
    </div>
  );
}

export function ScenariosView({
  activeStepTitle,
  selectedScenarioId,
  loading,
  scenarioSolution,
  highlighted,
  onSelectScenario,
  onContinueToChat
}: {
  activeStepTitle: string;
  selectedScenarioId: string | null;
  loading: boolean;
  scenarioSolution: ContentVersion | null;
  highlighted: boolean;
  onSelectScenario: (scenarioId: string) => void;
  onContinueToChat: () => void;
}) {
  const selectedScenario = scenarioOptions.find((scenario) => scenario.id === selectedScenarioId);

  return (
    <div className="space-y-6">
      <section
        className={`rounded-xl border bg-white p-6 shadow-sm transition duration-200 ${
          highlighted ? "border-[#F59E0B] ring-4 ring-[#FDE68A]/60" : "border-[#E5E7EB]"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
          {highlighted ? "Demo step 3" : "Scenario library"}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#111827]">Choose a real-life situation</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6B7280]">
          Each card opens a practical inline solution below. If you want follow-up help, continue the same scenario in chat.
        </p>
        {highlighted ? (
          <p className="mt-4 rounded-full bg-[#FFF7ED] px-4 py-2 text-sm font-medium text-[#9A3412]">
            Pick a scenario to show grounded, real-world reasoning in one click.
          </p>
        ) : null}
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {scenarioOptions.map((scenario) => {
          const Icon = scenarioIcons[scenario.id] ?? MapPinned;
          const active = selectedScenarioId === scenario.id;

          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onSelectScenario(scenario.id)}
              disabled={loading}
              className={`group rounded-xl border p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#2563EB] hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${
                active
                  ? "border-[#2563EB] bg-white"
                  : highlighted
                    ? "border-[#F59E0B] bg-white"
                    : "border-[#E5E7EB] bg-white"
              }`}
              aria-pressed={active}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#3B82F6]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="mt-5 block text-base font-semibold text-[#111827]">{scenario.label}</span>
              <span className="mt-2 block text-sm leading-6 text-[#6B7280]">{scenario.description}</span>
            </button>
          );
        })}
      </div>

      {selectedScenario ? (
        <Card className="p-6">
          <div className="flex flex-col gap-2 border-b border-[#E5E7EB] pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">Solution</p>
              <h2 className="mt-2 text-xl font-semibold text-[#111827]">{selectedScenario.label}</h2>
            </div>
            <span className="w-fit rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-semibold text-[#2563EB]">
              Active step: {activeStepTitle}
            </span>
          </div>
          <div className="mt-5">
            {loading ? (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-sm text-[#6B7280]">
                <Sparkles className="h-4 w-4 animate-pulse text-[#2563EB]" />
                Preparing a focused solution...
              </div>
            ) : null}
            {scenarioSolution ? (
              <>
                <SolutionSteps content={scenarioSolution} />
                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={onContinueToChat}
                    className={`rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:scale-[1.01] hover:bg-[#3B82F6] active:scale-[0.99] ${
                      highlighted ? "ring-4 ring-[#DBEAFE]" : ""
                    }`}
                  >
                    Continue in chat
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm leading-6 text-[#6B7280]">Select a scenario card to load the step-by-step solution.</p>
            )}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
