import { useEffect, useState } from 'react';
import { Film, CheckCircle, Clock, AlertTriangle, XCircle, TrendingUp, Sparkles, Filter, RefreshCw } from 'lucide-react';
import AnalyticsPanel from './AnalyticsPanel';

const Loader2 = ({ className, style, size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className} style={style}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const STATUS_CONFIG = {
  published: { label: 'Enviando... (5-10m)', icon: <CheckCircle size={12} />, color: '#22c55e', bg: '#ecfdf5' },
  scheduled: { label: 'Programado', icon: <Clock size={12} />, color: '#2C33D8', bg: '#eff6ff' },
  processing: { label: 'Procesando', icon: <Loader2 size={12} className="animate-spin" />, color: '#6B7280', bg: '#f9fafb' },
  analyzing: { label: 'Estrategia IA', icon: <Sparkles size={12} />, color: '#7c3aed', bg: '#f5f3ff', pulse: true },
  needs_review: { label: 'Pendiente de Enviar', icon: <AlertTriangle size={12} />, color: '#d97706', bg: '#fffbeb' },
  ready: { label: 'Listo para publicar', icon: <CheckCircle size={12} />, color: '#22c55e', bg: '#ecfdf5' },
  error: { label: 'Fallo Crítico', icon: <XCircle size={12} />, color: '#ef4444', bg: '#fef2f2' },
  canceled: { label: 'Cancelado', icon: <XCircle size={12} />, color: '#6B7280', bg: '#F3F4F6' },
};

const ScoreBadge = ({ score }) => {
  if (!score) return null;
  const color = score >= 8 ? '#10B981' : score >= 6 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      fontSize: '14px', fontWeight: '800', color,
      fontFamily: 'var(--font-heading)'
    }}>
      <TrendingUp size={14} />
      {score}/10
    </div>
  );
};

const ANALYZING_STATUSES = ['analyzing', 'processing'];

const parseStep = (text) => {
  if (!text) return null;
  const match = text.match(/\[Paso (\d+)\/(\d+)\]/);
  if (match) return { current: parseInt(match[1]), total: parseInt(match[2]), message: text.replace(/\[Paso \d+\/\d+\]\s*/, '') };
  return null;
};

const AnalysisProgressBar = ({ video, onCancel }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!ANALYZING_STATUSES.includes(video?.status)) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [video?.status]);

  if (!ANALYZING_STATUSES.includes(video?.status)) return null;

  const rawText = video?.ai_copy_short || '';
  let percent = 0;
  let text = 'Preparando...';

  const step = parseStep(rawText);
  if (step) {
    percent = (step.current / step.total) * 100;
    text = `Paso ${step.current}/4: ${step.message}`;
  } else if (!rawText) {
    // Fallback simulado por tiempo (al igual que el navbar)
    const createdDate = new Date(video.created_at).getTime();
    const elapsedSeconds = (now - createdDate) / 1000;

    if (elapsedSeconds < 15) {
      percent = 25;
      text = 'Paso 1/4: Transcripción...';
    } else if (elapsedSeconds < 30) {
      percent = 50;
      text = 'Paso 2/4: Entendimiento...';
    } else if (elapsedSeconds < 45) {
      percent = 75;
      text = 'Paso 3/4: Creación de datos...';
    } else {
      percent = 90;
      text = 'Paso 4/4: Envío / Guardando...';
    }
  } else {
    percent = 95;
    text = rawText;
  }

  return (
    <div style={{ marginTop: '12px', background: '#F9FAFB', border: '1px solid var(--border-main)', padding: '12px', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} color="#7c3aed" />
          <span style={{ fontSize: '10px', fontWeight: '800', color: '#7c3aed', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {text}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#6B7280' }}>
            {Math.round(percent)}%
          </span>
          <button
            onClick={() => onCancel(video.id)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444',
              display: 'flex', alignItems: 'center', padding: '2px', borderRadius: '4px'
            }}
            title="Cancelar procesamiento"
          >
            <XCircle size={14} />
          </button>
        </div>
      </div>
      {/* Barra de progreso real */}
      <div style={{ height: '6px', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '100px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${percent}%`,
          background: 'linear-gradient(90deg, var(--primary), var(--accent))',
          transition: 'width 0.8s ease-in-out',
        }} />
      </div>
    </div>
  );
};

const ErrorDetail = ({ errorLog }) => {
  if (!errorLog) return null;
  let parsed;
  try { parsed = JSON.parse(errorLog); } catch { parsed = { message: errorLog }; }
  return (
    <div style={{
      marginTop: '12px', padding: '12px',
      background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)',
      borderRadius: '12px', color: '#EF4444', fontSize: '11px', fontWeight: '600'
    }}>
      ❌ {parsed.message}
    </div>
  );
};

