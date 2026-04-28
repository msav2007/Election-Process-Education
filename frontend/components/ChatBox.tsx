import { useEffect, useRef, type ReactNode } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Send,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import type { ChatMessage, ChatResponse, ContentVersion, ResponseVersion, SmartSuggestion } from "@/lib/types";

function ResponseSection({
  title,
  eyebrow,
  icon,
  children
}: {
  title: string;
  eyebrow?: string;
  icon: typeof Sparkles;
  children: ReactNode;
}) {
  const Icon = icon;

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm transition duration-200 hover:border-[#DBEAFE]">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
        <Icon className="h-3.5 w-3.5 text-[#2563EB]" />
        {eyebrow ?? title}
      </div>
      <h4 className="mt-2 text-sm font-semibold text-[#111827]">{title}</h4>
      <div className="mt-3 text-sm leading-7 text-[#111827]">{children}</div>
    </div>
  );
}

function SourceCard({ citation }: { citation: ChatResponse["citations"][number] }) {
  return (
    <li className="rounded-2xl border border-[#DBEAFE] bg-[#F8FBFF] p-4 transition duration-200 hover:border-[#93C5FD]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
          {citation.trust_label}
        </span>
        <span className="text-xs font-medium text-[#6B7280]">{citation.publisher}</span>
      </div>
      <a
        href={citation.url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#1D4ED8] underline underline-offset-4"
      >
        {citation.title}
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
      <p className="mt-2 text-sm leading-6 text-[#475569]">{citation.note}</p>
    </li>
  );
}

function AssistantSkeletonBubble() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[94%] rounded-3xl rounded-bl-md border border-[#E5E7EB] bg-white px-4 py-4 shadow-sm md:max-w-[82%]">
        <div className="space-y-4">
          <div className="animate-pulse rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] p-5">
            <div className="h-3 w-24 rounded-full bg-[#BFDBFE]" />
            <div className="mt-3 h-5 w-5/6 rounded-full bg-white/90" />
            <div className="mt-2 h-5 w-2/3 rounded-full bg-white/90" />
          </div>
          <div className="animate-pulse rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <div className="h-3 w-20 rounded-full bg-[#E5E7EB]" />
            <div className="mt-3 h-4 w-full rounded-full bg-[#E5E7EB]" />
            <div className="mt-2 h-4 w-4/5 rounded-full bg-[#E5E7EB]" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="animate-pulse rounded-2xl border border-[#E5E7EB] bg-white p-4">
              <div className="h-3 w-24 rounded-full bg-[#E5E7EB]" />
              <div className="mt-3 h-4 w-full rounded-full bg-[#E5E7EB]" />
              <div className="mt-2 h-4 w-3/4 rounded-full bg-[#E5E7EB]" />
            </div>
            <div className="animate-pulse rounded-2xl border border-[#E5E7EB] bg-white p-4">
              <div className="h-3 w-24 rounded-full bg-[#E5E7EB]" />
              <div className="mt-3 h-4 w-full rounded-full bg-[#E5E7EB]" />
              <div className="mt-2 h-4 w-2/3 rounded-full bg-[#E5E7EB]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StructuredResponse({
  content,
  journeyGuidance,
  suggestions,
  citations,
  isFallback,
  onSuggestionSelect
}: {
  content: ContentVersion;
  journeyGuidance: string;
  suggestions: SmartSuggestion[];
  citations: ChatResponse["citations"];
  isFallback: boolean;
  onSuggestionSelect: (suggestion: SmartSuggestion) => void;
}) {
  return (
    <div className="grid gap-4">
      {isFallback ? (
        <div className="rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] px-4 py-3 text-sm text-[#9A3412]">
          Fallback guidance is active. The answer structure and visible sources remain safe to use in the demo.
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#DBEAFE] bg-[linear-gradient(135deg,#EFF6FF_0%,#FFFFFF_100%)] p-5 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2563EB]">
          <Sparkles className="h-3.5 w-3.5" />
          Answer
        </div>
        <p className="mt-3 text-lg font-semibold leading-8 text-[#111827]">{content.answer}</p>
      </div>

      <ResponseSection title="Explanation" eyebrow="Why this is true" icon={ShieldCheck}>
        <p className="text-[#475569]">{content.simple_explanation}</p>
      </ResponseSection>

      <ResponseSection title="Action checklist" eyebrow="What to do next" icon={CheckCircle2}>
        <ol className="space-y-3">
          {content.steps.map((step, index) => (
            <li key={`${step}-${index}`} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </ResponseSection>

      <div className="grid gap-4 lg:grid-cols-2">
        <ResponseSection title="Real-world example" eyebrow="Concrete example" icon={BookOpenCheck}>
          <p className="text-[#475569]">{content.real_life_example}</p>
        </ResponseSection>

        <ResponseSection title="Next best action" eyebrow="Continue learning" icon={ArrowRight}>
          <p className="text-[#475569]">{content.what_to_do_next}</p>
        </ResponseSection>
      </div>

      <ResponseSection title="Adaptive guidance" eyebrow="Personalized path" icon={Sparkles}>
        <p className="text-[#475569]">{journeyGuidance}</p>
      </ResponseSection>

      {suggestions.length > 0 ? (
        <ResponseSection title="Smart suggestions" eyebrow="Try one follow-up" icon={Sparkles}>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={`${suggestion.label}-${suggestion.topic_id}-${suggestion.action}`}
                type="button"
                onClick={() => onSuggestionSelect(suggestion)}
                className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 text-left text-sm font-medium text-[#1D4ED8] transition duration-200 hover:-translate-y-0.5 hover:border-[#2563EB] hover:bg-white active:scale-[0.99]"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </ResponseSection>
      ) : null}

      {citations.length > 0 ? (
        <ResponseSection title="Visible sources" eyebrow={`${citations.length} trusted references`} icon={ShieldCheck}>
          <ul className="space-y-3">
            {citations.map((citation) => (
              <SourceCard key={citation.url} citation={citation} />
            ))}
          </ul>
        </ResponseSection>
      ) : null}
    </div>
  );
}

export function ChatBox({
  messages,
  activeResponse,
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
  activeResponse: ChatResponse | null;
  responseVersion: ResponseVersion;
  loading: boolean;
  isLastStep: boolean;
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onNextStep: () => void;
  onSuggestionSelect: (suggestion: SmartSuggestion) => void;
}) {
  const sourceLabel = activeResponse?.source === "gemini" ? "Grounded AI answer" : "Guided engine answer";
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [loading, messages]);

  return (
    <section
      id="chat"
      className="flex min-h-[720px] flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm"
    >
      <div className="flex flex-col gap-4 border-b border-[#E5E7EB] px-5 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">Chat</p>
          <h2 className="mt-2 text-xl font-semibold text-[#111827]">{activeResponse?.title ?? "Ask Election Copilot"}</h2>
          <p className="mt-2 text-sm text-[#6B7280]">
            {activeResponse?.citations?.length
              ? `Responses are grounded with ${activeResponse.citations.length} visible public sources.`
              : "Start your journey with a question about registration, polling day, documents, or a real-life scenario."}
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-2 text-xs font-semibold text-[#2563EB]">
          <ShieldCheck className="h-3.5 w-3.5" />
          {sourceLabel}
        </div>
      </div>

      <div
        className="flex-1 space-y-6 overflow-y-auto bg-[#F8FAFC] p-5"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
      >
        <div className="sr-only" aria-live="polite" aria-atomic="false">
          {loading ? "Preparing response" : `Conversation updated with ${messages.length} messages`}
        </div>
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center shadow-sm">
            <p className="text-base font-semibold text-[#111827]">Start your journey</p>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Ask one grounded question to see the answer, explanation, and visible sources appear together.
            </p>
          </div>
        ) : null}

        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[94%] rounded-3xl border px-4 py-4 shadow-sm transition duration-200 md:max-w-[82%] ${
                  isUser
                    ? "rounded-br-md border-[#2563EB] bg-[#2563EB] text-white"
                    : "rounded-bl-md border-[#E5E7EB] bg-white text-[#111827]"
                }`}
              >
                {isUser || !message.response ? <p className="text-sm leading-7">{message.text}</p> : null}
                {message.response && !isUser ? (
                  <StructuredResponse
                    content={responseVersion === "eli10" ? message.response.eli10_version : message.response.standard}
                    journeyGuidance={message.response.journey_guidance}
                    suggestions={message.response.smart_suggestions}
                    citations={message.response.citations}
                    isFallback={Boolean(message.error)}
                    onSuggestionSelect={onSuggestionSelect}
                  />
                ) : null}
              </div>
            </div>
          );
        })}

        {loading ? <AssistantSkeletonBubble /> : null}
        {loading ? (
          <div className="flex w-fit items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
            Preparing your response...
          </div>
        ) : null}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[#E5E7EB] bg-white px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label htmlFor="chat-input" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Ask a grounded question
            </label>
            <input
              id="chat-input"
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  onSend();
                }
              }}
              placeholder="Ask about registration, voter ID, polling day, counting..."
              className="min-h-12 w-full rounded-2xl border border-[#CBD5E1] bg-white px-4 text-sm text-[#111827] shadow-sm transition duration-200 placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#3B82F6]/15"
            />
          </div>
          <button
            aria-label="Send message"
            title="Send message"
            type="button"
            onClick={onSend}
            disabled={loading || !input.trim()}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#2563EB] bg-[#2563EB] px-5 text-sm font-semibold text-white transition duration-200 hover:scale-[1.01] hover:bg-[#1D4ED8] active:scale-[0.99] disabled:cursor-not-allowed disabled:border-[#E5E7EB] disabled:bg-[#E5E7EB] disabled:text-[#6B7280]"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onNextStep}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-[12px] border border-[#2563EB] bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:scale-[1.01] hover:brightness-110 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:border-[#E5E7EB] disabled:bg-[#E5E7EB] disabled:text-[#6B7280] disabled:shadow-none"
          >
            {isLastStep ? "Journey Completed" : "Next Step"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
