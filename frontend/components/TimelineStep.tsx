import { Check } from "lucide-react";
import type { TimelineStep as TimelineStepType } from "@/lib/types";

export function TimelineStep({
  step,
  active,
  done,
  index,
  total,
  onSelect
}: {
  step: TimelineStepType;
  active: boolean;
  done: boolean;
  index: number;
  total: number;
  onSelect: (stepId: string) => void;
}) {
  const statusLabel = done ? "Completed" : active ? "Current" : "Upcoming";

  return (
    <button
      type="button"
      onClick={() => onSelect(step.id)}
      aria-current={active ? "step" : undefined}
      aria-label={`${step.title}, step ${index + 1} of ${total}${done ? ", completed" : ""}`}
      className={`group min-h-[168px] rounded-2xl border p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        active
          ? "border-[#2563EB] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FBFF_100%)] ring-2 ring-[#DBEAFE]"
          : "border-[#E5E7EB] bg-white hover:border-[#2563EB]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition duration-300 ${
            done
              ? "border-[#2563EB] bg-[#2563EB] text-white"
              : active
                ? "border-[#2563EB] bg-[#2563EB] text-white"
                : "border-[#E5E7EB] bg-[#F8FAFC] text-[#6B7280] group-hover:border-[#2563EB] group-hover:text-[#2563EB]"
          }`}
        >
          {done ? <Check className="h-4 w-4" /> : step.order}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
            done
              ? "bg-[#DBEAFE] text-[#1D4ED8]"
              : active
                ? "bg-[#EFF6FF] text-[#2563EB]"
                : "bg-[#F8FAFC] text-[#6B7280]"
          }`}
        >
          {statusLabel}
        </span>
      </div>
      <span className="mt-5 block text-base font-semibold text-[#111827]">{step.title}</span>
      <span className="mt-2 block text-sm leading-6 text-[#6B7280]">{step.summary}</span>
      <span className="mt-4 block text-xs font-medium uppercase tracking-[0.12em] text-[#94A3B8]">
        Step {index + 1} of {total}
      </span>
    </button>
  );
}
