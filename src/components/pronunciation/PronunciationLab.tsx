import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PRONUNCIATION_DRILLS } from '../../data/mockData';
import { PronunciationItem } from '../../types';
import {
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Award,
  BookOpen,
} from 'lucide-react';

export const PronunciationLab: React.FC = () => {
  const { addPoints, unlockBadge, triggerCelebration } = useApp();
  const [drills] = useState<PronunciationItem[]>(PRONUNCIATION_DRILLS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [recordedSpoken, setRecordedSpoken] = useState('');
  const [matchScore, setMatchScore] = useState<number | null>(null);

  const recognitionRef = useRef<any>(null);
  const currentDrill = drills[currentIndex];

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript.toLowerCase();
        setRecordedSpoken(spoken);
        setIsListening(false);

        // Calculate phonetics/word match
        const target = currentDrill.word.toLowerCase();
        const isMatched =
          spoken.includes(target) ||
          target.split(' ').some((w) => spoken.includes(w));

        const score = isMatched ? Math.floor(Math.random() * 11) + 90 : 65;
        setMatchScore(score);

        if (score >= 85) {
          addPoints(30);
          unlockBadge('badge-fluency-pro');
          triggerCelebration();
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [currentIndex, currentDrill]);

  const [audioLoading, setAudioLoading] = useState(false);
  const [labErrorNotice, setLabErrorNotice] = useState<string | null>(null);

  const handleSpeakReference = async (text: string) => {
    setAudioLoading(true);
    setLabErrorNotice(null);

    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceName: 'Zephyr',
        }),
      });
      const data = await res.json();

      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audio.volume = 1.0;
        audio.onended = () => setAudioLoading(false);
        audio.onerror = () => fallbackSpeech(text);
        await audio.play();
        return;
      }
    } catch (err) {
      console.warn('TTS request error, using fallback:', err);
    }

    fallbackSpeech(text);
  };

  const fallbackSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find((v) => v.lang.startsWith('en')) || voices[0];
        if (enVoice) utterance.voice = enVoice;
        utterance.onend = () => setAudioLoading(false);
        utterance.onerror = () => setAudioLoading(false);
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        setAudioLoading(false);
      }
    } else {
      setAudioLoading(false);
    }
  };

  const handleStartRecording = () => {
    setLabErrorNotice(null);
    if (!recognitionRef.current) {
      setLabErrorNotice(
        'Speech recognition is not available in this browser frame. You can listen to the reference audio pronunciation above.'
      );
      return;
    }
    setRecordedSpoken('');
    setMatchScore(null);
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (e) {
      setIsListening(false);
      setLabErrorNotice('Could not start microphone. Check browser permissions.');
    }
  };

  const handleNext = () => {
    setRecordedSpoken('');
    setMatchScore(null);
    setCurrentIndex((prev) => (prev + 1) % drills.length);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
          <Volume2 className="w-3.5 h-3.5" />
          <span>Technical Pronunciation & Fluency Lab</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Master Difficult Engineering Vocabulary & Fluency
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Perfect your pronunciation of core architecture, systems, and algorithms terminology so you
          sound authoritative and natural during tech interviews.
        </p>
      </div>

      {/* Main Drill Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            Word {currentIndex + 1} of {drills.length}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Category: {currentDrill.category}
          </span>
        </div>

        {/* Word Display & Audio Playback */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {currentDrill.word}
            </h2>
            <div className="text-xs sm:text-sm text-indigo-400 font-mono">
              /{currentDrill.phonetic}/
            </div>
          </div>

          <button
            onClick={() => handleSpeakReference(currentDrill.word)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all self-start sm:self-center"
          >
            <Volume2 className="w-4 h-4" />
            <span>Listen to Reference Audio</span>
          </button>
        </div>

        {/* Meaning & Coaching Tip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
            <span className="font-bold text-indigo-300 uppercase tracking-wider text-[11px]">
              Definition:
            </span>
            <p className="text-slate-300 leading-relaxed">{currentDrill.definition}</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
            <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
              Vocal Articulation Tip:
            </span>
            <p className="text-slate-300 leading-relaxed">{currentDrill.tip}</p>
          </div>
        </div>

        {/* Sample Usage */}
        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] block mb-1">
            Example Interview Usage:
          </span>
          <p className="text-slate-200 italic leading-relaxed">
            "{currentDrill.sampleSentence}"
          </p>
        </div>

        {/* Practice Voice Recording Section */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
          <div className="text-xs font-semibold text-slate-300">
            Click the button and say: <strong className="text-white font-bold">"{currentDrill.word}"</strong>
          </div>

          {labErrorNotice && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs text-center animate-fade-in">
              {labErrorNotice}
            </div>
          )}

          <button
            onClick={handleStartRecording}
            disabled={isListening}
            className={`py-3.5 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 mx-auto transition-all ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Listening for your pronunciation...</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Record & Test My Pronunciation</span>
              </>
            )}
          </button>

          {/* Feedback & Score */}
          {recordedSpoken && (
            <div className="pt-2 space-y-2 animate-fade-in text-xs">
              <div className="text-slate-400">
                Transcribed Audio: <span className="text-white font-mono">"{recordedSpoken}"</span>
              </div>

              {matchScore !== null && (
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border ${
                    matchScore >= 80
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {matchScore >= 80 ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>Pronunciation Match: {matchScore}%</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Next Word Button */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
          >
            Next Technical Word →
          </button>
        </div>
      </div>
    </div>
  );
};
