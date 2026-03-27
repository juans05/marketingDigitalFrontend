import { useEffect, useState } from 'react';
import { Film, CheckCircle, Clock, AlertTriangle, XCircle, TrendingUp, Sparkles, Filter } from 'lucide-react';
import AnalyticsPanel from './AnalyticsPanel';

const STATUS_CONFIG = {
  published:    { label: 'Publicado',           icon: <CheckCircle size={12} />,   color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  scheduled:    { label: 'Programado',          icon: <Clock size={12} />,         color: '#6B7280', bg: 'rgba(255,255,255,0.02)' },
  processing:   { label: 'Procesando',          icon: <Clock size={12} />,         color: '#FFFFFF', bg: 'rgba(255,255,255,0.05)' },
  analyzing:    { label: 'Estrategia IA',      icon: <Sparkles size={12} />,     color: '#FFFFFF', bg: 'rgba(255,255,255,0.08)', pulse: true },
  needs_review: { label: 'Review de Autoridad', icon: <AlertTriangle size={12} />, color: '#FFFFFF', bg: 'rgba(255,255,255,0.05)' },
  ready:        { label: 'Listo para publicar',  icon: <CheckCircle size={12} />,   color: '#22c55e', bg: 'rgba(34,197,94,0.05)' },
  error:        { label: 'Fallo Crítico',       icon: <XCircle size={12} />,       color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

const ScoreBadge = ({ score }) => {
  if (!score) return null;
  const color = score >= 8 ? '#22c55e' : score >= 6 ? 'var(--accent-gold)' : '#ef4444';
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

/** Extrae el paso actual (ej: 2) del string "[Paso 2/4] ..." */
const parseStep = (text) => {
  if (!text) return null;
  const match = text.match(/\[Paso (\d+)\/(\d+)\]/);
  if (match) return { current: parseInt(match[1]), total: parseInt(match[2]), message: text.replace(/\[Paso \d+\/\d+\]\s*/, '') };
  return null;
};

const AnalysisProgressBar = ({ status, aiCopyShort }) => {
  if (!ANALYZING_STATUSES.includes(status)) return null;
  const step = parseStep(aiCopyShort);
  const percent = step ? (step.current / step.total) * 100 : 25;
  
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
      {/* Step label */}
      {step && (
        <div style={{
          position: 'absolute', bottom: '8px', left: '8px', right: '8px',
          fontSize: '9px', fontWeight: '800', color: '#FFF',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          zIndex: 2
        }}>
          {step.message}
        </div>
      )}
      {/* Progress bar */}
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${percent}%`,
          background: 'linear-gradient(90deg, #6366f1, #a855f7)',
          transition: 'width 0.8s ease-in-out',
        }} />
      </div>
    </div>
  );
};

/** Muestra el detalle del error cuando el status es 'error' */
const ErrorDetail = ({ errorLog }) => {
  if (!errorLog) return null;
  let parsed;
  try { parsed = JSON.parse(errorLog); } catch { parsed = { message: errorLog }; }
  return (
    <div style={{
      marginTop: '12px', padding: '10px',
      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
      borderRadius: '8px', color: '#ef4444', fontSize: '10px', fontWeight: '700',
      wordBreak: 'break-word'
    }}>
      ❌ {parsed.message}
      {parsed.timestamp && (
        <div style={{ marginTop: '4px', fontSize: '9px', color: '#999' }}>
          {new Date(parsed.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
};

const VideoGallery = ({ artistId, artistName, refreshKey }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchGallery = (showLoader = false) => {
    if (!artistId) { setLoading(false); return; }
    if (showLoader) setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/gallery/${artistId}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setVideos(data))
      .catch(e => console.error('Gallery error:', e))
      .finally(() => { if (showLoader) setLoading(false); });
  };

  // Carga inicial / cambio de artista
  useEffect(() => {
    fetchGallery(true);
  }, [artistId, refreshKey]);

  // Auto-polling mientras haya videos analizando (máx 10 min)
  useEffect(() => {
    const hasAnalyzing = videos.some(v => ANALYZING_STATUSES.includes(v.status));
    if (!hasAnalyzing) return;
    const interval = setInterval(() => fetchGallery(false), 5000);
    const timeout  = setTimeout(() => clearInterval(interval), 10 * 60 * 1000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [videos, artistId]);

  const filtered = filter === 'all' ? videos : videos.filter(v => v.status === filter);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px 40px', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
      <Loader2 className="animate-spin" style={{ margin: '0 auto 16px', color: 'var(--primary-neon)' }} />
      <p style={{ fontWeight: '600', letterSpacing: '0.05em' }}>SINCRONIZANDO BIBLIOTECA...</p>
    </div>
  );

  return (
    <section>
      {/* Header + filtros */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }}>
            <Film size={24} className="text-dim" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Catálogo Vital
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '600' }}>
              Mostrando {filtered.length} de {videos.length} piezas de impacto.
            </p>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', gap: '4px', padding: '6px', borderRadius: '100px' }}>
          {['all', 'published', 'needs_review', 'analyzing'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 20px',
                borderRadius: '100px',
                border: 'none',
                background: filter === f ? 'var(--grad-premium)' : 'transparent',
                color: filter === f ? 'white' : 'var(--text-dim)',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'all 0.3s ease'
              }}
            >
              {f === 'all' ? 'Ver Todo' : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de videos */}
      {filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '100px 40px', textAlign: 'center' }}>
          <Filter size={48} style={{ opacity: 0.1, marginBottom: '24px' }} />
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'white', marginBottom: '8px' }}>Sin resultados dinámicos</h3>
          <p style={{ color: 'var(--text-dim)' }}>
            {filter === 'all'
              ? 'Inicia tu legado subiendo tu primer contenido vertical.'
              : `No se encontraron piezas con el estatus "${STATUS_CONFIG[filter]?.label || filter}"`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filtered.map((video) => {
            const status = STATUS_CONFIG[video.status] || STATUS_CONFIG.processing;
            return (
              <div key={video.id} className="glass-panel video-card" style={{ padding: '24px', transition: 'all 0.4s ease' }}>

                {/* Thumbnail / Preview */}
                <div style={{
                  height: '180px',
                  background: '#0a0a0b',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '2px solid var(--border-glass)'
                }}>
                  {video.source_url ? (
                    (video.processed_url || video.source_url).match(/\.(mp4|mov|webm)$/i) ? (
                      <video
                        src={video.processed_url || video.source_url}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        muted
                        onMouseOver={e => e.target.play()}
                        onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
                      />
                    ) : (
                      <img
                        src={video.source_url}
                        alt={video.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', opacity: 0.2 }}>
                      <Film size={40} />
                      <span style={{ fontSize: '10px', fontWeight: '800' }}>Cargando Media...</span>
                    </div>
                  )}
                  
                  {/* Barra de progreso de análisis IA */}
                  <AnalysisProgressBar status={video.status} aiCopyShort={video.ai_copy_short} />

                  {/* Status Overlay for Quick View */}
                  <div style={{
                    position: 'absolute',
                    top: '12px', right: '12px',
                    padding: '6px 12px',
                    borderRadius: '100px',
                    background: status.bg,
                    color: status.color,
                    fontSize: '10px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backdropFilter: 'blur(8px)',
                    border: `2px solid ${status.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {status.icon}
                    {status.label}
                  </div>
                </div>

                {/* Info Area */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{
                    fontSize: '1rem', fontWeight: '800', marginBottom: '8px',
                    fontFamily: 'var(--font-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    color: 'white'
                  }}>
                    {video.title || 'Producción Sin Nombre'}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '600' }}>
                        Viral Score IA
                     </p>
                     <ScoreBadge score={video.viral_score} />
                  </div>
                </div>

                {/* Error detail */}
                {video.status === 'error' && <ErrorDetail errorLog={video.error_log} />}

                {/* Detail Integration */}
                <AnalyticsPanel videoId={video.id} initialData={video} />
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .video-card:hover {
          transform: translateY(-8px);
          border-color: #444;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        @keyframes scanBar {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </section>
  );
};

const Loader2 = ({ className, style }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    className={className} style={style}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

export default VideoGallery;
