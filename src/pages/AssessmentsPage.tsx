import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { AssessmentQuestion } from '../components/assessment/AssessmentQuestion';
import { AssessmentResult } from '../types';
import confetti from 'canvas-confetti';
import {
  FileCheck2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Award,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Clock,
} from 'lucide-react';

export const AssessmentsPage: React.FC = () => {
  const { assessmentModules, submitAssessment, assessmentResults, setCurrentPage } = useApp();

  const [activeModuleId, setActiveModuleId] = useState<string>(assessmentModules[0]?.id || 'assess-stats-ml');
  const [isTestActive, setIsTestActive] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [currentResult, setCurrentResult] = useState<AssessmentResult | null>(null);
  const [showReview, setShowReview] = useState<boolean>(false);

  const activeModule = assessmentModules.find((m) => m.id === activeModuleId) || assessmentModules[0];
  const currentQuestion = activeModule.questions[currentQuestionIndex];

  const handleStartTest = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setCurrentResult(null);
    setShowReview(false);
    setIsTestActive(true);
  };

  const handleSelectOption = (optionId: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeModule.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    const res = await submitAssessment(activeModule.id, userAnswers);
    setCurrentResult(res);
    setIsTestActive(false);

    if (res.passed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback if confetti isn't supported
      }
    }
  };

  const answeredCount = Object.keys(userAnswers).length;
  const isComplete = answeredCount === activeModule.questions.length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="p-6 rounded-3xl bg-[#0a1024] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="primary" size="sm">
              <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
              Adaptive Diagnostic Engine
            </Badge>
            <span className="text-xs text-slate-400">
              Passing Score: {activeModule.passingScore}%
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Diagnostic Knowledge Checks
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Verify real understanding with realistic AI Engineering scenarios. Earning high marks updates your skill rating and unlocks subsequent roadmap phases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage('learning-path')}
          >
            Roadmap Overview
          </Button>
        </div>
      </div>

      {/* QUIZ IN PROGRESS VIEW */}
      {isTestActive ? (
        <Card variant="glow" className="p-6 sm:p-8 border-indigo-500/40 max-w-3xl mx-auto space-y-6">
          {/* Header with question counter and progress */}
          <div className="space-y-2 pb-4 border-b border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white uppercase tracking-wider">
                {activeModule.title}
              </span>
              <span className="text-slate-400">
                Answered: {answeredCount} / {activeModule.questions.length}
              </span>
            </div>
            <ProgressBar
              value={(answeredCount / activeModule.questions.length) * 100}
              size="sm"
              color="indigo"
            />
          </div>

          {/* Question Component */}
          <AssessmentQuestion
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={activeModule.questions.length}
            selectedOptionId={userAnswers[currentQuestion.id]}
            onSelectOption={handleSelectOption}
            showExplanation={false}
          />

          {/* Quiz Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <Button
              variant="outline"
              size="md"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            <div className="flex items-center gap-3">
              {currentQuestionIndex < activeModule.questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNextQuestion}
                  disabled={!userAnswers[currentQuestion.id]}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  size="md"
                  onClick={handleSubmitQuiz}
                  disabled={!isComplete}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Submit Assessment
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : currentResult ? (
        /* QUIZ RESULTS VIEW */
        <Card variant="glow" className="p-6 sm:p-8 border-indigo-500/40 max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div
              className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border shadow-xl ${
                currentResult.passed
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              }`}
            >
              {currentResult.passed ? <Award className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Evaluation Complete
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {currentResult.passed ? 'Assessment Passed! 🎉' : 'Needs Review'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              You scored <strong className="text-white text-base">{currentResult.score}%</strong> (
              {currentResult.correctCount} of {currentResult.totalQuestions} correct)
            </p>
          </div>

          {/* Mastery Level Badge */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Calculated Competency Level:
              </span>
              <span className="font-extrabold text-white text-base">{currentResult.masteryLevel}</span>
            </div>
            <Badge variant={currentResult.passed ? 'success' : 'warning'} size="md">
              {currentResult.passed ? 'Benchmark Achieved' : 'Below 70% Threshold'}
            </Badge>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Strong Areas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentResult.strongAreas.map((area, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
              <span className="font-bold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Areas to Strengthen:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentResult.weakAreas.map((area, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 border border-rose-500/30"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Next Action Callout */}
          <div className="p-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-xs sm:text-sm text-indigo-200 space-y-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Recommended Next Action:
            </span>
            <p className="text-slate-300 leading-relaxed">{currentResult.recommendedNextAction}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="outline"
              size="md"
              onClick={handleStartTest}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Retake Assessment
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowReview(!showReview)}
              >
                {showReview ? 'Hide Explanations' : 'Review Explanations'}
              </Button>

              <Button
                variant="gradient"
                size="md"
                onClick={() => setCurrentPage('learning-path')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Back to Roadmap
              </Button>
            </div>
          </div>

          {/* Question Explanations List if requested */}
          {showReview && (
            <div className="space-y-6 pt-6 border-t border-slate-800">
              <h4 className="text-sm font-bold text-white">Full Answer Explanations</h4>
              {activeModule.questions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <AssessmentQuestion
                    question={q}
                    questionIndex={idx}
                    totalQuestions={activeModule.questions.length}
                    selectedOptionId={userAnswers[q.id]}
                    onSelectOption={() => {}}
                    showExplanation={true}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : (
        /* QUIZ SELECTION / INTRO CARD */
        <div className="max-w-3xl mx-auto space-y-6">
          <Card variant="glow" className="p-6 sm:p-8 space-y-6 border-indigo-500/30">
            <div>
              <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-wider text-indigo-400">
                <FileCheck2 className="w-4 h-4" />
                <span>Phase 2 Evaluation</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {activeModule.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                {activeModule.description}
              </p>
            </div>

            {/* Test Parameters Grid */}
            <div className="grid grid-cols-3 gap-3 text-xs text-center">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Questions</span>
                <span className="font-bold text-white text-sm">{activeModule.questions.length} Scenario Items</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Passing Score</span>
                <span className="font-bold text-emerald-400 text-sm">{activeModule.passingScore}% Correct</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Est. Duration</span>
                <span className="font-bold text-white text-sm">~{activeModule.durationMinutes} Minutes</span>
              </div>
            </div>

            {/* Key Skill Targets Covered */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">
                Skills Evaluated in this Quiz:
              </span>
              <div className="flex flex-wrap gap-2">
                {activeModule.skillFocus.map((s, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="gradient"
                size="lg"
                onClick={handleStartTest}
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="w-full"
              >
                Start Diagnostic Assessment
              </Button>
            </div>
          </Card>

          {/* Previous Results Summary */}
          {assessmentResults.length > 0 && (
            <Card variant="default" className="p-5 space-y-3">
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Prior Assessment History
              </h4>
              {assessmentResults.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-bold text-white">{item.title}</h5>
                    <p className="text-slate-400 text-[11px]">{item.date} &bull; Mastery: {item.masteryLevel}</p>
                  </div>
                  <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    {item.score}% Passed
                  </span>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
