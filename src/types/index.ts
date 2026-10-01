export type UserRole = 'candidate' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  education: string;
  branch: string;
  targetRole: string;
  experienceLevel: string;
  skills: string[];
  resumeText: string;
  avatarUrl?: string;
  bio?: string;
}

export type InterviewType =
  | 'Technical & Behavioral Mixed'
  | 'Technical Deep Dive'
  | 'Behavioral (STAR)'
  | 'HR & Culture Fit'
  | 'Situational & Leadership'
  | 'System Design'
  | 'Live Coding Challenge';

export type CompanyType =
  | 'FAANG / Tier-1 Tech'
  | 'High-Growth Startup'
  | 'Enterprise & Fintech'
  | 'Consulting & Digital';

export type DifficultyLevel = 'Standard' | 'Challenging' | 'Bar-Raiser';

export type InterviewerPersona =
  | 'Alex Vance (Friendly Mentor)'
  | 'Elena Rostova (Strict Bar-Raiser)'
  | 'David Park (Principal Architect)'
  | 'Sarah Jenkins (Culture & People Lead)';

export interface InterviewConfig {
  role: string;
  companyType: CompanyType;
  experienceLevel: string;
  difficulty: DifficultyLevel;
  interviewType: InterviewType;
  persona: InterviewerPersona;
  language: string;
  numQuestions: number;
  enableVideo: boolean;
  enableVoice: boolean;
  enableBodyLanguage: boolean;
}

export interface RubricParameters {
  relevance: number;
  accuracy: number;
  clarity: number;
  confidence: number;
  completeness: number;
  communication: number;
  technicalKnowledge: number;
  problemSolving: number;
  structure: number;
}

export interface ModelAnswerBreakdown {
  situation?: string;
  task?: string;
  action?: string;
  result?: string;
  fullText: string;
}

export interface AnswerEvaluation {
  overallScore: number;
  parameters: RubricParameters;
  summary: string;
  strengths: string[];
  missingPoints: string[];
  improvementTips: string[];
  modelAnswer: ModelAnswerBreakdown;
  followUpQuestion?: string;
  communicationFeedback: string;
  attemptNumber: number;
  timestamp: string;
  metrics: {
    wpm: number;
    fillerCount: number;
    durationSeconds: number;
    eyeContactScore: number;
  };
}

export interface InterviewQuestionItem {
  id: string;
  question: string;
  category: string;
  difficulty: string;
  context: string;
  expectedKeyPoints: string[];
  modelAnswer?: string;
  timeLimitSeconds: number;
  userAnswer?: string;
  evaluation?: AnswerEvaluation;
  previousAttempts?: Array<{
    attemptNumber: number;
    answer: string;
    evaluation: AnswerEvaluation;
  }>;
}

export interface DayPlanItem {
  day: number;
  title: string;
  focus: string;
  timeCommitment: string;
  tasks: string[];
  recommendedResources: string[];
}

export interface SessionReport {
  id: string;
  createdAt: string;
  role: string;
  companyType: string;
  difficulty: string;
  persona: string;
  overallScore: number;
  parameters: RubricParameters;
  questions: InterviewQuestionItem[];
  metrics: {
    totalDurationSeconds: number;
    avgWpm: number;
    totalFillers: number;
    eyeContactPercentage: number;
  };
  improvementPlan?: DayPlanItem[];
  motivationalAdvice?: string;
  retriedQuestionsCount?: number;
}

export interface CodingChallenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  timeLimit: number; // minutes
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  starterCode: Record<string, string>;
  testCases: Array<{
    input: string;
    expected: string;
  }>;
  hints: string[];
}

export interface AptitudeQuestion {
  id: string;
  category: 'Quantitative' | 'Logical Reasoning' | 'Verbal Ability' | 'Data Interpretation';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PronunciationItem {
  id: string;
  word: string;
  phonetic: string;
  category: string;
  definition: string;
  tip: string;
  sampleSentence: string;
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'interview' | 'coding' | 'streak' | 'rubric';
}

export interface ResumeAnalysisData {
  parsed: {
    name: string;
    education: string;
    experienceYears: string;
    skills: string[];
    projects: string[];
    certifications: string[];
  };
  atsScore: number;
  completenessScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  tailoredInterviewTopics: string[];
}

export interface JobDescriptionAnalysisData {
  roleTitle: string;
  companyVibe: string;
  requiredSkills: string[];
  preferredSkills: string[];
  matchScore: number;
  matchedSkills: string[];
  skillGaps: string[];
  targetInterviewQuestions: string[];
  strategyAdvice: string;
}
