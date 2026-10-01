import {
  UserProfile,
  CodingChallenge,
  AptitudeQuestion,
  PronunciationItem,
  BadgeItem,
  InterviewQuestionItem,
} from '../types';

export const DEFAULT_USER: UserProfile = {
  id: 'user-001',
  name: 'Alex Sharma',
  email: 'alex.sharma@example.edu',
  role: 'candidate',
  education: 'B.Tech in Computer Science & Engineering, National Institute of Technology',
  branch: 'Computer Science',
  targetRole: 'Full Stack Software Engineer',
  experienceLevel: 'Junior (1-2 years)',
  skills: [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Express',
    'PostgreSQL',
    'Git',
    'Tailwind CSS',
    'REST APIs',
    'HTML/CSS',
  ],
  bio: 'Aspiring Full Stack Engineer passionate about scalable web architecture, clean code, and intuitive user experiences.',
  resumeText: `ALEX SHARMA
alex.sharma@example.edu | +1 (555) 019-2834 | github.com/alexsharma | linkedin.com/in/alexsharma

EDUCATION
National Institute of Technology — B.Tech in Computer Science & Engineering (2020 - 2024)
CGPA: 8.7 / 10.0 | Relevant Coursework: Data Structures & Algorithms, Database Systems, Web Technologies, Computer Networks

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, C++, SQL
Frontend: React.js, Next.js, Redux Toolkit, Tailwind CSS, HTML5/CSS3
Backend: Node.js, Express, PostgreSQL, MongoDB, RESTful APIs
Tools & Platforms: Git, GitHub, Docker, Postman, Linux, Vercel

PROJECTS
Collaborative Code Canvas (React, Node.js, WebSockets, Redis)
• Engineered a real-time multiplayer code workspace supporting syntax highlighting, operational transforms, and multi-user chat.
• Reduced socket synchronization latency by 45% utilizing debounced Redis Pub/Sub channels.
• Implemented role-based document access and JWT authentication for 500+ active beta developers.

FinTrack — Expense & Investment Analytics Engine (Next.js, TypeScript, PostgreSQL)
• Built an interactive dashboard featuring dynamic chart analytics, category budgeting, and automated recurring expense tracking.
• Optimized PostgreSQL query performance with composite B-tree indexing, decreasing report generation time from 850ms to 95ms.
• Designed responsive dark/light UI following WCAG 2.1 accessibility standards.

EXPERIENCE
Software Engineering Intern — CloudScale Labs (May 2023 - Aug 2023)
• Contributed to core SaaS microservices serving 50k+ daily API requests using Express and TypeScript.
• Authored 60+ automated unit and integration tests using Jest and Supertest, expanding test coverage by 28%.
• Collaborated in bi-weekly Agile sprints, participating in peer code reviews and sprint retrospective demos.

CERTIFICATIONS & AWARDS
• AWS Certified Cloud Practitioner (2023)
• 1st Runner Up — National Hackathon 2023 (Out of 120 participating engineering teams)
• LeetCode 300+ Problems Solved (Knight Badge, Top 15% Contest Rating)`,
};

export const SAMPLE_RESUMES = [
  {
    id: 'fresher-cs',
    title: 'Fresher CS Graduate (Alex Sharma)',
    role: 'Full Stack Software Engineer',
    content: DEFAULT_USER.resumeText,
  },
  {
    id: 'data-analyst',
    title: 'Junior Data Analyst (Priya Patel)',
    role: 'Data Analyst / BI Specialist',
    content: `PRIYA PATEL
priya.patel@example.com | linkedin.com/in/priyapatel-data

EDUCATION
B.Sc in Statistics & Data Science — University of Tech (2021 - 2024)

SKILLS
Python (Pandas, NumPy, Matplotlib, Scikit-Learn), SQL, Tableau, Power BI, Excel (Advanced, Macros), Statistical Hypothesis Testing, ETL Pipelines

PROJECTS
Customer Churn Prediction Dashboard
• Analyzed 20,000+ telecom customer transaction logs using Pandas to identify churn risk factors.
• Built an interactive Tableau dashboard tracking monthly retention rates and feature importance metrics.
E-Commerce Sales Funnel Analysis
• Processed multi-table relational schema using PostgreSQL window functions to compute conversion drop-offs.`,
  },
  {
    id: 'devops-cloud',
    title: 'Cloud & DevOps Associate (Rohan Verma)',
    role: 'DevOps / Cloud Engineer',
    content: `ROHAN VERMA
rohan.verma@example.com | github.com/rohan-devops

EDUCATION
B.Tech in Information Technology (2020 - 2024)

SKILLS
Docker, Kubernetes, AWS (EC2, S3, RDS, IAM, CloudWatch), Terraform, GitHub Actions, Linux/Bash, Python, Prometheus, Grafana

PROJECTS
Automated GitOps CI/CD Pipeline
• Architected automated GitHub Actions workflow to build, test, and deploy containerized microservices to AWS EKS.
• Managed Infrastructure-as-Code using Terraform modules, cutting provisioning setup from 3 hours to 8 minutes.`,
  },
];

