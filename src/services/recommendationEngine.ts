import {
  LearnerProfile,
  Recommendation,
  RoadmapPhase,
  CandidateResource,
  SkillGapAnalysisResult,
  SkillGapItem,
} from '../types';
import { candidateResourceCatalog } from '../data/candidateResources';
import { analyzeSkillGaps } from './skillGapEngine';

interface ScoringBreakdown {
  skillGapScore: number; // 0-100 (weight: 0.30)
  careerRelevanceScore: number; // 0-100 (weight: 0.25)
  difficultyScore: number; // 0-100 (weight: 0.15)
  prerequisiteScore: number; // 0-100 (weight: 0.10)
  timeCompatibilityScore: number; // 0-100 (weight: 0.10)
  learningPreferenceScore: number; // 0-100 (weight: 0.10)
  totalWeightedScore: number; // 0-100
  primarySkillGap?: SkillGapItem;
  reason: string;
}

/**
 * Checks if a candidate resource is completed by the learner
 */
function isResourceCompleted(
  resource: CandidateResource,
  profile: LearnerProfile,
  roadmapPhases: RoadmapPhase[],
  completedRecIds: Set<string>
): boolean {
  if (completedRecIds.has(resource.id)) return true;

  // Check profile.completedCourses
  const resTitleNorm = resource.title.toLowerCase().trim();
  if (
    profile.completedCourses &&
    profile.completedCourses.some((c) => c.toLowerCase().trim() === resTitleNorm)
  ) {
    return true;
  }

  // Check roadmap courses and projects
  for (const phase of roadmapPhases) {
    const courseMatch = phase.courses.find(
      (c) => c.title.toLowerCase().trim() === resTitleNorm && c.status === 'completed'
    );
    if (courseMatch) return true;

    const projectMatch = phase.projects.find(
      (p) => p.title.toLowerCase().trim() === resTitleNorm && p.status === 'completed'
    );
    if (projectMatch) return true;
  }

  return false;
}

/**
 * Checks prerequisite readiness and returns score (0-100) and whether critical prerequisites are missing.
 */
function evaluatePrerequisites(
  resource: CandidateResource,
  profile: LearnerProfile,
  skillGaps: SkillGapAnalysisResult
): { score: number; passedCritical: boolean; missingPrereqs: string[] } {
  if (!resource.prerequisiteRequirements || resource.prerequisiteRequirements.length === 0) {
    return { score: 100, passedCritical: true, missingPrereqs: [] };
  }

  const missingPrereqs: string[] = [];
  let totalPrereqScore = 0;

  for (const req of resource.prerequisiteRequirements) {
    if (req.skillName) {
      const skillNameNorm = req.skillName.toLowerCase().trim();
      const learnerSkill = profile.skills.find(
        (s) => s.name.toLowerCase().trim() === skillNameNorm
      );
      const currentProf = learnerSkill ? learnerSkill.proficiency : 0;
      const minRequired = req.minProficiency || 40;

      if (currentProf >= minRequired) {
        totalPrereqScore += 100;
      } else {
        const ratio = currentProf / minRequired;
        totalPrereqScore += Math.round(ratio * 100);
        // If current proficiency is less than 50% of the minimum required, it's a critical missing prerequisite
        if (currentProf < minRequired * 0.4) {
          missingPrereqs.push(`${req.skillName} (Current: ${currentProf}%, Required: ${minRequired}%)`);
        }
      }
    } else {
      totalPrereqScore += 100;
    }
  }

  const avgScore = Math.round(totalPrereqScore / resource.prerequisiteRequirements.length);
  const passedCritical = missingPrereqs.length === 0;

  return {
    score: Math.min(100, Math.max(0, avgScore)),
    passedCritical,
    missingPrereqs,
  };
}

/**
 * Evaluates difficulty compatibility between learner level/preferences and candidate resource
 */
