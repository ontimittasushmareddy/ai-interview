import React, { useState } from 'react';
import { SessionReport, DayPlanItem } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Clock,
  Volume2,
  Eye,
  Calendar,
  Sparkles,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ArrowLeft,
  Flame,
} from 'lucide-react';

interface Props {
  report: SessionReport;
  onBackToDashboard: () => void;
}

export const InterviewReportView: React.FC<Props> = ({ report, onBackToDashboard }) => {
  const { user } = useApp();
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const getVerdict = (score: number) => {
    if (score >= 85) {
      return {
        badge: 'Strong Hire / Top 10% Candidate',
        color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
        summary:
          'Outstanding performance. Demonstrated high technical depth, precise communication, and structured problem-solving under pressure.',
      };
    }
    if (score >= 70) {
      return {
        badge: 'Competitive / Moving to Next Round',
        color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
        summary:
          'Solid answers with clear domain fundamentals. Polishing STAR behavioral specifics and reducing speech hesitation will unlock offer-level mastery.',
      };
    }
    return {
      badge: 'Developing / Practice Recommended',
      color: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      summary:
        'Good enthusiasm, but answers lacked concrete depth, metrics, or structured delivery. Follow the 7-day personalized plan below.',
    };
  };

  const verdict = getVerdict(report.overallScore);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16 print:p-0 print:space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 print:hidden">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Performance Hub</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export / Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Scorecard Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${verdict.color}`}
              >
                {verdict.badge}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(report.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Interview Performance Scorecard
            </h1>
            <p className="text-xs text-slate-300">
              Candidate: <strong className="text-white">{user.name}</strong> • Role:{' '}
              <strong className="text-white">{report.role}</strong> ({report.difficulty} •{' '}
              {report.companyType})
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">{verdict.summary}</p>
          </div>

          {/* Large Circular / Rounded Overall Score Badge */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-900/90 border border-indigo-500/40 shadow-xl min-w-[180px] text-center">
            <span className="text-5xl font-black bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
              {report.overallScore}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 mt-1">
              Overall Score
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5">Scale: 0 - 100</span>
          </div>
        </div>
      </div>

      {/* Multi-Parameter Rubric Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Award className="w-5 h-5 text-indigo-400" />
            <span>Candidate Evaluation Parameters</span>
          </div>
          <span className="text-xs text-slate-400">9 Core Dimensions Audited</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(report.parameters).map(([key, val]) => {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
            return (
              <div
                key={key}
                className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="truncate">{formattedKey}</span>
                  <span className="font-bold text-white text-sm">{val}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      val >= 80 ? 'bg-emerald-500' : val >= 65 ? 'bg-indigo-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Behavioral & Delivery Signals */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <Clock className="w-6 h-6 text-indigo-400 shrink-0" />
          <div>
            <div className="text-lg font-black text-white">
              {Math.round(report.metrics.totalDurationSeconds / 60)} mins
            </div>
            <div className="text-[11px] text-slate-400">Total Speaking Time</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <Volume2 className="w-6 h-6 text-indigo-400 shrink-0" />
          <div>
            <div className="text-lg font-black text-white">{report.metrics.avgWpm} WPM</div>
            <div className="text-[11px] text-slate-400">Speaking Pace (Normal 120-150)</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <div className="text-lg font-black text-white">{report.metrics.totalFillers}</div>
            <div className="text-[11px] text-slate-400">Total Filler Words ("um", "like")</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <Eye className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <div className="text-lg font-black text-white">
              {report.metrics.eyeContactPercentage}%
            </div>
            <div className="text-[11px] text-slate-400">Camera Eye Contact</div>
          </div>
        </div>
      </div>

      {/* Personalized 7-Day Action Plan */}
      {report.improvementPlan && report.improvementPlan.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>Personalized 7-Day Improvement Roadmap</span>
            </div>
            <span className="text-xs text-indigo-300 font-semibold">
              Action items based on weak areas identified in this session
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.improvementPlan.map((day) => (
              <div
                key={day.day}
                className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Day {day.day}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    ⏱ {day.timeCommitment}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{day.title}</h4>
                <p className="text-xs text-indigo-200/90 font-medium">Focus: {day.focus}</p>

                <ul className="space-y-1 text-xs text-slate-300 pt-1">
                  {day.tasks.map((task, tidx) => (
                    <li key={tidx} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">→</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {report.motivationalAdvice && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-slate-900 border border-indigo-500/30 text-xs text-slate-200 italic leading-relaxed flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>"{report.motivationalAdvice}"</span>
            </div>
          )}
        </div>
      )}

      {/* Question-by-Question Deep Review */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Question-by-Question Review & Model Answers</span>
          </div>
          <span className="text-xs text-slate-400">
            {report.questions.length} Questions Evaluated
          </span>
        </div>

        <div className="space-y-3">
          {report.questions.map((q, idx) => {
            const isExpanded = expandedQuestion === q.id;
            return (
              <div
                key={q.id || idx}
                className="rounded-2xl border border-slate-700/80 bg-slate-800/40 overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/70"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-indigo-400">Q{idx + 1}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-400 font-medium">{q.category}</span>
                    </div>
                    <p className="text-sm font-bold text-white">{q.question}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {q.evaluation && (
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-black border ${
                          q.evaluation.overallScore >= 80
                            ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
                            : q.evaluation.overallScore >= 65
                            ? 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30'
                            : 'text-amber-400 bg-amber-500/15 border-amber-500/30'
                        }`}
                      >
                        {q.evaluation.overallScore}%
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 pt-2 border-t border-slate-700/60 space-y-4 text-xs bg-slate-900/60">
                    {/* Candidate Answer */}
                    <div className="space-y-1">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                        Your Answer:
                      </span>
                      <p className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 leading-relaxed">
                        {q.userAnswer || 'No transcribed response recorded.'}
                      </p>
                    </div>

                    {q.evaluation && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <span className="font-bold text-emerald-400 text-xs block mb-1">
                              Strengths:
                            </span>
                            <ul className="space-y-1 text-slate-300">
                              {q.evaluation.strengths.map((s, sidx) => (
                                <li key={sidx}>• {s}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <span className="font-bold text-amber-400 text-xs block mb-1">
                              Missing Points:
                            </span>
                            <ul className="space-y-1 text-slate-300">
                              {q.evaluation.missingPoints.map((m, midx) => (
                                <li key={midx}>• {m}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Model STAR Answer */}
                        <div className="space-y-1">
                          <span className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">
                            Model Exemplar Answer:
                          </span>
                          <p className="p-3 rounded-xl bg-slate-800/90 border border-indigo-500/30 text-indigo-100 italic leading-relaxed">
                            "{q.evaluation.modelAnswer.fullText}"
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
