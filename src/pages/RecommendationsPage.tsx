import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RecommendationCard } from '../components/cards/RecommendationCard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import {
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  BookOpen,
  FolderGit2,
  Bookmark,
  CheckCircle2,
  Play,
  Clock,
  Layers,
  ShieldCheck,
  Award,
  ArrowRight,
} from 'lucide-react';
import { Recommendation } from '../types';

export const RecommendationsPage: React.FC = () => {
  const {
    recommendations,
    toggleSaveRecommendation,
    startRecommendation,
    completeRecommendation,
    setCurrentPage,
  } = useApp();

  const [filterType, setFilterType] = useState<'All' | 'Course' | 'Project' | 'Saved'>('All');
  const [sortBy, setSortBy] = useState<'Best Match' | 'Shortest' | 'Beginner Friendly'>('Best Match');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStudyItem, setActiveStudyItem] = useState<Recommendation | null>(null);

  // Filter items
  const filtered = (recommendations || []).filter((item) => {
    if (filterType === 'Course' && item.type !== 'Course') return false;
    if (filterType === 'Project' && item.type !== 'Project') return false;
    if (filterType === 'Saved' && !item.isSaved) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      const matchSkills = (item.skillsCovered || []).some((s) => s.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchSkills) return false;
    }

    return true;
  });

  // Sort items
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'Best Match') {
      return b.matchPercentage - a.matchPercentage;
    }
    if (sortBy === 'Shortest') {
      const getHours = (str: string) => {
        const match = str.match(/\d+/);
        return match ? parseInt(match[0], 10) : 99;
      };
      return getHours(a.estimatedDuration) - getHours(b.estimatedDuration);
    }
    if (sortBy === 'Beginner Friendly') {
      const diffScore = (d: string) => (d === 'Beginner' ? 1 : d === 'Intermediate' ? 2 : 3);
      return diffScore(a.difficulty) - diffScore(b.difficulty);
    }
    return 0;
  });

  const topPick = sorted[0];
  const remainingRecs = sorted.slice(1);

  const handleStartStudy = (id: string) => {
    startRecommendation(id);
    const item = recommendations.find((r) => r.id === id);
    if (item) {
      setActiveStudyItem(item);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#0a1024] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="primary" size="sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Explainable AI Recommendations
            </Badge>
            <span className="text-xs text-slate-400">
              Ranked via 6-Factor Deterministic Algorithm
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            What to Learn Next &bull; Tailored Recommendations
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Every candidate resource is ranked based on your actual skill gaps (30%), career goal relevance (25%), difficulty match (15%), prerequisite readiness (10%), study time compatibility (10%), and learning style preference (10%).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage('learning-path')}
          >
            View Full Roadmap
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentPage('ai-assistant')}
          >
            Ask AI Advisor
          </Button>
        </div>
      </div>

      {/* Featured Top Recommendation (When on All / Best Match with no search) */}
      {filterType === 'All' && sortBy === 'Best Match' && !searchQuery.trim() && topPick && (
        <Card variant="glow" className="p-6 sm:p-7 border-indigo-500/40 bg-gradient-to-br from-[#0c142e] via-[#0d1736] to-[#070c1a]">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3.5 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Award className="w-3.5 h-3.5 text-indigo-400" />
                  #1 Top Recommendation
                </span>
                <Badge variant="primary" size="sm" className="font-extrabold">
                  {topPick.matchPercentage}% Algorithm Match Score
                </Badge>
                <span className="text-xs text-slate-400 px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800">
                  {topPick.type} &bull; {topPick.estimatedDuration} &bull; {topPick.difficulty}
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {topPick.title}
                </h3>
                {topPick.provider && (
                  <span className="text-xs text-indigo-400 font-semibold">{topPick.provider}</span>
                )}
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {topPick.description}
                </p>
              </div>

              {/* Deterministic Rationale */}
              <div className="p-3.5 rounded-2xl bg-[#060914] border border-indigo-500/25 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Why PathFind AI recommended this for you:</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{topPick.whyRecommended}</p>
              </div>

              {/* Prerequisites & Skills */}
              <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                {topPick.prerequisites && topPick.prerequisites.length > 0 && (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Prerequisites: <strong className="text-slate-200">{topPick.prerequisites.join(', ')}</strong></span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-400">Target Skills:</span>
                  {(topPick.skillsCovered || []).map((sc) => (
                    <span key={sc} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700/60 font-medium">
                      {sc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-56 shrink-0">
              <Button
                variant="gradient"
                size="lg"
                onClick={() => handleStartStudy(topPick.id)}
                rightIcon={<Play className="w-4 h-4" />}
                className="w-full"
              >
                {topPick.status === 'in_progress' ? 'Continue Study' : 'Start Top Pick'}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSaveRecommendation(topPick.id)}
                  leftIcon={<Bookmark className={`w-3.5 h-3.5 ${topPick.isSaved ? 'fill-indigo-400 text-indigo-400' : ''}`} />}
                  className="flex-1"
                >
                  {topPick.isSaved ? 'Saved' : 'Save'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => completeRecommendation(topPick.id)}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  className="flex-1"
                >
                  Complete
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Filter and Search Bar */}
      <Card variant="default" className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(['All', 'Course', 'Project', 'Saved'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === type
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {type === 'Course' ? 'Courses' : type === 'Project' ? 'Projects' : type}
              {type === 'Saved' && ` (${(recommendations || []).filter((r) => r.isSaved).length})`}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search skills, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="Best Match">Best Match</option>
              <option value="Shortest">Shortest</option>
              <option value="Beginner Friendly">Beginner Friendly</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Grid of Candidate Recommendations */}
      {sorted.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing {sorted.length} recommended learning resource{sorted.length !== 1 ? 's' : ''}
            </span>
            <span>Sorted by {sortBy}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((item, idx) => (
              <RecommendationCard
                key={item.id}
                item={item}
                isTopRecommendation={idx === 0 && filterType === 'All' && sortBy === 'Best Match'}
                onStart={handleStartStudy}
                onToggleSave={toggleSaveRecommendation}
                onComplete={completeRecommendation}
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No recommendations match your filter"
          description="Try adjusting your search query or switching between Courses and Projects tabs."
          actionLabel="Reset Filters"
          onAction={() => {
            setFilterType('All');
            setSearchQuery('');
          }}
        />
      )}

      {/* Interactive Active Learning Workspace Modal */}
      {activeStudyItem && (
        <Modal
          isOpen={!!activeStudyItem}
          onClose={() => setActiveStudyItem(null)}
          title={`Active Workspace: ${activeStudyItem.title}`}
          subtitle={`${activeStudyItem.type} • ${activeStudyItem.estimatedDuration} • ${activeStudyItem.difficulty} Level`}
          maxWidth="xl"
        >
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs sm:text-sm text-indigo-200">
              <span className="font-bold text-white block mb-1">🎯 Learning Target:</span>
              <p>{activeStudyItem.description}</p>
            </div>

            {/* Why Recommended Callout in Modal */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
              <span className="font-semibold text-indigo-300">Why PathFind AI recommended this:</span>
              <p className="text-slate-300 leading-relaxed">{activeStudyItem.whyRecommended}</p>
            </div>

            {/* Simulated Interactive Lesson / Code Editor */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-mono text-indigo-400">interactive_workspace.py</span>
                <span>Python 3.12 Runtime Ready</span>
              </div>
              <pre className="text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`# Practical Applied Exercise: Applied Concept
import numpy as np
import pandas as pd

# Diagnostic applied simulation
print(f"Workspace loaded for: {activeStudyItem.title}")
print(f"Skills covered: {', '.join(activeStudyItem.skillsCovered)}")`}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveStudyItem(null)}
              >
                Close Window
              </Button>

              <Button
                variant="gradient"
                size="md"
                onClick={() => {
                  completeRecommendation(activeStudyItem.id);
                  setActiveStudyItem(null);
                }}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Mark Module Completed
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
