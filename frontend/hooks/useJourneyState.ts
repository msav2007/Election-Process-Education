"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEY } from "@/lib/constants";
import { isPageId, type PageId } from "@/lib/view-state";
import type { AiTelemetry, DemoMilestones, Profile } from "@/lib/types";


type StoredState = {
  profile: Profile | null;
  activeStepId: string;
  activePage: PageId;
  completedSteps: string[];
  quizScores: Record<string, number>;
  eli10Enabled: boolean;
  aiTelemetry: AiTelemetry;
};

const defaultTelemetry: AiTelemetry = {
  assistant_live: 0,
  assistant_fallback: 0,
  quiz_live: 0,
  quiz_fallback: 0
};

const defaultDemoMilestones: DemoMilestones = {
  timeline_viewed: false,
  scenario_asked: false,
  quiz_completed: false,
  insights_viewed: false
};

export function useJourneyState() {
  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [activeStepId, setActiveStepId] = useState("registration");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [eli10Enabled, setEli10Enabled] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [completionNotice, setCompletionNotice] = useState<string | null>(null);
  const [aiTelemetry, setAiTelemetry] = useState<AiTelemetry>(defaultTelemetry);
  const [demoMode, setDemoMode] = useState(false);
  const [demoMilestones, setDemoMilestones] = useState<DemoMilestones>(defaultDemoMilestones);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as StoredState;
        setProfile(parsed.profile ?? null);
        setActiveStepId(parsed.activeStepId ?? "registration");
        setCompletedSteps(parsed.completedSteps ?? []);
        setQuizScores(parsed.quizScores ?? {});
        setEli10Enabled(Boolean(parsed.eli10Enabled));
        setAiTelemetry(parsed.aiTelemetry ?? defaultTelemetry);
        if (isPageId(parsed.activePage)) {
          setActivePage(parsed.activePage);
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    function applyRouteState() {
      const url = new URL(window.location.href);
      const step = url.searchParams.get("step");
      const page = url.searchParams.get("page");

      if (url.pathname === "/timeline") {
        setActivePage("timeline");
      } else if (isPageId(page)) {
        setActivePage(page);
      }

      if (step) {
        setActiveStepId(step);
      }
    }

    applyRouteState();
    window.addEventListener("popstate", applyRouteState);
    return () => {
      window.removeEventListener("popstate", applyRouteState);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const nextState: StoredState = {
      profile,
      activeStepId,
      activePage,
      completedSteps,
      quizScores,
      eli10Enabled,
      aiTelemetry
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }, [activePage, activeStepId, aiTelemetry, completedSteps, eli10Enabled, hydrated, profile, quizScores]);

  function chooseProfile(nextProfile: Profile) {
    setProfile(nextProfile);
    setActivePage("dashboard");
    setActiveStepId("registration");
    setCompletedSteps([]);
    setQuizScores({});
    setSelectedScenarioId(null);
    setCompletionNotice(null);
    setAiTelemetry(defaultTelemetry);
    setDemoMilestones(defaultDemoMilestones);
  }

  function resetJourney() {
    setProfile(null);
    setActivePage("dashboard");
    setActiveStepId("registration");
    setCompletedSteps([]);
    setQuizScores({});
    setSelectedScenarioId(null);
    setCompletionNotice(null);
    setEli10Enabled(false);
    setAiTelemetry(defaultTelemetry);
    setDemoMode(false);
    setDemoMilestones(defaultDemoMilestones);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function updateQuizScore(topicId: string, score: number) {
    setQuizScores((current) => ({ ...current, [topicId]: score }));
  }

  function recordAssistantSource(source: "gemini" | "guided-engine") {
    setAiTelemetry((current) => ({
      ...current,
      assistant_live: current.assistant_live + (source === "gemini" ? 1 : 0),
      assistant_fallback: current.assistant_fallback + (source === "guided-engine" ? 1 : 0)
    }));
  }

  function recordQuizSource(source: "gemini" | "guided-engine") {
    setAiTelemetry((current) => ({
      ...current,
      quiz_live: current.quiz_live + (source === "gemini" ? 1 : 0),
      quiz_fallback: current.quiz_fallback + (source === "guided-engine" ? 1 : 0)
    }));
  }

  function startDemo() {
    setDemoMode(true);
    setDemoMilestones(defaultDemoMilestones);
  }

  function stopDemo() {
    setDemoMode(false);
    setDemoMilestones(defaultDemoMilestones);
  }

  function markDemoMilestone(key: keyof DemoMilestones) {
    setDemoMilestones((current) => ({ ...current, [key]: true }));
  }

  function markCurrentStepComplete(nextStepId: string | null) {
    setCompletedSteps((current) => (current.includes(activeStepId) ? current : [...current, activeStepId]));
    if (nextStepId) {
      setActiveStepId(nextStepId);
      setCompletionNotice(null);
      return;
    }
    setCompletionNotice("Journey completed. Review your weakest topics or explore the leaderboard.");
  }

  return {
    hydrated,
    profile,
    activePage,
    activeStepId,
    completedSteps,
    quizScores,
    eli10Enabled,
    selectedScenarioId,
    completionNotice,
    aiTelemetry,
    demoMode,
    demoMilestones,
    setProfile,
    setActivePage,
    setActiveStepId,
    setCompletedSteps,
    setQuizScores,
    setEli10Enabled,
    setSelectedScenarioId,
    setCompletionNotice,
    setDemoMode,
    chooseProfile,
    resetJourney,
    updateQuizScore,
    recordAssistantSource,
    recordQuizSource,
    startDemo,
    stopDemo,
    markDemoMilestone,
    markCurrentStepComplete
  };
}
