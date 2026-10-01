import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Mic,
  FileText,
  Briefcase,
  Code2,
  Brain,
  Volume2,
  BookOpen,
  LayoutDashboard,
  ShieldCheck,
  User,
  Flame,
  Award,
} from 'lucide-react';
import { ProfileModal } from './ProfileModal';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, user, userPoints, practiceStreak } = useApp();
  const [showProfile, setShowProfile] = useState(false);

  const navItems = [
    { id: 'interview', label: 'Mock Interview', icon: Mic },
    { id: 'coding', label: 'Coding Lab', icon: Code2 },
    { id: 'aptitude', label: 'Aptitude Round', icon: Brain },
    { id: 'resume', label: 'Resume ATS', icon: FileText },
    { id: 'job_gap', label: 'JD Gap Matcher', icon: Briefcase },
    { id: 'pronounce', label: 'Fluency Drill', icon: Volume2 },
    { id: 'question_bank', label: 'Question Bank', icon: BookOpen },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  if (user.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Hub', icon: ShieldCheck });
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setActiveTab('interview')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                    PrepAI
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Pro Coach
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  AI Mock Interview & Evaluation System
                </p>
              </div>
            </div>

            {/* Middle Nav Items */}
            <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Stats & Profile */}
            <div className="flex items-center gap-3">
              {/* Streak */}
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold"
                title={`${practiceStreak} Day Practice Streak!`}
              >
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>{practiceStreak}d Streak</span>
              </div>

              {/* Points */}
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold"
                title={`${userPoints} Preparation XP Points`}
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>{userPoints} XP</span>
              </div>

              {/* Profile / Role toggle button */}
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-xs font-bold text-indigo-300">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <div className="text-xs font-medium text-slate-200 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {user.role} mode
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Row */}
          <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
};
