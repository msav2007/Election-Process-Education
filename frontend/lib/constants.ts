import type { Profile } from "./types";


export const STORAGE_KEY = "election-copilot-state";
export const AUTH_STORAGE_KEY = "election-copilot-auth";
export const API_NOTICE_FALLBACK = "Live API is unavailable. Local fallback content is active.";

export const profileLabels: Record<Profile, string> = {
  first_time_voter: "First-time voter",
  beginner: "Beginner",
  advanced: "Advanced"
};
