"use client";

import { useEffect, useRef, useState } from "react";
import { buildNoticeFromError, fetchAssistantResponse } from "@/lib/api";
import {
  buildLocalAssistantResponse,
  createId,
  inferChatIntent
} from "@/lib/client-fallbacks";
import type {
  AssistantAction,
  AppNotice,
  ChatMessage,
  ChatResponse,
  Profile,
  SmartSuggestion,
  TimelineStep
} from "@/lib/types";


type UseChatOptions = {
  authToken: string | null;
  profile: Profile | null;
  timeline: TimelineStep[];
  activeStepId: string;
  completedSteps: string[];
  eli10Enabled: boolean;
  onNoticeChange: (notice: AppNotice | null) => void;
  onTopicResolved: (topicId: string) => void;
  onResponseTracked: (source: ChatResponse["source"]) => void;
};

type AssistantRequest = {
  topicId: string;
  action?: AssistantAction;
  scenarioId?: string;
  userText?: string;
};

export function useChat({
  authToken,
  profile,
  timeline,
  activeStepId,
  completedSteps,
  eli10Enabled,
  onNoticeChange,
  onTopicResolved,
  onResponseTracked
}: UseChatOptions) {
  const [assistant, setAssistant] = useState<ChatResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const assistantRequestRef = useRef(0);

  useEffect(() => {
    if (profile || messages.length === 0) return;
    setAssistant(null);
    setMessages([]);
    setInput("");
    setLoading(false);
  }, [messages.length, profile]);

  useEffect(() => {
    if (!profile || assistant || messages.length > 0) return;
    const fallbackResponse = buildLocalAssistantResponse(timeline, activeStepId, "explain", undefined, eli10Enabled);
    setAssistant(fallbackResponse);
    setMessages([
      {
        id: createId(),
        role: "assistant",
        text: fallbackResponse.title,
        response: fallbackResponse
      }
    ]);
  }, [activeStepId, assistant, eli10Enabled, messages.length, profile, timeline]);

  function pushMessage(message: ChatMessage) {
    setMessages((current) => [...current, message]);
  }

  async function loadAssistant({ topicId, action = "explain", scenarioId, userText }: AssistantRequest) {
    if (!profile) return null;

    const requestId = assistantRequestRef.current + 1;
    assistantRequestRef.current = requestId;
    setLoading(true);

    if (userText) {
      pushMessage({
        id: createId(),
        role: "user",
        text: userText
      });
    }

    try {
      if (!authToken) throw new Error("Missing auth token");
      const response = await fetchAssistantResponse({
        authToken,
        profile,
        topicId,
        action,
        eli10: eli10Enabled || action === "explain_simply",
        scenarioId,
        completedSteps,
        userInput: userText
      });

      if (assistantRequestRef.current !== requestId) return null;
      setAssistant(response);
      onTopicResolved(response.topic_id);
      onResponseTracked(response.source);
      pushMessage({
        id: createId(),
        role: "assistant",
        text: response.title,
        response
      });
      onNoticeChange(null);
      return response;
    } catch (error) {
      if (assistantRequestRef.current !== requestId) return null;

      const fallback = buildLocalAssistantResponse(
        timeline,
        topicId,
        action,
        scenarioId,
        eli10Enabled || action === "explain_simply"
      );
      setAssistant(fallback);
      onTopicResolved(fallback.topic_id);
      onResponseTracked(fallback.source);
      pushMessage({
        id: createId(),
        role: "assistant",
        text: fallback.title,
        response: fallback,
        error: true
      });
      onNoticeChange(buildNoticeFromError(error, "chat"));
      return fallback;
    } finally {
      if (assistantRequestRef.current === requestId) {
        setLoading(false);
      }
    }
  }

  async function submitChat() {
    if (!profile || loading || !input.trim()) return;
    const prompt = input.trim();
    setInput("");
    const intent = inferChatIntent(prompt, timeline, activeStepId);
    await loadAssistant({
      topicId: intent.topicId,
      action: intent.action,
      scenarioId: intent.scenarioId,
      userText: prompt
    });
  }

  async function applySuggestion(suggestion: SmartSuggestion) {
    await loadAssistant({
      topicId: suggestion.topic_id,
      action: suggestion.action,
      scenarioId: suggestion.scenario_id ?? undefined,
      userText: suggestion.label
    });
  }

  function resetChat() {
    setAssistant(null);
    setMessages([]);
    setInput("");
    setLoading(false);
  }

  return {
    assistant,
    messages,
    input,
    setInput,
    loading,
    submitChat,
    loadAssistant,
    applySuggestion,
    resetChat
  };
}
