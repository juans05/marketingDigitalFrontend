import { useState, useEffect } from 'react';
import { Link2, CheckCircle, Loader2, ExternalLink, RefreshCw } from 'lucide-react';

const PLATFORMS = [
  { key: 'tiktok',    label: 'TikTok',    color: '#666' },
  { key: 'instagram', label: 'Instagram', color: '#666' },
  { key: 'youtube',   label: 'YouTube',   color: '#666' },
  { key: 'facebook',  label: 'Facebook',  color: '#666' },
];

const SocialConnect = ({ artistId, artistName }) => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [popupOpened, setPopupOpened] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);

  useEffect(() => {
    if (artistId) fetchStatus();
  }, [artistId]);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/social-status/${artistId}`);
      if (res.ok) {
        const data = await res.json();
        setConnectedPlatforms(data.platforms || []);
      }
    } catch {}
  };

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/connect-social/${artistId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al generar link');
      window.open(data.url, '_blank', 'width=600,height=700');
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/social-status/${artistId}?refresh=true`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al verificar');
      setConnectedPlatforms(data.platforms || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px', background: '#0A0A0A', border: '2px solid var(--border-glass)', borderRadius: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <div style={{ border: '2px solid var(--border-glass)', padding: '6px', borderRadius: '4px' }}>
              <Link2 size={16} color="white" />
            </div>
            Canales de Distribución {artistName && <span style={{ color: '#666', marginLeft: '8px' }}>[{artistName}]</span>}
          </h3>
          <p style={{ color: '#6B7280', fontSize: '12px', fontWeight: '600', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Sincronización de activos para despliegue multiplataforma.
          </p>

          {/* Plataformas disponibles / conectadas */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {PLATFORMS.map(p => {
              const isConnected = connectedPlatforms.includes(p.key);
              return (
                <span key={p.key} style={{
                  padding: '6px 16px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '800',
                  background: isConnected ? '#FFF' : '#000',
                  color: isConnected ? '#000' : '#6B7280',
                  border: isConnected ? '2px solid #FFF' : '2px solid var(--border-glass)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {isConnected && <CheckCircle size={10} />}
                  {p.label}
                </span>
              );
            })}
          </div>

          {connectedPlatforms.length > 0 && (
            <p style={{ color: '#FFF', fontSize: '10px', fontWeight: '800', marginTop: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              • {connectedPlatforms.length} {connectedPlatforms.length > 1 ? 'CANALES ACTIVOS' : 'CANAL ACTIVO'}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="btn-action"
            style={{
              padding: '12px 24px',
              fontSize: '10px',
              width: '240px'
            }}
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> GENERANDO ENLACE...</>
            ) : (
              <><ExternalLink size={14} /> VINCULAR CUENTAS</>
            )}
          </button>

          {popupOpened && (
            <button
              onClick={handleVerify}
              disabled={verifying}
              style={{
                background: '#000',
                border: '2px solid var(--border-glass)',
                borderRadius: '4px',
                padding: '12px 24px',
                color: '#FFF',
                cursor: verifying ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '10px',
                fontWeight: '800',
                opacity: verifying ? 0.7 : 1,
                width: '240px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              <RefreshCw size={14} className={verifying ? "animate-spin" : ""} />
              {verifying ? 'VERIFICANDO...' : 'CONFIRMAR CONEXIÓN'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          marginTop: '24px', padding: '16px',
          background: '#200', border: '1px solid #411',
          borderRadius: '4px', color: '#ef4444', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase'
        }}>
          ERROR DE SISTEMA: {error}
        </div>
      )}
    </div>
  );
};

export default SocialConnect;
