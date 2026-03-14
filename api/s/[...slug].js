import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { slug } = req.query;
  if (!slug || !slug[0]) return res.status(404).send('Site non trouvé.');

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  try {
    const { data: site, error } = await supabase.from('sites')
      .select('html_content').eq('subdomain', slug[0].toLowerCase()).eq('status', 'published').single();

    if (error || !site) return res.status(404).send('<html><body style="background:#060611;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh"><div><h1>404</h1><p>Site non trouvé.</p></div></body></html>');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(site.html_content);
  } catch (error) {
    return res.status(500).send('Erreur serveur.');
  }
}