import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./AuthContext.jsx";
import { useGenerationLimit } from "./useGenerationLimit.js";

// ═══════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════
const CONFIG = {
  ANTHROPIC_MODEL: "claude-sonnet-4-20250514",
  STRIPE_LINKS: {
    starter: "https://buy.stripe.com/bJe9AU8980ag6uigkN9oc01",
    pro: "https://buy.stripe.com/fZucN6dtsf5acSGd8B9oc02",
    business: "https://buy.stripe.com/8x25kE1KK3mscSG5G99oc03",
  },
};

// ═══════════════════════════════════════════
// STYLES SHARED
// ═══════════════════════════════════════════
const s = {
  font: "'Outfit', sans-serif",
  fontBody: "'DM Sans', sans-serif",
  green: "#00ff88",
  cyan: "#00c8ff",
  bg: "#060611",
  grad: "linear-gradient(135deg, #00ff88, #00c8ff)",
  inputBase: {
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)",
    color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.3s", boxSizing: "border-box",
  },
};

// ═══════════════════════════════════════════
// AUTH MODAL
// ═══════════════════════════════════════════
function AuthModal({ open, onClose, initialMode = "login" }) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => { if (open) { setError(null); setSuccess(null); setMode(initialMode); } }, [open, initialMode]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!email || !password) return setError("Remplis tous les champs.");
    if (password.length < 6) return setError("Mot de passe : 6 caractères minimum.");
    setLoading(true); setError(null);

    if (mode === "signup") {
      const { error: err } = await signUp(email, password);
      if (err) setError(err.message);
      else setSuccess("Vérifie ta boîte mail pour confirmer ton compte !");
    } else {
      const { error: err } = await signIn(email, password);
      if (err) setError(err.message === "Invalid login credentials" ? "Email ou mot de passe incorrect." : err.message);
      else onClose();
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error: err } = await signInWithGoogle();
    if (err) setError(err.message);
    setLoading(false);
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "backdropIn 0.25s ease",
      padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#0c0c1d", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18, padding: "36px 32px", width: "100%", maxWidth: 400,
        animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)",
        position: "relative",
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 14, background: "none", border: "none",
          color: "rgba(255,255,255,0.3)", fontSize: 20, cursor: "pointer",
        }}>✕</button>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: s.grad, display: "inline-flex",
            alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 20, color: s.bg,
            fontFamily: s.font, marginBottom: 14,
          }}>S</div>
          <h2 style={{
            fontFamily: s.font, fontSize: 22, fontWeight: 700, color: "#fff",
          }}>
            {mode === "login" ? "Content de te revoir" : "Crée ton compte"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 6 }}>
            {mode === "login" ? "Connecte-toi pour continuer à générer" : "Inscris-toi pour débloquer plus de générations"}
          </p>
        </div>

        {/* Google button */}
        <button onClick={handleGoogle} disabled={loading} style={{
          width: "100%", padding: "12px", borderRadius: 10, cursor: "pointer",
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          color: "#fff", fontSize: 14, fontFamily: s.fontBody, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          transition: "all 0.25s", marginBottom: 20,
        }}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Continuer avec Google
        </button>

        {/* Divider */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
        }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>ou</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Email form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            style={s.inputBase}
            onFocus={e => e.target.style.borderColor = "rgba(0,255,136,0.3)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
          />
          <input
            type="password" placeholder="Mot de passe" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={s.inputBase}
            onFocus={e => e.target.style.borderColor = "rgba(0,255,136,0.3)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
          />

          {error && <p style={{ color: "#ff4466", fontSize: 13, textAlign: "center" }}>{error}</p>}
          {success && <p style={{ color: s.green, fontSize: 13, textAlign: "center" }}>{success}</p>}

          <button onClick={handleSubmit} disabled={loading} style={{
            padding: "13px", borderRadius: 10, border: "none", cursor: "pointer",
            background: s.grad, color: s.bg,
            fontWeight: 700, fontSize: 15, fontFamily: s.font,
            opacity: loading ? 0.6 : 1, transition: "opacity 0.3s",
          }}>
            {loading ? "..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
          </button>
        </div>

        {/* Toggle */}
        <p style={{ textAlign: "center", marginTop: 18, color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
          {mode === "login" ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setSuccess(null); }}
            style={{
              background: "none", border: "none", color: s.green,
              cursor: "pointer", fontSize: 13, fontWeight: 600,
            }}>
            {mode === "login" ? "S'inscrire" : "Se connecter"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// GRID BACKGROUND
// ═══════════════════════════════════════════
function GridBackground() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      overflow: "hidden", opacity: 0.4,
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      <div style={{
        position: "absolute", top: "15%", left: "20%", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,255,136,0.06), transparent 65%)",
        filter: "blur(80px)", animation: "float 25s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", top: "60%", right: "10%", width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,120,255,0.05), transparent 65%)",
        filter: "blur(80px)", animation: "float 30s ease-in-out infinite reverse",
      }} />
    </div>
  );
}

