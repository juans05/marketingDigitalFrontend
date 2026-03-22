import React, { useEffect, useState } from 'react';
import { Film, CheckCircle, Clock, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import AnalyticsPanel from './AnalyticsPanel';

const STATUS_CONFIG = {
  published:    { label: 'Publicado',      icon: <CheckCircle size={12} />,   color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  scheduled:    { label: 'Programado',     icon: <Clock size={12} />,         color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  processing:   { label: 'Procesando',     icon: <Clock size={12} />,         color: '#f2c94c', bg: 'rgba(242,201,76,0.1)' },
  needs_review: { label: 'Revisar',        icon: <AlertTriangle size={12} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  error:        { label: 'Error',          icon: <XCircle size={12} />,       color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

const ScoreBadge = ({ score }) => {
  if (!score) return null;
  const color = score >= 8 ? '#4ade80' : score >= 6 ? '#f2c94c' : '#ef4444';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '4px',
      fontSize: '13px', fontWeight: 'bold', color
    }}>
      <TrendingUp size={14} />
      {score}/10
    </div>
  );
};

const VideoGallery = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('vidalis_user') || '{}');
    const artistId = user.artistId || user.id || 'demo-artist-id';

    fetch(`http://localhost:3001/api/vidalis/gallery/${artistId}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setVideos(data))
      .catch(e => console.error('Gallery error:', e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? videos : videos.filter(v => v.status === filter);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
      Cargando galería...
    </div>
  );

  return (
    <section style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      {/* Header + filtros */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <Film /> Tu Galería Viral
          <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 'normal' }}>
            ({videos.length} {videos.length === 1 ? 'video' : 'videos'})
          </span>
        </h2>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'published', 'scheduled', 'processing', 'needs_review'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: filter === f ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                background: filter === f ? 'rgba(155,81,224,0.15)' : 'transparent',
                color: filter === f ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: filter === f ? '600' : '400'
              }}
            >
              {f === 'all' ? 'Todos' : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de videos */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          {filter === 'all'
            ? 'No hay videos procesados aún. ¡Sube tu primer clip!'
            : `No hay videos con estado "${STATUS_CONFIG[filter]?.label || filter}"`}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filtered.map((video) => {
            const status = STATUS_CONFIG[video.status] || STATUS_CONFIG.processing;
            return (
              <div key={video.id} className="glass-card" style={{ padding: '20px' }}>

                {/* Thumbnail / Preview */}
                <div style={{
                  height: '160px',
                  background: '#111',
                  borderRadius: '12px',
                  marginBottom: '14px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)'
                }}>
                  {video.source_url ? (
                    video.source_url.match(/\.(mp4|mov|webm)$/i) ? (
                      <video
                        src={video.source_url}
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
                    <Film size={40} opacity={0.2} />
                  )}
                </div>

                {/* Título */}
                <h3 style={{
                  fontSize: '15px', fontWeight: '600', marginBottom: '10px',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  {video.title || 'Sin título'}
                </h3>

                {/* Status + Score */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '12px', padding: '4px 10px', borderRadius: '20px',
                    background: status.bg, color: status.color,
                    display: 'flex', alignItems: 'center', gap: '5px'
                  }}>
                    {status.icon} {status.label}
                  </span>
                  <ScoreBadge score={video.viral_score} />
                </div>

                {/* Panel de analytics expandible */}
                <AnalyticsPanel videoId={video.id} initialData={video} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default VideoGallery;
