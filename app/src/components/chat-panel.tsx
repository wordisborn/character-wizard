"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/types/character";

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  onBack?: () => void;
}

export function ChatPanel({ messages, isLoading, onSendMessage, onBack }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  function handleChoiceClick(label: string) {
    if (isLoading) return;
    onSendMessage(label);
  }

  return (
    <div className="flex flex-col h-full bg-[#EDE3D1]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-9 h-14 md:h-16 border-b border-[#B8A88A] shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="text-[#8B7355] hover:text-[#2C1810] transition-colors mr-1"
              title="Back to characters"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <span className="text-[#8B6914] text-xl">✦</span>
          <h1 className="font-[family-name:var(--font-cormorant)] text-[18px] md:text-[22px] font-bold text-[#2C1810]">
            The Character Wizard
          </h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-9 py-5 md:py-7 space-y-6">
        {messages.length === 0 && (
          <WizardMessage
            content={`Greetings, adventurer! I am **Arcanus**, your guide through the realms of character creation.

Whether you're a seasoned veteran or picking up your first set of dice, I'm here to help you bring a hero to life. Let's start with the basics:

{{choice:New to D&D|I'll explain everything as we go}}
{{choice:Played before|Let's skip the basics and dive in}}
{{choice:Veteran player|I know my stuff — let's optimize}}`}
            onChoiceClick={handleChoiceClick}
            isLoading={isLoading}
          />
        )}
        {messages.map((message) => (
          <div key={message.id}>
            {message.role === "assistant" ? (
              <WizardMessage
                content={message.content}
                onChoiceClick={handleChoiceClick}
                isLoading={isLoading}
              />
            ) : (
              <UserMessage content={message.content} />
            )}
          </div>
        ))}
        {isLoading &&
          messages.length > 0 &&
          messages[messages.length - 1].content === "" && (
            <div className="flex items-center gap-3 pl-[50px]">
              <span className="text-[#8B6914] animate-pulse font-[family-name:var(--font-cormorant)] italic text-sm">
                The wizard is consulting the tomes...
              </span>
            </div>
          )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 px-4 md:px-9 h-[60px] md:h-[72px] border-t border-[#B8A88A] shrink-0"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tell the wizard what you are thinking..."
          rows={1}
          className="flex-1 bg-[#F5EDE0] border border-[#C4B89A] px-4 py-3 text-[#2C1810] placeholder:text-[#8B7355] placeholder:italic font-[family-name:var(--font-source-serif)] text-sm resize-none focus:outline-none focus:border-[#8B6914]"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-11 h-11 bg-[#8B6914] flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-[#7A5B10] transition-colors"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#F2E8D5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" />
            <path d="M6 12h16" />
          </svg>
        </button>
      </form>
    </div>
  );
}

// --- Choice card parsing ---

interface ChoiceCard {
  label: string;
  description: string;
}

function parseContent(content: string): Array<{ type: "text"; text: string } | { type: "choices"; choices: ChoiceCard[] }> {
  if (!content) return [];

  const parts: Array<{ type: "text"; text: string } | { type: "choices"; choices: ChoiceCard[] }> = [];
  const lines = content.split("\n");
  let textBuffer = "";
  let choiceBuffer: ChoiceCard[] = [];

  function flushText() {
    if (textBuffer.trim()) {
      parts.push({ type: "text", text: textBuffer.trim() });
    }
    textBuffer = "";
  }

  function flushChoices() {
    if (choiceBuffer.length > 0) {
      parts.push({ type: "choices", choices: [...choiceBuffer] });
    }
    choiceBuffer = [];
  }

  for (const line of lines) {
    const choiceMatch = line.match(/\{\{choice:(.+?)\|(.+?)\}\}/);
    if (choiceMatch) {
      if (textBuffer.trim()) flushText();
      choiceBuffer.push({
        label: choiceMatch[1].trim(),
        description: choiceMatch[2].trim(),
      });
    } else {
      if (choiceBuffer.length > 0) flushChoices();
      textBuffer += line + "\n";
    }
  }

  if (choiceBuffer.length > 0) flushChoices();
  if (textBuffer.trim()) flushText();

  return parts;
}

// --- Markdown rendering ---

function renderMarkdown(text: string): React.ReactNode[] {
  const paragraphs = text.split(/\n\n+/);
  const nodes: React.ReactNode[] = [];

  paragraphs.forEach((para, i) => {
    const trimmed = para.trim();
    if (!trimmed) return;

    // Check for bullet list
    const bulletLines = trimmed.split("\n").filter((l) => /^[-•*]\s/.test(l.trim()));
    if (bulletLines.length > 0 && bulletLines.length === trimmed.split("\n").filter((l) => l.trim()).length) {
      nodes.push(
        <ul key={i} className="list-disc list-inside space-y-1 my-1.5">
          {bulletLines.map((line, j) => (
            <li key={j}>{renderInline(line.replace(/^[-•*]\s+/, ""))}</li>
          ))}
        </ul>
      );
      return;
    }

    // Check for numbered list
    const numLines = trimmed.split("\n").filter((l) => /^\d+[.)]\s/.test(l.trim()));
    if (numLines.length > 0 && numLines.length === trimmed.split("\n").filter((l) => l.trim()).length) {
      nodes.push(
        <ol key={i} className="list-decimal list-inside space-y-1 my-1.5">
          {numLines.map((line, j) => (
            <li key={j}>{renderInline(line.replace(/^\d+[.)]\s+/, ""))}</li>
          ))}
        </ol>
      );
      return;
    }

    // Regular paragraph (handle single line breaks within)
    const lines = trimmed.split("\n");
    nodes.push(
      <p key={i} className="my-1">
        {lines.map((line, j) => (
          <span key={j}>
            {j > 0 && <br />}
            {renderInline(line)}
          </span>
        ))}
      </p>
    );
  });

  return nodes;
}

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Match **bold** and *italic*
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      // bold
      nodes.push(
        <strong key={match.index} className="font-bold">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // italic
      nodes.push(
        <em key={match.index} className="italic">
          {match[3]}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

// --- Message components ---

function WizardMessage({
  content,
  onChoiceClick,
  isLoading,
}: {
  content: string;
  onChoiceClick: (label: string) => void;
  isLoading: boolean;
}) {
  if (!content) return null;

  const parts = parseContent(content);

  return (
    <div className="flex gap-3.5 items-start">
      <div className="w-9 h-9 bg-[#D4C4A8] border border-[#8B691440] flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[#8B6914] text-sm">✦</span>
      </div>
      <div className="flex flex-col gap-1 min-w-0 max-w-[600px]">
        <span className="font-[family-name:var(--font-cormorant)] text-base font-bold text-[#8B6914]">
          Arcanus the Guide
        </span>
        <div className="text-[#3D2B1A] font-[family-name:var(--font-source-serif)] text-[15px] leading-[1.7]">
          {parts.map((part, i) =>
            part.type === "text" ? (
              <div key={i}>{renderMarkdown(part.text)}</div>
            ) : (
              <div key={i} className="flex flex-col gap-2 my-3">
                {part.choices.map((choice, j) => (
                  <button
                    key={j}
                    onClick={() => onChoiceClick(choice.label)}
                    disabled={isLoading}
                    className="group flex items-start gap-3 w-full text-left px-4 py-3 bg-[#F5EDE0] border border-[#C4B89A] hover:border-[#8B6914] hover:bg-[#F9F3E8] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-[#8B6914] text-xs mt-1 shrink-0 opacity-60 group-hover:opacity-100">✦</span>
                    <div className="min-w-0">
                      <span className="font-[family-name:var(--font-cormorant)] text-[15px] font-bold text-[#2C1810] group-hover:text-[#8B6914] transition-colors">
                        {choice.label}
                      </span>
                      <span className="text-[#8B7355] font-[family-name:var(--font-source-serif)] text-[13px] ml-2">
                        {choice.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="bg-[#F5EDE0] border border-[#C4B89A] px-5 py-3.5 max-w-[500px]">
        <p className="text-[#2C1810] font-[family-name:var(--font-source-serif)] text-[15px] leading-[1.7]">
          {content}
        </p>
      </div>
    </div>
  );
}
