import { LearnerProfile, Skill, SkillCategory, SkillGapAnalysisResult, SkillGapItem, SkillPriority, SkillStatus } from '../types';
import { getBenchmarkForRole } from '../data/careerBenchmarks';

/**
 * Calculates deterministic Skill Gap Analysis for a learner against their target career goal.
 * Compare: Learner current skills VS Target career required skills.
 */
export function analyzeSkillGaps(profile: LearnerProfile): SkillGapAnalysisResult {
  const benchmark = getBenchmarkForRole(profile.careerGoal || profile.targetRole);
  const learnerSkillsMap = new Map<string, Skill>();

  // Normalize learner skills lookup by lowercase name
  (profile.skills || []).forEach((skill) => {
    learnerSkillsMap.set(skill.name.toLowerCase().trim(), skill);
  });

  const allGaps: SkillGapItem[] = [];

  // Track which benchmark skills exist in the profile
  const processedSkillNames = new Set<string>();

  benchmark.requiredSkills.forEach((reqSkill) => {
    const key = reqSkill.name.toLowerCase().trim();
    processedSkillNames.add(key);

    const learnerSkill = learnerSkillsMap.get(key);
    const currentProf = learnerSkill !== undefined ? learnerSkill.proficiency : 0;
    const requiredProf = reqSkill.requiredProficiency;
    const gap = Math.max(0, requiredProf - currentProf);

    // Calculate Status strictly as specified:
    // Mastered: current >= required
    // Developing: current < required AND current >= 50
    // Gap: current < 50 (and current > 0)
    // Missing: skill is absent or current === 0
    let status: SkillStatus;
    if (learnerSkill === undefined || currentProf === 0) {
      status = 'Missing';
    } else if (currentProf >= requiredProf) {
      status = 'Mastered';
    } else if (currentProf >= 50) {
      status = 'Developing';
    } else {
      status = 'Gap';
    }

    // Priority considerations:
    // 1. Career importance (0.0 to 1.0)
    // 2. Proficiency gap size (0.0 to 1.0 relative to requiredProf)
    // 3. Prerequisite importance (boost priority if downstream skills depend on this)
    const gapRatio = requiredProf > 0 ? gap / requiredProf : 0;
    const isPrereq = reqSkill.isPrerequisiteFor && reqSkill.isPrerequisiteFor.length > 0;
    const prereqMultiplier = isPrereq ? 1.25 : 1.0;

    // Composite priority score from 0 to 100
    const priorityScore = Math.min(
      100,
      Math.round(
        (reqSkill.careerImportance * 40 + gapRatio * 45 + (isPrereq ? 15 : 0)) * prereqMultiplier
      )
    );

    let priority: SkillPriority;
    if (status === 'Mastered') {
      priority = 'Low';
    } else if (priorityScore >= 65 || gap >= 35) {
      priority = 'High';
    } else if (priorityScore >= 40 || gap >= 15) {
      priority = 'Medium';
    } else {
      priority = 'Low';
    }

    // Generate actionable data-driven reason
    let reason = '';
    if (status === 'Mastered') {
      reason = `You have met or exceeded the industry benchmark (${currentProf}% vs ${requiredProf}% target).`;
    } else if (isPrereq && reqSkill.isPrerequisiteFor && reqSkill.isPrerequisiteFor.length > 0) {
      const downstream = reqSkill.isPrerequisiteFor[0];
      reason = `${reqSkill.name} is a high-priority skill gap (${currentProf}% current vs ${requiredProf}% required) for ${profile.careerGoal} and is required before ${downstream}.`;
    } else {
      reason = `Targeting ${requiredProf}% proficiency for ${profile.careerGoal}. Current proficiency is ${currentProf}%, leaving a ${gap}% gap.`;
    }

    allGaps.push({
      skillId: learnerSkill ? learnerSkill.id : `req-${key}`,
      name: reqSkill.name,
      category: reqSkill.category,
      currentProficiency: currentProf,
      requiredProficiency: requiredProf,
      gap,
      status,
      priority,
      priorityScore,
      careerImportance: reqSkill.careerImportance,
      prerequisites: reqSkill.prerequisites,
      isPrerequisiteFor: reqSkill.isPrerequisiteFor,
      reason,
    });
  });

  // Also include any extra custom skills the learner has in their profile that might not be in benchmark
  (profile.skills || []).forEach((learnerSkill) => {
    const key = learnerSkill.name.toLowerCase().trim();
    if (!processedSkillNames.has(key)) {
      const currentProf = learnerSkill.proficiency;
      const requiredProf = learnerSkill.targetProficiency || 80;
      const gap = Math.max(0, requiredProf - currentProf);

      let status: SkillStatus;
      if (currentProf === 0) {
        status = 'Missing';
      } else if (currentProf >= requiredProf) {
        status = 'Mastered';
      } else if (currentProf >= 50) {
        status = 'Developing';
      } else {
        status = 'Gap';
      }

      const priority = learnerSkill.priority || (gap >= 35 ? 'High' : gap >= 15 ? 'Medium' : 'Low');

      allGaps.push({
        skillId: learnerSkill.id,
        name: learnerSkill.name,
        category: learnerSkill.category || 'Foundation',
        currentProficiency: currentProf,
        requiredProficiency: requiredProf,
        gap,
        status,
        priority,
        priorityScore: gap,
        careerImportance: 0.7,
        reason: `Tracked elective skill: ${currentProf}% proficiency with a ${gap}% gap to target ${requiredProf}%.`,
      });
    }
  });

  // Partition by status
  const masteredSkills = allGaps.filter((g) => g.status === 'Mastered');
  const developingSkills = allGaps.filter((g) => g.status === 'Developing');
  const gapSkills = allGaps.filter((g) => g.status === 'Gap');
  const missingSkills = allGaps.filter((g) => g.status === 'Missing');

  // Top 3 Skills To Improve Next:
  // Sort non-mastered skills by priorityScore descending (and gap descending)
  const nonMastered = allGaps.filter((g) => g.status !== 'Mastered');
  const sortedByUrgency = [...nonMastered].sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    return b.gap - a.gap;
  });

  const top3SkillsToImprove = sortedByUrgency.slice(0, 3);

  // Overall readiness score (0-100)
  const totalRequired = allGaps.reduce((acc, g) => acc + g.requiredProficiency, 0);
  const totalCurrent = allGaps.reduce((acc, g) => acc + Math.min(g.currentProficiency, g.requiredProficiency), 0);
  const overallReadinessScore = totalRequired > 0 ? Math.round((totalCurrent / totalRequired) * 100) : 0;

  return {
    allGaps,
    top3SkillsToImprove,
    masteredSkills,
    developingSkills,
    gapSkills,
    missingSkills,
    overallReadinessScore,
    masteredCount: masteredSkills.length,
    developingCount: developingSkills.length,
    gapCount: gapSkills.length + missingSkills.length,
  };
}
