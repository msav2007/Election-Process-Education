import { fireEvent, render, screen } from "@testing-library/react";
import { QuizCard } from "@/components/QuizCard";
import type { QuizResponse } from "@/lib/types";


const quiz: QuizResponse = {
  topic_id: "voting",
  title: "Voting Quiz",
  source: "guided-engine",
  questions: [
    {
      id: "q1",
      question: "What happens during voting?",
      options: ["People cast a secret vote.", "Results are published.", "Candidates register.", "Votes are counted."],
      correct_answer: 0,
      explanation: "Voting is when voters cast a secret vote."
    }
  ]
};

describe("QuizCard", () => {
  it("uses accessible radio inputs and enables submit after an answer is selected", () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <QuizCard
        quiz={quiz}
        loading={false}
        selectedAnswers={{}}
        submitted={false}
        score={null}
        adaptivePath={null}
        highlighted={false}
        isLastStep={false}
        onSelect={onSelect}
        onSubmit={vi.fn()}
        onStart={vi.fn()}
        onNextStep={vi.fn()}
      />
    );

    const radio = screen.getByRole("radio", { name: /People cast a secret vote\./i });
    expect(radio).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit quiz/i })).toBeDisabled();

    fireEvent.click(radio);
    expect(onSelect).toHaveBeenCalledWith("q1", 0);

    rerender(
      <QuizCard
        quiz={quiz}
        loading={false}
        selectedAnswers={{ q1: 0 }}
        submitted={false}
        score={null}
        adaptivePath={null}
        highlighted={false}
        isLastStep={false}
        onSelect={onSelect}
        onSubmit={vi.fn()}
        onStart={vi.fn()}
        onNextStep={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /Submit quiz/i })).toBeEnabled();
  });
});
