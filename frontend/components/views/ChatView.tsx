import { MessageSquareText } from "lucide-react";
import { ChatBox } from "@/components/ChatBox";
import type { ChatMessage, ChatResponse, ResponseVersion, SmartSuggestion } from "@/lib/types";


export function ChatView({
  messages,
  assistant,
  responseVersion,
  loading,
  isLastStep,
  input,
  onInputChange,
  onSend,
  onNextStep,
  onSuggestionSelect
}: {
  messages: ChatMessage[];
  assistant: ChatResponse | null;
  responseVersion: ResponseVersion;
  loading: boolean;
  isLastStep: boolean;
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onNextStep: () => void;
  onSuggestionSelect: (suggestion: SmartSuggestion) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#6B7280]">
        <MessageSquareText className="h-4 w-4 text-[#2563EB]" />
        <p>
          Response mode:
          <span className="ml-2 rounded-full bg-[#EFF6FF] px-3 py-1 font-semibold text-[#2563EB]">
            {responseVersion === "eli10" ? "ELI10" : "Standard"}
          </span>
        </p>
        {assistant?.citations?.length ? (
          <span className="rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#111827]">
            {assistant.citations.length} visible sources
          </span>
        ) : null}
      </div>

      <ChatBox
        messages={messages}
        activeResponse={assistant}
        responseVersion={responseVersion}
        loading={loading}
        isLastStep={isLastStep}
        input={input}
        onInputChange={onInputChange}
        onSend={onSend}
        onNextStep={onNextStep}
        onSuggestionSelect={onSuggestionSelect}
      />
    </div>
  );
}
