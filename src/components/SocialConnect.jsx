import { useState, useEffect } from 'react';
import { Link2, CheckCircle, Loader2, ExternalLink, RefreshCw } from 'lucide-react';

const PLATFORMS = [
  { key: 'tiktok',    label: 'TikTok',    color: '#ff0050' },
  { key: 'instagram', label: 'Instagram', color: '#e1306c' },
  { key: 'youtube',   label: 'YouTube',   color: '#ff0000' },
  { key: 'facebook',  label: 'Facebook',  color: '#1877f2' },
];

const SocialConnect = ({ artistId }) => {
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
    <div className="glass-card" style={{ padding: '28px', marginBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link2 size={20} color="var(--primary)" />
            Conectar Redes Sociales
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
            Vincula las cuentas de tu agencia para publicar automáticamente.
          </p>

          {/* Plataformas disponibles / conectadas */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {PLATFORMS.map(p => {
              const isConnected = connectedPlatforms.includes(p.key);
              return (
                <span key={p.key} style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: isConnected ? `${p.color}25` : 'rgba(255,255,255,0.05)',
                  color: isConnected ? p.color : 'var(--text-muted)',
                  border: `1px solid ${isConnected ? p.color + '50' : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {isConnected && <CheckCircle size={11} />}
                  {p.label}
                </span>
              );
            })}
          </div>

          {connectedPlatforms.length > 0 && (
            <p style={{ color: '#4ade80', fontSize: '12px', marginTop: '10px' }}>
              ✓ {connectedPlatforms.length} red{connectedPlatforms.length > 1 ? 'es' : ''} conectada{connectedPlatforms.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <button
            onClick={handleConnect}
            disabled={loading}
            style={{
              background: 'rgba(155,81,224,0.15)',
              border: '1px solid rgba(155,81,224,0.3)',
              borderRadius: '10px',
              padding: '10px 20px',
              color: 'var(--primary)',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              opacity: loading ? 0.7 : 1,
              whiteSpace: 'nowrap'
            }}
          >
            {loading ? (
              <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generando link...</>
            ) : (
              <><ExternalLink size={16} /> Conectar cuentas</>
            )}
          </button>

          {popupOpened && (
            <button
              onClick={handleVerify}
              disabled={verifying}
              style={{
                background: 'rgba(74,222,128,0.1)',
                border: '1px solid rgba(74,222,128,0.3)',
                borderRadius: '10px',
                padding: '8px 16px',
                color: '#4ade80',
                cursor: verifying ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '600',
                opacity: verifying ? 0.7 : 1,
                whiteSpace: 'nowrap'
              }}
            >
              <RefreshCw size={14} style={verifying ? { animation: 'spin 1s linear infinite' } : {}} />
              {verifying ? 'Verificando...' : 'Verificar conexión'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          marginTop: '12px', padding: '10px 14px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '8px', color: '#ef4444', fontSize: '13px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default SocialConnect;
