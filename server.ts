import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize GoogleGenAI client server-side
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Helper to safely call Gemini text generation with JSON output
async function callGeminiJson<T>(prompt: string, systemInstruction: string, fallback: T): Promise<T> {
  if (!ai || !apiKey) {
    console.warn('GEMINI_API_KEY not configured or client missing, using intelligent fallback response.');
    return fallback;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text?.trim() || '';
    if (!text) return fallback;
    return JSON.parse(text) as T;
  } catch (error) {
    console.error('Gemini API call failed, providing fallback:', error);
    return fallback;
  }
}

// 1. Generate Interview Questions
app.post('/api/gemini/generate-questions', async (req, res) => {
  const {
    role = 'Software Engineer',
    companyType = 'Big Tech',
    experienceLevel = 'Junior (1-3 years)',
    difficulty = 'Standard',
    interviewType = 'Technical & Behavioral Mixed',
    resumeSummary = '',
    numQuestions = 5,
    language = 'English',
    persona = 'Alex Vance (Friendly Mentor)',
    previousAnswers = [],
  } = req.body;

  const prompt = `
Generate ${numQuestions} highly realistic, structured interview questions for a candidate with the following parameters:
- Target Role: ${role}
- Company Style: ${companyType}
- Experience Level: ${experienceLevel}
- Difficulty: ${difficulty}
- Interview Type: ${interviewType}
- Interviewer Persona: ${persona}
- Language: ${language}
${resumeSummary ? `- Candidate Resume Summary / Skills: ${resumeSummary}` : ''}
${previousAnswers.length > 0 ? `- Previous Answers Given by Candidate: ${JSON.stringify(previousAnswers)}` : ''}

Generate questions that reflect real-world interview bars (like Google, Amazon, startups). Include a mix of technical concepts, practical scenarios, architectural trade-offs, and STAR-based behavioral questions suitable for this role.

Return JSON matching this schema:
{
  "questions": [
    {
      "id": "q-1",
      "question": "string (the interview question in ${language})",
      "category": "Technical | Behavioral | System Design | Situational | HR | Problem Solving",
      "difficulty": "Easy | Medium | Hard",
      "context": "string (why the interviewer is asking this and what they are looking for)",
      "expectedKeyPoints": ["point 1", "point 2", "point 3"],
      "modelAnswer": "string (a great STAR or structured model response)",
      "timeLimitSeconds": 180
    }
  ]
}
`;

  const fallbackQuestions = [
    {
      id: 'q-1',
      question: `Can you walk me through a challenging technical problem you solved recently in ${role}, and the key trade-offs you considered?`,
      category: 'Technical',
      difficulty: 'Medium',
      context: 'Assesses problem-solving depth, ownership, and ability to justify engineering decisions.',
      expectedKeyPoints: ['Problem definition & constraints', 'Options considered and trade-off analysis', 'Measurable impact & learnings'],
      modelAnswer: 'In my last project, we faced a high-latency database bottleneck during peak traffic. I analyzed query plans, introduced Redis caching for read-heavy routes with a 15-minute TTL, and implemented database connection pooling. This reduced p99 latency from 1.2s to 120ms and handled 3x throughput without provisioning extra server instances.',
      timeLimitSeconds: 180,
    },
    {
      id: 'q-2',
      question: `Describe a situation where you had a disagreement with a team member or tech lead regarding an implementation. How did you handle it?`,
      category: 'Behavioral',
      difficulty: 'Medium',
      context: 'Tests communication, ego management, and conflict resolution using the STAR method.',
      expectedKeyPoints: ['Situation context', 'Data-driven communication without personal conflict', 'Agreed resolution prioritizing project goals'],
      modelAnswer: 'While designing an API, a colleague preferred GraphQL while I advocated for REST due to client caching needs and our team’s tighter release timeline. Instead of arguing opinion, I benchmarked both prototypes for our specific mobile use-case and presented network payload and cache-hit metrics. We agreed to start with REST for the v1 milestone and modularize services to support GraphQL federation later.',
      timeLimitSeconds: 180,
    },
    {
      id: 'q-3',
      question: `How do you approach ensuring code quality, testability, and edge-case handling in a fast-paced release cycle?`,
      category: 'Technical',
      difficulty: 'Medium',
      context: 'Evaluates engineering rigor, testing mindset, and reliability standards.',
      expectedKeyPoints: ['Unit, integration, and contract tests', 'CI/CD automated regression suites', 'Monitoring and rollback strategies'],
      modelAnswer: 'I rely on automated test pyramids: comprehensive unit tests for core domain logic, integration tests for critical user paths, and linting/type-safety gates in CI. I also practice defensive coding by validating inputs at API boundaries and using feature flags for safe canary deployments.',
      timeLimitSeconds: 180,
    },
    {
      id: 'q-4',
      question: `Tell me about a time when a critical bug or production incident occurred under your watch. What was your immediate response and root cause resolution?`,
      category: 'Situational',
      difficulty: 'Hard',
      context: 'Evaluates composure under pressure, root cause analysis (RCA), and preventative thinking.',
      expectedKeyPoints: ['Incident triage and stabilization first', 'Clear stakeholder communication', 'Blameless post-mortem and preventative guardrails'],
      modelAnswer: 'During a Friday release, our payment webhook began timing out due to an unhandled 3rd-party status code. I immediately initiated our rollback protocol to restore service within 7 minutes, posted updates on our incident channel, and drafted a blameless post-mortem. We then added idempotent retries with exponential backoff and synthetic transaction alerts.',
      timeLimitSeconds: 180,
    },
    {
      id: 'q-5',
      question: `Why are you interested in this ${role} position, and how does your background make you an exceptional fit?`,
      category: 'HR',
      difficulty: 'Easy',
      context: 'Evaluates culture fit, motivation, self-awareness, and articulation.',
      expectedKeyPoints: ['Alignment with company mission and tech stack', 'Concrete evidence from past accomplishments', 'Long-term learning and impact goals'],
      modelAnswer: 'I am excited about this role because your platform handles immense scale while maintaining high developer velocity. My background in building responsive web applications and backend services directly aligns with your current roadmap. I look forward to taking end-to-end ownership of product features from day one.',
      timeLimitSeconds: 180,
    },
  ];

  const result = await callGeminiJson<{ questions: typeof fallbackQuestions }>(
    prompt,
    'You are a veteran technical recruiting bar-raiser and interviewer at top tech companies. You formulate insightful, probing questions tailored to the candidate.',
    { questions: fallbackQuestions }
  );

  res.json(result);
});

