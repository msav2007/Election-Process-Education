import { localTimeline, scenarioOptions } from "./local-data";
import type {
  AdaptiveLearningPath,
  AssistantAction,
  ChatResponse,
  ContentVersion,
  ProgressResponse,
  QuizResponse,
  TimelineStep
} from "./types";


export function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function sortTimeline(steps: TimelineStep[]) {
  return [...steps].sort((left, right) => left.order - right.order);
}

export function getNextStepId(steps: TimelineStep[], stepId: string) {
  const ordered = sortTimeline(steps);
  const index = ordered.findIndex((step) => step.id === stepId);
  return index >= 0 ? ordered[index + 1]?.id ?? null : null;
}

export function getStepById(steps: TimelineStep[], stepId: string) {
  return steps.find((step) => step.id === stepId) ?? sortTimeline(steps)[0] ?? localTimeline[0];
}

export function buildLocalProgress(
  timeline: TimelineStep[],
  activeStepId: string,
  completedSteps: string[],
  quizScores: Record<string, number>
): ProgressResponse {
  const ordered = sortTimeline(timeline);
  const completedCount = new Set(completedSteps).size;
  const totalCount = ordered.length;
  const current = getStepById(ordered, activeStepId);
  const next = ordered.find((step) => step.id === current.next_step_id) ?? null;
  const weakestTopic = Object.entries(quizScores).sort((left, right) => left[1] - right[1])[0]?.[0] ?? null;
  const recommended = weakestTopic ? getStepById(ordered, weakestTopic) : next;
  const currentScore = quizScores[activeStepId] ?? null;
  const adaptivePath: AdaptiveLearningPath =
    weakestTopic && quizScores[weakestTopic] <= 1
      ? {
          status: "revise",
          confidence_score: 44,
          headline: `Revision recommended: ${getStepById(ordered, weakestTopic).title}`,
          rationale: "Local scoring detected a weak quiz topic, so revision is prioritized before deeper content.",
          recommended_action: `Review ${getStepById(ordered, weakestTopic).title} and retake the quiz.`,
          focus_topic_id: weakestTopic,
          focus_topic_title: getStepById(ordered, weakestTopic).title,
          support_topics: [
            {
              topic_id: weakestTopic,
              title: getStepById(ordered, weakestTopic).title,
              reason: "This topic needs reinforcement before the path accelerates.",
              priority: 1
            }
          ],
          unlocked_topics: []
        }
      : currentScore !== null && currentScore >= 3
        ? {
            status: "advance",
            confidence_score: 82,
            headline: "Advanced topics unlocked",
            rationale: "Strong local quiz performance unlocked deeper election-process stages early.",
            recommended_action: `Preview ${(next ?? current).title} or jump ahead to a verification-heavy topic.`,
            focus_topic_id: next?.id ?? current.id,
            focus_topic_title: next?.title ?? current.title,
            support_topics: [
              {
                topic_id: current.id,
                title: current.title,
                reason: "Your current topic provides the context for the advanced preview.",
                priority: 2
              }
            ],
            unlocked_topics: ordered
              .filter((step) => !completedSteps.includes(step.id) && ["campaign", "counting", "results"].includes(step.id))
              .slice(0, 2)
              .map((step) => ({
                topic_id: step.id,
                title: step.title,
                reason: "Unlocked from strong quiz performance in the local path.",
                priority: 2
              }))
          }
        : {
            status: "continue",
            confidence_score: 63,
            headline: "Keep building the foundation",
            rationale: "Local progress signals suggest the sequential path is still the smartest move.",
            recommended_action: `Continue with ${(next ?? current).title} and confirm understanding with the quiz.`,
            focus_topic_id: next?.id ?? current.id,
            focus_topic_title: next?.title ?? current.title,
            support_topics: [
              {
                topic_id: next?.id ?? current.id,
                title: next?.title ?? current.title,
                reason: "This is the best next step in the local fallback path.",
                priority: 2
              }
            ],
            unlocked_topics: []
          };

  return {
    completed_count: completedCount,
    total_count: totalCount,
    progress_percent: totalCount ? Math.round((completedCount / totalCount) * 100) : 0,
    current_phase: completedCount === totalCount ? "Completed" : `${current.title} in progress`,
    next_step_id: next?.id ?? null,
    next_step_title: next?.title ?? null,
    recommended_topic_id: recommended?.id ?? null,
    recommended_topic_title: recommended?.title ?? null,
    learning_score: completedCount * 20 + Object.values(quizScores).reduce((sum, score) => sum + score * 10, 0),
    personalized_path: ordered
      .filter((step) => !completedSteps.includes(step.id))
      .slice(0, 4)
      .map((step, index) => ({
        topic_id: step.id,
        title: step.title,
        reason: index === 0 ? "This is the next unfinished step in your timeline." : "Keep moving through the timeline in order.",
        priority: index === 0 ? 1 : 3
      })),
    adaptive_path: adaptivePath,
    message:
      completedCount === totalCount
        ? "Your guided election-process journey is complete."
        : `You have completed ${completedCount} of ${totalCount} steps. ${adaptivePath.headline}.`
  };
}

