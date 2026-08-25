import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Award, CheckCircle2, CircleDashed, Flame, Target } from 'lucide-react';

interface MilestoneProps {
  currentPhaseTitle: string;
  nextMilestoneTitle: string;
  estimatedCompletion: string;
  unlockedBadges: string[];
}

export const Milestone: React.FC<MilestoneProps> = ({
  currentPhaseTitle,
  nextMilestoneTitle,
  estimatedCompletion,
  unlockedBadges,
}) => {
  return (
    <Card variant="glow" className="p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
              Active Milestone Objective
            </span>
            <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
              {nextMilestoneTitle}
            </h4>
          </div>
        </div>

        <Badge variant="primary" size="sm">
          Target: {estimatedCompletion}
        </Badge>
      </div>

      <p className="text-xs text-slate-300 mb-4 leading-relaxed">
        Currently advancing through <strong className="text-white">{currentPhaseTitle}</strong>. Completing the upcoming diagnostic assessment unlocks the Classical Machine Learning phase.
      </p>

      {/* Earned Badges Row */}
      <div className="pt-3 border-t border-slate-800/80">
        <span className="text-[11px] font-semibold text-slate-400 block mb-2">
          Earned Milestone Certifications:
        </span>
        <div className="flex flex-wrap gap-2">
          {(unlockedBadges || []).map((badge, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium"
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>{badge}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-400 text-xs">
            <CircleDashed className="w-3.5 h-3.5 text-slate-500" />
            <span>Next: ML Specialist Badge</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
