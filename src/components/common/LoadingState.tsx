import React from 'react';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Analyzing learning signals...',
  subMessage = 'PathFind AI is computing adaptive skill pathways',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center animate-pulse">
          <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
          <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
        </div>
      </div>
      <h4 className="text-base font-semibold text-white tracking-tight">{message}</h4>
      <p className="text-xs text-slate-400 max-w-sm mt-1">{subMessage}</p>
    </div>
  );
};

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-2xl border border-dashed border-slate-800 bg-[#0a0f1d]/50">
      <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-4 text-slate-400">
        {icon || <AlertCircle className="w-6 h-6 text-slate-400" />}
      </div>
      <h4 className="text-base font-semibold text-slate-200">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
