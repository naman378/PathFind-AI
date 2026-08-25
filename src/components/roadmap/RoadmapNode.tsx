import React from 'react';
import { RoadmapPhase } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Button } from '../common/Button';
import {
  CheckCircle2,
  Lock,
  PlayCircle,
  Unlock,
  ChevronRight,
  BookOpen,
  FolderGit2,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface RoadmapNodeProps {
  phase: RoadmapPhase;
  isActive: boolean;
  onSelect: (phaseId: string) => void;
  isLast?: boolean;
}

export const RoadmapNode: React.FC<RoadmapNodeProps> = ({
  phase,
  isActive,
  onSelect,
  isLast = false,
}) => {
  const getStatusBadge = () => {
    switch (phase.status) {
      case 'completed':
        return (
          <Badge variant="success" size="sm">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Phase Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="primary" size="sm" dot>
            Current Focus
          </Badge>
        );
      case 'unlocked':
        return (
          <Badge variant="neutral" size="sm">
            <Unlock className="w-3 h-3 text-slate-400" />
            Unlocked
          </Badge>
        );
      case 'locked':
      default:
        return (
          <Badge variant="neutral" size="sm">
            <Lock className="w-3 h-3 text-slate-500" />
            Locked
          </Badge>
        );
    }
  };

  const getBorderColor = () => {
    if (isActive) return 'border-indigo-500 ring-2 ring-indigo-500/20 bg-[#0e162d]';
    if (phase.status === 'completed') return 'border-emerald-500/30 bg-[#09141f]/70';
    if (phase.status === 'in_progress') return 'border-indigo-500/40 bg-[#0c1326]';
    if (phase.status === 'unlocked') return 'border-slate-800 bg-[#0a0f1d]';
    return 'border-slate-800/40 bg-[#070b14]/50 opacity-70';
  };

  const isLocked = phase.status === 'locked';

  return (
    <div className="relative flex items-start gap-4 sm:gap-6 group">
      {/* Node Timeline Marker */}
      <div className="flex flex-col items-center shrink-0 pt-1">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-200 ${
            phase.status === 'completed'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : phase.status === 'in_progress'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-4 ring-indigo-500/20 animate-pulse'
              : phase.status === 'unlocked'
              ? 'bg-slate-800 text-slate-300 border border-slate-700'
              : 'bg-slate-900 text-slate-600 border border-slate-800'
          }`}
        >
          {phase.status === 'completed' ? (
            <CheckCircle2 className="w-5 h-5 text-slate-950 font-bold" />
          ) : isLocked ? (
            <Lock className="w-4 h-4 text-slate-600" />
          ) : (
            phase.phaseNumber
          )}
        </div>

        {/* Connecting line between phases */}
        {!isLast && (
          <div
            className={`w-0.5 min-h-[70px] sm:min-h-[90px] mt-2 transition-colors ${
              phase.status === 'completed'
                ? 'bg-emerald-500/40'
                : phase.status === 'in_progress'
                ? 'bg-gradient-to-b from-indigo-500 to-slate-800'
                : 'bg-slate-800/60'
            }`}
          />
        )}
      </div>

      {/* Phase Card Content */}
      <div className="flex-1 pb-6 sm:pb-8">
        <div
          onClick={() => !isLocked && onSelect(phase.id)}
          className={`rounded-2xl p-5 border transition-all duration-200 cursor-pointer ${getBorderColor()} ${
            !isLocked ? 'hover:border-indigo-400/60 hover:shadow-xl hover:shadow-indigo-500/5' : 'cursor-not-allowed'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Phase {phase.phaseNumber}
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {phase.estimatedDuration}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {getStatusBadge()}
            </div>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white mb-1 group-hover:text-indigo-200 transition-colors">
            {phase.title}
          </h3>
          <p className="text-xs text-slate-400 mb-3">{phase.tagline}</p>

          {/* Why this phase explanation */}
          <div className="p-3 rounded-xl bg-[#070b16] border border-slate-800/80 mb-3.5 text-xs text-slate-300">
            <span className="text-indigo-400 font-semibold flex items-center gap-1 mb-0.5">
              <Sparkles className="w-3 h-3" />
              Strategic Role in Career Goal:
            </span>
            <p className="text-slate-300/90 text-[11px] leading-relaxed">{phase.whyThisPhase}</p>
          </div>

          {/* Phase Lock Reason Banner if Locked */}
          {isLocked && phase.lockReason && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 mb-3.5 text-xs text-amber-300 flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-[11px]">Prerequisite Requirement:</span>
                <p className="text-[11px] text-amber-200/90 leading-tight">{phase.lockReason}</p>
              </div>
            </div>
          )}

          {/* Skills tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(phase.skills || []).map((skill, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/60"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Mini breakdown: Courses & Projects count + Progress Bar */}
          <div className="space-y-2 pt-3 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  {(phase.courses || []).length} Courses
                </span>
                <span className="flex items-center gap-1">
                  <FolderGit2 className="w-3.5 h-3.5 text-purple-400" />
                  {(phase.projects || []).length} Projects
                </span>
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Assessment: {phase.isAssessmentPassed ? 'Passed' : 'Pending'}
                </span>
              </div>
              <span className="font-semibold text-slate-200">{phase.progress}% Complete</span>
            </div>

            <ProgressBar
              value={phase.progress}
              size="sm"
              color={phase.status === 'completed' ? 'emerald' : 'indigo'}
            />
          </div>

          {!isLocked && (
            <div className="mt-4 flex items-center justify-end">
              <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                View Curriculum & Tasks <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
