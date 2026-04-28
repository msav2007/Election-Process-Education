import { expect, test } from "@playwright/test";


const timelinePayload = {
  steps: [
    {
      id: "registration",
      order: 1,
      title: "Registration",
      short_title: "Register",
      summary: "Eligible citizens enroll so their name appears on the voter list.",
      description: "Voter registration confirms that a person is eligible and mapped to the correct polling area before an election.",
      next_step_id: "nomination",
      keywords: ["eligibility", "documents", "voter list", "polling area"]
    },
    {
      id: "nomination",
      order: 2,
      title: "Nomination",
      short_title: "Nominate",
      summary: "Candidates formally submit documents to contest the election.",
      description: "Nomination is the official entry process for candidates.",
      next_step_id: "campaign",
      keywords: ["candidate", "forms", "scrutiny", "withdrawal"]
    },
    {
      id: "campaign",
      order: 3,
      title: "Campaign",
      short_title: "Campaign",
      summary: "Candidates explain their plans and ask voters for support.",
      description: "Campaigning helps voters compare public choices.",
      next_step_id: "voting",
      keywords: ["manifesto", "debate", "model code", "public meetings"]
    },
    {
      id: "voting",
      order: 4,
      title: "Voting",
      short_title: "Vote",
      summary: "Voters visit their polling station and cast their vote securely.",
      description: "Voting is the public participation step.",
      next_step_id: "counting",
      keywords: ["polling station", "ballot", "EVM", "secret vote"]
    },
    {
      id: "counting",
      order: 5,
      title: "Counting",
      short_title: "Count",
      summary: "Votes are counted under formal supervision.",
      description: "Counting converts ballots into verified totals.",
      next_step_id: "results",
      keywords: ["tally", "observers", "verification", "rounds"]
    },
    {
      id: "results",
      order: 6,
      title: "Results",
      short_title: "Results",
      summary: "The winner is declared and the official outcome is published.",
      description: "Results close the cycle.",
      next_step_id: null,
      keywords: ["winner", "declaration", "margin", "official result"]
    }
  ]
};

const chatPayload = {
  topic_id: "registration",
  title: "Lost voter ID",
  action: "scenario",
  preferred_version: "standard",
  standard: {
    answer: "Direct answer for the scenario.",
    simple_explanation: "Recover your voter details and prepare accepted identification.",
    steps: ["Check the voter list.", "Prepare accepted ID.", "Confirm polling details.", "Recheck before election day."],
    real_life_example: "A voter confirms their record before election day.",
    what_to_do_next: "Open Registration and confirm your requirements."
  },
  eli10_version: {
    answer: "Simple direct answer for the scenario.",
    simple_explanation: "This means you need to fix one voting problem before the day feels easy.",
    steps: ["Find your details.", "Keep ID ready.", "Ask for help if needed.", "Check again before the vote."],
    real_life_example: "A voter checks their name and ID before going to vote.",
    what_to_do_next: "Start with Registration."
  },
  journey_guidance: "Finish registration before moving deeper into the timeline.",
  smart_suggestions: [
    {
      label: "Explain Registration simply",
      topic_id: "registration",
      reason: "Switch to a simpler explanation.",
      action: "explain_simply",
      scenario_id: null
    }
  ],
  citations: [
    {
      title: "Vote.gov",
      url: "https://vote.gov/",
      note: "Official voter registration guidance.",
      publisher: "Vote.gov",
      trust_label: "Official source"
    }
  ],
  source: "guided-engine"
};

const quizPayload = {
  topic_id: "registration",
  title: "Registration Quiz",
  source: "guided-engine",
  questions: [
    {
      id: "registration-1",
      question: "Why does registration matter?",
      options: [
        "It confirms that your name is on the voter list.",
        "It replaces voting day.",
        "It publishes final results.",
        "It counts votes."
      ],
      correct_answer: 0,
      explanation: "Registration confirms eligibility and polling assignment."
    }
  ]
};

test("learner can complete an inline scenario, continue to chat, and take a quiz", async ({ page }) => {
  await page.route("**/timeline", async (route) => {
    await route.fulfill({ json: timelinePayload });
  });
  await page.route("**/auth/guest", async (route) => {
    await route.fulfill({
      json: {
        access_token: "test-token",
        token_type: "bearer",
        user_id: "learner-1234",
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      }
    });
  });
  await page.route("**/progress", async (route) => {
    await route.fulfill({
      json: {
        completed_count: 1,
        total_count: 6,
        progress_percent: 17,
        current_phase: "Registration in progress",
        next_step_id: "nomination",
        next_step_title: "Nomination",
        recommended_topic_id: "registration",
        recommended_topic_title: "Registration",
        learning_score: 30,
        personalized_path: [
          {
            topic_id: "registration",
            title: "Registration",
            reason: "This is the current focus.",
            priority: 1
          }
        ],
        adaptive_path: {
          status: "continue",
          confidence_score: 63,
          headline: "Keep building the foundation",
          rationale: "Progress is steady.",
          recommended_action: "Continue with Registration.",
          focus_topic_id: "registration",
          focus_topic_title: "Registration",
          support_topics: [
            {
              topic_id: "registration",
              title: "Registration",
              reason: "Current focus.",
              priority: 2
            }
          ],
          unlocked_topics: []
        },
        message: "Stay focused on registration."
      }
    });
  });
  await page.route("**/leaderboard", async (route) => {
    await route.fulfill({
      json: {
        entries: [
          {
            rank: 1,
            user_id_alias: "Learner-1234",
            profile: "beginner",
            learning_score: 30,
            progress_percent: 17,
            completed_count: 1,
            current_topic_title: "Registration",
            is_current_user: true
          }
        ],
        current_user_rank: 1
      }
    });
  });
  await page.route("**/chat", async (route) => {
    await route.fulfill({ json: chatPayload });
  });
  await page.route("**/quiz", async (route) => {
    await route.fulfill({ json: quizPayload });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Beginner" }).click();

  await page.getByRole("button", { name: "Scenarios" }).click();
  await page.getByRole("button", { name: /Lost voter ID/i }).click();
  await expect(page.getByText("Recover your voter details and prepare accepted identification.")).toBeVisible();

  await page.getByRole("button", { name: /Continue in chat/i }).click();
  await expect(page.getByText("Response mode:")).toBeVisible();
  await expect(page.getByRole("button", { name: /Explain Registration simply/i }).first()).toBeVisible();

  await page.getByRole("button", { name: "Quiz" }).click();
  await page.getByRole("button", { name: /Start quiz/i }).click();
  await page.getByRole("radio", { name: /It confirms that your name is on the voter list\./i }).click();
  await page.getByRole("button", { name: /Submit quiz/i }).click();
  await expect(page.getByText("Score 1/1")).toBeVisible();
});
