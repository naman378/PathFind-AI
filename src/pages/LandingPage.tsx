import React from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { PathFindLogo } from '../components/common/PathFindLogo';
import { HeroRoadmapVisual } from '../components/landing/HeroRoadmapVisual';
import {
  ArrowRight,
  Sparkles,
  Route,
  Target,
  BrainCircuit,
  Bot,
  CheckCircle2,
  TrendingUp,
  Layers,
  Zap,
  Code2,
  ShieldCheck,
  ChevronRight,
  LayoutDashboard,
  User,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentPage, isLoggedIn, firebaseUser, profile } = useApp();

  const handleStartPath = () => {
    if (isLoggedIn) {
      setCurrentPage('onboarding');
    } else {
      setCurrentPage('signup');
    }
  };

  const handleSignIn = () => {
    if (isLoggedIn) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('login');
    }
  };

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  const displayName = profile.name || firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'Learner';

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#070b14]/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <button
          onClick={() => setCurrentPage('landing')}
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 border border-indigo-500/30 flex items-center justify-center bg-[#070B18] transition-transform duration-200 group-hover:scale-105">
            <PathFindLogo className="w-full h-full" />
          </div>
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
              PathFind
            </span>
            <span className="text-indigo-400 font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30">
              AI
            </span>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#problem" className="hover:text-white transition-colors">Problem</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#features" className="hover:text-white transition-colors">Adaptive AI</a>
          <a href="#assistant" className="hover:text-white transition-colors">AI Advisor</a>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentPage('dashboard')}
                leftIcon={<LayoutDashboard className="w-4 h-4" />}
              >
                Open Dashboard
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignIn}
                className="text-slate-300 hover:text-white"
              >
                Sign In
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={handleStartPath}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </header>

      {/* SECTION 1 — HERO / FRONT SECTION */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-semibold shadow-inner">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Next-Gen AI Personalized Learning Engine</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Your Path,{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Your Future.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            AI-powered personalized learning paths that turn your career goals into a structured roadmap of skills, courses, projects, and milestones.
          </p>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="gradient"
              size="lg"
              onClick={handleStartPath}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="w-full sm:w-auto px-8 shadow-lg shadow-indigo-500/25"
            >
              {isLoggedIn ? 'Generate New Learning Path' : 'Build My Learning Path'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToHowItWorks}
              className="w-full sm:w-auto px-6"
            >
              See How It Works
            </Button>
          </div>

          {/* Supporting Indicators */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
              <span>Prerequisite-locked graph</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 ring-4 ring-indigo-400/20" />
              <span>Deterministic matching</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 ring-4 ring-purple-400/20" />
              <span>Firestore live sync</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — AI ROADMAP ENGINE */}
      <section id="how-it-works" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-800/80">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <Route className="w-3.5 h-3.5 text-indigo-400" />
            AI ROADMAP GRAPH ENGINE
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Your Learning Path,{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              Built Around You.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            See how PathFind transforms your career goal, current skills, and learning gaps into an adaptive roadmap with clear prerequisites, milestones, and next steps.
          </p>
        </div>

        {/* Detailed AI Roadmap Dashboard Visual */}
        <div className="max-w-4xl mx-auto">
          <HeroRoadmapVisual />
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-20 bg-[#050811] border-y border-slate-800/80 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              The Problem With Traditional Learning
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Why 90% of Self-Directed Learners Get Stuck
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Generic tutorials and massive static course playlists fail to adapt to your actual background and goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default" className="p-6 border-rose-500/20 bg-[#0d1222]">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Tutorial Hell & No Real Roadmap</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Watching endless videos without knowing if the topic connects to actual industry hiring requirements or if you already know it.
              </p>
            </Card>

            <Card variant="default" className="p-6 border-rose-500/20 bg-[#0d1222]">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Invisible Skill Gaps</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Jumping straight into complex topics like Deep Learning without discovering that a lack of probability intuition will cause severe roadblocks.
              </p>
            </Card>

            <Card variant="default" className="p-6 border-rose-500/20 bg-[#0d1222]">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">One-Size-Fits-All Curriculums</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Static syllabuses force you through beginner material you already mastered, wasting precious study hours and killing motivation.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="features" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              The PathFind AI Solution
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              A Dynamic, Adaptive Roadmap That Evolves With You
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              PathFind AI continuously maps your existing capabilities against career benchmarks. It dynamically prescribes the precise course, project, or assessment you need next.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Diagnostic Skill Gap Analysis</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Calculates exact proficiency percentages and pinpoints high-priority bottlenecks before you encounter them.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Explainable AI Recommendations</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Every recommended course and project explicitly explains <strong className="text-slate-200">"Why you should learn this now"</strong> based on your data.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Interactive Knowledge Checks</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Adaptive assessments verify actual retention, instantly unlocking subsequent roadmap tiers upon mastery.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button variant="gradient" onClick={handleStartPath} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Build Your Personalized Path
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Card variant="glow" className="p-5 border-indigo-500/30">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Adaptive Learning Engine Logic</span>
                </div>
                <Badge variant="primary" size="sm">Real-Time Evaluation</Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#070b16] border border-slate-800 space-y-1">
                  <span className="text-indigo-400 font-semibold">1. Input Ingestion</span>
                  <p className="text-slate-400 text-[11px]">
                    Goal: AI Engineer &bull; Current Stats: 45% &bull; Available: 6 hrs/week &bull; Style: Hands-on
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#070b16] border border-slate-800 space-y-1">
                  <span className="text-purple-400 font-semibold">2. Graph Traversal & Prerequisite Resolution</span>
                  <p className="text-slate-400 text-[11px]">
                    Python mastered (85%) &rarr; Skip Phase 1 &rarr; Focus Phase 2 (Applied Stats & Distributions)
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#070b16] border border-slate-800 space-y-1">
                  <span className="text-emerald-400 font-semibold">3. Prescribed Next Best Action</span>
                  <p className="text-slate-400 text-[11px]">
                    Recommend "A/B Testing Simulation Engine" (94% Match, Estimated 10h)
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Learning Assistant Feature Section */}
      <section id="assistant" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4 order-2 lg:order-1">
            <Card variant="glow" className="p-5 bg-[#0a0f20]">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">PathFind AI Advisor</h4>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Context-Aware Engine Active
                  </span>
                </div>
              </div>

              <div className="space-y-3 py-3 text-xs">
                <div className="p-3 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-200 text-right ml-8">
                  &ldquo;Why should I learn statistics before jumping into machine learning?&rdquo;
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 mr-8 space-y-2 leading-relaxed">
                  <p>
                    Because loss functions and convergence algorithms are fundamentally statistical probability models.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Understanding distributions and variance prevents you from deploying overfitted models in production.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-indigo-400">
                <span>Context-aware assistance aligned to your learning path &rarr;</span>
              </div>
            </Card>
          </div>

          <div className="space-y-6 order-1 lg:order-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Interactive Guidance
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              An AI Advisor That Knows Your Exact Curriculum
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Ask questions whenever you feel blocked. Your assistant has complete context over your current skills, completed projects, and upcoming exam requirements.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                &ldquo;What should I learn next?&rdquo;
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                &ldquo;Explain overfitting simply&rdquo;
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                &ldquo;I&apos;m struggling with regression&rdquo;
              </span>
            </div>

            <div className="pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  if (isLoggedIn) {
                    setCurrentPage('ai-assistant');
                  } else {
                    setCurrentPage('login');
                  }
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Chat with Learning Advisor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 bg-gradient-to-b from-[#050811] to-[#0a1024] border-t border-slate-800 px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Build Your Structured Career Roadmap?
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Join learners advancing toward top-tier tech roles with AI-curated roadmaps, milestone tracking, and diagnostic feedback.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="gradient"
              size="lg"
              onClick={handleStartPath}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="w-full sm:w-auto px-8"
            >
              Build My Learning Path
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleSignIn}
              className="w-full sm:w-auto"
            >
              {isLoggedIn ? 'Go to My Dashboard' : 'Sign In to Your Account'}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800/80 px-4 sm:px-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md overflow-hidden bg-[#070B18] border border-indigo-500/30 flex items-center justify-center">
            <PathFindLogo className="w-full h-full" />
          </div>
          <span className="font-bold text-slate-400">PathFind AI &bull; Personalized Learning Path Recommender</span>
        </div>
        <p>&copy; {new Date().getFullYear()} PathFind AI. All rights reserved.</p>
      </footer>
    </div>
  );
};
