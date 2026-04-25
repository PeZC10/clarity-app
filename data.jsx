/* Clarity — app data, mocks, and store */

const CATEGORIES = [
  { id: 'career',    label: 'Career & Work',    icon: '◐', subs: ['Promotion / raise', 'Career change', 'Start a business', 'Quit my job', 'Lead a team', 'Find purpose'] },
  { id: 'money',     label: 'Money',            icon: '◇', subs: ['Pay off debt', 'Save for something big', 'Invest seriously', 'Build a budget', 'Increase income', 'Financial independence'] },
  { id: 'health',    label: 'Health & Body',    icon: '○', subs: ['Lose weight', 'Build muscle', 'Run / endurance', 'Sleep better', 'Drink less', 'Quit a habit'] },
  { id: 'mind',      label: 'Mind & Calm',      icon: '◑', subs: ['Anxiety', 'Burnout', 'Confidence', 'Meditation practice', 'Therapy / inner work', 'Focus & deep work'] },
  { id: 'love',      label: 'Love & People',    icon: '◆', subs: ['Find a partner', 'Repair a relationship', 'Set boundaries', 'Make new friends', 'Be a better partner', 'Leave a relationship'] },
  { id: 'craft',     label: 'Craft & Creativity', icon: '◈', subs: ['Finish a project', 'Build a daily practice', 'Learn a skill', 'Publish / ship', 'Find my voice', 'Get back into it'] },
  { id: 'home',      label: 'Home & Life',      icon: '◰', subs: ['Move cities', 'Declutter', 'Buy a home', 'Build routines', 'Travel more', 'Simplify'] },
  { id: 'growth',    label: 'Self & Growth',    icon: '◊', subs: ['Read more', 'Learn a language', 'Public speaking', 'Discipline', 'New identity', 'Big life change'] }
];

const TONE_LINES = [
  "The work is yours.",
  "No one is coming to do this for you.",
  "Showing up is the whole job.",
  "Boring beats brilliant.",
  "Your future self is watching.",
  "Today, only you can.",
  "The plan is the easy part.",
  "Decisions become you."
];

/* Mock AI flow content */
const MOCK_CLARIFY = (goal, sub) =>
  `Before I write you a plan — what's the real reason ${sub ? sub.toLowerCase() : 'this'} hasn't happened yet? Be specific. Is it time, fear, a person, a habit, money, clarity? The honest answer is the one you'd be embarrassed to write.`;

const MOCK_ASSESSMENT = (goal) => ({
  verdict: "Achievable. Not easy.",
  reading: `You've described a goal that thousands of people have hit before you. Nothing about your situation makes it impossible. What you've been missing is not motivation — it's a structure that doesn't let you negotiate with yourself at 9pm on a Tuesday.`,
  truth: `The uncomfortable part: you already know most of what to do. You don't need more information. You need fewer escape hatches.`,
  bet: `If you commit to the next 30 days the way I'm about to lay out — not perfectly, but consistently — you'll be a meaningfully different person on day 31. That's the bet.`,
  chips: ['high agency required', 'low cost to start', '30 days to first signal', 'no equipment needed']
});

const MOCK_PLAN = [
  {
    week: 1,
    title: 'Foundations — make it real',
    days: 'Days 1–7',
    items: [
      'Write your goal as a single sentence. Put it where you\'ll see it daily.',
      'Tell one person who will not let you off the hook.',
      'Block 30 minutes, same time, every day this week. Defend it like rent.',
      'Identify the one thing that always derails you. Write it down.',
      'Do the smallest possible version of the work, today, before you sleep.'
    ]
  },
  {
    week: 2,
    title: 'Build the rhythm',
    days: 'Days 8–14',
    items: [
      'Increase the daily block to 45 minutes. Same time. Same place.',
      'Track every session — one tally per day. No grading, just presence.',
      'Run a Friday review: what worked, what slipped, what changes for next week.',
      'Remove one friction (an app, a person, a habit) that costs you focus.',
      'Talk to someone further along. Ask one specific question.'
    ]
  },
  {
    week: 3,
    title: 'Push through the dip',
    days: 'Days 15–21',
    items: [
      'You will want to quit this week. Plan for it. Pre-commit your response.',
      'Do one harder rep — the next-level version of what you\'ve been doing.',
      'Re-read your day-1 sentence. Edit it if your understanding has changed.',
      'Audit your inputs: who/what is making this easier? Harder? Adjust.',
      'Take one full rest day. Don\'t apologize for it.'
    ]
  },
  {
    week: 4,
    title: 'Compound & decide what\'s next',
    days: 'Days 22–30',
    items: [
      'Do the work even on the day you don\'t feel like it. Especially that day.',
      'Capture proof: a number, a photo, a draft, a screenshot. You\'ll need it.',
      'Tell the person from week 1 where you actually landed. Be honest.',
      'Decide: is this becoming a part of who you are, or was it a season?',
      'Write the next 30 days. You know what to do now.'
    ]
  }
];