// ═══════════════════════════════════════════
// NAV
// ═══════════════════════════════════════════
function Nav({ active, onNav, onOpenAuth }) {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [["hero", "Accueil"], ["features", "Features"], ["how", "Process"], ["tool", "Essayer"], ["pricing", "Pricing"]];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(6,6,17,0.92)" : "rgba(6,6,17,0.6)",
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 clamp(16px, 4vw, 48px)", height: 60, transition: "all 0.4s",
    }}>
      <div onClick={() => onNav("hero")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: s.grad,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 900, fontSize: 16, color: s.bg, fontFamily: s.font,
        }}>S</div>
        <span style={{ fontFamily: s.font, fontWeight: 700, fontSize: 17, color: "#fff", letterSpacing: -0.5 }}>
          SiteForge<span style={{ color: s.green }}>AI</span>
        </span>
      </div>

      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {links.map(([id, label]) => (
          <button key={id} onClick={() => onNav(id)} style={{
            padding: "7px 12px", borderRadius: 8, cursor: "pointer",
            background: active === id ? "rgba(0,255,136,0.1)" : "transparent",
            border: "none", color: active === id ? s.green : "rgba(255,255,255,0.45)",
            fontSize: 13, fontWeight: 500, fontFamily: s.fontBody, transition: "all 0.25s",
          }}>{label}</button>
        ))}

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 12 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "rgba(0,255,136,0.15)", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 12, color: s.green, fontWeight: 700, fontFamily: s.font,
            }}>
              {(user.email || "U")[0].toUpperCase()}
            </div>
            <button onClick={signOut} style={{
              padding: "6px 14px", borderRadius: 7, cursor: "pointer",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: s.fontBody,
            }}>Déco</button>
          </div>
        ) : (
          <button onClick={onOpenAuth} style={{
            marginLeft: 12, padding: "8px 18px", borderRadius: 8,
            border: "none", cursor: "pointer", background: s.grad,
            color: s.bg, fontWeight: 700, fontSize: 13, fontFamily: s.fontBody,
          }}>Se connecter</button>
        )}
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════
function Hero({ onNav }) {
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 150); }, []);
  return (
    <section id="hero" style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "100px 24px 60px",
    }}>
      <div style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(30px)", transition: "all 1s cubic-bezier(0.16,1,0.3,1)", maxWidth: 820 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 18px 6px 8px", borderRadius: 100,
          background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)", marginBottom: 36,
        }}>
          <span style={{ background: s.green, color: "#000", borderRadius: 100, padding: "2px 8px", fontSize: 11, fontWeight: 700, fontFamily: s.font }}>NEW</span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: s.fontBody }}>3 générations gratuites — sans inscription</span>
        </div>
        <h1 style={{
          fontFamily: s.font, fontSize: "clamp(38px,6.5vw,76px)", fontWeight: 800,
          lineHeight: 1.08, color: "#fff", marginBottom: 24, letterSpacing: -2,
        }}>
          Colle ton URL.{" "}
          <span style={{ background: "linear-gradient(135deg, #00ff88 0%, #00c8ff 60%, #6366f1 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            L'IA fait le reste.
          </span>
        </h1>
        <p style={{
          color: "rgba(255,255,255,0.5)", fontSize: "clamp(16px,2vw,19px)",
          maxWidth: 520, lineHeight: 1.7, margin: "0 auto 44px", fontFamily: s.fontBody,
        }}>
          Notre IA analyse ton site, le redesigne et l'optimise en quelques secondes.
          Tu publies en un clic. Fini les devis à 3000€.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => onNav("tool")} style={{
            padding: "15px 36px", borderRadius: 10, border: "none", cursor: "pointer",
            background: s.grad, color: s.bg, fontWeight: 700, fontSize: 15,
            fontFamily: s.font, animation: "pulse-glow 3s ease-in-out infinite",
          }}>Essayer gratuitement →</button>
          <button onClick={() => onNav("how")} style={{
            padding: "15px 36px", borderRadius: 10, cursor: "pointer",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: 15, fontFamily: s.fontBody,
          }}>Voir le process</button>
        </div>
      </div>
      <div style={{
        opacity: v ? 1 : 0, transition: "opacity 1.5s 0.6s",
        marginTop: 80, display: "flex", gap: 40, flexWrap: "wrap", justifyContent: "center",
      }}>
        {[["2,400+", "sites améliorés"], ["< 30s", "temps de génération"], ["98%", "satisfaction"]].map(([n, l], i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: s.font, background: s.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{n}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: s.fontBody, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// FEATURES
// ═══════════════════════════════════════════
function Features() {
  const features = [
    { icon: "🔍", title: "Scan intelligent", desc: "L'IA analyse chaque élément : design, UX, vitesse, SEO." },
    { icon: "🎨", title: "Redesign complet", desc: "Nouveau design moderne, optimisé pour convertir." },
    { icon: "🛒", title: "Shopify Ready", desc: "Pages produit, checkout, header — toute ta boutique." },
    { icon: "⚡", title: "Perf A+", desc: "Code optimisé, score Lighthouse au maximum." },
    { icon: "📱", title: "Responsive natif", desc: "Parfait sur mobile, tablette et desktop." },
    { icon: "🚀", title: "Publie en 1 clic", desc: "Hébergement SSL, CDN, domaine personnalisé." },
  ];
  return (
    <section id="features" style={{ padding: "120px 24px", maxWidth: 1080, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <p style={{ color: s.green, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, fontFamily: s.font }}>FONCTIONNALITÉS</p>
        <h2 style={{ fontFamily: s.font, fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, color: "#fff", letterSpacing: -1 }}>
          Tout ce dont tu as besoin
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
        {features.map((f, i) => (
          <div key={i} style={{
            padding: "28px 24px", borderRadius: 14,
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
            cursor: "default", transition: "all 0.35s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,255,136,0.04)"; e.currentTarget.style.borderColor = "rgba(0,255,136,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.transform = "none"; }}
          >
            <span style={{ fontSize: 28, display: "block", marginBottom: 14 }}>{f.icon}</span>
            <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 6, fontFamily: s.font }}>{f.title}</h3>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// HOW IT WORKS
// ═══════════════════════════════════════════
function HowItWorks() {
  const steps = [
    { n: "01", t: "Colle ton URL ou décris ton idée", d: "Site vitrine, boutique Shopify, portfolio — on gère tout." },
    { n: "02", t: "Dis-nous ce que tu veux", d: "Plus moderne ? Plus de conversions ? L'IA s'adapte." },
    { n: "03", t: "L'IA génère ton site", d: "En secondes, un site complet, responsive et optimisé." },
    { n: "04", t: "Publie et encaisse", d: "Un clic pour publier. Domaine, SSL, CDN inclus." },
  ];
  return (
    <section id="how" style={{ padding: "120px 24px", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <p style={{ color: s.green, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, fontFamily: s.font }}>PROCESS</p>
        <h2 style={{ fontFamily: s.font, fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, color: "#fff", letterSpacing: -1 }}>4 étapes, 30 secondes</h2>
      </div>
      {steps.map((st, i) => (
        <div key={i} style={{
          display: "flex", gap: 28, alignItems: "flex-start",
          padding: "28px 0",
          borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none",
        }}>
          <span style={{
            fontFamily: s.font, fontSize: 44, fontWeight: 800,
            background: s.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            lineHeight: 1, minWidth: 70,
          }}>{st.n}</span>
          <div>
            <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 6, fontFamily: s.font }}>{st.t}</h3>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, lineHeight: 1.65 }}>{st.d}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

// ═══════════════════════════════════════════
// AI TOOL — with auth gate
// ═══════════════════════════════════════════
function AITool({ onOpenAuth }) {
  const { user } = useAuth();
  const { canGenerate, needsAuth, remaining, increment, FREE_LIMIT } = useGenerationLimit(user);
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [siteType, setSiteType] = useState("website");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("desktop");
  const iframeRef = useRef(null);

  const handleGenerate = useCallback(async () => {
    // Check auth gate
    if (needsAuth) {
      onOpenAuth("signup");
      return;
    }

    setLoading(true); setError(null); setProgress(0); setStep(2);

    const interval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 6 + 2, 93));
    }, 500);

    try {
      const prompt = `Tu es un expert world-class en web design et développement front-end. Génère un site web HTML COMPLET et SPECTACULAIRE.

${url ? `URL du site actuel : ${url}` : "Pas de site existant, crée from scratch."}
Type : ${siteType === "shopify" ? "Boutique e-commerce / Shopify" : "Site web classique"}

Demande : "${description}"

RÈGLES :
1. UNIQUEMENT du code HTML. Pas de markdown, pas de backticks.
2. Un fichier HTML avec CSS et JS intégrés
3. Commence par <!DOCTYPE html>, finis par </html>
4. Design PREMIUM niveau agence à 10 000€
5. Google Fonts (Outfit, DM Sans ou autre premium)
6. Animations CSS fluides
7. 100% responsive mobile-first
8. Si e-commerce : hero, grille produits avec prix, CTA, header avec panier
9. Contenu réaliste (pas de Lorem ipsum)
10. Images via https://picsum.photos/ ou emojis/SVG
11. Minimum 3 sections complètes`;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      clearInterval(interval);
      setProgress(100);

      if (data.content && data.content[0]) {
        let html = data.content[0].text || "";
        html = html.replace(/```html\s*/gi, "").replace(/```\s*/gi, "").trim();
        const idx = html.indexOf("<!DOCTYPE");
        if (idx > 0) html = html.substring(idx);
        setResult(html);
        increment(); // Count this generation
        setStep(3);
      } else if (data.error) {
        setError(`Erreur : ${data.error.message || "Réessaie."}`);
      } else {
        setError("Erreur inattendue. Réessaie !");
      }
    } catch {
      clearInterval(interval);
      setError("Impossible de contacter l'IA.");
    }
    setLoading(false);
  }, [url, description, siteType, needsAuth, onOpenAuth, increment]);

  useEffect(() => {
    if (result && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      doc.open(); doc.write(result); doc.close();
    }
  }, [result, step, viewMode]);

  return (
    <section id="tool" style={{ padding: "120px 24px", maxWidth: 880, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <p style={{ color: s.green, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, fontFamily: s.font }}>OUTIL IA</p>
        <h2 style={{ fontFamily: s.font, fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, color: "#fff", letterSpacing: -1 }}>
          Génère ton site maintenant
        </h2>

        {/* Generation counter */}
        {!user && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            marginTop: 16, padding: "8px 18px", borderRadius: 100,
            background: remaining > 0 ? "rgba(0,255,136,0.06)" : "rgba(255,68,102,0.08)",
            border: `1px solid ${remaining > 0 ? "rgba(0,255,136,0.15)" : "rgba(255,68,102,0.2)"}`,
          }}>
            <div style={{ display: "flex", gap: 4 }}>
              {Array.from({ length: FREE_LIMIT }).map((_, i) => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: i < remaining ? s.green : "rgba(255,255,255,0.1)",
                  transition: "background 0.3s",
                }} />
              ))}
            </div>
            <span style={{
              fontSize: 12, color: remaining > 0 ? "rgba(255,255,255,0.5)" : "#ff4466",
              fontFamily: s.fontBody,
            }}>
              {remaining > 0
                ? `${remaining} génération${remaining > 1 ? "s" : ""} gratuite${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}`
                : "Inscris-toi pour continuer"
              }
            </span>
          </div>
        )}
        {user && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            marginTop: 16, padding: "8px 18px", borderRadius: 100,
            background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)",
          }}>
            <span style={{ fontSize: 12, color: s.green, fontFamily: s.fontBody }}>
              ✓ Connecté — Générations illimitées
            </span>
          </div>
        )}
      </div>

      {/* Steps indicator */}
      <div style={{ display: "flex", gap: 6, marginBottom: 36, justifyContent: "center", alignItems: "center" }}>
        {[["Décris", 1], ["Génération", 2], ["Résultat", 3]].map(([label, num], i) => (
          <div key={num} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: s.font, fontSize: 13, fontWeight: 700,
              background: step >= num ? s.grad : "rgba(255,255,255,0.05)",
              color: step >= num ? s.bg : "rgba(255,255,255,0.25)", transition: "all 0.4s",
            }}>{num}</div>
            <span style={{ fontSize: 12, color: step >= num ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)", fontFamily: s.fontBody, fontWeight: 500 }}>{label}</span>
            {i < 2 && <div style={{ width: 32, height: 1, background: step > num ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.06)", margin: "0 4px" }} />}
          </div>
        ))}
      </div>

      {/* Main card */}
      <div style={{
        background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 18, padding: "clamp(24px,4vw,40px)", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -1, left: "15%", right: "15%", height: 1, background: "linear-gradient(90deg, transparent, rgba(0,255,136,0.35), transparent)" }} />

        {/* STEP 1 */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", color: "rgba(255,255,255,0.55)", fontSize: 13, marginBottom: 8, fontFamily: s.font, fontWeight: 600 }}>Type de site</label>
              <div style={{ display: "flex", gap: 10 }}>
                {[["website", "🌐 Site Web"], ["shopify", "🛒 Boutique E-commerce"]].map(([val, label]) => (
                  <button key={val} onClick={() => setSiteType(val)} style={{
                    flex: 1, padding: "13px 18px", borderRadius: 10, cursor: "pointer",
                    background: siteType === val ? "rgba(0,255,136,0.08)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${siteType === val ? "rgba(0,255,136,0.25)" : "rgba(255,255,255,0.06)"}`,
                    color: siteType === val ? s.green : "rgba(255,255,255,0.45)",
                    fontSize: 14, fontFamily: s.fontBody, fontWeight: 500, transition: "all 0.3s",
                  }}>{label}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", color: "rgba(255,255,255,0.55)", fontSize: 13, marginBottom: 8, fontFamily: s.font, fontWeight: 600 }}>
                URL actuelle <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400 }}>(optionnel)</span>
              </label>
              <input type="url" placeholder="https://monsite.com" value={url} onChange={e => setUrl(e.target.value)} style={s.inputBase}
                onFocus={e => e.target.style.borderColor = "rgba(0,255,136,0.3)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>
            <div>
              <label style={{ display: "block", color: "rgba(255,255,255,0.55)", fontSize: 13, marginBottom: 8, fontFamily: s.font, fontWeight: 600 }}>
                Que veux-tu ? <span style={{ color: "#ff4466" }}>*</span>
              </label>
              <textarea rows={4}
                placeholder={"Ex: Un site de coaching fitness sombre et moderne, avec un hero impactant et un bouton de réservation...\n\nOu: Améliore ma boutique Shopify — pages produit trop basiques, je veux plus de conversions."}
                value={description} onChange={e => setDescription(e.target.value)}
                style={{ ...s.inputBase, resize: "vertical", minHeight: 110, lineHeight: 1.6 }}
                onFocus={e => e.target.style.borderColor = "rgba(0,255,136,0.3)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Design plus moderne", "Optimise conversions", "Boutique e-commerce", "Landing page SaaS"].map(q => (
                <button key={q} onClick={() => setDescription(q)} style={{
                  padding: "6px 14px", borderRadius: 100, cursor: "pointer",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: s.fontBody, transition: "all 0.25s",
                }}>{q}</button>
              ))}
            </div>

            <button onClick={() => { if (description.trim()) handleGenerate(); }}
              disabled={!description.trim()}
              style={{
                padding: "15px 32px", borderRadius: 11, border: "none",
                cursor: description.trim() ? "pointer" : "not-allowed",
                background: description.trim() ? s.grad : "rgba(255,255,255,0.06)",
                color: description.trim() ? s.bg : "rgba(255,255,255,0.2)",
                fontWeight: 700, fontSize: 15, fontFamily: s.font, marginTop: 4,
              }}>
              {needsAuth ? "S'inscrire pour générer →" : "Générer avec l'IA →"}
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && loading && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{
              width: 64, height: 64, margin: "0 auto 28px", borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.04)", borderTopColor: s.green,
              animation: "spin 0.8s linear infinite",
            }} />
            <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 700, fontFamily: s.font, marginBottom: 8 }}>L'IA travaille sur ton site...</h3>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, marginBottom: 32 }}>Analyse • Design • Code • Optimisation</p>
            <div style={{ width: "100%", maxWidth: 400, height: 5, borderRadius: 10, background: "rgba(255,255,255,0.04)", overflow: "hidden", margin: "0 auto" }}>
              <div style={{ height: "100%", borderRadius: 10, background: s.grad, width: `${progress}%`, transition: "width 0.5s ease" }} />
            </div>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, fontFamily: s.font, display: "block", marginTop: 10 }}>{Math.round(progress)}%</span>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,68,68,0.1)", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>⚠</div>
            <p style={{ color: "#ff4466", fontSize: 15, marginBottom: 24 }}>{error}</p>
            <button onClick={() => { setStep(1); setError(null); }} style={{
              padding: "11px 28px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontFamily: s.fontBody, fontSize: 14,
            }}>← Recommencer</button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && result && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(0,255,136,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✓</div>
                <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: s.font }}>Site généré !</h3>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["desktop", "mobile"].map(mode => (
                  <button key={mode} onClick={() => setViewMode(mode)} style={{
                    padding: "6px 14px", borderRadius: 7, cursor: "pointer",
                    background: viewMode === mode ? "rgba(0,255,136,0.1)" : "transparent",
                    border: `1px solid ${viewMode === mode ? "rgba(0,255,136,0.2)" : "rgba(255,255,255,0.06)"}`,
                    color: viewMode === mode ? s.green : "rgba(255,255,255,0.3)",
                    fontSize: 12, fontFamily: s.fontBody,
                  }}>{mode === "desktop" ? "🖥 Desktop" : "📱 Mobile"}</button>
                ))}
                <button onClick={() => { setStep(1); setResult(null); setDescription(""); setUrl(""); }} style={{
                  padding: "6px 14px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.06)",
                  background: "transparent", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 12, fontFamily: s.fontBody,
                }}>← Nouveau</button>
              </div>
            </div>

            <div style={{
              borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)",
              margin: "0 auto", maxWidth: viewMode === "mobile" ? 375 : "100%", transition: "max-width 0.4s ease",
            }}>
              <div style={{
                background: "rgba(255,255,255,0.03)", padding: "8px 14px",
                display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {["#ff5f57", "#febc2e", "#28c840"].map(c => (
                    <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
                  ))}
                </div>
                <div style={{ flex: 1, textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11, fontFamily: s.fontBody }}>siteforgeai.com/preview</div>
              </div>
              <iframe ref={iframeRef} style={{
                width: "100%", height: viewMode === "mobile" ? 667 : 520,
                border: "none", background: "#fff", transition: "height 0.4s ease",
              }} title="Preview" sandbox="allow-scripts" />
            </div>

            {/* Publish CTA */}
            <div style={{
              marginTop: 20, padding: "20px 24px", borderRadius: 14,
              background: "linear-gradient(135deg, rgba(0,255,136,0.06), rgba(0,120,255,0.04))",
              border: "1px solid rgba(0,255,136,0.12)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 16,
            }}>
              <div>
                <h4 style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 4, fontFamily: s.font }}>Prêt à publier ?</h4>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Domaine + hébergement + SSL à partir de 9€/mois</p>
              </div>
              <button onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })} style={{
                padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer",
                background: s.grad, color: s.bg, fontWeight: 700, fontSize: 14, fontFamily: s.font,
                boxShadow: "0 0 24px rgba(0,255,136,0.2)", whiteSpace: "nowrap",
              }}>Choisir un plan →</button>
            </div>

            <button onClick={() => {
              const blob = new Blob([result], { type: "text/html" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob); a.download = "mon-site-siteforgeai.html"; a.click();
            }} style={{
              marginTop: 10, width: "100%", padding: "11px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.05)", background: "transparent",
              color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 13, fontFamily: s.fontBody,
            }}>↓ Télécharger le code HTML</button>
          </div>
        )}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// PRICING
