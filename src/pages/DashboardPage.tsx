import React from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { SkillBar } from '../components/common/SkillBar';
import { Milestone } from '../components/roadmap/Milestone';
import {
  Sparkles,
  Flame,
  ArrowRight,
  Route,
  TrendingUp,
  FileCheck2,
  BookOpen,
  FolderGit2,
  Clock,
  Target,
  Bot,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Check,
  Play,
  Award,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    profile,
    roadmapPhases,
    recommendations,
    nextBestAction,
    skillGapAnalysis,
    overallProgress,
    setCurrentPage,
    setActivePhaseId,
    activities,
    updateSkillProficiency,
    startRecommendation,
    toggleSaveRecommendation,
    completeRecommendation,
    markCourseCompleted,
    markProjectCompleted,
    markPracticeCompleted,
  } = useApp();

  const currentPhase =
    (roadmapPhases || []).find((p) => p.status === 'in_progress') ||
    roadmapPhases[1] ||
    roadmapPhases[0] || {
      id: 'phase-1',
      phaseNumber: 1,
      title: 'Foundation & Core Skills',
      tagline: 'Essential building blocks',
      status: 'in_progress' as const,
      progress: 0,
      estimatedDuration: '3 Weeks',
      prerequisites: [],
      skills: [],
      whyThisPhase: 'Master foundational fundamentals.',
      assessmentRequired: 'Phase Assessment',
      assessmentId: 'assess-1',
      isAssessmentPassed: false,
      milestoneTitle: 'Foundation Milestone',
      milestoneDescription: 'Completed foundational skills.',
      unlockedBadges: [],
      courses: [],
      practiceItems: [],
      projects: [],
    };

  const handleExecuteNextAction = () => {
    if (!nextBestAction) {
      setCurrentPage('learning-path');
      return;
    }
    if (nextBestAction.type === 'Assessment') {
      setCurrentPage('assessments');
    } else if (nextBestAction.type === 'Practice' || nextBestAction.type === 'Project') {
      setActivePhaseId(nextBestAction.phaseId);
      setCurrentPage('learning-path');
    } else {
      if (nextBestAction.targetId) {
        startRecommendation(nextBestAction.targetId);
      }
      setCurrentPage('recommendations');
    }
  };

  const handleCompleteNextAction = () => {
    if (!nextBestAction) return;
    if (nextBestAction.type === 'Course') {
      markCourseCompleted(nextBestAction.phaseId, nextBestAction.targetId);
    } else if (nextBestAction.type === 'Project') {
      markProjectCompleted(nextBestAction.phaseId, nextBestAction.targetId);
    } else if (nextBestAction.type === 'Practice') {
      markPracticeCompleted(nextBestAction.phaseId, nextBestAction.targetId);
    } else if (nextBestAction.type === 'Assessment') {
      setCurrentPage('assessments');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#0b1329] via-[#0d1633] to-[#12112e] border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              AI Learning Roadmap Engine
            </span>
            <span className="text-xs text-slate-400 font-medium">{profile.lastActive}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {profile.name}! 👋
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Target Career Goal: <strong className="text-white font-semibold">{profile.careerGoal}</strong>. Diagnostic readiness is currently at <strong className="text-indigo-400 font-bold">{skillGapAnalysis.overallReadinessScore}%</strong>.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
            <div>
              <span className="text-[10px] text-amber-400/80 block uppercase font-bold">Study Streak</span>
              <span className="text-sm font-bold">{profile.streakDays} Consecutive Days</span>
            </div>
          </div>

          <Button
            variant="gradient"
            size="md"
            onClick={() => setCurrentPage('learning-path')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            View Roadmap
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default" className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Overall Roadmap Progress</span>
            <Route className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{overallProgress}%</span>
            <span className="text-xs text-emerald-400 font-semibold">+12% this week</span>
          </div>
          <ProgressBar value={overallProgress} size="sm" color="indigo" />
        </Card>

        <Card variant="default" className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Target Role Benchmark</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <span className="text-sm font-bold text-white line-clamp-1">
              {profile.careerGoal}
            </span>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Career Readiness</span>
              <span className="font-semibold text-slate-200">{skillGapAnalysis.overallReadinessScore}%</span>
            </div>
            <ProgressBar value={skillGapAnalysis.overallReadinessScore} size="sm" color="emerald" />
          </div>
        </Card>

        <Card variant="default" className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Weekly Study Budget</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{profile.weeklyHours}h</span>
            <span className="text-xs text-slate-400">/ week target</span>
          </div>
          <p className="text-[11px] text-slate-400">Paced for {profile.preferredLearningStyle} learning style</p>
        </Card>

        <Card variant="default" className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Skills Status Breakdown</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-xs font-semibold text-slate-300">
              <span className="text-emerald-400 font-bold">{skillGapAnalysis.masteredCount}</span> Mastered &bull; <span className="text-sky-400 font-bold">{skillGapAnalysis.developingCount}</span> Dev &bull; <span className="text-amber-400 font-bold">{skillGapAnalysis.gapCount}</span> Gaps
            </span>
          </div>
          <p className="text-[11px] text-slate-400">{recommendations.length} candidate items ranked</p>
        </Card>
      </div>

      {/* Next Best Action Card (Deterministic Weighted Match & Prerequisite Engine) */}
      {nextBestAction && (
        <Card variant="glow" className="p-6 border-indigo-500/40 bg-gradient-to-r from-[#0c142b] via-[#0f1733] to-[#091124]">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Deterministic Next Best Action
                </span>
                <Badge variant="primary" size="sm">
                  {nextBestAction.phaseTitle} &bull; Phase {nextBestAction.phaseNumber}
                </Badge>
                <span className="text-xs text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  {nextBestAction.type} &bull; {nextBestAction.estimatedDuration} &bull; {nextBestAction.difficulty}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white">
                {nextBestAction.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {nextBestAction.description}
              </p>

              {/* Rationale explanation calculated deterministically */}
              <div className="p-3.5 rounded-xl bg-[#070b16] border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5 font-semibold">Why this action now?</strong>
                  <span className="text-slate-300 leading-relaxed">{nextBestAction.whyThisAction}</span>
                </div>
              </div>

              {/* Skills targeted */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-xs text-slate-400">Targeted Skills:</span>
                {(nextBestAction?.skillsTargeted || []).map((skill) => (
                  <span key={skill} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700/60 font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
              <Button
                variant="gradient"
                size="lg"
                onClick={handleExecuteNextAction}
                rightIcon={<Play className="w-4 h-4" />}
                className="w-full"
              >
                {nextBestAction.type === 'Assessment' ? 'Take Phase Assessment' : 'Start Next Best Action'}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActivePhaseId(nextBestAction.phaseId);
                    setCurrentPage('learning-path');
                  }}
                  leftIcon={<Route className="w-3.5 h-3.5 text-indigo-400" />}
                  className="flex-1"
                >
                  Locate in Roadmap
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCompleteNextAction}
                  leftIcon={<Check className="w-3.5 h-3.5 text-emerald-400" />}
                  className="flex-1"
                >
                  Mark Complete
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Two Column Layout: Skill Gaps vs Active Milestone & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Skill Gap Analysis & Roadmap Snapshot */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skill Gap Analysis Card */}
          <Card variant="default" className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  Your Skill Gaps
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calculated against industry benchmark for <span className="text-slate-200 font-semibold">{profile.careerGoal}</span>
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage('progress')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Full Skill Matrix
              </Button>
            </div>

            {/* Top 3 Skills To Improve Next Alert Box */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Top 3 Skills To Improve Next:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {(skillGapAnalysis?.top3ToImprove || []).map((item, idx) => (
                  <div key={item.skillId || idx} className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/20 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold uppercase mb-1">
                        <span>Rank #{idx + 1} Priority</span>
                        <span className="text-rose-400">-{item.gap}% Gap</span>
                      </div>
                      <h5 className="text-xs font-bold text-white">{item.skillName}</h5>
                    </div>
                    <div className="pt-2 mt-1 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>{item.currentProficiency}% &rarr; {item.requiredProficiency}%</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Skill Gap Bars with Interactive Adjustment */}
            <div className="space-y-4 pt-1">
              {(skillGapAnalysis?.skillGaps || []).map((item) => (
                <SkillBar
                  key={item.skillId}
                  skill={{
                    name: item.skillName,
                    category: item.category,
                    proficiency: item.currentProficiency,
                    targetProficiency: item.requiredProficiency,
                    status: item.status,
                    priority: item.priority,
                    reason: item.reason,
                  }}
                  showCategory
                  showStatus
                  onAdjust={(newVal) => updateSkillProficiency(item.skillId, newVal)}
                />
              ))}
            </div>

            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800">
              <span>Adjusting sliders updates skill proficiency in real-time and refreshes recommendations.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage('assessments')}
                leftIcon={<FileCheck2 className="w-3.5 h-3.5" />}
              >
                Validate via Assessment
              </Button>
            </div>
          </Card>

          {/* Active Phase Curriculum Highlights */}
          <Card variant="default" className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  Active Phase Curriculum
                </span>
                <h3 className="text-base font-bold text-white">
                  Phase {currentPhase.phaseNumber}: {currentPhase.title}
                </h3>
              </div>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setActivePhaseId(currentPhase.id);
                  setCurrentPage('learning-path');
                }}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Expand Phase
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {(currentPhase.courses || []).map((course) => (
                <div
                  key={course.id}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                        <BookOpen className="w-3.5 h-3.5" />
                        Course
                      </span>
                      <span>{course.duration}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white mb-1">{course.title}</h4>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{course.progress}% completed</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-indigo-400 hover:text-indigo-300 p-0 text-xs"
                      onClick={() => setCurrentPage('recommendations')}
                    >
                      Resume &rarr;
                    </Button>
                  </div>
                </div>
              ))}

              {(currentPhase.projects || []).map((project) => (
                <div
                  key={project.id}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-500/20 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="flex items-center gap-1 text-purple-400 font-semibold">
                        <FolderGit2 className="w-3.5 h-3.5" />
                        Project
                      </span>
                      <span>{project.duration}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white mb-1">{project.title}</h4>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{project.progress}% completed</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-purple-400 hover:text-purple-300 p-0 text-xs"
                      onClick={() => setCurrentPage('learning-path')}
                    >
                      Workspace &rarr;
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Milestone + Recent Activity + Advisor Quick Access */}
        <div className="space-y-6">
          {/* Milestone Component */}
          <Milestone
            currentPhaseTitle={currentPhase.title}
            nextMilestoneTitle="Statistical Inference & Diagnostics Exam"
            estimatedCompletion="In 3 Days"
            unlockedBadges={currentPhase.unlockedBadges || ['Python Mastery', 'Data Wrangling', 'Foundation Core']}
          />

          {/* Recent Activity Timeline */}
          <Card variant="default" className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Recent Activity
            </h3>

            <div className="space-y-3">
              {(activities || []).slice(0, 4).map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0 text-indigo-400 mt-0.5">
                    {act.type === 'course_progress' && <BookOpen className="w-3.5 h-3.5" />}
                    {act.type === 'project_completed' && <FolderGit2 className="w-3.5 h-3.5 text-purple-400" />}
                    {act.type === 'assessment_passed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {act.type === 'streak_milestone' && <Flame className="w-3.5 h-3.5 text-amber-400" />}
                    {act.type === 'skill_level_up' && <TrendingUp className="w-3.5 h-3.5 text-sky-400" />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-slate-200 leading-snug">{act.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{act.description}</p>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{act.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick AI Advisor Chat Pill */}
          <Card
            variant="interactive"
            className="p-5 bg-gradient-to-br from-[#0c142b] to-[#141233] border-indigo-500/30"
            onClick={() => setCurrentPage('ai-assistant')}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Have Questions?</h4>
                <p className="text-[11px] text-indigo-300">Ask the PathFind AI Learning Advisor</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              "Why should I learn statistics before machine learning?"
            </p>
            <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
              Open AI Chatbot &rarr;
            </span>
          </Card>
        </div>
      </div>
    </div>
  );
};
