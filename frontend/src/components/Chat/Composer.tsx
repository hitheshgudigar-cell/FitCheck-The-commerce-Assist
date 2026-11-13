import React, { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft, Sparkles } from 'lucide-react';

interface ComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export const Composer: React.FC<ComposerProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Ask a question (e.g. Will this fit my 80 cm door?)...',
  autoFocus = false
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-end gap-2 p-2 rounded-2xl border border-stone-300 dark:border-dark-border bg-white dark:bg-dark-card shadow-soft focus-within:ring-2 focus-within:ring-teal-600 focus-within:border-teal-600 transition-all"
    >
      <label htmlFor="fitcheck-chat-composer" className="sr-only">
        Message or query
      </label>
      <textarea
        id="fitcheck-chat-composer"
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="Ask FitCheck a question"
        className="w-full py-2 px-3 text-xs sm:text-sm bg-transparent text-ink-900 dark:text-dark-ink placeholder:text-ink-400 dark:placeholder:text-dark-inkMuted resize-none focus:outline-none max-h-32 min-h-[44px]"
      />

      <button
        type="submit"
        disabled={!text.trim() || disabled}
        aria-label="Send query"
        className="shrink-0 w-10 h-10 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-40 disabled:hover:bg-teal-700 text-white flex items-center justify-center transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
      >
        <Send size={16} />
      </button>
    </form>
  );
};
