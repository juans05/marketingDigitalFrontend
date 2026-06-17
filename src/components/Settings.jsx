import { useState, useEffect } from 'react';
import { Camera, Info } from 'lucide-react';

const PLATFORM_META = {
  instagram: {
    label: 'Instagram',
    icon: '📸',
    gradient: 'linear-gradient(135deg, #f9ce34, #ee2a7b, #6228d7)',
    textColor: '#fff',
  },
  tiktok: {
    label: 'TikTok',
    icon: '🎵',
    gradient: 'linear-gradient(135deg, #010101, #69C9D0)',
    textColor: '#fff',
  },
  youtube: {
    label: 'YouTube',
    icon: '▶',
    gradient: 'linear-gradient(135deg, #FF0000, #cc0000)',
    textColor: '#fff',
  },
  facebook: {
    label: 'Facebook',
    icon: 'f',
    gradient: 'linear-gradient(135deg, #1877F2, #0d5fd6)',
    textColor: '#fff',
  },
  twitter: {
    label: 'X (Twitter)',
    icon: '✕',
    gradient: 'linear-gradient(135deg, #14171A, #333)',
    textColor: '#fff',
  },
  linkedin: {
    label: 'LinkedIn',
    icon: 'in',
    gradient: 'linear-gradient(135deg, #0077B5, #005885)',
    textColor: '#fff',
  },
};

const ALL_PLATFORMS = ['instagram', 'tiktok', 'youtube', 'facebook'];

const Toggle = ({ on, onChange }) => (
  <button
    onClick={() => onChange(!on)}
    style={{
      width: '48px', height: '26px', borderRadius: '999px',
      background: on ? 'linear-gradient(135deg, #7c3aed, #aa0266)' : 'rgba(255,255,255,0.1)',
      border: 'none', cursor: 'pointer', padding: '3px',
      display: 'flex', alignItems: 'center',
      justifyContent: on ? 'flex-end' : 'flex-start',
      transition: 'all 0.3s ease', flexShrink: 0,
    }}
  >
    <div style={{
      width: '20px', height: '20px', borderRadius: '50%',
      background: on ? '#fff' : 'rgba(255,255,255,0.4)',
      transition: 'all 0.3s ease',
      boxShadow: on ? '0 0 8px rgba(210,187,255,0.5)' : 'none',
    }} />
  </button>
);

const GlassCard = ({ children, style = {} }) => (
  <div style={{
    backdropFilter: 'blur(16px)',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    ...style,
  }}>
    {children}
  </div>
);