// ═══════════════════════════════════════════
function Pricing({ onOpenAuth }) {
  const { user } = useAuth();
  const plans = [
    { name: "Starter", price: "9", desc: "Sites perso & side projects",
      features: ["1 site publié", "Hébergement SSL", "Sous-domaine .siteforge.ai", "3 régénérations/mois", "Support email"],
      cta: "Commencer", link: CONFIG.STRIPE_LINKS.starter, hl: false },
    { name: "Pro", price: "29", desc: "Freelances & PME",
      features: ["5 sites publiés", "Domaine personnalisé", "Régénérations illimitées", "Analytics intégrés", "Support prioritaire", "Export Shopify"],
      cta: "Choisir Pro", link: CONFIG.STRIPE_LINKS.pro, hl: true },
    { name: "Business", price: "79", desc: "Agences & équipes",
      features: ["Sites illimités", "Multi-domaines", "White-label", "Accès API", "Manager dédié", "SLA 99.9%"],
      cta: "Nous contacter", link: CONFIG.STRIPE_LINKS.business, hl: false },
  ];

  const handlePlan = (link) => {
    if (!user) {
      onOpenAuth("signup");
      return;
    }
    window.open(link, "_blank");
  };

  return (
    <section id="pricing" style={{ padding: "120px 24px", maxWidth: 1060, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <p style={{ color: s.green, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, fontFamily: s.font }}>PRICING</p>
        <h2 style={{ fontFamily: s.font, fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, color: "#fff", letterSpacing: -1, marginBottom: 12 }}>
          Génération gratuite. Paiement à la publication.
        </h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15 }}>Tu ne sors ta carte que quand tu es convaincu.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, alignItems: "stretch" }}>
        {plans.map((p, i) => (
          <div key={i} style={{
            borderRadius: 18, padding: 32,
            background: p.hl ? "linear-gradient(180deg, rgba(0,255,136,0.05), rgba(0,120,255,0.02))" : "rgba(255,255,255,0.015)",
            border: `1px solid ${p.hl ? "rgba(0,255,136,0.2)" : "rgba(255,255,255,0.05)"}`,
            display: "flex", flexDirection: "column", position: "relative", transition: "all 0.35s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "none"}
          >
            {p.hl && (
              <div style={{
                position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
                padding: "3px 14px", borderRadius: 100, background: s.grad,
                color: s.bg, fontSize: 11, fontWeight: 700, fontFamily: s.font, letterSpacing: 1,
              }}>POPULAIRE</div>
            )}
            <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 700, fontFamily: s.font, marginBottom: 4 }}>{p.name}</h3>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 20 }}>{p.desc}</p>
            <div style={{ marginBottom: 24 }}>
              <span style={{ color: "#fff", fontSize: 44, fontWeight: 800, fontFamily: s.font, letterSpacing: -2 }}>{p.price}€</span>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 14 }}>/mois</span>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {p.features.map((f, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ color: s.green, fontSize: 13 }}>✓</span>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>{f}</span>
                </div>
              ))}
            </div>
            <button onClick={() => handlePlan(p.link)} style={{
              display: "block", textAlign: "center", width: "100%",
              padding: "13px 24px", borderRadius: 10, cursor: "pointer",
              background: p.hl ? s.grad : "rgba(255,255,255,0.05)",
              border: p.hl ? "none" : "1px solid rgba(255,255,255,0.08)",
              color: p.hl ? s.bg : "#fff",
              fontWeight: 700, fontSize: 14, fontFamily: s.font,
            }}>
              {!user ? "S'inscrire → " + p.cta : p.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// FAQ
// ═══════════════════════════════════════════
function FAQ() {
  const [open, setOpen] = useState(null);
  const items = [
    ["C'est vraiment gratuit pour essayer ?", "Oui ! Tu as 3 générations gratuites sans même créer de compte. Après, inscris-toi gratuitement pour continuer. Tu ne paies que si tu publies."],
    ["Ça marche avec Shopify ?", "Notre IA génère des pages e-commerce complètes. Tu peux utiliser le code comme base pour ton thème Shopify."],
    ["Comment fonctionne l'hébergement ?", "Hébergement haute performance avec SSL, CDN global et 99.9% d'uptime. Ton site se charge en moins d'une seconde."],
    ["Je peux utiliser mon propre domaine ?", "Oui, à partir du plan Pro (29€/mois). Le plan Starter utilise un sous-domaine .siteforge.ai."],
    ["Mes données sont sécurisées ?", "Authentification via Supabase (même infra que des milliers de startups). Paiements sécurisés par Stripe. On ne stocke jamais tes données de carte."],
  ];
  return (
    <section style={{ padding: "80px 24px 120px", maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ fontFamily: s.font, fontSize: 32, fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: 40, letterSpacing: -1 }}>Questions fréquentes</h2>
      {items.map(([q, a], i) => (
        <div key={i} style={{
          borderRadius: 12, overflow: "hidden", marginBottom: 8,
          border: "1px solid rgba(255,255,255,0.05)",
          background: open === i ? "rgba(255,255,255,0.02)" : "transparent",
        }}>
          <button onClick={() => setOpen(open === i ? null : i)} style={{
            width: "100%", padding: "16px 20px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "none", border: "none", cursor: "pointer",
            color: open === i ? "#fff" : "rgba(255,255,255,0.6)",
            fontSize: 15, fontFamily: s.fontBody, fontWeight: 600, textAlign: "left",
          }}>
            {q}
            <span style={{ transform: open === i ? "rotate(45deg)" : "none", transition: "transform 0.3s", fontSize: 18, color: open === i ? s.green : "rgba(255,255,255,0.2)" }}>+</span>
          </button>
          <div style={{ maxHeight: open === i ? 200 : 0, overflow: "hidden", transition: "max-height 0.35s ease" }}>
            <p style={{ padding: "0 20px 16px", color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.65 }}>{a}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

// ═══════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════
function Footer() {
  return (
    <footer style={{ padding: "32px 24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 13, fontFamily: s.fontBody }}>
        © 2026 SiteForgeAI — Propulsé par l'intelligence artificielle
      </p>
    </footer>
  );
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
const SECTION_IDS = ["hero", "features", "how", "tool", "pricing"];

export default function App() {
  const [activeSection, setActiveSection] = useState("hero");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const openAuth = useCallback((mode = "login") => {
    setAuthMode(mode);
    setAuthOpen(true);
  }, []);

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.25 }
    );
    SECTION_IDS.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <GridBackground />
      <Nav active={activeSection} onNav={scrollTo} onOpenAuth={() => openAuth("login")} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
      <main style={{ position: "relative", zIndex: 1 }}>
        <Hero onNav={scrollTo} />
        <Features />
        <HowItWorks />
        <AITool onOpenAuth={openAuth} />
        <Pricing onOpenAuth={openAuth} />
        <FAQ />
        <Footer />
      </main>
    </>
  );
}
