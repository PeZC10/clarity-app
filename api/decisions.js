import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('decisions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ decisions: data });
  }

  if (req.method === 'POST') {
    const { category, topic, decision_text, clarifying_question, clarifying_answer, framework_analysis, recommendation, insight_chips, lang } = req.body;

    const { data, error } = await supabase
      .from('decisions')
      .insert([{
        user_id: user.id,
        category,
        topic,
        decision_text,
        clarifying_question,
        clarifying_answer,
        framework_analysis,
        recommendation,
        insight_chips,
        lang
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ decision: data });
  }

  if (req.method === 'PATCH') {
    const { id, ...updates } = req.body;
    const { data, error } = await supabase
      .from('decisions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ decision: data });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    const { error } = await supabase
      .from('decisions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