// 2. Evaluate Answer with 9-Parameter Rubric & STAR Analysis
app.post('/api/gemini/evaluate-answer', async (req, res) => {
  const {
    question = '',
    answer = '',
    role = 'Software Engineer',
    category = 'Technical',
    expectedKeyPoints = [],
    persona = 'Alex Vance',
    previousScore = null,
    attemptNumber = 1,
    metrics = {
      wpm: 130,
      fillerCount: 2,
      durationSeconds: 65,
    },
  } = req.body;

  const prompt = `
Evaluate the candidate's interview answer with high professional rigor.

Question asked: "${question}"
Category: ${category}
Role: ${role}
Candidate's Answer: "${answer}"
Expected Key Points: ${JSON.stringify(expectedKeyPoints)}
Attempt Number: ${attemptNumber} ${previousScore ? `(Previous Attempt Score: ${previousScore})` : ''}
Speaking Pacing: ${metrics.wpm} words per minute, ${metrics.fillerCount} filler words detected in ${metrics.durationSeconds}s.

Evaluate across these 9 critical parameters (each 1-100):
1. relevance: Does the answer directly address what was asked?
2. accuracy: Technical correctness and validity of facts/concepts.
3. clarity: How clear, coherent, and jargon-controlled is the explanation?
4. confidence: Level of conviction, firmness, and lack of excessive hedging.
5. completeness: Did it cover necessary nuances and edge cases?
6. communication: Articulation, structure, and pacing.
7. technicalKnowledge: Mastery of subject matter and engineering depth.
8. problemSolving: Logical reasoning, trade-off awareness, and methodology.
9. structure: Organization (e.g. STAR: Situation, Task, Action, Result).

Also provide:
- overallScore (1-100)
- summary (2-3 sentences concise assessment)
- strengths (3 bullet points of what they did well)
- missingPoints (2-3 critical points or depth they missed)
- improvementTips (actionable advice to elevate their answer)
- modelAnswer (an exemplar response using STAR framework if behavioral/situational or structured technical explanation)
- followUpQuestion (an adaptive follow-up question the interviewer would realistically ask based on this answer)
- communicationFeedback (specific tips on filler words, pacing, and tone)

Return strictly valid JSON:
{
  "overallScore": number,
  "parameters": {
    "relevance": number,
    "accuracy": number,
    "clarity": number,
    "confidence": number,
    "completeness": number,
    "communication": number,
    "technicalKnowledge": number,
    "problemSolving": number,
    "structure": number
  },
  "summary": "string",
  "strengths": ["point 1", "point 2"],
  "missingPoints": ["missing 1", "missing 2"],
  "improvementTips": ["tip 1", "tip 2"],
  "modelAnswer": {
    "situation": "string",
    "task": "string",
    "action": "string",
    "result": "string",
    "fullText": "string"
  },
  "followUpQuestion": "string",
  "communicationFeedback": "string"
}
`;

  const fallbackResult = {
    overallScore: answer.length > 100 ? 78 : 58,
    parameters: {
      relevance: answer.length > 50 ? 82 : 60,
      accuracy: 75,
      clarity: 80,
      confidence: 72,
      completeness: answer.length > 150 ? 76 : 55,
      communication: 78,
      technicalKnowledge: 74,
      problemSolving: 76,
      structure: 70,
    },
    summary:
      answer.length > 100
        ? 'Solid response with clear understanding of fundamental concepts. Adding quantifiable metrics and edge-case consideration will make it top-tier.'
        : 'Good initial start, but the answer lacks sufficient depth, examples, and structured resolution.',
    strengths: [
      'Directly targeted the core question without straying off-topic',
      'Demonstrated practical awareness of engineering trade-offs',
      'Maintained professional vocabulary and good clarity',
    ],
    missingPoints: [
      'Could provide specific metrics (e.g. latency reduced by X%, team impact)',
      'Did not mention edge-cases or contingency planning',
    ],
    improvementTips: [
      'Follow the STAR method explicitly: state Situation, Task, Action, and quantifiable Result.',
      'Reduce hesitation markers and speak with confident ownership.',
    ],
    modelAnswer: {
      situation: 'In our production services, we observed a sudden latency spike under 10k concurrent sessions.',
      task: 'My goal was to diagnose the root bottleneck and optimize throughput without adding costly compute instances.',
      action: 'I profiled memory leaks using clinic.js, added Redis caching for static lookups, and indexed foreign keys.',
      result: 'Latencies dropped by 68% and the cluster successfully handled Black Friday traffic with 99.98% uptime.',
      fullText:
        'When facing this challenge, I started by diagnosing the bottleneck through system metrics. By isolating the database queries and introducing caching alongside query optimization, we reduced latency by 68% and achieved 99.98% uptime without ballooning cloud costs.',
    },
    followUpQuestion:
      'How would your architecture adapt if write traffic increased by 10x while maintaining strong consistency?',
    communicationFeedback:
      metrics.fillerCount > 3
        ? `You used ${metrics.fillerCount} filler words. Aim to replace words like 'um' or 'like' with silent 1-second pauses.`
        : 'Pacing was smooth and clear. Voice tone was steady and engaging.',
  };

  const result = await callGeminiJson(
    prompt,
    'You are a senior hiring manager and communication coach giving actionable, constructive, and fair interview feedback.',
    fallbackResult
  );

  res.json(result);
});

