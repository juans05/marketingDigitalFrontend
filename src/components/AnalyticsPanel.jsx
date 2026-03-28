import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Heart, Share2, Calendar, Copy, ChevronDown, ChevronUp, Loader, CheckCircle, TrendingUp, Rocket, BrainCircuit, Sparkles, X, Clock, Smartphone, History } from 'lucide-react';

const PLATFORM_CONFIG = {
  tiktok: { label: 'TikTok', color: '#000', bg: '#F3F4F6' },
  instagram: { label: 'Instagram', color: '#000', bg: '#F3F4F6' },
  youtube: { label: 'YouTube', color: '#000', bg: '#F3F4F6' },
  facebook: { label: 'Facebook', color: '#000', bg: '#F3F4F6' },
  twitter: { label: 'Twitter/X', color: '#000', bg: '#F3F4F6' },
};

const StatBadge = ({ icon, value, label }) => (
  <div style={{ textAlign: 'center', flex: 1, padding: '16px 12px', background: '#F9FAFB', border: '1px solid var(--border-main)', borderRadius: '12px' }}>
    <div style={{ color: 'var(--primary)', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
      {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value ?? '0'}
    </div>
    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>{label}</div>
  </div>
);

const EditableCopyBlock = ({ label, value, onChange, isReadOnly }) => {
  const [copied, setCopied] = useState(false);
  const handle = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="card-pro" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <button onClick={handle} style={{ background: '#F3F4F6', border: '1px solid var(--border-main)', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', color: copied ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700' }}>
          <Copy size={12} /> {copied ? 'COPIADO' : 'COPIAR'}
        </button>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={isReadOnly}
        style={{ 
          width: '100%', background: '#F9FAFB', border: '1px solid var(--border-main)', 
          borderRadius: '12px', color: 'var(--text-main)', padding: '16px', fontSize: '14px', 
          lineHeight: '1.6', height: '140px', resize: 'vertical', fontFamily: 'var(--font-body)',
          opacity: isReadOnly ? 0.6 : 1, outline: 'none'
        }}
      />
    </div>
  );
};

const PlatformRow = ({ platform, data }) => {
  const cfg = PLATFORM_CONFIG[platform] || { label: platform, color: '#000', bg: '#F3F4F6' };
  return (
    <div className="card-pro" style={{ padding: '24px', marginBottom: '20px' }}>
      <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '13px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cfg.label}</div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <StatBadge icon={<Eye size={16} />} value={data?.views ?? data?.impressions ?? data?.reach} label="Impacto" />
        <StatBadge icon={<Heart size={16} />} value={data?.likes ?? data?.hearts} label="Fans" />
        <StatBadge icon={<Share2 size={16} />} value={data?.shares ?? data?.reposts} label="Viral" />
      </div>
    </div>
  );
};

const AnalyticsPanel = ({ videoId, initialData, activePlatforms = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const toggleDrawer = () => {
    if (!isOpen) fetchAnalytics();
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button 
        onClick={toggleDrawer} 
        className="btn-primary"
        style={{ 
          width: '100%', 
          height: '48px',
          fontSize: '12px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '16px'
        }}
      >
        <Sparkles size={16} /> REVISAR RESULTADOS IA
      </button>

      {isOpen && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 99999, display: 'flex', justifyContent: 'flex-end',
          pointerEvents: 'none'
        }}>
          {/* Overlay */}
          <div 
            onClick={toggleDrawer}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
              pointerEvents: 'auto', animation: 'fadeIn 0.3s ease'
            }}
          />

          {/* Side Drawer Content */}
          <div style={{
            position: 'relative',
            width: 'min(500px, 95vw)',
            height: '100%',
            background: '#FFFFFF',
            boxShadow: '-10px 0 40px rgba(0,0,0,0.1)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            pointerEvents: 'auto',
            animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Drawer Header */}
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', marginBottom: '4px' }}>Resultados IA</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{initialData?.title}</p>
              </div>
              <button onClick={toggleDrawer} style={{ background: '#FFF', border: '1px solid var(--border-main)', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={20} color="var(--text-main)" />
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '32px' }}>
              {loading ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--text-muted)' }}>
                  <Loader className="animate-spin" size={32} color="var(--primary)" />
                  <p style={{ fontWeight: '700', fontSize: '12px' }}>SINCRONIZANDO ESTRATEGIA...</p>
                </div>
              ) : (
                <div className="animate-fade-in">
                  {notification && (
                    <div style={{ 
                      marginBottom: '24px', padding: '16px', borderRadius: '12px',
                      background: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
                      border: `1px solid ${notification.type === 'success' ? '#10b981' : '#fecaca'}`,
                      color: notification.type === 'success' ? '#065f46' : '#991b1b',
                      fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                      <CheckCircle size={18} /> {notification.message}
                    </div>
                  )}

                  {/* 1. Score de Viralidad Card */}
                  {viralScore && (
                    <div className="card-pro" style={{ padding: '24px', marginBottom: '32px', border: '2px solid var(--primary)', background: '#F5F7FF' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>Potencial de IMPACTO</p>
                          <h5 style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{viralScore}/10</h5>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '4px' }}>
                            {viralScore >= 8 ? 'Candidato a Tendencia Mundial' : 'Construcción de Autoridad Orgánica'}
                          </p>
                        </div>
                        <div style={{ background: 'var(--primary)', padding: '12px', borderRadius: '12px' }}>
                          <TrendingUp size={24} color="white" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Edición de Copys */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <BrainCircuit size={18} color="var(--primary)" />
                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>Copywriting Estratégico</h4>
                  </div>
                  <EditableCopyBlock label="Copy Corto (TikTok/Reels)" value={copyShort} onChange={setCopyShort} isReadOnly={isReadOnly} />
                  
                  <div className="card-pro" style={{ padding: '24px', marginBottom: '32px' }}>
                     <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '12px', textTransform: 'uppercase' }}>Hashtags de Autoridad</label>
                     <textarea
                        value={hashtags}
                        onChange={e => setHashtags(e.target.value)}
                        disabled={isReadOnly}
                        style={{ 
                          width: '100%', background: '#F9FAFB', border: '1px solid var(--border-main)', 
                          borderRadius: '12px', color: 'var(--text-main)', padding: '16px', fontSize: '14px', 
                          height: '80px', resize: 'none', fontWeight: '700', outline: 'none'
                        }}
                     />
                  </div>

                  {/* 3. Distribución */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <Rocket size={18} color="var(--primary)" />
                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>Distribución de Impacto</h4>
                  </div>
                  
                  <div className="card-pro" style={{ padding: '24px', marginBottom: '32px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>Plataformas Seleccionadas</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => {
                        const isConnected = activePlatforms.includes(key);
                        const isSelected = selectedPlatforms.includes(key);
                        const togglePlatformBtn = () => {
                          if (!isConnected || isReadOnly) return;
                          setSelectedPlatforms(prev =>
                            prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
                          );
                        };
                        return (
                          <button
                            key={key}
                            onClick={togglePlatformBtn}
                            disabled={!isConnected || isReadOnly}
                            style={{
                              padding: '10px 18px',
                              borderRadius: '100px',
                              border: isSelected && isConnected ? '2px solid var(--primary)' : '1px solid var(--border-main)',
                              background: isSelected && isConnected ? '#EEF2FF' : '#FFF',
                              color: isSelected && isConnected ? 'var(--primary)' : isConnected ? 'var(--text-muted)' : '#CCC',
                              cursor: isConnected && !isReadOnly ? 'pointer' : 'not-allowed',
                              fontSize: '11px',
                              fontWeight: '800',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div style={{ marginTop: '24px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>Formato</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {['reel', 'story'].map(type => (
                          <button
                            key={type}
                            onClick={() => !isReadOnly && setPostType(type)}
                            disabled={isReadOnly}
                            style={{
                              flex: 1, padding: '14px', borderRadius: '12px',
                              border: postType === type ? '2px solid var(--primary)' : '1px solid var(--border-main)',
                              background: postType === type ? '#EEF2FF' : '#FFF',
                              color: postType === type ? 'var(--primary)' : 'var(--text-muted)',
                              cursor: isReadOnly ? 'not-allowed' : 'pointer',
                              fontSize: '11px', fontWeight: '800', textTransform: 'uppercase'
                            }}
                          >
                            {type === 'reel' ? '🎬 REELS' : '📱 STORIES'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 4. Programación */}
                  <div className="card-pro" style={{ padding: '24px', marginBottom: '32px', background: '#F9FAFB' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <Calendar size={18} color="var(--primary)" />
                           <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>AGENDA EL LANZAMIENTO</span>
                        </div>
                     </div>

                     <input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={e => setScheduledDate(e.target.value)}
                        disabled={isReadOnly}
                        style={{ width: '100%', background: '#FFF', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '14px 20px', color: 'var(--text-main)', fontSize: '14px', marginBottom: '24px', outline: 'none' }}
                     />

                     <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                          onClick={handlePublishNow}
                          disabled={publishLoading || isAnalyzing || selectedPlatforms.length === 0}
                          className="btn-primary"
                          style={{ flex: 1, height: '56px', fontSize: '12px' }}
                        >
                           {isPublished ? 'PUBLICADO' : isAnalyzing ? 'ANALIZANDO' : `LANZAR AHORA`}
                        </button>
                        <button 
                          onClick={handleSaveSettings}
                          disabled={saveLoading || isReadOnly}
                          className="btn-secondary"
                          style={{ flex: 1, height: '56px', fontSize: '12px' }}
                        >
                           {saveLoading ? '...' : 'GUARDAR AJUSTES'}
                        </button>
                     </div>
                  </div>

                  {/* Analytics Summary */}
                  {isPublished && (
                    <div style={{ marginTop: '24px' }}>
                       <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>Métricas Post-Venta</div>
                       {Object.keys(PLATFORM_CONFIG).map(p => (
                         data?.analytics_4h?.[p] && <PlatformRow key={p} platform={p} data={data.analytics_4h[p]} />
                       ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <style>{`
              @keyframes slideInRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default AnalyticsPanel;