function evaluateDifficultyMatch(
  resourceDifficulty: 'Beginner' | 'Intermediate' | 'Advanced',
  learnerExperience: 'Beginner' | 'Intermediate' | 'Advanced',
  preferredDifficulty: 'Beginner' | 'Intermediate' | 'Challenging' | 'Adaptive',
  overallReadiness: number
): { score: number; isFarAboveLevel: boolean } {
  const diffLevels: Record<string, number> = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
  };

  const resourceVal = diffLevels[resourceDifficulty] || 2;
  const learnerVal = diffLevels[learnerExperience] || 2;

  // Far above check: e.g. Beginner attempting Advanced resource when readiness is low (< 35)
  if (resourceVal - learnerVal >= 2 && overallReadiness < 35) {
    return { score: 20, isFarAboveLevel: true };
  }

  if (resourceDifficulty === learnerExperience) {
    return { score: 100, isFarAboveLevel: false };
  }

  if (preferredDifficulty === 'Adaptive') {
    // If learner is ready to advance (1 step higher)
    if (resourceVal === learnerVal + 1) return { score: 95, isFarAboveLevel: false };
    if (resourceVal === learnerVal - 1) return { score: 80, isFarAboveLevel: false };
  }

  if (preferredDifficulty === 'Challenging' && resourceVal > learnerVal) {
    return { score: 100, isFarAboveLevel: false };
  }

  if (preferredDifficulty === 'Beginner' && resourceDifficulty === 'Beginner') {
    return { score: 100, isFarAboveLevel: false };
  }

  const diffDistance = Math.abs(resourceVal - learnerVal);
  const score = diffDistance === 1 ? 75 : 40;

  return { score, isFarAboveLevel: false };
}

/**
 * Evaluates time budget compatibility against weekly study hours
 */
function evaluateTimeCompatibility(durationHours: number, weeklyHours: number): number {
  if (!weeklyHours || weeklyHours <= 0) weeklyHours = 6;

  // Ideal resource duration is between 0.5x and 1.8x weekly budget
  const ratio = durationHours / weeklyHours;
  if (ratio >= 0.5 && ratio <= 1.8) {
    return 100;
  }
  if (ratio < 0.5) {
    // Short assessment / quick lab is easily compatible
    return 95;
  }
  if (ratio <= 2.5) {
    return 80;
  }
  if (ratio <= 3.5) {
    return 65;
  }
  return 50;
}

/**
 * Evaluates learning style preference
 */
function evaluateLearningPreference(
  resource: CandidateResource,
  preferredStyle: string
): number {
  if (!preferredStyle) return 80;

  if (resource.learningStyles && resource.learningStyles.includes(preferredStyle as any)) {
    return 100;
  }

  if (preferredStyle === 'Hands-on Projects' && resource.type === 'Project') {
    return 100;
  }
  if (preferredStyle === 'Video Lectures' && resource.type === 'Course') {
    return 90;
  }
  if (preferredStyle === 'Visual & Interactive' && (resource.type === 'Practice' || resource.type === 'Assessment')) {
    return 95;
  }

  return 70;
}

/**
 * Evaluates career goal relevance
 */
function evaluateCareerRelevance(
  resource: CandidateResource,
  profile: LearnerProfile,
  roadmapPhases: RoadmapPhase[]
): number {
  const goalNorm = (profile.careerGoal || '').toLowerCase().trim();
  const targetRoles = resource.targetRoles || [];

  let matchCareer = targetRoles.some((r) => r.toLowerCase().includes(goalNorm) || goalNorm.includes(r.toLowerCase()));

  // Active roadmap phase check
  const activePhase = roadmapPhases.find((p) => p.status === 'in_progress') || roadmapPhases[0];
  const isCurrentPhase = activePhase && activePhase.id === resource.phaseId;

  if (matchCareer && isCurrentPhase) {
    return 100;
  }
  if (isCurrentPhase) {
    return 95;
  }
  if (matchCareer) {
    return 85;
  }
  return 70;
}

/**
 * Evaluates skill gap match for candidate resource
 */