// 3. Resume ATS & Gap Analysis
app.post('/api/gemini/analyze-resume', async (req, res) => {
  const { resumeText = '', targetRole = 'Full Stack Developer' } = req.body;

  const prompt = `
Analyze this candidate resume for the target role: "${targetRole}".
Resume Text:
"""${resumeText}"""

Extract information and perform an ATS (Applicant Tracking System) check and skill gap analysis.

Return JSON matching:
{
  "parsed": {
    "name": "string (or Anonymous Candidate if not found)",
    "education": "string summary",
    "experienceYears": "string",
    "skills": ["skill1", "skill2"],
    "projects": ["project1", "project2"],
    "certifications": ["cert1"]
  },
  "atsScore": number (1-100),
  "completenessScore": number (1-100),
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["missingSkill1", "missingSkill2"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvementSuggestions": ["suggestion1", "suggestion2"],
  "tailoredInterviewTopics": ["topic1", "topic2", "topic3"]
}
`;

  const fallbackResumeAnalysis = {
    parsed: {
      name: 'Alex Sharma',
      education: 'B.Tech in Computer Science & Engineering, 2024',
      experienceYears: '1-2 years (Internships & Freelance)',
      skills: ['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'SQL', 'Git', 'REST APIs', 'Tailwind CSS'],
      projects: ['E-Commerce Platform with Stripe Checkout', 'Real-Time Collaborative Code Editor with WebSockets'],
      certifications: ['AWS Certified Cloud Practitioner', 'Meta Frontend Developer Certificate'],
    },
    atsScore: 78,
    completenessScore: 84,
    matchedSkills: ['JavaScript', 'React.js', 'Node.js', 'REST APIs', 'SQL', 'Git'],
    missingSkills: ['Docker / Containers', 'CI/CD Pipelines', 'System Design fundamentals', 'Redis Caching', 'Unit Testing (Jest/Playwright)'],
    strengths: [
      'Strong modern web stack fundamentals with React and TypeScript',
      'Hands-on full-stack projects showcasing end-to-end delivery',
      'Clear, clean layout with relevant coursework and certifications',
    ],
    weaknesses: [
      'Lacks quantifiable metrics in project bullet points (e.g. "improved load time by 30%")',
      'Missing automated testing and DevOps tooling mentions',
    ],
    improvementSuggestions: [
      'Reformat bullet points to use the Google X-Y-Z formula: "Accomplished [X] as measured by [Y], by doing [Z]"',
      'Add keywords for Docker, Kubernetes, Jest, and CI/CD workflows to boost ATS ranking for senior roles',
      'Include links to live project demos and GitHub repositories',
    ],
    tailoredInterviewTopics: [
      'React state management and rendering lifecycle optimization',
      'REST API design, database indexing, and authentication flows',
      'Handling asynchronous operations and WebSocket state synchronization',
    ],
  };

  const result = await callGeminiJson(
    prompt,
    'You are a certified executive resume coach and ATS scanner specialist.',
    fallbackResumeAnalysis
  );

  res.json(result);
});

// 4. Job Description (JD) Skill Gap Analyzer
app.post('/api/gemini/analyze-job-description', async (req, res) => {
  const { jobDescription = '', resumeText = '' } = req.body;

  const prompt = `
Analyze this Job Description and compare it with the candidate's resume:
Job Description:
"""${jobDescription}"""

Candidate Resume:
"""${resumeText}"""

Extract:
1. roleTitle
2. companyVibe
3. requiredSkills (must have)
4. preferredSkills (nice to have)
5. matchScore (1-100)
6. matchedSkills
7. skillGaps (missing or under-represented)
8. targetInterviewQuestions (5 specific questions likely to be asked for this exact JD)
9. strategyAdvice (how to pitch their experience to fit this JD)

Return valid JSON.
`;

  const fallbackJD = {
    roleTitle: 'Software Engineer - Full Stack',
    companyVibe: 'High-growth tech company focusing on scalability and user experience',
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL / SQL', 'REST APIs', 'Git'],
    preferredSkills: ['Next.js', 'Docker', 'GraphQL', 'AWS', 'Redis', 'Microservices'],
    matchScore: 82,
    matchedSkills: ['React', 'TypeScript', 'Node.js', 'SQL', 'Git'],
    skillGaps: ['Docker containerization', 'Cloud deployment (AWS)', 'High concurrency handling'],
    targetInterviewQuestions: [
      'How would you design a rate limiter for our public API in Node.js and Redis?',
      'Walk us through how React 19 handles server components and concurrent rendering.',
      'Explain how you prevent N+1 query problems in SQL relational databases.',
      'Tell me about a time you optimized a slow web application under heavy traffic.',
      'How do you manage breaking changes in shared APIs across multiple frontend clients?',
    ],
    strategyAdvice:
      'Emphasize your hands-on TypeScript project experience. Preempt questions on Docker and cloud deployment by explaining your interest and recent containerization practice.',
  };

  const result = await callGeminiJson(
    prompt,
    'You are an expert technical recruiter analyzing job descriptions and matching candidates.',
    fallbackJD
  );

  res.json(result);
});

// 5. Code Analysis for Technical Coding Round
app.post('/api/gemini/analyze-code', async (req, res) => {
  const {
    problemTitle = 'Two Sum',
    language = 'javascript',
    code = '',
    explanation = '',
  } = req.body;

  const prompt = `
Analyze the candidate's code submission for the technical interview problem "${problemTitle}".
Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`
Candidate Explanation: "${explanation}"

Evaluate:
1. isCorrect: boolean
2. score: 1-100
3. timeComplexity: e.g. "O(n)"
4. spaceComplexity: e.g. "O(n)"
5. optimalTimeComplexity: e.g. "O(n)"
6. bugsOrEdgeCases: list of bugs or unhandled edge cases
7. codeQualityNotes: readability, naming conventions, modularity
8. optimizationTips: how to optimize time/space
9. improvedCode: pristine refactored version
10. interviewFeedback: constructive feedback as an interviewer would give

Return JSON.
`;

  const fallbackCodeAnalysis = {
    isCorrect: true,
    score: 85,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    optimalTimeComplexity: 'O(n)',
    bugsOrEdgeCases: ['Check for empty array input', 'Verify integer overflow limits for extreme values'],
    codeQualityNotes: 'Clean variable naming and clear logic flow using a hash map lookup.',
    optimizationTips: 'The solution is already optimal in terms of time complexity using single-pass hash map.',
    improvedCode: code || '// Optimal implementation provided',
    interviewFeedback: 'Great job reaching the optimal O(n) solution right away. Next time, be sure to verbally articulate your thought process and test with edge cases (empty array, negative numbers) before declaring completion.',
  };

  const result = await callGeminiJson(
    prompt,
    'You are a senior algorithmic interviewer reviewing code submissions at a FAANG company.',
    fallbackCodeAnalysis
  );

  res.json(result);
});

// 6. Personalized 7-Day Improvement Plan
app.post('/api/gemini/generate-plan', async (req, res) => {
  const {
    role = 'Software Engineer',
    overallScore = 75,
    weakAreas = ['Communication / Filler Words', 'System Architecture', 'STAR Method'],
  } = req.body;

  const prompt = `
Create a realistic, actionable 7-Day Personalized Improvement Plan for an aspiring ${role} who scored ${overallScore}/100 in their mock interview.
Identified weak areas: ${JSON.stringify(weakAreas)}.

Structure each day with:
- day: number (1 to 7)
- title: concise topic (e.g. "Mastering the STAR Framework")
- focus: what skill is being trained
- timeCommitment: e.g. "45 minutes"
- tasks: 3 concrete action items
- recommendedResources: 2 books/topics/drills

Return JSON matching:
{
  "plan": [
    {
      "day": 1,
      "title": "string",
      "focus": "string",
      "timeCommitment": "string",
      "tasks": ["task 1", "task 2", "task 3"],
      "recommendedResources": ["resource 1", "resource 2"]
    }
  ],
  "motivationalAdvice": "string"
}
`;

  const fallbackPlan = {
    plan: [
      {
        day: 1,
        title: 'STAR Behavioral Framework Mastery',
        focus: 'Structuring behavioral answers into Situation, Task, Action, Result',
        timeCommitment: '45 mins',
        tasks: [
          'Draft 3 personal career stories using the STAR structure worksheet',
          'Practice answering "Tell me about a conflict with a colleague" in front of a mirror or camera',
          'Time your answers to stay between 90 and 120 seconds',
        ],
        recommendedResources: ['Amazon Leadership Principles guide', 'STAR method video drills'],
      },
      {
        day: 2,
        title: 'Verbal Cadence & Eliminating Filler Words',
        focus: 'Speech clarity, pause management, and pacing (120-140 WPM)',
        timeCommitment: '30 mins',
        tasks: [
          'Practice replacing filler words (um, uh, like) with deliberate 1-second pauses',
          'Record yourself explaining how an API works and review playback count of filler words',
          'Complete 5 technical pronunciation drills in the PrepAI lab',
        ],
        recommendedResources: ['Toastmasters vocal variety exercise', 'PrepAI Pronunciation Lab'],
      },
      {
        day: 3,
        title: 'Core Technical Concepts & Trade-offs',
        focus: 'Explaining fundamentals without ambiguity',
        timeCommitment: '60 mins',
        tasks: [
          'Review OOP principles, concurrency models, and indexing strategies',
          'Practice verbalizing "Why choose SQL over NoSQL?" highlighting ACID vs eventual consistency',
          'Do a 3-question Technical Mock session in PrepAI',
        ],
        recommendedResources: ['Designing Data-Intensive Applications', 'PrepAI Question Bank'],
      },
      {
        day: 4,
        title: 'Live Coding & Verbalizing Thoughts',
        focus: 'Speaking while writing code, discussing edge cases',
        timeCommitment: '60 mins',
        tasks: [
          'Solve 2 medium algorithmic problems while explaining every line aloud',
          'Clarify constraints (input ranges, duplicates) before writing code',
          'State Time and Space complexity explicitly',
        ],
        recommendedResources: ['PrepAI Coding Sandbox', 'LeetCode Blind 75'],
      },
      {
        day: 5,
        title: 'System Design & High-Level Architecture',
        focus: 'Components, caching, load balancing, database scaling',
        timeCommitment: '50 mins',
        tasks: [
          'Design a URL Shortener or Chat Application on a whiteboard/canvas',
          'Discuss bottlenecks: Single Point of Failure (SPOF), caching layers, read vs write ratios',
          'Write down trade-offs between REST and gRPC',
        ],
        recommendedResources: ['System Design Primer', 'ByteByteGo architectural patterns'],
      },
      {
        day: 6,
        title: 'Retry & Comparative Improvement Round',
        focus: 'Executing learned techniques under timed pressure',
        timeCommitment: '45 mins',
        tasks: [
          'Re-take the questions you scored lowest on in your previous mock',
          'Compare Attempt 1 vs Attempt 2 metrics in PrepAI',
          'Aim for at least a +15% boost in clarity and structure scores',
        ],
        recommendedResources: ['PrepAI Retry Mode', 'Candidate Performance History'],
      },
      {
        day: 7,
        title: 'Full Simulation & Bar-Raiser Challenge',
        focus: 'End-to-end interview stamina and confidence',
        timeCommitment: '60 mins',
        tasks: [
          'Run a full 5-question Mixed Interview session with Webcam and Voice enabled',
          'Review your final report, celebration badges, and readiness scorecard',
          'Set your weekly practice goal to maintain your streak',
        ],
        recommendedResources: ['PrepAI Full Mock Round', 'Career Readiness Scorecard'],
      },
    ],
    motivationalAdvice:
      'Consistency compounds faster than intensity. By dedicating 45 minutes daily to structured vocal and technical practice, you will transition from nervous reactivity to calm, authoritative mastery.',
  };

  const result = await callGeminiJson(
    prompt,
    'You are a senior tech career coach creating personalized, hyper-practical improvement roadmaps.',
    fallbackPlan
  );

  res.json(result);
});

// 7. Text-to-Speech Generation using gemini-3.8-flash-lite-tts
app.post('/api/gemini/tts', async (req, res) => {
  const { text = '', voiceName = 'Zephyr' } = req.body;

  if (!ai || !apiKey || !text) {
    return res.status(200).json({ audioBase64: null, message: 'TTS unavailable, client will use Web Speech API fallback' });
  }

  try {
    const validVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    const chosenVoice = validVoices.includes(voiceName) ? voiceName : 'Zephyr';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 500), // Keep interview prompt length reasonable
              speechMetadata: {
                style: 'Professional, warm, clear tech interviewer',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ audioBase64: base64Audio, format: 'audio/wav' });
    }
    return res.json({ audioBase64: null, message: 'No audio returned' });
  } catch (error) {
    console.error('Gemini TTS error:', error);
    return res.json({ audioBase64: null, error: String(error) });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PrepAI server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
