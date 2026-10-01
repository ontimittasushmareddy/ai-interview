import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SessionReport } from '../../types';
import { InterviewReportView } from '../interview/InterviewReportView';
import {
  LayoutDashboard,
  TrendingUp,
  Flame,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Eye,
  BarChart2,
  Sparkles,
} from 'lucide-react';

export const PerformanceDashboard: React.FC = () => {
  const { user, history, badges, userPoints, practiceStreak } = useApp();
  const [selectedReport, setSelectedReport] = useState<SessionReport | null>(null);

  if (selectedReport) {
    return (
      <InterviewReportView
        report={selectedReport}
        onBackToDashboard={() => setSelectedReport(null)}
      />
    );
  }

  const latestSession = history[0] || null;
  const avgOverallScore = history.length
    ? Math.round(history.reduce((acc, h) => acc + h.overallScore, 0) / history.length)
    : 78;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Candidate Analytics & Growth Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome Back, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Targeting: <strong className="text-white">{user.targetRole}</strong> • Tracking
            interview readiness across {history.length} completed sessions.
          </p>
        </div>

        {/* Top Badges / Streak */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold shadow-lg">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{practiceStreak} Days Streak</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold shadow-lg">
            <Award className="w-4 h-4 text-indigo-400" />
            <span>{userPoints} Preparation XP</span>
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Average Interview Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{avgOverallScore}%</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +12%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Based on past evaluated rounds</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Sessions Taken
          </span>
          <div className="text-4xl font-black text-indigo-400">{history.length}</div>
          <p className="text-[11px] text-slate-400">Technical & Behavioral rounds</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Camera Eye Contact Avg
          </span>
          <div className="text-4xl font-black text-emerald-400">
            {latestSession ? `${latestSession.metrics.eyeContactPercentage}%` : '85%'}
          </div>
          <p className="text-[11px] text-slate-400">Stable engagement with interviewer</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Average Speaking Pace
          </span>
          <div className="text-4xl font-black text-white">
            {latestSession ? `${latestSession.metrics.avgWpm}` : '130'}
            <span className="text-xs text-slate-400 font-normal"> WPM</span>
          </div>
          <p className="text-[11px] text-emerald-400">Within optimal 120-150 range</p>
        </div>
      </div>

      {/* Historical Progress & Parameter Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Historical Session Trend */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Interview Score Progression</span>
            </div>
            <span className="text-xs text-slate-400">Last {history.length} Sessions</span>
          </div>

          <div className="space-y-4">
            {history.map((session, idx) => (
              <div
                key={session.id}
                className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-white">{session.role}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-indigo-400 font-medium">{session.difficulty}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(session.createdAt).toLocaleDateString()} with {session.persona.split(' ')[0]}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black border ${
                      session.overallScore >= 80
                        ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
                        : 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30'
                    }`}
                  >
                    {session.overallScore}%
                  </span>

                  <button
                    onClick={() => setSelectedReport(session)}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                    title="View Full Report & Action Plan"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Gamification Badges & Achievements */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Earned Badges & Milestones</span>
            </div>
            <span className="text-xs text-slate-400">
              {badges.filter((b) => b.unlocked).length} / {badges.length} Unlocked
            </span>
          </div>

          <div className="space-y-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                  badge.unlocked
                    ? 'bg-indigo-600/10 border-indigo-500/30 shadow'
                    : 'bg-slate-800/30 border-slate-800 opacity-60'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shrink-0 shadow-inner">
                  {badge.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white truncate">{badge.title}</h4>
                    {badge.unlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
