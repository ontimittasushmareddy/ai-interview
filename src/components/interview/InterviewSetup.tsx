import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  InterviewConfig,
  CompanyType,
  DifficultyLevel,
  InterviewerPersona,
  InterviewType,
} from '../../types';
import { getPhysicalMediaStream, createSimulatedCameraStream } from '../../utils/mediaUtils';
import {
  Sparkles,
  Camera,
  Mic,
  Video,
  Eye,
  Sliders,
  Play,
  Briefcase,
  Building,
  GraduationCap,
  Globe2,
  Users,
  CheckCircle2,
  Zap,
  RefreshCw,
  AlertTriangle,
  Volume2,
  ExternalLink,
} from 'lucide-react';

interface Props {
  onStartInterview: (config: InterviewConfig) => void;
  isLoading: boolean;
}

export const InterviewSetup: React.FC<Props> = ({ onStartInterview, isLoading }) => {
  const { user, activeInterviewConfig, setActiveInterviewConfig } = useApp();
  const [config, setConfig] = useState<InterviewConfig>(activeInterviewConfig);

  // Hardware pre-check state
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testError, setTestError] = useState<string | null>(null);
  const [testVolume, setTestVolume] = useState<number>(0);
  const testVideoRef = useRef<HTMLVideoElement>(null);
  const testStreamRef = useRef<MediaStream | null>(null);
  const testAudioCtxRef = useRef<AudioContext | null>(null);
  const testAnimRef = useRef<number | null>(null);

  const roles = [
    'Full Stack Software Engineer',
    'Frontend Engineer (React / TypeScript)',
    'Backend Engineer (Node.js / Python / Go)',
    'Data Analyst & BI Specialist',
    'Machine Learning / AI Engineer',
    'DevOps & Cloud Infrastructure',
    'Product Manager (Tech)',
    'HR & Business Operations',
  ];

  const companyTypes: CompanyType[] = [
    'FAANG / Tier-1 Tech',
    'High-Growth Startup',
    'Enterprise & Fintech',
    'Consulting & Digital',
  ];

  const experienceLevels = [
    'Fresher / College Graduate (0 yrs)',
    'Junior (1-2 years)',
    'Mid-Level (3-5 years)',
    'Senior (5+ years)',
  ];

  const difficulties: DifficultyLevel[] = ['Standard', 'Challenging', 'Bar-Raiser'];

  const interviewTypes: InterviewType[] = [
    'Technical & Behavioral Mixed',
    'Technical Deep Dive',
    'Behavioral (STAR)',
    'HR & Culture Fit',
    'Situational & Leadership',
    'System Design',
  ];

  const personas: { id: InterviewerPersona; name: string; title: string; style: string; avatar: string }[] = [
    {
      id: 'Alex Vance (Friendly Mentor)',
      name: 'Alex Vance',
      title: 'Senior Engineering Mentor',
      style: 'Supportive, encouraging tone. Gives hints when you hesitate and emphasizes conceptual growth.',
      avatar: '👨‍💼',
    },
    {
      id: 'Elena Rostova (Strict Bar-Raiser)',
      name: 'Elena Rostova',
      title: 'Principal Bar-Raiser (Ex-FAANG)',
      style: 'Strict, uncompromising standards. Drills into edge cases, efficiency trade-offs, and STAR specificity.',
      avatar: '👩‍💼',
    },
    {
      id: 'David Park (Principal Architect)',
      name: 'David Park',
      title: 'Chief Systems Architect',
      style: 'Deep systems focus. Probes concurrency, distributed scale, reliability, and architectural trade-offs.',
      avatar: '🧑‍💻',
    },
    {
      id: 'Sarah Jenkins (Culture & People Lead)',
      name: 'Sarah Jenkins',
      title: 'Head of People & Leadership',
      style: 'Empathetic yet probing. Analyzes conflict resolution, ownership, cross-functional empathy, and culture fit.',
      avatar: '👩‍🏫',
    },
  ];

  const languages = [
    'English',
    'Hindi',
    'Telugu',
    'Tamil',
    'Kannada',
    'Malayalam',
    'Spanish',
    'French',
  ];

  // Test Camera & Microphone on direct user click
  const handleTestHardware = async () => {
    setTestStatus('testing');
    setTestError(null);

    try {
      const stream = await getPhysicalMediaStream(true);
      testStreamRef.current = stream;
      setTestStatus('success');

      if (testVideoRef.current) {
        testVideoRef.current.srcObject = stream;
        testVideoRef.current.play().catch((e) => console.warn(e));
      }

      // Audio volume meter test (if audio tracks exist)
      if (stream.getAudioTracks().length > 0) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          testAudioCtxRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const update = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            setTestVolume(Math.min(100, Math.round((avg / 128) * 100)));
            testAnimRef.current = requestAnimationFrame(update);
          };
          update();
        }
      }
    } catch (err: any) {
      console.warn('Physical camera unavailable in iframe, launching simulated live feed:', err);
      // Auto-fallback to simulated 30fps video stream so preview always displays
      const { stream } = createSimulatedCameraStream(user.name);
      testStreamRef.current = stream;
      setTestStatus('success');

      if (testVideoRef.current) {
        testVideoRef.current.srcObject = stream;
        testVideoRef.current.play().catch((e) => console.warn(e));
      }

      setTestError(
        'Chrome blocked third-party iframe webcam access from aistudio.google.com. Displaying Simulated Live Camera Feed (30 FPS). Click "Open in Standalone Tab" below to allow your physical webcam.'
      );
    }
  };

  const handleStartSimulatedCam = () => {
    if (testStreamRef.current) {
      testStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    const { stream } = createSimulatedCameraStream(user.name);
    testStreamRef.current = stream;
    setTestStatus('success');
    setTestError(null);
    if (testVideoRef.current) {
      testVideoRef.current.srcObject = stream;
      testVideoRef.current.play().catch(() => {});
    }
  };

  // Ensure stream stays bound to video element whenever testStatus changes to success
  useEffect(() => {
    if (testStatus === 'success' && testVideoRef.current && testStreamRef.current) {
      testVideoRef.current.srcObject = testStreamRef.current;
      testVideoRef.current.play().catch((e) => console.warn(e));
    }
  }, [testStatus]);

  useEffect(() => {
    return () => {
      if (testStreamRef.current) {
        testStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (testAudioCtxRef.current && testAudioCtxRef.current.state !== 'closed') {
        testAudioCtxRef.current.close().catch(() => {});
      }
      if (testAnimRef.current) {
        cancelAnimationFrame(testAnimRef.current);
      }
    };
  }, []);

  const applyPreset = (preset: {
    role?: string;
    companyType?: CompanyType;
    difficulty?: DifficultyLevel;
    interviewType?: InterviewType;
    persona?: InterviewerPersona;
  }) => {
    const updated = { ...config, ...preset };
    setConfig(updated);
    setActiveInterviewConfig(updated);
  };

  const handleLaunch = () => {
    // Stop pre-check stream so main room can claim device
    if (testStreamRef.current) {
      testStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (testAudioCtxRef.current && testAudioCtxRef.current.state !== 'closed') {
      testAudioCtxRef.current.close().catch(() => {});
    }
    setActiveInterviewConfig(config);
    onStartInterview(config);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900/90 via-slate-900 to-indigo-950 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Next-Gen Multi-Modal AI Interviewer</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Simulate Real Interviews. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                Master Technical & Behavioral Rounds.
              </span>
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Experience dynamic AI question generation tuned to your resume, real-time vocal feedback,
              filler word tracking, eye-contact detection, and instant STAR-framework evaluation with retry comparison.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-2.5 min-w-[280px]">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Start Scenarios</span>
            </div>
            <button
              onClick={() =>
                applyPreset({
                  role: 'Full Stack Software Engineer',
                  companyType: 'FAANG / Tier-1 Tech',
                  difficulty: 'Bar-Raiser',
                  persona: 'Elena Rostova (Strict Bar-Raiser)',
                  interviewType: 'Technical & Behavioral Mixed',
                })
              }
              className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700/60 hover:border-indigo-500/40 transition-all text-xs group"
            >
              <div className="font-semibold text-white group-hover:text-indigo-200">
                FAANG Bar-Raiser Simulation
              </div>
              <div className="text-[11px] text-slate-400">Strict Persona • High Rigor • Algorithmic</div>
            </button>
            <button
              onClick={() =>
                applyPreset({
                  role: 'Full Stack Software Engineer',
                  companyType: 'High-Growth Startup',
                  difficulty: 'Standard',
                  persona: 'Alex Vance (Friendly Mentor)',
                  interviewType: 'Technical Deep Dive',
                })
              }
              className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700/60 hover:border-indigo-500/40 transition-all text-xs group"
            >
              <div className="font-semibold text-white group-hover:text-indigo-200">
                Startup Full Stack Speedrun
              </div>
              <div className="text-[11px] text-slate-400">Friendly Mentor • Web Stack & Pragmatism</div>
            </button>
            <button
              onClick={() =>
                applyPreset({
                  role: 'Product Manager (Tech)',
                  companyType: 'FAANG / Tier-1 Tech',
                  difficulty: 'Challenging',
                  persona: 'Sarah Jenkins (Culture & People Lead)',
                  interviewType: 'Behavioral (STAR)',
                })
              }
              className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700/60 hover:border-indigo-500/40 transition-all text-xs group"
            >
              <div className="font-semibold text-white group-hover:text-indigo-200">
                Amazon STAR Behavioral Drill
              </div>
              <div className="text-[11px] text-slate-400">Leadership Principles • Conflict & Impact</div>
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Setup Selectors */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Role & Level */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-white font-bold text-base">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              <span>Target Role & Experience Profile</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Job Role
                </label>
                <select
                  value={config.role}
                  onChange={(e) => setConfig({ ...config, role: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Company Type
                </label>
                <select
                  value={config.companyType}
                  onChange={(e) => setConfig({ ...config, companyType: e.target.value as CompanyType })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {companyTypes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Experience Level
                </label>
                <select
                  value={config.experienceLevel}
                  onChange={(e) => setConfig({ ...config, experienceLevel: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {experienceLevels.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Interview Language
                </label>
                <select
                  value={config.language}
                  onChange={(e) => setConfig({ ...config, language: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {languages.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Round Type & Difficulty */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-white font-bold text-base">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <span>Interview Round & Rigor</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Interview Round Focus
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {interviewTypes.map((type) => {
                    const isSelected = config.interviewType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setConfig({ ...config, interviewType: type })}
                        className={`text-left p-3 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div className="font-semibold flex items-center justify-between">
                          <span>{type}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Difficulty Setting
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {difficulties.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setConfig({ ...config, difficulty: d })}
                        className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all ${
                          config.difficulty === d
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Number of Questions
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 5, 8].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setConfig({ ...config, numQuestions: num })}
                        className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all ${
                          config.numQuestions === num
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        {num} Questions
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Interviewer Persona Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-white font-bold text-base">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Select AI Interviewer Persona</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {personas.map((p) => {
                const isSelected = config.persona === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setConfig({ ...config, persona: p.id })}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                        : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl p-2 rounded-xl bg-slate-800 border border-slate-700">
                        {p.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white flex items-center justify-between">
                          <span className="truncate">{p.name}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                        </div>
                        <div className="text-xs text-indigo-300 font-medium truncate">{p.title}</div>
                      </div>
                    </div>
                    <p className="mt-2.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {p.style}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Media Permissions & Action Launch */}
        <div className="space-y-6">
          {/* Live Hardware Pre-check Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Video className="w-4 h-4 text-indigo-400" />
                <span>Pre-Flight Hardware Check</span>
              </div>
              <span className="text-[11px] text-slate-400">Camera & Mic</span>
            </div>

            {/* Test Viewport */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center">
              <video
                ref={testVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover scale-x-[-1] ${
                  testStatus === 'success' ? 'block' : 'hidden'
                }`}
              />

              {testStatus !== 'success' && (
                <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {testStatus === 'testing'
                      ? 'Requesting Camera & Mic...'
                      : testStatus === 'failed'
                      ? 'Hardware Blocked / Virtual Mode Ready'
                      : 'Camera Preview Not Started'}
                  </span>
                </div>
              )}

              {/* Live Volume Meter in Test */}
              {testStatus === 'success' && (
                <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur border border-slate-700 flex items-center justify-between text-[10px] text-white">
                  <span className="flex items-center gap-1 font-semibold text-emerald-400">
                    <Mic className="w-3 h-3" /> Mic Live
                  </span>
                  <div className="w-20 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-100"
                      style={{ width: `${Math.max(10, testVolume)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Error / Advisory Message */}
            {testError && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hardware Advisory</span>
                </div>
                {testError}
              </div>
            )}

            {/* Hardware actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleTestHardware}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                <span>{testStatus === 'success' ? 'Re-test Physical Hardware' : 'Test Physical Camera & Mic'}</span>
              </button>

              <button
                type="button"
                onClick={handleStartSimulatedCam}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
              >
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                <span>Use Simulated Live Camera Feed (30 FPS)</span>
              </button>

              <a
                href={typeof window !== 'undefined' ? window.location.href : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-emerald-300 font-semibold text-[11px] border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-all"
                title="Opens app directly in a new browser tab to bypass third-party iframe camera blocks"
              >
                <ExternalLink className="w-3 h-3 text-emerald-400" />
                <span>Open in Standalone Tab (For Real Webcam)</span>
              </a>
            </div>
          </div>

          {/* Media & Signals Check Switches */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Sensor Toggles
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <Camera className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">Video Feed / Avatar</div>
                    <div className="text-[11px] text-slate-400">Physical or Virtual sensor view</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableVideo}
                  onChange={(e) => setConfig({ ...config, enableVideo: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <Mic className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">Voice & Microphone</div>
                    <div className="text-[11px] text-slate-400">Speech-to-text & pacing analysis</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableVoice}
                  onChange={(e) => setConfig({ ...config, enableVoice: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">Body Language Signals</div>
                    <div className="text-[11px] text-slate-400">Eye-contact & posture feedback</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableBodyLanguage}
                  onChange={(e) => setConfig({ ...config, enableBodyLanguage: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>

          {/* Launch Button Card */}
          <div className="bg-gradient-to-b from-slate-900 to-indigo-950/60 border border-indigo-500/30 rounded-2xl p-6 text-center space-y-4 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Ready for your Mock Round?</h3>
              <p className="text-xs text-slate-400">
                Questions will be tailored to your {config.role} profile.
              </p>
            </div>

            <button
              onClick={handleLaunch}
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Tailored Questions...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Mock Interview</span>
                </>
              )}
            </button>

            <div className="text-[11px] text-slate-500 flex items-center justify-center gap-3">
              <span>⏱ ~{config.numQuestions * 3} Mins</span>
              <span>•</span>
              <span>⭐ Instant Rubric Evaluation</span>
              <span>•</span>
              <span>🔁 Retry Comparison</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
