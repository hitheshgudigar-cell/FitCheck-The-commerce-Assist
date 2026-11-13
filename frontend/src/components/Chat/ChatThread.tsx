import React, { useRef, useEffect } from 'react';
import { User, Sparkles, AlertCircle } from 'lucide-react';
import { ChatMessage, Citation, Product, StoreAvailability, Alternative } from '../../types';
import { AnswerCard } from '../AnswerCard/AnswerCard';
import { ThinkingProgress } from './Skeletons';

interface ChatThreadProps {
  messages: ChatMessage[];
  isThinking: boolean;
  thinkingStep: string;
  selectedStoreId?: string | null;
  onSelectStore?: (storeId: string) => void;
  onSelectCitation: (citation: Citation) => void;
  onReserve: (item: { product: Product; store: StoreAvailability }) => void;
  onSelectAlternative: (alt: Alternative) => void;
  onClarifyAnswer: (answer: string) => void;
  onReportWrongAnswer: (target: { messageId: string; headline: string }) => void;
}

export const ChatThread: React.FC<ChatThreadProps> = ({
  messages,
  isThinking,
  thinkingStep,
  selectedStoreId,
  onSelectStore,
  onSelectCitation,
  onReserve,
  onSelectAlternative,
  onClarifyAnswer,
  onReportWrongAnswer
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div
      role="log"
      aria-live="polite"
      className="space-y-4 pb-4"
    >
      {messages.map(msg => {
        if (msg.sender === 'user') {
          return (
            <div
              key={msg.id}
              className="flex justify-end gap-2 animate-in fade-in duration-200"
            >
              <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-br-xs px-4 py-2.5 bg-ink-800 text-white dark:bg-teal-900/80 dark:text-teal-50 shadow-soft">
                <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </p>
                <div className="text-[10px] text-ink-300 dark:text-teal-300 text-right mt-1 font-mono">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        }

        // Assistant Message
        return (
          <div
            key={msg.id}
            className="flex items-start gap-2.5 animate-in fade-in duration-200"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
              <Sparkles size={16} />
            </div>

            <div className="flex-1 max-w-full overflow-hidden">
              {msg.payload ? (
                <AnswerCard
                  messageId={msg.id}
                  payload={msg.payload}
                  selectedStoreId={selectedStoreId}
                  onSelectStore={onSelectStore}
                  onSelectCitation={onSelectCitation}
                  onReserve={onReserve}
                  onSelectAlternative={onSelectAlternative}
                  onClarifyAnswer={onClarifyAnswer}
                  onReportWrongAnswer={onReportWrongAnswer}
                />
              ) : (
                <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-stone-200 dark:border-dark-border text-xs sm:text-sm text-ink-800 dark:text-dark-ink shadow-soft">
                  <div className="flex items-center gap-2 text-rose-600 font-semibold mb-1">
                    <AlertCircle size={15} />
                    <span>Temporary Notice</span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Thinking state */}
      {isThinking && (
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs animate-pulse">
            <Sparkles size={16} />
          </div>
          <div className="flex-1">
            <ThinkingProgress currentStep={thinkingStep} />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
