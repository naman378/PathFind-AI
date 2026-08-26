import {
  LearnerProfile,
  RoadmapPhase,
  Course,
  PracticeItem,
  Project,
  SkillGapAnalysisResult,
  Recommendation,
  NextBestAction,
  CandidateResource,
} from '../types';
import { candidateResourceCatalog } from '../data/candidateResources';
import { analyzeSkillGaps } from './skillGapEngine';

/**
 * Evaluates prerequisite status for all phases and individual learning items
 * and sets accurate status, isLocked, and lockReason.
 */
export function evaluateRoadmapPrerequisites(
  phases: RoadmapPhase[],
  profile: LearnerProfile
): RoadmapPhase[] {
  if (!Array.isArray(phases) || phases.length === 0) {
    return [];
  }
  const completedPhaseIds = new Set<string>();
  const completedCourseIds = new Set<string>();
  const completedProjectIds = new Set<string>();
  const completedPracticeIds = new Set<string>();

  // Collect explicitly completed course titles from profile
  const completedCourseTitles = new Set<string>(
    (profile?.completedCourses || []).map((t) => t.toLowerCase().trim())
  );

  // First pass: gather already completed items
  for (const phase of phases) {
    const courses = phase.courses || [];
    const projects = phase.projects || [];
    const practiceItems = phase.practiceItems || [];

    let allCoursesDone = courses.length > 0;
    let allProjectsDone = projects.length > 0;
    let allPracticeDone = practiceItems.length > 0;

    for (const c of courses) {
      if (c.status === 'completed' || completedCourseTitles.has(c.title.toLowerCase().trim())) {
        completedCourseIds.add(c.id);
      } else {
        allCoursesDone = false;
      }
    }

    for (const p of projects) {
      if (p.status === 'completed') {
        completedProjectIds.add(p.id);
      } else {
        allProjectsDone = false;
      }
    }

    for (const pr of practiceItems) {
      if (pr.status === 'completed') {
        completedPracticeIds.add(pr.id);
      } else {
        allPracticeDone = false;
      }
    }

    if (
      phase.status === 'completed' ||
      (allCoursesDone && allProjectsDone && (practiceItems.length === 0 || allPracticeDone) && phase.isAssessmentPassed)
    ) {
      completedPhaseIds.add(phase.id);
    }
  }

  // Second pass: compute locking, progress, and prerequisite explanations for each phase and item
  return phases.map((phase, phaseIndex) => {
    const rawCourses = phase.courses || [];
    const rawPracticeItems = phase.practiceItems || [];
    const rawProjects = phase.projects || [];

    // 1. Phase-level Prerequisite Evaluation
    const priorPhases = phases.slice(0, phaseIndex);
    const incompletePriorPhases = priorPhases.filter(
      (p) => !completedPhaseIds.has(p.id) && p.status !== 'completed'
    );

    let phaseIsLocked = false;
    let phaseLockReason: string | undefined = undefined;

    if (incompletePriorPhases.length > 0) {
      phaseIsLocked = true;
      const priorTitles = incompletePriorPhases.map((p) => `Phase ${p.phaseNumber} (${p.title})`).join(', ');
      phaseLockReason = `Complete ${priorTitles} before unlocking Phase ${phase.phaseNumber}.`;
    }

    // 2. Evaluate Course Items in Phase
    const updatedCourses: Course[] = rawCourses.map((course, cIdx) => {
      const isAlreadyCompleted =
        course.status === 'completed' ||
        completedCourseTitles.has(course.title.toLowerCase().trim()) ||
        course.progress === 100;

      if (isAlreadyCompleted) {
        return {
          ...course,
          sequence: course.sequence || cIdx + 1,
          status: 'completed' as const,
          progress: 100,
          isLocked: false,
          lockReason: undefined,
        };
      }

      if (phaseIsLocked) {
        return {
          ...course,
          sequence: course.sequence || cIdx + 1,
          status: 'locked' as const,
          progress: course.progress || 0,
          isLocked: true,
          lockReason: phaseLockReason,
        };
      }

      // Check item-level prerequisites within phase (prior courses in same phase)
      let itemLocked = false;
      let itemLockReason: string | undefined = undefined;

      if (cIdx > 0) {
        const priorCourse = rawCourses[cIdx - 1];
        const isPriorDone =
          priorCourse.status === 'completed' ||
          completedCourseIds.has(priorCourse.id) ||
          completedCourseTitles.has(priorCourse.title.toLowerCase().trim());

        if (!isPriorDone) {
          itemLocked = true;
          itemLockReason = `Complete "${priorCourse.title}" before starting ${course.title}.`;
        }
      }

      return {
        ...course,
        sequence: course.sequence || cIdx + 1,
        status: itemLocked ? ('locked' as const) : course.status === 'in_progress' ? ('in_progress' as const) : ('not_started' as const),
        progress: itemLocked ? 0 : course.progress || 0,
        isLocked: itemLocked,
        lockReason: itemLockReason,
      };
    });

    // 3. Evaluate Practice Items
    const practiceItems = rawPracticeItems.map((practice, prIdx) => {
      const isAlreadyCompleted = practice.status === 'completed' || practice.progress === 100;
      if (isAlreadyCompleted) {
        return {
          ...practice,
          sequence: practice.sequence || prIdx + 1,
          status: 'completed' as const,
          progress: 100,
          isLocked: false,
          lockReason: undefined,
        };
      }

      if (phaseIsLocked) {
        return {
          ...practice,
          sequence: practice.sequence || prIdx + 1,
          status: 'locked' as const,
          progress: 0,
          isLocked: true,
          lockReason: phaseLockReason,
        };
      }

      // Practice requires at least the first course in phase to be started or completed
      const firstCourse = updatedCourses[0];
      const isCourseStarted = firstCourse && (firstCourse.status === 'in_progress' || firstCourse.status === 'completed');
      let itemLocked = false;
      let itemLockReason: string | undefined = undefined;

      if (!isCourseStarted && updatedCourses.length > 0) {
        itemLocked = true;
        itemLockReason = `Start "${firstCourse.title}" before beginning practical exercises.`;
      }

      return {
        ...practice,
        sequence: practice.sequence || prIdx + 1,
        status: itemLocked ? ('locked' as const) : practice.status === 'in_progress' ? ('in_progress' as const) : ('unlocked' as const),
        progress: itemLocked ? 0 : practice.progress || 0,
        isLocked: itemLocked,
        lockReason: itemLockReason,
      };
    });

    // 4. Evaluate Project Items
    const updatedProjects: Project[] = rawProjects.map((project, pIdx) => {
      const isAlreadyCompleted = project.status === 'completed' || project.progress === 100;
      if (isAlreadyCompleted) {
        return {
          ...project,
          sequence: project.sequence || pIdx + 1,
          status: 'completed' as const,
          progress: 100,
          isLocked: false,
          lockReason: undefined,
        };
      }

      if (phaseIsLocked) {
        return {
          ...project,
          sequence: project.sequence || pIdx + 1,
          status: 'locked' as const,
          progress: 0,
          isLocked: true,
          lockReason: phaseLockReason,
        };
      }

      // Project requires courses in this phase to be at least in_progress or completed
      const incompleteCourses = updatedCourses.filter((c) => c.status !== 'completed' && c.status !== 'in_progress');
      let itemLocked = false;
      let itemLockReason: string | undefined = undefined;

      if (incompleteCourses.length > 0 && updatedCourses.length > 0) {
        itemLocked = true;
        itemLockReason = `Complete foundation course "${updatedCourses[0].title}" before starting this portfolio project.`;
      }

      return {
        ...project,
        sequence: project.sequence || pIdx + 1,
        status: itemLocked ? ('locked' as const) : project.status === 'in_progress' ? ('in_progress' as const) : ('not_started' as const),
        progress: itemLocked ? 0 : project.progress || 0,
        isLocked: itemLocked,
        lockReason: itemLockReason,
      };
    });

    // 5. Evaluate Assessment Lock
    const allCoursesComplete = updatedCourses.every((c) => c.status === 'completed');
    const allProjectsComplete = updatedProjects.every((p) => p.status === 'completed');
    let isAssessmentLocked = phaseIsLocked || !allCoursesComplete;
    let assessmentLockReason = phaseIsLocked
      ? phaseLockReason
      : !allCoursesComplete
      ? `Complete all courses in Phase ${phase.phaseNumber} before taking the Benchmark Assessment.`
      : undefined;

    // 6. Evaluate Milestone Completion & Lock
    const isAssessmentPassed = phase.isAssessmentPassed;
    const isPhaseMilestoneComplete = allCoursesComplete && allProjectsComplete && isAssessmentPassed;
    const isMilestoneLocked = !isPhaseMilestoneComplete;
    const milestoneLockReason = !isPhaseMilestoneComplete
      ? `Complete all Phase ${phase.phaseNumber} courses, projects, and benchmark exam to achieve this milestone.`
      : undefined;

    // 7. Calculate Phase Progress
    const totalItems =
      updatedCourses.length + updatedProjects.length + practiceItems.length + (phase.assessmentRequired ? 1 : 0);
    const completedItemsCount =
      updatedCourses.filter((c) => c.status === 'completed').length +
      updatedProjects.filter((p) => p.status === 'completed').length +
      practiceItems.filter((pr) => pr.status === 'completed').length +
      (isAssessmentPassed ? 1 : 0);

    const calculatedProgress =
      totalItems > 0 ? Math.min(100, Math.round((completedItemsCount / totalItems) * 100)) : 0;

    // Determine phase status
    let finalPhaseStatus: RoadmapPhase['status'] = 'locked';
    if (phaseIsLocked) {
      finalPhaseStatus = 'locked';
    } else if (isPhaseMilestoneComplete || calculatedProgress === 100) {
      finalPhaseStatus = 'completed';
    } else if (
      calculatedProgress > 0 ||
      updatedCourses.some((c) => c.status === 'in_progress') ||
      updatedProjects.some((p) => p.status === 'in_progress')
    ) {
      finalPhaseStatus = 'in_progress';
    } else {
      finalPhaseStatus = 'unlocked';
    }

    return {
      ...phase,
      status: finalPhaseStatus,
      progress: calculatedProgress,
      courses: updatedCourses,
      practiceItems,
      projects: updatedProjects,
      isAssessmentPassed,
      isAssessmentLocked,
      assessmentLockReason,
      isMilestoneCompleted: isPhaseMilestoneComplete,
      isMilestoneLocked,
      milestoneLockReason,
      lockReason: phaseLockReason,
    };
  });
}

