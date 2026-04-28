import { CheckCircle2, Loader2, Play, Sparkles, XCircle } from "lucide-react";
import type { AdaptiveLearningPath, QuizResponse } from "@/lib/types";

function AdaptiveReviewCard({ adaptivePath }: { adaptivePath: AdaptiveLearningPath }) {
  const tone =
    adaptivePath.status === "advance"
      ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]"
      : adaptivePath.status === "revise"
        ? "border-[#FED7AA] bg-[#FFF7ED] text-[#9A3412]"
        : "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]";

  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="h-4 w-4" />
        {adaptivePath.headline}
      </div>
      <p className="mt-2 text-sm leading-6 text-[#111827]">{adaptivePath.rationale}</p>
      <p className="mt-3 text-sm font-medium text-[#111827]">{adaptivePath.recommended_action}</p>
    </div>
  );
}

export function QuizCard({
  quiz,
  loading,
  selectedAnswers,
  submitted,
  score,
  adaptivePath,
  highlighted,
  isLastStep,
  onSelect,
  onSubmit,
  onStart,
  onNextStep
}: {
  quiz: QuizResponse | null;
  loading: boolean;
  selectedAnswers: Record<string, number>;
  submitted: boolean;
  score: number | null;
  adaptivePath: AdaptiveLearningPath | null;
  highlighted: boolean;
  isLastStep: boolean;
  onSelect: (questionId: string, optionIndex: number) => void;
  onSubmit: () => void;
  onStart: () => void;
  onNextStep: () => void;
}) {
  if (loading) {
    return (
      <section id="quiz" className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm font-semibold text-[#111827]">
            <Loader2 className="h-5 w-5 animate-spin text-[#2563EB]" />
            Generating your quiz
          </div>
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
              <div className="h-5 w-3/4 rounded-full bg-[#E5E7EB]" />
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {Array.from({ length: 4 }).map((__, optionIndex) => (
                  <div key={optionIndex} className="h-12 rounded-2xl bg-white" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!quiz) {
    return (
      <section
        id="quiz"
        className={`rounded-2xl border bg-white p-6 shadow-sm transition duration-200 ${
          highlighted ? "border-[#F59E0B] ring-4 ring-[#FDE68A]/60" : "border-[#E5E7EB]"
        }`}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
              {highlighted ? "Demo step 4" : "Quiz"}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[#111827]">No quiz taken yet</h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-[#6B7280]">
              Generate MCQs for the active timeline step and review explanations after you submit.
            </p>
          </div>
          <button
            type="button"
            onClick={onStart}
            className={`inline-flex w-fit items-center gap-2 rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:scale-[1.01] hover:bg-[#1D4ED8] active:scale-[0.99] ${
              highlighted ? "ring-4 ring-[#DBEAFE]" : ""
            }`}
          >
            <Play className="h-4 w-4" />
            Start quiz
          </button>
        </div>
      </section>
    );
  }

  const allAnswered = quiz.questions.every((question) => selectedAnswers[question.id] !== undefined);
  const maxScore = quiz.questions.length;
  const scorePercent = score !== null ? Math.round((score / maxScore) * 100) : 0;

  return (
    <section id="quiz" className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#E5E7EB] pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">Quiz</p>
          <h2 className="mt-2 text-xl font-semibold text-[#111827]">{quiz.title}</h2>
        </div>
        {submitted && score !== null ? (
          <div className="rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-3 text-sm font-semibold text-[#1D4ED8]">
            Score {score}/{quiz.questions.length} - {scorePercent}%
          </div>
        ) : null}
      </div>

      <div className="mt-5 space-y-5">
        {quiz.questions.map((question, questionIndex) => {
          const selected = selectedAnswers[question.id];

          return (
            <fieldset key={question.id} className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
              <legend className="text-sm font-semibold leading-6 text-[#111827]">
                {questionIndex + 1}. {question.question}
              </legend>
              <div className="mt-4 grid gap-3 md:grid-cols-2" role="radiogroup" aria-label={question.question}>
                {question.options.map((option, optionIndex) => {
                  const isSelected = selected === optionIndex;
                  const isCorrect = submitted && question.correct_answer === optionIndex;
                  const isWrong = submitted && isSelected && question.correct_answer !== optionIndex;

                  return (
                    <label
                      key={option}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition duration-200 ${
                        isCorrect
                          ? "border-[#10B981] bg-[#ECFDF5] text-[#065F46] ring-2 ring-[#A7F3D0]"
                          : isWrong
                            ? "border-[#FCA5A5] bg-[#FEF2F2] text-[#991B1B]"
                            : isSelected
                              ? "border-[#2563EB] bg-white text-[#111827] ring-2 ring-[#BFDBFE]"
                              : "border-[#E5E7EB] bg-white text-[#6B7280] hover:-translate-y-0.5 hover:border-[#2563EB] hover:text-[#111827]"
                      }`}
                    >
                      <span className="flex items-start gap-3">
                        <input
                          type="radio"
                          name={question.id}
                          value={optionIndex}
                          checked={isSelected}
                          onChange={() => onSelect(question.id, optionIndex)}
                          disabled={submitted}
                          className="mt-1 h-4 w-4 border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                        />
                        <span className="flex-1">
                          <span className="flex items-start justify-between gap-3">
                            <span>{option}</span>
                            {submitted && isCorrect ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" /> : null}
                            {submitted && isWrong ? <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]" /> : null}
                          </span>
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {submitted ? (
                <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm leading-6 text-[#475569]">
                  {question.explanation}
                </div>
              ) : null}
            </fieldset>
          );
        })}
      </div>

      {submitted && adaptivePath ? <div className="mt-5"><AdaptiveReviewCard adaptivePath={adaptivePath} /></div> : null}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] pt-5">
        <p className="text-sm text-[#6B7280]">
          {submitted ? "Review the explanations, then follow the adaptive recommendation before moving on." : "Answer every question to unlock your score and adaptive guidance."}
        </p>
        {submitted ? (
          <button
            type="button"
            onClick={onNextStep}
            className="inline-flex items-center gap-2 rounded-[10px] border border-[#2563EB] bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:scale-[1.01] hover:brightness-110 hover:shadow-md active:scale-[0.99]"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isLastStep ? "Journey Completed" : "Next Step"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!allAnswered}
            className="rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:scale-[1.01] hover:bg-[#1D4ED8] active:scale-[0.99] disabled:cursor-not-allowed disabled:border-[#E5E7EB] disabled:bg-[#E5E7EB] disabled:text-[#6B7280]"
          >
            Submit quiz
          </button>
        )}
      </div>
    </section>
  );
}
