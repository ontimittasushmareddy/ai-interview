import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InterviewQuestionItem } from '../../types';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Play,
  Award,
} from 'lucide-react';

interface Props {
  onPracticeQuestion: (question: InterviewQuestionItem) => void;
}

export const QuestionBankView: React.FC<Props> = ({ onPracticeQuestion }) => {
  const { questionBank } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = ['All', 'Technical - Frontend', 'Technical - Backend', 'Behavioral - STAR', 'System Design', 'HR & Cultural'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredQuestions = questionBank.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.context.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || q.category.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesDifficulty =
      selectedDifficulty === 'All' || q.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Curated Tech Interview Question Repository</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Explore High-Yield Interview Questions & STAR Exemplars
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Browse vetted questions asked at FAANG and high-growth startups with expected evaluation criteria and model responses.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keywords (e.g. React, locking, conflict, Bitly)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {difficulties.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-3xl">
            No questions matched your search criteria.
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isExpanded = expandedId === q.id;
            return (
              <div
                key={q.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/60"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        {q.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold ${
                          q.difficulty === 'Easy'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : q.difficulty === 'Medium'
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                      {q.question}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPracticeQuestion(q);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span className="hidden sm:inline">Practice Live</span>
                    </button>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 pt-2 border-t border-slate-800 space-y-4 text-xs bg-slate-900/60 animate-fade-in">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                        Interviewer Context & Intent:
                      </span>
                      <p className="text-slate-300">{q.context}</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                        Expected Core Evaluation Points:
                      </span>
                      <ul className="space-y-1 text-slate-300">
                        {q.expectedKeyPoints.map((pt, pidx) => (
                          <li key={pidx} className="flex items-center gap-2">
                            <span className="text-indigo-400 font-bold">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
