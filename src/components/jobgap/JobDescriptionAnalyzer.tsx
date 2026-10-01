import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JobDescriptionAnalysisData } from '../../types';
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Building,
  Target,
  FileText,
  Play,
} from 'lucide-react';

interface Props {
  onStartCustomInterview: (questions: string[], role: string) => void;
}

export const JobDescriptionAnalyzer: React.FC<Props> = ({ onStartCustomInterview }) => {
  const { user } = useApp();
  const [jobDescription, setJobDescription] = useState(`Senior Full Stack Engineer — Stripe / Fintech
We are looking for an experienced Full Stack Engineer to build reliable, high-throughput payment infrastructure.
Requirements:
• Strong experience with React, TypeScript, and modern state management
• Backend proficiency in Node.js, Go, or Python with relational databases (PostgreSQL)
• Understanding of distributed systems, idempotency in payment processing, and event-driven architecture (Kafka/SQS)
• Experience designing and securing public RESTful APIs with OAuth2/JWT
• Passion for test-driven development, CI/CD pipelines, and Docker containerization
Preferred:
• Experience with Redis caching, microservices, and GraphQL
• Familiarity with PCI-DSS compliance and financial ledger systems`);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<JobDescriptionAnalysisData | null>(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/gemini/analyze-job-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          resumeText: user.resumeText || user.skills.join(', '),
        }),
      });
      const data: JobDescriptionAnalysisData = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error('Job analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Job Description (JD) Skill Gap Analyzer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Match Any Job Description Against Your Profile & Predict Questions
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl">
          Paste any posting from LinkedIn, Greenhouse, or Lever. AI compares the requirements
          against your resume, calculates your match percentage, reveals hidden skill gaps, and prepares
          5 targeted questions likely to be asked.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Paste Target Job Description (JD)</span>
          </label>
          <span className="text-xs text-slate-400">
            Comparing with Candidate: <strong className="text-indigo-300">{user.name}</strong>
          </span>
        </div>

        <textarea
          rows={8}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste job title, requirements, tech stack, and responsibilities here..."
          className="w-full p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-slate-200 font-sans focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
        />

        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !jobDescription.trim()}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Comparing Candidate Skills with JD...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Job Match & Predict Questions</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {analysisResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  JD Match Score
                </span>
                <div className="text-4xl font-black text-emerald-400 mt-1">
                  {analysisResult.matchScore}%
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {analysisResult.roleTitle}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                <Target className="w-7 h-7" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Role Atmosphere
                </span>
                <div className="text-sm font-bold text-white mt-1 leading-snug">
                  {analysisResult.companyVibe}
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                <Building className="w-7 h-7" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/60 to-slate-900 border border-indigo-500/30 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Simulate This Exact Interview
                </span>
                <p className="text-xs text-slate-300 mt-1">
                  Launch a mock interview focusing on the {analysisResult.targetInterviewQuestions.length} predicted questions.
                </p>
              </div>

              <button
                onClick={() =>
                  onStartCustomInterview(
                    analysisResult.targetInterviewQuestions,
                    analysisResult.roleTitle
                  )
                }
                className="mt-3 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start Practice Session</span>
              </button>
            </div>
          </div>

          {/* Matched vs Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Skills You Satisfy</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysisResult.matchedSkills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-lg text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>High-Priority Gaps to Address in Interview</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysisResult.skillGaps.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-lg text-xs bg-amber-500/15 border border-amber-500/30 text-amber-300 font-medium"
                  >
                    ! {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Strategic Pitch Advice */}
          <div className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-slate-200 text-xs sm:text-sm space-y-2">
            <span className="font-bold text-indigo-300 uppercase tracking-wider text-xs block">
              Strategic Interview Pitch Recommendation
            </span>
            <p className="leading-relaxed">{analysisResult.strategyAdvice}</p>
          </div>

          {/* Predicted Interview Questions */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Predicted Interview Questions for This Role
              </h3>
              <span className="text-xs text-indigo-400 font-medium">5 Targeted Questions</span>
            </div>

            <div className="space-y-3">
              {analysisResult.targetInterviewQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3 text-xs sm:text-sm text-slate-200"
                >
                  <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    {idx + 1}
                  </span>
                  <span className="font-medium leading-relaxed">{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
