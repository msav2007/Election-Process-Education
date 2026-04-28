import { fireEvent, render, screen } from "@testing-library/react";
import { ChatBox } from "@/components/ChatBox";
import type { ChatResponse } from "@/lib/types";


const response: ChatResponse = {
  topic_id: "registration",
  title: "Registration",
  action: "explain",
  preferred_version: "eli10",
  standard: {
    answer: "Direct standard answer",
    simple_explanation: "Standard explanation",
    steps: ["Standard step 1", "Standard step 2", "Standard step 3", "Standard step 4"],
    real_life_example: "Standard example",
    what_to_do_next: "Standard next action"
  },
  eli10_version: {
    answer: "Direct simple answer",
    simple_explanation: "Simple explanation for a 10-year-old",
    steps: ["Simple step 1", "Simple step 2", "Simple step 3", "Simple step 4"],
    real_life_example: "Simple example",
    what_to_do_next: "Simple next action"
  },
  journey_guidance: "Personalized guidance",
  smart_suggestions: [
    {
      label: "Explain simply",
      topic_id: "registration",
      reason: "Lower jargon",
      action: "explain_simply",
      scenario_id: null
    }
  ],
  citations: [
    {
      title: "Official source",
      url: "https://example.com/source",
      note: "Authoritative election guidance.",
      publisher: "USAGov",
      trust_label: "Official source"
    }
  ],
  source: "guided-engine"
};

describe("ChatBox", () => {
  it("renders the selected ELI10 version and suggestion actions", () => {
    const onSuggestionSelect = vi.fn();

    render(
      <ChatBox
        messages={[
          {
            id: "assistant-1",
            role: "assistant",
            text: response.title,
            response
          }
        ]}
        activeResponse={response}
        responseVersion="eli10"
        loading={false}
        isLastStep={false}
        input=""
        onInputChange={vi.fn()}
        onSend={vi.fn()}
        onNextStep={vi.fn()}
        onSuggestionSelect={onSuggestionSelect}
      />
    );

    expect(screen.getByText("Direct simple answer")).toBeInTheDocument();
    expect(screen.getByText("Simple explanation for a 10-year-old")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Official source/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Explain simply/i }));
    expect(onSuggestionSelect).toHaveBeenCalledWith(response.smart_suggestions[0]);
  });
});
