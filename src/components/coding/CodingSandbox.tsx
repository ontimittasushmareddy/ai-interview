import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CODING_CHALLENGES } from '../../data/mockData';
import { CodingChallenge } from '../../types';
import {
  Code2,
  Play,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Lightbulb,
  Award,
  Terminal,
  Cpu,
  Layers,
} from 'lucide-react';

export const CodingSandbox: React.FC = () => {
  const { addPoints, unlockBadge, triggerCelebration } = useApp();
  const [selectedChallenge, setSelectedChallenge] = useState<CodingChallenge>(CODING_CHALLENGES[0]);
  const [language, setLanguage] = useState<string>('javascript');
  const [code, setCode] = useState<string>(selectedChallenge.starterCode['javascript'] || '');
  const [explanation, setExplanation] = useState<string>('');
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<Array<{ input: string; expected: string; passed: boolean }> | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [showHintIndex, setShowHintIndex] = useState<number>(-1);

  const handleSelectChallenge = (c: CodingChallenge) => {
    setSelectedChallenge(c);
    setCode(c.starterCode[language] || c.starterCode['javascript'] || '');
    setTestResults(null);
    setAiAnalysis(null);
    setShowHintIndex(-1);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(selectedChallenge.starterCode[lang] || '');
  };

  const handleRunTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      // Simulate test runner execution
      const results = selectedChallenge.testCases.map((tc, idx) => ({
        input: tc.input,
        expected: tc.expected,
        passed: idx < 3, // Realistic mock test execution result
      }));
      setTestResults(results);
      setIsRunningTests(false);
      addPoints(25);
    }, 600);
  };

  const handleAiAudit = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/gemini/analyze-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: selectedChallenge.title,
          language,
          code,
          explanation,
        }),
      });
      const data = await res.json();
      setAiAnalysis(data);
      addPoints(50);
      unlockBadge('badge-clean-code');
      triggerCelebration();
    } catch (err) {
      console.error('Code analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
            <Code2 className="w-3.5 h-3.5" />
            <span>Interactive Algorithmic Sandbox</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Live Coding Round & Real-Time Algorithmic Audit
          </h1>
          <p className="text-xs text-slate-400">
            Write, execute tests, and receive automated Big-O time/space complexity analysis with AI bug finding.
          </p>
        </div>

        {/* Problem Selector Dropdown */}
        <div className="flex items-center gap-3">
          <select
            value={selectedChallenge.id}
            onChange={(e) => {
              const found = CODING_CHALLENGES.find((c) => c.id === e.target.value);
              if (found) handleSelectChallenge(found);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
          >
            {CODING_CHALLENGES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.difficulty})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Problem Description & Test Cases */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  selectedChallenge.difficulty === 'Easy'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    : selectedChallenge.difficulty === 'Medium'
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                    : 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                }`}
              >
                {selectedChallenge.difficulty}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {selectedChallenge.category}
              </span>
            </div>

            <h2 className="text-xl font-bold text-white">{selectedChallenge.title}</h2>

            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {selectedChallenge.description}
            </div>

            {/* Examples */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Examples
              </span>
              {selectedChallenge.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1 font-mono"
                >
                  <div>
                    <span className="text-indigo-400">Input: </span>
                    <span className="text-slate-200">{ex.input}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Output: </span>
                    <span className="text-slate-200">{ex.output}</span>
                  </div>
                  {ex.explanation && (
                    <div className="text-[11px] text-slate-400 font-sans pt-1">
                      {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Constraints
              </span>
              <ul className="space-y-1 text-xs text-slate-400 font-mono">
                {selectedChallenge.constraints.map((con, idx) => (
                  <li key={idx}>• {con}</li>
                ))}
              </ul>
            </div>

            {/* Hints Accordion */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Interviewer Hints</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedChallenge.hints.map((_, hidx) => (
                  <button
                    key={hidx}
                    onClick={() => setShowHintIndex(showHintIndex === hidx ? -1 : hidx)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
                  >
                    {showHintIndex === hidx ? 'Hide' : `Hint ${hidx + 1}`}
                  </button>
                ))}
              </div>
              {showHintIndex >= 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 animate-fade-in">
                  💡 {selectedChallenge.hints[showHintIndex]}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Editor, Test Runner & AI Auditor */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl flex flex-col justify-between min-h-[500px]">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {['javascript', 'python', 'java', 'cpp'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all uppercase ${
                      language === lang
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {lang === 'cpp' ? 'C++' : lang}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  setCode(selectedChallenge.starterCode[language] || '')
                }
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Code Textarea */}
            <div className="relative flex-1">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={16}
                spellCheck={false}
                className="w-full h-full p-4 rounded-2xl bg-slate-950 font-mono text-xs sm:text-sm text-emerald-300 focus:outline-none border border-slate-800 focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>

            {/* Candidate Verbal Thought Explanation */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Verbal Explanation (Simulate speaking your algorithm to the interviewer):
              </label>
              <input
                type="text"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="e.g. 'I am using a single-pass hash map to achieve O(n) time and O(n) space...'"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={handleRunTests}
                disabled={isRunningTests}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-all"
              >
                {isRunningTests ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>Run Test Cases</span>
              </button>

              <button
                onClick={handleAiAudit}
                disabled={isAnalyzing || !code.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Auditing Complexity & Bugs...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Technical Code Review</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Test Cases Results */}
          {testResults && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 animate-fade-in">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Test Case Execution
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {testResults.map((tr, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
                      tr.passed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <span>Test Case #{idx + 1}</span>
                    <span className="font-bold">{tr.passed ? 'PASSED' : 'FAILED'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Code Review Results */}
          {aiAnalysis && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 animate-fade-in shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>AI Senior Engineer Review & Complexity Audit</span>
                </div>
                <div className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
                  Score: {aiAnalysis.score}/100
                </div>
              </div>

              {/* Big-O Analysis */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Time Complexity</span>
                    <span className="font-mono text-xs font-bold text-white">
                      {aiAnalysis.timeComplexity}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Space Complexity</span>
                    <span className="font-mono text-xs font-bold text-white">
                      {aiAnalysis.spaceComplexity}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-3 col-span-2 sm:col-span-1">
                  <Layers className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Optimal Bar</span>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {aiAnalysis.optimalTimeComplexity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bugs & Edge Cases */}
              {aiAnalysis.bugsOrEdgeCases?.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    Edge-Cases to Defend in Interview:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {aiAnalysis.bugsOrEdgeCases.map((b: string, bidx: number) => (
                      <li key={bidx}>• {b}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Feedback Quote */}
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-100 leading-relaxed italic">
                "{aiAnalysis.interviewFeedback}"
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
