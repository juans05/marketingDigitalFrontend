import { useState, useRef, useEffect } from 'react';
import { Info, Loader2, RefreshCw } from 'lucide-react';

// ── Official SVG brand icons ──────────────────────────────────────────────────
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
    <defs>
      <radialGradient id="ig-g1" cx="30%" cy="107%" r="150%">
        <stop offset="0%" stopColor="#fdf497"/>
        <stop offset="5%" stopColor="#fdf497"/>
        <stop offset="45%" stopColor="#fd5949"/>
        <stop offset="60%" stopColor="#d6249f"/>
        <stop offset="90%" stopColor="#285AEB"/>
      </radialGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-g1)"/>
    <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none"/>
    <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
  </svg>
);

const IconTikTok = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
    <rect width="24" height="24" rx="6" fill="#010101"/>
    <path d="M16.5 5.5c.3 1.4 1.2 2.5 2.5 3v2.2c-1-.1-2-.5-2.8-1v5.3c0 2.5-2 4.5-4.5 4.5s-4.5-2-4.5-4.5 2-4.5 4.5-4.5c.2 0 .4 0 .6.1V12.7c-.2 0-.4-.1-.6-.1-1.2 0-2.2 1-2.2 2.2s1 2.2 2.2 2.2 2.2-1 2.2-2.2V5.5h2.6z" fill="white"/>
    <path d="M15.9 5.5c.3 1.4 1.2 2.5 2.5 3v2.2c-1-.1-2-.5-2.8-1v5.3c0 2.5-2 4.5-4.5 4.5s-4.5-2-4.5-4.5 2-4.5 4.5-4.5c.2 0 .4 0 .6.1V12.7c-.2 0-.4-.1-.6-.1-1.2 0-2.2 1-2.2 2.2s1 2.2 2.2 2.2 2.2-1 2.2-2.2V5.5h2.6z" fill="#69C9D0" transform="translate(-0.5 0)"/>
  </svg>
);

const IconYouTube = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
    <rect width="24" height="24" rx="6" fill="#FF0000"/>
    <path d="M19.5 8.5s-.2-1.4-.8-2c-.8-.8-1.7-.8-2-.9C15 5.5 12 5.5 12 5.5s-3 0-4.7.1c-.4 0-1.3.1-2 .9-.6.6-.8 2-.8 2S4.3 10.1 4.3 12v1.4c0 1.4.2 2.8.2 2.8s.2 1.4.8 2c.8.8 1.8.8 2.2.8C8.7 18.2 12 18.2 12 18.2s3 0 4.7-.2c.4 0 1.3-.1 2-.9.6-.6.8-2 .8-2s.2-1.4.2-2.8V12c0-1.4-.2-3.5-.2-3.5z" fill="white" fillOpacity=".2"/>
    <polygon points="10,9 10,15 15.5,12" fill="white"/>
  </svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
    <rect width="24" height="24" rx="6" fill="#1877F2"/>
    <path d="M15.5 4h-2c-1.7 0-3.5.8-3.5 3.5v2H8V13h2v7h3.5v-7H16l.5-3.5h-3V8c0-1 .3-1.5 1.5-1.5H16.5V4z" fill="white"/>
  </svg>
);

const PLATFORM_META = {
  instagram: { label: 'Instagram',    Icon: IconInstagram, color: '#E1306C' },
  tiktok:    { label: 'TikTok',       Icon: IconTikTok,    color: '#69C9D0' },
  youtube:   { label: 'YouTube',      Icon: IconYouTube,   color: '#FF0000' },
  facebook:  { label: 'Facebook',     Icon: IconFacebook,  color: '#1877F2' },
};

const ALL_PLATFORMS = ['instagram', 'tiktok', 'youtube', 'facebook'];

