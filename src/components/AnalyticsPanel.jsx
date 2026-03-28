import { useState, useEffect, useRef } from 'react';
import { Eye, Heart, Share2, Calendar, Copy, ChevronDown, ChevronUp, Loader, CheckCircle, TrendingUp, Rocket, BrainCircuit } from 'lucide-react';

const PLATFORM_CONFIG = {
  tiktok: { label: 'TikTok', color: '#FFF', bg: '#111' },
  instagram: { label: 'Instagram', color: '#FFF', bg: '#111' },
  youtube: { label: 'YouTube', color: '#FFF', bg: '#111' },
  facebook: { label: 'Facebook', color: '#FFF', bg: '#111' },
  twitter: { label: 'Twitter/X', color: '#FFF', bg: '#111' },
};

const BEST_TIMES = {
  tiktok: { tip: 'Engagement nocturno y fines de semana', slots: [{ label: 'Mar / Jue / Vie', times: ['21:00', '23:00'] }, { label: 'Sábado', times: ['14:00', '19:00'] }] },
  instagram: { tip: 'Picos en almuerzo y prime-time 21h', slots: [{ label: 'Lun / Mié', times: ['13:00', '21:00'] }, { label: 'Dom', times: ['20:00'] }] },
  youtube: { tip: 'Mayor consumo en horas de ocio tarde/noche', slots: [{ label: 'Vie / Sáb', times: ['15:00', '20:00'] }] },
};

const viralColor = (score) => {
  if (!score) return '#6B7280';
  if (score >= 8) return '#FFF';
  if (score >= 6) return '#9CA3AF';
  return '#444';
};