export function buildLocalAssistantResponse(
  timeline: TimelineStep[],
  topicId: string,
  action: AssistantAction,
  scenarioId?: string,
  preferEli10 = false
): ChatResponse {
  const ordered = sortTimeline(timeline);
  const step = getStepById(ordered, topicId);
  const nextStep = ordered.find((item) => item.id === step.next_step_id);
  const scenario = scenarioOptions.find((item) => item.id === scenarioId);
  const titlePrefix =
    action === "scenario" && scenario
      ? scenario.label
      : action === "give_example"
        ? "Example"
        : action === "next_step"
          ? "Next step"
          : action === "explain_simply"
            ? "Simple explanation"
            : "Explanation";

  const baseExplanation = scenario
    ? `${scenario.label}: focus on ${step.title.toLowerCase()} first. ${scenario.description}`
    : `${step.title} is one stage in the election process. ${step.summary}`;

  const standard: ContentVersion = {
    answer: `${step.title} helps the election move forward in a predictable way, and it is worth understanding before you advance.`,
    simple_explanation: baseExplanation,
    steps: [
      `Understand the purpose of ${step.title.toLowerCase()}.`,
      `Check the required details: ${step.keywords.slice(0, 3).join(", ")}.`,
      nextStep ? `After this, continue to ${nextStep.title.toLowerCase()}.` : "Review the final result and official information.",
      "Use an official election source to confirm deadlines or requirements."
    ],
    real_life_example: scenario
      ? `If this happens to you, start with the official voter or election office guidance for ${step.title.toLowerCase()} and keep copies of any documents you submit.`
      : `For example, during ${step.title.toLowerCase()}, a voter should know what information is checked and what action comes next.`,
    what_to_do_next: nextStep
      ? `Open ${nextStep.title} when you are ready to continue.`
      : "You have reached the final stage. Review what you learned or test yourself with a quiz."
  };

  const eli10Version: ContentVersion = {
    answer: `${step.title} is one important part of the election journey.`,
    simple_explanation: `${step.title} is one part of the election journey, and it helps the next part happen the right way.`,
    steps: [
      `Learn what ${step.title.toLowerCase()} is for.`,
      "Check the one thing you need to prepare.",
      "Use an official source if anything feels confusing.",
      nextStep ? `Then learn ${nextStep.title.toLowerCase()}.` : "Then review the whole journey."
    ],
    real_life_example: `Think of ${step.title.toLowerCase()} like one step in a school event where everyone follows the same rule.`,
    what_to_do_next: standard.what_to_do_next
  };

  return {
    topic_id: step.id,
    title: `${titlePrefix}: ${step.title}`,
    action,
    preferred_version: preferEli10 ? "eli10" : "standard",
    standard,
    eli10_version: eli10Version,
    journey_guidance: "Using local guidance while the live AI service is unavailable. The workspace remains fully usable.",
    smart_suggestions: [
      {
        label: `Explain ${step.title} simply`,
        topic_id: step.id,
        action: "explain_simply",
        scenario_id: null,
        reason: "Switch to ELI10 mode for a lower-jargon version."
      },
      ...(nextStep
        ? [
            {
              label: `Preview ${nextStep.title}`,
              topic_id: nextStep.id,
              action: "explain" as const,
              scenario_id: null,
              reason: "Stay one step ahead in the timeline."
            }
          ]
        : [])
    ],
    citations: [
      {
        title: "USAGov: Voting and elections",
        url: "https://www.usa.gov/voting",
        note: "General official election-process guidance.",
        publisher: "USAGov",
        trust_label: "Official source"
      },
      {
        title: "EAC: Register and vote in your state",
        url: "https://www.eac.gov/voters/register-and-vote-in-your-state",
        note: "Official state election office links and rules.",
        publisher: "U.S. Election Assistance Commission",
        trust_label: "Election administration"
      },
      {
        title: "USAGov: Confirm your voter registration",
        url: "https://www.usa.gov/confirm-voter-registration",
        note: "Official registration verification guidance.",
        publisher: "USAGov",
        trust_label: "Federal guidance"
      }
    ],
    source: "guided-engine"
  };
}

