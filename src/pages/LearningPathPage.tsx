import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RoadmapPhase } from '../types';
import { RoadmapNode } from '../components/roadmap/RoadmapNode';
import { CourseCard } from '../components/cards/CourseCard';
import { ProjectCard } from '../components/cards/ProjectCard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Modal } from '../components/common/Modal';
import {
  Route,
  BookOpen,
  FolderGit2,
  HelpCircle,
  Lock,
  ArrowRight,
  Info,
  Code2,
  Award,
  Check,
  Play,
} from 'lucide-react';

export const LearningPathPage: React.FC = () => {
  const {
    profile,
    roadmapPhases,
    activePhaseId,
    setActivePhaseId,
    markCourseCompleted,
    markProjectCompleted,
    markPracticeCompleted,
    markMilestoneCompleted,
    setCurrentPage,
    overallProgress,
  } = useApp();

  const [selectedPhaseModal, setSelectedPhaseModal] = useState<RoadmapPhase | null>(null);

  const fallbackPhase: RoadmapPhase = {
    id: 'phase-1',
    phaseNumber: 1,
    title: 'Foundation & Core Skills',
    tagline: 'Essential building blocks',
    status: 'in_progress',
    progress: 0,
    estimatedDuration: '3 Weeks',
    prerequisites: [],
    skills: [],
    whyThisPhase: 'Master foundational concepts.',
    assessmentRequired: 'Phase 1 Assessment',
    assessmentId: 'assess-1',
    isAssessmentPassed: false,
    milestoneTitle: 'Foundation Milestone',
    milestoneDescription: 'Completed foundational skills.',
    unlockedBadges: [],
    courses: [],
    practiceItems: [],
    projects: [],
  };

  const activePhase =
    (roadmapPhases || []).find((p) => p.id === activePhaseId) ||
    (roadmapPhases || []).find((p) => p.status === 'in_progress') ||
    roadmapPhases?.[0] ||
    fallbackPhase;

  const handleSelectPhase = (phaseId: string) => {
    setActivePhaseId(phaseId);
    const found = (roadmapPhases || []).find((p) => p.id === phaseId);
    if (found && !found.isLocked) {
      setSelectedPhaseModal(found);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#0a1024] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="primary" size="sm">
              <Route className="w-3.5 h-3.5 text-indigo-400" />
              Dynamic Curriculum Graph
            </Badge>
            <span className="text-xs text-slate-400">
              6 Phases &bull; {profile.careerGoal} Track
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Personalized Learning Roadmap
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            AI-sequenced learning path structured across <strong>Phase &rarr; Skills &rarr; Learning Resources &rarr; Practice &rarr; Project &rarr; Assessment &rarr; Milestone</strong> with prerequisite enforcement.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-4 shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Curriculum Progress
            </span>
            <span className="text-xl font-bold text-white">{overallProgress}% Complete</span>
          </div>
          <div className="w-20">
            <ProgressBar value={overallProgress} size="md" color="indigo" />
          </div>
        </div>
      </div>

      {/* Main Roadmap Timeline Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Vertical Roadmap Tree */}
        <div className="lg:col-span-2 space-y-2">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 mb-4 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-400" />
              Click any phase card to inspect courses, hands-on practice, projects, and milestone badges.
            </span>
          </div>

          <div className="space-y-0">
            {roadmapPhases.map((phase, idx) => (
              <RoadmapNode
                key={phase.id}
                phase={phase}
                isActive={phase.id === activePhaseId}
                onSelect={(id) => handleSelectPhase(id)}
                isLast={idx === roadmapPhases.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Right 1 Col: Quick Preview & Curriculum Inspector for Active Phase */}
        <div className="space-y-6">
          <Card variant="glow" className="p-5 sm:p-6 space-y-4 border-indigo-500/30 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  Phase {activePhase.phaseNumber} Details
                </span>
                <h3 className="text-base font-bold text-white">{activePhase.title}</h3>
              </div>
              <Badge
                variant={
                  activePhase.status === 'completed'
                    ? 'success'
                    : activePhase.status === 'in_progress'
                    ? 'primary'
                    : 'neutral'
                }
                size="sm"
              >
                {activePhase.status === 'in_progress' ? 'In Progress' : activePhase.status}
              </Badge>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{activePhase.whyThisPhase}</p>

            {/* Target Skills */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 block">Target Skills:</span>
              <div className="flex flex-wrap gap-1.5">
                {(activePhase.skills || []).map((s, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 block">Prerequisites:</span>
              <div className="flex flex-wrap gap-1.5">
                {(activePhase.prerequisites || []).map((req, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/80"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>

            {/* Structure Summary Grid */}
            <div className="grid grid-cols-3 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400 mx-auto mb-1" />
                <span className="font-bold text-white block text-xs">{(activePhase.courses || []).length} Courses</span>
                <span className="text-[9px] text-slate-400">
                  {(activePhase.courses || []).filter((c) => c.status === 'completed').length} Done
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <Code2 className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
                <span className="font-bold text-white block text-xs">{activePhase.practiceItems?.length || 0} Practice</span>
                <span className="text-[9px] text-slate-400">
                  {(activePhase.practiceItems || []).filter((p) => p.status === 'completed').length} Done
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <FolderGit2 className="w-3.5 h-3.5 text-purple-400 mx-auto mb-1" />
                <span className="font-bold text-white block text-xs">{(activePhase.projects || []).length} Projects</span>
                <span className="text-[9px] text-slate-400">
                  {(activePhase.projects || []).filter((p) => p.status === 'completed').length} Done
                </span>
              </div>
            </div>

            {/* Milestone Badge Highlight */}
            {activePhase.milestoneTitle && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">Phase Milestone</span>
                    <span className="text-xs font-semibold text-white">{activePhase.milestoneTitle}</span>
                  </div>
                </div>
                {activePhase.progress === 100 ? (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">Achieved</span>
                ) : (
                  <span className="text-[10px] text-slate-400">{activePhase.progress}%</span>
                )}
              </div>
            )}

            {/* Assessment Requirement */}
            <div className="p-3.5 rounded-xl bg-[#090f20] border border-indigo-500/20 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  Benchmark Assessment:
                </span>
                {activePhase.isAssessmentPassed ? (
                  <span className="text-emerald-400 font-bold text-[10px]">Passed &bull; 92%</span>
                ) : (
                  <span className="text-amber-400 font-bold text-[10px]">Pending</span>
                )}
              </div>
              <p className="text-slate-300 text-[11px]">{activePhase.assessmentRequired}</p>
            </div>

            <Button
              variant="gradient"
              size="md"
              className="w-full"
              onClick={() => setSelectedPhaseModal(activePhase)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Open Phase Workspace
            </Button>
          </Card>
        </div>
      </div>

      {/* Modal for In-Depth Phase Inspection */}
      {selectedPhaseModal && (
        <Modal
          isOpen={!!selectedPhaseModal}
          onClose={() => setSelectedPhaseModal(null)}
          title={`Phase ${selectedPhaseModal.phaseNumber}: ${selectedPhaseModal.title}`}
          subtitle={`Estimated Duration: ${selectedPhaseModal.estimatedDuration} • Progress: ${selectedPhaseModal.progress}%`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Tagline & Why */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-1.5">
              <span className="text-indigo-400 font-semibold block">Strategic Goal:</span>
              <p>{selectedPhaseModal.whyThisPhase}</p>
            </div>

            {/* Target Skills */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Phase Skills Target
              </h4>
              <div className="flex flex-wrap gap-2">
                {(selectedPhaseModal.skills || []).map((s, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* 1. Courses Section (Learning Resources) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  1. Learning Resources & Courses ({(selectedPhaseModal.courses || []).length})
                </h4>
                <span className="text-xs text-slate-400">Click complete to unlock next items</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {(selectedPhaseModal.courses || []).map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    phaseId={selectedPhaseModal.id}
                    onComplete={(phId, cId) => markCourseCompleted(phId, cId)}
                    onStart={() => setCurrentPage('recommendations')}
                  />
                ))}
              </div>
            </div>

            {/* 2. Practice Challenges Section */}
            {selectedPhaseModal.practiceItems && selectedPhaseModal.practiceItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-amber-400" />
                    2. Hands-On Practice ({selectedPhaseModal.practiceItems.length})
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {(selectedPhaseModal.practiceItems || []).map((practice) => {
                    const isDone = practice.status === 'completed';
                    return (
                      <div
                        key={practice.id}
                        className={`p-4 rounded-xl border transition-all ${
                          practice.isLocked
                            ? 'bg-slate-900/40 border-slate-800 opacity-60'
                            : isDone
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                                {practice.type}
                              </span>
                              <span className="text-xs text-slate-400">{practice.estimatedMinutes} min &bull; {practice.difficulty}</span>
                              {practice.isLocked && (
                                <span className="text-xs text-rose-400 flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> Locked
                                </span>
                              )}
                            </div>
                            <h5 className="text-sm font-bold text-white">{practice.title}</h5>
                            <p className="text-xs text-slate-300">{practice.description}</p>
                            {practice.lockReason && (
                              <p className="text-[11px] text-amber-400/90 pt-1">Requires: {practice.lockReason}</p>
                            )}
                          </div>

                          <Button
                            size="sm"
                            variant={isDone ? 'secondary' : 'gradient'}
                            disabled={practice.isLocked}
                            onClick={() => markPracticeCompleted(selectedPhaseModal.id, practice.id)}
                            leftIcon={isDone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5" />}
                          >
                            {isDone ? 'Completed' : 'Complete Challenge'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Projects Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-purple-400" />
                  3. Portfolio Projects ({(selectedPhaseModal.projects || []).length})
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {(selectedPhaseModal.projects || []).map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    phaseId={selectedPhaseModal.id}
                    onComplete={(phId, pId) => markProjectCompleted(phId, pId)}
                    onOpenProject={() => setCurrentPage('recommendations')}
                  />
                ))}
              </div>
            </div>

            {/* 4. Assessment Section */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0d1633] to-[#12112e] border border-indigo-500/30 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">
                  4. Diagnostic Assessment Requirement
                </span>
                <h5 className="text-sm font-bold text-white">{selectedPhaseModal.assessmentRequired}</h5>
                <p className="text-xs text-slate-300 mt-0.5">
                  {selectedPhaseModal.isAssessmentPassed
                    ? 'Exam passed! Verified in your progress log.'
                    : 'Passing score >= 70% required to graduate phase.'}
                </p>
              </div>

              <Button
                variant={selectedPhaseModal.isAssessmentPassed ? 'secondary' : 'gradient'}
                size="sm"
                onClick={() => {
                  setSelectedPhaseModal(null);
                  setCurrentPage('assessments');
                }}
              >
                {selectedPhaseModal.isAssessmentPassed ? 'Review Results' : 'Take Exam'}
              </Button>
            </div>

            {/* 5. Phase Milestone Award */}
            {selectedPhaseModal.milestoneTitle && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                      5. Phase Milestone Credential
                    </span>
                    <h5 className="text-sm font-bold text-white">{selectedPhaseModal.milestoneTitle}</h5>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {selectedPhaseModal.progress === 100
                        ? 'Milestone attained! Added to your verified learner credentials.'
                        : 'Achieved upon 100% completion of courses, practice, and project.'}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markMilestoneCompleted(selectedPhaseModal.id)}
                  disabled={selectedPhaseModal.progress < 100}
                >
                  {selectedPhaseModal.progress === 100 ? 'Claimed' : 'Locked'}
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