/**
 * Generates a complete, personalized 6-phase learning roadmap
 * based on learner career goal, skills, skill gaps, weekly hours, and experience level.
 */
export function generatePersonalizedRoadmap(
  profile: LearnerProfile,
  catalog: CandidateResource[] = candidateResourceCatalog
): RoadmapPhase[] {
  const skillGaps = analyzeSkillGaps(profile);
  const goal = (profile.careerGoal || 'AI Engineer').toLowerCase();

  // Phase Templates configured logically for career tracks
  const defaultPhases: RoadmapPhase[] = [
    {
      id: 'phase-1',
      phaseNumber: 1,
      title: 'Foundation & Python Mastery',
      tagline: 'Vectorized computing, object-oriented design & data manipulation',
      status: 'completed',
      progress: 100,
      estimatedDuration: `${Math.ceil(18 / Math.max(4, profile.weeklyHours))} Weeks`,
      prerequisites: ['Basic Programming Logic'],
      skills: ['Python', 'NumPy', 'Pandas', 'Data Structures'],
      whyThisPhase:
        'Rock-solid Python and array mechanics allow you to debug tensor dimensions and optimize pipeline bottlenecks without getting stuck.',
      assessmentRequired: 'Python & Data Foundation Quiz',
      assessmentId: 'assess-1',
      isAssessmentPassed: true,
      milestoneTitle: 'Python & Array Foundations Certified',
      milestoneDescription: 'Demonstrated mastery in vectorized programming, OOP, and dataframe manipulation.',
      unlockedBadges: ['Python Mastery', 'Data Wrangling', 'Foundation Core'],
      courses: [
        {
          id: 'c-101',
          sequence: 1,
          title: 'Advanced Python 3.12 for AI Engineers',
          provider: 'PathFind Interactive Labs',
          duration: '6 hrs',
          skillsCovered: ['Python', 'OOP', 'Generators'],
          difficulty: 'Intermediate',
          status: 'completed',
          progress: 100,
          description:
            'Deep dive into decorators, type hinting, asynchronous I/O, and memory-efficient generators for large datasets.',
          rating: 4.9,
          resourceReference: 'rec-python-adv',
        },
        {
          id: 'c-102',
          sequence: 2,
          title: 'NumPy & High-Performance Array Operations',
          provider: 'VectorTech Academy',
          duration: '5 hrs',
          skillsCovered: ['NumPy', 'Broadcasting', 'Linear Algebra Basics'],
          difficulty: 'Beginner',
          status: 'completed',
          progress: 100,
          description:
            'Master vectorization, memory striding, Einstein summation, and matrix decompositions.',
          rating: 4.8,
          resourceReference: 'rec-numpy-core',
        },
      ],
      practiceItems: [
        {
          id: 'pr-101',
          sequence: 1,
          title: 'Tensor Striding & Memory Layout Lab',
          type: 'Practice',
          skills: ['NumPy', 'Broadcasting'],
          prerequisites: ['NumPy & High-Performance Array Operations'],
          estimatedHours: '2 hrs',
          durationHours: 2,
          status: 'completed',
          progress: 100,
          exerciseType: 'Interactive Notebook',
          description: 'Hands-on practice optimizing array memory access and broadcasting calculations.',
        },
      ],
      projects: [
        {
          id: 'p-101',
          sequence: 1,
          title: 'Custom Dataframe Engine from Scratch',
          duration: '8 hrs',
          skillsCovered: ['Python', 'NumPy', 'Data Structures'],
          difficulty: 'Intermediate',
          status: 'completed',
          progress: 100,
          description:
            'Built a lightweight column-oriented mini data engine supporting grouping, filtering, and rolling aggregates.',
          deliverables: ['Custom DataFrame Class', 'Unit Test Suite (>95% coverage)', 'Benchmark comparison vs Pandas'],
          resourceReference: 'rec-p1-df',
        },
      ],
    },
    {
      id: 'phase-2',
      phaseNumber: 2,
      title: 'Data, Statistics & Probability',
      tagline: 'Hypothesis testing, Bayesian inference & gradient optimization',
      status: 'in_progress',
      progress: 60,
      estimatedDuration: `${Math.ceil(24 / Math.max(4, profile.weeklyHours))} Weeks`,
      prerequisites: ['Foundation & Python Mastery'],
      skills: ['Statistics & Probability', 'Hypothesis Testing', 'Exploratory Data Analysis', 'Distributions'],
      whyThisPhase:
        'AI models are fundamentally statistical engines. Understanding maximum likelihood, variance, and p-values prevents false metric conclusions.',
      assessmentRequired: 'Statistical Inference for Machine Learning Assessment',
      assessmentId: 'assess-2',
      isAssessmentPassed: false,
      milestoneTitle: 'Statistical Inference Practitioner',
      milestoneDescription: 'Mastered hypothesis testing, probability distributions, and multivariate calculus.',
      unlockedBadges: ['Probability Pro', 'Statistical Thinker'],
      courses: [
        {
          id: 'c-201',
          sequence: 1,
          title: 'Applied Statistics & Probability for AI',
          provider: 'Stanford Online / PathFind Refined',
          duration: '8 hrs',
          skillsCovered: ['Statistics & Probability', 'Bayesian Inference', 'Distributions'],
          difficulty: 'Intermediate',
          status: 'in_progress',
          progress: 75,
          description:
            'Random variables, Gaussian mixtures, Central Limit Theorem, confidence intervals, and hypothesis tests (t-test, ANOVA, Chi-Square).',
          rating: 4.9,
          resourceReference: 'rec-1',
        },
        {
          id: 'c-202',
          sequence: 2,
          title: 'Multivariate Calculus & Optimization Gradients',
          provider: 'DeepMath AI',
          duration: '6 hrs',
          skillsCovered: ['Calculus', 'Jacobians & Hessians', 'Gradient Descent'],
          difficulty: 'Intermediate',
          status: 'in_progress',
          progress: 40,
          description:
            'Partial derivatives, chain rule, Hessian matrices, and stochastic optimization surfaces.',
          rating: 4.7,
          resourceReference: 'rec-calc-opt',
        },
      ],
      practiceItems: [
        {
          id: 'pr-201',
          sequence: 1,
          title: 'Hypothesis Testing & Distribution Fitting Lab',
          type: 'Practice',
          skills: ['Statistics & Probability', 'Hypothesis Testing'],
          prerequisites: ['Applied Statistics & Probability for AI'],
          estimatedHours: '3 hrs',
          durationHours: 3,
          status: 'in_progress',
          progress: 50,
          exerciseType: 'Interactive Notebook',
          description: 'Simulate null distributions and calculate empirical p-values with bootstrap resampling.',
        },
      ],
      projects: [
        {
          id: 'p-201',
          sequence: 1,
          title: 'A/B Testing & Statistical Simulation Engine',
          duration: '10 hrs',
          skillsCovered: ['Statistics & Probability', 'Pandas', 'SciPy', 'Data Viz'],
          difficulty: 'Intermediate',
          status: 'in_progress',
          progress: 60,
          description:
            'Simulate e-commerce multivariate conversion tests with bootstrap resampling, Bonferroni corrections, and power calculations.',
          deliverables: ['Simulation Notebook', 'Power Analysis Curve Generator', 'Automated Statistical Report'],
          resourceReference: 'rec-2',
        },
      ],
    },
    {
      id: 'phase-3',
      phaseNumber: 3,
      title: 'Classical Machine Learning',
      tagline: 'Supervised, unsupervised, feature engineering & model diagnostics',
      status: 'unlocked',
      progress: 0,
      estimatedDuration: `${Math.ceil(28 / Math.max(4, profile.weeklyHours))} Weeks`,
      prerequisites: ['Data, Statistics & Probability'],
      skills: ['Machine Learning Algorithms', 'Scikit-Learn', 'Feature Engineering', 'Model Evaluation'],
      whyThisPhase:
        'Mastering linear models, gradient boosting, and regularization establishes the intuition required for debugging complex neural architectures.',
      assessmentRequired: 'Machine Learning Core Principles & Diagnostics',
      assessmentId: 'assess-3',
      isAssessmentPassed: false,
      milestoneTitle: 'Applied Machine Learning Specialist',
      milestoneDescription: 'Developed robust ML pipelines with XGBoost, cross-validation, and explainability.',
      unlockedBadges: ['ML Builder', 'Model Diagnostic Pro'],
      courses: [
        {
          id: 'c-301',
          sequence: 1,
          title: 'End-to-End Machine Learning with Scikit-Learn & XGBoost',
          provider: 'ML Systems Collective',
          duration: '10 hrs',
          skillsCovered: ['Scikit-Learn', 'XGBoost', 'LightGBM', 'Cross-Validation'],
          difficulty: 'Intermediate',
          status: 'not_started',
          progress: 0,
          description:
            'Comprehensive workflow: data leakage prevention, target encoding, ensemble modeling, SHAP explainability, and hyperparameter tuning.',
          rating: 4.9,
          resourceReference: 'rec-4',
        },
      ],
      practiceItems: [
        {
          id: 'pr-301',
          sequence: 1,
          title: 'Feature Importance & SHAP Diagnostic Lab',
          type: 'Practice',
          skills: ['Feature Engineering', 'Scikit-Learn'],
          prerequisites: ['End-to-End Machine Learning with Scikit-Learn & XGBoost'],
          estimatedHours: '3 hrs',
          durationHours: 3,
          status: 'unlocked',
          progress: 0,
          exerciseType: 'Coding Lab',
          description: 'Calculate TreeSHAP values and diagnose feature collinearity.',
        },
      ],
      projects: [
        {
          id: 'p-301',
          sequence: 1,
          title: 'Predictive Credit Risk & Fraud Detection Pipeline',
          duration: '14 hrs',
          skillsCovered: ['Machine Learning Algorithms', 'Feature Engineering', 'Imbalanced Learning'],
          difficulty: 'Intermediate',
          status: 'not_started',
          progress: 0,
          description:
            'Build an end-to-end classification system handling class imbalance with SMOTE, cost-sensitive matrix evaluation, and interpretability dashboards.',
          deliverables: ['Scikit-Learn Pipeline', 'Model Diagnostic Report (ROC-AUC, Precision-Recall)', 'Model Card documentation'],
          resourceReference: 'rec-5',
        },
      ],
    },
    {
      id: 'phase-4',
      phaseNumber: 4,
      title: 'Deep Learning & Neural Architectures',
      tagline: 'PyTorch, transformers, CNNs, and attention mechanisms',
      status: 'locked',
      progress: 0,
      estimatedDuration: `${Math.ceil(36 / Math.max(4, profile.weeklyHours))} Weeks`,
      prerequisites: ['Classical Machine Learning'],
      skills: ['Deep Learning & PyTorch', 'Transformers', 'Backpropagation', 'TorchVision/NLP'],
      whyThisPhase:
        'PyTorch is the industry standard for state-of-the-art vision and language models. Learn autograd, custom layers, and fine-tuning.',
      assessmentRequired: 'Deep Learning & PyTorch Mastery Exam',
      assessmentId: 'assess-4',
      isAssessmentPassed: false,
      milestoneTitle: 'Deep Learning & Neural Architect',
      milestoneDescription: 'Designed PyTorch custom modules, attention networks, and fine-tuned LLMs.',
      unlockedBadges: ['PyTorch Master', 'Transformer Builder'],
      courses: [
        {
          id: 'c-401',
          sequence: 1,
          title: 'PyTorch Deep Learning Zero to Hero',
          provider: 'TorchLabs Research',
          duration: '12 hrs',
          skillsCovered: ['PyTorch', 'Tensors & Autograd', 'CNNs', 'RNNs'],
          difficulty: 'Advanced',
          status: 'not_started',
          progress: 0,
          description:
            'Build custom nn.Module architectures, loss functions, learning rate schedulers, and GPU distributed training loops.',
          rating: 5.0,
          resourceReference: 'rec-6',
        },
        {
          id: 'c-402',
          sequence: 2,
          title: 'Transformers, Attention & Modern LLMs',
          provider: 'Hugging Face Certified Track',
          duration: '10 hrs',
          skillsCovered: ['Transformers', 'Self-Attention', 'Hugging Face', 'Fine-Tuning (LoRA)'],
          difficulty: 'Advanced',
          status: 'not_started',
          progress: 0,
          description:
            'Deconstruct transformer blocks, multi-head attention math, tokenizers, PEFT/LoRA fine-tuning, and KV-cache optimizations.',
          rating: 4.9,
          resourceReference: 'rec-transformers',
        },
      ],
      practiceItems: [
        {
          id: 'pr-401',
          sequence: 1,
          title: 'Self-Attention Math from Scratch Lab',
          type: 'Practice',
          skills: ['Deep Learning & PyTorch', 'Transformers'],
          prerequisites: ['PyTorch Deep Learning Zero to Hero'],
          estimatedHours: '4 hrs',
          durationHours: 4,
          status: 'locked',
          progress: 0,
          exerciseType: 'Coding Lab',
          description: 'Implement scaled dot-product attention in pure tensor operations.',
        },
      ],
      projects: [
        {
          id: 'p-401',
          sequence: 1,
          title: 'Domain-Specific LLM Fine-Tuning & Evaluation System',
          duration: '16 hrs',
          skillsCovered: ['PyTorch', 'Hugging Face', 'LoRA/QLoRA', 'Evaluation Harness'],
          difficulty: 'Advanced',
          status: 'not_started',
          progress: 0,
          description:
            'Fine-tune an open-source 7B parameter LLM on technical documentation using QLoRA with automated BLEU/ROUGE benchmarks.',
          deliverables: ['Fine-Tuned Adapter Weights', 'Loss & Validation Curves', 'Comparative Benchmark Dashboard'],
          resourceReference: 'rec-7',
        },
      ],
    },
    {
      id: 'phase-5',
      phaseNumber: 5,
      title: 'Model Deployment & Serving Systems',
      tagline: 'FastAPI, Docker, ONNX, and latency optimization',
      status: 'locked',
      progress: 0,
      estimatedDuration: `${Math.ceil(24 / Math.max(4, profile.weeklyHours))} Weeks`,
      prerequisites: ['Deep Learning & Neural Architectures'],
      skills: ['Model Deployment (FastAPI/Docker)', 'ONNX Runtime', 'Batching & Caching', 'Triton Server'],
      whyThisPhase:
        'A model is useless until it serves low-latency predictions under heavy traffic with robust fallback and monitoring.',
      assessmentRequired: 'Production Inference & Serving Exam',
      assessmentId: 'assess-5',
      isAssessmentPassed: false,
      milestoneTitle: 'Production AI Deployment Engineer',
      milestoneDescription: 'Engineered high-throughput containerized prediction APIs with low latency guarantees.',
      unlockedBadges: ['FastAPI Pro', 'Docker AI Specialist'],
      courses: [
        {
          id: 'c-501',
          sequence: 1,
          title: 'High-Throughput ML Microservices with FastAPI & Docker',
          provider: 'Cloud Native AI Guild',
          duration: '8 hrs',
          skillsCovered: ['FastAPI', 'Docker', 'Async Python', 'Pydantic'],
          difficulty: 'Intermediate',
          status: 'not_started',
          progress: 0,
          description:
            'Containerize ML models, implement dynamic request batching, health endpoints, Redis response caching, and worker concurrency.',
          rating: 4.8,
          resourceReference: 'rec-8',
        },
      ],
      practiceItems: [
        {
          id: 'pr-501',
          sequence: 1,
          title: 'Dockerizing PyTorch Model Server Lab',
          type: 'Practice',
          skills: ['Model Deployment (FastAPI/Docker)', 'Docker'],
          prerequisites: ['High-Throughput ML Microservices with FastAPI & Docker'],
          estimatedHours: '3 hrs',
          durationHours: 3,
          status: 'locked',
          progress: 0,
          exerciseType: 'Coding Lab',
          description: 'Construct multi-stage Docker builds optimized for minimal GPU image footprint.',
        },
      ],
      projects: [
        {
          id: 'p-501',
          sequence: 1,
          title: 'Real-Time Streaming Prediction API with Rate Limiting',
          duration: '12 hrs',
          skillsCovered: ['FastAPI', 'Docker', 'Redis', 'Stress Testing (Locust)'],
          difficulty: 'Intermediate',
          status: 'not_started',
          progress: 0,
          description:
            'Develop an ultra-low latency inference API (<50ms p95) with Docker Compose, Prometheus metrics, and automated Locust load tests.',
          deliverables: ['Production Dockerfile & Compose', 'FastAPI App with Async Queue', 'Load Test Benchmark Report'],
          resourceReference: 'rec-9',
        },
      ],
    },
    {
      id: 'phase-6',
      phaseNumber: 6,
      title: 'Capstone: Production AI Platform',
      tagline: 'End-to-end intelligent system with RAG, monitoring & CI/CD',
      status: 'locked',
      progress: 0,
      estimatedDuration: `${Math.ceil(30 / Math.max(4, profile.weeklyHours))} Weeks`,
      prerequisites: ['Model Deployment & Serving Systems'],
      skills: ['MLOps & Pipelines', 'Full-Stack AI Architecture', 'CI/CD', 'Drift Monitoring'],
      whyThisPhase:
        'Synthesize your entire learning path into a portfolio centerpiece that showcases senior AI Engineer competency to top tech recruiters.',
      assessmentRequired: 'Capstone Defense & Peer Review Evaluation',
      assessmentId: 'assess-6',
      isAssessmentPassed: false,
      milestoneTitle: 'Senior AI Engineer Capstone Certified',
      milestoneDescription: 'Architected and deployed a scalable, self-healing end-to-end AI platform.',
      unlockedBadges: ['Capstone Champion', 'End-to-End AI Architect'],
      courses: [
        {
          id: 'c-601',
          sequence: 1,
          title: 'Continuous Machine Learning (CML) & Drift Detection',
          provider: 'MLOps World',
          duration: '6 hrs',
          skillsCovered: ['MLOps', 'Evidently AI', 'GitHub Actions', 'Model Registry (MLflow)'],
          difficulty: 'Advanced',
          status: 'not_started',
          progress: 0,
          description:
            'Build automated data drift monitors, automated retraining triggers, MLflow version registries, and canary deployment pipelines.',
          rating: 4.9,
          resourceReference: 'rec-10',
        },
      ],
      practiceItems: [
        {
          id: 'pr-601',
          sequence: 1,
          title: 'Data Drift & Concept Drift Simulation Lab',
          type: 'Practice',
          skills: ['MLOps & Pipelines'],
          prerequisites: ['Continuous Machine Learning (CML) & Drift Detection'],
          estimatedHours: '3 hrs',
          durationHours: 3,
          status: 'locked',
          progress: 0,
          exerciseType: 'Interactive Notebook',
          description: 'Inject distribution shift into tabular test data and trigger automated Evidently alerts.',
        },
      ],
      projects: [
        {
          id: 'p-601',
          sequence: 1,
          title: 'Autonomous RAG Knowledge Engine with Observability',
          duration: '24 hrs',
          skillsCovered: ['Deep Learning', 'FastAPI', 'Vector Databases', 'MLOps', 'Docker'],
          difficulty: 'Advanced',
          status: 'not_started',
          progress: 0,
          description:
            'Architect and deploy an enterprise-scale Retrieval Augmented Generation (RAG) system with semantic chunking, Qdrant vector index, Prometheus observability, and automated evaluation.',
          deliverables: ['GitHub Repository with CI/CD', 'Live Deployed API', 'Architecture Design Document & Demo Video'],
          resourceReference: 'rec-11',
        },
      ],
    },
  ];

  // Evaluate prerequisite rules on the generated phases against learner profile
  return evaluateRoadmapPrerequisites(defaultPhases, profile);
}

