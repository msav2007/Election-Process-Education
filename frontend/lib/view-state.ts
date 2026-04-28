export type PageId = "dashboard" | "timeline" | "scenarios" | "chat" | "quiz";

export const pageTitles: Record<PageId, string> = {
  dashboard: "Dashboard",
  timeline: "Timeline",
  scenarios: "Scenarios",
  chat: "Chat",
  quiz: "Quiz"
};

export function isPageId(value: unknown): value is PageId {
  return typeof value === "string" && ["dashboard", "timeline", "scenarios", "chat", "quiz"].includes(value);
}
