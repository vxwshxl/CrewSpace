export interface Workflow {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  creator: string;
  rating: number;
  reviews: number;
  installs: number;
  isPremium: boolean;
  price?: number;
  icon: string;
  features: string[];
  exampleOutput?: string;
  trending?: boolean;
  new?: boolean;
  templateData?: {
    nodes: any[];
    edges: any[];
  };
}

export const WORKFLOWS: Workflow[] = [
  // FREE WORKFLOWS (80%)
  {
    id: 'insta-reel-gen',
    name: 'Viral Instagram Reel Generator',
    description: 'Generates hooks, scripts, captions, and hashtags for viral reels.',
    longDescription: 'Master the Instagram algorithm with AI-powered reel strategies. This workflow helps you create content that stops the scroll and boosts engagement.',
    category: 'Social Media',
    creator: 'Alex Rivera',
    rating: 4.8,
    reviews: 1240,
    installs: 8500,
    isPremium: false,
    icon: '📸',
    features: ['Viral Hook Engine', 'Script Writing', 'Hashtag Optimization', 'Caption Generator'],
    exampleOutput: 'Hook: I wish I knew this before I started... \nScript: [Detailing the 3 steps to...] \nHashtags: #growth #tips #viral',
    trending: true,
    templateData: {
      nodes: [
        { id: '1', type: 'start', position: { x: 250, y: 5 }, data: { label: 'Start' } },
        { 
          id: '2', 
          type: 'agent', 
          position: { x: 250, y: 150 }, 
          data: { 
            name: 'Reel Strategist', 
            role: 'Social Media Expert',
            prompt: 'You are a viral Instagram strategist. Given a topic, generate a 3-part script: 1. Strong Hook, 2. Value-packed Middle, 3. Strong CTA. Also include 5 relevant hashtags.'
          } 
        }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' }
      ]
    }
  },
  {
    id: 'blog-twitter-thread',
    name: 'Blog to Twitter Thread Converter',
    description: 'Turns long blog posts into engaging Twitter/X threads.',
    longDescription: 'Repurpose your long-form content for X (formerly Twitter) instantly. It extracts key insights and formats them into a thread designed for virality.',
    category: 'Content Creation',
    creator: 'Sarah Chen',
    rating: 4.9,
    reviews: 890,
    installs: 5200,
    isPremium: false,
    icon: '🧵',
    features: ['Insight Extraction', 'X-Ready Formatting', 'Thread Hook Generator', 'CTA Adder'],
    new: true,
    templateData: {
      nodes: [
        { id: '1', type: 'start', position: { x: 250, y: 5 }, data: { label: 'Start' } },
        { 
          id: '2', 
          type: 'agent', 
          position: { x: 250, y: 150 }, 
          data: { 
            name: 'X-Threader', 
            role: 'Content Repurposer',
            prompt: 'Convert the input blog post into a 8-12 tweet Twitter thread. Each tweet should be numbered. Start with a curiosity-driven hook. End with a CTA to follow.'
          } 
        }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' }
      ]
    }
  },
  {
    id: 'ai-resume-builder',
    name: 'AI Resume Builder',
    description: 'Creates professional resumes and cover letters.',
    longDescription: 'Build a job-winning resume in minutes. This agent analyzes job descriptions and tailors your experience to highlight the most relevant skills.',
    category: 'Productivity',
    creator: 'Mike Thompson',
    rating: 4.7,
    reviews: 2100,
    installs: 12000,
    isPremium: false,
    icon: '📄',
    features: ['ATS Optimization', 'Cover Letter Generation', 'Action Verb Suggestions', 'Skill Analysis'],
    templateData: {
      nodes: [
        { id: '1', type: 'start', position: { x: 250, y: 5 }, data: { label: 'Start' } },
        { 
          id: '2', 
          type: 'agent', 
          position: { x: 250, y: 150 }, 
          data: { 
            name: 'Career Coach', 
            role: 'HR Professional',
            prompt: 'Analyze the user\'s background and the target job description. Generate a tailored resume highlighting key accomplishments using action verbs. Ensure it is ATS friendly.'
          } 
        }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' }
      ]
    }
  },
  {
    id: 'startup-idea-gen',
    name: 'Startup Idea Generator',
    description: 'Generates startup ideas with validation and market analysis.',
    longDescription: 'Find your next big thing. This workflow checks market trends, identifies pain points, and suggests validated business models.',
    category: 'Business Automation',
    creator: 'Elena Vance',
    rating: 4.6,
    reviews: 560,
    installs: 3400,
    isPremium: false,
    icon: '💡',
    features: ['Trend Analysis', 'Problem Identification', 'Revenue Modeling', 'Competitor Research'],
    templateData: {
      nodes: [
        { id: '1', type: 'start', position: { x: 250, y: 5 }, data: { label: 'Start' } },
        { 
          id: '2', 
          type: 'agent', 
          position: { x: 250, y: 150 }, 
          data: { 
            name: 'Venture Scout', 
            role: 'Startup Strategist',
            prompt: 'Generate 3 high-potential startup ideas based on current tech trends. For each: explain the problem, the solution, the target audience, and potential revenue streams.'
          } 
        }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' }
      ]
    }
  },
  {
    id: 'meeting-notes-sum',
    name: 'Meeting Notes Summarizer',
    description: 'Summarizes meeting transcripts into key points and action items.',
    longDescription: 'Never miss an action item again. Upload your transcript and get a concise summary with tasks, decisions, and deadlines.',
    category: 'Productivity',
    creator: 'David Miller',
    rating: 4.9,
    reviews: 3200,
    installs: 15000,
    isPremium: false,
    icon: '📝',
    features: ['Action Item Tracker', 'Decision Summary', 'Sentiment Analysis', 'Automatic Formatting'],
    trending: true,
    templateData: {
      nodes: [
        { id: '1', type: 'start', position: { x: 250, y: 5 }, data: { label: 'Start' } },
        { 
          id: '2', 
          type: 'agent', 
          position: { x: 250, y: 150 }, 
          data: { 
            name: 'Meeting scribe', 
            role: 'Executive Assistant',
            prompt: 'Summarize the following meeting transcript. Provide: 1. Key Highlights, 2. Decisions Made, 3. Action Items with owners (if mentioned).'
          } 
        }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' }
      ]
    }
  },
  {
    id: 'youtube-script-writer',
    name: 'YouTube Script Writer',
    description: 'Creates full YouTube video scripts with hook, story, and CTA.',
    longDescription: 'A complete blueprint for your next video. Specifically designed to optimize for Watch Time and Audience Retention.',
    category: 'Content Creation',
    creator: 'James Jordon',
    rating: 4.8,
    reviews: 750,
    installs: 4800,
    isPremium: false,
    icon: '🎬' ,
    features: ['Retention-Focused Hook', 'Story Arc Builder', 'Visual Cue Suggestions', 'CTA Optimization'],
    templateData: {
      nodes: [
        { id: '1', type: 'start', position: { x: 250, y: 5 }, data: { label: 'Start' } },
        { 
          id: '2', 
          type: 'agent', 
          position: { x: 250, y: 150 }, 
          data: { 
            name: 'YouTube Architect', 
            role: 'Script Writer',
            prompt: 'Write a full YouTube script for the given topic. Include: An attention-grabbing hook (first 30 sec), Intro, Body (divided into chapters), and CTA.'
          } 
        }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' }
      ]
    }
  },
  {
    id: 'ai-research-asst',
    name: 'AI Research Assistant',
    description: 'Searches information and summarizes research papers.',
    longDescription: 'Your own scientific assistant. It can process complex papers, summarize key findings, and find related citations.',
    category: 'AI Research',
    creator: 'Prof. Julia Hart',
    rating: 4.9,
    reviews: 430,
    installs: 2100,
    isPremium: false,
    icon: '🔬',
    features: ['Paper Summarization', 'Citation Linker', 'Methodology Explainer', 'Data Extraction'],
    templateData: {
      nodes: [
        { id: '1', type: 'start', position: { x: 250, y: 5 }, data: { label: 'Start' } },
        { 
          id: '2', 
          type: 'agent', 
          position: { x: 250, y: 150 }, 
          data: { 
            name: 'Research Buddy', 
            role: 'AI Scientist',
            prompt: 'Summarize the key findings, methodology, and limitations of the provided research paper/topic in simple terms.'
          } 
        }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' }
      ]
    }
  },
  {
    id: 'email-reply-gen',
    name: 'Email Reply Generator',
    description: 'Writes smart professional replies to emails.',
    longDescription: 'Draft perfect replies in seconds. It understands the tone and context of previous emails to suggest the best response.',
    category: 'Productivity',
    creator: 'Karen White',
    rating: 4.7,
    reviews: 1500,
    installs: 9800,
    isPremium: false,
    icon: '✉️',
    features: ['Tone Adjustment', 'Context Awareness', 'Schedule Link Integration', 'Politeness Filter'],
    templateData: {
      nodes: [
        { id: '1', type: 'start', position: { x: 250, y: 5 }, data: { label: 'Start' } },
        { 
          id: '2', 
          type: 'agent', 
          position: { x: 250, y: 150 }, 
          data: { 
            name: 'Inbox Ninja', 
            role: 'Business Communicator',
            prompt: 'Draft 3 professional reply options (Short, Detailed, Friendly) to the following email. If a meeting request is detected, suggest available times.'
          } 
        }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' }
      ]
    }
  },
  {
    id: 'linkedin-post-creator',
    name: 'LinkedIn Post Creator',
    description: 'Creates viral LinkedIn posts with storytelling structure.',
    longDescription: 'Build your personal brand on LinkedIn. This workflow uses the PAS (Problem-Agitate-Solution) framework for maximum reach.',
    category: 'Social Media',
    creator: 'Liam Scott',
    rating: 4.8,
    reviews: 1100,
    installs: 7200,
    isPremium: false,
    icon: '💼',
    features: ['PAS Framework', 'Hook Testing', 'Emoji Optimization', 'Engagement Pro-tips'],
    templateData: {
      nodes: [
        { id: '1', type: 'start', position: { x: 250, y: 5 }, data: { label: 'Start' } },
        { 
          id: '2', 
          type: 'agent', 
          position: { x: 250, y: 150 }, 
          data: { 
            name: 'LinkedIn Ghostwriter', 
            role: 'Personal Branding Expert',
            prompt: 'Turn this topic into a viral LinkedIn post using the PAS framework. Include white space for readability and 2 relevant tags.'
          } 
        }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' }
      ]
    }
  },
  {
    id: 'code-debug-asst',
    name: 'Code Debug Assistant',
    description: 'Analyzes code and suggests fixes and improvements.',
    longDescription: 'A second pair of eyes for your code. It finds logic bugs, security vulnerabilities, and suggests performance optimizations.',
    category: 'Coding',
    creator: 'DevX Team',
    rating: 4.9,
    reviews: 2800,
    installs: 18000,
    isPremium: false,
    icon: '🛠️',
    features: ['Syntax Checking', 'Logic Debugging', 'Complex Refactoring', 'Performance Tips'],
    trending: true,
    templateData: {
      nodes: [
        { id: '1', type: 'start', position: { x: 250, y: 5 }, data: { label: 'Start' } },
        { 
          id: '2', 
          type: 'agent', 
          position: { x: 250, y: 150 }, 
          data: { 
            name: 'Debug Master', 
            role: 'Senior Software Engineer',
            prompt: 'Analyze the following code snippet. identify: 1. Any obvious bugs, 2. Performance bottlenecks, 3. Security issues. Provide the fixed code.'
          } 
        }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' }
      ]
    }
  },

  // PREMIUM WORKFLOWS (20%)
  {
    id: 'ai-mkt-campaign-gen',
    name: 'AI Marketing Campaign Generator',
    description: 'Creates full marketing campaigns including ads, copy, funnels, and strategy.',
    longDescription: 'The ultimate CMO in a box. It designs a cohesive strategy across multiple platforms, ensuring consistent messaging and high ROI.',
    category: 'Marketing',
    creator: 'Marketing Genius',
    rating: 5.0,
    reviews: 450,
    installs: 1200,
    isPremium: true,
    price: 299,
    icon: '🚀',
    features: ['Multi-Channel Strategy', 'Ad Creative Briefs', 'Funnel Architect', 'Budget Allocation Tips'],
    exampleOutput: 'Channel: Meta Ads\nStrategy: Retargeting Lookalikes\nCopy: Don\'t miss out on...',
    trending: true,
    templateData: {
      nodes: [
        { id: '1', type: 'start', position: { x: 250, y: 5 }, data: { label: 'Start' } },
        { id: '2', type: 'agent', position: { x: 250, y: 150 }, data: { name: 'Marketing Guru', role: 'CMO', prompt: 'Design a full multi-channel marketing campaign for this product.' } }
      ],
      edges: [{ id: 'e1-2', source: '1', target: '2' }]
    }
  },
  {
    id: 'saas-launch-planner',
    name: 'SaaS Product Launch Planner',
    description: 'Generates launch roadmap, landing page copy, marketing strategy.',
    longDescription: 'Go from MVP to Launch. This professional-grade workflow handles Product Hunt, Twitter, and Email sequences for a perfect launch.',
    category: 'Business Automation',
    creator: 'Founder Hub',
    rating: 4.9,
    reviews: 320,
    installs: 890,
    isPremium: true,
    price: 299,
    icon: '🎡',
    features: ['Product Hunt Checklist', 'Landing Page Copywriter', 'Email Drip Sequence', 'PR Outreach Templates'],
    templateData: {
      nodes: [
        { id: '1', type: 'start', position: { x: 250, y: 5 }, data: { label: 'Start' } },
        { id: '2', type: 'agent', position: { x: 250, y: 150 }, data: { name: 'Launch Strategist', role: 'Growth Hacker', prompt: 'Create a 30-day SaaS launch roadmap.' } }
      ],
      edges: [{ id: 'e1-2', source: '1', target: '2' }]
    }
  },
  {
    id: 'youtube-growth-system',
    name: 'YouTube Growth System',
    description: 'Generates niche analysis, video ideas, SEO titles, thumbnails, scripts.',
    longDescription: 'The secret sauce for high-growth channels. It analyzes YouTube trends and suggests high-CTR titles and thumbnails.',
    category: 'Content Creation',
    creator: 'Creators Pro',
    rating: 4.8,
    reviews: 580,
    installs: 1100,
    isPremium: true,
    price: 299,
    icon: '📈',
    features: ['Niche Gap Analysis', 'CTR Optimization', 'Retention Scripting', 'Keyword Explorer'],
    trending: true,
    templateData: {
      nodes: [
        { id: '1', type: 'start', position: { x: 250, y: 5 }, data: { label: 'Start' } },
        { id: '2', type: 'agent', position: { x: 250, y: 150 }, data: { name: 'Growth Expert', role: 'YouTube Consultant', prompt: 'Analyze this niche and suggest 5 high-CTR video topics.' } }
      ],
      edges: [{ id: 'e1-2', source: '1', target: '2' }]
    }
  },
  {
    id: 'full-business-plan-gen',
    name: 'Full Business Plan Generator',
    description: 'Creates investor-ready business plans with financial projections.',
    longDescription: 'Get funded. This workflow builds detailed business plans with SWOT analysis, P&L projections, and market sizing (TAM/SAM/SOM).',
    category: 'Business Automation',
    creator: 'Venture Capitalist AI',
    rating: 5.0,
    reviews: 210,
    installs: 450,
    isPremium: true,
    price: 299,
    icon: '📊',
    features: ['Financial Modeling', 'SWOT Analysis', 'Exit Strategy Planning', 'Pitch Deck Outline'],
    templateData: {
      nodes: [
        { id: '1', type: 'start', position: { x: 250, y: 5 }, data: { label: 'Start' } },
        { id: '2', type: 'agent', position: { x: 250, y: 150 }, data: { name: 'VC Partner', role: 'Financial Analyst', prompt: 'Create a 5-page investor-ready business plan outline.' } }
      ],
      edges: [{ id: 'e1-2', source: '1', target: '2' }]
    }
  },
  {
    id: 'ai-sales-funnel-builder',
    name: 'AI Sales Funnel Builder',
    description: 'Creates landing page copy, email sequences, ads, and conversion funnels.',
    longDescription: 'Turn visitors into customers. It maps out the entire customer journey and provides the copy needed for every touchpoint.',
    category: 'Marketing',
    creator: 'Sales Velocity',
    rating: 4.9,
    reviews: 380,
    installs: 920,
    isPremium: true,
    price: 299,
    icon: '💰',
    features: ['Journey Mapping', 'Copywriting Templates', 'Conversion Optimization', 'Upsell Strategy'],
    templateData: {
      nodes: [
        { id: '1', type: 'start', position: { x: 250, y: 5 }, data: { label: 'Start' } },
        { id: '2', type: 'agent', position: { x: 250, y: 150 }, data: { name: 'Funnel Architect', role: 'Sales Copywriter', prompt: 'Map out a high-converting sales funnel for this product.' } }
      ],
      edges: [{ id: 'e1-2', source: '1', target: '2' }]
    }
  }
];

export const CATEGORIES = [
  'All',
  'Marketing',
  'Content Creation',
  'Coding',
  'Productivity',
  'Social Media',
  'Business Automation',
  'AI Research',
  'Data Analysis'
];
