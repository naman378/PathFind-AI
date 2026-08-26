import React from 'react';
import { ChatMessage as ChatMessageType, PageType } from '../../types';
import { Bot, ArrowRight, Sparkles, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { UserAvatar } from '../common/UserAvatar';
import { useApp } from '../../context/AppContext';

interface ChatMessageProps {
  message: ChatMessageType;
  onFollowUpClick?: (prompt: string) => void;
  onNavigateAction?: (page: PageType) => void;
  onRetryClick?: (prompt: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onFollowUpClick,
  onNavigateAction,
  onRetryClick,
}) => {
  const { profile, firebaseUser } = useApp();
  const isAssistant = message.sender === 'assistant';
  const isError = Boolean(message.isError);

  // Format markdown-like bolding or list items simply and safely
  const renderFormattedText = (content: string) => {
    return content.split('\n').map((line, idx) => {
      // Bold rendering simulation
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <p
          key={idx}
          className={`${line.trim() === '' ? 'h-2' : 'my-1'} text-xs sm:text-sm leading-relaxed`}
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  return (
    <div className={`flex items-start gap-3 my-4 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      {isAssistant ? (
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-md ${
            isError
              ? 'bg-rose-900/60 border border-rose-500/40 text-rose-300'
              : 'bg-gradient-to-tr from-indigo-600 to-purple-600 border border-indigo-400/30'
          }`}
        >
          {isError ? (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
        </div>
      ) : (
        <UserAvatar
          name={profile.name}
          avatarUrl={profile.avatarUrl}
          googlePhotoUrl={firebaseUser?.photoURL}
          size="chat"
        />
      )}

      {/* Bubble */}
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm ${
          isAssistant
            ? isError
              ? 'bg-[#180f1a]/95 text-rose-200 border border-rose-900/60 shadow-xl shadow-black/40'
              : 'bg-[#0f172a]/95 text-slate-200 border border-slate-800 shadow-xl shadow-black/40'
            : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
        }`}
      >
        <div className="flex items-center justify-between gap-4 mb-1 text-[10px] text-slate-400">
          <span className={`font-semibold ${isError ? 'text-rose-400' : 'text-slate-300'}`}>
            {isAssistant ? (isError ? 'PathFind AI Advisor (Notice)' : 'PathFind AI Advisor') : 'You'}
          </span>
          <span>{message.timestamp}</span>
        </div>

        <div className="space-y-1">{renderFormattedText(message.text)}</div>

        {/* Retry Button if error */}
        {isError && message.retryPrompt && (
          <div className="mt-3 pt-3 border-t border-rose-900/50 flex items-center gap-2">
            <button
              onClick={() => (onRetryClick || onFollowUpClick)?.(message.retryPrompt!)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry Question
            </button>
          </div>
        )}

        {/* Action Button if attached */}
        {message.relatedAction && onNavigateAction && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            <Button
              size="sm"
              variant="gradient"
              onClick={() => onNavigateAction(message.relatedAction!.page)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              {message.relatedAction.label}
            </Button>
          </div>
        )}

        {/* Follow-up Prompts */}
        {message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && onFollowUpClick && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Suggested questions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {message.suggestedFollowUps.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => onFollowUpClick(prompt)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white border border-indigo-500/25 transition-colors text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
