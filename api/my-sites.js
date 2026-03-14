import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Non authentifié.' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.split(' ')[1]);
  if (authError || !user) return res.status(401).json({ error: 'Session invalide.' });

  try {
    if (req.method === 'GET') {
      const { data: sites, error } = await supabase.from('sites')
        .select('id, name, subdomain, description, site_type, status, created_at, updated_at')
        .eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ sites: (sites || []).map(s => ({ ...s, url: `https://siteforgeai.org/s/${s.subdomain}` })) });
    }
    if (req.method === 'DELETE') {
      const { siteId } = req.body;
      await supabase.from('sites').delete().eq('id', siteId).eq('user_id', user.id);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
}