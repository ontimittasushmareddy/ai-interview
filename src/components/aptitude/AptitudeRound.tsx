import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { APTITUDE_QUESTIONS } from '../../data/mockData';
import { AptitudeQuestion } from '../../types';
import {
  Brain,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Award,
} from 'lucide-react';

export const AptitudeRound: React.FC = () => {
  const { addPoints, triggerCelebration } = useApp();
  const [questions] = useState<AptitudeQuestion[]>(APTITUDE_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optIdx,
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });
    return correct;
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    const score = calculateScore();
    addPoints(score * 15);
    triggerCelebration();
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentIndex(0);
    setTimeLeft(600);
  };

  const correctCount = calculateScore();
  const percentage = Math.round((correctCount / questions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
            <Brain className="w-3.5 h-3.5" />
            <span>Aptitude & Logical Reasoning Screener</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Campus Placement & Technical Screening Test
          </h1>
          <p className="text-xs text-slate-400">
            Quantitative, Logical Reasoning, Verbal Ability, and Data Interpretation.
          </p>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span className="font-mono text-sm font-bold">
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Main Question Card */}
      {!isSubmitted ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Question Nav Track */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {currentQ.category}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {Object.keys(selectedAnswers).length} answered
            </span>
          </div>

          {/* Question Statement */}
          <div className="text-base sm:text-lg font-bold text-white leading-relaxed">
            {currentQ.question}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, oidx) => {
              const isSelected = selectedAnswers[currentIndex] === oidx;
              return (
                <div
                  key={oidx}
                  onClick={() => handleSelectOption(oidx)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs sm:text-sm ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {String.fromCharCode(65 + oidx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                </div>
              );
            })}
          </div>

          {/* Question Tracker & Bottom Actions */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Quick jump pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {questions.map((_, qidx) => (
                <button
                  key={qidx}
                  onClick={() => setCurrentIndex(qidx)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    currentIndex === qidx
                      ? 'bg-indigo-600 text-white'
                      : selectedAnswers[qidx] !== undefined
                      ? 'bg-slate-700 text-indigo-300 border border-indigo-500/40'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {qidx + 1}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-2 transition-all"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Test & View Solutions</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-6 animate-fade-in">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-4">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Aptitude Round Completed
            </span>
            <div className="text-5xl font-black text-white">
              {correctCount} / {questions.length} Correct
            </div>
            <div className="text-base text-slate-300 font-semibold">
              Accuracy: <span className="text-emerald-400">{percentage}%</span>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={handleRestart}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4 text-indigo-400" />
                <span>Retake Aptitude Round</span>
              </button>
            </div>
          </div>

          {/* Solutions & Explanations Review */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Detailed Solutions & Explanations
            </h3>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userChoice = selectedAnswers[idx];
                const isCorrect = userChoice === q.correctIndex;
                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-400">Question #{idx + 1}</span>
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          isCorrect ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" /> Incorrect
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-white">{q.question}</p>

                    <div className="text-xs space-y-1">
                      <div className="text-slate-400">
                        Your Choice:{' '}
                        <strong className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                          {userChoice !== undefined
                            ? q.options[userChoice]
                            : 'Unanswered'}
                        </strong>
                      </div>
                      <div className="text-emerald-400 font-medium">
                        Correct Answer: {q.options[q.correctIndex]}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                      <span className="font-bold text-indigo-300 block mb-0.5">Explanation:</span>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
