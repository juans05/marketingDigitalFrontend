import { useState, useEffect } from 'react';
import { RefreshCw, Instagram, Facebook, Youtube, Sparkles, Building2, CheckCircle2, Link2, Loader2 } from 'lucide-react';

const PLATFORM_ICONS = {
  instagram:      { icon: <Instagram size={16} />,  label: 'Instagram',  color: '#E1306C' },
  facebook:       { icon: <Facebook size={16} />,   label: 'Facebook',   color: '#1877F2' },
  youtube:        { icon: <Youtube size={16} />,    label: 'YouTube',    color: '#FF0000' },
  tiktok:         { icon: <Sparkles size={16} />,   label: 'TikTok',     color: '#2DD4BF' },
  tiktok_business:{ icon: <Building2 size={16} />,  label: 'TikTok Biz', color: '#2DD4BF' },
};

const PLATFORM_DISPLAY_ORDER = ['instagram', 'tiktok', 'facebook', 'youtube', 'tiktok_business', 'linkedin'];
const sortByDisplayOrder = (platforms) => [...platforms].sort(
  (a, b) => PLATFORM_DISPLAY_ORDER.indexOf(a) - PLATFORM_DISPLAY_ORDER.indexOf(b)
);

const SocialConnect = ({ artistId, onPlatformsUpdated }) => {
  const [loading, setLoading]           = useState(false);
  const [verifying, setVerifying]       = useState(false);
  const [error, setError]               = useState('');
  const [popupOpened, setPopupOpened]   = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [selectablePlatforms, setSelectablePlatforms] = useState(null);

  useEffect(() => {
    if (artistId) fetchStatus();
  }, [artistId]);

  const fetchStatus = async () => {
    try {
      const userStr = localStorage.getItem('vidalis_user');
      const token = userStr ? JSON.parse(userStr).token : '';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/social-status/${artistId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConnectedPlatforms(data.platforms || []);
      }
    } catch {}
  };

  const requestConnectUrl = async (platform) => {
    const userStr = localStorage.getItem('vidalis_user');
    const token = userStr ? JSON.parse(userStr).token : '';
    const qs = platform ? `?platform=${platform}` : '';
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/connect-social/${artistId}${qs}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.code === 'PROFILE_LIMIT_REACHED') {
        throw new Error('Tu plan actual ha alcanzado el límite de perfiles. Contacta a soporte en servidorinjoyplan@gmail.com para ampliar tu plan.');
      }
      throw new Error(data.error || 'Error al generar link');
    }
    return data;
  };

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await requestConnectUrl();
      if (data.needsPlatformSelection) {
        setSelectablePlatforms(data.allowedPlatforms || []);
        return;
      }
      window.open(data.url, '_blank', 'width=700,height=750');
      setPopupOpened(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectPlatform = async (platform) => {
    setLoading(true);
    setError('');
    try {
      const data = await requestConnectUrl(platform);
      window.open(data.url, '_blank', 'width=700,height=750');
      setPopupOpened(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setError('');
    try {
      const userStr = localStorage.getItem('vidalis_user');
      const token = userStr ? JSON.parse(userStr).token : '';
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/social-status/${artistId}?refresh=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al verificar');
      const platforms = data.platforms || [];
      setConnectedPlatforms(platforms);
      setPopupOpened(false);
      onPlatformsUpdated?.(platforms);
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const hasConnections = connectedPlatforms.length > 0;

  return (
    <div className="social-connect-root" style={{
      background: '#121214',
      padding: '40px',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.08)',
      color: '#FAFAFA',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      marginBottom: '40px',
    }}>
      <h2 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '8px' }}>Conecta tus redes sociales</h2>
      <p style={{ color: '#71717A', fontSize: '14px', marginBottom: '32px' }}>
        Vincula tu cuenta de Vidalis con tus redes sociales. Podés modificarlo más adelante.
      </p>

      {/* Plataformas conectadas */}
      {hasConnections && (
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
            Redes conectadas
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {connectedPlatforms.map(pid => {
              const cfg = PLATFORM_ICONS[pid] || { icon: <Link2 size={16} />, label: pid, color: '#888' };
              return (
                <div key={pid} style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${cfg.color}33`,
                  borderRadius: '999px',
                  padding: '6px 14px',
                  fontSize: '13px', fontWeight: 600,
                  color: cfg.color,
                }}>
                  {cfg.icon} {cfg.label}
                  <CheckCircle2 size={14} color="#22c55e" style={{ marginLeft: '2px' }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selección de plataforma (Zernio: una URL de conexión por red) — solo las que faltan conectar */}
      {selectablePlatforms ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sortByDisplayOrder(selectablePlatforms.filter(pid => !connectedPlatforms.includes(pid))).map(pid => {
            const cfg = PLATFORM_ICONS[pid] || { icon: <Link2 size={16} />, label: pid, color: '#888' };
            return (
              <button
                key={pid}
                onClick={() => handleConnectPlatform(pid)}
                disabled={loading}
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${cfg.color}55`,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {cfg.icon} CONECTAR {cfg.label.toUpperCase()}
              </button>
            );
          })}
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={loading}
          style={{
            width: '100%',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '14px',
            letterSpacing: '0.05em',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s',
            boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {loading
            ? <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Abriendo portal...</>
            : <><Link2 size={18} /> {hasConnections ? 'GESTIONAR REDES CONECTADAS' : 'CONECTAR REDES SOCIALES'}</>
          }
        </button>
      )}

      {/* Botón de verificar (aparece tras abrir el portal) */}
      {popupOpened && (
        <button
          onClick={handleVerify}
          disabled={verifying}
          style={{
            width: '100%',
            marginTop: '12px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(79,70,229,0.1)',
            color: '#818CF8',
            border: '1px solid rgba(79,70,229,0.3)',
            fontWeight: 700,
            fontSize: '13px',
            cursor: verifying ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.2s',
          }}
        >
          <RefreshCw size={15} style={verifying ? { animation: 'spin 0.8s linear infinite' } : {}} />
          {verifying ? 'VERIFICANDO...' : 'YA CONECTÉ MIS REDES — CONFIRMAR'}
        </button>
      )}

      {/* Error */}
      {error && (
        <p style={{ marginTop: '14px', color: '#F87171', fontSize: '13px', fontWeight: 600 }}>
          {error}
        </p>
      )}

      {/* Footer */}
      <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', color: '#3F3F46', fontWeight: 600 }}>COMPATIBLE CON</span>
        {[Instagram, Facebook, Youtube, Sparkles, Building2].map((Icon, i) => (
          <Icon key={i} size={14} color="#3F3F46" />
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .social-connect-root { padding: 24px 16px !important; }
        }
      `}</style>
    </div>
  );
};

export default SocialConnect;
