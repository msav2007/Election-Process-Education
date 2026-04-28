import type {
  AssistantAction,
  AppNotice,
  AuthSession,
  ChatResponse,
  LeaderboardResponse,
  Profile,
  ProgressResponse,
  QuizResponse,
  TimelineStep
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID || "election-copilot-web";
const REQUEST_TIMEOUT_MS = 8000;

type ApiErrorPayload = {
  error?: string;
  message?: string;
  user_action?: string;
  suggestions?: string[];
  request_id?: string;
  retry_after_seconds?: number;
};

export class ApiRequestError extends Error {
  status: number;
  code: string;
  userAction: string;
  suggestions: string[];
  requestId?: string;
  retryAfterSeconds?: number;

  constructor(input: {
    status: number;
    code: string;
    message: string;
    userAction: string;
    suggestions: string[];
    requestId?: string;
    retryAfterSeconds?: number;
  }) {
    super(input.message);
    this.name = "ApiRequestError";
    this.status = input.status;
    this.code = input.code;
    this.userAction = input.userAction;
    this.suggestions = input.suggestions;
    this.requestId = input.requestId;
    this.retryAfterSeconds = input.retryAfterSeconds;
  }
}

async function parseError(response: Response): Promise<ApiRequestError> {
  const rawText = await response.text();
  let payload: ApiErrorPayload | null = null;

  try {
    payload = rawText ? (JSON.parse(rawText) as ApiErrorPayload) : null;
  } catch {
    payload = null;
  }

  return new ApiRequestError({
    status: response.status,
    code: payload?.error ?? "request_failed",
    message: payload?.message ?? (rawText || `Request failed with ${response.status}`),
    userAction: payload?.user_action ?? "Retry in a moment.",
    suggestions: payload?.suggestions ?? [],
    requestId: payload?.request_id ?? response.headers.get("x-request-id") ?? undefined,
    retryAfterSeconds: payload?.retry_after_seconds
  });
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    signal: options?.signal ?? controller.signal,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    }
  }).finally(() => window.clearTimeout(timeout));

  if (!response.ok) {
    throw await parseError(response);
  }

  return response.json() as Promise<T>;
}

export function buildNoticeFromError(error: unknown, area: "chat" | "quiz" | "progress" | "session"): AppNotice {
  const defaults: Record<"chat" | "quiz" | "progress" | "session", AppNotice> = {
    chat: {
      tone: "warning",
      title: "Using guided chat fallback",
      message: "The live assistant is unavailable, so the local guidance engine is answering with structured election content.",
      suggestions: ["Review the visible sources while the live model recovers.", "Retry with one focused follow-up question."]
    },
    quiz: {
      tone: "warning",
      title: "Using local quiz generation",
      message: "The live quiz generator is unavailable, so a local quiz has been prepared for the active topic.",
      suggestions: ["Finish the local quiz now.", "Retry generation later if you want fresh questions."]
    },
    progress: {
      tone: "warning",
      title: "Using local progress tracking",
      message: "The live progress service is unavailable, so the dashboard is showing local adaptive guidance.",
      suggestions: ["Keep learning normally; progress will still update locally.", "Retry later to sync leaderboard placement."]
    },
    session: {
      tone: "warning",
      title: "Session refresh needed",
      message: "The secure guest session could not be verified for this request.",
      suggestions: ["Reset the learner profile to issue a fresh session.", "Retry after the session refresh completes."]
    }
  };

  if (error instanceof ApiRequestError) {
    if (error.code === "auth_required" || error.status === 401) {
      return {
        tone: "warning",
        title: "Session refresh needed",
        message: error.message,
        suggestions: error.suggestions.length ? error.suggestions : defaults.session.suggestions,
        requestId: error.requestId
      };
    }

    if (error.code === "rate_limit_exceeded" || error.status === 429) {
      const retryDetail = error.retryAfterSeconds ? ` Try again in about ${error.retryAfterSeconds}s.` : "";
      return {
        tone: "warning",
        title: "Cooling down the live service",
        message: `${error.message}${retryDetail}`,
        suggestions: error.suggestions.length ? error.suggestions : defaults[area].suggestions,
        requestId: error.requestId
      };
    }

    return {
      tone: area === "progress" ? "info" : "warning",
      title: defaults[area].title,
      message: error.message,
      suggestions: error.suggestions.length ? error.suggestions : defaults[area].suggestions,
      requestId: error.requestId
    };
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return {
      tone: "warning",
      title: defaults[area].title,
      message: "The request took too long, so the UI switched to the resilient local path.",
      suggestions: defaults[area].suggestions
    };
  }

  return defaults[area];
}

export async function fetchTimeline(): Promise<TimelineStep[]> {
  const data = await request<{ steps: TimelineStep[] }>("/timeline");
  return data.steps;
}

export async function fetchGuestSession(profile?: Profile | null): Promise<AuthSession> {
  return request<AuthSession>("/auth/guest", {
    method: "POST",
    headers: {
      "X-Client-Id": CLIENT_ID
    },
    body: JSON.stringify({
      profile: profile ?? null
    })
  });
}

export async function fetchAssistantResponse(input: {
  authToken: string;
  profile: Profile;
  topicId: string;
  action: AssistantAction;
  eli10: boolean;
  scenarioId?: string;
  completedSteps: string[];
  userInput?: string;
}): Promise<ChatResponse> {
  return request<ChatResponse>("/chat", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.authToken}`
    },
    body: JSON.stringify({
      profile: input.profile,
      topic_id: input.topicId,
      action: input.action,
      eli10: input.eli10,
      scenario_id: input.scenarioId,
      completed_steps: input.completedSteps,
      user_input: input.userInput
    })
  });
}

export async function fetchQuiz(input: {
  authToken: string;
  profile: Profile;
  topicId: string;
  eli10: boolean;
}): Promise<QuizResponse> {
  return request<QuizResponse>("/quiz", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.authToken}`
    },
    body: JSON.stringify({
      profile: input.profile,
      topic_id: input.topicId,
      count: 3,
      eli10: input.eli10
    })
  });
}

export async function fetchProgress(input: {
  authToken: string;
  profile: Profile;
  currentTopicId: string;
  completedSteps: string[];
  quizScores: Record<string, number>;
}): Promise<ProgressResponse> {
  return request<ProgressResponse>("/progress", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.authToken}`
    },
    body: JSON.stringify({
      profile: input.profile,
      current_topic_id: input.currentTopicId,
      completed_steps: input.completedSteps,
      quiz_scores: input.quizScores
    })
  });
}

export async function fetchLeaderboard(authToken: string): Promise<LeaderboardResponse> {
  return request<LeaderboardResponse>("/leaderboard", {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });
}
