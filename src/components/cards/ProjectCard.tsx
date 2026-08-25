import React from 'react';
import { Project } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { FolderGit2, Clock, CheckSquare, CheckCircle2, UploadCloud, Lock, AlertCircle } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  phaseId: string;
  onComplete: (phaseId: string, projectId: string) => void;
  onOpenProject?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  phaseId,
  onComplete,
  onOpenProject,
}) => {
  const isCompleted = project.status === 'completed';
  const isLocked = project.isLocked || project.status === 'locked';

  return (
    <Card
      variant="default"
      className={`p-4 sm:p-5 flex flex-col justify-between border-purple-500/20 transition-all ${
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
                  : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
              }`}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <FolderGit2 className="w-4 h-4" />}
            </span>
            <div className="flex items-center gap-1.5">
              {project.sequence && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
                  Project #{project.sequence}
                </span>
              )}
              <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">
                Hands-on Project
              </span>
            </div>
          </div>

          <Badge variant="purple" size="sm">
            {project.difficulty}
          </Badge>
        </div>

        <h4 className="text-sm sm:text-base font-bold text-white mb-1.5 leading-snug">
          {project.title}
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed mb-3">
          {project.description}
        </p>

        {/* Prerequisite Lock Alert */}
        {isLocked && project.lockReason && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-xs text-amber-300">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-semibold block text-[11px]">Prerequisite Required:</span>
              <span className="text-[11px] text-amber-200/90 leading-tight">{project.lockReason}</span>
            </div>
          </div>
        )}

        {/* Deliverables Checklist */}
        <div className="space-y-1.5 mb-4 p-3 rounded-xl bg-[#090e1c] border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Required Deliverables:
          </span>
          <ul className="space-y-1">
            {(project.deliverables || []).map((del, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                <CheckSquare className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>{del}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {project.duration}
          </span>
          <div className="flex gap-1">
            {(project.skillsCovered || []).map((s, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {s}
              </span>
            ))}
          </div>
        </div>

        {project.status !== 'not_started' && !isLocked && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Project Progress</span>
              <span className="font-semibold text-slate-200">{project.progress}%</span>
            </div>
            <ProgressBar value={project.progress} size="sm" color={isCompleted ? 'emerald' : 'purple'} />
          </div>
        )}

        <div className="pt-1 flex items-center gap-2">
          {isCompleted ? (
            <div className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
              Deliverables Verified & Completed
            </div>
          ) : isLocked ? (
            <div className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-500 bg-slate-900 rounded-xl border border-slate-800 cursor-not-allowed">
              <Lock className="w-3.5 h-3.5" />
              Prerequisites Incomplete
            </div>
          ) : (
            <>
              <Button
                variant={project.status === 'in_progress' ? 'gradient' : 'secondary'}
                size="sm"
                className="w-full"
                onClick={onOpenProject}
                leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
              >
                {project.status === 'in_progress' ? 'Submit Milestone' : 'Start Project Workspace'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onComplete(phaseId, project.id)}
                title="Mark deliverables complete"
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
