export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { goal, category, weekTitle, stepText } = req.body;
  if (!goal || !stepText) return res.status(400).json({ error: 'Missing required fields' });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ClaudeKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: `You are Clarity, a direct personal advisor. Generate a concrete activity for one step in someone's 30-day goal plan. The activity must be something they can do RIGHT NOW in under 30 minutes. Be specific to their actual goal — not generic. Return ONLY a JSON object with:
- "exercise": 2-3 sentences of exactly what to do right now (concrete, specific, tied to their goal)
- "prompt": one question to guide their writing in the workspace below (personal, direct)
- "duration": time estimate like "15 min" or "20 min"
No markdown, no extra text.`,
      messages: [{
        role: 'user',
        content: `Goal: "${goal}". Category: ${category}. Week: "${weekTitle}". Step: "${stepText}". Generate the activity.`
      }]
    })
  });

  const data = await response.json();
  if (!response.ok) return res.status(response.status).json(data);

  try {
    const raw = data.content[0].text.trim().replace(/^```json?\s*/i, '').replace(/```\s*$/i, '');
    return res.status(200).json(JSON.parse(raw));
  } catch (e) {
    return res.status(200).json({
      exercise: data.content[0].text,
      prompt: 'What came up for you as you worked through this?',
      duration: '20 min'
    });
  }
}
