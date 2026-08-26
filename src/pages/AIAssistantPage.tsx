import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ChatMessage } from '../components/chat/ChatMessage';
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Zap,
  Info,
} from 'lucide-react';

export const AIAssistantPage: React.FC = () => {
  const { chatMessages, isAiThinking, sendChatMessage, clearChat, profile, setCurrentPage } = useApp();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'What should I learn next?',
    'Why should I learn statistics before machine learning?',
    'Explain overfitting simply.',
    "I'm struggling with regression.",
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isAiThinking) return;

    sendChatMessage(text.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiThinking]);

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-6 flex flex-col h-[calc(100vh-6rem)]">
      {/* Assistant Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0a1024] border border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/40">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                PathFind AI Learning Advisor
              </h2>
              <Badge variant="primary" size="sm" dot>
                Gemini 3.7 Flash
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Grounded in {profile.careerGoal} roadmap &bull; Learner: {profile.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            title="Reset conversation"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Grounding Info Banner */}
      <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center gap-2 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span>
          <strong>Grounded Intelligence:</strong> Advisor answers are generated based on your actual skill gaps, active roadmap modules, and prerequisite sequence without hallucinated data.
        </span>
      </div>

      {/* Messages Scroll Area */}
      <Card
        variant="default"
        className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-2 border-slate-800 bg-[#080d1a]/95 flex flex-col"
      >
        <div className="flex-1 space-y-4">
          {chatMessages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onFollowUpClick={(prompt) => handleSend(prompt)}
              onRetryClick={(prompt) => handleSend(prompt)}
              onNavigateAction={(page) => setCurrentPage(page)}
            />
          ))}

          {/* Thinking indicator */}
          {isAiThinking && (
            <div className="flex items-start gap-3 text-xs text-indigo-300">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-indigo-500/20 text-slate-300 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span className="text-xs text-indigo-200">Gemini is reasoning through your curriculum and skill gaps...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </Card>

      {/* Suggested Quick Question Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
        <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider shrink-0 mr-1">
          Quick Prompts:
        </span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isAiThinking}
            className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600/20 disabled:opacity-50 text-slate-300 hover:text-white border border-slate-800 hover:border-indigo-500/40 transition-colors whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="relative shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAiThinking}
          placeholder={isAiThinking ? 'Gemini AI is analyzing...' : 'Ask anything about your roadmap, math concepts, next courses, or why a topic matters...'}
          className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xl disabled:opacity-60"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isAiThinking}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
