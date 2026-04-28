"use client";

import { useEffect, useState } from "react";
import { buildNoticeFromError, fetchQuiz } from "@/lib/api";
import { buildLocalQuiz } from "@/lib/client-fallbacks";
import type { AppNotice, Profile, QuizResponse, TimelineStep } from "@/lib/types";


type UseQuizOptions = {
  authToken: string | null;
  profile: Profile | null;
  timeline: TimelineStep[];
  activeStepId: string;
  eli10Enabled: boolean;
  onNoticeChange: (notice: AppNotice | null) => void;
  onScoreCommitted: (topicId: string, score: number) => void;
  onQuizTracked: (source: QuizResponse["source"]) => void;
};

export function useQuiz({
  authToken,
  profile,
  timeline,
  activeStepId,
  eli10Enabled,
  onNoticeChange,
  onScoreCommitted,
  onQuizTracked
}: UseQuizOptions) {
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuiz(null);
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(null);
  }, [activeStepId, eli10Enabled]);

  async function startQuiz() {
    if (!profile) return;

    const fallbackQuiz = buildLocalQuiz(timeline, activeStepId);
    setLoading(true);
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(null);

    try {
      if (!authToken) throw new Error("Missing auth token");
      const response = await fetchQuiz({
        authToken,
        profile,
        topicId: activeStepId,
        eli10: eli10Enabled
      });
      setQuiz(response);
      onQuizTracked(response.source);
      onNoticeChange(null);
    } catch (error) {
      setQuiz(fallbackQuiz);
      onQuizTracked(fallbackQuiz.source);
      onNoticeChange(buildNoticeFromError(error, "quiz"));
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(questionId: string, optionIndex: number) {
    setSelectedAnswers((current) => ({ ...current, [questionId]: optionIndex }));
  }

  function submitQuiz() {
    if (!quiz) return;

    const nextScore = quiz.questions.reduce((total, question) => {
      return total + (selectedAnswers[question.id] === question.correct_answer ? 1 : 0);
    }, 0);

    setScore(nextScore);
    setSubmitted(true);
    onScoreCommitted(quiz.topic_id, nextScore);
  }

  return {
    quiz,
    selectedAnswers,
    submitted,
    score,
    loading,
    startQuiz,
    selectAnswer,
    submitQuiz
  };
}
