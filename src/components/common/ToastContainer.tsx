import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-indigo-500/40 bg-[#0e162b]';
        let Icon = Info;
        let iconColor = 'text-indigo-400';

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/40 bg-[#0a1a1b]';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'warning' || toast.type === 'error') {
          borderClass = 'border-rose-500/40 bg-[#1f0f15]';
          Icon = AlertCircle;
          iconColor = 'text-rose-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-xl shadow-black/60 text-slate-100 text-sm backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 ${borderClass}`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
              <span className="font-medium text-xs sm:text-sm">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white ml-2 p-1 rounded hover:bg-white/5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
