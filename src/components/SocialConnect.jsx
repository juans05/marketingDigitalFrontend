import React, { useState } from 'react';
import { Link2, CheckCircle, Loader2, ExternalLink } from 'lucide-react';

const PLATFORMS = [
  { key: 'tiktok',    label: 'TikTok',    color: '#ff0050' },
  { key: 'instagram', label: 'Instagram', color: '#e1306c' },
  { key: 'youtube',   label: 'YouTube',   color: '#ff0000' },
  { key: 'facebook',  label: 'Facebook',  color: '#1877f2' },
];

const SocialConnect = ({ agencyId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/connect-social/${agencyId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al generar link');

      // Abrir el link de Ayrshare en una nueva pestaña
      window.open(data.url, '_blank', 'width=600,height=700');
      setConnected(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '28px', marginBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link2 size={20} color="var(--primary)" />
            Conectar Redes Sociales
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
            Vincula las cuentas de tu agencia para publicar automáticamente.
          </p>

          {/* Plataformas disponibles */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {PLATFORMS.map(p => (
              <span key={p.key} style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                background: `${p.color}18`,
                color: p.color,
                border: `1px solid ${p.color}30`
              }}>
                {p.label}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <button
            onClick={handleConnect}
            disabled={loading}
            style={{
              background: connected ? 'rgba(74,222,128,0.1)' : 'rgba(155,81,224,0.15)',
              border: `1px solid ${connected ? 'rgba(74,222,128,0.3)' : 'rgba(155,81,224,0.3)'}`,
              borderRadius: '10px',
              padding: '10px 20px',
              color: connected ? '#4ade80' : 'var(--primary)',
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
            ) : connected ? (
              <><CheckCircle size={16} /> Link abierto</>
            ) : (
              <><ExternalLink size={16} /> Conectar cuentas</>
            )}
          </button>

          {connected && (
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>
              Conecta tus redes en la ventana abierta.<br />
              <span
                onClick={handleConnect}
                style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Abrir de nuevo
              </span>
            </p>
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
