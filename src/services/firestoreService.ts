import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  writeBatch,
  query,
  orderBy,
  limit,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  LearnerProfile,
  RoadmapPhase,
  Recommendation,
  AssessmentResult,
  ActivityLog,
  ChatMessage,
} from '../types';

/**
 * Recursively removes all `undefined` values from an object or array.
 * Firestore strictly disallows `undefined` values anywhere in document data.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined || data === null) {
    return (data === undefined ? null : data) as any;
  }
  if (typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as any;
  }
  const cleanObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined) {
      cleanObj[key] = sanitizeForFirestore(value);
    }
  }
  return cleanObj as T;
}

export const firestoreService = {
  // Get User Profile
  async getUserProfile(userId: string): Promise<LearnerProfile | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<LearnerProfile>;
        return {
          id: data.id || userId,
          name: data.name || 'Learner',
          email: data.email || '',
          careerGoal: data.careerGoal || 'AI Engineer',
          experienceLevel: data.experienceLevel || 'Intermediate',
          learningStyle: data.learningStyle || 'Hands-on Projects',
          weeklyHours: typeof data.weeklyHours === 'number' ? data.weeklyHours : 6,
          preferredDifficulty: data.preferredDifficulty || 'Adaptive',
          streakDays: typeof data.streakDays === 'number' ? data.streakDays : 1,
          completedCourses: Array.isArray(data.completedCourses) ? data.completedCourses : [],
          interests: Array.isArray(data.interests) ? data.interests : ['Machine Learning', 'Deep Learning'],
          skills: Array.isArray(data.skills)
            ? data.skills.map((s) => ({
                id: s.id,
                name: s.name,
                category: s.category || 'General',
                proficiency: typeof s.proficiency === 'number' ? s.proficiency : 50,
                targetProficiency: typeof s.targetProficiency === 'number' ? s.targetProficiency : 80,
                status: s.status || 'needs_practice',
                priority: s.priority || 'medium',
                reason: s.reason,
              }))
            : [],
          avatarUrl: data.avatarUrl,
          joinedDate: data.joinedDate || 'Recently',
          lastActive: data.lastActive || 'Today',
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile from Firestore:', error);
      return null;
    }
  },

  // Save or update User Profile
  async saveUserProfile(userId: string, profile: LearnerProfile): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const sanitized = sanitizeForFirestore(profile);
      await setDoc(userRef, sanitized, { merge: true });
    } catch (error) {
      console.error('Error saving user profile to Firestore:', error);
      throw error;
    }
  },

  // Get Roadmap Phases
  async getRoadmapPhases(userId: string): Promise<RoadmapPhase[]> {
    try {
      const phasesRef = collection(db, 'users', userId, 'roadmapPhases');
      const q = query(phasesRef, orderBy('phaseNumber', 'asc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => {
          const p = docSnap.data() as Partial<RoadmapPhase>;
          return {
            id: p.id || docSnap.id,
            phaseNumber: typeof p.phaseNumber === 'number' ? p.phaseNumber : 1,
            title: p.title || `Phase ${p.phaseNumber || 1}`,
            tagline: p.tagline || '',
            status: p.status || 'unlocked',
            progress: typeof p.progress === 'number' ? p.progress : 0,
            estimatedDuration: p.estimatedDuration || '4 Weeks',
            prerequisites: Array.isArray(p.prerequisites) ? p.prerequisites : [],
            skills: Array.isArray(p.skills) ? p.skills : [],
            whyThisPhase: p.whyThisPhase || '',
            assessmentRequired: p.assessmentRequired || 'Phase Assessment',
            assessmentId: p.assessmentId || 'assess-1',
            isAssessmentPassed: Boolean(p.isAssessmentPassed),
            isAssessmentLocked: Boolean(p.isAssessmentLocked),
            assessmentLockReason: p.assessmentLockReason,
            milestoneTitle: p.milestoneTitle || 'Phase Milestone',
            milestoneDescription: p.milestoneDescription || '',
            unlockedBadges: Array.isArray(p.unlockedBadges) ? p.unlockedBadges : [],
            isMilestoneCompleted: Boolean(p.isMilestoneCompleted),
            isMilestoneLocked: Boolean(p.isMilestoneLocked),
            milestoneLockReason: p.milestoneLockReason,
            isLocked: Boolean(p.isLocked),
            lockReason: p.lockReason,
            courses: Array.isArray(p.courses)
              ? p.courses.map((c, cIdx) => ({
                  id: c.id || `c-${p.phaseNumber}-${cIdx + 1}`,
                  sequence: typeof c.sequence === 'number' ? c.sequence : cIdx + 1,
                  title: c.title || 'Course',
                  provider: c.provider || 'PathFind Labs',
                  duration: c.duration || '4 hrs',
                  skillsCovered: Array.isArray(c.skillsCovered) ? c.skillsCovered : [],
                  difficulty: c.difficulty || 'Intermediate',
                  status: c.status || 'not_started',
                  progress: typeof c.progress === 'number' ? c.progress : 0,
                  description: c.description || '',
                  rating: typeof c.rating === 'number' ? c.rating : 4.8,
                  resourceReference: c.resourceReference,
                  isLocked: Boolean(c.isLocked),
                  lockReason: c.lockReason,
                  isElective: Boolean(c.isElective),
                }))
              : [],
            practiceItems: Array.isArray(p.practiceItems)
              ? p.practiceItems.map((pr, prIdx) => ({
                  id: pr.id || `pr-${p.phaseNumber}-${prIdx + 1}`,
                  sequence: typeof pr.sequence === 'number' ? pr.sequence : prIdx + 1,
                  title: pr.title || 'Practice Exercise',
                  type: 'Practice' as const,
                  skills: Array.isArray(pr.skills) ? pr.skills : [],
                  prerequisites: Array.isArray(pr.prerequisites) ? pr.prerequisites : [],
                  estimatedHours: pr.estimatedHours || '2 hrs',
                  durationHours: typeof pr.durationHours === 'number' ? pr.durationHours : 2,
                  status: pr.status || 'unlocked',
                  progress: typeof pr.progress === 'number' ? pr.progress : 0,
                  exerciseType: pr.exerciseType || 'Interactive Notebook',
                  description: pr.description || '',
                  isLocked: Boolean(pr.isLocked),
                  lockReason: pr.lockReason,
                }))
              : [],
            projects: Array.isArray(p.projects)
              ? p.projects.map((proj, pIdx) => ({
                  id: proj.id || `p-${p.phaseNumber}-${pIdx + 1}`,
                  sequence: typeof proj.sequence === 'number' ? proj.sequence : pIdx + 1,
                  title: proj.title || 'Capstone Project',
                  duration: proj.duration || '8 hrs',
                  skillsCovered: Array.isArray(proj.skillsCovered) ? proj.skillsCovered : [],
                  difficulty: proj.difficulty || 'Intermediate',
                  status: proj.status || 'not_started',
                  progress: typeof proj.progress === 'number' ? proj.progress : 0,
                  description: proj.description || '',
                  deliverables: Array.isArray(proj.deliverables) ? proj.deliverables : [],
                  resourceReference: proj.resourceReference,
                  isLocked: Boolean(proj.isLocked),
                  lockReason: proj.lockReason,
                }))
              : [],
          };
        });
      }
      return [];
    } catch (error) {
      console.error('Error getting roadmap phases:', error);
      return [];
    }
  },

  // Save all roadmap phases (batch)
  async saveRoadmapPhases(userId: string, phases: RoadmapPhase[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      phases.forEach((phase) => {
        const phaseRef = doc(db, 'users', userId, 'roadmapPhases', phase.id);
        const sanitized = sanitizeForFirestore(phase);
        batch.set(phaseRef, sanitized, { merge: true });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error saving roadmap phases to Firestore:', error);
      throw error;
    }
  },

  // Update single phase
  async updateRoadmapPhase(userId: string, phase: RoadmapPhase): Promise<void> {
    try {
      const phaseRef = doc(db, 'users', userId, 'roadmapPhases', phase.id);
      const sanitized = sanitizeForFirestore(phase);
      await setDoc(phaseRef, sanitized, { merge: true });
    } catch (error) {
      console.error('Error updating roadmap phase in Firestore:', error);
      throw error;
    }
  },

  // Get Recommendations
  async getRecommendations(userId: string): Promise<Recommendation[]> {
    try {
      const recsRef = collection(db, 'users', userId, 'recommendations');
      const snapshot = await getDocs(recsRef);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => d.data() as Recommendation);
      }
      return [];
    } catch (error) {
      console.error('Error getting recommendations from Firestore:', error);
      return [];
    }
  },

  // Save Recommendations (batch)
  async saveRecommendations(userId: string, recs: Recommendation[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      recs.forEach((rec) => {
        const recRef = doc(db, 'users', userId, 'recommendations', rec.id);
        const sanitized = sanitizeForFirestore(rec);
        batch.set(recRef, sanitized, { merge: true });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error saving recommendations:', error);
      throw error;
    }
  },

  // Update single recommendation
  async updateRecommendation(userId: string, rec: Recommendation): Promise<void> {
    try {
      const recRef = doc(db, 'users', userId, 'recommendations', rec.id);
      const sanitized = sanitizeForFirestore(rec);
      await setDoc(recRef, sanitized, { merge: true });
    } catch (error) {
      console.error('Error updating recommendation in Firestore:', error);
      throw error;
    }
  },

  // Get Assessment Results
  async getAssessmentResults(userId: string): Promise<AssessmentResult[]> {
    try {
      const assessRef = collection(db, 'users', userId, 'assessmentResults');
      const snapshot = await getDocs(assessRef);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => d.data() as AssessmentResult);
      }
      return [];
    } catch (error) {
      console.error('Error getting assessment results:', error);
      return [];
    }
  },

  // Save single Assessment Result
  async saveAssessmentResult(userId: string, result: AssessmentResult): Promise<void> {
    try {
      const assessRef = doc(db, 'users', userId, 'assessmentResults', result.id);
      const sanitized = sanitizeForFirestore(result);
      await setDoc(assessRef, sanitized);
    } catch (error) {
      console.error('Error saving assessment result:', error);
      throw error;
    }
  },

  // Get Activities
  async getActivities(userId: string): Promise<ActivityLog[]> {
    try {
      const actRef = collection(db, 'users', userId, 'activities');
      const q = query(actRef, limit(50));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => d.data() as ActivityLog);
      }
      return [];
    } catch (error) {
      console.error('Error getting activities from Firestore:', error);
      return [];
    }
  },

  // Add single Activity Log
  async addActivityLog(userId: string, activity: ActivityLog): Promise<void> {
    try {
      const actRef = doc(db, 'users', userId, 'activities', activity.id);
      const sanitized = sanitizeForFirestore(activity);
      await setDoc(actRef, sanitized);
    } catch (error) {
      console.error('Error adding activity log to Firestore:', error);
    }
  },

  // Get Chat Messages
  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    try {
      const chatRef = collection(db, 'users', userId, 'chatMessages');
      const snapshot = await getDocs(chatRef);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => d.data() as ChatMessage);
      }
      return [];
    } catch (error) {
      console.error('Error getting chat messages:', error);
      return [];
    }
  },

  // Add Chat Message
  async addChatMessage(userId: string, message: ChatMessage): Promise<void> {
    try {
      const msgRef = doc(db, 'users', userId, 'chatMessages', message.id);
      const sanitized = sanitizeForFirestore(message);
      await setDoc(msgRef, sanitized);
    } catch (error) {
      console.error('Error adding chat message to Firestore:', error);
    }
  },

  // Clear Chat Messages
  async clearChatMessages(userId: string, messages: ChatMessage[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      messages.forEach((msg) => {
        const msgRef = doc(db, 'users', userId, 'chatMessages', msg.id);
        batch.delete(msgRef);
      });
      await batch.commit();
    } catch (error) {
      console.error('Error clearing chat messages:', error);
    }
  },

  // Initialize new user dataset
  async initializeUserData(
    userId: string,
    initialProfile: LearnerProfile,
    initialPhases: RoadmapPhase[],
    initialRecs: Recommendation[],
    initialResults: AssessmentResult[],
    initialActs: ActivityLog[],
    initialMsgs: ChatMessage[]
  ): Promise<void> {
    try {
      // 1. Profile
      await setDoc(doc(db, 'users', userId), sanitizeForFirestore(initialProfile));

      // 2. Phases & subcollections
      const batch = writeBatch(db);
      initialPhases.forEach((p) => {
        batch.set(doc(db, 'users', userId, 'roadmapPhases', p.id), sanitizeForFirestore(p));
      });
      initialRecs.forEach((r) => {
        batch.set(doc(db, 'users', userId, 'recommendations', r.id), sanitizeForFirestore(r));
      });
      initialResults.forEach((res) => {
        batch.set(doc(db, 'users', userId, 'assessmentResults', res.id), sanitizeForFirestore(res));
      });
      initialActs.forEach((act) => {
        batch.set(doc(db, 'users', userId, 'activities', act.id), sanitizeForFirestore(act));
      });
      initialMsgs.forEach((msg) => {
        batch.set(doc(db, 'users', userId, 'chatMessages', msg.id), sanitizeForFirestore(msg));
      });

      await batch.commit();
    } catch (error) {
      console.error('Error initializing user data in Firestore:', error);
      throw error;
    }
  },
};
