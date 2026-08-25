export type PageType =
  | 'landing'
  | 'onboarding'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'learning-path'
  | 'recommendations'
  | 'progress'
  | 'assessments'
  | 'ai-assistant'
  | 'profile';

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type LearningStyle = 'Visual & Interactive' | 'Hands-on Projects' | 'Video Lectures' | 'Reading & Theory';
export type PreferredDifficulty = 'Beginner' | 'Intermediate' | 'Challenging' | 'Adaptive';

export type SkillCategory = 'Foundation' | 'Math & Stats' | 'Machine Learning' | 'Deep Learning' | 'MLOps & Systems';
export type SkillStatus = 'Mastered' | 'Developing' | 'Gap' | 'Missing';
export type SkillPriority = 'High' | 'Medium' | 'Low';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: number; // 0-100
  targetProficiency: number; // 0-100
  priority: SkillPriority;
}

export interface SkillGapItem {
  skillId: string;
  name: string;
  category: SkillCategory;
  currentProficiency: number;
  requiredProficiency: number;
  gap: number; // Math.max(0, requiredProficiency - currentProficiency)
  status: SkillStatus;
  priority: SkillPriority;
  priorityScore: number;
  careerImportance: number; // 0-1
  prerequisites?: string[];
  isPrerequisiteFor?: string[];
  reason: string;
}

export interface SkillGapAnalysisResult {
  allGaps: SkillGapItem[];
  top3SkillsToImprove: SkillGapItem[];
  masteredSkills: SkillGapItem[];
  developingSkills: SkillGapItem[];
  gapSkills: SkillGapItem[];
  missingSkills: SkillGapItem[];
  overallReadinessScore: number; // 0-100
}

export interface LearnerProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  education: string;
  careerGoal: string;
  targetRole: string;
  experienceLevel: ExperienceLevel;
  interests: string[];
  skills: Skill[];
  completedCourses: string[];
  weeklyHours: number; // e.g. 6
  preferredLearningStyle: LearningStyle;
  preferredDifficulty: PreferredDifficulty;
  streakDays: number;
  lastActive: string;
  joinedDate: string;
}

export interface Course {
  id: string;
  sequence?: number;
  title: string;
  provider: string;
  duration: string; // e.g. "8 hrs"
  skillsCovered: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'not_started' | 'in_progress' | 'completed' | 'locked';
  progress: number; // 0-100
  description: string;
  rating: number;
  prerequisites?: string[];
  isLocked?: boolean;
  lockReason?: string;
  resourceReference?: string;
}

export interface PracticeItem {
  id: string;
  sequence: number;
  title: string;
  type: 'Practice';
  resourceReference?: string;
  skills: string[];
  prerequisites: string[];
  estimatedHours: string;
  durationHours: number;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  progress: number;
  isLocked?: boolean;
  lockReason?: string;
  description: string;
  exerciseType: 'Interactive Notebook' | 'Coding Lab' | 'Concept Check' | 'Debug Challenge';
}

export interface Project {
  id: string;
  sequence?: number;
  title: string;
  duration: string; // e.g. "12 hrs"
  skillsCovered: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'not_started' | 'in_progress' | 'completed' | 'locked';
  progress: number;
  description: string;
  deliverables: string[];
  prerequisites?: string[];
  isLocked?: boolean;
  lockReason?: string;
  resourceReference?: string;
}

export interface RoadmapPhase {
  id: string;
  phaseNumber: number;
  title: string;
  tagline: string;
  status: 'completed' | 'in_progress' | 'unlocked' | 'locked';
  progress: number; // 0-100
  estimatedDuration: string; // e.g. "4 Weeks"
  prerequisites: string[];
  skills: string[];
  courses: Course[];
  practiceItems?: PracticeItem[];
  projects: Project[];
  assessmentRequired: string;
  assessmentId?: string;
  isAssessmentPassed: boolean;
  isAssessmentLocked?: boolean;
  assessmentLockReason?: string;
  milestoneTitle?: string;
  milestoneDescription?: string;
  isMilestoneCompleted?: boolean;
  isMilestoneLocked?: boolean;
  milestoneLockReason?: string;
  unlockedBadges?: string[];
  whyThisPhase: string;
  lockReason?: string;
}

export interface LearningPathItem {
  id: string;
  phaseId: string;
  phaseNumber: number;
  sequence: number;
  title: string;
  resourceType: 'Course' | 'Practice' | 'Project' | 'Assessment' | 'Milestone';
  resourceReference?: string;
  skills: string[];
  prerequisites: string[];
  estimatedHours: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  progress: number;
  isCompleted: boolean;
  isLocked: boolean;
  lockReason?: string;
  description?: string;
}

export interface NextBestAction {
  id: string;
  title: string;
  type: 'Course' | 'Project' | 'Practice' | 'Assessment';
  phaseId: string;
  phaseNumber: number;
  phaseTitle: string;
  skill: string;
  skillsCovered: string[];
  estimatedDuration: string;
  durationHours: number;
  whyThisIsNext: string;
  matchPercentage: number;
  status: 'not_started' | 'in_progress' | 'unlocked';
  progress: number;
  resourceReference?: string;
}

export type RecommendationType = 'Course' | 'Project' | 'Assessment' | 'Practice';

export interface PrerequisiteRequirement {
  skillName?: string;
  minProficiency?: number;
  courseTitle?: string;
  description: string;
}

export interface CandidateResource {
  id: string;
  title: string;
  type: RecommendationType;
  provider?: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: string;
  durationHours: number;
  skillsCovered: string[];
  prerequisites: string[];
  prerequisiteRequirements?: PrerequisiteRequirement[];
  phaseId: string;
  targetRoles?: string[];
  learningStyles?: LearningStyle[];
  deliverables?: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  type: RecommendationType;
  provider?: string;
  description: string;
  matchPercentage: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: string;
  skillsCovered: string[];
  prerequisites: string[];
  whyRecommended: string;
  phaseId: string;
  status: 'recommended' | 'in_progress' | 'completed';
  isSaved?: boolean;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
  explanation: string;
  skillTested: string;
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  title: string;
  score: number; // 0-100
  passed: boolean;
  date: string;
  totalQuestions: number;
  correctCount: number;
  masteryLevel: 'Novice' | 'Developing' | 'Proficient' | 'Master';
  strongAreas: string[];
  weakAreas: string[];
  recommendedNextAction: string;
}

export interface AssessmentModule {
  id: string;
  title: string;
  phaseId: string;
  phaseName: string;
  description: string;
  durationMinutes: number;
  questions: AssessmentQuestion[];
  passingScore: number;
  skillFocus: string[];
}

export interface ActivityLog {
  id: string;
  type: 'course_progress' | 'project_completed' | 'assessment_passed' | 'streak_milestone' | 'skill_level_up';
  title: string;
  description: string;
  timestamp: string;
  iconType: string;
  phase?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedFollowUps?: string[];
  relatedAction?: {
    label: string;
    page: PageType;
  };
}
