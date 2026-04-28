"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Sparkles } from "lucide-react";
import { DemoGuide } from "@/components/DemoGuide";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { ProfileSelector } from "@/components/ProfileSelector";
import { Sidebar } from "@/components/Sidebar";
import { ChatSkeleton, DashboardSkeleton, QuizSkeleton } from "@/components/Skeletons";
import { ToastStack } from "@/components/ToastStack";
import { useChat } from "@/hooks/useChat";
import { useGuestSession } from "@/hooks/useGuestSession";
import { useJourneyState } from "@/hooks/useJourneyState";
import { useProgress } from "@/hooks/useProgress";
import { useQuiz } from "@/hooks/useQuiz";
import { fetchTimeline } from "@/lib/api";
import { getNextStepId, getStepById, sortTimeline } from "@/lib/client-fallbacks";
import { profileLabels } from "@/lib/constants";
import { localTimeline } from "@/lib/local-data";
import { pageTitles, type PageId } from "@/lib/view-state";
import type {
  AppNotice,
  DemoStepId,
  LearningInsightSnapshot,
  Profile,
  ResponseVersion,
  TimelineStep,
  ToastMessage
} from "@/lib/types";


const loadingFallback = <DashboardSkeleton />;

function scorePercent(score: number) {
  const maxScore = score > 3 ? 5 : 3;
  return Math.round((score / Math.max(maxScore, 1)) * 100);
}

const DashboardView = dynamic(
  () => import("@/components/views/DashboardView").then((module) => module.DashboardView),
  { loading: () => <DashboardSkeleton /> }
);
const TimelineView = dynamic(
  () => import("@/components/views/TimelineView").then((module) => module.TimelineView),
  { loading: () => loadingFallback }
);
const ScenariosView = dynamic(
  () => import("@/components/views/ScenariosView").then((module) => module.ScenariosView),
  { loading: () => loadingFallback }
);
const ChatView = dynamic(
  () => import("@/components/views/ChatView").then((module) => module.ChatView),
  { loading: () => <ChatSkeleton /> }
);
const QuizView = dynamic(
  () => import("@/components/views/QuizView").then((module) => module.QuizView),
  { loading: () => <QuizSkeleton /> }
);

