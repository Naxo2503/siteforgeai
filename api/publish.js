import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Service key for server-side operations
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Get user from auth token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié. Connecte-toi pour publier.' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Session invalide. Reconnecte-toi.' });
  }

  const { html, name, subdomain, description, siteType } = req.body;

  if (!html || !name || !subdomain) {
    return res.status(400).json({ error: 'HTML, nom et sous-domaine requis.' });
  }

  // Validate subdomain format
  const subdomainRegex = /^[a-z0-9][a-z0-9-]{2,30}[a-z0-9]$/;
  if (!subdomainRegex.test(subdomain)) {
    return res.status(400).json({ error: 'Sous-domaine invalide. Utilise uniquement des lettres minuscules, chiffres et tirets (4-32 caractères).' });
  }

  // Check reserved subdomains
  const reserved = ['www', 'app', 'api', 'admin', 'dashboard', 'mail', 'blog', 'help', 'support'];
  if (reserved.includes(subdomain)) {
    return res.status(400).json({ error: 'Ce sous-domaine est réservé. Choisis-en un autre.' });
  }

  try {
    // Check how many sites the user already has
    const { data: existingSites, error: countError } = await supabase
      .from('sites')
      .select('id')
      .eq('user_id', user.id);

    if (countError) throw countError;

    // Free users: 0 published sites, Starter: 1, Pro: 5, Business: unlimited
    // For MVP, allow 1 site per user (expand later with Stripe webhook)
    const maxSites = 5; // Be generous for now
    if (existingSites && existingSites.length >= maxSites) {
      return res.status(403).json({ error: `Tu as atteint la limite de ${maxSites} sites. Upgrade ton plan pour en publier plus.` });
    }

    // Check if subdomain is already taken
    const { data: existingSubdomain } = await supabase
      .from('sites')
      .select('id')
      .eq('subdomain', subdomain)
      .single();

    if (existingSubdomain) {
      return res.status(409).json({ error: 'Ce sous-domaine est déjà pris. Choisis-en un autre.' });
    }

    // Save the site
    const { data: site, error: insertError } = await supabase
      .from('sites')
      .insert({
        user_id: user.id,
        name: name,
        subdomain: subdomain,
        html_content: html,
        description: description || '',
        site_type: siteType || 'website',
        status: 'published',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return res.status(200).json({
      success: true,
      site: {
        id: site.id,
        name: site.name,
        subdomain: site.subdomain,
        url: `https://siteforgeai.org/s/${site.subdomain}`,
        status: site.status,
        created_at: site.created_at,
      },
    });
  } catch (error) {
    console.error('Publish error:', error);
    return res.status(500).json({ error: 'Erreur lors de la publication. Réessaie.' });
  }
}
