import React from 'react';
import { Skill, SkillPriority, SkillStatus } from '../../types';

interface SkillBarProps {
  skill: Skill | {
    id?: string;
    name: string;
    category?: string;
    proficiency: number;
    targetProficiency: number;
    priority?: SkillPriority;
    status?: SkillStatus;
    reason?: string;
  };
  showCategory?: boolean;
  showStatus?: boolean;
  compact?: boolean;
  onAdjust?: (newVal: number) => void;
}

export const SkillBar: React.FC<SkillBarProps> = ({
  skill,
  showCategory = false,
  showStatus = true,
  compact = false,
  onAdjust,
}) => {
  const current = skill.proficiency ?? 0;
  const target = skill.targetProficiency ?? 80;
  const gap = Math.max(0, target - current);

  // Derive status if not explicitly passed
  let status: SkillStatus = (skill as any).status;
  if (!status) {
    if (current === 0) status = 'Missing';
    else if (current >= target) status = 'Mastered';
    else if (current >= 50) status = 'Developing';
    else status = 'Gap';
  }

  const getStatusBadge = (st: SkillStatus) => {
    switch (st) {
      case 'Mastered':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Mastered
          </span>
        );
      case 'Developing':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30">
            Developing
          </span>
        );
      case 'Gap':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
            Skill Gap
          </span>
        );
      case 'Missing':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30">
            Missing
          </span>
        );
    }
  };

  const getStatusColor = (st: SkillStatus) => {
    switch (st) {
      case 'Mastered':
        return 'text-emerald-400';
      case 'Developing':
        return 'text-sky-400';
      case 'Gap':
        return 'text-amber-400';
      case 'Missing':
        return 'text-rose-400';
    }
  };

  const getBarColor = (st: SkillStatus) => {
    switch (st) {
      case 'Mastered':
        return 'from-emerald-500 to-teal-400';
      case 'Developing':
        return 'from-sky-500 to-indigo-400';
      case 'Gap':
        return 'from-amber-500 to-orange-400';
      case 'Missing':
        return 'from-rose-500 to-red-400';
    }
  };

  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-slate-200">{skill.name}</span>
          {showCategory && skill.category && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
              {skill.category}
            </span>
          )}
          {showStatus && getStatusBadge(status)}
          {skill.priority === 'High' && (
            <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
              High Priority
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className={`font-semibold ${getStatusColor(status)}`}>
            {current}%
          </span>
          <span className="text-slate-500">/ Target {target}%</span>
          {gap > 0 ? (
            <span className="text-[11px] text-amber-400 font-medium bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
              -{gap}% gap
            </span>
          ) : (
            <span className="text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
              Goal Met
            </span>
          )}
        </div>
      </div>

      {/* Bar container */}
      <div className="relative w-full bg-slate-800/90 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
        {/* Target marker line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-300 z-10 shadow-sm"
          style={{ left: `${Math.min(100, target)}%` }}
          title={`Target benchmark: ${target}%`}
        />

        {/* Current proficiency fill */}
        <div
          className={`h-full bg-gradient-to-r transition-all duration-500 rounded-full ${getBarColor(
            status
          )}`}
          style={{ width: `${Math.min(100, current)}%` }}
        />
      </div>

      {(skill as any).reason && (
        <p className="text-[11px] text-slate-400 pt-0.5 leading-relaxed">
          {(skill as any).reason}
        </p>
      )}

      {onAdjust && (
        <div className="pt-1 flex items-center justify-end gap-2 text-[11px] text-slate-400">
          <span>Adjust proficiency slider:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={current}
            onChange={(e) => onAdjust(Number(e.target.value))}
            className="w-24 accent-indigo-500 cursor-pointer h-1.5"
          />
        </div>
      )}
    </div>
  );
};
