"use client";

import { useEffect, useState } from "react";
import { buildNoticeFromError, fetchLeaderboard, fetchProgress } from "@/lib/api";
import { buildLocalProgress } from "@/lib/client-fallbacks";
import type { AppNotice, LeaderboardEntry, Profile, ProgressResponse, TimelineStep } from "@/lib/types";


type UseProgressOptions = {
  authToken: string | null;
  profile: Profile | null;
  activeStepId: string;
  completedSteps: string[];
  quizScores: Record<string, number>;
  timeline: TimelineStep[];
  onNoticeChange: (notice: AppNotice | null) => void;
};

export function useProgress({
  authToken,
  profile,
  activeStepId,
  completedSteps,
  quizScores,
  timeline,
  onNoticeChange
}: UseProgressOptions) {
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  useEffect(() => {
    const fallback = buildLocalProgress(timeline, activeStepId, completedSteps, quizScores);
    setProgress(fallback);

    if (!profile || !authToken) {
      onNoticeChange(null);
      return;
    }

    let cancelled = false;
    fetchProgress({
      authToken,
      profile,
      currentTopicId: activeStepId,
      completedSteps,
      quizScores
    })
      .then((nextProgress) => {
        if (cancelled) return;
        setProgress(nextProgress);
        onNoticeChange(null);
      })
      .catch((error) => {
        if (cancelled) return;
        setProgress(fallback);
        onNoticeChange(buildNoticeFromError(error, "progress"));
      });

    return () => {
      cancelled = true;
    };
  }, [activeStepId, authToken, completedSteps, onNoticeChange, profile, quizScores, timeline]);

  useEffect(() => {
    if (!authToken) {
      setLeaderboard([]);
      setCurrentUserRank(null);
      return;
    }

    let cancelled = false;
    fetchLeaderboard(authToken)
      .then((response) => {
        if (cancelled) return;
        setLeaderboard(response.entries);
        setCurrentUserRank(response.current_user_rank);
      })
      .catch(() => {
        if (cancelled) return;
        setLeaderboard([]);
        setCurrentUserRank(null);
      });

    return () => {
      cancelled = true;
    };
  }, [authToken, progress?.learning_score]);

  return {
    progress,
    leaderboard,
    currentUserRank
  };
}