function evaluateSkillGapMatch(
  resource: CandidateResource,
  skillGaps: SkillGapAnalysisResult
): { score: number; primarySkillGap?: SkillGapItem } {
  let highestGapItem: SkillGapItem | undefined;
  let totalSkillGapPoints = 0;
  let matchesCount = 0;

  const gapsMap = new Map<string, SkillGapItem>();
  skillGaps.allGaps.forEach((g) => gapsMap.set(g.name.toLowerCase().trim(), g));

  for (const skillName of resource.skillsCovered) {
    const gapItem = gapsMap.get(skillName.toLowerCase().trim());
    if (gapItem) {
      matchesCount++;

      // Points based on status & gap
      let skillPoints = 0;
      if (gapItem.status === 'Gap') {
        skillPoints = 100;
      } else if (gapItem.status === 'Missing') {
        skillPoints = 90;
      } else if (gapItem.status === 'Developing') {
        skillPoints = 75;
      } else {
        // Mastered
        skillPoints = 30;
      }

      // Weight by gap magnitude
      const gapWeight = gapItem.gap > 0 ? Math.min(1.0, gapItem.gap / 50) : 0.2;
      const combined = Math.round(skillPoints * 0.7 + gapWeight * 100 * 0.3);
      totalSkillGapPoints += combined;

      if (!highestGapItem || gapItem.priorityScore > highestGapItem.priorityScore) {
        highestGapItem = gapItem;
      }
    }
  }

  if (matchesCount === 0) {
    return { score: 40, primarySkillGap: skillGaps.top3SkillsToImprove[0] };
  }

  const avgGapScore = Math.min(100, Math.round(totalSkillGapPoints / matchesCount));
  return { score: avgGapScore, primarySkillGap: highestGapItem };
}

/**
 * Builds an authentic, data-backed reason string explaining why this resource is recommended.
 * Do not invent reasons. Uses actual learner profile, gaps, career goal, and prerequisites.
 */
function buildDeterministicReason(
  resource: CandidateResource,
  profile: LearnerProfile,
  primaryGap: SkillGapItem | undefined,
  scoreBreakdown: ScoringBreakdown
): string {
  const goal = profile.careerGoal || 'AI Engineer';

  if (primaryGap) {
    const isHighPriority = primaryGap.priority === 'High';
    const currentProf = primaryGap.currentProficiency;
    const requiredProf = primaryGap.requiredProficiency;

    if (primaryGap.isPrerequisiteFor && primaryGap.isPrerequisiteFor.length > 0) {
      const downstream = primaryGap.isPrerequisiteFor[0];
      return `Recommended because ${primaryGap.name} is a ${isHighPriority ? 'high-priority' : 'core'} skill gap (${currentProf}% current vs ${requiredProf}% target) for your ${goal} goal and is required before ${downstream}.`;
    }

    if (resource.type === 'Project' && profile.preferredLearningStyle === 'Hands-on Projects') {
      return `Recommended because it bridges your ${primaryGap.name} gap (${currentProf}% vs ${requiredProf}%) through practical project implementation aligned with your Hands-on Projects preference.`;
    }

    if (resource.type === 'Assessment') {
      return `Recommended to benchmark your retention in ${primaryGap.name} (current ${currentProf}%) and pinpoint specific focus areas for your ${goal} target.`;
    }

    return `Recommended because your current ${primaryGap.name} proficiency is ${currentProf}%, leaving a ${primaryGap.gap}% gap toward your ${goal} benchmark of ${requiredProf}%.`;
  }

  return `Recommended to advance core competencies aligned with your ${goal} path and weekly study commitment of ${profile.weeklyHours}h/week.`;
}

/**
 * Main Deterministic Recommendation Engine Pipeline:
 * Learner Profile
 * → Career Goal
 * → Skill Gap
 * → Prerequisite Filtering
 * → Candidate Resources
 * → Weighted Ranking (30% Gap, 25% Career, 15% Difficulty, 10% Prereqs, 10% Time, 10% Pref)
 * → Recommendations
 */
