import React, { useState, useEffect } from 'react';
import { Eye, Heart, Share2, MessageCircle, TrendingUp, Calendar, Copy, ChevronDown, ChevronUp, Loader } from 'lucide-react';

const PLATFORM_CONFIG = {
  tiktok:    { label: 'TikTok',    color: '#ff0050', bg: 'rgba(255,0,80,0.1)' },
  instagram: { label: 'Instagram', color: '#e1306c', bg: 'rgba(225,48,108,0.1)' },
  youtube:   { label: 'YouTube',   color: '#ff0000', bg: 'rgba(255,0,0,0.1)' },
  facebook:  { label: 'Facebook',  color: '#1877f2', bg: 'rgba(24,119,242,0.1)' },
  twitter:   { label: 'Twitter/X', color: '#1da1f2', bg: 'rgba(29,161,242,0.1)' },
};

// Parsea la respuesta de analytics de Ayrshare (estructura flexible)
const parseAnalytics = (raw) => {
  if (!raw) return null;
  // Ayrshare devuelve analytics en diferentes estructuras según la versión
  if (raw.analytics && Array.isArray(raw.analytics)) {
    return raw.analytics.reduce((acc, item) => {
      acc[item.platform] = item.results || item.analytics || {};
      return acc;
    }, {});
  }
  // Si ya viene como objeto plano por plataforma
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return raw;
  }
  return null;
};

const StatBadge = ({ icon, value, label, color }) => (
  <div style={{ textAlign: 'center', flex: 1 }}>
    <div style={{ color, marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
    <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
      {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value ?? '—'}
    </div>
    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</div>
  </div>
);

const PlatformRow = ({ platform, data }) => {
  const config = PLATFORM_CONFIG[platform] || { label: platform, color: '#9b51e0', bg: 'rgba(155,81,224,0.1)' };
  return (
    <div style={{
      background: config.bg,
      border: `1px solid ${config.color}30`,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '10px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontWeight: '600', color: config.color, fontSize: '14px' }}>{config.label}</span>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <StatBadge icon={<Eye size={14} />}        value={data?.views ?? data?.impressions ?? data?.reach}          label="Views"    color="#9b51e0" />
        <StatBadge icon={<Heart size={14} />}       value={data?.likes ?? data?.hearts}                              label="Likes"    color="#e1306c" />
        <StatBadge icon={<Share2 size={14} />}      value={data?.shares ?? data?.reposts ?? data?.retweets}          label="Shares"   color="#10b981" />
        <StatBadge icon={<MessageCircle size={14} />} value={data?.comments ?? data?.replies}                        label="Comentarios" color="#f59e0b" />
      </div>
    </div>
  );
};

const AnalyticsPanel = ({ videoId, initialData }) => {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(false);
  const [copyCopied, setCopyCopied] = useState(false);

  const fetchAnalytics = async () => {
    if (data?.analytics_4h !== undefined) return; // ya tenemos datos completos
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/analytics/${videoId}`);
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error('Error cargando analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = () => {
    if (!expanded) fetchAnalytics();
    setExpanded(v => !v);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopyCopied(true);
    setTimeout(() => setCopyCopied(false), 2000);
  };

  const analytics = parseAnalytics(data?.analytics_4h);

  return (
    <div>
      {/* Botón expandir */}
      <button
        onClick={handleExpand}
        style={{
          width: '100%',
          marginTop: '12px',
          background: 'rgba(155,81,224,0.1)',
          border: '1px solid rgba(155,81,224,0.25)',
          borderRadius: '8px',
          padding: '8px 14px',
          color: 'var(--primary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px',
          fontWeight: '600'
        }}
      >
        <span>Ver Analytics</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Panel expandido */}
      {expanded && (
        <div style={{ marginTop: '12px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
              <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <>
              {/* Metadata del post */}
              {(data?.published_at || data?.scheduled_for) && (
                <div style={{
                  display: 'flex', gap: '16px', marginBottom: '12px',
                  fontSize: '12px', color: 'var(--text-muted)'
                }}>
                  {data.published_at && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      Publicado: {new Date(data.published_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {data.viral_score && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
                      <TrendingUp size={12} />
                      Viral Score: {data.viral_score}/10
                    </span>
                  )}
                </div>
              )}

              {/* Analytics por plataforma */}
              {analytics ? (
                Object.entries(analytics).map(([platform, pData]) => (
                  <PlatformRow key={platform} platform={platform} data={pData} />
                ))
              ) : (
                <div style={{
                  padding: '16px', textAlign: 'center',
                  color: 'var(--text-muted)', fontSize: '13px',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '10px'
                }}>
                  Analytics disponibles 4h después de publicar
                </div>
              )}

              {/* Copy generado por IA */}
              {data?.ai_copy_short && (
                <div style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '12px',
                  marginTop: '8px'
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      Copy IA — TikTok / Instagram
                    </span>
                    <button
                      onClick={() => copyToClipboard(data.ai_copy_short)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: copyCopied ? '#10b981' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px'
                      }}
                    >
                      <Copy size={12} /> {copyCopied ? '¡Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  <p style={{ fontSize: '13px', color: 'white', margin: 0, lineHeight: '1.5' }}>
                    {data.ai_copy_short}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsPanel;
