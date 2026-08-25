import React from 'react';
import { Course } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { BookOpen, Clock, Star, CheckCircle2, Play, Lock, AlertCircle } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  phaseId: string;
  onComplete: (phaseId: string, courseId: string) => void;
  onStart?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  phaseId,
  onComplete,
  onStart,
}) => {
  const isCompleted = course.status === 'completed';
  const isLocked = course.isLocked || course.status === 'locked';

  return (
    <Card
      variant="default"
      className={`p-4 sm:p-5 flex flex-col justify-between transition-all ${
        isLocked ? 'opacity-70 border-slate-800 bg-slate-950/40' : ''
      }`}
      hoverEffect={!isLocked}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`p-1.5 rounded-lg border ${
                isLocked
                  ? 'bg-slate-800/60 border-slate-700/60 text-slate-500'
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
              }`}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
            </span>
            <div className="flex items-center gap-1.5">
              {course.sequence && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                  Step #{course.sequence}
                </span>
              )}
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {course.provider}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{course.rating}</span>
          </div>
        </div>

        <h4 className="text-sm sm:text-base font-bold text-white mb-1.5 leading-snug">
          {course.title}
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed mb-3">
          {course.description}
        </p>

        {/* Prerequisite Lock Banner */}
        {isLocked && course.lockReason && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-xs text-amber-300">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-semibold block text-[11px]">Prerequisite Required:</span>
              <span className="text-[11px] text-amber-200/90 leading-tight">{course.lockReason}</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 mb-4">
          {(course.skillsCovered || []).map((s, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {course.duration}
          </span>
          <Badge variant={course.difficulty === 'Beginner' ? 'success' : 'warning'} size="sm">
            {course.difficulty}
          </Badge>
        </div>

        {course.status !== 'not_started' && !isLocked && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Progress</span>
              <span className="font-semibold text-slate-200">{course.progress}%</span>
            </div>
            <ProgressBar value={course.progress} size="sm" color={isCompleted ? 'emerald' : 'indigo'} />
          </div>
        )}

        <div className="pt-1 flex items-center gap-2">
          {isCompleted ? (
            <div className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/25">
              <CheckCircle2 className="w-4 h-4" />
              Completed
            </div>
          ) : isLocked ? (
            <div className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-500 bg-slate-900 rounded-xl border border-slate-800 cursor-not-allowed">
              <Lock className="w-3.5 h-3.5" />
              Prerequisites Incomplete
            </div>
          ) : (
            <>
              <Button
                variant={course.status === 'in_progress' ? 'primary' : 'secondary'}
                size="sm"
                className="w-full"
                onClick={onStart}
                leftIcon={<Play className="w-3.5 h-3.5" />}
              >
                {course.status === 'in_progress' ? 'Continue Lesson' : 'Start Course'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onComplete(phaseId, course.id)}
                title="Mark course complete"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
