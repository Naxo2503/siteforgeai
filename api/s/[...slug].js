import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Debug: log everything
  const { slug } = req.query;
  console.log('SLUG QUERY:', JSON.stringify(req.query));
  console.log('SLUG VALUE:', slug);
  console.log('URL:', req.url);
  console.log('ENV URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING');
  console.log('ENV KEY:', process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING');

  // Try to get subdomain from URL if slug is empty
  let subdomain = null;
  if (slug && slug[0]) {
    subdomain = slug[0].toLowerCase();
  } else {
    // Fallback: extract from URL path
    const parts = req.url.split('/').filter(Boolean);
    const sIndex = parts.indexOf('s');
    if (sIndex >= 0 && parts[sIndex + 1]) {
      subdomain = parts[sIndex + 1].toLowerCase().split('?')[0];
    }
  }

  console.log('SUBDOMAIN:', subdomain);

  if (!subdomain) {
    return res.status(404).send('Site non trouvé - pas de sous-domaine.');
  }

  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    const { data: site, error } = await supabase.from('sites')
      .select('html_content, name, subdomain, status')
      .eq('subdomain', subdomain)
      .eq('status', 'published')
      .single();

    console.log('DB RESULT:', { found: !!site, error: error?.message, subdomain });

    if (error || !site) {
      return res.status(404).send('<html><body style="background:#060611;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center"><div><h1>404</h1><p>Site "' + subdomain + '" non trouvé.</p><a href="https://siteforgeai.org" style="color:#00ff88">Retour</a></div></body></html>');
    }

    let html = site.html_content;
    if (!html.trim().toLowerCase().startsWith('<!doctype')) {
      html = '<!DOCTYPE html>\n' + html;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (error) {
    console.error('Serve error:', error);
    return res.status(500).send('Erreur: ' + error.message);
  }
}