const GradientTitle = ({ children }) => (
  <h2 style={{
    fontFamily: 'Outfit, sans-serif', fontSize: '20px', fontWeight: '700', margin: '0 0 16px',
    background: 'linear-gradient(135deg, #d2bbff 0%, #ffb0cd 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  }}>
    {children}
  </h2>
);

const inputStyle = {
  width: '100%', padding: '12px 14px', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px', color: '#e7dff0', fontSize: '14px',
  fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border-color 0.2s',
};

const labelStyle = {
  display: 'block', fontSize: '11px', fontWeight: '600',
  color: 'rgba(204,195,216,0.6)', textTransform: 'uppercase',
  letterSpacing: '0.05em', marginBottom: '8px',
};

const Settings = ({ user, activeArtist, onUpdate }) => {
  const [form, setForm] = useState({
    name: user?.name || '',
    handle: user?.handle || user?.email?.split('@')[0] || '',
    bio: user?.bio || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [smartReply, setSmartReply] = useState(true);
  const [autoDM, setAutoDM] = useState(false);
  const [focusField, setFocusField] = useState(null);

  const activePlatforms = activeArtist?.active_platforms || [];

  const handleSave = async () => {
    setSaving(true);
    try {
      const [first, ...rest] = form.name.trim().split(' ');
      await onUpdate?.({ firstName: first, lastName: rest.join(' '), bio: form.bio });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const planLabels = {
    'Mini': { name: 'Mini', price: 'Gratis', desc: 'Acceso básico a publicación y análisis de contenido.' },
    'Artista': { name: 'Artista', price: '$29', desc: 'Calendario editorial, todas las plataformas principales y métricas avanzadas.' },
    'Estrella': { name: 'Estrella', price: '$79', desc: 'Videos ilimitados, YouTube y LinkedIn, IA de contenido completa.' },
    'Agencia Pro': { name: 'Agencia Pro', price: '$149', desc: 'Sin límites, todas las redes, soporte prioritario y analítica global.' },
  };
  const plan = planLabels[user?.plan_type] || planLabels['Mini'];

  return (
    <div style={{
      maxWidth: '960px', margin: '0 auto',
      padding: '32px 32px 80px',
      display: 'flex', flexDirection: 'column', gap: '32px',
    }}>

      {/* ── Profile & Branding ── */}
      <section>
        <GradientTitle>Profile & Branding</GradientTitle>
        <GlassCard style={{ padding: '32px', display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: '112px', height: '112px', borderRadius: '24px', overflow: 'hidden',
              border: '2px solid rgba(210,187,255,0.3)',
              background: 'linear-gradient(135deg, #7c3aed 0%, #aa0266 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '40px', color: 'white', fontWeight: '700',
              transition: 'border-color 0.2s',
            }}>
              {form.name ? form.name[0].toUpperCase() : '?'}
            </div>
            <button style={{
              position: 'absolute', bottom: '-6px', right: '-6px',
              width: '30px', height: '30px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #7c3aed, #aa0266)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
              transition: 'transform 0.2s',
            }}>
              <Camera size={14} color="white" />
            </button>
          </div>

          {/* Fields */}
          <div style={{ flex: 1, minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Display Name</label>
                <input
                  style={{ ...inputStyle, borderColor: focusField === 'name' ? '#7c3aed' : 'rgba(255,255,255,0.1)' }}
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  onFocus={() => setFocusField('name')}
                  onBlur={() => setFocusField(null)}
                />
              </div>
              <div>
                <label style={labelStyle}>Handle</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(204,195,216,0.5)', fontSize: '14px' }}>@</span>
                  <input
                    style={{ ...inputStyle, paddingLeft: '28px', borderColor: focusField === 'handle' ? '#7c3aed' : 'rgba(255,255,255,0.1)' }}
                    value={form.handle}
                    onChange={e => setForm(p => ({ ...p, handle: e.target.value }))}
                    onFocus={() => setFocusField('handle')}
                    onBlur={() => setFocusField(null)}
                  />
                </div>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Bio</label>
              <textarea
                rows={3}
                style={{ ...inputStyle, resize: 'none', borderColor: focusField === 'bio' ? '#7c3aed' : 'rgba(255,255,255,0.1)' }}
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                onFocus={() => setFocusField('bio')}
                onBlur={() => setFocusField(null)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '10px 28px', borderRadius: '12px', border: 'none',
                  background: saved ? 'rgba(78,222,163,0.2)' : 'linear-gradient(135deg, #7c3aed, #aa0266)',
                  color: saved ? '#4edea3' : '#fff', fontWeight: '700', fontSize: '14px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  border: saved ? '1px solid rgba(78,222,163,0.4)' : 'none',
                  transition: 'all 0.3s', opacity: saving ? 0.7 : 1,
                  boxShadow: saved ? 'none' : '0 0 20px rgba(124,58,237,0.3)',
                }}
              >
                {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* ── Connected Accounts + Automation Rules ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Connected Accounts */}
        <section>
          <GradientTitle>Cuentas Conectadas</GradientTitle>
          <GlassCard style={{ overflow: 'hidden' }}>
            {ALL_PLATFORMS.map((platform, idx) => {
              const meta = PLATFORM_META[platform];
              const connected = activePlatforms.includes(platform);
              return (
                <div key={platform} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '18px 20px',
                  borderBottom: idx < ALL_PLATFORMS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  transition: 'background 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: meta.gradient,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: platform === 'youtube' ? '16px' : '13px',
                      fontWeight: '800', color: '#fff', flexShrink: 0,
                    }}>
                      {meta.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#e7dff0' }}>{meta.label}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(204,195,216,0.5)', marginTop: '2px' }}>
                        {connected ? `@${activeArtist?.name?.toLowerCase().replace(/\s/g, '') || 'cuenta'}` : 'No conectado'}
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
                    <button style={{
                      padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                      background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                      color: '#ccc3d8', cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                      CONECTAR
                    </button>
                  )}
                </div>
              );
            })}
          </GlassCard>
        </section>

        {/* Automation Rules */}
        <section>
          <GradientTitle>Reglas de Automatización</GradientTitle>
          <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Smart Reply */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                  background: 'rgba(124,58,237,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '18px' }}>🤖</span>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#e7dff0' }}>Smart Reply</div>
                  <div style={{ fontSize: '11px', color: 'rgba(204,195,216,0.5)', marginTop: '2px' }}>La IA genera respuestas contextuales a comentarios</div>
                </div>
              </div>
              <Toggle on={smartReply} onChange={setSmartReply} />
            </div>

            {/* Auto-DM */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
              opacity: autoDM ? 1 : 0.55, transition: 'opacity 0.3s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '18px' }}>✉️</span>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#e7dff0' }}>Auto-DM</div>
                  <div style={{ fontSize: '11px', color: 'rgba(204,195,216,0.5)', marginTop: '2px' }}>Saludo automático para nuevos seguidores</div>
                </div>
              </div>
              <Toggle on={autoDM} onChange={setAutoDM} />
            </div>

            {/* Info note */}
            <div style={{
              paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'flex-start', gap: '8px',
            }}>
              <Info size={13} color="rgba(204,195,216,0.5)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ fontSize: '11px', color: 'rgba(204,195,216,0.5)', fontStyle: 'italic', lineHeight: 1.6 }}>
                Las automatizaciones aplican en todas las plataformas conectadas.
              </span>
            </div>
          </GlassCard>
        </section>
      </div>

      {/* ── Subscription ── */}
      <section>
        <GradientTitle>Suscripción</GradientTitle>
        <GlassCard style={{ overflow: 'hidden', position: 'relative' }}>
          {/* Glow */}
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '220px', height: '220px',
            background: 'rgba(124,58,237,0.1)',
            borderRadius: '50%', filter: 'blur(80px)',
            pointerEvents: 'none',
          }} />
          <div style={{
            padding: '40px', position: 'relative', zIndex: 1,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '32px',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '4px 14px', borderRadius: '999px',
                background: 'rgba(170,2,102,0.15)', border: '1px solid rgba(255,176,205,0.3)',
                width: 'fit-content',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffb0cd', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#ffb0cd', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Plan Activo</span>
              </div>
              <h3 style={{ fontSize: '26px', fontWeight: '800', color: '#e7dff0', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                {plan.name}
              </h3>
              <p style={{ color: 'rgba(204,195,216,0.7)', fontSize: '14px', margin: 0, maxWidth: '380px', lineHeight: 1.6 }}>
                {plan.desc}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '20px' }}>
              <div style={{ textAlign: 'right' }}>
                <div>
                  <span style={{ fontSize: '32px', fontWeight: '800', color: '#e7dff0', fontFamily: 'Outfit, sans-serif' }}>{plan.price}</span>
                  <span style={{ color: 'rgba(204,195,216,0.5)', fontSize: '14px' }}>{plan.price !== 'Gratis' ? '/mes' : ''}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                <button style={{
                  padding: '12px 28px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, #aa0266)',
                  color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.35)', transition: 'transform 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Administrar Facturación
                </button>
                <button style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontSize: '12px', color: 'rgba(204,195,216,0.5)',
                  textDecoration: 'underline', textUnderlineOffset: '3px',
                  textDecorationColor: 'rgba(204,195,216,0.2)',
                }}>
                  Cambiar Plan
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default Settings;