/* Pre-seeded existing goals (for the dashboard) */
const SEED_GOALS = [
  {
    id: 'g1',
    title: 'Run a half-marathon by October',
    category: 'Health & Body',
    catId: 'health',
    icon: '○',
    pct: 64,
    phase: 'Week 3 — Push through the dip',
    days: 'Day 19 of 30',
    streak: 12,
    started: '2026-04-06',
    weeks: MOCK_PLAN.map((w, i) => ({
      ...w,
      items: w.items.map((it, j) => ({ text: it, done: i < 2 || (i === 2 && j < 2) }))
    }))
  },
  {
    id: 'g2',
    title: 'Ship the first paid version of my product',
    category: 'Craft & Creativity',
    catId: 'craft',
    icon: '◈',
    pct: 32,
    phase: 'Week 2 — Build the rhythm',
    days: 'Day 9 of 30',
    streak: 6,
    started: '2026-04-16',
    weeks: MOCK_PLAN.map((w, i) => ({
      ...w,
      items: w.items.map((it, j) => ({ text: it, done: i === 0 || (i === 1 && j < 2) }))
    }))
  },
  {
    id: 'g3',
    title: 'Save $12,000 for a down payment',
    category: 'Money',
    catId: 'money',
    icon: '◇',
    pct: 18,
    phase: 'Week 1 — Foundations',
    days: 'Day 4 of 30',
    streak: 4,
    started: '2026-04-21',
    weeks: MOCK_PLAN.map((w, i) => ({
      ...w,
      items: w.items.map((it, j) => ({ text: it, done: i === 0 && j < 2 }))
    }))
  }
];

const SEED_COMPLETED = [
  { id: 'c1', title: 'Read 12 books this year', category: 'Self & Growth', date: 'Mar 28' },
  { id: 'c2', title: 'Hold a 3-minute plank', category: 'Health & Body', date: 'Feb 14' },
  { id: 'c3', title: 'Have the hard conversation with Mom', category: 'Love & People', date: 'Jan 22' }
];

/* Streak / accountability copy by day */
const ACCOUNT_PROMPTS = [
  "Day 1. The clock just started.",
  "Day 2. Today is the test of whether yesterday was real.",
  "Day 3. Most people quit here. You're not most people.",
  "Day 4. Boring is the strategy.",
  "Day 5. One week in. Don't celebrate yet.",
  "Day 7. Make today identical to yesterday.",
  "Day 9. The novelty is wearing off. That's good.",
  "Day 12. This is the part where compounding starts to matter.",
  "Day 15. Halfway. Look at what you've already done.",
  "Day 19. The dip is real. Walk through it.",
  "Day 23. You are becoming the kind of person who does this.",
  "Day 28. Two more days. Don't coast."
];

/* Mobile detection hook */
function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(window.innerWidth < bp);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < bp);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [bp]);
  return mobile;
}

/* Supabase client */
let _sb = null;
async function getSB() {
  if (_sb) return _sb;
  const { supabaseUrl, supabaseAnonKey } = await fetch('/api/config').then(r => r.json());
  _sb = supabase.createClient(supabaseUrl, supabaseAnonKey);
  return _sb;
}

async function loadGoals(userId) {
  const sb = await getSB();
  const { data, error } = await sb.from('goals')
    .select('*').eq('user_id', userId).eq('is_completed', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(g => ({
    id: g.id, title: g.title, category: g.category, catId: g.cat_id,
    icon: g.icon, pct: g.pct, phase: g.phase, days: g.days_label,
    streak: g.streak, started: g.started, weeks: g.weeks
  }));
}

async function loadCompleted(userId) {
  const sb = await getSB();
  const { data, error } = await sb.from('goals')
    .select('id, title, category, completed_date')
    .eq('user_id', userId).eq('is_completed', true)
    .order('completed_date', { ascending: false });
  if (error) throw error;
  return data.map(g => ({ id: g.id, title: g.title, category: g.category, date: g.completed_date }));
}

async function saveGoal(userId, goal) {
  const sb = await getSB();
  const { error } = await sb.from('goals').upsert({
    id: goal.id, user_id: userId, title: goal.title, category: goal.category,
    cat_id: goal.catId, icon: goal.icon, pct: goal.pct, phase: goal.phase,
    days_label: goal.days, streak: goal.streak, started: goal.started,
    weeks: goal.weeks, is_completed: false
  });
  if (error) throw error;
}

async function markGoalComplete(userId, goal) {
  const sb = await getSB();
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const { error } = await sb.from('goals')
    .update({ is_completed: true, completed_date: date })
    .eq('id', goal.id).eq('user_id', userId);
  if (error) throw error;
  return date;
}

/* Export to global scope */
Object.assign(window, {
  CATEGORIES, TONE_LINES, MOCK_CLARIFY, MOCK_ASSESSMENT, MOCK_PLAN,
  SEED_GOALS, SEED_COMPLETED, ACCOUNT_PROMPTS,
  getSB, loadGoals, loadCompleted, saveGoal, markGoalComplete,
  useIsMobile
});
