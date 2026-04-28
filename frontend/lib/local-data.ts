import type { TimelineStep } from "./types";

export const localTimeline: TimelineStep[] = [
  {
    id: "registration",
    order: 1,
    title: "Registration",
    short_title: "Register",
    summary: "Eligible citizens enroll so their name appears on the voter list.",
    description: "Confirm eligibility, documents, and polling area.",
    next_step_id: "nomination",
    keywords: ["eligibility", "documents", "voter list", "polling area"]
  },
  {
    id: "nomination",
    order: 2,
    title: "Nomination",
    short_title: "Nominate",
    summary: "Candidates formally submit documents to contest the election.",
    description: "Candidate papers are filed, reviewed, and accepted or rejected.",
    next_step_id: "campaign",
    keywords: ["candidate", "forms", "scrutiny", "withdrawal"]
  },
  {
    id: "campaign",
    order: 3,
    title: "Campaign",
    short_title: "Campaign",
    summary: "Candidates explain their plans and ask voters for support.",
    description: "Voters compare promises, debates, meetings, and public records.",
    next_step_id: "voting",
    keywords: ["manifesto", "debate", "model code", "public meetings"]
  },
  {
    id: "voting",
    order: 4,
    title: "Voting",
    short_title: "Vote",
    summary: "Voters visit their polling station and cast their vote securely.",
    description: "Identity is verified and the vote is cast privately.",
    next_step_id: "counting",
    keywords: ["polling station", "ballot", "EVM", "secret vote"]
  },
  {
    id: "counting",
    order: 5,
    title: "Counting",
    short_title: "Count",
    summary: "Votes are counted under formal supervision.",
    description: "Votes are tallied, verified, and recorded through official procedure.",
    next_step_id: "results",
    keywords: ["tally", "observers", "verification", "rounds"]
  },
  {
    id: "results",
    order: 6,
    title: "Results",
    short_title: "Results",
    summary: "The winner is declared and the official outcome is published.",
    description: "Final numbers and winner information become official.",
    next_step_id: null,
    keywords: ["winner", "declaration", "margin", "official result"]
  }
];

export const scenarioOptions = [
  {
    id: "lost_voter_id",
    label: "Lost voter ID",
    description: "Recover details and prepare accepted identification."
  },
  {
    id: "moved_city",
    label: "Moved city",
    description: "Update your registration and polling area."
  },
  {
    id: "first_time_vote",
    label: "First-time voter",
    description: "Prepare documents, location, and voting-day steps."
  }
];