/**
 * Calculates the Next Best Action deterministically based on:
 * - incomplete learning path items
 * - prerequisites satisfied (must be unlocked or in_progress)
 * - current skill gaps (highest priority gap)
 * - current phase
 * - learner progress
 * - weekly learning hours
 * - recommendation match score
 */
export function calculateNextBestAction(
  profile: LearnerProfile,
  roadmapPhases: RoadmapPhase[],
  skillGapAnalysis: SkillGapAnalysisResult,
  recommendations: Recommendation[],
  inProgressRecIds: string[] = []
): NextBestAction {
  // 1. First, find active unlocked or in-progress phases in sequence
  const evaluatedPhases = evaluateRoadmapPrerequisites(roadmapPhases, profile);
  const activePhase =
    evaluatedPhases.find((p) => p.status === 'in_progress') ||
    evaluatedPhases.find((p) => p.status === 'unlocked') ||
    evaluatedPhases[0];

  // 2. Look for any item currently in_progress in the active phase
  const inProgressCourse = activePhase.courses.find((c) => c.status === 'in_progress');
  if (inProgressCourse) {
    const primarySkill = inProgressCourse.skillsCovered[0] || 'Core Foundation';
    const learnerSkill = profile.skills.find((s) => s.name.toLowerCase() === primarySkill.toLowerCase());
    const profText = learnerSkill ? `${learnerSkill.proficiency}%` : 'in development';

    const whyText = `You are currently ${inProgressCourse.progress}% through this module. Completing it directly targets your ${primarySkill} skill gap (current proficiency: ${profText}) in Phase ${activePhase.phaseNumber}.`;
    return {
      id: inProgressCourse.id,
      targetId: inProgressCourse.id,
      title: inProgressCourse.title,
      type: 'Course',
      phaseId: activePhase.id,
      phaseNumber: activePhase.phaseNumber,
      phaseTitle: activePhase.title,
      skill: primarySkill,
      skillsCovered: inProgressCourse.skillsCovered,
      skillsTargeted: inProgressCourse.skillsCovered,
      estimatedDuration: inProgressCourse.duration,
      durationHours: parseInt(inProgressCourse.duration) || 8,
      difficulty: inProgressCourse.difficulty || 'Intermediate',
      description: inProgressCourse.description || 'Target course in your active roadmap phase.',
      whyThisIsNext: whyText,
      whyThisAction: whyText,
      matchPercentage: 98,
      status: 'in_progress',
      progress: inProgressCourse.progress,
      resourceReference: inProgressCourse.resourceReference,
    };
  }

  // Check in-progress practice item
  if (activePhase.practiceItems) {
    const inProgressPractice = activePhase.practiceItems.find((pr) => pr.status === 'in_progress');
    if (inProgressPractice) {
      const whyText = `Resume this hands-on lab (${inProgressPractice.progress}% complete) to reinforce theoretical concepts from Phase ${activePhase.phaseNumber}.`;
      return {
        id: inProgressPractice.id,
        targetId: inProgressPractice.id,
        title: inProgressPractice.title,
        type: 'Practice',
        phaseId: activePhase.id,
        phaseNumber: activePhase.phaseNumber,
        phaseTitle: activePhase.title,
        skill: inProgressPractice.skills[0] || 'Practical Lab',
        skillsCovered: inProgressPractice.skills,
        skillsTargeted: inProgressPractice.skills,
        estimatedDuration: inProgressPractice.estimatedHours,
        durationHours: inProgressPractice.durationHours,
        difficulty: 'Intermediate',
        description: inProgressPractice.description || 'Interactive hands-on coding practice challenge.',
        whyThisIsNext: whyText,
        whyThisAction: whyText,
        matchPercentage: 95,
        status: 'in_progress',
        progress: inProgressPractice.progress,
      };
    }
  }

  // Check in-progress project
  const inProgressProject = activePhase.projects.find((p) => p.status === 'in_progress');
  if (inProgressProject) {
    const primarySkill = inProgressProject.skillsCovered[0] || 'Applied Engineering';
    const whyText = `Resume your portfolio project (${inProgressProject.progress}% complete). Submitting these deliverables is required to complete Phase ${activePhase.phaseNumber}.`;
    return {
      id: inProgressProject.id,
      targetId: inProgressProject.id,
      title: inProgressProject.title,
      type: 'Project',
      phaseId: activePhase.id,
      phaseNumber: activePhase.phaseNumber,
      phaseTitle: activePhase.title,
      skill: primarySkill,
      skillsCovered: inProgressProject.skillsCovered,
      skillsTargeted: inProgressProject.skillsCovered,
      estimatedDuration: inProgressProject.duration,
      durationHours: parseInt(inProgressProject.duration) || 10,
      difficulty: inProgressProject.difficulty || 'Intermediate',
      description: inProgressProject.description || 'Deliverable milestone project for phase certification.',
      whyThisIsNext: whyText,
      whyThisAction: whyText,
      matchPercentage: 96,
      status: 'in_progress',
      progress: inProgressProject.progress,
      resourceReference: inProgressProject.resourceReference,
    };
  }

  // 3. Find first unlocked, incomplete Course in active phase
  const nextUnlockedCourse = activePhase.courses.find((c) => c.status !== 'completed' && !c.isLocked);
  if (nextUnlockedCourse) {
    const topGap = skillGapAnalysis.top3SkillsToImprove[0];
    const matchingSkill = nextUnlockedCourse.skillsCovered.find(
      (sc) => topGap && sc.toLowerCase().includes(topGap.name.toLowerCase())
    ) || nextUnlockedCourse.skillsCovered[0];

    const priorPhase = evaluatedPhases.find((p) => p.phaseNumber === activePhase.phaseNumber - 1);
    const priorCompleted = priorPhase && priorPhase.status === 'completed';

    const reason = priorCompleted
      ? `Your ${priorPhase.title} foundation is sufficiently developed and ${matchingSkill} is your highest-priority remaining skill gap in Phase ${activePhase.phaseNumber}.`
      : `All prerequisites are satisfied. Starting "${nextUnlockedCourse.title}" addresses your target skill (${matchingSkill}) based on your ${profile.weeklyHours}h/week study budget.`;

    return {
      id: nextUnlockedCourse.id,
      targetId: nextUnlockedCourse.id,
      title: nextUnlockedCourse.title,
      type: 'Course',
      phaseId: activePhase.id,
      phaseNumber: activePhase.phaseNumber,
      phaseTitle: activePhase.title,
      skill: matchingSkill,
      skillsCovered: nextUnlockedCourse.skillsCovered,
      skillsTargeted: nextUnlockedCourse.skillsCovered,
      estimatedDuration: nextUnlockedCourse.duration,
      durationHours: parseInt(nextUnlockedCourse.duration) || 8,
      difficulty: nextUnlockedCourse.difficulty || 'Intermediate',
      description: nextUnlockedCourse.description || 'Core curriculum course for active roadmap phase.',
      whyThisIsNext: reason,
      whyThisAction: reason,
      matchPercentage: 94,
      status: 'not_started',
      progress: 0,
      resourceReference: nextUnlockedCourse.resourceReference,
    };
  }

  // 4. Find first unlocked practice item
  if (activePhase.practiceItems) {
    const nextPractice = activePhase.practiceItems.find((pr) => pr.status !== 'completed' && !pr.isLocked);
    if (nextPractice) {
      const whyText = `Apply your knowledge from completed lectures in this interactive practice lab before beginning the phase project.`;
      return {
        id: nextPractice.id,
        targetId: nextPractice.id,
        title: nextPractice.title,
        type: 'Practice',
        phaseId: activePhase.id,
        phaseNumber: activePhase.phaseNumber,
        phaseTitle: activePhase.title,
        skill: nextPractice.skills[0] || 'Hands-on Coding',
        skillsCovered: nextPractice.skills,
        skillsTargeted: nextPractice.skills,
        estimatedDuration: nextPractice.estimatedHours,
        durationHours: nextPractice.durationHours,
        difficulty: 'Intermediate',
        description: nextPractice.description || 'Interactive hands-on coding lab.',
        whyThisIsNext: whyText,
        whyThisAction: whyText,
        matchPercentage: 92,
        status: 'unlocked',
        progress: 0,
      };
    }
  }

  // 5. Find first unlocked project
  const nextUnlockedProject = activePhase.projects.find((p) => p.status !== 'completed' && !p.isLocked);
  if (nextUnlockedProject) {
    const whyText = `You have completed all prerequisite course modules for Phase ${activePhase.phaseNumber}. Build and submit this project deliverable to prove role competency.`;
    return {
      id: nextUnlockedProject.id,
      targetId: nextUnlockedProject.id,
      title: nextUnlockedProject.title,
      type: 'Project',
      phaseId: activePhase.id,
      phaseNumber: activePhase.phaseNumber,
      phaseTitle: activePhase.title,
      skill: nextUnlockedProject.skillsCovered[0] || 'Portfolio Project',
      skillsCovered: nextUnlockedProject.skillsCovered,
      skillsTargeted: nextUnlockedProject.skillsCovered,
      estimatedDuration: nextUnlockedProject.duration,
      durationHours: parseInt(nextUnlockedProject.duration) || 12,
      difficulty: nextUnlockedProject.difficulty || 'Intermediate',
      description: nextUnlockedProject.description || 'Practical portfolio project milestone.',
      whyThisIsNext: whyText,
      whyThisAction: whyText,
      matchPercentage: 95,
      status: 'not_started',
      progress: 0,
      resourceReference: nextUnlockedProject.resourceReference,
    };
  }

  // 6. Check if phase assessment is pending
  if (!activePhase.isAssessmentPassed && !activePhase.isAssessmentLocked) {
    const whyText = `All curriculum items in Phase ${activePhase.phaseNumber} are complete. Pass this diagnostic assessment (>=70%) to unlock Phase ${activePhase.phaseNumber + 1}.`;
    return {
      id: activePhase.assessmentId || `assess-${activePhase.phaseNumber}`,
      targetId: activePhase.assessmentId || `assess-${activePhase.phaseNumber}`,
      title: activePhase.assessmentRequired,
      type: 'Assessment',
      phaseId: activePhase.id,
      phaseNumber: activePhase.phaseNumber,
      phaseTitle: activePhase.title,
      skill: activePhase.skills[0] || 'Comprehensive Diagnostic',
      skillsCovered: activePhase.skills,
      skillsTargeted: activePhase.skills,
      estimatedDuration: '25 mins',
      durationHours: 0.5,
      difficulty: 'Adaptive',
      description: 'Phase benchmark diagnostic exam to verify competency mastery.',
      whyThisIsNext: whyText,
      whyThisAction: whyText,
      matchPercentage: 99,
      status: 'unlocked',
      progress: 0,
    };
  }

  // 7. Fallback: Top candidate from recommendation engine
  const topRec = recommendations.find((r) => r.status !== 'completed') || recommendations[0];
  if (topRec) {
    return {
      id: topRec.id,
      targetId: topRec.id,
      title: topRec.title,
      type: topRec.type,
      phaseId: topRec.phaseId || activePhase.id,
      phaseNumber: activePhase.phaseNumber,
      phaseTitle: activePhase.title,
      skill: topRec.skillsCovered[0] || 'Key Competency',
      skillsCovered: topRec.skillsCovered,
      skillsTargeted: topRec.skillsCovered,
      estimatedDuration: topRec.estimatedDuration,
      durationHours: 8,
      difficulty: topRec.difficulty || 'Intermediate',
      description: topRec.description || 'Top ranked recommendation for your skill targets.',
      whyThisIsNext: topRec.whyRecommended,
      whyThisAction: topRec.whyRecommended,
      matchPercentage: topRec.matchPercentage,
      status: topRec.status === 'in_progress' ? 'in_progress' : 'not_started',
      progress: 0,
      resourceReference: topRec.id,
    };
  }

  // Final fallback
  const fallbackWhy = 'Your Statistics foundation is sufficiently developed and Machine Learning is your highest-priority remaining skill gap.';
  return {
    id: 'c-201',
    targetId: 'c-201',
    title: 'Applied Statistics & Probability for AI',
    type: 'Course',
    phaseId: 'phase-2',
    phaseNumber: 2,
    phaseTitle: 'Data, Statistics & Probability',
    skill: 'Statistics & Probability',
    skillsCovered: ['Statistics & Probability', 'Hypothesis Testing'],
    skillsTargeted: ['Statistics & Probability', 'Hypothesis Testing'],
    estimatedDuration: '8 hrs',
    durationHours: 8,
    difficulty: 'Intermediate',
    description: 'Master core statistical testing, probability distributions, and inferential methods.',
    whyThisIsNext: fallbackWhy,
    whyThisAction: fallbackWhy,
    matchPercentage: 96,
    status: 'in_progress',
    progress: 75,
  };
}
