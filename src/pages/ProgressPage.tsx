import React from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { SkillBar } from '../components/common/SkillBar';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Flame,
  Clock,
  BookOpen,
  FolderGit2,
  FileCheck2,
  Target,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

export const ProgressPage: React.FC = () => {
  const {
    profile,
    roadmapPhases,
    assessmentResults,
    skillGapAnalysis,
    overallProgress,
    setCurrentPage,
    updateSkillProficiency,
  } = useApp();

  // Chart Data: Skill Comparison from actual dynamic benchmark
  const skillChartData = skillGapAnalysis.skillGaps.map((s) => ({
    name: s.skillName.length > 12 ? s.skillName.substring(0, 10) + '...' : s.skillName,
    fullName: s.skillName,
    Current: s.currentProficiency,
    Target: s.requiredProficiency,
  }));

  // Weekly study hours history data
  const studyVelocityData = [
    { day: 'Mon', hours: 1.2, streak: true },
    { day: 'Tue', hours: 1.0, streak: true },
    { day: 'Wed', hours: 0.8, streak: true },
    { day: 'Thu', hours: 1.5, streak: true },
    { day: 'Fri', hours: 0.5, streak: true },
    { day: 'Sat', hours: 1.8, streak: true },
    { day: 'Sun', hours: 1.0, streak: true },
  ];

  // Completed courses and projects across all phases
  const completedCoursesList = roadmapPhases
    .flatMap((p) => p.courses)
    .filter((c) => c.status === 'completed');

  const completedProjectsList = roadmapPhases
    .flatMap((p) => p.projects)
    .filter((p) => p.status === 'completed');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#0a1024] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="primary" size="sm">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              Skill Velocity & Analytics
            </Badge>
            <span className="text-xs text-slate-400">
              Verified Diagnostics & Role Readiness ({profile.careerGoal})
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Learning Progress & Skill Mastery
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Real-time telemetry measuring knowledge retention, completed artifacts, diagnostic scores, and skill gaps calculated against industry benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="gradient"
            size="sm"
            onClick={() => setCurrentPage('assessments')}
            leftIcon={<FileCheck2 className="w-4 h-4" />}
          >
            Take Skill Check
          </Button>
        </div>
      </div>

      {/* Primary Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default" className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Roadmap Completion</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            {overallProgress}%
          </div>
          <ProgressBar value={overallProgress} size="sm" color="indigo" />
        </Card>

        <Card variant="default" className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Active Study Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
            {profile.streakDays} Days
          </div>
          <p className="text-[11px] text-amber-300/80">Consistent weekly momentum</p>
        </Card>

        <Card variant="default" className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Job Readiness Index</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mb-1">
            {skillGapAnalysis.overallReadinessScore}%
          </div>
          <p className="text-[11px] text-slate-400">
            {skillGapAnalysis.masteredCount} Mastered &bull; {skillGapAnalysis.gapCount} Gaps
          </p>
        </Card>

        <Card variant="default" className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Diagnostic Exam Average</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 mb-1">
            92%
          </div>
          <p className="text-[11px] text-slate-400">Mastery level retention</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Gap Comparison Bar Chart */}
        <Card variant="default" className="p-5 sm:p-6 lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white">
                Skill Competency vs. Target Benchmark
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Current proficiency (Indigo) vs. target role requirement (Slate)
              </p>
            </div>
            <Badge variant="primary" size="sm">
              {profile.careerGoal} Standard
            </Badge>
          </div>

          <div className="h-64 sm:h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c1222',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Current" fill="#6366f1" radius={[4, 4, 0, 0]} name="Current Proficiency" />
                <Bar dataKey="Target" fill="#334155" radius={[4, 4, 0, 0]} name="Target Benchmark" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Weekly Study Velocity Chart */}
        <Card variant="default" className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Weekly Study Time</h3>
              <p className="text-xs text-slate-400 mt-0.5">Hours logged per day</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>7.8h Total</span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studyVelocityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c1222',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(value: any) => [`${value} hrs`, 'Study Time']}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorHours)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Comprehensive Skill Breakdown Table with Status Badges */}
      <Card variant="default" className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Granular Skill Gap Matrix</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live proficiency sliders reflect your ongoing study progression & auto-recalculate recommendations
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage('learning-path')}
          >
            Curriculum Map
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {skillGapAnalysis.skillGaps.map((item) => (
            <div key={item.skillId} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <SkillBar
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
            </div>
          ))}
        </div>
      </Card>

      {/* Two Column Archive: Completed Courses & Assessment History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Completed Courses & Portfolio Projects */}
        <Card variant="default" className="p-5 sm:p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Completed Curriculums & Deliverables
          </h3>

          <div className="space-y-2.5">
            {completedCoursesList.map((course) => (
              <div
                key={course.id}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <h5 className="font-bold text-white">{course.title}</h5>
                  <p className="text-slate-400 text-[11px]">{course.provider} &bull; {course.duration}</p>
                </div>
                <Badge variant="success" size="sm">
                  100% Completed
                </Badge>
              </div>
            ))}

            {(profile.completedCourses || []).map((title, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <h5 className="font-bold text-white">{title}</h5>
                  <p className="text-slate-400 text-[11px]">Prior Learning Verified</p>
                </div>
                <Badge variant="neutral" size="sm">
                  Exempted / Completed
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Diagnostic Assessment Records */}
        <Card variant="default" className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-indigo-400" />
              Assessment History
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage('assessments')}
              className="text-xs text-indigo-400"
            >
              Take Quiz &rarr;
            </Button>
          </div>

          <div className="space-y-3">
            {assessmentResults.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-xl bg-slate-900 border border-indigo-500/20 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-white text-sm">{res.title}</h5>
                  <span className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                    {res.score}% Score
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>Date: {res.date}</span>
                  <span>&bull;</span>
                  <span>Mastery: <strong className="text-white">{res.masteryLevel}</strong></span>
                </div>

                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Strong Areas:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {res.strongAreas.map((area, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
