import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'glow' | 'interactive';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hoverEffect = false,
  ...props
}) => {
  let baseStyles = 'rounded-2xl border transition-all duration-200';

  if (variant === 'default') {
    baseStyles += ' bg-[#0c1222]/90 border-slate-800/80 backdrop-blur-md shadow-xl shadow-black/40';
  } else if (variant === 'subtle') {
    baseStyles += ' bg-[#0f172a]/60 border-slate-800/50 backdrop-blur-sm';
  } else if (variant === 'glow') {
    baseStyles += ' bg-[#0e162e]/95 border-indigo-500/30 shadow-lg shadow-indigo-500/10';
  } else if (variant === 'interactive') {
    baseStyles += ' bg-[#0c1222]/90 border-slate-800/80 hover:border-indigo-500/50 hover:bg-[#101830] cursor-pointer shadow-lg shadow-black/30';
  }

  if (hoverEffect) {
    baseStyles += ' hover:-translate-y-0.5 hover:shadow-indigo-500/10 hover:border-slate-700';
  }

  return (
    <div className={`${baseStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};
