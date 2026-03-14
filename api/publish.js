import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Non authentifié.' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.split(' ')[1]);
  if (authError || !user) return res.status(401).json({ error: 'Session invalide.' });

  const { html, name, subdomain, description, siteType } = req.body;
  if (!html || !name || !subdomain) return res.status(400).json({ error: 'HTML, nom et sous-domaine requis.' });

  if (!/^[a-z0-9][a-z0-9-]{2,30}[a-z0-9]$/.test(subdomain)) return res.status(400).json({ error: 'Sous-domaine invalide.' });

  try {
    const { data: taken } = await supabase.from('sites').select('id').eq('subdomain', subdomain).single();
    if (taken) return res.status(409).json({ error: 'Sous-domaine déjà pris.' });

    const { data: site, error: insertError } = await supabase.from('sites').insert({
      user_id: user.id, name, subdomain, html_content: html,
      description: description || '', site_type: siteType || 'website', status: 'published',
    }).select().single();

    if (insertError) throw insertError;

    return res.status(200).json({
      success: true,
      site: { id: site.id, name: site.name, subdomain: site.subdomain, url: `https://siteforgeai.org/s/${site.subdomain}` },
    });
  } catch (error) {
    console.error('Publish error:', error);
    return res.status(500).json({ error: 'Erreur publication.' });
  }
}