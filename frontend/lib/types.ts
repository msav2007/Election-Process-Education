export type Profile = "first_time_voter" | "beginner" | "advanced";

export type AssistantAction = "explain" | "explain_simply" | "give_example" | "next_step" | "scenario";
export type ResponseVersion = "standard" | "eli10";

export type TimelineStep = {
  id: string;
  order: number;
  title: string;
  short_title: string;
  summary: string;
  description: string;
  next_step_id: string | null;
  keywords: string[];
};

export type ContentVersion = {
  answer: string;
  simple_explanation: string;
  steps: string[];
  real_life_example: string;
  what_to_do_next: string;
};

export type SmartSuggestion = {
  label: string;
  topic_id: string;
  reason: string;
  action: AssistantAction;
  scenario_id: string | null;
};

export type Citation = {
  title: string;
  url: string;
  note: string;
  publisher: string;
  trust_label: "Official source" | "Federal guidance" | "Election administration";
};

export type ChatResponse = {
  topic_id: string;
  title: string;
  action: AssistantAction;
  preferred_version: ResponseVersion;
  standard: ContentVersion;
  eli10_version: ContentVersion;
  journey_guidance: string;
  smart_suggestions: SmartSuggestion[];
  citations: Citation[];
  source: "gemini" | "guided-engine";
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  response?: ChatResponse;
  error?: boolean;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
};

export type QuizResponse = {
  topic_id: string;
  title: string;
  questions: QuizQuestion[];
  source: "gemini" | "guided-engine";
};

export type ProgressResponse = {
  completed_count: number;
  total_count: number;
  progress_percent: number;
  current_phase: string;
  next_step_id: string | null;
  next_step_title: string | null;
  recommended_topic_id: string | null;
  recommended_topic_title: string | null;
  learning_score: number;
  personalized_path: PersonalizedStep[];
  adaptive_path: AdaptiveLearningPath;
  message: string;
};

export type PersonalizedStep = {
  topic_id: string;
  title: string;
  reason: string;
  priority: number;
};

export type AdaptiveLearningPath = {
  status: "revise" | "continue" | "advance";
  confidence_score: number;
  headline: string;
  rationale: string;
  recommended_action: string;
  focus_topic_id: string | null;
  focus_topic_title: string | null;
  support_topics: PersonalizedStep[];
  unlocked_topics: PersonalizedStep[];
};

export type LeaderboardEntry = {
  rank: number;
  user_id_alias: string;
  profile: Profile | null;
  learning_score: number;
  progress_percent: number;
  completed_count: number;
  current_topic_title: string;
  is_current_user: boolean;
};

export type LeaderboardResponse = {
  entries: LeaderboardEntry[];
  current_user_rank: number | null;
};

export type AuthSession = {
  access_token: string;
  token_type: "bearer";
  user_id: string;
  expires_at: string;
};

export type AppNotice = {
  tone: "info" | "warning";
  title: string;
  message: string;
  suggestions: string[];
  requestId?: string;
};

export type DemoStepId =
  | "select_profile"
  | "view_timeline"
  | "ask_scenario"
  | "take_quiz"
  | "view_insights"
  | "complete";

export type DemoMilestones = {
  timeline_viewed: boolean;
  scenario_asked: boolean;
  quiz_completed: boolean;
  insights_viewed: boolean;
};

export type AiTelemetry = {
  assistant_live: number;
  assistant_fallback: number;
  quiz_live: number;
  quiz_fallback: number;
};

export type LearningInsightSnapshot = {
  accuracyTrend: Array<{
    topicId: string;
    title: string;
    score: number;
    percent: number;
  }>;
  averageAccuracy: number;
  adaptiveStatus: AdaptiveLearningPath["status"];
  fallbackUsagePercent: number;
  topicsMastered: string[];
  totalInteractions: number;
};

export type ToastMessage = {
  id: string;
  tone: "success" | "error" | "info";
  title: string;
  description: string;
};
