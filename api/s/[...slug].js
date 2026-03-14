import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug || !slug[0]) {
    return res.status(404).send('Site non trouvé.');
  }

  const subdomain = slug[0].toLowerCase();

  try {
    const { data: site, error } = await supabase
      .from('sites')
      .select('html_content, name, subdomain, status')
      .eq('subdomain', subdomain)
      .eq('status', 'published')
      .single();

    if (error || !site) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="UTF-8"><title>Site non trouvé</title>
        <style>
          body { background: #060611; color: #fff; font-family: 'Segoe UI', sans-serif;
            display: flex; align-items: center; justify-content: center; min-height: 100vh;
            text-align: center; }
          h1 { font-size: 48px; margin-bottom: 16px; }
          p { color: rgba(255,255,255,0.5); font-size: 18px; }
          a { color: #00ff88; text-decoration: none; }
        </style>
        </head>
        <body>
          <div>
            <h1>404</h1>
            <p>Ce site n'existe pas ou a été désactivé.</p>
            <p style="margin-top: 24px;"><a href="https://siteforgeai.org">← Retour à SiteForgeAI</a></p>
          </div>
        </body>
        </html>
      `);
    }

    // Serve the HTML with proper headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).send(site.html_content);
  } catch (error) {
    console.error('Serve error:', error);
    return res.status(500).send('Erreur serveur.');
  }
}
