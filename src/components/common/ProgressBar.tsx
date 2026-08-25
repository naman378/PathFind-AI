import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  color?: 'indigo' | 'emerald' | 'amber' | 'purple' | 'cyan';
  className?: string;
  animate?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  size = 'md',
  showLabel = false,
  color = 'indigo',
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorGradients = {
    indigo: 'bg-gradient-to-r from-indigo-500 to-indigo-400',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    amber: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    purple: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
    cyan: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-slate-300">
          <span>Progress</span>
          <span className="font-semibold text-slate-100">{clampedValue}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/40 ${heightStyles[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorGradients[color]}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
