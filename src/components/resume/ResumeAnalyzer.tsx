import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SAMPLE_RESUMES } from '../../data/mockData';
import { ResumeAnalysisData } from '../../types';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  GraduationCap,
  Briefcase,
  Play,
} from 'lucide-react';

interface Props {
  onStartInterviewWithResume: (resumeText: string, targetRole: string) => void;
}

export const ResumeAnalyzer: React.FC<Props> = ({ onStartInterviewWithResume }) => {
  const { user, setUser } = useApp();
  const [resumeText, setResumeText] = useState(user.resumeText || SAMPLE_RESUMES[0].content);
  const [targetRole, setTargetRole] = useState(user.targetRole || 'Full Stack Software Engineer');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisData | null>(null);

  const roles = [
    'Full Stack Software Engineer',
    'Frontend Engineer (React / TypeScript)',
    'Backend Engineer (Node.js / Python)',
    'Data Analyst / BI Specialist',
    'Machine Learning / AI Engineer',
    'DevOps / Cloud Infrastructure',
    'Product Manager (Tech)',
  ];

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/gemini/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          targetRole,
        }),
      });
      const data: ResumeAnalysisData = await res.json();
      setAnalysisResult(data);

      // Optionally sync parsed details to candidate profile
      if (data.parsed.skills?.length) {
        setUser((prev) => ({
          ...prev,
          resumeText,
          targetRole,
          skills: Array.from(new Set([...prev.skills, ...data.parsed.skills])),
        }));
      }
    } catch (err) {
      console.error('Resume analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSample = (sample: (typeof SAMPLE_RESUMES)[0]) => {
    setResumeText(sample.content);
    setTargetRole(sample.role);
    setAnalysisResult(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <FileText className="w-3.5 h-3.5" />
          <span>ATS Resume Analyzer & Skill Gap Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Optimize Your Resume for Applicant Tracking Systems & Tech Screeners
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl">
          Extract skills, assess ATS compliance, uncover missing keywords against your target role,
          and instantly generate personalized mock interview rounds from your projects.
        </p>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Resume Content (Text / Markdown)</span>
            </label>

            {/* Sample Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] text-slate-400 whitespace-nowrap">Load Preset:</span>
              {SAMPLE_RESUMES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleLoadSample(sample)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap transition-colors"
                >
                  {sample.title.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={12}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your full resume text here..."
            className="w-full p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="w-full sm:w-auto flex-1 max-w-xs">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Target Role to Benchmark
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !resumeText.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Scanning Resume & ATS Rules...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run ATS & Skill Gap Audit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Info Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>What AI Evaluates</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="font-semibold text-white">ATS Keyword Match</div>
                <p className="text-[11px] text-slate-400">
                  Scans for high-frequency terms expected by automated recruiting screening filters.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="font-semibold text-white">Missing Skill Identification</div>
                <p className="text-[11px] text-slate-400">
                  Pinpoints gaps in tooling, testing, architecture, or cloud deployment.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="font-semibold text-white">Google X-Y-Z Bullet Point Audit</div>
                <p className="text-[11px] text-slate-400">
                  Verifies if projects showcase measurable impact: "Accomplished [X] by doing [Y], measured by [Z]".
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">
            💡 Pro-Tip: After scanning, use the 1-click launcher to simulate an interviewer probing your exact listed projects.
          </div>
        </div>
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  ATS Match Score
                </span>
                <div className="text-4xl font-black text-emerald-400">
                  {analysisResult.atsScore}%
                </div>
                <p className="text-[11px] text-slate-400">Ranked against {targetRole}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                <CheckCircle2 className="w-7 h-7" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Completeness Index
                </span>
                <div className="text-4xl font-black text-indigo-400">
                  {analysisResult.completenessScore}%
                </div>
                <p className="text-[11px] text-slate-400">Education, metrics & projects</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                <Layers className="w-7 h-7" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/60 to-slate-900 border border-indigo-500/30 shadow-xl flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  1-Click Next Step
                </span>
                <h4 className="text-sm font-bold text-white mt-1">
                  Ready to test your resume answers?
                </h4>
              </div>

              <button
                onClick={() => onStartInterviewWithResume(resumeText, targetRole)}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Launch Mock Interview from this Resume</span>
              </button>
            </div>
          </div>

          {/* Matched Skills vs Missing Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Matched Role Skills Detected ({analysisResult.matchedSkills.length})</span>
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
                <span>Identified Skill Gaps for {targetRole}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysisResult.missingSkills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-lg text-xs bg-amber-500/15 border border-amber-500/30 text-amber-300 font-medium"
                  >
                    + {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Improvement Suggestions */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Actionable Resume Enhancements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysisResult.improvementSuggestions.map((sug, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 leading-relaxed space-y-1.5"
                >
                  <span className="font-bold text-indigo-400">Step {idx + 1}</span>
                  <p>{sug}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
