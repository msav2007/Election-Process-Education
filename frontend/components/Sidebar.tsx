import {
  CheckCircle2,
  CircleHelp,
  Circle,
  LayoutDashboard,
  MessageSquareText,
  Milestone,
  RefreshCw,
  Sparkles,
  UserRound,
  Vote
} from "lucide-react";
import { profileLabels } from "@/lib/constants";
import { type PageId } from "@/lib/view-state";
import type { Profile, TimelineStep } from "@/lib/types";

export const navItems: Array<{
  id: PageId;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "timeline", label: "Timeline", icon: Milestone },
  { id: "scenarios", label: "Scenarios", icon: Sparkles },
  { id: "chat", label: "Chat", icon: MessageSquareText },
  { id: "quiz", label: "Quiz", icon: CircleHelp }
];

export function Sidebar({
  activePage,
  activeStepId,
  completedSteps,
  profile,
  progressPercent,
  steps,
  demoTargetPage,
  onPageChange,
  onResetProfile,
  onSelectStep
}: {
  activePage: PageId;
  activeStepId: string;
  completedSteps: string[];
  profile: Profile | null;
  progressPercent: number;
  steps: TimelineStep[];
  demoTargetPage: PageId | null;
  onPageChange: (page: PageId) => void;
  onResetProfile: () => void;
  onSelectStep: (stepId: string) => void;
}) {
  const completedSet = new Set(completedSteps);

  return (
    <aside className="flex h-full min-h-screen flex-col border-r border-[#E5E7EB]/10 bg-[#081426] px-5 py-6 text-white">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563EB] shadow-sm">
          <Vote className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">Election Copilot</p>
          <p className="text-xs text-white/70">Management dashboard</p>
        </div>
      </div>

      <nav className="mt-9 space-y-1" aria-label="Application navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.id;
          const highlighted = demoTargetPage === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onPageChange(item.id)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition duration-200 ${
                active
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : highlighted
                    ? "bg-white/10 text-white ring-2 ring-[#F59E0B]/70"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-white" : "text-white/60 group-hover:text-white"}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-6 rounded-xl border border-[#E5E7EB]/10 bg-white/[0.06] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/70">Progress</p>
            <p className="mt-1 text-sm font-semibold">
              Completed: {completedSet.size}/{steps.length || 6}
            </p>
          </div>
          <span className="text-sm font-semibold text-white">{progressPercent}%</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-[#2563EB] transition-all duration-500"
            style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
          />
        </div>
        <div className="mt-4 space-y-1.5">
          {steps.map((step) => {
            const done = completedSet.has(step.id);
            const active = activeStepId === step.id;
            const Icon = done ? CheckCircle2 : Circle;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onSelectStep(step.id)}
                className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition duration-200 ${
                  active
                    ? "bg-[#2563EB] text-white"
                    : done
                      ? "text-white hover:bg-white/10"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
                aria-current={active ? "step" : undefined}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto rounded-xl border border-[#E5E7EB]/10 bg-white/[0.06] p-4">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/70">Profile</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB]">
            <UserRound className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{profile ? profileLabels[profile] : "Guest"}</p>
            <p className="truncate text-xs text-white/70">{profile ? "Active learner" : "Choose a mode"}</p>
          </div>
          {profile ? (
            <button
              aria-label="Change profile"
              title="Change profile"
              type="button"
              onClick={onResetProfile}
              className="rounded-xl p-2 text-white/70 transition duration-200 hover:bg-white/10 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
