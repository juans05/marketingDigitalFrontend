import React, { useState, useEffect } from 'react';
import { Eye, Heart, Share2, MessageCircle, TrendingUp, Calendar, Copy, ChevronDown, ChevronUp, Loader, CheckCircle, Clock } from 'lucide-react';

const PLATFORM_CONFIG = {
  tiktok:    { label: 'TikTok',    color: '#ff0050', bg: 'rgba(255,0,80,0.1)' },
  instagram: { label: 'Instagram', color: '#e1306c', bg: 'rgba(225,48,108,0.1)' },
  youtube:   { label: 'YouTube',   color: '#ff0000', bg: 'rgba(255,0,0,0.1)' },
  facebook:  { label: 'Facebook',  color: '#1877f2', bg: 'rgba(24,119,242,0.1)' },
  twitter:   { label: 'Twitter/X', color: '#1da1f2', bg: 'rgba(29,161,242,0.1)' },
};

// Parsea la respuesta de analytics de Ayrshare
const parseAnalytics = (raw) => {
  if (!raw) return null;
  if (raw.analytics && Array.isArray(raw.analytics)) {
    return raw.analytics.reduce((acc, item) => {
      acc[item.platform] = item.results || item.analytics || {};
      return acc;
    }, {});
  }
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
        <StatBadge icon={<Eye size={14} />}        value={data?.views ?? data?.impressions ?? data?.reach}       label="Views"    color="#9b51e0" />
        <StatBadge icon={<Heart size={14} />}       value={data?.likes ?? data?.hearts}                           label="Likes"    color="#e1306c" />
        <StatBadge icon={<Share2 size={14} />}      value={data?.shares ?? data?.reposts ?? data?.retweets}       label="Shares"   color="#10b981" />
        <StatBadge icon={<MessageCircle size={14} />} value={data?.comments ?? data?.replies}                     label="Comentarios" color="#f59e0b" />
      </div>
    </div>
  );
};

const AnalyticsPanel = ({ videoId, initialData }) => {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [copyCopied, setCopyCopied] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(data?.scheduled_at ? new Date(data.scheduled_at).toISOString().slice(0, 16) : '');
  const [hashtags, setHashtags] = useState(data?.hashtags || '');
  const [selectedPlatforms, setSelectedPlatforms] = useState(data?.platforms || ['tiktok', 'instagram', 'youtube']);

  const togglePlatform = (p) => {
    setSelectedPlatforms(prev => 
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const fetchAnalytics = async () => {
    if (data?.analytics_4h !== undefined) return;
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

  const handleSaveSettings = async () => {
    setSaveLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/video/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduled_at: scheduledDate || null,
          hashtags: hashtags,
          platforms: selectedPlatforms,
          status: scheduledDate ? 'scheduled' : data.status
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setData(updated);
        alert("¡Ajustes guardados correctamente!");
      }
    } catch (e) {
      console.error('Error guardando ajustes:', e);
    } finally {
      setSaveLoading(false);
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
        <span>Detalles y Programación</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div style={{ marginTop: '12px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
              <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <>
              {/* Programación y Hashtags */}
              <div style={{ 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: '12px', 
                padding: '16px', 
                marginBottom: '10px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                    <Calendar size={10} /> Programar Publicación
                  </label>
                  <input 
                    type="datetime-local" 
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#111',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: 'white',
                      padding: '8px',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Publicar en:
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {Object.entries(PLATFORM_CONFIG).map(([id, config]) => {
                      const isActive = selectedPlatforms.includes(id);
                      return (
                        <button
                          key={id}
                          onClick={() => togglePlatform(id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '15px',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: isActive ? config.color : 'rgba(255,255,255,0.1)',
                            background: isActive ? config.bg : 'transparent',
                            color: isActive ? config.color : 'var(--text-muted)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                    Hashtags Sugeridos / Propios
                  </label>
                  <textarea 
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="#viral #musica #reel..."
                    style={{
                      width: '100%',
                      background: '#111',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: 'white',
                      padding: '8px',
                      fontSize: '13px',
                      height: '60px',
                      resize: 'none'
                    }}
                  />
                </div>

                <button 
                  onClick={handleSaveSettings}
                  disabled={saveLoading}
                  style={{
                    width: '100%',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    opacity: saveLoading ? 0.7 : 1
                  }}
                >
                  {saveLoading ? 'Guardando...' : 'Guardar Ajustes'}
                </button>
              </div>

              {/* Metadata */}
              {(data?.published_at || data?.scheduled_at) && (
                <div style={{
                  display: 'flex', gap: '16px', marginBottom: '12px',
                  fontSize: '11px', color: 'var(--text-muted)'
                }}>
                  {data.published_at && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={10} color="#4ade80" />
                      Publicado: {new Date(data.published_at).toLocaleDateString()}
                    </span>
                  )}
                  {data.scheduled_at && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#60a5fa' }}>
                      <Clock size={10} />
                      Prog: {new Date(data.scheduled_at).toLocaleDateString()} {new Date(data.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  )}
                </div>
              )}

              {/* Analytics */}
              {analytics ? (
                Object.entries(analytics).map(([platform, pData]) => (
                  <PlatformRow key={platform} platform={platform} data={pData} />
                ))
              ) : (
                <div style={{
                  padding: '16px', textAlign: 'center',
                  color: 'var(--text-muted)', fontSize: '12px',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '10px'
                }}>
                  {data?.status === 'published' ? 'Analytics disponibles 4h después' : 'Disponible al publicar'}
                </div>
              )}

              {/* Copy IA */}
              {data?.ai_copy_short && (
                <div style={{
                  background: 'rgba(155,81,224,0.05)',
                  border: '1px solid rgba(155,81,224,0.15)',
                  borderRadius: '10px',
                  padding: '12px',
                  marginTop: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold' }}>COPY IA SUGERIDO</span>
                    <button
                      onClick={() => copyToClipboard(data.ai_copy_short)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: copyCopied ? '#10b981' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                    >
                      <Copy size={12} /> {copyCopied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <p style={{ fontSize: '12px', color: 'white', margin: 0, lineHeight: '1.4' }}>{data.ai_copy_short}</p>
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
