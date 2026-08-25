import React from 'react';
import { AssessmentQuestion as AssessmentQuestionType } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { CheckCircle, Circle, HelpCircle } from 'lucide-react';

interface AssessmentQuestionProps {
  question: AssessmentQuestionType;
  questionIndex: number;
  totalQuestions: number;
  selectedOptionId?: string;
  onSelectOption: (optionId: string) => void;
  showExplanation?: boolean;
}

export const AssessmentQuestion: React.FC<AssessmentQuestionProps> = ({
  question,
  questionIndex,
  totalQuestions,
  selectedOptionId,
  onSelectOption,
  showExplanation = false,
}) => {
  return (
    <div className="space-y-4">
      {/* Question Header */}
      <div className="flex items-center justify-between gap-2">
        <Badge variant="primary" size="sm">
          Question {questionIndex + 1} of {totalQuestions}
        </Badge>
        <span className="text-xs text-slate-400 font-medium">
          Skill Tested: <strong className="text-slate-200">{question.skillTested}</strong>
        </span>
      </div>

      {/* Question Title */}
      <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
        {question.question}
      </h3>

      {/* Code Snippet if applicable */}
      {question.codeSnippet && (
        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300 overflow-x-auto">
          <code>{question.codeSnippet}</code>
        </pre>
      )}

      {/* Options List */}
      <div className="space-y-2.5 pt-2">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrect = showExplanation && option.id === question.correctOptionId;
          const isWrong = showExplanation && isSelected && option.id !== question.correctOptionId;

          let optionStyle = 'border-slate-800 bg-[#0a0f1e]/80 text-slate-300 hover:border-indigo-500/50 hover:bg-[#0f172e]';

          if (isSelected && !showExplanation) {
            optionStyle = 'border-indigo-500 bg-indigo-500/15 text-white ring-1 ring-indigo-500';
          } else if (isCorrect) {
            optionStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500';
          } else if (isWrong) {
            optionStyle = 'border-rose-500 bg-rose-500/15 text-rose-200 ring-1 ring-rose-500';
          }

          return (
            <button
              key={option.id}
              onClick={() => !showExplanation && onSelectOption(option.id)}
              disabled={showExplanation}
              className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all duration-150 flex items-start gap-3.5 cursor-pointer ${optionStyle}`}
            >
              <div className="mt-0.5 shrink-0">
                {isSelected ? (
                  <CheckCircle className="w-4 h-4 text-indigo-400 fill-indigo-500/20" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <span className="leading-relaxed">{option.text}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation when submitted/revealed */}
      {showExplanation && (
        <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 text-xs sm:text-sm space-y-1 mt-4">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-300 mb-1">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>Explanation & Concept Breakdown:</span>
          </div>
          <p className="text-slate-300 leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};
