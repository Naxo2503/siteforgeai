# 🔐 Setup Supabase — SiteForgeAI (5 minutes)

---

## Étape 1 : Crée ton projet Supabase

1. Va sur **https://supabase.com** → Sign Up (gratuit)
2. Clique **"New Project"**
3. Remplis :
   - Name : `siteforgeai`
   - Database Password : génère un mot de passe fort (note-le)
   - Region : `West EU (Ireland)` (le plus proche de la France)
4. Clique **"Create new project"** → attends 2 min

---

## Étape 2 : Récupère tes clés API

1. Va dans **Settings → API**
2. Copie :
   - **Project URL** : `https://xxxxxx.supabase.co`
   - **anon public key** : `eyJhbGciOi...` (la clé publique)

---

## Étape 3 : Configure le projet

### Option A : Variables d'environnement (recommandé)

Crée un fichier `.env` à la racine du projet :

```
VITE_SUPABASE_URL=https://xxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### Option B : Direct dans le code

Ouvre `src/supabaseClient.js` et remplace les valeurs :

```javascript
const SUPABASE_URL = 'https://xxxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOi...'
```

---

## Étape 4 : Active Google Login

1. Dashboard Supabase → **Authentication → Providers**
2. Trouve **Google** → Enable
3. Il te faut un **Google OAuth Client ID** :
   - Va sur https://console.cloud.google.com
   - Crée un projet (ou utilise un existant)
   - **APIs & Services → Credentials → Create OAuth Client ID**
   - Type : "Web Application"
   - Authorized redirect URIs : `https://xxxxxx.supabase.co/auth/v1/callback`
   - Copie le **Client ID** et **Client Secret**
4. Colle-les dans Supabase → Google Provider
5. Save

**Si tu veux pas t'embêter avec Google OAuth pour l'instant**, l'email + mot de passe fonctionne directement sans rien configurer. Tu pourras ajouter Google plus tard.

---

## Étape 5 : Configure le redirect URL

1. Dashboard Supabase → **Authentication → URL Configuration**
2. **Site URL** : `https://ton-domaine.com` (ou `http://localhost:5173` en dev)
3. **Redirect URLs** : ajoute aussi `http://localhost:5173` pour le dev

---

## Étape 6 : Variables d'env sur Vercel

Dans ton dashboard Vercel → **Settings → Environment Variables** :

| Clé | Valeur |
|-----|--------|
| `VITE_SUPABASE_URL` | `https://xxxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` |
| `ANTHROPIC_API_KEY` | `sk-ant-...` (pour la serverless function) |

---

## C'est tout !

L'auth est prête. Les utilisateurs peuvent :
- ✅ S'inscrire par email + mot de passe
- ✅ Se connecter avec Google (si configuré)
- ✅ 3 générations gratuites sans compte
- ✅ Générations illimitées une fois connecté
- ✅ Paiement Stripe bloqué tant que pas connecté

Supabase gratuit inclut : 50,000 utilisateurs, 500MB de stockage, 1GB de transfert.
Largement suffisant pour démarrer.
