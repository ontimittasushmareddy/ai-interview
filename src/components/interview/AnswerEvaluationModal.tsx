import React, { useState } from 'react';
import { AnswerEvaluation, ModelAnswerBreakdown } from '../../types';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Award,
  Volume2,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  questionNumber: number;
  totalQuestions: number;
  questionText: string;
  evaluation: AnswerEvaluation;
  previousEvaluation?: AnswerEvaluation;
  onRetry: () => void;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
}

export const AnswerEvaluationModal: React.FC<Props> = ({
  questionNumber,
  totalQuestions,
  questionText,
  evaluation,
  previousEvaluation,
  onRetry,
  onNextQuestion,
  isLastQuestion,
}) => {
  const [showStarDetails, setShowStarDetails] = useState(true);
  const [showAllRubrics, setShowAllRubrics] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 65) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 65) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const deltaScore = previousEvaluation
    ? evaluation.overallScore - previousEvaluation.overallScore
    : null;

  const coreRubrics = [
    { label: 'Relevance', score: evaluation.parameters.relevance, desc: 'Addressed what was asked' },
    { label: 'Technical Accuracy', score: evaluation.parameters.accuracy, desc: 'Factually correct concepts' },
    { label: 'Clarity & Delivery', score: evaluation.parameters.clarity, desc: 'Ease of comprehension' },
    { label: 'Structure (STAR)', score: evaluation.parameters.structure, desc: 'Logical organized flow' },
    { label: 'Confidence', score: evaluation.parameters.confidence, desc: 'Assertive, non-hedging' },
    { label: 'Completeness', score: evaluation.parameters.completeness, desc: 'Covered edge cases & nuances' },
  ];

  const advancedRubrics = [
    { label: 'Communication Tone', score: evaluation.parameters.communication },
    { label: 'Engineering Knowledge', score: evaluation.parameters.technicalKnowledge },
    { label: 'Problem Solving Depth', score: evaluation.parameters.problemSolving },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl text-slate-100 p-6 sm:p-8 space-y-6">
        {/* Header with Question & Score */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
              <span>
                Question {questionNumber} of {totalQuestions}
              </span>
              <span>•</span>
              <span>Attempt #{evaluation.attemptNumber}</span>
              {deltaScore !== null && (
                <span
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                    deltaScore >= 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  <TrendingUp className="w-3 h-3" />
                  {deltaScore >= 0 ? `+${deltaScore}% improvement` : `${deltaScore}%`}
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
              {questionText}
            </h2>
          </div>

          <div
            className={`shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-2xl border ${getScoreColor(
              evaluation.overallScore
            )} shadow-lg p-2 text-center`}
          >
            <span className="text-3xl font-black">{evaluation.overallScore}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider">Score / 100</span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-slate-200 leading-relaxed">
          <div className="font-bold text-indigo-300 text-xs flex items-center gap-1.5 mb-1 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Evaluator Assessment</span>
          </div>
          {evaluation.summary}
        </div>

        {/* 9-Parameter Rubric Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Multi-Parameter Rubric Breakdown</span>
            </div>
            <button
              onClick={() => setShowAllRubrics(!showAllRubrics)}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-xs font-semibold lowercase"
            >
              {showAllRubrics ? 'show less' : 'view all 9 parameters'}
              {showAllRubrics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {coreRubrics.map((r) => (
              <div
                key={r.label}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                  <span>{r.label}</span>
                  <span className="font-bold text-white">{r.score}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${getBarColor(
                      r.score
                    )}`}
                    style={{ width: `${r.score}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 truncate">{r.desc}</div>
              </div>
            ))}

            {showAllRubrics &&
              advancedRubrics.map((r) => (
                <div
                  key={r.label}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                    <span>{r.label}</span>
                    <span className="font-bold text-white">{r.score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${getBarColor(
                        r.score
                      )}`}
                      style={{ width: `${r.score}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Speech & Body Signals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">
                {evaluation.metrics.wpm} Words / Min
              </div>
              <div className="text-[11px] text-slate-400">
                {evaluation.metrics.wpm >= 110 && evaluation.metrics.wpm <= 160
                  ? 'Optimal Pacing'
                  : 'Fast or Slow Pacing'}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-3">
            <Clock className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">
                {evaluation.metrics.durationSeconds}s Spoken
              </div>
              <div className="text-[11px] text-slate-400">
                {evaluation.metrics.fillerCount} Filler Words Detected
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-3">
            <Eye className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">
                {evaluation.metrics.eyeContactScore}% Eye Contact
              </div>
              <div className="text-[11px] text-slate-400">Gaze stability towards lens</div>
            </div>
          </div>
        </div>

        {/* Strengths & Missing Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>What Went Well</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {evaluation.strengths.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Missing Points */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Missing Nuances / Areas for Depth</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {evaluation.missingPoints.map((m, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actionable Advice & Communication Tips */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Actionable Delivery & Speaking Tips</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {evaluation.communicationFeedback}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {evaluation.improvementTips.map((tip, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 text-xs"
              >
                👉 {tip}
              </span>
            ))}
          </div>
        </div>

        {/* Model STAR Answer Expandable Section */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 overflow-hidden">
          <button
            onClick={() => setShowStarDetails(!showStarDetails)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Model Exemplar Answer (STAR Structure)</span>
            </div>
            <span className="text-xs text-indigo-400 font-semibold">
              {showStarDetails ? 'Collapse' : 'Expand Example'}
            </span>
          </button>

          {showStarDetails && (
            <div className="p-4 pt-1 border-t border-slate-700/60 space-y-3 text-xs">
              {evaluation.modelAnswer.situation && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="font-bold text-indigo-300 uppercase tracking-wider text-[11px]">
                    Situation
                  </div>
                  <div className="sm:col-span-3 text-slate-300">
                    {evaluation.modelAnswer.situation}
                  </div>
                </div>
              )}
              {evaluation.modelAnswer.task && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="font-bold text-indigo-300 uppercase tracking-wider text-[11px]">
                    Task
                  </div>
                  <div className="sm:col-span-3 text-slate-300">{evaluation.modelAnswer.task}</div>
                </div>
              )}
              {evaluation.modelAnswer.action && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="font-bold text-indigo-300 uppercase tracking-wider text-[11px]">
                    Action
                  </div>
                  <div className="sm:col-span-3 text-slate-300">{evaluation.modelAnswer.action}</div>
                </div>
              )}
              {evaluation.modelAnswer.result && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                    Result
                  </div>
                  <div className="sm:col-span-3 text-slate-200 font-medium">
                    {evaluation.modelAnswer.result}
                  </div>
                </div>
              )}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed italic">
                "{evaluation.modelAnswer.fullText}"
              </div>
            </div>
          )}
        </div>

        {/* Adaptive Follow-up Question Preview */}
        {evaluation.followUpQuestion && (
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-xs text-purple-200">
            <span className="font-bold uppercase tracking-wider text-[11px] text-purple-300 block mb-1">
              Adaptive Follow-up Probe:
            </span>
            "{evaluation.followUpQuestion}"
          </div>
        )}

        {/* Footer Actions: Retry vs Next */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onRetry}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all shadow"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Try Again (Retry Answer for Better Score)</span>
          </button>

          <button
            onClick={onNextQuestion}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <span>{isLastQuestion ? 'Complete Interview & View Report' : 'Proceed to Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