export function generateRecommendations(
  profile: LearnerProfile,
  roadmapPhases: RoadmapPhase[],
  existingSavedIds: string[] = [],
  inProgressIds: string[] = []
): Recommendation[] {
  // 1. Calculate Skill Gaps
  const skillGapAnalysis = analyzeSkillGaps(profile);

  // 2. Build set of completed resource IDs
  const completedRecIds = new Set<string>();

  // 3. Filter & Score Candidate Resources
  const scoredCandidates: {
    resource: CandidateResource;
    breakdown: ScoringBreakdown;
  }[] = [];

  for (const candidate of candidateResourceCatalog) {
    // Exclusion 1: Do not recommend completed resources
    if (isResourceCompleted(candidate, profile, roadmapPhases, completedRecIds)) {
      continue;
    }

    // Exclusion 2: Do not recommend resources with missing critical prerequisites
    const prereqResult = evaluatePrerequisites(candidate, profile, skillGapAnalysis);
    if (!prereqResult.passedCritical) {
      continue;
    }

    // Exclusion 3: Do not recommend resources far above learner level
    const diffResult = evaluateDifficultyMatch(
      candidate.difficulty,
      profile.experienceLevel,
      profile.preferredDifficulty,
      skillGapAnalysis.overallReadinessScore
    );
    if (diffResult.isFarAboveLevel) {
      continue;
    }

    // SCORING:
    // 30% Skill Gap Match
    // 25% Career Goal Relevance
    // 15% Difficulty Match
    // 10% Prerequisite Readiness
    // 10% Time Compatibility
    // 10% Learning Preference
    const skillGapResult = evaluateSkillGapMatch(candidate, skillGapAnalysis);
    const careerRelevanceScore = evaluateCareerRelevance(candidate, profile, roadmapPhases);
    const difficultyScore = diffResult.score;
    const prerequisiteScore = prereqResult.score;
    const timeCompatibilityScore = evaluateTimeCompatibility(
      candidate.durationHours,
      profile.weeklyHours
    );
    const learningPreferenceScore = evaluateLearningPreference(
      candidate,
      profile.preferredLearningStyle
    );

    // Weighted composite score (0-100)
    const totalWeightedScore = Math.min(
      99,
      Math.max(
        50,
        Math.round(
          0.30 * skillGapResult.score +
            0.25 * careerRelevanceScore +
            0.15 * difficultyScore +
            0.10 * prerequisiteScore +
            0.10 * timeCompatibilityScore +
            0.10 * learningPreferenceScore
        )
      )
    );

    const breakdown: ScoringBreakdown = {
      skillGapScore: skillGapResult.score,
      careerRelevanceScore,
      difficultyScore,
      prerequisiteScore,
      timeCompatibilityScore,
      learningPreferenceScore,
      totalWeightedScore,
      primarySkillGap: skillGapResult.primarySkillGap,
      reason: '',
    };

    breakdown.reason = buildDeterministicReason(
      candidate,
      profile,
      skillGapResult.primarySkillGap,
      breakdown
    );

    scoredCandidates.push({
      resource: candidate,
      breakdown,
    });
  }

  // 4. Weighted Ranking
  scoredCandidates.sort(
    (a, b) => b.breakdown.totalWeightedScore - a.breakdown.totalWeightedScore
  );

  // 5. Transform to Recommendation objects (Top 1 + 5-6 additional = 6-7 items)
  const savedSet = new Set(existingSavedIds);
  const inProgressSet = new Set(inProgressIds);

  const recommendations: Recommendation[] = scoredCandidates.map(({ resource, breakdown }) => {
    const isSaved = savedSet.has(resource.id);
    const isInProgress = inProgressSet.has(resource.id);

    return {
      id: resource.id,
      title: resource.title,
      type: resource.type,
      provider: resource.provider,
      description: resource.description,
      matchPercentage: breakdown.totalWeightedScore,
      difficulty: resource.difficulty,
      estimatedDuration: resource.estimatedDuration,
      skillsCovered: resource.skillsCovered,
      prerequisites: resource.prerequisites,
      whyRecommended: breakdown.reason,
      phaseId: resource.phaseId,
      status: isInProgress ? 'in_progress' : 'recommended',
      isSaved,
    };
  });

  return recommendations;
}
