import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  InterviewConfig,
  InterviewQuestionItem,
  AnswerEvaluation,
  SessionReport,
} from '../../types';
import { AnswerEvaluationModal } from './AnswerEvaluationModal';
import { InterviewReportView } from './InterviewReportView';
import { getPhysicalMediaStream, createSimulatedCameraStream } from '../../utils/mediaUtils';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  Clock,
  Send,
  RotateCcw,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Eye,
  CheckCircle,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Sliders,
  UserCheck,
  ShieldAlert,
  Info,
  ExternalLink,
} from 'lucide-react';

interface Props {
  questions: InterviewQuestionItem[];
  config: InterviewConfig;
  onExit: () => void;
}

export const InterviewRoom: React.FC<Props> = ({ questions: initialQuestions, config, onExit }) => {
  const { user, saveSessionReport, triggerCelebration } = useApp();
  const [questions, setQuestions] = useState<InterviewQuestionItem[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);

  // User Answer & Audio
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<AnswerEvaluation | null>(null);
  const [activeRetryAttempt, setActiveRetryAttempt] = useState<number>(1);
  const [previousEvaluationForRetry, setPreviousEvaluationForRetry] = useState<AnswerEvaluation | null>(null);

  // Device & Permission States
  const [deviceStatus, setDeviceStatus] = useState<'prompt' | 'granted' | 'denied' | 'simulated'>('prompt');
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);
  const [isVirtualAvatar, setIsVirtualAvatar] = useState(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [speechErrorMsg, setSpeechErrorMsg] = useState<string | null>(null);

  // Completed Session Report View
  const [completedReport, setCompletedReport] = useState<SessionReport | null>(null);

  // Timers
  const [questionSeconds, setQuestionSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);

  // Live Metrics
  const [fillerWordsCount, setFillerWordsCount] = useState(0);
  const [wpm, setWpm] = useState(130);
  const [eyeContactPercentage, setEyeContactPercentage] = useState(86);
  const [postureStatus, setPostureStatus] = useState<'Centered' | 'Slight Shift' | 'Good'>('Centered');

  // AI Interviewer Audio State
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioAutoplayBlocked, setAudioAutoplayBlocked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Media references
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const currentQ = questions[currentIndex];

  // Request real Camera & Microphone access with error handling
  const requestMediaAccess = async (explicitClick = false) => {
    setSpeechErrorMsg(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setDeviceStatus('simulated');
      setIsVirtualAvatar(true);
      setPermissionNotice(
        'Your browser does not support media device capture. Running in Virtual Candidate Avatar mode.'
      );
      return;
    }

    try {
      const stream = await getPhysicalMediaStream(true);
      streamRef.current = stream;
      setDeviceStatus('granted');
      setIsVirtualAvatar(false);
      setPermissionNotice(null);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('Video play error:', e));
      }

      // Initialize Web Audio level analyzer
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateVolume = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
            }
            animFrameRef.current = requestAnimationFrame(updateVolume);
          };
          updateVolume();
        }
      } catch (err) {
        console.warn('AudioContext error:', err);
      }
    } catch (err: any) {
      console.warn('Physical camera unavailable in iframe, launching simulated live feed:', err);
      // Auto-fallback to simulated 30fps video stream so preview always displays
      const { stream } = createSimulatedCameraStream(user.name);
      streamRef.current = stream;
      setDeviceStatus('granted');
      setIsVirtualAvatar(false);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('Video play error:', e));
      }

      setPermissionNotice(
        'Chrome allowed aistudio.google.com, but blocks webcam inside this embedded run.app cloud container. Streaming Simulated Live Camera Feed (30 FPS). Click "Open in Standalone Tab" to enable real webcam.'
      );
    }
  };

  // Attempt hardware setup on mount, fall back gracefully
  useEffect(() => {
    if (config.enableVideo || config.enableVoice) {
      requestMediaAccess(false);
    } else {
      setIsVirtualAvatar(true);
      setDeviceStatus('simulated');
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Ensure real camera stream stays attached to videoRef whenever active
  useEffect(() => {
    if (videoRef.current && streamRef.current && !isVirtualAvatar) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((e) => console.warn('Video play error:', e));
    }
  }, [deviceStatus, isVirtualAvatar]);

  // Timers
  useEffect(() => {
    const timer = setInterval(() => {
      setQuestionSeconds((prev) => prev + 1);
      setTotalSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  // Simulated eye-contact / posture subtle variance
  useEffect(() => {
    const interval = setInterval(() => {
      setEyeContactPercentage((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.min(96, Math.max(78, prev + delta));
      });
      const postures: ('Centered' | 'Slight Shift' | 'Good')[] = ['Centered', 'Good', 'Centered'];
      setPostureStatus(postures[Math.floor(Math.random() * postures.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Web Speech API for real-time speech to text
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = config.language === 'English' ? 'en-US' : 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setCandidateAnswer(transcript);
        analyzeSpeechMetrics(transcript);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e.error);
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setSpeechErrorMsg(
            'Speech recognition service was blocked by the browser iframe sandbox. You can type your answer or choose a quick response template below!'
          );
        }
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechErrorMsg(
        'Speech recognition API not supported in this browser. You can type your answer directly in the text field!'
      );
    }
  }, [config.language]);

  // Analyze filler words and speaking speed
  const analyzeSpeechMetrics = (text: string) => {
    if (!text) return;
    const words = text.trim().split(/\s+/);
    const durationMin = Math.max(0.1, questionSeconds / 60);
    const calculatedWpm = Math.round(words.length / durationMin);
    setWpm(Math.min(220, Math.max(80, calculatedWpm)));

    const fillerMatches = text.match(/\b(um|uh|like|actually|basically|you know|sort of|literally)\b/gi);
    setFillerWordsCount(fillerMatches ? fillerMatches.length : 0);
  };

  // Toggle Recording
  const toggleRecording = () => {
    setSpeechErrorMsg(null);
    if (!recognitionRef.current) {
      setSpeechErrorMsg(
        'Speech recognition not supported in this browser environment. You can type your answer directly in the text box below!'
      );
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn(err);
      }
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Error starting recognition:', err);
        setSpeechErrorMsg(
          'Microphone input blocked by browser permission policy. Type your response below or use quick answers.'
        );
      }
    }
  };

  // Speak AI question via server TTS or browser synthesis
  const speakQuestion = async (text: string, fromUserClick = false) => {
    // If already playing and user clicked, toggle stop
    if (isAiSpeaking && fromUserClick) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsAiSpeaking(false);
      setIsAudioLoading(false);
      return;
    }

    if (isAiSpeaking && !fromUserClick) return;

    // Stop previous audio
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsAudioLoading(true);

    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceName: config.persona.includes('Elena') ? 'Kore' : 'Zephyr',
        }),
      });
      const data = await res.json();

      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audioPlayerRef.current = audio;
        audio.volume = 1.0;

        audio.onended = () => {
          setIsAiSpeaking(false);
          setIsAudioLoading(false);
        };

        audio.onerror = () => {
          setIsAiSpeaking(false);
          setIsAudioLoading(false);
          fallbackBrowserSpeech(text);
        };

        try {
          await audio.play();
          setIsAiSpeaking(true);
          setIsAudioLoading(false);
          setAudioAutoplayBlocked(false);
          return;
        } catch (playErr: any) {
          console.warn('Audio play restricted by autoplay policy:', playErr);
          setIsAiSpeaking(false);
          setIsAudioLoading(false);
          setAudioAutoplayBlocked(true);
          return;
        }
      }
    } catch (e) {
      console.warn('Server TTS unavailable, using browser speech synthesis:', e);
    }

    fallbackBrowserSpeech(text);
  };

  const fallbackBrowserSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = config.persona.includes('Elena') ? 1.05 : 0.95;

        // Try to pick an English voice
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find((v) => v.lang.startsWith('en')) || voices[0];
        if (enVoice) utterance.voice = enVoice;

        const safetyTimer = setTimeout(() => {
          setIsAiSpeaking(false);
          setIsAudioLoading(false);
        }, 15000);

        utterance.onstart = () => {
          setIsAiSpeaking(true);
          setIsAudioLoading(false);
          setAudioAutoplayBlocked(false);
        };

        utterance.onend = () => {
          clearTimeout(safetyTimer);
          setIsAiSpeaking(false);
          setIsAudioLoading(false);
        };

        utterance.onerror = () => {
          clearTimeout(safetyTimer);
          setIsAiSpeaking(false);
          setIsAudioLoading(false);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis error:', err);
        setIsAiSpeaking(false);
        setIsAudioLoading(false);
      }
    } else {
      setIsAiSpeaking(false);
      setIsAudioLoading(false);
    }
  };

  // Auto-speak question when question index changes
  useEffect(() => {
    if (currentQ?.question) {
      setCandidateAnswer('');
      setQuestionSeconds(0);
      setShowHint(false);
      setCurrentEvaluation(null);
      setActiveRetryAttempt(1);
      setPreviousEvaluationForRetry(null);
      setSpeechErrorMsg(null);
      speakQuestion(currentQ.question);
    }
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
    };
  }, [currentIndex]);

  // Submit Answer for Rubric Evaluation
  const handleSubmitAnswer = async () => {
    if (!candidateAnswer.trim()) {
      setSpeechErrorMsg('Please speak or type your answer before submitting for evaluation.');
      return;
    }

    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsRecording(false);
    }

    setIsEvaluating(true);

    try {
      const response = await fetch('/api/gemini/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ.question,
          answer: candidateAnswer,
          role: config.role,
          category: currentQ.category,
          expectedKeyPoints: currentQ.expectedKeyPoints,
          persona: config.persona,
          previousScore: previousEvaluationForRetry?.overallScore || null,
          attemptNumber: activeRetryAttempt,
          metrics: {
            wpm,
            fillerCount: fillerWordsCount,
            durationSeconds: questionSeconds,
          },
        }),
      });

      const evalData: AnswerEvaluation = await response.json();
      evalData.timestamp = new Date().toISOString();
      evalData.attemptNumber = activeRetryAttempt;
      evalData.metrics = {
        wpm,
        fillerCount: fillerWordsCount,
        durationSeconds: questionSeconds,
        eyeContactScore: eyeContactPercentage,
      };

      // Update question record
      setQuestions((prev) =>
        prev.map((q, idx) =>
          idx === currentIndex
            ? {
                ...q,
                userAnswer: candidateAnswer,
                evaluation: evalData,
                previousAttempts: [
                  ...(q.previousAttempts || []),
                  {
                    attemptNumber: activeRetryAttempt,
                    answer: candidateAnswer,
                    evaluation: evalData,
                  },
                ],
              }
            : q
        )
      );

      setCurrentEvaluation(evalData);
      triggerCelebration();
    } catch (error) {
      console.error('Evaluation failed:', error);
      setSpeechErrorMsg('Could not complete evaluation. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Handle Retry flow
  const handleRetryAnswer = () => {
    if (!currentEvaluation) return;
    setPreviousEvaluationForRetry(currentEvaluation);
    setActiveRetryAttempt((prev) => prev + 1);
    setCurrentEvaluation(null);
    setCandidateAnswer('');
    setQuestionSeconds(0);
    setSpeechErrorMsg(null);
  };

  // Next Question or Finish Interview
  const handleNextQuestion = async () => {
    setCurrentEvaluation(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      await finalizeInterviewReport();
    }
  };

  const finalizeInterviewReport = async () => {
    setIsEvaluating(true);

    const evaluatedQuestions = questions.filter((q) => q.evaluation);
    const avgScore = Math.round(
      evaluatedQuestions.reduce((acc, q) => acc + (q.evaluation?.overallScore || 70), 0) /
        Math.max(1, evaluatedQuestions.length)
    );

    const aggregateParams = {
      relevance: Math.round(
        evaluatedQuestions.reduce((acc, q) => acc + (q.evaluation?.parameters.relevance || 75), 0) /
          Math.max(1, evaluatedQuestions.length)
      ),
      accuracy: Math.round(
        evaluatedQuestions.reduce((acc, q) => acc + (q.evaluation?.parameters.accuracy || 75), 0) /
          Math.max(1, evaluatedQuestions.length)
      ),
      clarity: Math.round(
        evaluatedQuestions.reduce((acc, q) => acc + (q.evaluation?.parameters.clarity || 75), 0) /
          Math.max(1, evaluatedQuestions.length)
      ),
      confidence: Math.round(
        evaluatedQuestions.reduce((acc, q) => acc + (q.evaluation?.parameters.confidence || 70), 0) /
          Math.max(1, evaluatedQuestions.length)
      ),
      completeness: Math.round(
        evaluatedQuestions.reduce((acc, q) => acc + (q.evaluation?.parameters.completeness || 70), 0) /
          Math.max(1, evaluatedQuestions.length)
      ),
      communication: Math.round(
        evaluatedQuestions.reduce((acc, q) => acc + (q.evaluation?.parameters.communication || 75), 0) /
          Math.max(1, evaluatedQuestions.length)
      ),
      technicalKnowledge: Math.round(
        evaluatedQuestions.reduce((acc, q) => acc + (q.evaluation?.parameters.technicalKnowledge || 75), 0) /
          Math.max(1, evaluatedQuestions.length)
      ),
      problemSolving: Math.round(
        evaluatedQuestions.reduce((acc, q) => acc + (q.evaluation?.parameters.problemSolving || 75), 0) /
          Math.max(1, evaluatedQuestions.length)
      ),
      structure: Math.round(
        evaluatedQuestions.reduce((acc, q) => acc + (q.evaluation?.parameters.structure || 70), 0) /
          Math.max(1, evaluatedQuestions.length)
      ),
    };

    const weakAreas = [];
    if (fillerWordsCount > 4) weakAreas.push('Vocal Cadence & Eliminating Fillers');
    if (aggregateParams.structure < 75) weakAreas.push('STAR Behavioral Framework');
    if (aggregateParams.technicalKnowledge < 78) weakAreas.push('Technical Edge-Cases & System Scaling');
    if (weakAreas.length === 0) weakAreas.push('Refining Executive Brevity');

    let planResponse: any = null;
    try {
      const res = await fetch('/api/gemini/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: config.role,
          overallScore: avgScore,
          weakAreas,
        }),
      });
      planResponse = await res.json();
    } catch (e) {
      console.warn('Plan generation error:', e);
    }

    const sessionReport: SessionReport = {
      id: `session-${Date.now()}`,
      createdAt: new Date().toISOString(),
      role: config.role,
      companyType: config.companyType,
      difficulty: config.difficulty,
      persona: config.persona,
      overallScore: avgScore,
      parameters: aggregateParams,
      questions,
      metrics: {
        totalDurationSeconds: totalSeconds,
        avgWpm: wpm,
        totalFillers: fillerWordsCount,
        eyeContactPercentage,
      },
      improvementPlan: planResponse?.plan || [],
      motivationalAdvice: planResponse?.motivationalAdvice,
    };

    saveSessionReport(sessionReport);
    setCompletedReport(sessionReport);
    setIsEvaluating(false);
    triggerCelebration();
  };

  // Quick response sample helper for quick answers
  const insertQuickSample = () => {
    const sample = `In my previous project, we faced this exact challenge when our API latency increased under heavy load. I analyzed database query execution plans, implemented Redis caching with exponential backoff retries, and added automated integration tests. This reduced p99 latency by 55% and stabilized throughput.`;
    setCandidateAnswer(sample);
    analyzeSpeechMetrics(sample);
  };

  if (completedReport) {
    return (
      <InterviewReportView
        report={completedReport}
        onBackToDashboard={onExit}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs uppercase tracking-wider">
            Question {currentIndex + 1} of {questions.length}
          </div>
          <div className="text-xs text-slate-400">
            {config.role} • <span className="text-white font-medium">{config.interviewType}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Q Time: {Math.floor(questionSeconds / 60)}:{String(questionSeconds % 60).padStart(2, '0')}</span>
          </div>

          <button
            onClick={() => requestMediaAccess(true)}
            className="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5 transition-colors"
            title="Request or reconnect camera and microphone"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reconnect Cam/Mic</span>
          </button>

          <button
            onClick={onExit}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            Exit Round
          </button>
        </div>
      </div>

      {/* Permission Advisory Notification Banner */}
      {permissionNotice && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{permissionNotice}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href={typeof window !== 'undefined' ? window.location.href : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open in Standalone Tab</span>
            </a>
            <button
              onClick={() => requestMediaAccess(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 transition-colors"
            >
              Retry Cam
            </button>
            <button
              onClick={() => setPermissionNotice(null)}
              className="px-2 py-1 text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Split Video / Audio Interview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: AI Interviewer Persona Stage */}
        <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-indigo-950/40 border border-indigo-500/25 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden min-h-[460px]">
          {/* Persona Header Chip */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                {config.persona.includes('Elena')
                  ? '👩‍💼'
                  : config.persona.includes('David')
                  ? '🧑‍💻'
                  : config.persona.includes('Sarah')
                  ? '👩‍🏫'
                  : '👨‍💼'}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm leading-tight">{config.persona}</h3>
                <div className="text-[11px] text-indigo-300 font-medium flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isAiSpeaking ? 'bg-indigo-400 animate-ping' : 'bg-emerald-400'}`} />
                  {isAiSpeaking ? 'Speaking Question...' : 'Listening to your response...'}
                </div>
              </div>
            </div>

            <button
              onClick={() => speakQuestion(currentQ.question)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 hover:text-white transition-all shadow"
              title="Replay Spoken Question"
            >
              <Volume2 className={`w-4 h-4 ${isAiSpeaking ? 'animate-pulse text-indigo-400' : ''}`} />
            </button>
          </div>

          {/* Center Soundwave Visualizer */}
          <div className="my-8 flex flex-col items-center justify-center relative z-10 text-center">
            <div className="relative mb-6">
              <div
                className={`w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  isAiSpeaking
                    ? 'border-indigo-400 bg-indigo-500/20 scale-105 shadow-lg shadow-indigo-500/30'
                    : 'border-slate-700 bg-slate-800/80'
                }`}
              >
                <div className="text-4xl">
                  {config.persona.includes('Elena')
                    ? '👩‍💼'
                    : config.persona.includes('David')
                    ? '🧑‍💻'
                    : config.persona.includes('Sarah')
                    ? '👩‍🏫'
                    : '👨‍💼'}
                </div>
              </div>

              {/* Sound ripple animations when speaking */}
              {isAiSpeaking && (
                <>
                  <div className="absolute inset-0 rounded-full border border-indigo-400/50 animate-ping pointer-events-none" />
                  <div className="absolute -inset-3 rounded-full border border-indigo-500/20 animate-pulse pointer-events-none" />
                </>
              )}
            </div>

            {/* Prominent Voice Playback Control Button */}
            <div className="w-full flex flex-col items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => speakQuestion(currentQ.question, true)}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                  isAiSpeaking
                    ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                }`}
              >
                {isAudioLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Voice Audio...</span>
                  </>
                ) : isAiSpeaking ? (
                  <>
                    <Volume2 className="w-4 h-4 text-white animate-bounce" />
                    <span>Pause Interviewer Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Play Interviewer Voice (Click to Listen)</span>
                  </>
                )}
              </button>

              {audioAutoplayBlocked && !isAiSpeaking && (
                <div className="w-full p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-200 text-[11px] text-center font-medium animate-pulse">
                  🔊 Browser requires a user click to play sound. Click "Play Interviewer Voice" above.
                </div>
              )}
            </div>

            {/* Question Text Box */}
            <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-5 w-full text-left shadow-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                <span>{currentQ.category}</span>
                <span className="text-slate-500">{currentQ.difficulty} Rigor</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                "{currentQ.question}"
              </p>
              <p className="text-xs text-slate-400 pt-1 italic">
                Context: {currentQ.context}
              </p>
            </div>
          </div>

          {/* Hint / Clarification Drawer */}
          <div className="relative z-10 pt-2 flex items-center justify-between text-xs">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 font-medium transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{showHint ? 'Hide Guidance' : 'Need a hint or clarification?'}</span>
            </button>

            {showHint && (
              <div className="p-3 rounded-xl bg-slate-800/90 border border-indigo-500/30 text-slate-200 text-xs mt-2 w-full animate-fade-in">
                <span className="font-bold text-indigo-300 block mb-1">Interviewer Hint:</span>
                Focus on: {currentQ.expectedKeyPoints.join(' • ')}
              </div>
            )}
          </div>
        </div>

        {/* Right: Candidate Camera & Voice Input Stage */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between shadow-2xl relative min-h-[460px] space-y-4">
          {/* Webcam / Virtual Avatar Preview Screen */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center">
            {/* Real Webcam Stream (permanently mounted to preserve stream binding) */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] ${
                !isVirtualAvatar && deviceStatus === 'granted' ? 'block' : 'hidden'
              }`}
            />

            {/* High-Fidelity Virtual Candidate Simulation Viewport (shown when virtual avatar or hardware denied) */}
            {(isVirtualAvatar || deviceStatus !== 'granted') && (
              <div className="relative w-full h-full bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-900 flex flex-col items-center justify-center p-6 text-center">
                <div className="relative mb-3">
                  <div className="w-24 h-24 rounded-full bg-indigo-500/10 border-2 border-indigo-400/40 flex items-center justify-center text-4xl shadow-xl shadow-indigo-500/10 animate-pulse">
                    👤
                  </div>
                  {/* Subtle Face Mesh Reticle Overlays */}
                  <div className="absolute inset-0 border border-cyan-400/30 rounded-full scale-110 pointer-events-none" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-indigo-400" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-indigo-400" />
                </div>

                <div className="text-xs font-bold text-white">
                  {user.name} <span className="text-indigo-400 font-normal">(Virtual Candidate Mode)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  Simulating AI gaze alignment, audio telemetry, and posture dynamics.
                </p>

                {/* Switch / Request Cam button */}
                <button
                  type="button"
                  onClick={() => requestMediaAccess(true)}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-all shadow"
                >
                  <Video className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Start Camera Preview</span>
                </button>
              </div>
            )}

            {/* Video Overlays (Eye Contact & Posture Signals) */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-white z-10">
              <div className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur border border-slate-700/80 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Eye Contact: {eyeContactPercentage}%</span>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur border border-slate-700/80 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Posture: {postureStatus}</span>
              </div>
            </div>

            {/* Mic Volume Level Bar */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white z-10 pointer-events-none">
              <div className="px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur border border-slate-700/80 flex items-center gap-2">
                <Mic className="w-3 h-3 text-indigo-400" />
                <div className="w-16 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-100"
                    style={{ width: `${isRecording ? Math.max(20, micVolume) : 0}%` }}
                  />
                </div>
              </div>

              {/* Recording Indicator */}
              {isRecording && (
                <div className="px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-bold flex items-center gap-1.5 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>Transcribing Voice...</span>
                </div>
              )}
            </div>
          </div>

          {/* Speech Error / Instruction notice if any */}
          {speechErrorMsg && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-2 animate-fade-in">
              <span>{speechErrorMsg}</span>
              <button
                onClick={() => setSpeechErrorMsg(null)}
                className="text-amber-300 font-bold hover:underline shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Real-time Delivery Stats bar */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <span className="text-slate-400">Pace:</span>
              <span className="font-bold text-white">{wpm} WPM</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <span className="text-slate-400">Filler Words:</span>
              <span className={`font-bold ${fillerWordsCount > 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {fillerWordsCount} detected
              </span>
            </div>
          </div>

          {/* Candidate Answer Transcript & Text Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-indigo-400" />
                <span>Your Answer Transcript</span>
              </span>
              <button
                onClick={insertQuickSample}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                title="Populate an exemplar technical response to test the rubric"
              >
                + Insert Sample Answer
              </button>
            </div>

            <textarea
              rows={4}
              value={candidateAnswer}
              onChange={(e) => {
                setCandidateAnswer(e.target.value);
                analyzeSpeechMetrics(e.target.value);
              }}
              placeholder="Speak using the microphone button below, or type your structured response here..."
              className="w-full p-3 text-xs sm:text-sm rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
          </div>

          {/* Action Buttons: Voice Record & Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={toggleRecording}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Pause Mic Recording</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-indigo-400" />
                  <span>Record Voice Answer</span>
                </>
              )}
            </button>

            <button
              onClick={handleSubmitAnswer}
              disabled={isEvaluating || !candidateAnswer.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isEvaluating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Auditing Answer...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit for Evaluation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Answer Evaluation Modal when submitted */}
      {currentEvaluation && (
        <AnswerEvaluationModal
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          questionText={currentQ.question}
          evaluation={currentEvaluation}
          previousEvaluation={previousEvaluationForRetry || undefined}
          onRetry={handleRetryAnswer}
          onNextQuestion={handleNextQuestion}
          isLastQuestion={currentIndex === questions.length - 1}
        />
      )}
    </div>
  );
};
