import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  PageType,
  LearnerProfile,
  Skill,
  SkillCategory,
  RoadmapPhase,
  Course,
  Project,
  PracticeItem,
  Recommendation,
  AssessmentModule,
  AssessmentResult,
  ActivityLog,
  ChatMessage,
  NextBestAction,
  SkillGapAnalysisResult,
} from '../types';
import {
  initialLearnerProfile,
  initialRoadmapPhases,
  initialAssessmentModules,
  initialAssessmentResults,
  initialActivities,
  initialChatMessages,
  demoAIResponses,
} from '../data/initialData';
import { authService } from '../services/authService';
import { firestoreService } from '../services/firestoreService';
import { analyzeSkillGaps } from '../services/skillGapEngine';
import { generateRecommendations } from '../services/recommendationEngine';
import {
  evaluateRoadmapPrerequisites,
  generatePersonalizedRoadmap,
  calculateNextBestAction,
} from '../services/learningPathEngine';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface AppContextType {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  firebaseUser: User | null;
  isAuthLoading: boolean;
  isCloudSynced: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  profile: LearnerProfile;
  updateProfile: (updates: Partial<LearnerProfile>) => Promise<void>;
  updateSkillProficiency: (skillId: string, newProficiency: number) => Promise<void>;
  roadmapPhases: RoadmapPhase[];
  activePhaseId: string;
  setActivePhaseId: (id: string) => void;
  markCourseCompleted: (phaseId: string, courseId: string) => Promise<void>;
  updateCourseProgress: (phaseId: string, courseId: string, progress: number) => Promise<void>;
  markProjectCompleted: (phaseId: string, projectId: string) => Promise<void>;
  updateProjectProgress: (phaseId: string, projectId: string, progress: number) => Promise<void>;
  markPracticeCompleted: (phaseId: string, practiceId: string) => Promise<void>;
  markMilestoneCompleted: (phaseId: string) => Promise<void>;
  recommendations: Recommendation[];
  nextBestAction: NextBestAction;
  skillGapAnalysis: SkillGapAnalysisResult;
  toggleSaveRecommendation: (id: string) => Promise<void>;
  startRecommendation: (id: string) => Promise<void>;
  completeRecommendation: (id: string) => Promise<void>;
  assessmentModules: AssessmentModule[];
  assessmentResults: AssessmentResult[];
  submitAssessment: (assessmentId: string, answers: Record<string, string>) => Promise<AssessmentResult>;
  activities: ActivityLog[];
  addActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => Promise<void>;
  chatMessages: ChatMessage[];
  isAiThinking: boolean;
  sendChatMessage: (text: string) => Promise<void>;
  clearChat: () => Promise<void>;
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  generateRoadmapFromOnboarding: (onboardingData: Partial<LearnerProfile>) => Promise<void>;
  overallProgress: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to construct a blank/clean profile for a new user
const createNewUserProfile = (user: User, name?: string): LearnerProfile => {
  const displayName = name || user.displayName || user.email?.split('@')[0] || 'Learner';
  return {
    ...initialLearnerProfile,
    id: user.uid,
    name: displayName,
    email: user.email || '',
    avatarUrl: user.photoURL || undefined,
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    lastActive: new Date().toISOString(),
    streakDays: 1,
    completedCourses: [],
  };
};

// Helper to adapt and boost skills when courses, projects, or practice are completed
function boostSkills(
  currentSkills: Skill[] = [],
  targetSkillNames: string[] = [],
  delta: number = 12,
  category: SkillCategory = 'Machine Learning'
): Skill[] {
  const updated = [...(currentSkills || [])];
  const matchedNames = new Set<string>();

  for (let i = 0; i < updated.length; i++) {
    const s = updated[i];
    const match = targetSkillNames.some(
      (tsn) =>
        tsn.toLowerCase().trim() === s.name.toLowerCase().trim() ||
        s.name.toLowerCase().includes(tsn.toLowerCase().trim()) ||
        tsn.toLowerCase().includes(s.name.toLowerCase().trim())
    );
    if (match) {
      matchedNames.add(s.name.toLowerCase().trim());
      updated[i] = {
        ...s,
        proficiency: Math.min(100, Math.max(0, s.proficiency + delta)),
      };
    }
  }

  // If there are skills not present in profile.skills, add them
  for (const tsn of targetSkillNames) {
    const norm = tsn.toLowerCase().trim();
    if (!matchedNames.has(norm) && !updated.some((s) => s.name.toLowerCase().trim() === norm)) {
      const initialProf = Math.min(100, Math.max(20, delta > 0 ? 55 + delta : 45));
      updated.push({
        id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: tsn,
        category,
        proficiency: initialProf,
        targetProficiency: 85,
        priority: 'Medium',
      });
      matchedNames.add(norm);
    }
  }

  return updated;
}

// Helper to calibrate skill proficiencies based on assessment performance
function calibrateAssessmentSkills(
  currentSkills: Skill[] = [],
  strongSkillNames: string[] = [],
  weakSkillNames: string[] = []
): Skill[] {
  let updated = [...(currentSkills || [])];
  // Boost strong skills
  if (strongSkillNames.length > 0) {
    updated = boostSkills(updated, strongSkillNames, 15, 'Machine Learning');
  }
  // For weak skills where learner struggled or made errors:
  for (let i = 0; i < updated.length; i++) {
    const s = updated[i];
    const isWeak = weakSkillNames.some(
      (wsn) =>
        wsn.toLowerCase().trim() === s.name.toLowerCase().trim() ||
        s.name.toLowerCase().includes(wsn.toLowerCase().trim()) ||
        wsn.toLowerCase().includes(s.name.toLowerCase().trim())
    );
    if (isWeak) {
      // Calibrate proficiency slightly downwards or ensure it remains a clear gap
      const calibratedProf = Math.min(s.proficiency, Math.max(25, s.proficiency - 10));
      updated[i] = {
        ...s,
        proficiency: calibratedProf,
      };
    }
  }
  return updated;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const [profile, setProfile] = useState<LearnerProfile>(initialLearnerProfile);
  const [roadmapPhases, setRoadmapPhases] = useState<RoadmapPhase[]>(() =>
    evaluateRoadmapPrerequisites(initialRoadmapPhases, initialLearnerProfile)
  );
  const [activePhaseId, setActivePhaseId] = useState<string>('phase-1');
  const [savedRecIds, setSavedRecIds] = useState<string[]>([]);
  const [inProgressRecIds, setInProgressRecIds] = useState<string[]>([]);
  const [assessmentModules] = useState<AssessmentModule[]>(initialAssessmentModules);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Calculate dynamic Skill Gap Analysis strictly from actual learner skills vs career benchmark
  const skillGapAnalysis = React.useMemo(() => {
    return analyzeSkillGaps(profile);
  }, [profile]);

  // Evaluated roadmap phases with active prerequisite locking
  const evaluatedRoadmapPhases = React.useMemo(() => {
    return evaluateRoadmapPrerequisites(roadmapPhases, profile);
  }, [roadmapPhases, profile]);

  // Generate dynamic, explainable recommendations via deterministic 6-factor pipeline
  const recommendations = React.useMemo(() => {
    return generateRecommendations(profile, evaluatedRoadmapPhases, savedRecIds, inProgressRecIds);
  }, [profile, evaluatedRoadmapPhases, savedRecIds, inProgressRecIds]);

  // Deterministic Next Best Action based on prerequisites, current phase, active items, and skill gap priorities
  const nextBestAction = React.useMemo(() => {
    return calculateNextBestAction(
      profile,
      evaluatedRoadmapPhases,
      skillGapAnalysis,
      recommendations,
      inProgressRecIds
    );
  }, [profile, evaluatedRoadmapPhases, skillGapAnalysis, recommendations, inProgressRecIds]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Helper to load user-isolated data from Firestore
  const loadUserDataFromFirestore = useCallback(async (user: User) => {
    try {
      const existingProfile = await firestoreService.getUserProfile(user.uid);
      if (existingProfile && existingProfile.careerGoal) {
        setProfile(existingProfile);

        // Fetch user subcollections
        const [cloudPhases, cloudRecs, cloudResults, cloudActs, cloudMsgs] = await Promise.all([
          firestoreService.getRoadmapPhases(user.uid),
          firestoreService.getRecommendations(user.uid),
          firestoreService.getAssessmentResults(user.uid),
          firestoreService.getActivities(user.uid),
          firestoreService.getChatMessages(user.uid),
        ]);

        if (cloudPhases.length > 0) {
          const evaluated = evaluateRoadmapPrerequisites(cloudPhases, existingProfile);
          setRoadmapPhases(evaluated);
          const firstActive = evaluated.find((p) => p.status === 'in_progress') || evaluated[0];
          if (firstActive) setActivePhaseId(firstActive.id);
        } else {
          // Generate customized roadmap for existing profile
          const generated = generatePersonalizedRoadmap(existingProfile);
          const evaluated = evaluateRoadmapPrerequisites(generated, existingProfile);
          setRoadmapPhases(evaluated);
          firestoreService.saveRoadmapPhases(user.uid, evaluated).catch(console.warn);
        }

        if (cloudRecs.length > 0) {
          const savedFromCloud = cloudRecs.filter((r) => r.isSaved).map((r) => r.id);
          const inProgressFromCloud = cloudRecs.filter((r) => r.status === 'in_progress').map((r) => r.id);
          if (savedFromCloud.length > 0) setSavedRecIds(savedFromCloud);
          if (inProgressFromCloud.length > 0) setInProgressRecIds(inProgressFromCloud);
        }
        if (cloudResults.length > 0) setAssessmentResults(cloudResults);
        if (cloudActs.length > 0) setActivities(cloudActs);
        if (cloudMsgs.length > 0) setChatMessages(cloudMsgs);
        setIsCloudSynced(true);
        return true; // Profile exists
      } else {
        // Create initial empty profile structure
        const newProf = createNewUserProfile(user);
        setProfile(newProf);
        await firestoreService.saveUserProfile(user.uid, newProf);
        setIsCloudSynced(true);
        return false; // Profile newly created, needs onboarding
      }
    } catch (err) {
      console.warn('Firestore user data load failed:', err);
      setIsCloudSynced(false);
      return false;
    }
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (user) => {
      setFirebaseUser(user);
      setIsAuthLoading(false);
      if (user) {
        setIsLoggedIn(true);
        await loadUserDataFromFirestore(user);
      } else {
        setIsLoggedIn(false);
        setIsCloudSynced(false);
      }
    });

    return () => unsubscribe();
  }, [loadUserDataFromFirestore]);

  // Sign In with Email and Password
  const signInWithEmail = async (email: string, pass: string) => {
    setIsAuthLoading(true);
    try {
      const user = await authService.signInWithEmail(email, pass);
      setFirebaseUser(user);
      setIsLoggedIn(true);
      const hasExistingProfile = await loadUserDataFromFirestore(user);
      addToast(`Welcome back, ${user.displayName || email.split('@')[0]}!`, 'success');
      if (hasExistingProfile) {
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('onboarding');
      }
    } catch (error: any) {
      console.error('Firebase Auth sign in error:', error);
      let errMsg = 'Failed to sign in. Please check your credentials.';
      if (error.code === 'auth/invalid-email') {
        errMsg = 'Please enter a valid email address.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errMsg = 'Invalid email or password. Please check your credentials.';
      } else if (error.code === 'auth/too-many-requests') {
        errMsg = 'Too many failed login attempts. Please wait a few moments and try again.';
      }
      addToast(errMsg, 'error');
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Sign Up with Email and Password
  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setIsAuthLoading(true);
    try {
      const user = await authService.signUpWithEmail(email, pass, name);
      setFirebaseUser(user);
      setIsLoggedIn(true);

      const initialProf = createNewUserProfile(user, name);
      setProfile(initialProf);
      await firestoreService.saveUserProfile(user.uid, initialProf);
      setIsCloudSynced(true);

      addToast('Account created successfully! Let’s build your learning path.', 'success');
      setCurrentPage('onboarding');
    } catch (error: any) {
      console.error('Firebase Auth sign up error:', error);
      let errMsg = 'Sign up failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errMsg = 'This email address is already registered. Please sign in instead.';
      } else if (error.code === 'auth/weak-password') {
        errMsg = 'Password must be at least 6 characters long.';
      } else if (error.code === 'auth/invalid-email') {
        errMsg = 'Please enter a valid email address.';
      }
      addToast(errMsg, 'error');
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setIsAuthLoading(true);
    try {
      const user = await authService.signInWithGoogle();
      setFirebaseUser(user);
      setIsLoggedIn(true);
      const hasExistingProfile = await loadUserDataFromFirestore(user);
      addToast(`Signed in with Google as ${user.displayName || user.email}!`, 'success');
      if (hasExistingProfile) {
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('onboarding');
      }
    } catch (error: any) {
      console.error('Google Sign In error:', error);
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        addToast(error.message || 'Google sign-in could not be completed.', 'error');
      }
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Password Reset
  const sendPasswordReset = async (email: string) => {
    try {
      await authService.sendPasswordReset(email);
      addToast(`Password reset link sent to ${email}`, 'success');
    } catch (error: any) {
      console.error('Password reset error:', error);
      let msg = 'Could not send password reset email.';
      if (error.code === 'auth/user-not-found') {
        msg = 'No user found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      addToast(msg, 'error');
      throw error;
    }
  };

  // Sign Out
  const signOutUser = async () => {
    try {
      await authService.signOut();
      setIsLoggedIn(false);
      setFirebaseUser(null);
      setIsCloudSynced(false);
      setProfile(initialLearnerProfile);
      setRoadmapPhases(evaluateRoadmapPrerequisites(initialRoadmapPhases, initialLearnerProfile));
      setAssessmentResults([]);
      setActivities([]);
      setChatMessages(initialChatMessages);
      setSavedRecIds([]);
      setInProgressRecIds([]);
      addToast('Signed out successfully.', 'info');
      setCurrentPage('landing');
    } catch (error: any) {
      console.error('Sign out error:', error);
      setIsLoggedIn(false);
      setFirebaseUser(null);
      setCurrentPage('landing');
    }
  };

  const addActivity = async (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newAct: ActivityLog = {
      ...activity,
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
    };
    setActivities((prev) => [newAct, ...prev]);

    if (firebaseUser) {
      try {
        await firestoreService.addActivityLog(firebaseUser.uid, newAct);
      } catch (e) {
        console.warn('Error saving activity to Firestore:', e);
      }
    }
  };

  const updateProfile = async (updates: Partial<LearnerProfile>) => {
    const updated = { ...profile, ...updates, lastActive: new Date().toISOString() };
    setProfile(updated);
    addToast('Profile updated and saved to Cloud Firestore', 'success');

    if (firebaseUser) {
      try {
        await firestoreService.saveUserProfile(firebaseUser.uid, updated);
      } catch (e) {
        console.warn('Error updating profile in Firestore:', e);
      }
    }
  };

  const updateSkillProficiency = async (skillId: string, newProficiency: number) => {
    const updatedSkills = profile.skills.map((s) => (s.id === skillId ? { ...s, proficiency: newProficiency } : s));
    const updated = { ...profile, skills: updatedSkills, lastActive: new Date().toISOString() };
    setProfile(updated);

    if (firebaseUser) {
      try {
        await firestoreService.saveUserProfile(firebaseUser.uid, updated);
      } catch (e) {
        console.warn('Error updating skill in Firestore:', e);
      }
    }
  };

  const calculateOverallProgress = (): number => {
    if (evaluatedRoadmapPhases.length === 0) return 0;
    const total = evaluatedRoadmapPhases.reduce((acc, curr) => acc + curr.progress, 0);
    return Math.round(total / evaluatedRoadmapPhases.length);
  };

  const updateCourseProgress = async (phaseId: string, courseId: string, progress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    const isNowComplete = clampedProgress === 100;

    let updatedTargetCourse: Course | null = null;
    let targetPhaseObj: RoadmapPhase | null = null;

    const newPhases = roadmapPhases.map((phase) => {
      if (phase.id !== phaseId) return phase;

      const updatedCourses = phase.courses.map((c) => {
        if (c.id === courseId) {
          const updatedCourse = {
            ...c,
            progress: clampedProgress,
            status: isNowComplete ? ('completed' as const) : clampedProgress > 0 ? ('in_progress' as const) : c.status,
          };
          updatedTargetCourse = updatedCourse;
          return updatedCourse;
        }
        return c;
      });

      const totalItems = updatedCourses.length + phase.projects.length + (phase.practiceItems?.length || 0);
      const completedCourses = updatedCourses.filter((c) => c.status === 'completed').length;
      const completedProjects = phase.projects.filter((p) => p.status === 'completed').length;
      const completedPractice = (phase.practiceItems || []).filter((pr) => pr.status === 'completed').length;
      const newProgress = Math.min(100, Math.round(((completedCourses + completedProjects + completedPractice) / totalItems) * 100));

      const updatedPhase: RoadmapPhase = {
        ...phase,
        courses: updatedCourses,
        progress: newProgress,
        status: newProgress === 100 ? ('completed' as const) : ('in_progress' as const),
      };
      targetPhaseObj = updatedPhase;
      return updatedPhase;
    });

    let currentProfState = profile;
    if (isNowComplete && updatedTargetCourse) {
      const courseTitle = (updatedTargetCourse as Course).title;
      const skillsCovered = (updatedTargetCourse as Course).skillsCovered || [];
      const updatedCompletedCourses = Array.from(new Set([...(profile.completedCourses || []), courseTitle]));
      const updatedSkills = boostSkills(profile.skills || [], skillsCovered, 12, 'Foundation');
      currentProfState = {
        ...profile,
        completedCourses: updatedCompletedCourses,
        skills: updatedSkills,
        lastActive: 'Today',
      };
      setProfile(currentProfState);
    }

    const evaluated = evaluateRoadmapPrerequisites(newPhases, currentProfState);
    setRoadmapPhases(evaluated);

    if (isNowComplete && updatedTargetCourse) {
      const courseTitle = (updatedTargetCourse as Course).title;
      addActivity({
        type: 'course_progress',
        title: 'Course Completed! 🎉',
        description: `Successfully completed "${courseTitle}". Next prerequisites unlocked and skill proficiency boosted!`,
        iconType: 'course',
        phase: roadmapPhases.find((p) => p.id === phaseId)?.title,
      });

      addToast(`Completed "${courseTitle}"! Prerequisites & skills updated.`, 'success');

      if (firebaseUser) {
        firestoreService.saveUserProfile(firebaseUser.uid, currentProfState).catch(console.warn);
        firestoreService.saveRoadmapPhases(firebaseUser.uid, evaluated).catch(console.warn);
      }
    } else if (firebaseUser && targetPhaseObj) {
      firestoreService.updateRoadmapPhase(firebaseUser.uid, targetPhaseObj).catch(console.warn);
    }
  };

  const markCourseCompleted = async (phaseId: string, courseId: string) => {
    await updateCourseProgress(phaseId, courseId, 100);
  };

  const updateProjectProgress = async (phaseId: string, projectId: string, progress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    const isNowComplete = clampedProgress === 100;

    let targetProjectObj: Project | null = null;
    let targetPhaseObj: RoadmapPhase | null = null;

    const newPhases = roadmapPhases.map((phase) => {
      if (phase.id !== phaseId) return phase;

      const updatedProjects = phase.projects.map((p) => {
        if (p.id === projectId) {
          const updatedProj = {
            ...p,
            progress: clampedProgress,
            status: isNowComplete ? ('completed' as const) : clampedProgress > 0 ? ('in_progress' as const) : p.status,
          };
          targetProjectObj = updatedProj;
          return updatedProj;
        }
        return p;
      });

      const totalItems = phase.courses.length + updatedProjects.length + (phase.practiceItems?.length || 0);
      const completedCourses = phase.courses.filter((c) => c.status === 'completed').length;
      const completedProjects = updatedProjects.filter((p) => p.status === 'completed').length;
      const completedPractice = (phase.practiceItems || []).filter((pr) => pr.status === 'completed').length;
      const newProgress = Math.min(100, Math.round(((completedCourses + completedProjects + completedPractice) / totalItems) * 100));

      const updatedPhase: RoadmapPhase = {
        ...phase,
        projects: updatedProjects,
        progress: newProgress,
        status: newProgress === 100 ? ('completed' as const) : ('in_progress' as const),
      };
      targetPhaseObj = updatedPhase;
      return updatedPhase;
    });

    let currentProfState = profile;
    if (isNowComplete && targetProjectObj) {
      const projTitle = (targetProjectObj as Project).title;
      const skillsCovered = (targetProjectObj as Project).skillsCovered || [];
      const updatedCompletedCourses = Array.from(new Set([...(profile.completedCourses || []), projTitle]));
      const updatedSkills = boostSkills(profile.skills || [], skillsCovered, 18, 'Machine Learning');
      currentProfState = {
        ...profile,
        completedCourses: updatedCompletedCourses,
        skills: updatedSkills,
        lastActive: 'Today',
      };
      setProfile(currentProfState);
    }

    const evaluated = evaluateRoadmapPrerequisites(newPhases, currentProfState);
    setRoadmapPhases(evaluated);

    if (isNowComplete && targetProjectObj) {
      const projTitle = (targetProjectObj as Project).title;
      addActivity({
        type: 'project_completed',
        title: 'Project Milestone Submitted! 🚀',
        description: `Verified deliverable for "${projTitle}". Phase progress and competencies updated!`,
        iconType: 'project',
        phase: roadmapPhases.find((p) => p.id === phaseId)?.title,
      });

      addToast(`Project "${projTitle}" submitted and verified!`, 'success');

      if (firebaseUser) {
        firestoreService.saveUserProfile(firebaseUser.uid, currentProfState).catch(console.warn);
        firestoreService.saveRoadmapPhases(firebaseUser.uid, evaluated).catch(console.warn);
      }
    } else if (firebaseUser && targetPhaseObj) {
      firestoreService.updateRoadmapPhase(firebaseUser.uid, targetPhaseObj).catch(console.warn);
    }
  };

  const markProjectCompleted = async (phaseId: string, projectId: string) => {
    await updateProjectProgress(phaseId, projectId, 100);
  };

  const markPracticeCompleted = async (phaseId: string, practiceId: string) => {
    let targetPracticeTitle = 'Practice challenge';
    let targetPracticeSkills: string[] = [];
    let targetPhaseObj: RoadmapPhase | null = null;

    const newPhases = roadmapPhases.map((phase) => {
      if (phase.id !== phaseId) return phase;

      const updatedPractice = (phase.practiceItems || []).map((pr) => {
        if (pr.id === practiceId) {
          targetPracticeTitle = pr.title;
          targetPracticeSkills = pr.skills || [];
          return { ...pr, status: 'completed' as const, progress: 100 };
        }
        return pr;
      });

      const totalItems = phase.courses.length + phase.projects.length + updatedPractice.length;
      const completedCourses = phase.courses.filter((c) => c.status === 'completed').length;
      const completedProjects = phase.projects.filter((p) => p.status === 'completed').length;
      const completedPractice = updatedPractice.filter((pr) => pr.status === 'completed').length;
      const newProgress = Math.min(100, Math.round(((completedCourses + completedProjects + completedPractice) / totalItems) * 100));

      const updatedPhase: RoadmapPhase = {
        ...phase,
        practiceItems: updatedPractice,
        progress: newProgress,
        status: newProgress === 100 ? ('completed' as const) : ('in_progress' as const),
      };
      targetPhaseObj = updatedPhase;
      return updatedPhase;
    });

    const updatedSkills = boostSkills(profile.skills || [], targetPracticeSkills, 8, 'Foundation');
    const updatedProfile = {
      ...profile,
      skills: updatedSkills,
      lastActive: 'Today',
    };
    setProfile(updatedProfile);

    const evaluated = evaluateRoadmapPrerequisites(newPhases, updatedProfile);
    setRoadmapPhases(evaluated);

    addActivity({
      type: 'course_progress',
      title: 'Practice Challenge Completed! ⚡',
      description: `Completed "${targetPracticeTitle}" coding exercise.`,
      iconType: 'course',
      phase: roadmapPhases.find((p) => p.id === phaseId)?.title,
    });

    addToast(`Completed "${targetPracticeTitle}"! Skill rating updated.`, 'success');

    if (firebaseUser) {
      firestoreService.saveUserProfile(firebaseUser.uid, updatedProfile).catch(console.warn);
      firestoreService.saveRoadmapPhases(firebaseUser.uid, evaluated).catch(console.warn);
    }
  };

  const markMilestoneCompleted = async (phaseId: string) => {
    const targetPhase = roadmapPhases.find((p) => p.id === phaseId);
    if (!targetPhase) return;

    addActivity({
      type: 'project_completed',
      title: `Milestone Achieved: ${targetPhase.milestoneTitle || targetPhase.title} 🏅`,
      description: `Officially attained competency badge for Phase ${targetPhase.phaseNumber}.`,
      iconType: 'project',
      phase: targetPhase.title,
    });

    addToast(`Milestone achieved: "${targetPhase.milestoneTitle || targetPhase.title}"!`, 'success');
  };

  const toggleSaveRecommendation = async (id: string) => {
    let nowSaved = false;
    setSavedRecIds((prev) => {
      if (prev.includes(id)) {
        nowSaved = false;
        return prev.filter((item) => item !== id);
      } else {
        nowSaved = true;
        return [...prev, id];
      }
    });

    if (nowSaved) {
      addToast('Saved to your priority learning list', 'success');
    } else {
      addToast('Removed from saved recommendations', 'info');
    }
  };

  const startRecommendation = async (id: string) => {
    setInProgressRecIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    const targetRec = recommendations.find((r) => r.id === id);
    addToast(`Started: ${targetRec?.title || 'Learning item'}`, 'info');

    addActivity({
      type: 'course_progress',
      title: `Started: ${targetRec?.title || 'Module'}`,
      description: `In-progress learning activity initiated.`,
      iconType: targetRec?.type === 'Project' ? 'project' : 'course',
    });
  };

  const completeRecommendation = async (id: string) => {
    const targetRec = recommendations.find((r) => r.id === id);
    if (!targetRec) return;

    // Remove from in-progress
    setInProgressRecIds((prev) => prev.filter((item) => item !== id));

    // Add to completed courses
    const updatedCompletedCourses = Array.from(
      new Set([...(profile.completedCourses || []), targetRec.title])
    );

    // Boost proficiency for skills covered
    const updatedSkills = boostSkills(profile.skills || [], targetRec.skillsCovered || [], 15, 'Machine Learning');

    const updatedProfile: LearnerProfile = {
      ...profile,
      completedCourses: updatedCompletedCourses,
      skills: updatedSkills,
      lastActive: 'Today',
    };
    setProfile(updatedProfile);

    // Also update any matching course/project in roadmapPhases
    const newPhases = roadmapPhases.map((phase) => {
      const updatedCourses = phase.courses.map((c) =>
        c.title.toLowerCase().trim() === targetRec.title.toLowerCase().trim()
          ? { ...c, status: 'completed' as const, progress: 100 }
          : c
      );
      const updatedProjects = phase.projects.map((p) =>
        p.title.toLowerCase().trim() === targetRec.title.toLowerCase().trim()
          ? { ...p, status: 'completed' as const, progress: 100 }
          : p
      );
      const totalItems = updatedCourses.length + updatedProjects.length;
      const completedCourses = updatedCourses.filter((c) => c.status === 'completed').length;
      const completedProjects = updatedProjects.filter((p) => p.status === 'completed').length;
      const newProgress = Math.min(100, Math.round(((completedCourses + completedProjects) / totalItems) * 100));

      return {
        ...phase,
        courses: updatedCourses,
        projects: updatedProjects,
        progress: newProgress,
        status: newProgress === 100 ? ('completed' as const) : phase.status,
      };
    });

    const evaluated = evaluateRoadmapPrerequisites(newPhases, updatedProfile);
    setRoadmapPhases(evaluated);

    addActivity({
      type: targetRec.type === 'Project' ? 'project_completed' : 'course_progress',
      title: `Completed: ${targetRec.title} 🏆`,
      description: `Completed ${targetRec.type}. Skill gaps and roadmap updated automatically!`,
      iconType: targetRec.type === 'Project' ? 'project' : 'course',
    });

    addToast(`Completed "${targetRec.title}"! Recommendations and skill gaps updated.`, 'success');

    if (firebaseUser) {
      try {
        await Promise.all([
          firestoreService.saveUserProfile(firebaseUser.uid, updatedProfile),
          firestoreService.saveRoadmapPhases(firebaseUser.uid, evaluated),
        ]);
      } catch (e) {
        console.warn('Error saving profile and phases update in Firestore:', e);
      }
    }
  };

  const submitAssessment = async (assessmentId: string, answers: Record<string, string>): Promise<AssessmentResult> => {
    const module = assessmentModules.find((m) => m.id === assessmentId);
    if (!module) {
      throw new Error('Assessment not found');
    }

    let correctCount = 0;
    const totalQuestions = module.questions.length;
    const strongSet = new Set<string>();
    const weakSet = new Set<string>();

    module.questions.forEach((q) => {
      const selected = answers[q.id];
      if (selected === q.correctOptionId) {
        correctCount += 1;
        strongSet.add(q.skillTested);
      } else {
        weakSet.add(q.skillTested);
      }
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= module.passingScore;

    let masteryLevel: AssessmentResult['masteryLevel'] = 'Novice';
    if (score >= 90) masteryLevel = 'Master';
    else if (score >= 75) masteryLevel = 'Proficient';
    else if (score >= 50) masteryLevel = 'Developing';

    const strongList = Array.from(strongSet).length > 0 ? Array.from(strongSet) : ['General Logic'];
    const weakList = Array.from(weakSet).length > 0 ? Array.from(weakSet) : ['None identified'];

    const result: AssessmentResult = {
      id: `res-${Date.now()}`,
      assessmentId,
      title: module.title,
      score,
      passed,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      totalQuestions,
      correctCount,
      masteryLevel,
      strongAreas: strongList,
      weakAreas: weakList,
      recommendedNextAction: passed
        ? 'Great mastery! Proceed to unlock next roadmap phase.'
        : `Review ${weakList.slice(0, 2).join(' & ')} modules and retry diagnostic when ready.`,
    };

    setAssessmentResults((prev) => [result, ...prev]);

    const calibratedSkills = calibrateAssessmentSkills(profile.skills || [], strongList, passed ? [] : weakList);
    const updatedProf: LearnerProfile = {
      ...profile,
      skills: calibratedSkills,
      lastActive: 'Today',
    };
    setProfile(updatedProf);

    // If passed, update phase assessment status and unlock next phase
    let updatedPhases = roadmapPhases;
    if (passed) {
      updatedPhases = roadmapPhases.map((p) =>
        p.id === module.phaseId ? { ...p, isAssessmentPassed: true } : p
      );
    }
    const evaluated = evaluateRoadmapPrerequisites(updatedPhases, updatedProf);
    setRoadmapPhases(evaluated);

    addActivity({
      type: 'assessment_passed',
      title: `Assessment Completed: ${module.title} (${score}%)`,
      description: passed ? 'Assessment passed! Skill rating adjusted and roadmap phase unlocked.' : 'Assessment finished. Areas of improvement identified for targeted practice.',
      iconType: 'assessment',
      phase: module.phaseName,
    });

    if (firebaseUser) {
      try {
        await Promise.all([
          firestoreService.saveUserProfile(firebaseUser.uid, updatedProf),
          firestoreService.saveRoadmapPhases(firebaseUser.uid, evaluated),
          firestoreService.saveAssessmentResult(firebaseUser.uid, result),
        ]);
      } catch (e) {
        console.warn('Error saving assessment state to Firestore:', e);
      }
    }

    return result;
  };

  const sendChatMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAiThinking(true);

    if (firebaseUser) {
      firestoreService.addChatMessage(firebaseUser.uid, userMsg).catch(console.warn);
    }

    try {
      // Find currently active phase
      const currentActivePhase =
        evaluatedRoadmapPhases.find((p) => p.id === activePhaseId) ||
        evaluatedRoadmapPhases.find((p) => p.status === 'in_progress') ||
        evaluatedRoadmapPhases[0];

      const top3Gaps = Array.isArray(skillGapAnalysis?.top3SkillsToImprove)
        ? skillGapAnalysis.top3SkillsToImprove
        : [];

      // Prepare authenticated context for Gemini AI
      const contextPayload = {
        learnerProfile: profile,
        skillGapAnalysis: {
          overallReadinessScore: skillGapAnalysis?.overallReadinessScore ?? 0,
          masteredCount: skillGapAnalysis?.masteredCount ?? skillGapAnalysis?.masteredSkills?.length ?? 0,
          developingCount: skillGapAnalysis?.developingCount ?? skillGapAnalysis?.developingSkills?.length ?? 0,
          gapCount: skillGapAnalysis?.gapCount ?? skillGapAnalysis?.gapSkills?.length ?? 0,
          top3SkillsToImprove: top3Gaps.map((item) => ({
            name: item?.name || 'Skill',
            currentProficiency: item?.currentProficiency ?? 0,
            requiredProficiency: item?.requiredProficiency ?? 80,
            priority: item?.priority || 'High',
            reason: item?.reason || 'Core competency benchmark',
          })),
        },
        activePhase: currentActivePhase
          ? {
              phaseNumber: currentActivePhase.phaseNumber,
              title: currentActivePhase.title,
              progress: currentActivePhase.progress,
              skills: currentActivePhase.skills || [],
              whyThisPhase: currentActivePhase.whyThisPhase || '',
              isAssessmentPassed: Boolean(currentActivePhase.isAssessmentPassed),
            }
          : undefined,
        nextBestAction: nextBestAction
          ? {
              title: nextBestAction.title,
              type: nextBestAction.type,
              phaseNumber: nextBestAction.phaseNumber,
              whyThisAction: nextBestAction.whyThisAction,
              skillsTargeted: nextBestAction.skillsTargeted || [],
            }
          : undefined,
        recommendations: (recommendations || []).slice(0, 5).map((r) => ({
          title: r.title,
          type: r.type,
          matchPercentage: r.matchPercentage,
          difficulty: r.difficulty,
          whyRecommended: r.whyRecommended,
        })),
        overallProgress: calculateOverallProgress(),
      };

      // Call server-side Gemini API endpoint
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: (chatMessages || []).slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          context: contextPayload,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.text || 'I have analyzed your request based on your current learning roadmap.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps:
          Array.isArray(data.suggestedFollowUps) && data.suggestedFollowUps.length > 0
            ? data.suggestedFollowUps
            : [
                'What should I learn next?',
                'Why should I learn statistics before machine learning?',
                'Explain overfitting simply.',
                "I'm struggling with regression.",
              ],
        relatedAction: data.action,
      };

      setChatMessages((prev) => [...prev, assistantMsg]);

      if (firebaseUser) {
        firestoreService.addChatMessage(firebaseUser.uid, assistantMsg).catch(console.warn);
      }
    } catch (err: any) {
      console.error('Gemini AI Assistant request failed:', err);

      const errorAssistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: 'AI Assistant is temporarily unavailable. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: [
          'What should I learn next?',
          'Why should I learn statistics before machine learning?',
          'Explain overfitting simply.',
          "I'm struggling with regression.",
        ],
        isError: true,
        retryPrompt: text,
      };

      setChatMessages((prev) => [...prev, errorAssistantMsg]);

      if (firebaseUser) {
        firestoreService.addChatMessage(firebaseUser.uid, errorAssistantMsg).catch(console.warn);
      }
    } finally {
      setIsAiThinking(false);
    }
  };

  const clearChat = async () => {
    const oldMessages = [...chatMessages];
    setChatMessages(initialChatMessages);
    addToast('Chat history cleared', 'info');

    if (firebaseUser) {
      firestoreService.clearChatMessages(firebaseUser.uid, oldMessages);
    }
  };

  const generateRoadmapFromOnboarding = async (data: Partial<LearnerProfile>) => {
    const updated: LearnerProfile = {
      ...profile,
      ...data,
      lastActive: new Date().toISOString(),
    };
    setProfile(updated);

    // Generate personalized 6-phase roadmap tailored to learner goal, skills, hours, and experience level
    const newPhases = generatePersonalizedRoadmap(updated);
    const evaluated = evaluateRoadmapPrerequisites(newPhases, updated);
    setRoadmapPhases(evaluated);

    const firstActive = evaluated.find((p) => p.status === 'in_progress') || evaluated[0];
    if (firstActive) setActivePhaseId(firstActive.id);

    if (firebaseUser) {
      try {
        await firestoreService.saveUserProfile(firebaseUser.uid, updated);
        await firestoreService.saveRoadmapPhases(firebaseUser.uid, evaluated);
      } catch (e) {
        console.warn('Error saving onboarding data and roadmap to Firestore:', e);
      }
    }

    addToast(`Personalized roadmap generated and saved for ${updated.careerGoal}!`, 'success');
    setCurrentPage('dashboard');
  };

  const overallProgress = calculateOverallProgress();

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        isLoggedIn,
        setIsLoggedIn,
        firebaseUser,
        isAuthLoading,
        isCloudSynced,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        sendPasswordReset,
        signOutUser,
        profile,
        updateProfile,
        updateSkillProficiency,
        roadmapPhases: evaluatedRoadmapPhases,
        activePhaseId,
        setActivePhaseId,
        markCourseCompleted,
        updateCourseProgress,
        markProjectCompleted,
        updateProjectProgress,
        markPracticeCompleted,
        markMilestoneCompleted,
        recommendations,
        nextBestAction,
        skillGapAnalysis,
        toggleSaveRecommendation,
        startRecommendation,
        completeRecommendation,
        assessmentModules,
        assessmentResults,
        submitAssessment,
        activities,
        addActivity,
        chatMessages,
        isAiThinking,
        sendChatMessage,
        clearChat,
        toasts,
        addToast,
        removeToast,
        generateRoadmapFromOnboarding,
        overallProgress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
