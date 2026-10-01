import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InterviewQuestionItem } from '../../types';
import {
  ShieldCheck,
  Plus,
  Trash2,
  BookOpen,
  Users,
  BarChart3,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { questionBank, addQuestionToBank, deleteQuestionFromBank, history } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Partial<InterviewQuestionItem>>({
    category: 'Technical - Backend',
    difficulty: 'Medium',
    timeLimitSeconds: 180,
    expectedKeyPoints: [''],
  });

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.question || !newQuestion.context) return;

    const item: InterviewQuestionItem = {
      id: `admin-q-${Date.now()}`,
      question: newQuestion.question,
      category: newQuestion.category || 'Technical',
      difficulty: newQuestion.difficulty || 'Medium',
      context: newQuestion.context || '',
      expectedKeyPoints: newQuestion.expectedKeyPoints?.filter((p) => p.trim()) || ['Understanding of concepts'],
      timeLimitSeconds: newQuestion.timeLimitSeconds || 180,
    };

    addQuestionToBank(item);
    setShowAddModal(false);
    setNewQuestion({
      category: 'Technical - Backend',
      difficulty: 'Medium',
      timeLimitSeconds: 180,
      expectedKeyPoints: [''],
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Manage Interview Standards, Rubrics & Question Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Configure question categories, inspect candidate mock session histories, and manage prompts.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Interview Question</span>
        </button>
      </div>

      {/* Overview Metric Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Questions in Repository
            </span>
            <div className="text-4xl font-black text-purple-400 mt-1">
              {questionBank.length}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Evaluated Mock Sessions
            </span>
            <div className="text-4xl font-black text-indigo-400 mt-1">
              {history.length}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Evaluation Rubric Dimensions
            </span>
            <div className="text-4xl font-black text-emerald-400 mt-1">9</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sliders className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Question Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Repository Questions Management
          </h3>
          <span className="text-xs text-slate-400">{questionBank.length} Questions Active</span>
        </div>

        <div className="space-y-3">
          {questionBank.map((q) => (
            <div
              key={q.id}
              className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-4"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-purple-400">{q.category}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 font-medium">{q.difficulty}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{q.question}</h4>
              </div>

              <button
                onClick={() => deleteQuestionFromBank(q.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete Question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-white">Create New Interview Question</h3>

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Question Prompt Text
                </label>
                <textarea
                  rows={3}
                  required
                  value={newQuestion.question || ''}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  placeholder="e.g. Explain how Kafka ensures message ordering within a partition..."
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Technical - Frontend">Technical - Frontend</option>
                    <option value="Technical - Backend">Technical - Backend</option>
                    <option value="Behavioral - STAR">Behavioral - STAR</option>
                    <option value="System Design">System Design</option>
                    <option value="HR & Cultural">HR & Cultural</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Difficulty</label>
                  <select
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Interviewer Intent & Context
                </label>
                <input
                  type="text"
                  required
                  value={newQuestion.context || ''}
                  onChange={(e) => setNewQuestion({ ...newQuestion, context: e.target.value })}
                  placeholder="e.g. Tests understanding of partition keys and consumer group semantics"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