// ── Sub-components ────────────────────────────────────────────────────────────
const Toggle = ({ on, onChange }) => (
  <button
    onClick={() => onChange(!on)}
    aria-label={on ? 'Desactivar' : 'Activar'}
    style={{
      width: '48px', height: '26px', borderRadius: '999px', flexShrink: 0,
      background: on ? 'linear-gradient(135deg, #7c3aed, #aa0266)' : 'rgba(255,255,255,0.1)',
      border: 'none', cursor: 'pointer', padding: '3px',
      display: 'flex', alignItems: 'center',
      justifyContent: on ? 'flex-end' : 'flex-start',
      transition: 'background 0.3s ease',
      boxShadow: on ? '0 0 12px rgba(124,58,237,0.4)' : 'none',
    }}
  >
    <div style={{
      width: '20px', height: '20px', borderRadius: '50%',
      background: on ? '#fff' : 'rgba(255,255,255,0.4)',
      transition: 'background 0.3s ease',
    }} />
  </button>
);

const GlassCard = ({ children, className, style = {} }) => (
  <div className={className} style={{
    backdropFilter: 'blur(16px)',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    ...style,
  }}>
    {children}
  </div>
);

const GradientTitle = ({ children, style = {} }) => (
  <h2 style={{
    fontFamily: 'Outfit, sans-serif', fontSize: '20px', fontWeight: '700',
    margin: '0 0 16px 0',
    background: 'linear-gradient(135deg, #d2bbff 0%, #ffb0cd 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    ...style,
  }}>
    {children}
  </h2>
);

const fieldStyle = (focused) => ({
  width: '100%', padding: '12px 14px', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.05)',
  border: `1px solid ${focused ? 'rgba(124,58,237,0.7)' : 'rgba(255,255,255,0.1)'}`,
  borderRadius: '12px', color: '#e7dff0', fontSize: '14px',
  fontFamily: 'Inter, sans-serif', outline: 'none',
  transition: 'border-color 0.2s',
  boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.12)' : 'none',
});

const labelStyle = {
  display: 'block', fontSize: '11px', fontWeight: '600',
  color: 'rgba(204,195,216,0.6)', textTransform: 'uppercase',
  letterSpacing: '0.06em', marginBottom: '8px',
};

