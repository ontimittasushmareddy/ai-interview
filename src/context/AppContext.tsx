import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  SessionReport,
  BadgeItem,
  InterviewQuestionItem,
  InterviewConfig,
} from '../types';
import { DEFAULT_USER, INITIAL_BADGES, QUESTION_BANK } from '../data/mockData';
import confetti from 'canvas-confetti';

interface AppContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  history: SessionReport[];
  saveSessionReport: (report: SessionReport) => void;
  badges: BadgeItem[];
  unlockBadge: (badgeId: string) => void;
  userPoints: number;
  addPoints: (points: number) => void;
  practiceStreak: number;
  activeInterviewConfig: InterviewConfig;
  setActiveInterviewConfig: React.Dispatch<React.SetStateAction<InterviewConfig>>;
  questionBank: InterviewQuestionItem[];
  addQuestionToBank: (item: InterviewQuestionItem) => void;
  deleteQuestionFromBank: (id: string) => void;
  triggerCelebration: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_HISTORY: SessionReport[] = [
  {
    id: 'session-demo-01',
    createdAt: '2026-09-28T14:32:00Z',
    role: 'Full Stack Software Engineer',
    companyType: 'FAANG / Tier-1 Tech',
    difficulty: 'Standard',
    persona: 'Alex Vance (Friendly Mentor)',
    overallScore: 78,
    parameters: {
      relevance: 84,
      accuracy: 80,
      clarity: 76,
      confidence: 72,
      completeness: 75,
      communication: 78,
      technicalKnowledge: 82,
      problemSolving: 80,
      structure: 73,
    },
    metrics: {
      totalDurationSeconds: 420,
      avgWpm: 132,
      totalFillers: 7,
      eyeContactPercentage: 81,
    },
    questions: [
      {
        id: 'hist-q1',
        question: 'Explain how React virtual DOM diffing works and how keys prevent bugs in dynamic lists.',
        category: 'Technical',
        difficulty: 'Medium',
        context: 'Foundational frontend rendering knowledge',
        expectedKeyPoints: ['Reconciliation algorithm', 'Tree comparison heuristics', 'Stable identity with keys'],
        timeLimitSeconds: 180,
        userAnswer:
          'React keeps an in-memory virtual representation of the UI. When state updates, it generates a new tree and diffs it with the previous virtual DOM using an O(n) heuristic algorithm. Keys tell React which items moved, stayed, or were deleted.',
        evaluation: {
          overallScore: 82,
          parameters: {
            relevance: 88,
            accuracy: 84,
            clarity: 82,
            confidence: 78,
            completeness: 80,
            communication: 80,
            technicalKnowledge: 85,
            problemSolving: 80,
            structure: 79,
          },
          summary: 'Accurate and concise explanation of React reconciliation and keys.',
          strengths: ['Directly mentioned the O(n) heuristic', 'Clear explanation of key utility'],
          missingPoints: ['Could highlight why index as key is dangerous when sorting'],
          improvementTips: ['Mention fiber architecture for extra senior-level depth'],
          modelAnswer: {
            fullText:
              'React uses reconciliation with a virtual DOM to batch updates efficiently. The diffing algorithm operates in linear O(n) time by assuming elements of different types generate different trees, and using unique keys to identify persistent children across re-renders.',
          },
          communicationFeedback: 'Pacing was steady with confident delivery.',
          attemptNumber: 1,
          timestamp: '2026-09-28T14:35:00Z',
          metrics: {
            wpm: 134,
            fillerCount: 2,
            durationSeconds: 58,
            eyeContactScore: 85,
          },
        },
      },
    ],
    improvementPlan: [
      {
        day: 1,
        title: 'Deepen System Architecture Foundations',
        focus: 'Caching, replication, and distributed consensus',
        timeCommitment: '45 mins',
        tasks: ['Study write-through vs write-back cache', 'Practice explaining CAP theorem'],
        recommendedResources: ['System Design Primer'],
      },
    ],
  },
  {
    id: 'session-demo-02',
    createdAt: '2026-09-30T10:15:00Z',
    role: 'Full Stack Software Engineer',
    companyType: 'High-Growth Startup',
    difficulty: 'Challenging',
    persona: 'Elena Rostova (Strict Bar-Raiser)',
    overallScore: 84,
    parameters: {
      relevance: 88,
      accuracy: 86,
      clarity: 84,
      confidence: 81,
      completeness: 83,
      communication: 82,
      technicalKnowledge: 87,
      problemSolving: 85,
      structure: 80,
    },
    metrics: {
      totalDurationSeconds: 480,
      avgWpm: 128,
      totalFillers: 3,
      eyeContactPercentage: 88,
    },
    questions: [],
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('prepai_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [activeTab, setActiveTab] = useState<string>('interview');

  const [history, setHistory] = useState<SessionReport[]>(() => {
    const saved = localStorage.getItem('prepai_history');
    return saved ? JSON.parse(saved) : INITIAL_HISTORY;
  });

  const [badges, setBadges] = useState<BadgeItem[]>(() => {
    const saved = localStorage.getItem('prepai_badges');
    return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });

  const [userPoints, setUserPoints] = useState<number>(() => {
    const saved = localStorage.getItem('prepai_points');
    return saved ? Number(saved) : 620;
  });

  const [practiceStreak] = useState<number>(4);

  const [questionBank, setQuestionBank] = useState<InterviewQuestionItem[]>(() => {
    const saved = localStorage.getItem('prepai_question_bank');
    return saved ? JSON.parse(saved) : QUESTION_BANK;
  });

  const [activeInterviewConfig, setActiveInterviewConfig] = useState<InterviewConfig>({
    role: 'Full Stack Software Engineer',
    companyType: 'FAANG / Tier-1 Tech',
    experienceLevel: 'Junior (1-2 years)',
    difficulty: 'Standard',
    interviewType: 'Technical & Behavioral Mixed',
    persona: 'Alex Vance (Friendly Mentor)',
    language: 'English',
    numQuestions: 4,
    enableVideo: true,
    enableVoice: true,
    enableBodyLanguage: true,
  });

  useEffect(() => {
    localStorage.setItem('prepai_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('prepai_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('prepai_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('prepai_points', String(userPoints));
  }, [userPoints]);

  useEffect(() => {
    localStorage.setItem('prepai_question_bank', JSON.stringify(questionBank));
  }, [questionBank]);

  const addPoints = (pts: number) => {
    setUserPoints((prev) => prev + pts);
  };

  const unlockBadge = (badgeId: string) => {
    setBadges((prev) =>
      prev.map((b) =>
        b.id === badgeId && !b.unlocked
          ? { ...b, unlocked: true, unlockedAt: new Date().toISOString() }
          : b
      )
    );
  };

  const saveSessionReport = (report: SessionReport) => {
    setHistory((prev) => [report, ...prev]);
    addPoints(150);
    unlockBadge('badge-first-interview');
    if (report.overallScore >= 80) {
      unlockBadge('badge-star-master');
    }
    if (report.persona.includes('Elena') && report.overallScore >= 80) {
      unlockBadge('badge-bar-raiser');
    }
  };

  const addQuestionToBank = (item: InterviewQuestionItem) => {
    setQuestionBank((prev) => [item, ...prev]);
  };

  const deleteQuestionFromBank = (id: string) => {
    setQuestionBank((prev) => prev.filter((q) => q.id !== id));
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        activeTab,
        setActiveTab,
        history,
        saveSessionReport,
        badges,
        unlockBadge,
        userPoints,
        addPoints,
        practiceStreak,
        activeInterviewConfig,
        setActiveInterviewConfig,
        questionBank,
        addQuestionToBank,
        deleteQuestionFromBank,
        triggerCelebration,
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
