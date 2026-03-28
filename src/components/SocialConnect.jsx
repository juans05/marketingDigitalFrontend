import { useState, useEffect } from 'react';
import { Link2, CheckCircle, Loader2, ExternalLink, RefreshCw, Instagram, Sparkles, Facebook, Youtube, CheckCircle2, Building2 } from 'lucide-react';

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

  const platforms = [
    { id: 'instagram', label: 'Instagram', color: '#E1306C', bg: '#E1306C', icon: <Instagram size={20} />, description: 'Conectar cuenta profesional' },
    { id: 'tiktok', label: 'Tiktok', color: '#000000', bg: '#111827', icon: <Sparkles size={20} />, description: 'Conectar cuenta personal' },
    { id: 'facebook', label: 'Facebook', color: '#1877F2', bg: '#1877F2', icon: <Facebook size={20} />, description: 'Conectar cuenta de Facebook' },
    { id: 'tiktok_business', label: 'Tiktok Business', color: '#000000', bg: '#111827', icon: <Building2 size={20} />, description: 'Conectar cuenta de empresa' },
    { id: 'youtube', label: 'Youtube', color: '#FF0000', bg: '#FF0000', icon: <Youtube size={20} />, description: 'Conectar canal de YouTube' },
  ];

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
      setPopupOpened(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="social-connect-container animate-fade-in">
      <div className="header-flex">
        <div>
          <h2 className="main-title">Conecta tus redes sociales</h2>
          <p className="main-subtitle">Vincula tu cuenta de Vidalis con tus redes sociales. Puedes modificarlo más adelante.</p>
        </div>
        {popupOpened && (
          <button onClick={handleVerify} disabled={verifying} className="btn-verify-top">
            <RefreshCw size={16} className={verifying ? "animate-spin" : ""} />
            {verifying ? 'VERIFICANDO...' : 'CONFIRMAR CONEXIÓN'}
          </button>
        )}
      </div>

      <div className="platforms-grid">
        {platforms.map(p => {
          const isConnected = connectedPlatforms.includes(p.id);
          return (
            <div key={p.id} className="platform-item">
              <div className="platform-header">
                <span className="platform-name" style={{ color: p.textColor || p.color }}>
                  {p.icon} {p.label}
                </span>
                {isConnected && <CheckCircle2 size={16} color="#22c55e" />}
              </div>
              <button 
                className={`platform-btn ${isConnected ? 'connected' : ''}`}
                style={{ 
                  backgroundColor: isConnected ? '#f3f4f6' : p.bg,
                  color: isConnected ? '#6b7280' : (p.textColor || '#FFF'),
                  border: p.isPremium && !isConnected ? '1px solid #FDE68A' : 'none'
                }}
                disabled={isConnected || loading}
                onClick={handleConnect}
              >
                <span className="btn-text">{isConnected ? 'CUENTA VINCULADA' : p.description}</span>
                {p.isPremium && !isConnected && <Sparkles size={14} className="premium-icon" />}
                {!isConnected && <span className="platform-icon-hover">{p.icon}</span>}
              </button>
            </div>
          );
        })}
      </div>

      <div className="footer-vidalis">
        <p>Vidalis.AI es partner de Google y Meta y está autorizado por:</p>
        <div className="partner-icons">
          <Instagram size={14} />
          <Facebook size={14} />
          <Youtube size={14} />
          <Sparkles size={14} />
          <Building2 size={14} />
        </div>
      </div>

      <style>{`
        .social-connect-container {
          background: #FFF;
          padding: 40px;
          border-radius: 12px;
          color: #111;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          margin-bottom: 40px;
        }
        .header-flex {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }
        .main-title { font-family: var(--font-heading); font-size: 20px; font-weight: 800; margin-bottom: 8px; }
        .main-subtitle { color: #6B7280; font-size: 14px; }
        
        .platforms-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        .platform-item {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .platform-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .platform-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 15px;
        }

        .platform-btn {
          width: 100%;
          min-height: 56px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .platform-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        .platform-btn.connected {
          cursor: default;
          background: #F9FAFB !important;
          border: 1px solid #E5E7EB !important;
        }

        .btn-text { flex-grow: 1; text-align: left; }
        
        .premium-icon { color: #F59E0B; margin-left: 8px; }
        
        .platform-icon-hover { opacity: 0.8; }

        .btn-verify-top {
          background: #111827;
          color: #FFF;
          padding: 10px 20px;
          border-radius: 6px;
          border: none;
          font-weight: 700;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .footer-vidalis {
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid #F3F4F6;
          text-align: center;
        }

        .footer-vidalis p { font-size: 11px; color: #9CA3AF; margin-bottom: 12px; font-weight: 600; }
        
        .partner-icons {
          display: flex;
          justify-content: center;
          gap: 20px;
          color: #9CA3AF;
          opacity: 0.5;
        }

        @media (max-width: 768px) {
          .platforms-grid { grid-template-columns: 1fr; }
          .social-connect-container { padding: 24px; }
          .header-flex { flex-direction: column; gap: 20px; }
        }
      `}</style>
    </div>
  );
};

export default SocialConnect;
