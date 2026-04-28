import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Gauge,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  UserCheck
} from "lucide-react";
import { Card } from "@/components/Card";
import { DashboardSkeleton } from "@/components/Skeletons";
import type { AdaptiveLearningPath, LeaderboardEntry, LearningInsightSnapshot, ProgressResponse, TimelineStep } from "@/lib/types";

function MetricCard({
  label,
  value,
  detail,
  icon: Icon
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof BookOpenCheck;
}) {
  return (
    <Card className="p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-[#111827]">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] text-[#2563EB]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-[#6B7280]">{detail}</p>
    </Card>
  );
}

function ProgressBar({
  value,
  tone = "primary"
}: {
  value: number;
  tone?: "primary" | "success" | "warning";
}) {
  const color =
    tone === "success" ? "bg-[#10B981]" : tone === "warning" ? "bg-[#F59E0B]" : "bg-[#2563EB]";

  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-[#E5E7EB]">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

function rankTone(rank: number) {
  if (rank === 1) return "bg-[#FEF3C7] text-[#92400E]";
  if (rank === 2) return "bg-[#E5E7EB] text-[#374151]";
  if (rank === 3) return "bg-[#FDE68A] text-[#78350F]";
  return "bg-white text-[#111827]";
}

function adaptiveTone(status: AdaptiveLearningPath["status"]) {
  if (status === "advance") {
    return {
      border: "border-[#C7F9CC]",
      bg: "bg-[#F0FDF4]",
      label: "text-[#166534]",
      barTone: "success" as const
    };
  }
  if (status === "revise") {
    return {
      border: "border-[#FED7AA]",
      bg: "bg-[#FFF7ED]",
      label: "text-[#9A3412]",
      barTone: "warning" as const
    };
  }
  return {
    border: "border-[#DBEAFE]",
    bg: "bg-[#EFF6FF]",
    label: "text-[#1D4ED8]",
    barTone: "primary" as const
  };
}

function InsightCard({
  title,
  icon: Icon,
  children,
  highlighted = false
}: {
  title: string;
  icon: typeof Gauge;
  children: ReactNode;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm transition duration-200 ${
        highlighted ? "border-[#F59E0B] ring-4 ring-[#FDE68A]/60" : "border-[#E5E7EB]"
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
        <Icon className="h-4 w-4 text-[#2563EB]" />
        {title}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-4 transition duration-200 ${
        entry.is_current_user
          ? "border-[#93C5FD] bg-[#EFF6FF] shadow-sm"
          : "border-[#E5E7EB] bg-[#F8FAFC] hover:border-[#BFDBFE]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex min-w-[52px] items-center justify-center rounded-full px-3 py-1 text-sm font-semibold ${rankTone(entry.rank)}`}
            >
              #{entry.rank}
            </span>
            <p className="truncate text-sm font-semibold text-[#111827]">{entry.user_id_alias}</p>
            {entry.is_current_user ? (
              <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">You</span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-[#6B7280]">
            {entry.current_topic_title} - {entry.completed_count} steps completed
          </p>
        </div>

        <div className="min-w-[96px] text-right">
          <p className="text-sm font-semibold text-[#111827]">{entry.learning_score} pts</p>
          <p className="mt-1 text-xs text-[#6B7280]">{entry.progress_percent}% progress</p>
        </div>
      </div>

      <div className="mt-3">
        <ProgressBar value={entry.progress_percent} tone={entry.is_current_user ? "success" : "primary"} />
      </div>
    </div>
  );
}

function LearningInsights({
  insights,
  highlighted
}: {
  insights: LearningInsightSnapshot;
  highlighted: boolean;
}) {
  const adaptiveToneValue = adaptiveTone(insights.adaptiveStatus);
  const statusLabel =
    insights.adaptiveStatus === "advance"
      ? "Advance"
      : insights.adaptiveStatus === "revise"
        ? "Revise"
        : "Continue";

  return (
    <Card className={`p-5 transition duration-200 ${highlighted ? "ring-4 ring-[#DBEAFE]" : ""}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
            {highlighted ? "Demo step 5" : "Learning insights"}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#111827]">How the AI sees your progress</h2>
        </div>
        <div className="rounded-full bg-[#EFF6FF] px-4 py-2 text-sm font-semibold text-[#1D4ED8]">
          {insights.totalInteractions} tracked AI interactions
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <InsightCard title="Accuracy trend" icon={BarChart3} highlighted={highlighted}>
          {insights.accuracyTrend.length ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Average quiz accuracy</span>
                  <span className="font-semibold text-[#111827]">{insights.averageAccuracy}%</span>
                </div>
                <div className="mt-3">
                  <ProgressBar value={insights.averageAccuracy} tone={insights.averageAccuracy >= 75 ? "success" : "primary"} />
                </div>
              </div>
              {insights.accuracyTrend.map((item) => (
                <div key={item.topicId}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[#111827]">{item.title}</span>
                    <span className="text-[#6B7280]">{item.percent}%</span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={item.percent} tone={item.percent >= 75 ? "success" : item.percent <= 40 ? "warning" : "primary"} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 text-sm text-[#6B7280]">
              No quiz taken yet. Start your journey with one quick quiz to unlock AI performance insights.
            </div>
          )}
        </InsightCard>

        <InsightCard title="Adaptive status" icon={Sparkles}>
          <div className={`rounded-2xl border p-4 ${adaptiveToneValue.border} ${adaptiveToneValue.bg}`}>
            <div className="flex items-center justify-between gap-3">
              <span className={`text-sm font-semibold ${adaptiveToneValue.label}`}>{statusLabel}</span>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#111827]">
                Live adaptive signal
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#111827]">
              The current path is tuned by quiz accuracy, completion momentum, and the strength of your recent answers.
            </p>
          </div>
        </InsightCard>

        <InsightCard title="Fallback usage" icon={ShieldCheck}>
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-[#6B7280]">Resilience rate</span>
              <span className="text-2xl font-semibold text-[#111827]">{insights.fallbackUsagePercent}%</span>
            </div>
            <div className="mt-3">
              <ProgressBar value={insights.fallbackUsagePercent} tone={insights.fallbackUsagePercent <= 25 ? "success" : "warning"} />
            </div>
            <p className="mt-3 text-sm leading-6 text-[#6B7280]">
              This shows how often the deterministic fallback carried the experience while keeping the flow intact.
            </p>
          </div>
        </InsightCard>

        <InsightCard title="Topics mastered" icon={Target}>
          {insights.topicsMastered.length ? (
            <div className="flex flex-wrap gap-2">
              {insights.topicsMastered.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-sm font-medium text-[#166534]"
                >
                  {topic}
                </span>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 text-sm text-[#6B7280]">
              Start your journey to establish mastery signals. A topic is marked mastered after strong quiz performance.
            </div>
          )}
        </InsightCard>
      </div>
    </Card>
  );
}

export function DashboardView({
  activeStep,
  completedSteps,
  timeline,
  progress,
  insights,
  loading,
  profileLabel,
  leaderboard,
  currentUserRank,
  showDemoCta,
  highlightTimelineCta,
  highlightInsights,
  onStartDemo,
  onOpenTimeline,
  onNextStep
}: {
  activeStep: TimelineStep;
  completedSteps: string[];
  timeline: TimelineStep[];
  progress: ProgressResponse | null;
  insights: LearningInsightSnapshot;
  loading: boolean;
  profileLabel: string;
  leaderboard: LeaderboardEntry[];
  currentUserRank: number | null;
  showDemoCta: boolean;
  highlightTimelineCta: boolean;
  highlightInsights: boolean;
  onStartDemo: () => void;
  onOpenTimeline: () => void;
  onNextStep: () => void;
}) {
  if (loading || !progress) {
    return <DashboardSkeleton />;
  }

  const progressPercent = progress.progress_percent;
  const nextStepTitle = progress.recommended_topic_title ?? progress.next_step_title;
  const adaptive = progress.adaptive_path;
  const adaptiveStyle = adaptiveTone(adaptive.status);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">Welcome</p>
            <h2 className="mt-3 text-2xl font-semibold text-[#111827] md:text-3xl">Election learning workspace</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6B7280]">
              Follow the full election lifecycle with grounded AI answers, adaptive revision signals, and persistent score tracking.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {showDemoCta ? (
              <button
                type="button"
                onClick={onStartDemo}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] transition duration-200 hover:-translate-y-0.5 hover:border-[#2563EB] hover:text-[#2563EB]"
              >
                <Sparkles className="h-4 w-4 text-[#2563EB]" />
                Start demo
              </button>
            ) : null}
            <button
              type="button"
              onClick={onOpenTimeline}
              className={`inline-flex w-fit items-center gap-2 rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:scale-[1.01] hover:bg-[#1D4ED8] active:scale-[0.99] ${
                highlightTimelineCta ? "ring-4 ring-[#DBEAFE]" : ""
              }`}
            >
              View timeline
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={BookOpenCheck} label="Current Step" value={activeStep.title} detail={activeStep.summary} />
        <MetricCard
          icon={Gauge}
          label="Progress %"
          value={`${progressPercent}%`}
          detail={`${completedSteps.length} of ${timeline.length} steps completed`}
        />
        <MetricCard
          icon={UserCheck}
          label="Mode"
          value={profileLabel}
          detail="Your selected profile changes the tone and depth of guidance."
        />
        <MetricCard
          icon={ShieldCheck}
          label="Learning Score"
          value={`${progress.learning_score}`}
          detail="Score grows with mastery, completion, and consistent quiz performance."
        />
      </div>

      <LearningInsights insights={insights} highlighted={highlightInsights} />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">Adaptive path</p>
              <h2 className="mt-2 text-xl font-semibold text-[#111827]">Your next best learning move</h2>
            </div>
            <div className="min-w-[220px]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B7280]">Completion</span>
                <span className="font-semibold text-[#111827]">{progressPercent}%</span>
              </div>
              <div className="mt-2">
                <ProgressBar value={progressPercent} />
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#111827]">Current: {activeStep.title}</p>
                <p className="mt-1 text-sm text-[#6B7280]">
                  {nextStepTitle ? `Recommended next focus: ${nextStepTitle}` : "You have reached the final step."}
                </p>
                <p className="mt-3 text-sm leading-6 text-[#6B7280]">{progress.message}</p>
              </div>
              <button
                type="button"
                onClick={onNextStep}
                className="inline-flex w-fit items-center gap-2 rounded-[10px] border border-[#2563EB] bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:scale-[1.01] hover:brightness-110 hover:shadow-md active:scale-[0.99]"
              >
                Continue journey
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className={`mt-5 rounded-2xl border p-5 ${adaptiveStyle.border} ${adaptiveStyle.bg}`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Sparkles className={`h-4 w-4 ${adaptiveStyle.label}`} />
                  <p className={`text-sm font-semibold ${adaptiveStyle.label}`}>{adaptive.headline}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#111827]">{adaptive.rationale}</p>
                <p className="mt-3 text-sm font-medium text-[#111827]">{adaptive.recommended_action}</p>
              </div>
              <div className="min-w-[180px] rounded-2xl bg-white/80 p-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                  <span>Confidence</span>
                  <span>{adaptive.confidence_score}%</span>
                </div>
                <div className="mt-3">
                  <ProgressBar value={adaptive.confidence_score} tone={adaptiveStyle.barTone} />
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {adaptive.support_topics.map((item) => (
                <div key={`${item.topic_id}-support`} className="rounded-2xl border border-white/80 bg-white/80 p-4">
                  <p className="text-sm font-semibold text-[#111827]">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[#6B7280]">{item.reason}</p>
                </div>
              ))}
              {adaptive.unlocked_topics.map((item) => (
                <div key={`${item.topic_id}-unlock`} className="rounded-2xl border border-white/80 bg-white/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
                    <TrendingUp className="h-4 w-4 text-[#059669]" />
                    {item.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#6B7280]">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">Leaderboard</p>
              <h2 className="mt-2 text-xl font-semibold text-[#111827]">Top learners</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[#FFF7ED] px-3 py-1 text-xs font-semibold text-[#9A3412]">
              <Trophy className="h-3.5 w-3.5" />
              {currentUserRank ? `Your rank #${currentUserRank}` : "Live rank"}
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {leaderboard.length ? (
              leaderboard.map((entry) => <LeaderboardRow key={entry.user_id_alias} entry={entry} />)
            ) : (
              <p className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm text-[#6B7280]">
                Leaderboard data will appear after authenticated progress sync succeeds.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