export function buildLocalQuiz(timeline: TimelineStep[], topicId: string): QuizResponse {
  const step = getStepById(timeline, topicId);
  const nextStep = timeline.find((item) => item.id === step.next_step_id);

  return {
    topic_id: step.id,
    title: `${step.title} quick check`,
    source: "guided-engine",
    questions: [
      {
        id: `${step.id}-purpose`,
        question: `What is the main purpose of ${step.title.toLowerCase()}?`,
        options: [
          step.summary,
          "To skip the official election process.",
          "To replace all other election stages.",
          "To stop voters from understanding the journey."
        ],
        correct_answer: 0,
        explanation: step.summary
      },
      {
        id: `${step.id}-keyword`,
        question: "Which item is most related to this step?",
        options: [
          step.keywords[0] ?? "official process",
          "movie tickets",
          "weather forecast",
          "sports ranking"
        ],
        correct_answer: 0,
        explanation: `${step.keywords[0] ?? "The official process"} is connected to ${step.title.toLowerCase()}.`
      },
      {
        id: `${step.id}-next`,
        question: "What should you do after understanding this step?",
        options: [
          nextStep ? "Move to the next timeline step." : "Review the final result.",
          "Ignore the rest of the timeline.",
          "Start from a random step every time.",
          "Assume all elections follow the same local rules."
        ],
        correct_answer: 0,
        explanation: nextStep ? `${nextStep.title} follows ${step.title} in the timeline.` : "This is the end of the timeline."
      }
    ]
  };
}

export function inferChatIntent(
  query: string,
  timeline: TimelineStep[],
  activeStepId: string
): { action: AssistantAction; topicId: string; scenarioId?: string } {
  const text = query.toLowerCase();
  const scenario = scenarioOptions.find(
    (item) =>
      text.includes(item.label.toLowerCase()) ||
      (item.id === "lost_voter_id" && (text.includes("lost voter id") || (text.includes("lost") && text.includes("voter")))) ||
      (item.id === "moved_city" && (text.includes("moved") || text.includes("city"))) ||
      (item.id === "first_time_vote" && text.includes("first time"))
  );

  if (scenario) {
    return { action: "scenario", topicId: activeStepId, scenarioId: scenario.id };
  }

  if (text.includes("eli10") || text.includes("simple") || text.includes("like i'm 10") || text.includes("like i am 10")) {
    return { action: "explain_simply", topicId: activeStepId };
  }

  if (text.includes("example")) {
    return { action: "give_example", topicId: activeStepId };
  }

  if (text.includes("next")) {
    return { action: "next_step", topicId: activeStepId };
  }

  const matchedStep = timeline.find(
    (step) =>
      text.includes(step.id.toLowerCase()) ||
      text.includes(step.title.toLowerCase()) ||
      text.includes(step.short_title.toLowerCase())
  );

  return { action: "explain", topicId: matchedStep?.id ?? activeStepId };
}
