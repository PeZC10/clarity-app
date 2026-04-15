import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, email, password, access_token } = req.body;

  try {
    if (action === 'signup') {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ user: data.user });
    }

    if (action === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ session: data.session, user: data.user });
    }

    if (action === 'signout') {
      await supabase.auth.admin.signOut(access_token);
      return res.status(200).json({ success: true });
    }

    if (action === 'getuser') {
      const { data, error } = await supabase.auth.getUser(access_token);
      if (error) return res.status(401).json({ error: error.message });
      return res.status(200).json({ user: data.user });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}
