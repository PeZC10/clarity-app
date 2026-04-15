import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const rateLimit = new Map();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 10;           // 10 requests per hour per IP (~3 full sessions)

// Prompt injection: block attempts to override or escape the system prompt.
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /disregard\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /forget\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /you\s+are\s+now\s+(a\s+)?(?!navrielle)/i,
  /act\s+as\s+(?!a\s+(coach|advisor|assistant))/i,
  /<\s*system\s*>/i,
  /\[system\]/i,
  /###\s*system/i,
];

function containsInjection(text) {
  if (typeof text !== 'string') return false;
  return INJECTION_PATTERNS.some(re => re.test(text));
}

function getIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record || now - record.windowStart > WINDOW_MS) {
    rateLimit.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (record.count >= MAX_REQUESTS) {
    const resetIn = Math.ceil((WINDOW_MS - (now - record.windowStart)) / 60000);
    return { allowed: false, resetIn };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS - record.count };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Require a valid Supabase session token — anonymous calls are rejected.
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  const ip = getIP(req);
  const { allowed, remaining, resetIn } = checkRateLimit(ip);

  if (!allowed) {
    return res.status(429).json({
      error: 'Too many requests',
      message: `You've reached the limit for this hour. Try again in ${resetIn} minute${resetIn === 1 ? '' : 's'}.`,
      resetIn
    });
  }

  res.setHeader('X-RateLimit-Remaining', remaining);

  const { model, max_tokens, system, messages } = req.body;

  if (!model || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  // Guard against prompt injection in the system string and user messages.
  if (containsInjection(system)) {
    return res.status(400).json({ error: 'Invalid request content' });
  }
  for (const msg of messages) {
    const text = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
    if (containsInjection(text)) {
      return res.status(400).json({ error: 'Invalid request content' });
    }
  }

  // Whitelist allowed models to prevent unexpected cost spikes.
  const ALLOWED_MODELS = [
    'claude-sonnet-4-20250514',
    'claude-haiku-4-5-20251001',
    'claude-opus-4-6',
  ];
  if (!ALLOWED_MODELS.includes(model)) {
    return res.status(400).json({ error: 'Model not allowed' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({ model, max_tokens, system, messages })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