export function AppShell() {
  const router = useRouter();
  const journey = useJourneyState();
  const [timeline, setTimeline] = useState<TimelineStep[]>(localTimeline);
  const [timelineNotice, setTimelineNotice] = useState<AppNotice | null>(null);
  const [chatNotice, setChatNotice] = useState<AppNotice | null>(null);
  const [quizNotice, setQuizNotice] = useState<AppNotice | null>(null);
  const [progressNotice, setProgressNotice] = useState<AppNotice | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const lastNoticeKeyRef = useRef<string | null>(null);
  const lastCompletionRef = useRef<string | null>(null);
  const lastQuizToastRef = useRef<string | null>(null);
  const pushToastRef = useRef<(toast: Omit<ToastMessage, "id">) => void>(() => undefined);
  const markDemoMilestoneRef = useRef(journey.markDemoMilestone);

  function dismissToast(id: string) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function pushToast(toast: Omit<ToastMessage, "id">) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { ...toast, id }].slice(-4));
    window.setTimeout(() => dismissToast(id), 3600);
  }

  const orderedTimeline = useMemo(() => sortTimeline(timeline), [timeline]);
  const activeStep = useMemo(
    () => getStepById(orderedTimeline, journey.activeStepId),
    [journey.activeStepId, orderedTimeline]
  );
  const nextStepId = getNextStepId(orderedTimeline, journey.activeStepId);
  const nextStepTitle = nextStepId ? getStepById(orderedTimeline, nextStepId).title : null;
  const profileLabel = journey.profile ? profileLabels[journey.profile] : "Guest";
  const { authToken, clearSession } = useGuestSession(journey.profile);

  useEffect(() => {
    pushToastRef.current = pushToast;
    markDemoMilestoneRef.current = journey.markDemoMilestone;
  });

  useEffect(() => {
    let cancelled = false;

    fetchTimeline()
      .then((steps) => {
        if (cancelled) return;
        setTimeline(steps.length ? sortTimeline(steps) : localTimeline);
        setTimelineNotice(null);
      })
      .catch(() => {
        if (cancelled) return;
        setTimeline(localTimeline);
        setTimelineNotice({
          tone: "warning",
          title: "Using local timeline content",
          message: "The live timeline API is unavailable, so the app is rendering the built-in election journey.",
          suggestions: ["Continue learning normally.", "Retry later if you need the latest backend-backed ordering."]
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const {
    assistant,
    messages,
    input,
    setInput,
    loading: assistantLoading,
    submitChat,
    loadAssistant,
    applySuggestion,
    resetChat
  } = useChat({
    authToken,
    profile: journey.profile,
    timeline: orderedTimeline,
    activeStepId: journey.activeStepId,
    completedSteps: journey.completedSteps,
    eli10Enabled: journey.eli10Enabled,
    onNoticeChange: setChatNotice,
    onTopicResolved: journey.setActiveStepId,
    onResponseTracked: journey.recordAssistantSource
  });

  const { progress, leaderboard, currentUserRank } = useProgress({
    authToken,
    profile: journey.profile,
    activeStepId: journey.activeStepId,
    completedSteps: journey.completedSteps,
    quizScores: journey.quizScores,
    timeline: orderedTimeline,
    onNoticeChange: setProgressNotice
  });

  const {
    quiz,
    selectedAnswers,
    submitted,
    score,
    loading: quizLoading,
    startQuiz,
    selectAnswer,
    submitQuiz
  } = useQuiz({
    authToken,
    profile: journey.profile,
    timeline: orderedTimeline,
    activeStepId: journey.activeStepId,
    eli10Enabled: journey.eli10Enabled,
    onNoticeChange: setQuizNotice,
    onScoreCommitted: journey.updateQuizScore,
    onQuizTracked: journey.recordQuizSource
  });

  const apiNotice = chatNotice ?? quizNotice ?? progressNotice ?? timelineNotice;
  const responseVersion: ResponseVersion = journey.eli10Enabled
    ? "eli10"
    : assistant?.preferred_version ?? "standard";
  const learningInsights = useMemo<LearningInsightSnapshot>(() => {
    const accuracyTrend = Object.entries(journey.quizScores)
      .map(([topicId, score]) => {
        const step = getStepById(orderedTimeline, topicId);
        return {
          topicId,
          title: step.title,
          score,
          percent: Math.min(100, Math.max(0, scorePercent(score)))
        };
      })
      .sort((left, right) => orderedTimeline.findIndex((step) => step.id === left.topicId) - orderedTimeline.findIndex((step) => step.id === right.topicId));
    const totalInteractions =
      journey.aiTelemetry.assistant_live +
      journey.aiTelemetry.assistant_fallback +
      journey.aiTelemetry.quiz_live +
      journey.aiTelemetry.quiz_fallback;
    const fallbackInteractions = journey.aiTelemetry.assistant_fallback + journey.aiTelemetry.quiz_fallback;

    return {
      accuracyTrend,
      averageAccuracy: accuracyTrend.length
        ? Math.round(accuracyTrend.reduce((sum, item) => sum + item.percent, 0) / accuracyTrend.length)
        : 0,
      adaptiveStatus: progress?.adaptive_path.status ?? "continue",
      fallbackUsagePercent: totalInteractions ? Math.round((fallbackInteractions / totalInteractions) * 100) : 0,
      topicsMastered: accuracyTrend.filter((item) => item.percent >= 75).map((item) => item.title),
      totalInteractions
    };
  }, [journey.aiTelemetry, journey.quizScores, orderedTimeline, progress?.adaptive_path.status]);
  const currentDemoStep = useMemo<DemoStepId>(() => {
    if (!journey.demoMode) return "complete";
    if (!journey.profile) return "select_profile";
    if (!journey.demoMilestones.timeline_viewed) return "view_timeline";
    if (!journey.demoMilestones.scenario_asked) return "ask_scenario";
    if (!journey.demoMilestones.quiz_completed) return "take_quiz";
    if (!journey.demoMilestones.insights_viewed) return "view_insights";
    return "complete";
  }, [journey.demoMilestones, journey.demoMode, journey.profile]);
  const demoPrimaryLabel =
    currentDemoStep === "view_timeline"
      ? "Open timeline"
      : currentDemoStep === "ask_scenario"
        ? "Open scenarios"
        : currentDemoStep === "take_quiz"
          ? "Open quiz"
          : currentDemoStep === "view_insights"
            ? "Open insights"
            : null;
  const demoSummary =
    currentDemoStep === "select_profile"
      ? "Step 1 of 5: choose a profile below so the judge can see the app personalize explanations and quiz tone immediately."
      : currentDemoStep === "view_timeline"
        ? "Step 2 of 5: open the timeline to show the full election journey and the current step context."
        : currentDemoStep === "ask_scenario"
          ? "Step 3 of 5: open Scenarios, select a real-life case, and continue it into chat to show grounded reasoning."
          : currentDemoStep === "take_quiz"
            ? "Step 4 of 5: take one quiz to trigger the adaptive path and learning score updates."
            : currentDemoStep === "view_insights"
              ? "Step 5 of 5: return to the dashboard to show Learning Insights, fallback resilience, and adaptive status."
              : "Demo complete. The product story now flows from personalization to timeline, grounded AI, adaptive quiz feedback, and dashboard insights.";
  const demoTargetPage: PageId | null =
    currentDemoStep === "view_timeline"
      ? "timeline"
      : currentDemoStep === "ask_scenario"
        ? "scenarios"
        : currentDemoStep === "take_quiz"
          ? "quiz"
          : currentDemoStep === "view_insights"
            ? "dashboard"
            : null;

  useEffect(() => {
    if (!apiNotice) return;
    const key = `${apiNotice.title}:${apiNotice.message}:${apiNotice.requestId ?? ""}`;
    if (lastNoticeKeyRef.current === key) return;
    lastNoticeKeyRef.current = key;
    pushToastRef.current({
      tone: apiNotice.tone === "warning" ? "error" : "info",
      title: apiNotice.title,
      description: apiNotice.message
    });
  }, [apiNotice]);

  useEffect(() => {
    if (!journey.completionNotice) return;
    if (lastCompletionRef.current === journey.completionNotice) return;
    lastCompletionRef.current = journey.completionNotice;
    pushToastRef.current({
      tone: "success",
      title: "Journey milestone reached",
      description: journey.completionNotice
    });
  }, [journey.completionNotice]);

  useEffect(() => {
    if (!submitted || score === null || !quiz) return;
    const key = `${quiz.topic_id}:${score}`;
    if (lastQuizToastRef.current === key) return;
    lastQuizToastRef.current = key;
    markDemoMilestoneRef.current("quiz_completed");
    pushToastRef.current({
      tone: "success",
      title: "Quiz scored",
      description: `${quiz.title}: ${score}/${quiz.questions.length} with ${progress?.adaptive_path.headline ?? "updated adaptive guidance"}.`
    });
  }, [progress?.adaptive_path.headline, quiz, score, submitted]);

  useEffect(() => {
    if (!journey.demoMode) return;
    if (
      !journey.demoMilestones.insights_viewed &&
      journey.activePage === "dashboard" &&
      Object.keys(journey.quizScores).length > 0
    ) {
      markDemoMilestoneRef.current("insights_viewed");
    }
  }, [journey.activePage, journey.demoMilestones.insights_viewed, journey.demoMode, journey.quizScores]);

  function pushRoute(page: PageId, stepId = journey.activeStepId) {
    if (page === "timeline") {
      router.push(`/timeline?step=${stepId}`);
      return;
    }
    router.push(`/?page=${page}`);
  }

  function navigatePage(page: PageId) {
    startTransition(() => {
      journey.setActivePage(page);
      if (journey.demoMode && page === "timeline") {
        journey.markDemoMilestone("timeline_viewed");
      }
      pushRoute(page);
    });
  }

  function routeToTimeline(stepId: string) {
    startTransition(() => {
      journey.setActivePage("timeline");
      journey.setActiveStepId(stepId);
      if (journey.demoMode) {
        journey.markDemoMilestone("timeline_viewed");
      }
      router.push(`/timeline?step=${stepId}`);
    });
  }

  function chooseProfile(profile: Profile) {
    clearSession();
    resetChat();
    journey.chooseProfile(profile);
    pushToast({
      tone: "success",
      title: "Profile selected",
      description: `${profileLabels[profile]} mode is active.`
    });
    router.push("/?page=dashboard");
  }

  function resetProfile() {
    clearSession();
    resetChat();
    journey.resetJourney();
    router.push("/");
  }

  async function openStepInChat(stepId: string) {
    const title = getStepById(orderedTimeline, stepId).title;
    navigatePage("chat");
    journey.setActiveStepId(stepId);
    await loadAssistant({
      topicId: stepId,
      action: "explain",
      userText: `Explain ${title}`
    });
  }

  function handleNextStep() {
    journey.markCurrentStepComplete(nextStepId);
    if (nextStepId) {
      routeToTimeline(nextStepId);
    }
  }

  async function handleScenarioSelect(scenarioId: string) {
    journey.setSelectedScenarioId(scenarioId);
    await loadAssistant({
      topicId: activeStep.id,
      action: "scenario",
      scenarioId,
      userText: `Scenario: ${scenarioId.replaceAll("_", " ")}. Give me practical real-world steps.`
    });
    if (journey.demoMode) {
      journey.markDemoMilestone("scenario_asked");
    }
    pushToast({
      tone: "info",
      title: "Scenario loaded",
      description: "A grounded scenario walkthrough is ready in the current flow."
    });
  }

  async function handleSuggestionSelect(suggestion: Parameters<typeof applySuggestion>[0]) {
    if (suggestion.scenario_id) {
      journey.setSelectedScenarioId(suggestion.scenario_id);
    }
    if (suggestion.topic_id !== journey.activeStepId) {
      journey.setActiveStepId(suggestion.topic_id);
    }
    await applySuggestion(suggestion);
  }

  function handleDemoPrimaryAction() {
    if (currentDemoStep === "view_timeline") {
      navigatePage("timeline");
      return;
    }
    if (currentDemoStep === "ask_scenario") {
      navigatePage("scenarios");
      return;
    }
    if (currentDemoStep === "take_quiz") {
      navigatePage("quiz");
      return;
    }
    if (currentDemoStep === "view_insights") {
      navigatePage("dashboard");
    }
  }

  function renderActivePage() {
    if (!journey.profile) {
      return (
        <ProfileSelector
          onSelect={chooseProfile}
          highlighted={journey.demoMode && currentDemoStep === "select_profile"}
        />
      );
    }

    if (journey.activePage === "timeline") {
      return (
        <TimelineView
          timeline={orderedTimeline}
          activeStep={activeStep}
          activeStepId={journey.activeStepId}
          completedSteps={journey.completedSteps}
          nextStepTitle={nextStepTitle}
          onSelectStep={routeToTimeline}
          onOpenStepInChat={openStepInChat}
          onNextStep={handleNextStep}
        />
      );
    }

    if (journey.activePage === "scenarios") {
      const scenarioSolution =
        journey.selectedScenarioId && assistant?.action === "scenario"
          ? responseVersion === "eli10"
            ? assistant.eli10_version
            : assistant.standard
          : null;

      return (
        <ScenariosView
          activeStepTitle={activeStep.title}
          selectedScenarioId={journey.selectedScenarioId}
          loading={assistantLoading}
          scenarioSolution={scenarioSolution}
          highlighted={journey.demoMode && currentDemoStep === "ask_scenario"}
          onSelectScenario={handleScenarioSelect}
          onContinueToChat={() => navigatePage("chat")}
        />
      );
    }

    if (journey.activePage === "chat") {
      return (
        <ChatView
          messages={messages}
          assistant={assistant}
          responseVersion={responseVersion}
          loading={assistantLoading}
          isLastStep={!nextStepId}
          input={input}
          onInputChange={setInput}
          onSend={() => void submitChat()}
          onNextStep={handleNextStep}
          onSuggestionSelect={(suggestion) => void handleSuggestionSelect(suggestion)}
        />
      );
    }

    if (journey.activePage === "quiz") {
      return (
        <QuizView
          activeStep={activeStep}
          completedCount={journey.completedSteps.length}
          timelineLength={orderedTimeline.length}
          eli10Enabled={journey.eli10Enabled}
          quiz={quiz}
          loading={quizLoading}
          selectedAnswers={selectedAnswers}
          submitted={submitted}
          score={score}
          adaptivePath={progress?.adaptive_path ?? null}
          highlighted={journey.demoMode && currentDemoStep === "take_quiz"}
          isLastStep={!nextStepId}
          onSelect={selectAnswer}
          onSubmit={submitQuiz}
          onStart={() => void startQuiz()}
          onNextStep={handleNextStep}
        />
      );
    }

    return (
      <DashboardView
        activeStep={activeStep}
        completedSteps={journey.completedSteps}
        timeline={orderedTimeline}
        progress={progress}
        insights={learningInsights}
        loading={!progress}
        profileLabel={profileLabel}
        leaderboard={leaderboard}
        currentUserRank={currentUserRank}
        showDemoCta={!journey.demoMode}
        onStartDemo={journey.startDemo}
        highlightTimelineCta={journey.demoMode && currentDemoStep === "view_timeline"}
        highlightInsights={journey.demoMode && currentDemoStep === "view_insights"}
        onOpenTimeline={() => navigatePage("timeline")}
        onNextStep={handleNextStep}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#111827]">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-72">
        <Sidebar
          activePage={journey.activePage}
          activeStepId={journey.activeStepId}
          completedSteps={journey.completedSteps}
          profile={journey.profile}
          progressPercent={progress?.progress_percent ?? 0}
          steps={orderedTimeline}
          demoTargetPage={journey.demoMode ? demoTargetPage : null}
          onPageChange={navigatePage}
          onResetProfile={resetProfile}
          onSelectStep={routeToTimeline}
        />
      </div>

      <div className="lg:pl-72">
        <Header
          pageTitle={journey.profile ? pageTitles[journey.activePage] : "Welcome"}
          profile={journey.profile}
          eli10Enabled={journey.eli10Enabled}
          onToggleEli10={journey.setEli10Enabled}
          onResetProfile={resetProfile}
        />
        {journey.profile ? (
          <MobileNav
            activePage={journey.activePage}
            demoTargetPage={journey.demoMode ? demoTargetPage : null}
            onPageChange={navigatePage}
          />
        ) : null}

        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6 xl:px-8">
          <DemoGuide
            active={journey.demoMode}
            currentStep={currentDemoStep}
            primaryLabel={demoPrimaryLabel}
            summary={demoSummary}
            onStart={() => {
              journey.startDemo();
              pushToast({
                tone: "info",
                title: "Demo mode active",
                description: "Follow the guided steps to present the strongest product story."
              });
            }}
            onPrimaryAction={handleDemoPrimaryAction}
            onDismiss={journey.stopDemo}
          />

          {apiNotice ? (
            <div
              className={`rounded-2xl border p-4 shadow-sm ${
                apiNotice.tone === "warning"
                  ? "border-[#FED7AA] bg-[#FFF7ED] text-[#9A3412]"
                  : "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
              }`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{apiNotice.title}</p>
                  <p className="mt-1 text-sm leading-6">{apiNotice.message}</p>
                  {apiNotice.suggestions.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {apiNotice.suggestions.map((suggestion) => (
                        <span
                          key={suggestion}
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            apiNotice.tone === "warning"
                              ? "bg-white/70 text-[#9A3412]"
                              : "bg-white/80 text-[#1D4ED8]"
                          }`}
                        >
                          {suggestion}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {apiNotice.requestId ? (
                    <p className="mt-3 text-xs font-medium opacity-80">Request ID: {apiNotice.requestId}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {journey.completionNotice ? (
            <div className="flex items-start gap-3 rounded-2xl border border-[#D1FAE5] bg-[#ECFDF5] p-4 text-sm font-medium text-[#065F46] shadow-sm transition duration-200 motion-safe:animate-[toast-in_180ms_ease-out]" role="status">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]" />
              <p>{journey.completionNotice}</p>
            </div>
          ) : null}

          {journey.hydrated ? renderActivePage() : loadingFallback}
        </div>
      </div>
    </main>
  );
}
