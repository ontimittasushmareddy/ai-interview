import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { InterviewSetup } from './components/interview/InterviewSetup';
import { InterviewRoom } from './components/interview/InterviewRoom';
import { CodingSandbox } from './components/coding/CodingSandbox';
import { AptitudeRound } from './components/aptitude/AptitudeRound';
import { ResumeAnalyzer } from './components/resume/ResumeAnalyzer';
import { JobDescriptionAnalyzer } from './components/jobgap/JobDescriptionAnalyzer';
import { PronunciationLab } from './components/pronunciation/PronunciationLab';
import { QuestionBankView } from './components/questionbank/QuestionBankView';
import { PerformanceDashboard } from './components/dashboard/PerformanceDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { InterviewConfig, InterviewQuestionItem } from './types';

function MainContent() {
  const { activeTab, setActiveTab, activeInterviewConfig, user } = useApp();
  const [activeSessionQuestions, setActiveSessionQuestions] = useState<InterviewQuestionItem[] | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  // Start interview from setup
  const handleStartInterview = async (config: InterviewConfig) => {
    setIsLoadingSession(true);
    try {
      const response = await fetch('/api/gemini/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: config.role,
          companyType: config.companyType,
          experienceLevel: config.experienceLevel,
          difficulty: config.difficulty,
          interviewType: config.interviewType,
          persona: config.persona,
          language: config.language,
          numQuestions: config.numQuestions,
          resumeSummary: user.resumeText || user.skills.join(', '),
        }),
      });

      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setActiveSessionQuestions(data.questions);
      } else {
        throw new Error('No questions returned');
      }
    } catch (err) {
      console.warn('Using standard fallback questions:', err);
      // Fallback questions
      setActiveSessionQuestions([
        {
          id: 'q-fb-1',
          question: `Can you walk me through an impactful engineering project you built in ${config.role}, and the key architectural trade-offs you made?`,
          category: 'Technical',
          difficulty: 'Medium',
          context: 'Assesses depth of ownership, trade-off evaluation, and engineering judgment.',
          expectedKeyPoints: ['Problem constraints', 'Design alternatives', 'Quantifiable metrics & outcome'],
          timeLimitSeconds: 180,
        },
        {
          id: 'q-fb-2',
          question: 'Describe a situation where you had a technical disagreement with a teammate. How did you resolve it constructively?',
          category: 'Behavioral',
          difficulty: 'Medium',
          context: 'Tests interpersonal skills, humility, and STAR methodology.',
          expectedKeyPoints: ['Situation context', 'Data-driven discussion', 'Action and positive team result'],
          timeLimitSeconds: 180,
        },
        {
          id: 'q-fb-3',
          question: 'How do you ensure test coverage, reliability, and graceful error handling in your production codebase?',
          category: 'Technical',
          difficulty: 'Medium',
          context: 'Evaluates production rigor, defensive coding, and quality control.',
          expectedKeyPoints: ['Unit/integration tests', 'Boundary validation', 'Monitoring and logging'],
          timeLimitSeconds: 180,
        },
      ]);
    } finally {
      setIsLoadingSession(false);
    }
  };

  // Start interview from resume
  const handleStartWithResume = (resumeText: string, targetRole: string) => {
    setActiveTab('interview');
    handleStartInterview({
      ...activeInterviewConfig,
      role: targetRole,
    });
  };

  // Start interview from JD Analyzer
  const handleStartCustomInterview = (customQuestions: string[], role: string) => {
    const formatted: InterviewQuestionItem[] = customQuestions.map((q, idx) => ({
      id: `custom-jd-q-${idx}`,
      question: q,
      category: 'Job-Specific Technical',
      difficulty: 'Medium',
      context: `Specific requirement tailored from job posting for ${role}`,
      expectedKeyPoints: ['Practical experience', 'Architectural rationale', 'Trade-offs'],
      timeLimitSeconds: 180,
    }));
    setActiveSessionQuestions(formatted);
  };

  // Start practice for single question from question bank
  const handlePracticeSingleQuestion = (question: InterviewQuestionItem) => {
    setActiveSessionQuestions([question]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* If an active mock interview session is running */}
        {activeSessionQuestions ? (
          <InterviewRoom
            questions={activeSessionQuestions}
            config={activeInterviewConfig}
            onExit={() => setActiveSessionQuestions(null)}
          />
        ) : (
          /* Normal Tab Views */
          <>
            {activeTab === 'interview' && (
              <InterviewSetup
                onStartInterview={handleStartInterview}
                isLoading={isLoadingSession}
              />
            )}
            {activeTab === 'coding' && <CodingSandbox />}
            {activeTab === 'aptitude' && <AptitudeRound />}
            {activeTab === 'resume' && (
              <ResumeAnalyzer onStartInterviewWithResume={handleStartWithResume} />
            )}
            {activeTab === 'job_gap' && (
              <JobDescriptionAnalyzer
                onStartCustomInterview={handleStartCustomInterview}
              />
            )}
            {activeTab === 'pronounce' && <PronunciationLab />}
            {activeTab === 'question_bank' && (
              <QuestionBankView onPracticeQuestion={handlePracticeSingleQuestion} />
            )}
            {activeTab === 'dashboard' && <PerformanceDashboard />}
            {activeTab === 'admin' && <AdminDashboard />}
          </>
        )}
      </main>

      {/* Global Minimal Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-400">
        <p>
          PrepAI — Comprehensive AI Mock Interview, Adaptive Rubric & Career Preparation System
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