export const CODING_CHALLENGES: CodingChallenge[] = [
  {
    id: 'code-1',
    title: 'Two Sum (Optimal Hash Map)',
    difficulty: 'Easy',
    category: 'Arrays & Hash Tables',
    timeLimit: 20,
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have **exactly one solution**, and you may not use the *same* element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Write your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def twoSum(nums, target):
    # Write your code here
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); i++) {
            int comp = target - nums[i];
            if (map.find(comp) != map.end()) {
                return {map[comp], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};`,
    },
    testCases: [
      { input: '[2,7,11,15], target=9', expected: '[0,1]' },
      { input: '[3,2,4], target=6', expected: '[1,2]' },
      { input: '[3,3], target=6', expected: '[0,1]' },
    ],
    hints: [
      'Can you check if target - current_num exists in a lookup table in O(1) time?',
      'Store each number index in a hash map as you iterate through the list.',
    ],
  },
  {
    id: 'code-2',
    title: 'Valid Parentheses (Stack Protocol)',
    difficulty: 'Easy',
    category: 'Stack & Strings',
    timeLimit: 20,
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only "()[]{}"'],
    starterCode: {
      javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char in map) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}`,
      python: `def isValid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack`,
      java: `class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(') st.push(')');
            else if (c == '{') st.push('}');
            else if (c == '[') st.push(']');
            else if (st.empty() || st.top() != c) return false;
            else st.pop();
        }
        return st.empty();
    }
};`,
    },
    testCases: [
      { input: '"()"', expected: 'true' },
      { input: '"()[]{}"', expected: 'true' },
      { input: '"(]"', expected: 'false' },
      { input: '"([)]"', expected: 'false' },
    ],
    hints: [
      'Use a Last-In First-Out (LIFO) stack data structure.',
      'When seeing a closing bracket, verify that the top element of the stack is the matching opener.',
    ],
  },
  {
    id: 'code-3',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'Sliding Window & Hash Set',
    timeLimit: 30,
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.',
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3.',
      },
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {
  let maxLength = 0;
  let left = 0;
  const seen = new Map();
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (seen.has(char) && seen.get(char) >= left) {
      left = seen.get(char) + 1;
    }
    seen.set(char, right);
    maxLength = Math.max(maxLength, right - left + 1);
  }
  return maxLength;
}`,
      python: `def lengthOfLongestSubstring(s: str) -> int:
    char_map = {}
    max_len = 0
    start = 0
    for i, char in enumerate(s):
        if char in char_map and char_map[char] >= start:
            start = char_map[char] + 1
        char_map[char] = i
        max_len = max(max_len, i - start + 1)
    return max_len`,
      java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        int max = 0, left = 0;
        Map<Character, Integer> map = new HashMap<>();
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c) && map.get(c) >= left) {
                left = map.get(c) + 1;
            }
            map.put(c, right);
            max = Math.max(max, right - left + 1);
        }
        return max;
    }
}`,
      cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        vector<int> last(256, -1);
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.size(); right++) {
            if (last[s[right]] >= left) left = last[s[right]] + 1;
            last[s[right]] = right;
            maxLen = max(maxLen, right - left + 1);
        }
        return maxLen;
    }
};`,
    },
    testCases: [
      { input: '"abcabcbb"', expected: '3' },
      { input: '"bbbbb"', expected: '1' },
      { input: '"pwwkew"', expected: '3' },
    ],
    hints: [
      'Use a sliding window with two pointers: left and right.',
      'Maintain the latest seen index of each character to advance the left pointer in O(1).',
    ],
  },
];

export const APTITUDE_QUESTIONS: AptitudeQuestion[] = [
  {
    id: 'apt-1',
    category: 'Quantitative',
    difficulty: 'Medium',
    question:
      'A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train in meters?',
    options: ['120 meters', '150 meters', '180 meters', '324 meters'],
    correctIndex: 1,
    explanation:
      'Speed in m/s = 60 * (5/18) = 50/3 m/s. Length of train = Speed * Time = (50/3) * 9 = 150 meters.',
  },
  {
    id: 'apt-2',
    category: 'Logical Reasoning',
    difficulty: 'Medium',
    question:
      'In a certain code, "COMPUTER" is written as "RFUVQNPC". How is "MEDICINE" written in that same code?',
    options: ['EOJDJEFM', 'MFEDJJOE', 'MFEJDJOE', 'EOJDEJFM'],
    correctIndex: 0,
    explanation:
      'The letters are reversed and each letter in between is replaced with its subsequent alphabetical character (+1). Thus MEDICINE becomes EOJDJEFM.',
  },
  {
    id: 'apt-3',
    category: 'Quantitative',
    difficulty: 'Hard',
    question:
      'A and B together can do a piece of work in 12 days, which B and C together can do in 16 days. After A has been working at it for 5 days and B for 7 days, C finishes it in 13 days. In how many days could C alone finish the work?',
    options: ['16 days', '24 days', '32 days', '48 days'],
    correctIndex: 1,
    explanation:
      '5*(A+B) + 2*(B+C) + 11*C = 1. Substituting (A+B)=1/12 and (B+C)=1/16: 5/12 + 2/16 + 11*C = 1 => 11*C = 1 - (13/24) = 11/24. Therefore C alone takes 24 days.',
  },
  {
    id: 'apt-4',
    category: 'Verbal Ability',
    difficulty: 'Easy',
    question:
      'Choose the word that is most nearly OPPOSITE in meaning to the word "METICULOUS":',
    options: ['Painstaking', 'Scrupulous', 'Careless', 'Fastidious'],
    correctIndex: 2,
    explanation:
      'Meticulous means showing great attention to detail and very careful. The antonym is Careless.',
  },
  {
    id: 'apt-5',
    category: 'Logical Reasoning',
    difficulty: 'Medium',
    question:
      'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
    options: ['Brother', 'Uncle', 'Cousin', 'Father'],
    correctIndex: 3,
    explanation:
      'The "only son of Suresh’s mother" is Suresh himself. Therefore, the boy in the photograph is Suresh’s son, meaning Suresh is the Father.',
  },
  {
    id: 'apt-6',
    category: 'Data Interpretation',
    difficulty: 'Medium',
    question:
      'A company’s revenue was $1.2M in Q1, $1.5M in Q2, $1.8M in Q3, and $2.4M in Q4. What is the percentage increase in revenue from Q1 to Q4?',
    options: ['50%', '75%', '100%', '120%'],
    correctIndex: 2,
    explanation:
      'Percentage increase = ((2.4 - 1.2) / 1.2) * 100% = (1.2 / 1.2) * 100% = 100%.',
  },
  {
    id: 'apt-7',
    category: 'Quantitative',
    difficulty: 'Easy',
    question:
      'The average of five consecutive numbers is 20. What is the largest of these numbers?',
    options: ['20', '21', '22', '24'],
    correctIndex: 2,
    explanation:
      'Let numbers be x-2, x-1, x, x+1, x+2. The average is the middle number x = 20. The largest number is x+2 = 22.',
  },
  {
    id: 'apt-8',
    category: 'Verbal Ability',
    difficulty: 'Medium',
    question:
      'Select the sentence with correct grammatical structure:',
    options: [
      'Neither the manager nor the engineers was present at the deployment.',
      'Neither the manager nor the engineers were present at the deployment.',
      'Neither the manager nor the engineers is present at the deployment.',
      'Neither the manager or the engineers was present at the deployment.',
    ],
    correctIndex: 1,
    explanation:
      'In a "neither... nor" construction, the verb agrees with the subject closer to it ("engineers" is plural, requiring "were").',
  },
];

export const PRONUNCIATION_DRILLS: PronunciationItem[] = [
  {
    id: 'pron-1',
    word: 'Idempotency',
    phonetic: 'eye-dem-POH-ten-see',
    category: 'Distributed Systems & REST',
    definition: 'Property of an operation where applying it multiple times has the same outcome as applying it once.',
    tip: 'Stress the third syllable: eye-dem-POH-ten-see. Common in discussing PUT vs POST API design.',
    sampleSentence: 'A robust payment webhook must guarantee idempotency using unique request keys.',
  },
  {
    id: 'pron-2',
    word: 'Asynchronous',
    phonetic: 'ay-SING-kruh-nuhs',
    category: 'Concurrency & Event Loops',
    definition: 'Occurring independently of the main program execution flow without blocking subsequent operations.',
    tip: 'Begin with a clean "ay" sound, followed by "SING-kruh-nuhs". Do not pronounce it as "a-sync-ronus".',
    sampleSentence: 'We handled high-throughput I/O using asynchronous event streams in Node.js.',
  },
  {
    id: 'pron-3',
    word: 'Polymorphism',
    phonetic: 'pah-lee-MOR-fih-zuhm',
    category: 'Object-Oriented Programming',
    definition: 'The ability of different classes to respond to the same interface or method call in their own specific way.',
    tip: 'Emphasis on "MOR": pah-lee-MOR-fih-zuhm. Remember Greek roots: poly (many) and morph (form).',
    sampleSentence: 'Subtype polymorphism allowed us to swap database repository drivers seamlessly.',
  },
  {
    id: 'pron-4',
    word: 'Kubernetes',
    phonetic: 'koo-ber-NET-eez',
    category: 'DevOps & Containers',
    definition: 'Open-source container orchestration platform automating deployment and scaling of applications.',
    tip: 'End with "eez", not "tes": koo-ber-NET-eez. Often abbreviated as K8s.',
    sampleSentence: 'Our microservice cluster automatically scaled replicas via the Kubernetes Horizontal Pod Autoscaler.',
  },
  {
    id: 'pron-5',
    word: 'Authentication vs Authorization',
    phonetic: 'aw-then-tih-KAY-shuhn vs aw-thur-ih-ZAY-shuhn',
    category: 'Security & Identity',
    definition: 'Authentication verifies identity (who you are); Authorization verifies permissions (what you can access).',
    tip: 'Clearly articulate "Auth-N" versus "Auth-Z" during system design rounds.',
    sampleSentence: 'We decoupled authentication via OAuth2 tokens from authorization role validation.',
  },
  {
    id: 'pron-6',
    word: 'Hierarchy',
    phonetic: 'HYE-uh-rahr-kee',
    category: 'Software Architecture',
    definition: 'A system in which members or items are ranked or categorized one above the other according to status.',
    tip: 'Three clear syllables: HYE-er-ar-kee. Avoid swallowing the middle vowel.',
    sampleSentence: 'The component hierarchy was streamlined by moving shared state to React Context.',
  },
];

export const INITIAL_BADGES: BadgeItem[] = [
  {
    id: 'badge-first-interview',
    title: 'First Step to Offer',
    description: 'Completed your very first AI Mock Interview round',
    icon: '🎯',
    unlocked: true,
    unlockedAt: '2026-09-28',
    category: 'interview',
  },
  {
    id: 'badge-star-master',
    title: 'STAR Method Champion',
    description: 'Scored 85%+ on Answer Structure across 3 behavioral questions',
    icon: '⭐',
    unlocked: true,
    unlockedAt: '2026-09-30',
    category: 'rubric',
  },
  {
    id: 'badge-clean-code',
    title: 'Algorithm Virtuoso',
    description: 'Solved an algorithmic coding challenge with optimal O(n) complexity',
    icon: '💻',
    unlocked: false,
    category: 'coding',
  },
  {
    id: 'badge-fluency-pro',
    title: 'Silver Tongue',
    description: 'Delivered an answer with zero detected filler words and optimal WPM',
    icon: '🎤',
    unlocked: false,
    category: 'rubric',
  },
  {
    id: 'badge-bar-raiser',
    title: 'Bar-Raiser Challenger',
    description: 'Faced the strict Elena Rostova persona and achieved an 80+ score',
    icon: '🔥',
    unlocked: false,
    category: 'interview',
  },
  {
    id: 'badge-retry-hero',
    title: 'Continuous Learner',
    description: 'Retried an interview answer and gained a +20% score improvement',
    icon: '🔁',
    unlocked: false,
    category: 'interview',
  },
  {
    id: 'badge-streak-7',
    title: '7-Day Practice Streak',
    description: 'Practiced mock interviews or aptitude drills for 7 days in a row',
    icon: '⚡',
    unlocked: false,
    category: 'streak',
  },
];

export const QUESTION_BANK: InterviewQuestionItem[] = [
  {
    id: 'qb-1',
    question: 'How do you optimize a slow React application experiencing noticeable frame drops and high render latency?',
    category: 'Technical - Frontend',
    difficulty: 'Medium',
    context: 'Tests deep knowledge of React reconciliation, profiler metrics, memoization, and DOM virtualization.',
    expectedKeyPoints: [
      'React Profiler usage to isolate unnecessary re-renders',
      'useMemo / useCallback / React.memo judicious application',
      'List virtualization (react-window/virtualizer) for large datasets',
      'Code splitting and lazy loading heavy components',
    ],
    timeLimitSeconds: 180,
  },
  {
    id: 'qb-2',
    question: 'Explain the difference between optimistic concurrency control and pessimistic locking in relational databases.',
    category: 'Technical - Backend',
    difficulty: 'Hard',
    context: 'Assesses database transaction isolation, locking overhead, and handling concurrent writes in distributed systems.',
    expectedKeyPoints: [
      'Pessimistic locking uses SELECT FOR UPDATE, blocking concurrent readers/writers',
      'Optimistic locking uses version numbers / timestamps, verifying on commit',
      'Trade-offs: low vs high contention environments',
    ],
    timeLimitSeconds: 180,
  },
  {
    id: 'qb-3',
    question: 'Tell me about a time when you received harsh or unexpected feedback during a code review. How did you react?',
    category: 'Behavioral - STAR',
    difficulty: 'Medium',
    context: 'Amazon / Google leadership bar: Openness to feedback, humility, and prioritizing engineering excellence over ego.',
    expectedKeyPoints: [
      'Situation: Context of the PR and the critical feedback received',
      'Action: Stepped back, avoided emotional defense, scheduled a 10-minute sync to understand nuances',
      'Result: Refactored code to improve maintainability and codified learnings into team lint rules',
    ],
    timeLimitSeconds: 180,
  },
  {
    id: 'qb-4',
    question: 'How would you design a scalable URL shortener service (like Bitly) handling 100M new links per month?',
    category: 'System Design',
    difficulty: 'Hard',
    context: 'Tests capacity estimation, Base62 encoding, unique ID generation (Snowflake), caching, and DB partitioning.',
    expectedKeyPoints: [
      'Capacity math: 100M writes/month ≈ 40 writes/sec, read-to-write ratio 10:1',
      'Base62 encoding of 64-bit integer IDs',
      'Redis LRU caching for top 20% viral URLs',
      'Database choice: NoSQL key-value (DynamoDB/Cassandra) or distributed SQL',
    ],
    timeLimitSeconds: 240,
  },
  {
    id: 'qb-5',
    question: 'Why should we hire you over other candidates who might have more years of formal experience?',
    category: 'HR & Cultural',
    difficulty: 'Easy',
    context: 'Evaluates executive presence, self-confidence, value proposition, and passion.',
    expectedKeyPoints: [
      'Rapid learning agility and proven track record of shipping end-to-end projects',
      'Proactive ownership mindset: treating company code and user pain points as personal responsibility',
      'Exceptional cross-functional collaboration and communication skills',
    ],
    timeLimitSeconds: 150,
  },
];