const StatBadge = ({ icon, value, label, color }) => (
  <div style={{ textAlign: 'center', flex: 1, padding: '16px 12px', background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '4px' }}>
    <div style={{ color: '#FFF', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
    <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'white', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
      {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value ?? '0'}
    </div>
    <div style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>{label}</div>
  </div>
);

const PlatformRow = ({ platform, data }) => {
  const cfg = PLATFORM_CONFIG[platform] || { label: platform, color: '#FFF', bg: '#111' };
  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px', border: '1px solid #222', background: '#050505', borderRadius: '4px' }}>
      <div style={{ fontWeight: '700', color: '#FFF', fontSize: '12px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cfg.label}</div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <StatBadge icon={<Eye size={16} />} value={data?.views ?? data?.impressions ?? data?.reach} label="Impacto" />
        <StatBadge icon={<Heart size={16} />} value={data?.likes ?? data?.hearts} label="Fans" />
        <StatBadge icon={<Share2 size={16} />} value={data?.shares ?? data?.reposts} label="Viral" />
      </div>
    </div>
  );
};

const EditableCopyBlock = ({ label, value, onChange, isReadOnly }) => {
  const [copied, setCopied] = useState(false);
  const handle = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', color: '#FFF', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <button onClick={handle} style={{ background: '#111', border: '1px solid #333', borderRadius: '4px', padding: '6px 14px', cursor: 'pointer', color: copied ? '#FFF' : '#9CA3AF', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '700' }}>
          <Copy size={12} /> {copied ? 'COPIADO' : 'COPIAR'}
        </button>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={isReadOnly}
        style={{ 
          width: '100%', background: '#000', border: '1px solid #222', 
          borderRadius: '4px', color: 'white', padding: '16px', fontSize: '13px', 
          lineHeight: '1.7', height: '120px', resize: 'vertical', fontFamily: 'var(--font-body)',
          opacity: isReadOnly ? 0.6 : 1, outline: 'none'
        }}
      />
    </div>
  );
};

const AnalyticsPanel = ({ videoId, initialData, activePlatforms = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(data?.scheduled_for ? new Date(data.scheduled_for).toISOString().slice(0, 16) : '');
  const [hashtags, setHashtags] = useState(data?.hashtags || '');
  const [copyShort, setCopyShort] = useState(data?.ai_copy_short || '');
  const [copyLong, setCopyLong] = useState(data?.ai_copy_long || '');
  const [selectedPlatforms, setSelectedPlatforms] = useState(data?.platforms?.length ? data.platforms : activePlatforms.length ? activePlatforms : ['instagram']);
  const [postType, setPostType] = useState(data?.post_type || 'reel');
  const [showBestTimes, setShowBestTimes] = useState(false);
  const [notification, setNotification] = useState(null);
  const pollIntervalRef = useRef(null);

  const fetchAnalytics = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/analytics/${videoId}`);
      if (res.ok) {
        const newData = await res.json();
        if (data?.status === 'analyzing' && newData.status !== 'analyzing') {
          setNotification({ type: 'success', message: 'Estratégia IA Generada.' });
          setHashtags(newData.hashtags || '');
          setCopyShort(newData.ai_copy_short || '');
          setCopyLong(newData.ai_copy_long || '');
        }
        setData(newData);
      }
    } catch (e) { console.error(e); }
    finally { if (!silent) setLoading(false); }
  };

  useEffect(() => {
    const status = data?.status || initialData?.status;
    if (status === 'analyzing' || status === 'processing') {
      pollIntervalRef.current = setInterval(() => fetchAnalytics(true), 5000);
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }
    return () => { if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); };
  }, [data?.status]);

  const handleSaveSettings = async () => {
    setSaveLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/video/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduled_at: scheduledDate || null,
          hashtags,
          ai_copy_short: copyShort,
          ai_copy_long: copyLong,
          platforms: selectedPlatforms,
          post_type: postType,
          status: scheduledDate ? 'scheduled' : data.status
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setData(updated);
        setNotification({ type: 'success', message: 'Ajustes guardados.' });
      }
    } catch { 
      setNotification({ type: 'error', message: 'Error al conectar.' });
    } finally { setSaveLoading(false); }
  };

  const handlePublishNow = async () => {
    setPublishLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/publish-now/${videoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platforms: selectedPlatforms, postType })
      });
      const result = await res.json();
      if (res.ok) { 
        setData(result); 
        const isQueued = result.details?.message?.toLowerCase().includes('queued') || result.details?.message?.toLowerCase().includes('durable worker');
        setNotification({ 
          type: 'success', 
          message: isQueued ? '📤 Video en cola de procesamiento. ¡Se publicará en breve!' : '¡Despliegue completado!' 
        }); 
      }
      else { setNotification({ type: 'error', message: `Fallo: ${result.error}` }); }
    } catch (err) { setNotification({ type: 'error', message: 'Error de red.' }); }
    finally { setPublishLoading(false); }
  };

  const status = data?.status || 'processing';
  const isPublished = status === 'published';
  const isAnalyzing = status === 'analyzing' || status === 'processing';
  const viralScore = data?.viral_score;
  const isReadOnly = isPublished;

  return (
    <div style={{ marginTop: '16px' }}>
      <button 
        onClick={() => { if (!expanded) fetchAnalytics(); setExpanded(!expanded); }} 
        style={{ 
          width: '100%', 
          padding: '14px', 
          fontSize: '11px', 
          background: '#111', 
          border: '1px solid #333',
          color: '#FFF',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: '700',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {expanded ? 'OCULTAR ESTRATEGIA' : 'GESTIONAR IMPACTO'}
          {viralScore && <span style={{ color: '#FFF' }}>• SCORE {viralScore}/10</span>}
        </span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div style={{ marginTop: '20px' }} className="animate-fade-in">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Loader className="animate-spin" color="white" />
            </div>
          ) : (
            <>
              {notification && (
                <div style={{ 
                  marginBottom: '20px', padding: '16px', borderRadius: '4px',
                  background: notification.type === 'success' ? '#111' : '#200',
                  border: `1px solid ${notification.type === 'success' ? '#333' : '#411'}`,
                  color: notification.type === 'success' ? '#FFF' : '#F99',
                  fontSize: '13px', fontWeight: '700'
                }}>
                  {notification.message}
                </div>
              )}

              {/* Strategy Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <div style={{ border: '1px solid #333', padding: '8px', borderRadius: '4px' }}>
                  <BrainCircuit size={18} color="white" />
                </div>
                <h4 style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.05em', fontWeight: '700' }}>Estrategia AI Elite</h4>
              </div>

              {/* Platform Selector */}
              <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '4px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Plataformas de Distribución
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => {
                    const isConnected = activePlatforms.includes(key);
                    const isSelected = selectedPlatforms.includes(key);
                    const togglePlatform = () => {
                      if (!isConnected || isReadOnly) return;
                      setSelectedPlatforms(prev =>
                        prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
                      );
                    };
                    return (
                      <button
                        key={key}
                        onClick={togglePlatform}
                        disabled={!isConnected || isReadOnly}
                        title={!isConnected ? `${cfg.label} no está conectado` : ''}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '100px',
                          border: isSelected && isConnected ? '2px solid #FFF' : '2px solid #333',
                          background: isSelected && isConnected ? 'rgba(255,255,255,0.1)' : '#111',
                          color: isSelected && isConnected ? '#FFF' : isConnected ? '#999' : '#444',
                          cursor: isConnected && !isReadOnly ? 'pointer' : 'not-allowed',
                          fontSize: '11px',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                          opacity: isConnected ? 1 : 0.4,
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: isSelected && isConnected ? '0 0 20px rgba(255,255,255,0.1)' : 'none'
                        }}
                      >
                        {isConnected && isSelected && <span style={{ fontSize: '10px' }}>✓</span>}
                        {!isConnected && <span style={{ fontSize: '10px' }}>⊘</span>}
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
                {activePlatforms.length === 0 && (
                  <p style={{ fontSize: '10px', color: '#ef4444', marginTop: '8px', fontWeight: '600' }}>
                    ⚠️ No hay plataformas conectadas. Vincula tus redes en "Canales de Impacto".
                  </p>
                )}
                {selectedPlatforms.length === 0 && activePlatforms.length > 0 && (
                  <p style={{ fontSize: '10px', color: '#f59e0b', marginTop: '8px', fontWeight: '600' }}>
                    Selecciona al menos una plataforma para publicar.
                  </p>
                )}
              </div>

              {/* Viral Score & Insights */}
              {/* Post Format Selector */}
              <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '4px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Formato de Publicación
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['reel', 'story'].map(type => (
                    <button
                      key={type}
                      onClick={() => !isReadOnly && setPostType(type)}
                      disabled={isReadOnly}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '4px',
                        border: postType === type ? '2px solid #FFF' : '2px solid #333',
                        background: postType === type ? 'rgba(255,255,255,0.1)' : '#111',
                        color: postType === type ? '#FFF' : '#999',
                        cursor: isReadOnly ? 'not-allowed' : 'pointer',
                        fontSize: '11px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        transition: 'all 0.2s ease',
                        textAlign: 'center',
                        boxShadow: postType === type ? '0 0 20px rgba(255,255,255,0.1)' : 'none'
                      }}
                    >
                      {type === 'reel' ? '🎬 REELS' : '📱 STORIES'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Viral Score & Insights */}
              {viralScore && (
                <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', border: '1px solid #222', background: '#0A0A0A', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h5 style={{ fontSize: '1.2rem', fontWeight: '700', fontFamily: 'var(--font-heading)', color: '#FFFFFF', marginBottom: '4px', letterSpacing: '-0.02em' }}>Impacto Viral: {viralScore}/10</h5>
                      <p style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {viralScore >= 8 ? 'Despliegue de Alta Prioridad' : 'Construcción de Autoridad Orgánica'}
                      </p>
                    </div>
                    <TrendingUp size={24} style={{ color: '#FFFFFF', opacity: 0.5 }} />
                  </div>
                </div>
              )}

              <EditableCopyBlock label="Copy Corto (Tiktok/Reels)" value={copyShort} onChange={setCopyShort} isReadOnly={isReadOnly} />
              
              <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '4px' }}>
                 <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B7280', marginBottom: '12px', textTransform: 'uppercase' }}>Hashtags de Autoridad</label>
                 <textarea
                    value={hashtags}
                    onChange={e => setHashtags(e.target.value)}
                    disabled={isReadOnly}
                    style={{ 
                      width: '100%', background: '#000', border: '1px solid #222', 
                      borderRadius: '4px', color: '#FFF', padding: '12px', fontSize: '13px', 
                      height: '60px', resize: 'none', fontWeight: '700', outline: 'none'
                    }}
                 />
              </div>

              {/* Scheduling & Publish */}
              <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: '#050505', border: '1px solid #1A1A1A', borderRadius: '4px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <Calendar size={16} color="white" />
                       <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Programar</span>
                    </div>
                    <button 
                      onClick={() => setShowBestTimes(!showBestTimes)}
                      style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '10px', fontWeight: '700', cursor: 'pointer', textTransform: 'uppercase' }}
                    >
                      {showBestTimes ? 'OCULTAR' : 'MEJORES HORARIOS'}
                    </button>
                 </div>

                 {showBestTimes && (
                    <div style={{ background: '#000', padding: '16px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #222' }}>
                       <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          {['21:00', '13:00', '20:00'].map(t => (
                            <button key={t} onClick={() => setScheduledDate(new Date().toISOString().slice(0, 11) + t)} style={{ padding: '6px 14px', borderRadius: '4px', background: '#111', border: '1px solid #333', color: 'white', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>{t}</button>
                          ))}
                       </div>
                    </div>
                 )}

                 <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    disabled={isReadOnly}
                    style={{ width: '100%', background: '#000', border: '1px solid #222', borderRadius: '4px', padding: '12px 20px', color: 'white', fontSize: '13px', marginBottom: '24px', outline: 'none' }}
                 />

                 <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={handlePublishNow}
                      disabled={publishLoading || isAnalyzing || selectedPlatforms.length === 0}
                      style={{ flex: 1, padding: '16px', fontSize: '11px', background: selectedPlatforms.length === 0 ? '#333' : '#FFF', color: selectedPlatforms.length === 0 ? '#666' : '#000', border: 'none', borderRadius: '4px', fontWeight: '700', cursor: selectedPlatforms.length === 0 ? 'not-allowed' : 'pointer', textTransform: 'uppercase' }}
                    >
                       <Rocket size={16} /> {isPublished ? 'PUBLICADO' : isAnalyzing ? 'ANALIZANDO' : selectedPlatforms.length === 0 ? 'SELECCIONA PLATAFORMA' : `PUBLICAR EN ${selectedPlatforms.length} RED${selectedPlatforms.length > 1 ? 'ES' : ''}`}
                    </button>
                    <button 
                      onClick={handleSaveSettings}
                      disabled={saveLoading || isReadOnly}
                      style={{ flex: 1, padding: '16px', fontSize: '11px', color: 'white', background: '#000', border: '1px solid #333', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', textTransform: 'uppercase' }}
                    >
                       <CheckCircle size={16} /> {saveLoading ? '...' : isReadOnly ? 'FIXED' : 'GUARDAR AJUSTES'}
                    </button>
                 </div>
              </div>

              {/* Analytics Summary */}
              {isPublished && (
                <div style={{ marginTop: '24px' }}>
                   <PlatformRow platform="tiktok" data={data?.analytics_4h?.tiktok} />
                   <PlatformRow platform="instagram" data={data?.analytics_4h?.instagram} />
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
