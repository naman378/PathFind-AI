import { SkillCategory } from '../types';

export interface RequiredSkillBenchmark {
  name: string;
  category: SkillCategory;
  requiredProficiency: number; // 0-100
  careerImportance: number; // 0-1 (e.g. 0.95 = critical core skill)
  prerequisites?: string[];
  isPrerequisiteFor?: string[];
}

export interface CareerRoleBenchmark {
  roleName: string;
  aliases: string[];
  description: string;
  requiredSkills: RequiredSkillBenchmark[];
}

export const careerBenchmarks: CareerRoleBenchmark[] = [
  {
    roleName: 'AI Engineer',
    aliases: [
      'ai engineer',
      'machine learning engineer',
      'senior machine learning & ai systems engineer',
      'ai systems engineer',
      'ai/ml engineer',
      'artificial intelligence',
    ],
    description: 'Builds end-to-end AI applications, trains deep learning architectures, optimizes inference, and deploys scalable models to production.',
    requiredSkills: [
      {
        name: 'Python',
        category: 'Foundation',
        requiredProficiency: 90,
        careerImportance: 0.95,
        prerequisites: [],
        isPrerequisiteFor: ['NumPy', 'Pandas', 'Machine Learning Algorithms', 'Deep Learning & PyTorch', 'Model Deployment (FastAPI/Docker)'],
      },
      {
        name: 'NumPy',
        category: 'Foundation',
        requiredProficiency: 85,
        careerImportance: 0.85,
        prerequisites: ['Python'],
        isPrerequisiteFor: ['Pandas', 'Statistics & Probability', 'Machine Learning Algorithms'],
      },
      {
        name: 'Pandas',
        category: 'Foundation',
        requiredProficiency: 85,
        careerImportance: 0.85,
        prerequisites: ['Python', 'NumPy'],
        isPrerequisiteFor: ['Machine Learning Algorithms'],
      },
      {
        name: 'Statistics & Probability',
        category: 'Math & Stats',
        requiredProficiency: 85,
        careerImportance: 0.95,
        prerequisites: ['Python', 'NumPy'],
        isPrerequisiteFor: ['Machine Learning Algorithms', 'Deep Learning & PyTorch'],
      },
      {
        name: 'Machine Learning Algorithms',
        category: 'Machine Learning',
        requiredProficiency: 85,
        careerImportance: 0.95,
        prerequisites: ['Python', 'NumPy', 'Pandas', 'Statistics & Probability'],
        isPrerequisiteFor: ['Deep Learning & PyTorch', 'Model Deployment (FastAPI/Docker)'],
      },
      {
        name: 'Deep Learning & PyTorch',
        category: 'Deep Learning',
        requiredProficiency: 80,
        careerImportance: 0.90,
        prerequisites: ['Python', 'Machine Learning Algorithms', 'Statistics & Probability'],
        isPrerequisiteFor: ['Transformers & LLMs', 'MLOps & Pipelines'],
      },
      {
        name: 'Model Deployment (FastAPI/Docker)',
        category: 'MLOps & Systems',
        requiredProficiency: 75,
        careerImportance: 0.85,
        prerequisites: ['Python', 'Machine Learning Algorithms'],
        isPrerequisiteFor: ['MLOps & Pipelines'],
      },
      {
        name: 'MLOps & Pipelines',
        category: 'MLOps & Systems',
        requiredProficiency: 70,
        careerImportance: 0.80,
        prerequisites: ['Model Deployment (FastAPI/Docker)'],
        isPrerequisiteFor: [],
      },
    ],
  },
  {
    roleName: 'Data Scientist',
    aliases: ['data scientist', 'data science', 'applied scientist'],
    description: 'Extracts actionable insights from data, tests hypotheses, develops statistical models, and communicates business value.',
    requiredSkills: [
      {
        name: 'Python',
        category: 'Foundation',
        requiredProficiency: 85,
        careerImportance: 0.90,
        prerequisites: [],
        isPrerequisiteFor: ['NumPy', 'Pandas', 'Statistics & Probability'],
      },
      {
        name: 'Pandas',
        category: 'Foundation',
        requiredProficiency: 90,
        careerImportance: 0.95,
        prerequisites: ['Python'],
        isPrerequisiteFor: ['Exploratory Data Analysis', 'Machine Learning Algorithms'],
      },
      {
        name: 'Statistics & Probability',
        category: 'Math & Stats',
        requiredProficiency: 90,
        careerImportance: 0.98,
        prerequisites: ['Python'],
        isPrerequisiteFor: ['Machine Learning Algorithms', 'A/B Testing'],
      },
      {
        name: 'Machine Learning Algorithms',
        category: 'Machine Learning',
        requiredProficiency: 80,
        careerImportance: 0.90,
        prerequisites: ['Statistics & Probability', 'Pandas'],
        isPrerequisiteFor: [],
      },
      {
        name: 'Data Visualization & Storytelling',
        category: 'Foundation',
        requiredProficiency: 85,
        careerImportance: 0.85,
        prerequisites: ['Pandas'],
        isPrerequisiteFor: [],
      },
      {
        name: 'SQL & Database Querying',
        category: 'Foundation',
        requiredProficiency: 85,
        careerImportance: 0.90,
        prerequisites: [],
        isPrerequisiteFor: [],
      },
    ],
  },
  {
    roleName: 'MLOps Engineer',
    aliases: ['mlops engineer', 'machine learning operations', 'ml infrastructure engineer'],
    description: 'Designs reliable automated CI/CD for machine learning, model monitoring, feature stores, and containerized serving infrastructure.',
    requiredSkills: [
      {
        name: 'Python',
        category: 'Foundation',
        requiredProficiency: 90,
        careerImportance: 0.95,
        prerequisites: [],
        isPrerequisiteFor: ['Model Deployment (FastAPI/Docker)', 'MLOps & Pipelines'],
      },
      {
        name: 'Model Deployment (FastAPI/Docker)',
        category: 'MLOps & Systems',
        requiredProficiency: 90,
        careerImportance: 0.98,
        prerequisites: ['Python'],
        isPrerequisiteFor: ['MLOps & Pipelines'],
      },
      {
        name: 'MLOps & Pipelines',
        category: 'MLOps & Systems',
        requiredProficiency: 90,
        careerImportance: 0.98,
        prerequisites: ['Model Deployment (FastAPI/Docker)'],
        isPrerequisiteFor: [],
      },
      {
        name: 'Machine Learning Algorithms',
        category: 'Machine Learning',
        requiredProficiency: 75,
        careerImportance: 0.80,
        prerequisites: ['Python'],
        isPrerequisiteFor: [],
      },
      {
        name: 'Linux & Cloud Infrastructure',
        category: 'MLOps & Systems',
        requiredProficiency: 85,
        careerImportance: 0.90,
        prerequisites: [],
        isPrerequisiteFor: ['MLOps & Pipelines'],
      },
    ],
  },
];

export function getBenchmarkForRole(careerGoalOrRole: string): CareerRoleBenchmark {
  const normalized = (careerGoalOrRole || '').toLowerCase().trim();
  const matched = careerBenchmarks.find(
    (b) =>
      b.roleName.toLowerCase() === normalized ||
      b.aliases.some((alias) => normalized.includes(alias) || alias.includes(normalized))
  );

  if (matched) {
    return matched;
  }

  // Default to AI Engineer standard benchmark
  return careerBenchmarks[0];
}
