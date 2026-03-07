# 🚀 SiteForgeAI — Guide de Déploiement

## En ligne ce soir en 4 étapes

---

## ÉTAPE 1 : Prépare ton projet (2 min)

```bash
# 1. Crée un dossier et copie tous les fichiers dedans
# (télécharge le ZIP depuis Claude ou copie les fichiers)

# 2. Ouvre un terminal dans le dossier siteforgeai/

# 3. Installe les dépendances
npm install

# 4. Teste en local
npm run dev
# → Ouvre http://localhost:5173 dans ton navigateur
```

---

## ÉTAPE 2 : Crée ton compte Stripe (5 min)

### 2a. Créer les produits

1. Va sur https://dashboard.stripe.com
2. Crée un compte (ou connecte-toi)
3. **Products → + Add product**
4. Crée 3 produits :

| Produit | Prix | Facturation |
|---------|------|-------------|
| SiteForgeAI Starter | 9€/mois | Récurrent |
| SiteForgeAI Pro | 29€/mois | Récurrent |
| SiteForgeAI Business | 79€/mois | Récurrent |

### 2b. Créer les liens de paiement

Pour CHAQUE produit :
1. Clique sur le produit
2. **"Create payment link"**
3. Copie le lien (format: `https://buy.stripe.com/xxxxx`)

### 2c. Colle les liens dans ton code

Ouvre `src/App.jsx` et remplace les liens dans CONFIG :

```javascript
const CONFIG = {
  STRIPE_LINKS: {
    starter: "https://buy.stripe.com/TON_VRAI_LIEN_ICI",
    pro: "https://buy.stripe.com/TON_VRAI_LIEN_ICI",
    business: "https://buy.stripe.com/TON_VRAI_LIEN_ICI",
  },
};
```

---

## ÉTAPE 3 : Déploie sur Vercel (3 min)

### Option A : Via GitHub (recommandé)

```bash
# 1. Initialise git
git init
git add .
git commit -m "SiteForgeAI v1"

# 2. Crée un repo sur GitHub
# Va sur github.com/new → crée "siteforgeai"

# 3. Push
git remote add origin https://github.com/TON_USER/siteforgeai.git
git branch -M main
git push -u origin main
```

4. Va sur https://vercel.com
5. **"New Project"** → Importe ton repo GitHub
6. Framework: **Vite** (détecté automatiquement)
7. Clique **Deploy**
8. En 30 secondes, ton site est live sur `siteforgeai.vercel.app` 🎉

### Option B : Via CLI (encore plus rapide)

```bash
# 1. Installe Vercel CLI
npm i -g vercel

# 2. Déploie
vercel

# Suis les instructions (oui à tout)
# → Ton site est live !
```

---

## ÉTAPE 4 : Domaine personnalisé (5 min)

### 4a. Achète un domaine

Options recommandées :
- **Namecheap** : ~10€/an → namecheap.com
- **Porkbun** : ~9€/an → porkbun.com
- **OVH** : ~8€/an → ovh.com (si tu veux rester FR)

Suggestions de noms :
- `siteforgeai.com`
- `siteforge.ai` (extension .ai ~$50/an)
- `forgesite.fr`

### 4b. Connecte le domaine à Vercel

1. Dashboard Vercel → ton projet → **Settings → Domains**
2. Ajoute ton domaine : `siteforgeai.com`
3. Vercel te donne les DNS records à ajouter :

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. Va chez ton registrar (Namecheap/Porkbun) → DNS → Ajoute ces records
5. Attends 5-30 min pour la propagation
6. SSL automatique par Vercel ✅

---

## ⚠️ IMPORTANT : Sécuriser la clé API en production

Actuellement, l'API Claude est appelée côté client (pour le MVP).
En production, il FAUT un backend pour protéger ta clé API.

### Solution rapide : Vercel Serverless Function

Crée le fichier `api/generate.js` :

```javascript
// api/generate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Generation failed' });
  }
}
```

Puis dans Vercel Dashboard → Settings → Environment Variables :
- Clé : `ANTHROPIC_API_KEY`
- Valeur : ta clé API Anthropic

Et modifie l'appel fetch dans `App.jsx` pour pointer vers `/api/generate`.

---

## 📊 Checklist finale

- [ ] `npm run dev` fonctionne en local
- [ ] Liens Stripe configurés (3 produits)
- [ ] Déployé sur Vercel
- [ ] Domaine acheté et connecté
- [ ] (Optionnel) API sécurisée via serverless function
- [ ] Test du flow complet : génération → preview → clic pricing → Stripe

---

## 💰 Ton modèle de revenu

| | Starter | Pro | Business |
|---|---------|-----|----------|
| Prix | 9€/mois | 29€/mois | 79€/mois |
| 10 clients = | 90€/mois | 290€/mois | 790€/mois |
| 100 clients = | 900€/mois | 2 900€/mois | 7 900€/mois |

Le coût de l'API Claude par génération est ~0.03-0.08€.
Marge brute : >95% 🔥

---

Bonne chance Naïm, go ship it ! 🚀
