import { useState } from 'react';
import { Eye, Heart, Share2, MessageCircle, Calendar, Copy, ChevronDown, ChevronUp, Loader, CheckCircle, Clock, Zap, Lightbulb } from 'lucide-react';

const PLATFORM_CONFIG = {
  tiktok:    { label: 'TikTok',    color: '#ff0050', bg: 'rgba(255,0,80,0.1)' },
  instagram: { label: 'Instagram', color: '#e1306c', bg: 'rgba(225,48,108,0.1)' },
  youtube:   { label: 'YouTube',   color: '#ff0000', bg: 'rgba(255,0,0,0.1)' },
  facebook:  { label: 'Facebook',  color: '#1877f2', bg: 'rgba(24,119,242,0.1)' },
  twitter:   { label: 'Twitter/X', color: '#1da1f2', bg: 'rgba(29,161,242,0.1)' },
};

// Mejores horarios por plataforma (estudios de engagement 2024-2025)
const BEST_TIMES = {
  tiktok:    { tip: 'Mayor engagement en horas de descanso y tarde/noche',     slots: [{ label: 'Mar / Jue / Vie', times: ['9:00','12:00','19:00'] }, { label: 'Sábado', times: ['11:00','17:00'] }] },
  instagram: { tip: 'Picos a la hora del almuerzo y noche',                     slots: [{ label: 'Lun / Mar / Mié', times: ['9:00','12:00','18:00'] }, { label: 'Jue / Vie', times: ['11:00','15:00'] }] },
  youtube:   { tip: 'Audiencia activa tarde/noche entre semana y fin de semana',slots: [{ label: 'Jue / Vie',       times: ['14:00','20:00'] },       { label: 'Sáb / Dom', times: ['10:00','16:00'] }] },
  facebook:  { tip: 'Mejor rendimiento a media mañana y almuerzo',              slots: [{ label: 'Mar / Mié / Jue', times: ['9:00','13:00','15:00'] }, { label: 'Viernes',  times: ['10:00','13:00'] }] },
  twitter:   { tip: 'Picos en hora punta matutina y mediodía',                  slots: [{ label: 'Lun / Mar / Mié', times: ['8:00','12:00','17:00'] }, { label: 'Jue / Vie', times: ['9:00','12:00'] }] },
};

const getBestTimesForPlatforms = (platforms) => {
  const active = platforms.filter(p => BEST_TIMES[p]);
  if (!active.length) return null;
  const timeCounts = {};
  active.forEach(p => BEST_TIMES[p].slots.forEach(s => s.times.forEach(t => { timeCounts[t] = (timeCounts[t] || 0) + 1; })));
  const topTimes = Object.entries(timeCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([t]) => t);
  return { platforms: active, topTimes };
};

const nextDatetimeFor = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  if (d <= new Date()) d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 16);
};

const parseAnalytics = (raw) => {
  if (!raw) return null;
  if (raw.analytics && Array.isArray(raw.analytics)) return raw.analytics.reduce((acc, item) => { acc[item.platform] = item.results || item.analytics || {}; return acc; }, {});
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
  return null;
};

