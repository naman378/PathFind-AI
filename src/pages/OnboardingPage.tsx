import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { LoadingState } from '../components/common/LoadingState';
import { PathFindLogo } from '../components/common/PathFindLogo';
import { ExperienceLevel, LearningStyle, PreferredDifficulty, Skill } from '../types';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  BrainCircuit,
  User,
  GraduationCap,
  Target,
  Clock,
  BookOpen,
  Sliders,
  Layers,
  Code2,
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { profile, generateRoadmapFromOnboarding, setCurrentPage, setIsLoggedIn } = useApp();

  const [step, setStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>(profile.name || 'Naman');
  const [education, setEducation] = useState<string>(profile.education || 'B.Tech in Computer Science');
  const [careerGoal, setCareerGoal] = useState<string>(profile.careerGoal || 'AI Engineer');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(profile.experienceLevel || 'Intermediate');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    profile.interests || ['Deep Learning', 'LLMs & RAG', 'MLOps & Inference']
  );
  const [skills, setSkills] = useState<Skill[]>(profile.skills);
  const [completedCoursesInput, setCompletedCoursesInput] = useState<string>(
    profile.completedCourses.join('\n')
  );
  const [weeklyHours, setWeeklyHours] = useState<number>(profile.weeklyHours || 6);
  const [preferredLearningStyle, setPreferredLearningStyle] = useState<LearningStyle>(
    profile.preferredLearningStyle || 'Hands-on Projects'
  );
  const [preferredDifficulty, setPreferredDifficulty] = useState<PreferredDifficulty>(
    profile.preferredDifficulty || 'Adaptive'
  );

  const availableInterests = [
    'Deep Learning',
    'LLMs & RAG',
    'MLOps & Inference',
    'Computer Vision',
    'Probability & Stats',
    'Natural Language Processing',
    'Reinforcement Learning',
    'Cloud AI Pipelines',
  ];

  const toggleInterest = (item: string) => {
    setSelectedInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const updateSkillProf = (skillId: string, val: number) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === skillId ? { ...s, proficiency: val } : s))
    );
  };

  const handleFinish = () => {
    setIsGenerating(true);

    const completedCoursesList = completedCoursesInput
      .split('\n')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    setTimeout(() => {
      setIsLoggedIn(true);
      generateRoadmapFromOnboarding({
        name,
        education,
        careerGoal,
        experienceLevel,
        interests: selectedInterests,
        skills,
        completedCourses: completedCoursesList,
        weeklyHours,
        preferredLearningStyle,
        preferredDifficulty,
      });
      setIsGenerating(false);
    }, 1800);
  };

  const totalSteps = 5;

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4">
        <Card variant="glow" className="max-w-md w-full p-8 text-center border-indigo-500/40">
          <LoadingState
            message="Synthesizing Your AI Roadmap..."
            subMessage={`Mapping ${careerGoal} competencies against your skills & weekly study budget.`}
          />
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-indigo-400 font-semibold">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Resolving prerequisite dependencies & match scores...</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between max-w-4xl mx-auto w-full">
        <button
          onClick={() => setCurrentPage('landing')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#070B18] border border-indigo-500/30 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <PathFindLogo className="w-full h-full" />
          </div>
          <span className="font-bold text-white text-sm flex items-center gap-1.5">
            PathFind <span className="text-indigo-400 font-mono text-[11px] px-1 py-0.2 rounded bg-indigo-500/15 border border-indigo-500/30">AI</span>
          </span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">
            Step {step} of {totalSteps}
          </span>
          <div className="w-28 sm:w-36">
            <ProgressBar value={(step / totalSteps) * 100} size="sm" color="indigo" />
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="max-w-3xl mx-auto w-full px-4 py-8 flex-1 flex flex-col justify-center">
        {/* STEP 1: Basic Info & Career Goal */}
        {step === 1 && (
          <Card variant="default" className="p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <User className="w-4 h-4" />
                <span>Step 1: Background & Goal</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">What is your primary career target?</h2>
              <p className="text-xs text-slate-400 mt-1">
                We will align the curriculum with industry competencies for this exact role.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Naman"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Education or Current Occupation
                </label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science / Junior Developer"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Career Goal
                </label>
                <select
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="AI Engineer">AI Engineer</option>
                  <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="MLOps & Infrastructure Engineer">MLOps & Infrastructure Engineer</option>
                  <option value="Deep Learning Researcher">Deep Learning Researcher</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 2: Experience & Interests */}
        {step === 2 && (
          <Card variant="default" className="p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Target className="w-4 h-4" />
                <span>Step 2: Experience & Focus Areas</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">How experienced are you in coding & math?</h2>
              <p className="text-xs text-slate-400 mt-1">
                This helps us calibrate starting difficulty and prerequisite exemptions.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Current Overall Experience Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Beginner', 'Intermediate', 'Advanced'] as ExperienceLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`p-3.5 rounded-xl border text-center font-semibold text-xs sm:text-sm transition-all ${
                        experienceLevel === lvl
                          ? 'border-indigo-500 bg-indigo-600/20 text-white ring-1 ring-indigo-500'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Target Interests (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-indigo-600/25 border-indigo-500 text-indigo-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 3: Current Skills & Proficiency Ratings */}
        {step === 3 && (
          <Card variant="default" className="p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Sliders className="w-4 h-4" />
                <span>Step 3: Baseline Skill Proficiencies (0-100)</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">Rate your current competence</h2>
              <p className="text-xs text-slate-400 mt-1">
                Be honest! This ensures you skip concepts you already know and focus on your true skill gaps.
              </p>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {skills.map((skill) => (
                <div key={skill.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200">{skill.name}</span>
                    <span className="font-mono font-bold text-indigo-400">{skill.proficiency}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={skill.proficiency}
                    onChange={(e) => updateSkillProf(skill.id, Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-1.5"
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* STEP 4: Preferences (Time, Learning Style, Difficulty) */}
        {step === 4 && (
          <Card variant="default" className="p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" />
                <span>Step 4: Study Time & Learning Style</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">Personalize your learning schedule</h2>
              <p className="text-xs text-slate-400 mt-1">
                We'll tailor phase durations and project sizes according to your available time.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Available Weekly Learning Time
                  </label>
                  <span className="text-xs font-bold text-indigo-400 font-mono">
                    {weeklyHours} Hours / Week
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-2"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Casual (2h)</span>
                  <span>Moderate (6h - Demo Default)</span>
                  <span>Intense (15h+)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Preferred Learning Style
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {(
                    [
                      'Hands-on Projects',
                      'Visual & Interactive',
                      'Video Lectures',
                      'Reading & Theory',
                    ] as LearningStyle[]
                  ).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setPreferredLearningStyle(style)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                        preferredLearningStyle === style
                          ? 'border-indigo-500 bg-indigo-600/20 text-white'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Preferred Difficulty Mode
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Beginner', 'Intermediate', 'Challenging', 'Adaptive'] as PreferredDifficulty[]).map(
                    (diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setPreferredDifficulty(diff)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                          preferredDifficulty === diff
                            ? 'border-indigo-500 bg-indigo-600/20 text-white'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {diff}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 5: Learner Summary & Launch */}
        {step === 5 && (
          <Card variant="glow" className="p-6 sm:p-8 space-y-6 border-indigo-500/40">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Step 5: Profile Review & Confirmation</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">Your Learner Summary</h2>
              <p className="text-xs text-slate-400 mt-1">
                Review your profile parameters before generating your personalized roadmap.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase text-[10px] font-bold">Learner</span>
                <p className="font-bold text-white text-sm">{name}</p>
                <p className="text-slate-400 text-[11px]">{education}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase text-[10px] font-bold">Target Career</span>
                <p className="font-bold text-indigo-300 text-sm">{careerGoal}</p>
                <p className="text-slate-400 text-[11px]">{experienceLevel} Level</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase text-[10px] font-bold">Learning Modality</span>
                <p className="font-semibold text-slate-200">{preferredLearningStyle}</p>
                <p className="text-slate-400 text-[11px]">{weeklyHours} hours/week &bull; {preferredDifficulty}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase text-[10px] font-bold">Key Focus Areas</span>
                <p className="font-semibold text-slate-200 truncate">{selectedInterests.slice(0, 2).join(', ')}</p>
                <p className="text-slate-400 text-[11px]">+{selectedInterests.length - 2} more topics</p>
              </div>
            </div>

            {/* Top Gaps Preview */}
            <div className="p-4 rounded-xl bg-[#090f1f] border border-indigo-500/20 space-y-2">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                Detected Skill Priorities:
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Python Foundation</span>
                  <span className="font-bold text-emerald-400">85% (Solid)</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Statistics</span>
                  <span className="font-bold text-amber-400">45% (Priority)</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Deep Learning</span>
                  <span className="font-bold text-rose-400">20% (Upcoming)</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between mt-6">
          {step > 1 ? (
            <Button
              variant="outline"
              size="md"
              onClick={() => setStep((s) => s - 1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage('landing')}>
              Cancel
            </Button>
          )}

          {step < totalSteps ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setStep((s) => s + 1)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="gradient"
              size="lg"
              onClick={handleFinish}
              rightIcon={<Sparkles className="w-5 h-5" />}
            >
              Generate My Personalized Path
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};
