import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  Target,
  ChevronRight,
  Play,
  Layers,
  BarChart3,
  Cpu,
  Server,
  Code2,
} from 'lucide-react';
import { PathFindLogo } from '../common/PathFindLogo';

export const HeroRoadmapVisual: React.FC = () => {
  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      {/* Ambient background glow behind visual */}
      <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-cyan-500/10 rounded-3xl blur-2xl -z-10 pointer-events-none" />

      {/* Main Glassmorphic Roadmap Visual Card */}
      <div className="rounded-3xl bg-[#090e1f]/95 border border-slate-700/60 shadow-2xl shadow-indigo-950/60 p-4 sm:p-6 backdrop-blur-xl relative overflow-hidden text-left">
        {/* Subtle grid background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:18px_18px] opacity-10 pointer-events-none" />

        {/* Top Control Bar with Status & Real-Time Sync */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/90 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-slate-300 font-semibold tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              AI ROADMAP GRAPH ENGINE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold">
              Live Traversal
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">v2.4 Adaptive</span>
          </div>
        </div>

        {/* Learner Profile Header Strip */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-[#0c142c] border border-indigo-500/25 mb-4 flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-500/20">
              AI
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">
                Learner Target Role
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                AI & Machine Learning Engineer
                <Target className="w-3.5 h-3.5 text-indigo-400" />
              </h4>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 block font-medium">Estimated Pace</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">6 hrs/wk &bull; 80h Total</span>
          </div>
        </div>

        {/* 7-Step Traversal Roadmap Nodes */}
        <div className="space-y-2.5 relative z-10">
          {/* Node 1: Career Goal Origin */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
              <Target className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Starting Benchmark</span>
                <span className="text-xs font-bold text-slate-200">Career Goal Identified</span>
              </div>
              <span className="text-[10px] text-indigo-300 font-mono px-2 py-0.5 rounded bg-indigo-500/10">
                Calibrated
              </span>
            </div>
          </div>

          {/* Node 2: Phase 1 Foundation (Completed) */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">1. Core Foundation</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                    100% Passed
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">Python • Algorithms • Data Structures</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 font-mono">Mastered</span>
            </div>
          </div>

          {/* Node 3: Phase 2 Data & Statistics (CURRENT ACTIVE FOCUS) */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#0e1938] via-[#121c42] to-[#0d1633] border-2 border-indigo-500/60 shadow-lg shadow-indigo-500/15 space-y-2 relative overflow-hidden">
            {/* Glowing active node indicator */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/40 shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-extrabold text-white">2. Data & Statistics</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500 text-white font-bold uppercase tracking-wider animate-pulse">
                      Active Focus
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-300">Probability • Linear Algebra • A/B Testing</span>
                </div>
              </div>
              <span className="text-xs font-extrabold text-indigo-300 font-mono">65%</span>
            </div>

            {/* Progress bar inside active node */}
            <div className="space-y-1">
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 h-full rounded-full w-[65%]" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="text-indigo-300 font-medium">Next: Hypothesis Testing Deliverable</span>
                <span className="text-amber-400 font-medium">Skill Gap: 45% &rarr; 85%</span>
              </div>
            </div>
          </div>

          {/* Node 4: Phase 3 Machine Learning (Upcoming) */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80 opacity-90">
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-indigo-300 flex items-center justify-center shrink-0">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200">3. Machine Learning</span>
                <span className="text-[11px] text-slate-400 block truncate">
                  Scikit-Learn • Tree Models • Feature Engineering
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-800">
                Unlocked Next
              </span>
            </div>
          </div>

          {/* Node 5: Phase 4 Deep Learning (Planned) */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/30 border border-slate-800/60 opacity-75">
            <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/80 text-purple-300 flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-300">4. Deep Learning & Transformers</span>
                <span className="text-[11px] text-slate-500 block truncate">
                  PyTorch • CNNs • LLM Fine-Tuning
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" /> Prerequisite
              </span>
            </div>
          </div>

          {/* Node 6: Phase 5 Deployment (Planned) */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/30 border border-slate-800/60 opacity-60">
            <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/80 text-cyan-300 flex items-center justify-center shrink-0">
              <Server className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-300">5. Deployment & MLOps</span>
                <span className="text-[11px] text-slate-500 block truncate">
                  FastAPI • Docker • Model Serving
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Phase 5</span>
            </div>
          </div>

          {/* Node 7: Career Goal Achieved (Milestone) */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                  Final Destination Milestone
                </span>
                <h5 className="text-xs font-bold text-white">Career Goal Achieved &bull; Verified Portfolio</h5>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
              Target
            </span>
          </div>
        </div>

        {/* Floating Mini Feature Badges */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            Dynamic Re-sequencing
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Skill Gap Closing
          </span>
          <span className="flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            Hands-on Projects
          </span>
        </div>
      </div>
    </div>
  );
};
