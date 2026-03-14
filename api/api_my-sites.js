import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Auth check
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié.' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Session invalide.' });
  }

  try {
    if (req.method === 'GET') {
      // List user's sites
      const { data: sites, error } = await supabase
        .from('sites')
        .select('id, name, subdomain, description, site_type, status, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const sitesWithUrls = (sites || []).map(site => ({
        ...site,
        url: `https://siteforgeai.org/s/${site.subdomain}`,
      }));

      return res.status(200).json({ sites: sitesWithUrls });
    }

    if (req.method === 'DELETE') {
      const { siteId } = req.body;
      if (!siteId) return res.status(400).json({ error: 'siteId requis.' });

      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', siteId)
        .eq('user_id', user.id);

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('My sites error:', error);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
}