// ── Main Component ────────────────────────────────────────────────────────────
const Settings = ({ user, activeArtist, onUpdate }) => {
  const [form, setForm] = useState({
    name:   user?.name    || '',
    handle: user?.handle  || user?.email?.split('@')[0] || '',
    bio:    user?.bio     || '',
  });
  const [focus, setFocus]           = useState(null);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [avatar, setAvatar]         = useState(user?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState(null);  // File object pending upload
  const [uploading, setUploading]   = useState(false);
  const [smartReply, setSmartReply] = useState(true);
  const [autoDM, setAutoDM]         = useState(false);
  const [connecting, setConnecting] = useState(null);
  const [connectError, setConnectError] = useState('');
  const [popupOpened, setPopupOpened] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const fileRef = useRef(null);

  const [activePlatforms, setActivePlatforms] = useState(activeArtist?.active_platforms || []);
  const artistId = activeArtist?.id;

  useEffect(() => {
    setActivePlatforms(activeArtist?.active_platforms || []);
  }, [activeArtist?.id]);
  const API = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

  const getToken = () => {
    try { return JSON.parse(localStorage.getItem('vidalis_user') || '{}').token || ''; }
    catch { return ''; }
  };

  // ── Avatar: preview local inmediato ───────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ── Subir imagen a Cloudinary ─────────────────────────────────────────────
  const uploadAvatarToCloudinary = async (file) => {
    // 1. Pedir firma al backend
    const sigRes = await fetch(
      `${API}/api/vidalis/cloudinary-signature?folder=vidalis_avatars&resourceType=image`,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    const sig = await sigRes.json();

    // 2. Subir directo a Cloudinary (sin eager transform para avatares)
    const fd = new FormData();
    fd.append('file', file);
    fd.append('api_key', sig.apiKey);
    fd.append('timestamp', sig.timestamp);
    fd.append('folder', sig.folder);
    fd.append('access_mode', 'public');
    // Firma sin eager (avatars no necesitan transformación de video)
    const params = { access_mode: 'public', folder: sig.folder, timestamp: sig.timestamp };
    const sigStr = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
    // Usar la firma del backend directamente
    fd.append('signature', sig.signature);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
      { method: 'POST', body: fd }
    );
    const uploaded = await uploadRes.json();
    if (!uploaded.secure_url) throw new Error('Cloudinary no devolvió URL');
    return uploaded.secure_url;
  };

  // ── Guardar perfil ────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      let avatarUrl = user?.avatar_url || null;

      // Si hay imagen nueva pendiente, subirla primero
      if (avatarFile) {
        setUploading(true);
        avatarUrl = await uploadAvatarToCloudinary(avatarFile);
        setAvatarFile(null);
        setUploading(false);
      }

      // Llamar al backend para persistir
      const res = await fetch(`${API}/api/vidalis/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: form.name, bio: form.bio, handle: form.handle, avatar_url: avatarUrl }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al guardar');
      }

      const { user: updated } = await res.json();

      // Actualizar localStorage y estado padre
      const stored = JSON.parse(localStorage.getItem('vidalis_user') || '{}');
      const merged = { ...stored, name: updated.name, bio: updated.bio, handle: updated.handle, avatar_url: updated.avatar_url, onboarding_completed: updated.onboarding_completed };
      localStorage.setItem('vidalis_user', JSON.stringify(merged));
      onUpdate?.({ firstName: updated.name, lastName: '', bio: updated.bio, avatar_url: updated.avatar_url });

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleConnect = async (platform) => {
    if (!artistId) {
      setConnectError('Primero selecciona un artista en el dashboard.');
      return;
    }
    setConnecting(platform);
    setConnectError('');
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/vidalis/connect-social/${artistId}?platform=${platform}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al conectar');
      if (data.url) {
        window.open(data.url, '_blank', 'width=700,height=750');
        setPopupOpened(true);
      }
    } catch (err) {
      setConnectError(err.message);
    } finally {
      setConnecting(null);
    }
  };

  const handleVerify = async () => {
    if (!artistId) return;
    setVerifying(true);
    setConnectError('');
    try {
      const res = await fetch(
        `${API}/api/vidalis/social-status/${artistId}?refresh=true`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al verificar');
      setActivePlatforms(data.platforms || []);
      setPopupOpened(false);
    } catch (err) {
      setConnectError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  // ── Plan labels ───────────────────────────────────────────────────────────
  const PLANS = {
    'Mini':       { name: 'Mini',        price: 'Gratis', desc: 'Acceso básico a publicación y análisis de contenido.' },
    'Artista':    { name: 'Artista',     price: '$29',    desc: 'Calendario editorial, todas las plataformas principales y métricas avanzadas.' },
    'Estrella':   { name: 'Estrella',    price: '$79',    desc: 'Videos ilimitados, YouTube y LinkedIn, IA de contenido completa.' },
    'Agencia Pro':{ name: 'Agencia Pro', price: '$149',   desc: 'Sin límites, todas las redes, soporte prioritario y analítica global.' },
  };
  const plan = PLANS[user?.plan_type] || PLANS['Mini'];

  return (
    <div className="settings-root" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 32px 80px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* ── Profile & Branding ─────────────────────────────────────────────── */}
      <section>
        <GradientTitle>Profile & Branding</GradientTitle>
        <GlassCard className="settings-profile-card" style={{ padding: '32px', display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: '112px', height: '112px', borderRadius: '22px', overflow: 'hidden',
                border: '2px solid rgba(210,187,255,0.35)',
                background: avatar ? 'transparent' : 'linear-gradient(135deg, #7c3aed 0%, #aa0266 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative',
              }}
            >
              {avatar ? (
                <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '44px', fontWeight: '800', color: '#fff', lineHeight: 1 }}>
                  {(form.name || user?.email || '?')[0].toUpperCase()}
                </span>
              )}
              {/* Hover overlay */}
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                <span style={{ fontSize: '12px', color: '#fff', fontWeight: '600' }}>Cambiar</span>
              </div>
            </div>

            {/* Camera button */}
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                position: 'absolute', bottom: '-6px', right: '-6px',
                width: '30px', height: '30px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #7c3aed, #aa0266)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(124,58,237,0.45)',
              }}
            >
              <svg viewBox="0 0 20 20" width="14" height="14" fill="white">
                <path d="M7 4l1.5-2h3L13 4h4a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4zm3 9a3.5 3.5 0 100-7 3.5 3.5 0 000 7zm0-2a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
              </svg>
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
          </div>

          {/* Form fields */}
          <div style={{ flex: 1, minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="settings-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Display Name</label>
                <input
                  style={fieldStyle(focus === 'name')}
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  onFocus={() => setFocus('name')} onBlur={() => setFocus(null)}
                />
              </div>
              <div>
                <label style={labelStyle}>Handle</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(204,195,216,0.45)', fontSize: '14px', pointerEvents: 'none' }}>@</span>
                  <input
                    style={{ ...fieldStyle(focus === 'handle'), paddingLeft: '28px' }}
                    value={form.handle}
                    onChange={e => setForm(p => ({ ...p, handle: e.target.value }))}
                    onFocus={() => setFocus('handle')} onBlur={() => setFocus(null)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Bio</label>
              <textarea
                rows={3}
                style={{ ...fieldStyle(focus === 'bio'), resize: 'none' }}
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                onFocus={() => setFocus('bio')} onBlur={() => setFocus(null)}
                placeholder="Describe tu marca o perfil..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '11px 28px', borderRadius: '12px',
                  background: saved
                    ? 'rgba(78,222,163,0.15)'
                    : 'linear-gradient(135deg, #7c3aed, #aa0266)',
                  color: saved ? '#4edea3' : '#fff',
                  border: saved ? '1px solid rgba(78,222,163,0.3)' : 'none',
                  fontWeight: '700', fontSize: '14px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  transition: 'all 0.3s',
                  boxShadow: saved ? 'none' : '0 0 20px rgba(124,58,237,0.3)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                {(saving || uploading) && <Loader2 size={14} className="animate-spin" />}
                {saved ? '✓ Guardado' : uploading ? 'Subiendo imagen...' : saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* ── Connected Accounts + Automation Rules ──────────────────────────── */}
      <div className="settings-accounts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Connected Accounts */}
        <section>
          <GradientTitle>Cuentas Conectadas</GradientTitle>
          {connectError && (
            <div style={{ marginBottom: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', fontSize: '12px', color: '#fca5a5' }}>
              {connectError}
            </div>
          )}
          <GlassCard style={{ overflow: 'hidden' }}>
            {ALL_PLATFORMS.map((platform, idx) => {
              const meta = PLATFORM_META[platform];
              const connected = activePlatforms.includes(platform);
              const isConnecting = connecting === platform;
              return (
                <div
                  key={platform}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: idx < ALL_PLATFORMS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, overflow: 'hidden',
                    }}>
                      <meta.Icon />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#e7dff0' }}>{meta.label}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(204,195,216,0.45)', marginTop: '2px' }}>
                        {connected
                          ? `@${(activeArtist?.name || '').toLowerCase().replace(/\s+/g, '')}`
                          : 'No conectado'}
                      </div>
                    </div>
                  </div>

                  {connected ? (
                    <span style={{
                      padding: '4px 12px', borderRadius: '999px', fontSize: '10px', fontWeight: '800',
                      background: 'rgba(0,118,80,0.2)', color: '#4edea3',
                      border: '1px solid rgba(78,222,163,0.25)', letterSpacing: '0.05em',
                    }}>
                      CONECTADO
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConnect(platform)}
                      disabled={isConnecting || !artistId}
                      style={{
                        padding: '6px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                        background: 'transparent',
                        border: `1px solid ${artistId ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)'}`,
                        color: artistId ? '#ccc3d8' : 'rgba(204,195,216,0.3)',
                        cursor: isConnecting || !artistId ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { if (artistId) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {isConnecting ? <Loader2 size={11} className="animate-spin" /> : null}
                      {isConnecting ? 'Conectando...' : 'CONECTAR'}
                    </button>
                  )}
                </div>
              );
            })}
          </GlassCard>
          {!artistId && (
            <p style={{ marginTop: '10px', fontSize: '11px', color: 'rgba(204,195,216,0.4)', paddingLeft: '4px' }}>
              Selecciona un artista para conectar cuentas.
            </p>
          )}
          {popupOpened && (
            <button
              onClick={handleVerify}
              disabled={verifying}
              style={{
                width: '100%', marginTop: '12px', height: '44px', borderRadius: '12px',
                background: 'rgba(124,58,237,0.1)', color: '#A78BFA',
                border: '1px solid rgba(124,58,237,0.3)', fontWeight: 700, fontSize: '12px',
                cursor: verifying ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              <RefreshCw size={14} style={verifying ? { animation: 'spin 0.8s linear infinite' } : {}} />
              {verifying ? 'VERIFICANDO...' : 'YA CONECTÉ — CONFIRMAR'}
            </button>
          )}
        </section>

        {/* Automation Rules */}
        <section>
          <GradientTitle>Reglas de Automatización</GradientTitle>
          <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                  background: 'rgba(124,58,237,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                }}>
                  🤖
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#e7dff0' }}>Smart Reply</div>
                  <div style={{ fontSize: '11px', color: 'rgba(204,195,216,0.5)', marginTop: '2px', lineHeight: 1.5 }}>
                    La IA genera respuestas contextuales a comentarios
                  </div>
                </div>
              </div>
              <Toggle on={smartReply} onChange={setSmartReply} />
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
              opacity: autoDM ? 1 : 0.5, transition: 'opacity 0.3s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                }}>
                  ✉️
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#e7dff0' }}>Auto-DM</div>
                  <div style={{ fontSize: '11px', color: 'rgba(204,195,216,0.5)', marginTop: '2px', lineHeight: 1.5 }}>
                    Saludo automático para nuevos seguidores
                  </div>
                </div>
              </div>
              <Toggle on={autoDM} onChange={setAutoDM} />
            </div>

            <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Info size={13} color="rgba(204,195,216,0.4)" style={{ marginTop: '1px', flexShrink: 0 }} />
              <span style={{ fontSize: '11px', color: 'rgba(204,195,216,0.45)', fontStyle: 'italic', lineHeight: 1.6 }}>
                Las automatizaciones aplican en todas las plataformas conectadas.
              </span>
            </div>
          </GlassCard>
        </section>
      </div>

      {/* ── Subscription ───────────────────────────────────────────────────── */}
      <section>
        <GradientTitle>Suscripción</GradientTitle>
        <GlassCard style={{ overflow: 'hidden', position: 'relative' }}>
          {/* Background glow */}
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '220px', height: '220px',
            background: 'rgba(124,58,237,0.1)', borderRadius: '50%',
            filter: 'blur(80px)', pointerEvents: 'none',
          }} />
          <div className="settings-sub-inner" style={{
            padding: '40px', position: 'relative', zIndex: 1,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '32px',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '4px 14px', borderRadius: '999px', width: 'fit-content',
                background: 'rgba(170,2,102,0.15)', border: '1px solid rgba(255,176,205,0.3)',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffb0cd', animation: 'settingsPulse 2s infinite' }} />
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#ffb0cd', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Plan Activo</span>
              </div>
              <h3 style={{ fontSize: '26px', fontWeight: '800', color: '#e7dff0', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                {plan.name}
              </h3>
              <p style={{ color: 'rgba(204,195,216,0.65)', fontSize: '14px', margin: 0, maxWidth: '360px', lineHeight: 1.6 }}>
                {plan.desc}
              </p>
            </div>

            <div className="settings-sub-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '20px' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '34px', fontWeight: '800', color: '#e7dff0', fontFamily: 'Outfit, sans-serif' }}>{plan.price}</span>
                {plan.price !== 'Gratis' && <span style={{ color: 'rgba(204,195,216,0.5)', fontSize: '14px' }}>/mes</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                <button
                  style={{
                    padding: '12px 28px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #7c3aed, #aa0266)',
                    color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.35)'; }}
                >
                  Administrar Facturación
                </button>
                <button style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontSize: '12px', color: 'rgba(204,195,216,0.45)',
                  textDecoration: 'underline', textUnderlineOffset: '3px',
                  textDecorationColor: 'rgba(204,195,216,0.15)',
                  transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#d2bbff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(204,195,216,0.45)'}
                >
                  Cambiar Plan
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      <style>{`
        @keyframes settingsPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .settings-root { padding: 20px 16px 80px !important; }
          .settings-profile-card { padding: 20px !important; }
          .settings-form-grid { grid-template-columns: 1fr !important; }
          .settings-accounts-grid { grid-template-columns: 1fr !important; }
          .settings-sub-inner { padding: 24px !important; flex-direction: column !important; align-items: flex-start !important; }
          .settings-sub-actions { align-items: flex-start !important; }
        }
      `}</style>
    </div>
  );
};

export default Settings;
