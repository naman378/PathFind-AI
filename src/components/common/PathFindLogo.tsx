import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  textClassName?: string;
  showTagline?: boolean;
}

/**
 * Official PathFind AI Brand Logo
 * Features the signature 'P' route/path glyph with rising navigation arrow,
 * vibrant electric cyan-to-indigo-to-magenta gradient ribbon, and white pillar stem.
 */
export const PathFindLogo: React.FC<LogoProps> = ({
  className = 'w-9 h-9',
  size,
  showText = false,
  textClassName = '',
  showTagline = false,
}) => {
  const iconStyle = size ? { width: size, height: size } : undefined;

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Precision Vector SVG Logo Glyph */}
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 aspect-square"
        style={iconStyle || { width: '100%', height: '100%' }}
        aria-label="PathFind AI Logo"
      >
        <defs>
          {/* Main Vibrant Ribbon Gradient (Cyan -> Azure -> Indigo -> Violet -> Magenta) */}
          <linearGradient id="pathfindRibbonGrad" x1="15%" y1="10%" x2="90%" y2="85%">
            <stop offset="0%" stopColor="#00D2FF" />
            <stop offset="25%" stopColor="#0095FF" />
            <stop offset="55%" stopColor="#6366F1" />
            <stop offset="78%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>

          {/* Under-fold 3D Depth Shadow Gradient */}
          <linearGradient id="pathfindFoldShadow" x1="40%" y1="30%" x2="80%" y2="80%">
            <stop offset="0%" stopColor="#1E1B4B" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#312E81" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4338CA" stopOpacity="0.1" />
          </linearGradient>

          {/* Subtle Glow Filter for Outer Arc */}
          <filter id="pathfindGlow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Vertical Stem Subtle Bottom Shading */}
          <linearGradient id="pathfindStemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="85%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#C7D2FE" />
          </linearGradient>
        </defs>

        {/* Background Dark Container (Optional subtle contrast backing) */}
        <rect width="120" height="120" rx="26" fill="#070B18" fillOpacity="0.95" />

        {/* Outer Ribbon Curve of 'P' */}
        {/* Top-bar sweeping over the top into the right loop and curving back under */}
        <path
          d="M 28 22
             C 28 14, 38 14, 48 14
             L 70 14
             C 95 14, 110 32, 110 56
             C 110 80, 94 98, 68 98
             L 48 98
             C 44 98, 40 94, 44 90
             C 48 86, 56 86, 68 86
             C 86 86, 96 73, 96 56
             C 96 39, 86 26, 68 26
             L 46 26
             C 36 26, 28 22, 28 22 Z"
          fill="url(#pathfindRibbonGrad)"
        />

        {/* Inner Curved Fold for 3D Ribbon overlap sensation */}
        <path
          d="M 52 26
             L 68 26
             C 86 26, 96 39, 96 56
             C 96 68, 90 78, 80 83
             C 72 75, 62 60, 58 48
             C 54 36, 52 28, 52 26 Z"
          fill="url(#pathfindFoldShadow)"
        />

        {/* Left Vertical White Pillar / Stem with rounded ends */}
        <path
          d="M 24 34
             C 24 28, 29 23, 35 23
             C 41 23, 46 28, 46 34
             L 46 92
             C 46 100, 39 107, 31 107
             C 25 107, 24 102, 24 96
             L 24 34 Z"
          fill="url(#pathfindStemGrad)"
        />

        {/* Upward-Right Compass / Route Arrow emerging from the Stem */}
        <path
          d="M 40 68
             L 58 56
             L 53 52
             L 78 40
             L 66 65
             L 62 60
             L 46 72
             Z"
          fill="#FFFFFF"
        />
      </svg>

      {/* Optional Wordmark & Tagline */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-extrabold tracking-tight text-white ${textClassName || 'text-lg sm:text-xl'}`}>
              PathFind
            </span>
            <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
              AI
            </span>
          </div>
          {showTagline && (
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
              YOUR PATH. YOUR FUTURE.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
