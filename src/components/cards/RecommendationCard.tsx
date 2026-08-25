import React from 'react';
import { Recommendation } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Sparkles,
  Clock,
  BookOpen,
  FolderGit2,
  Bookmark,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';

interface RecommendationCardProps {
  item: Recommendation;
  onStart: (id: string) => void;
  onToggleSave: (id: string) => void;
  onComplete?: (id: string) => void;
  isTopRecommendation?: boolean;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  item,
  onStart,
  onToggleSave,
  onComplete,
  isTopRecommendation = false,
}) => {
  const getIcon = () => {
    switch (item.type) {
      case 'Course':
        return <BookOpen className="w-4 h-4 text-indigo-400" />;
      case 'Project':
        return <FolderGit2 className="w-4 h-4 text-purple-400" />;
      case 'Assessment':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Layers className="w-4 h-4 text-sky-400" />;
    }
  };

  const getDifficultyVariant = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return 'success' as const;
      case 'Intermediate':
        return 'warning' as const;
      default:
        return 'danger' as const;
    }
  };

  return (
    <Card
      variant={isTopRecommendation ? 'glow' : 'default'}
      className={`p-5 flex flex-col justify-between group relative overflow-hidden ${
        isTopRecommendation ? 'border-indigo-500/50 bg-gradient-to-b from-[#0e1633] to-[#090f21]' : ''
      }`}
      hoverEffect
    >
      {/* Top Match Ribbon */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
            {getIcon()}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {item.type}
          </span>
          {isTopRecommendation && (
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              Top Pick
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm" className="font-bold">
            <Sparkles className="w-3 h-3 text-indigo-300" />
            {item.matchPercentage}% Match
          </Badge>

          <button
            onClick={() => onToggleSave(item.id)}
            title={item.isSaved ? 'Remove from saved' : 'Save for later'}
            className={`p-1.5 rounded-lg border transition-colors ${
              item.isSaved
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'text-slate-500 hover:text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${item.isSaved ? 'fill-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Title & Description */}
      <div className="mb-3">
        <h4 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors leading-snug">
          {item.title}
        </h4>
        {item.provider && (
          <p className="text-[11px] text-indigo-400 font-medium mt-0.5">{item.provider}</p>
        )}
        <p className="text-xs text-slate-300/90 mt-2 leading-relaxed line-clamp-3">
          {item.description}
        </p>
      </div>

      {/* Why Recommended Callout (Deterministic Reason) */}
      <div className="mb-3 p-3 rounded-xl bg-[#090f1f] border border-indigo-500/20 text-xs">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 mb-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Why this is recommended:</span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          {item.whyRecommended}
        </p>
      </div>

      {/* Meta info, Prerequisites, & Skills */}
      <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{item.estimatedDuration}</span>
          </div>
          <Badge variant={getDifficultyVariant(item.difficulty)} size="sm">
            {item.difficulty}
          </Badge>
        </div>

        {/* Prerequisites */}
        {item.prerequisites && item.prerequisites.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              Prerequisites: <strong className="text-slate-300 font-normal">{item.prerequisites.join(', ')}</strong>
            </span>
          </div>
        )}

        {/* Skills Covered Tags */}
        <div className="flex flex-wrap gap-1.5">
          {(item.skillsCovered || []).map((skill, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/60"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center gap-2">
          {item.status === 'completed' ? (
            <div className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
              Completed
            </div>
          ) : (
            <Button
              variant={item.status === 'in_progress' ? 'secondary' : 'primary'}
              size="sm"
              className="w-full"
              onClick={() => onStart(item.id)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              {item.status === 'in_progress' ? 'Continue Learning' : 'Start Learning'}
            </Button>
          )}

          {item.status === 'in_progress' && onComplete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onComplete(item.id)}
              title="Mark as completed"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
