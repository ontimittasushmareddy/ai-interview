import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile, UserRole } from '../types';
import { X, Check, Shield, User, GraduationCap, Briefcase, Code, Sparkles } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const ProfileModal: React.FC<Props> = ({ onClose }) => {
  const { user, setUser } = useApp();
  const [formData, setFormData] = useState<UserProfile>({ ...user });
  const [newSkill, setNewSkill] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (!newSkill.trim() || formData.skills.includes(newSkill.trim())) return;
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()],
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Candidate & Account Profile</h2>
              <p className="text-xs text-slate-400">
                AI customizes interview questions and rubric depth to these profile details.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* Role Switcher (Candidate vs Admin) */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-xs font-semibold text-white">Active System Role</div>
                <div className="text-[11px] text-slate-400">
                  Switch to Admin mode to manage question bank, session analytics, and prompts.
                </div>
              </div>
            </div>
            <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: 'candidate' }))}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  formData.role === 'candidate'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: 'admin' }))}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  formData.role === 'admin'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Job Role
              </label>
              <input
                type="text"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Full Stack Engineer, Data Analyst"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Experience Level
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Fresher / College Graduate">Fresher / College Graduate (0 yrs)</option>
                <option value="Junior (1-2 years)">Junior (1-2 years)</option>
                <option value="Mid-Level (3-5 years)">Mid-Level (3-5 years)</option>
                <option value="Senior (5+ years)">Senior (5+ years)</option>
                <option value="Lead / Staff Engineer">Lead / Staff Engineer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Education / University
              </label>
              <input
                type="text"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                placeholder="Degree & Institution"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Branch / Specialization
              </label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Computer Science, Information Tech, Electrical"
              />
            </div>
          </div>

          {/* Skills Tag Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Core Technical & Soft Skills
            </label>
            <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 min-h-[44px]">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-400"
                  >
                    &times;
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1 flex-1 min-w-[120px]">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="+ Add skill (Press Enter)"
                  className="w-full text-xs bg-transparent text-white focus:outline-none px-1"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Short Candidate Bio / Pitch
            </label>
            <textarea
              rows={2}
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 resize-none"
              placeholder="A brief summary of your strengths and target career direction..."
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg text-white transition-all ${
                savedSuccess
                  ? 'bg-emerald-600'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