const StatBadge = ({ icon, value, label, color }) => (
  <div style={{ textAlign: 'center', flex: 1 }}>
    <div style={{ color, marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
    <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>{value >= 1000 ? `${(value/1000).toFixed(1)}k` : value ?? '—'}</div>
    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</div>
  </div>
);

const PlatformRow = ({ platform, data }) => {
  const cfg = PLATFORM_CONFIG[platform] || { label: platform, color: '#9b51e0', bg: 'rgba(155,81,224,0.1)' };
  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.color}30`, borderRadius: '12px', padding: '16px', marginBottom: '10px' }}>
      <div style={{ fontWeight: '600', color: cfg.color, fontSize: '14px', marginBottom: '12px' }}>{cfg.label}</div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <StatBadge icon={<Eye size={14} />}          value={data?.views ?? data?.impressions ?? data?.reach} label="Views"       color="#9b51e0" />
        <StatBadge icon={<Heart size={14} />}         value={data?.likes ?? data?.hearts}                    label="Likes"       color="#e1306c" />
        <StatBadge icon={<Share2 size={14} />}        value={data?.shares ?? data?.reposts ?? data?.retweets}label="Shares"      color="#10b981" />
        <StatBadge icon={<MessageCircle size={14} />} value={data?.comments ?? data?.replies}                label="Comentarios" color="#f59e0b" />
      </div>
    </div>
  );
};

const AnalyticsPanel = ({ videoId, initialData }) => {
  const [expanded, setExpanded]             = useState(false);
  const [data, setData]                     = useState(initialData || null);
  const [loading, setLoading]               = useState(false);
  const [saveLoading, setSaveLoading]       = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [copyCopied, setCopyCopied]         = useState(false);
  const [scheduledDate, setScheduledDate]   = useState(data?.scheduled_at ? new Date(data.scheduled_at).toISOString().slice(0, 16) : '');
  const [hashtags, setHashtags]             = useState(data?.hashtags || '');
  const [selectedPlatforms, setSelectedPlatforms] = useState(data?.platforms || ['tiktok', 'instagram', 'youtube']);
  const [showBestTimes, setShowBestTimes]   = useState(false);

  const togglePlatform = (p) => setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const fetchAnalytics = async () => {
    if (data?.analytics_4h !== undefined) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/analytics/${videoId}`);
      if (res.ok) setData(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSaveSettings = async () => {
    setSaveLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/video/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduled_at: scheduledDate || null, hashtags, platforms: selectedPlatforms, status: scheduledDate ? 'scheduled' : data.status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setData(updated);
        if (scheduledDate) {
          alert(updated.ayrshare_post_id
            ? '✅ Publicación programada correctamente en tus redes sociales.'
            : '⚠️ Fecha guardada, pero las redes no están conectadas. Conéctalas para que se publique automáticamente.');
        } else {
          alert('✅ Ajustes guardados correctamente.');
        }
      } else {
        const err = await res.json();
        alert('Error: ' + (err.error || 'No se pudo guardar'));
      }
    } catch { alert('Error de conexión al guardar.'); }
    finally { setSaveLoading(false); }
  };

  const handlePublishNow = async () => {
    if (!confirm('¿Publicar este contenido AHORA en todas las redes conectadas?')) return;
    setPublishLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/publish-now/${videoId}`, { method: 'POST' });
      const result = await res.json();
      if (res.ok) { setData(result); alert('✅ ¡Publicado con éxito en tus redes sociales!'); }
      else alert('Error: ' + (result.error || 'No se pudo publicar'));
    } catch { alert('Error de conexión al publicar.'); }
    finally { setPublishLoading(false); }
  };

  const handleExpand = () => { if (!expanded) fetchAnalytics(); setExpanded(v => !v); };
  const bestTimes = getBestTimesForPlatforms(selectedPlatforms);
  const analytics = parseAnalytics(data?.analytics_4h);
  const isPublished = data?.status === 'published';

  return (
    <div>
      <button onClick={handleExpand} style={{ width: '100%', marginTop: '12px', background: 'rgba(155,81,224,0.1)', border: '1px solid rgba(155,81,224,0.25)', borderRadius: '8px', padding: '8px 14px', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
        <span>Detalles y Publicación</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div style={{ marginTop: '12px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}><Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /></div>
          ) : (
            <>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>

                {/* ─ PUBLICAR AHORA ─ */}
                <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Publicación inmediata</label>
                  <button
                    onClick={handlePublishNow}
                    disabled={publishLoading || isPublished}
                    style={{ width: '100%', padding: '10px', background: isPublished ? 'rgba(74,222,128,0.06)' : 'rgba(74,222,128,0.15)', border: `1px solid ${isPublished ? 'rgba(74,222,128,0.2)' : 'rgba(74,222,128,0.4)'}`, borderRadius: '8px', color: '#4ade80', cursor: isPublished ? 'default' : 'pointer', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: publishLoading ? 0.7 : 1 }}
                  >
                    {publishLoading ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Publicando...</>
                      : isPublished ? <><CheckCircle size={15} /> Ya publicado</>
                      : <><Zap size={15} /> Publicar Ahora</>}
                  </button>
                </div>

                {/* ─ PLATAFORMAS ─ */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>Publicar en:</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {Object.entries(PLATFORM_CONFIG).map(([id, cfg]) => {
                      const active = selectedPlatforms.includes(id);
                      return (
                        <button key={id} onClick={() => togglePlatform(id)} style={{ padding: '6px 12px', borderRadius: '15px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', border: '1px solid', borderColor: active ? cfg.color : 'rgba(255,255,255,0.1)', background: active ? cfg.bg : 'transparent', color: active ? cfg.color : 'var(--text-muted)', transition: 'all 0.2s' }}>
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ─ HASHTAGS ─ */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '5px' }}>Hashtags / Texto del post</label>
                  <textarea value={hashtags} onChange={e => setHashtags(e.target.value)} placeholder="#viral #musica #reel..." style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', padding: '8px', fontSize: '13px', height: '60px', resize: 'none' }} />
                </div>

                {/* ─ PROGRAMAR ─ */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={10} /> Programar para más tarde
                    </label>
                    <button onClick={() => setShowBestTimes(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
                      <Lightbulb size={12} /> {showBestTimes ? 'Ocultar horarios' : 'Mejores horarios'}
                    </button>
                  </div>

                  {/* Recomendaciones */}
                  {showBestTimes && bestTimes && (
                    <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '12px', marginBottom: '10px' }}>
                      <p style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '700', marginBottom: '6px' }}>Mejores horarios para maximizar tu audiencia</p>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '10px' }}>Basado en estudios de engagement 2024–2025. Clic para seleccionar.</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                        {bestTimes.topTimes.map(time => (
                          <button key={time} onClick={() => setScheduledDate(nextDatetimeFor(time))} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Clock size={11} /> {time}
                          </button>
                        ))}
                      </div>
                      {bestTimes.platforms.map(p => (
                        <div key={p} style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '6px', marginBottom: '3px' }}>
                          <span style={{ color: PLATFORM_CONFIG[p]?.color, fontWeight: '600', minWidth: '70px' }}>{PLATFORM_CONFIG[p]?.label}:</span>
                          <span>{BEST_TIMES[p]?.tip}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <input type="datetime-local" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', padding: '8px', fontSize: '13px' }} />
                </div>

                {/* ─ GUARDAR ─ */}
                <button onClick={handleSaveSettings} disabled={saveLoading} style={{ width: '100%', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', opacity: saveLoading ? 0.7 : 1 }}>
                  {saveLoading ? 'Guardando...' : scheduledDate ? '🗓 Programar publicación' : 'Guardar ajustes'}
                </button>
              </div>

              {/* ─ METADATA ─ */}
              {(data?.published_at || data?.scheduled_at) && (
                <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {data.published_at && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={10} color="#4ade80" />Publicado: {new Date(data.published_at).toLocaleDateString()}</span>}
                  {data.scheduled_at && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#60a5fa' }}><Clock size={10} />Prog: {new Date(data.scheduled_at).toLocaleDateString()} {new Date(data.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                </div>
              )}

              {/* ─ ANALYTICS ─ */}
              {analytics
                ? Object.entries(analytics).map(([platform, pData]) => <PlatformRow key={platform} platform={platform} data={pData} />)
                : <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '10px' }}>{isPublished ? 'Analytics disponibles 4h después de publicar' : 'Disponible al publicar'}</div>
              }

              {/* ─ AI COPY ─ */}
              {data?.ai_copy_short && (
                <div style={{ background: 'rgba(155,81,224,0.05)', border: '1px solid rgba(155,81,224,0.15)', borderRadius: '10px', padding: '12px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold' }}>COPY IA SUGERIDO</span>
                    <button onClick={() => { navigator.clipboard.writeText(data.ai_copy_short); setCopyCopied(true); setTimeout(() => setCopyCopied(false), 2000); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copyCopied ? '#10b981' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
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
