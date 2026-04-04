import { useEffect, useState } from 'react';
import { Film, CheckCircle, Clock, AlertTriangle, XCircle, TrendingUp, Sparkles, Filter } from 'lucide-react';
import AnalyticsPanel from './AnalyticsPanel';

const Loader2 = ({ className, style, size = 24 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    className={className} style={style}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

const STATUS_CONFIG = {
  published:    { label: 'Publicado',           icon: <CheckCircle size={12} />,   color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
  scheduled:    { label: 'Programado',          icon: <Clock size={12} />,         color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' },
  processing:   { label: 'Procesando',          icon: <Loader2 size={12} className="animate-spin" />, color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.1)' },
  analyzing:    { label: 'IA Analizando',       icon: <Sparkles size={12} />,     color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)', pulse: true },
  needs_review: { label: 'Revisión',            icon: <AlertTriangle size={12} />, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
  ready:        { label: 'Listo',               icon: <CheckCircle size={12} />,   color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
  error:        { label: 'Error',               icon: <XCircle size={12} />,       color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
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

const AnalysisProgressBar = ({ status, aiCopyShort }) => {
  if (!ANALYZING_STATUSES.includes(status)) return null;
  const step = parseStep(aiCopyShort);
  const percent = step ? (step.current / step.total) * 100 : 25;
  
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
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
    fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/gallery/${artistId}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setVideos(data))
      .catch(e => console.error('Gallery error:', e))
      .finally(() => { if (showLoader) setLoading(false); });
  };

  useEffect(() => {
    fetchGallery(true);
  }, [artistId, refreshKey]);

  useEffect(() => {
    const hasAnalyzing = videos.some(v => ANALYZING_STATUSES.includes(v.status));
    if (!hasAnalyzing) return;
    const interval = setInterval(() => fetchGallery(false), 5000);
    const timeout  = setTimeout(() => clearInterval(interval), 10 * 60 * 1000);
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

        <div className="glass-morph" style={{ display: 'flex', gap: '6px', padding: '6px', borderRadius: '16px' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}>
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
                     <ScoreBadge score={video.viral_score} />
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    <AnalyticsPanel videoId={video.id} initialData={video} activePlatforms={activePlatforms} />
                  </div>
                  {video.status === 'error' && <ErrorDetail errorLog={video.error_log} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default VideoGallery;