const VideoGallery = ({ artistId, artistName, refreshKey, activePlatforms = [] }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchGallery = (showLoader = false) => {
    if (!artistId) { setLoading(false); return; }
    if (showLoader) setLoading(true);
    
    const user = JSON.parse(localStorage.getItem('vidalis_user'));
    
    fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/gallery/${artistId}`, {
      headers: {
        'Authorization': `Bearer ${user?.token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setVideos(data))
      .catch(e => console.error('Gallery error:', e))
      .finally(() => { if (showLoader) setLoading(false); });
  };

  const handleCancelVideo = async (videoId) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar de inmediato el procesamiento de este análisis?")) return;
    const user = JSON.parse(localStorage.getItem('vidalis_user'));
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/video/${videoId}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ status: 'canceled', error_log: '{"message":"Cancelado manualmente por el usuario"}' })
      });
      if (res.ok) fetchGallery(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRetryVideo = async (videoId) => {
    // Si la lista tiene videos en progreso, no reintentes si quieres hacer UI state, pero es opcional.
    const user = JSON.parse(localStorage.getItem('vidalis_user'));
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/video/${videoId}/retry`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json' 
        }
      });
      if (res.ok) fetchGallery(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial / cambio de artista
  useEffect(() => {
    fetchGallery(true);
  }, [artistId, refreshKey]);

  useEffect(() => {
    const hasAnalyzing = videos.some(v => ANALYZING_STATUSES.includes(v.status));
    if (!hasAnalyzing) return;
    const interval = setInterval(() => fetchGallery(false), 5000);
    const timeout = setTimeout(() => clearInterval(interval), 10 * 60 * 1000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [videos, artistId]);

  const filtered = filter === 'all' ? videos : videos.filter(v => v.status === filter);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px 40px', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--border-main)' }}>
      <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 16px', color: 'var(--primary)' }} />
      <p style={{ fontWeight: '700', letterSpacing: '0.1em', fontSize: '12px', color: 'var(--text-muted)' }}>SINCRONIZANDO BIBLIOTECA...</p>
    </div>
  );

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: '16px', border: '1px solid var(--border-main)' }}>
            <Film size={28} color="var(--primary)" />
          </div>
          <div>
            <h2 className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '4px' }}>Catálogo Viral</h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-dim)', fontWeight: '600' }}>
              <span className="accent-text">{filtered.length} piezas</span> activas en tu biblioteca.
            </p>
          </div>
        </div>

        <div className="card-pro filter-pills-bar" style={{ display: 'flex', gap: '4px', padding: '6px', borderRadius: '100px', border: '1px solid var(--border-main)' }}>
          {['all', 'published', 'needs_review', 'analyzing'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '10px 24px',
                borderRadius: '12px',
                border: 'none',
                background: filter === f ? 'var(--primary)' : 'transparent',
                color: filter === f ? 'white' : 'var(--text-dim)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '800',
                transition: 'all 0.3s ease'
              }}
            >
              {f === 'all' ? 'Ver Todo' : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card-pro" style={{ padding: '80px 40px', textAlign: 'center', border: '1px dashed var(--border-main)', background: 'transparent' }}>
          <Filter size={48} style={{ opacity: 0.1, marginBottom: '24px', color: 'var(--text-main)' }} />
          <h3 style={{ fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Sin resultados</h3>
          <p style={{ color: 'var(--text-dim)' }}>Inicia tu legado subiendo tu primer contenido vertical.</p>
        </div>
      ) : (
        <div className="video-grid-pro" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filtered.map((video) => {
            const status = STATUS_CONFIG[video.status] || STATUS_CONFIG.processing;
            return (
              <div key={video.id} className="card-pro animate-fade-in" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '400px', background: 'var(--bg-tertiary)', position: 'relative', overflow: 'hidden' }}>
                  {video.source_url ? (
                    (video.processed_url || video.source_url).match(/\.(mp4|mov|webm)$/i) ? (
                      <video
                        src={video.processed_url || video.source_url}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        muted loop
                        onMouseOver={e => e.target.play()}
                        onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
                      />
                    ) : (
                      <img src={video.source_url} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )
                  ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', opacity: 0.1 }}>
                      <Film size={48} color="var(--text-main)" />
                    </div>
                  )}

                  <div className="glass-morph" style={{
                    position: 'absolute', top: '16px', right: '16px',
                    padding: '8px 14px', borderRadius: '12px',
                    color: status.color, fontSize: '11px', fontWeight: '900',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    {status.icon} {status.label}
                  </div>
                  <AnalysisProgressBar status={video.status} aiCopyShort={video.ai_copy_short} />
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '900', marginBottom: '8px', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {video.title || 'Inyección Viral'}
                  </h3>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '12px', fontWeight: '600' }}>
                      <Clock size={14} />
                      {new Date(video.created_at).toLocaleDateString()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Viral IA</span>
                      <ScoreBadge score={video.viral_score} />
                    </div>
                  </div>

                  {/* IA Progress Component (Subtle) */}
                  <div style={{ marginBottom: '20px' }}>
                    <AnalysisProgressBar video={video} onCancel={handleCancelVideo} />
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    <AnalyticsPanel videoId={video.id} initialData={video} activePlatforms={activePlatforms} />
                  </div>
                  {video.status === 'error' && <ErrorDetail errorLog={video.error_log} />}
                </div>

                {/* Error detail */}
                {video.status === 'error' && (
                  <div style={{ padding: '0 24px', paddingBottom: '12px' }}>
                    <ErrorDetail errorLog={video.error_log} />
                  </div>
                )}

                {/* Retry Button */}
                {['error', 'canceled'].includes(video.status) && (
                  <div style={{ padding: '0 24px 24px 24px' }}>
                    <button
                      onClick={() => handleRetryVideo(video.id)}
                      style={{
                        width: '100%', padding: '12px',
                        background: '#e0e7ff', color: '#4338ca',
                        border: '1px solid #c7d2fe', borderRadius: '8px',
                        fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em',
                        cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#c7d2fe'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = '#e0e7ff'; }}
                    >
                      <RefreshCw size={14} /> Reintentar Motor IA
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .video-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        @keyframes scanBar {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .video-grid-pro {
            grid-template-columns: 1fr !important;
          }
          .filter-pills-bar {
            flex-wrap: wrap !important;
            border-radius: 16px !important;
            justify-content: center !important;
          }
          .filter-pills-bar button {
            flex: 1 1 auto;
          }
        }
      `}</style>
    </section>
  );
};

export default VideoGallery;
