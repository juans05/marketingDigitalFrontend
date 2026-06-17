import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles, BarChart3, Upload, Loader2, TrendingUp, Users, Film,
  Heart, MessageCircle, Eye, Share2, Lightbulb, Target, AlertCircle,
  RefreshCw, Bookmark, Clock, Zap, Info
} from 'lucide-react';

const METRIC_EXPLANATIONS = {
  seguidores:              'Personas que eligieron seguir tu cuenta. Es tu audiencia base — las personas que verán tu contenido primero.',
  alcance:                 'Cuántas personas DISTINTAS vieron tu publicación. Si llega a 1.000 personas, el alcance es 1.000, sin importar cuántas veces la vio cada una.',
  impresiones:             'Cuántas veces se mostró tu contenido en total. Una persona puede verlo 3 veces = 3 impresiones. Más impresiones que alcance significa que tu contenido "engancha" y la gente lo vuelve a ver.',
  likes:                   'Personas que tocaron el corazón ❤️ en tu publicación. Es la interacción más fácil y básica.',
  comentarios:             'Personas que escribieron algo en tu publicación. Vale mucho más que un like — significa que tu contenido generó una reacción real.',
  compartidos:             'Personas que mandaron tu contenido a sus amigos o lo publicaron en su perfil. Es la forma más poderosa de crecer — tu contenido llega a personas que aún no te siguen.',
  guardados:               '📌 La métrica más valiosa de Instagram. Cuando alguien guarda tu publicación significa que el contenido fue tan útil o inspirador que quiere volver a verlo. El algoritmo lo premia mucho.',
  engagement:              'De cada 100 personas que ven tu contenido, cuántas interactúan (dan like, comentan o comparten). Un 3% ya es bueno. Por encima del 6% es excelente. Un artista con 500 seguidores y 10% ER supera a uno con 50.000 y 0.5% ER.',
  viral_score:             'Puntuación de nuestra IA (0–10) sobre el potencial viral de este video. Evalúa el gancho inicial, la duración, el ritmo y el mensaje. Más de 7 = tiene posibilidades reales de explotar.',
  best_times:              'Los días y horas en que tu audiencia interactuó más con tu contenido en el pasado. Publicar en esos momentos aumenta las probabilidades de que más personas lo vean.',
  views:                   'Cuántas veces se reprodujo tu video (al menos unos segundos). Es el primer filtro del algoritmo — si pocas personas lo ven, deja de mostrarlo.',
  watch_time:              'YouTube: tiempo total que las personas pasaron viendo tu video. El algoritmo de YouTube premia los videos que la gente termina de ver. Un video de 10 min con 8 min de watch time promedio es un hit.',
  traccion_viral:          'Muestra cómo evolucionó el alcance total de tu contenido en los últimos 7 días. Un pico hacia arriba significa que un post pegó fuerte. Una línea plana indica que el contenido no está generando tracción nueva.',
  comparativa_plataformas: 'Resumen de cada red social donde tienes presencia. Compara en qué plataforma tienes más alcance, más engagement y más seguidores. Haz clic en cualquier plataforma para ver el detalle completo.',
  rendimiento_publicacion: 'Tabla con cada publicación y sus métricas reales de las redes sociales. Te permite identificar qué contenido funcionó mejor y repetir ese formato en el futuro.',
};

const InfoTooltip = ({ metricKey }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const iconRef = useRef(null);
  const text = METRIC_EXPLANATIONS[metricKey];
  if (!text) return null;

  const show = (e) => {
    e.stopPropagation();
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setCoords({ top: rect.top - 8, left: rect.left + rect.width / 2 });
    }
    setVisible(true);
  };

  const hide = () => setVisible(false);
  const toggle = (e) => { e.stopPropagation(); setVisible(v => !v); };

  const tooltip = visible ? createPortal(
    <span
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        transform: 'translate(-50%, -100%)',
        zIndex: 99999,
        background: 'rgba(15,15,20,0.97)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '12px',
        lineHeight: '1.6',
        color: '#E2E8F0',
        maxWidth: '240px',
        width: 'max-content',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        pointerEvents: 'none',
      }}
    >
      {text}
      <span style={{
        position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
        borderTop: '6px solid rgba(15,15,20,0.97)',
      }} />
    </span>,
    document.body
  ) : null;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span
        ref={iconRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={toggle}
        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', color: 'var(--text-dim)', marginLeft: '4px', opacity: 0.6 }}
      >
        <Info size={11} />
      </span>
      {tooltip}
    </span>
  );
};

const TrendChart = ({ data }) => {
  if (!data || data.length < 2) return null;
  const width = 800;
  const height = 240;
  const padding = 40;
  const maxVal = Math.max(...data.map(d => d.value)) || 100;

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * (width - padding * 2) + padding,
    y: height - ((d.value / maxVal) * (height - padding * 2) + padding)
  }));

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cp1x = curr.x + (next.x - curr.x) / 2;
    pathD += ` C ${cp1x} ${curr.y}, ${cp1x} ${next.y}, ${next.x} ${next.y}`;
  }
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="chart-wrapper">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#chartGradient)" />
        <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 8px rgba(79, 70, 229, 0.4))' }} />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="6" fill="var(--bg-primary)" stroke="var(--primary)" strokeWidth="3" />
        ))}
      </svg>
      <div className="chart-labels">
        {data.map((d, i) => (
          <span key={i}>
            {d.date.split('-').reverse()[0]}{' '}
            {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][parseInt(d.date.split('-')[1]) - 1]}
          </span>
        ))}
      </div>
      <style>{`
        .chart-wrapper { width: 100%; height: 280px; position: relative; margin-top: 32px; }
        .chart-labels { display: flex; justify-content: space-between; padding: 16px 0; color: var(--text-dim); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
      `}</style>
    </div>
  );
};

const MetricPill = ({ icon, value, label, color = '#6366F1' }) => (
  <div className="metric-pill" style={{ borderColor: `${color}22`, background: `${color}08` }}>
    <span style={{ color }}>{icon}</span>
    <span className="metric-pill-value">{value}</span>
    {label && <span className="metric-pill-label">{label}</span>}
  </div>
);

const BestTimesChart = ({ times }) => {
  if (!times || times.length === 0) return null;
  const maxEng = Math.max(...times.map(t => t.avg_engagement)) || 1;
  return (
    <div className="best-times-chart">
      {times.map((t, i) => (
        <div key={i} className="best-time-bar">
          <div className="best-time-label">{t.label}</div>
          <div className="best-time-track">
            <div
              className="best-time-fill"
              style={{ width: `${Math.round((t.avg_engagement / maxEng) * 100)}%`, opacity: 1 - i * 0.08 }}
            />
          </div>
          <div className="best-time-value">{t.avg_engagement > 0 ? `~${t.avg_engagement}` : '—'}</div>
        </div>
      ))}
    </div>
  );
};

const InsightCard = ({ insights, decisions, bestPlatform, bestPostTitle, engagementRate, loading }) => {
  if (loading) {
    return (
      <div className="insight-card card-pro">
        <div className="insight-header">
          <Sparkles size={16} color="var(--primary)" />
          <span>Analizando con IA...</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px 0', color: 'var(--text-muted)' }}>
          <Loader2 size={16} className="animate-spin" />
          <span style={{ fontSize: '13px' }}>Claude está procesando tus métricas...</span>
        </div>
      </div>
    );
  }

  if (!insights?.length) return null;

  return (
    <div className="insight-card card-pro">
      <div className="insight-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="var(--primary)" />
          <span className="insight-title">Análisis IA de tu Contenido</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {bestPlatform && bestPlatform !== 'sin datos' && (
            <div className="insight-badge" style={{ background: 'rgba(22, 163, 74, 0.12)', color: '#4ADE80', borderColor: 'rgba(22, 163, 74, 0.3)' }}>
              Mejor: {bestPlatform}
            </div>
          )}
          {engagementRate > 0 && (
            <div className="insight-badge" style={{ background: 'rgba(79, 70, 229, 0.12)', color: 'var(--primary)', borderColor: 'rgba(79, 70, 229, 0.3)' }}>
              {Number(engagementRate).toFixed(1)}% engagement
            </div>
          )}
        </div>
      </div>

      <div className="insight-body">
        <div className="insight-col">
          <div className="insight-col-title">
            <Eye size={13} color="#6366F1" />
            Observaciones
          </div>
          {insights.map((insight, i) => (
            <div key={i} className="insight-item">
              <AlertCircle size={13} color="#6366F1" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{insight}</span>
            </div>
          ))}
        </div>

        <div className="insight-divider" />

        <div className="insight-col">
          <div className="insight-col-title">
            <Target size={13} color="#16A34A" />
            Decisiones Recomendadas
          </div>
          {decisions.map((decision, i) => (
            <div key={i} className="insight-item decision">
              <Lightbulb size={13} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{decision}</span>
            </div>
          ))}
        </div>
      </div>

      {bestPostTitle && bestPostTitle !== 'sin datos' && (
        <div className="insight-best-post">
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Mejor post:</span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>"{bestPostTitle}"</span>
        </div>
      )}
    </div>
  );
};

const PLATFORM_META = {
  instagram: { label: 'Instagram', emoji: '📸', color: '#E1306C' },
  tiktok:    { label: 'TikTok',    emoji: '🎵', color: '#69C9D0' },
  youtube:   { label: 'YouTube',   emoji: '▶',  color: '#FF0000' },
  facebook:  { label: 'Facebook',  emoji: '👥', color: '#1877F2' },
  linkedin:  { label: 'LinkedIn',  emoji: '💼', color: '#0A66C2' },
};

const AnalyticsView = ({ userId, activeArtist }) => {
  const [data, setData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [activePlatform, setActivePlatform] = useState('all');

  useEffect(() => {
    setActivePlatform('all');
    fetchStats();
    if (activeArtist?.id) {
      fetchPostMetrics(activeArtist.id);
    }
  }, [userId, activeArtist]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const userStr = localStorage.getItem('vidalis_user');
      const token = userStr ? JSON.parse(userStr).token : '';
      const url = new URL(`${import.meta.env.VITE_API_URL}/api/vidalis/stats/${userId}`);
      if (activeArtist?.id) url.searchParams.append('artistId', activeArtist.id);
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error('Analytics Fetch Error:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchPostMetrics = async (artistId) => {
    setLoadingPosts(true);
    try {
      const userStr = localStorage.getItem('vidalis_user');
      const token = userStr ? JSON.parse(userStr).token : '';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/analytics-posts/${artistId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setPosts(json.posts || []);
      }
    } catch (err) {
      console.error('Post metrics error:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchInsights = async () => {
    if (!activeArtist?.id) return;
    setLoadingInsights(true);
    setInsights(null);
    try {
      const userStr = localStorage.getItem('vidalis_user');
      const token = userStr ? JSON.parse(userStr).token : '';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/analytics-insights/${activeArtist.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setInsights(json);
        if (json.posts?.length) setPosts(json.posts);
      }
    } catch (err) {
      console.error('Insights error:', err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const formatNum = (n) => {
    if (!n || n === 0) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  };

  const handleSync = async () => {
    const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
    const userStr = localStorage.getItem('vidalis_user');
    const token = userStr ? JSON.parse(userStr).token : '';
    if (activeArtist?.id) {
      setLoadingStats(true);
      try {
        // Sincronizar estado de cuentas Y analytics Zernio en paralelo
        await Promise.all([
          fetch(`${apiBase}/api/vidalis/artists/${activeArtist.id}/sync`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${apiBase}/api/vidalis/artists/${activeArtist.id}/sync-analytics`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          }),
        ]);
      } catch (err) {
        console.error('Sync error:', err);
      }
    }
    fetchStats();
    if (activeArtist?.id) fetchPostMetrics(activeArtist.id);
  };

  const loading = loadingStats && !data;

  if (loading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
        <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>Actualizando métricas...</p>
      </div>
    );
  }

  const breakdown = data?.platform_breakdown || {};
  const connectedPlatforms = Object.keys(breakdown).filter(p => PLATFORM_META[p]);
  const totalReachAll = connectedPlatforms.reduce((sum, p) => sum + (breakdown[p]?.reach || 0), 0);
  const bestPlatformKey = connectedPlatforms.reduce((best, p) => {
    const engA = breakdown[p]?.engagement_rate || 0;
    const engB = breakdown[best]?.engagement_rate || 0;
    return engA > engB ? p : best;
  }, connectedPlatforms[0] || null);

  // Merge postList from stats (has analytics_4h) with real-time from fetchPostMetrics
  const statsPostList = data?.postList || [];
  const realtimePosts = posts.length ? posts : [];
  const mergedPosts = statsPostList.map(sp => {
    const rt = realtimePosts.find(p => p.id === sp.id);
    if (rt && (rt.likes > 0 || rt.views > 0)) return { ...sp, ...rt };
    return sp;
  });
  const allPosts = mergedPosts.length ? mergedPosts : realtimePosts;
  const filteredPosts = activePlatform === 'all'
    ? allPosts
    : allPosts.filter(p => Array.isArray(p.platforms) && p.platforms.includes(activePlatform));

  const bestTimes = data?.best_posting_times || [];

  return (
    <div className="analytics-container animate-fade-in">
      {/* Header */}
      <div className="analytics-header">
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={handleSync} disabled={loadingStats || loadingPosts} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={13} className={loadingStats ? 'animate-spin' : ''} />
            Sincronizar
          </button>
          {activeArtist?.id && (
            <button className="btn-primary" onClick={fetchInsights} disabled={loadingInsights} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={13} />
              {loadingInsights ? 'Analizando...' : 'Analizar con IA'}
            </button>
          )}
        </div>
      </div>

      {/* Insights IA */}
      {(insights || loadingInsights) && (
        <InsightCard
          loading={loadingInsights}
          insights={insights?.insights || []}
          decisions={insights?.decisions || []}
          bestPlatform={insights?.bestPlatform}
          bestPostTitle={insights?.bestPostTitle}
          engagementRate={insights?.engagementRate}
        />
      )}

      {/* Platform Tabs */}
      <div className="platform-tabs">
        <button onClick={() => setActivePlatform('all')} className={`platform-tab ${activePlatform === 'all' ? 'active' : ''}`}>
          ★ Todo
        </button>
        {connectedPlatforms.map(p => (
          <button key={p} onClick={() => setActivePlatform(p)} className={`platform-tab ${activePlatform === p ? 'active' : ''}`}>
            {PLATFORM_META[p].emoji} {PLATFORM_META[p].label}
            {breakdown[p]?.engagement_rate > 0 && (
              <span className="tab-er-badge">{breakdown[p].engagement_rate.toFixed(1)}%</span>
            )}
          </button>
        ))}
      </div>

      {/* ── VISTA TODO ── */}
      {activePlatform === 'all' && (
        <>
          <div className="stats-section-label" style={{ display: 'flex', alignItems: 'center' }}>
            COMPARATIVA DE PLATAFORMAS<InfoTooltip metricKey="comparativa_plataformas" />
          </div>
          {connectedPlatforms.length === 0 ? (
            <div className="card-pro" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px' }}>
              <BarChart3 size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <p style={{ margin: 0 }}>Sincroniza tus redes sociales para ver métricas por plataforma.</p>
            </div>
          ) : (
            <div className="platform-compare-grid">
              {connectedPlatforms.map(p => {
                const m = breakdown[p] || {};
                const pct = totalReachAll > 0 ? Math.round((m.reach || 0) / totalReachAll * 100) : 0;
                const meta = PLATFORM_META[p];
                const isBest = p === bestPlatformKey;
                return (
                  <div key={p} className="platform-compare-card card-pro" onClick={() => setActivePlatform(p)} style={{ cursor: 'pointer', borderColor: isBest ? `${meta.color}55` : undefined }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '22px' }}>{meta.emoji}</span>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{meta.label}</span>
                      </div>
                      {isBest && <span style={{ fontSize: '10px', fontWeight: '800', background: 'rgba(16,185,129,0.15)', color: '#34D399', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '99px', padding: '2px 10px' }}>★ LÍDER</span>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                      {[
                        { icon: <Users size={12} />,        val: formatNum(m.followers), label: 'Seguidores',  tip: 'seguidores' },
                        { icon: <Eye size={12} />,          val: formatNum(m.reach),     label: 'Alcance',     tip: 'alcance'    },
                        { icon: <Heart size={12} />,        val: formatNum(m.likes),     label: 'Likes',       tip: 'likes'      },
                        { icon: <MessageCircle size={12} />,val: formatNum(m.comments),  label: 'Comentarios', tip: 'comentarios'},
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{item.icon}</span>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1.2 }}>{item.val}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                              {item.label}<InfoTooltip metricKey={item.tip} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Engagement rate badge */}
                    {m.engagement_rate > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                        <Zap size={11} color="#F59E0B" />
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#F59E0B' }}>
                          {m.engagement_rate.toFixed(1)}% engagement rate
                        </span>
                        <InfoTooltip metricKey="engagement" />
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>{m.posts || 0} posts</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>{pct}% del alcance</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: meta.color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tracción global + Mejor hora para publicar */}
          <div style={{ display: 'grid', gridTemplateColumns: bestTimes.length ? '2fr 1fr' : '1fr', gap: '20px', marginBottom: '32px' }}>
            <div className="card-pro chart-card-pro">
              <div className="chart-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 className="chart-title">TRACCIÓN VIRAL (7 DÍAS)</h3>
                  <InfoTooltip metricKey="traccion_viral" />
                </div>
                <div className="chart-period">MÉTRICA LIVE</div>
              </div>
              <TrendChart data={data?.history} />
            </div>

            {bestTimes.length > 0 && (
              <div className="card-pro" style={{ padding: '28px' }}>
                <div className="chart-card-header" style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={14} color="var(--primary)" />
                    <h3 className="chart-title">MEJOR HORA</h3>
                    <InfoTooltip metricKey="best_times" />
                  </div>
                  <div className="chart-period">ENGAGEMENT</div>
                </div>
                <BestTimesChart times={bestTimes} />
              </div>
            )}
          </div>
        </>
      )}

      {/* ── VISTA POR PLATAFORMA ── */}
      {activePlatform !== 'all' && (() => {
        const m = breakdown[activePlatform] || {};
        const meta = PLATFORM_META[activePlatform] || {};
        const isInstagram = activePlatform === 'instagram';
        const isYouTube = activePlatform === 'youtube';

        const kpis = [
          { label: 'Seguidores',  value: formatNum(m.followers), icon: <Users size={18} />,         color: '#818CF8', tip: 'seguidores'  },
          { label: 'Alcance',     value: formatNum(m.reach),     icon: <Eye size={18} />,            color: '#38BDF8', tip: 'alcance'     },
          { label: 'Likes',       value: formatNum(m.likes),     icon: <Heart size={18} />,          color: '#F472B6', tip: 'likes'       },
          { label: 'Comentarios', value: formatNum(m.comments),  icon: <MessageCircle size={18} />,  color: '#34D399', tip: 'comentarios' },
          { label: 'Compartidos', value: formatNum(m.shares),    icon: <Share2 size={18} />,         color: '#FBBF24', tip: 'compartidos' },
          ...(isInstagram ? [{ label: 'Guardados', value: formatNum(m.saves), icon: <Bookmark size={18} />, color: '#A78BFA', tip: 'guardados' }] : []),
        ];

        return (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0 20px' }}>
              <span style={{ fontSize: '28px' }}>{meta.emoji}</span>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{meta.label}</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{m.posts || 0} publicaciones</span>
              {m.engagement_rate > 0 && (
                <span style={{ fontSize: '12px', fontWeight: '800', background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '99px', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={10} /> {m.engagement_rate.toFixed(1)}% ER
                </span>
              )}
            </div>

            <div className="platform-kpi-grid" style={{ marginBottom: '32px' }}>
              {kpis.map((kpi, i) => (
                <div key={i} className="card-pro stat-card-pro">
                  <div className="stat-card-header">
                    <div style={{ background: `${kpi.color}22`, color: kpi.color, padding: '8px', borderRadius: '8px' }}>{kpi.icon}</div>
                  </div>
                  <div className="stat-card-body">
                    <div className="stat-card-value" style={{ color: kpi.color }}>{kpi.value}</div>
                    <div className="stat-card-label" style={{ display: 'flex', alignItems: 'center' }}>
                      {kpi.label}<InfoTooltip metricKey={kpi.tip} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isYouTube && (
              <div className="card-pro" style={{ padding: '16px 20px', marginBottom: '24px', borderLeft: '3px solid #FF0000', fontSize: '12px', color: 'var(--text-muted)' }}>
                ⚠️ Los datos de YouTube tienen un retraso de 2-3 días. El watch time y CTR solo están disponibles en YouTube Studio.
              </div>
            )}
          </>
        );
      })()}

      {/* Tabla de posts */}
      <div className="card-pro content-list-card-pro">
        <div className="chart-card-header" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3 className="chart-title">
              {activePlatform === 'all' ? 'RENDIMIENTO POR PUBLICACIÓN' : `PUBLICACIONES EN ${(PLATFORM_META[activePlatform]?.label || activePlatform).toUpperCase()}`}
            </h3>
            <InfoTooltip metricKey="rendimiento_publicacion" />
          </div>
          {loadingPosts && <Loader2 size={14} className="animate-spin" color="var(--text-muted)" />}
        </div>
        <div className="table-wrapper">
          <table className="posts-table-pro">
            <thead>
              <tr>
                <th>PRODUCCIÓN</th>
                <th>FECHA</th>
                <th>CANALES</th>
                <th style={{ textAlign: 'center' }}>❤️ Likes <InfoTooltip metricKey="likes" /></th>
                <th style={{ textAlign: 'center' }}>💬 Coment. <InfoTooltip metricKey="comentarios" /></th>
                <th style={{ textAlign: 'center' }}>👁 Views <InfoTooltip metricKey="views" /></th>
                <th style={{ textAlign: 'center' }}>🔁 Shares <InfoTooltip metricKey="compartidos" /></th>
                <th style={{ textAlign: 'center' }}>VIRAL <InfoTooltip metricKey="viral_score" /></th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post, idx) => {
                const safePlatforms = Array.isArray(post.platforms) ? post.platforms : [];
                const safeScore = typeof post.viral_score === 'number' ? post.viral_score : 0;
                const likes    = post.likes    ?? post.metrics?.likes    ?? post.metrics?.like_count    ?? 0;
                const comments = post.comments ?? post.metrics?.comments ?? post.metrics?.comment_count ?? 0;
                const views    = post.views    ?? post.metrics?.views    ?? post.metrics?.play_count    ?? post.metrics?.impressions ?? 0;
                const shares   = post.shares   ?? post.metrics?.shares   ?? post.metrics?.share_count   ?? 0;
                const hasData  = likes > 0 || views > 0 || comments > 0;
                return (
                  <tr key={post.id || idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="post-icon-box glass-morph"><Film size={14} color="var(--primary)" /></div>
                        <span className="post-title-cell-pro">{post.title || 'Publicación'}</span>
                      </div>
                    </td>
                    <td className="text-muted" style={{ fontSize: '13px' }}>{post.date ? new Date(post.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : 'N/A'}</td>
                    <td><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{safePlatforms.map(p => <div key={p} className="platform-pill glass-morph" style={{ borderColor: PLATFORM_META[p]?.color + '44' }}>{PLATFORM_META[p]?.emoji || ''} {p}</div>)}</div></td>
                    <td style={{ textAlign: 'center' }}><MetricPill icon={<Heart size={11} />} value={hasData ? formatNum(likes) : '—'} color="#EF4444" /></td>
                    <td style={{ textAlign: 'center' }}><MetricPill icon={<MessageCircle size={11} />} value={hasData ? formatNum(comments) : '—'} color="#6366F1" /></td>
                    <td style={{ textAlign: 'center' }}><MetricPill icon={<Eye size={11} />} value={hasData ? formatNum(views) : '—'} color="#0EA5E9" /></td>
                    <td style={{ textAlign: 'center' }}><MetricPill icon={<Share2 size={11} />} value={hasData ? formatNum(shares) : '—'} color="#10B981" /></td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="score-pill glass-morph" style={{ color: safeScore > 7 ? '#10B981' : 'var(--primary)', borderColor: safeScore > 7 ? 'rgba(16,185,129,0.3)' : 'var(--border-main)' }}>
                        {safeScore.toFixed(1)} <span style={{ fontSize: '10px', opacity: 0.6 }}>/10</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!filteredPosts.length && (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
                  {activePlatform === 'all' ? 'Aún no hay publicaciones con métricas.' : `No hay publicaciones en ${PLATFORM_META[activePlatform]?.label || activePlatform}.`}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .analytics-container { padding-bottom: 40px; }
        .analytics-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; }

        /* Tabs */
        .platform-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 32px; border-bottom: 1px solid var(--border-main); padding-bottom: 0; }
        .platform-tab {
          padding: 10px 18px; background: none; border: none; border-bottom: 2px solid transparent;
          color: var(--text-muted); font-size: 12px; font-weight: 700; cursor: pointer;
          transition: all 0.2s; margin-bottom: -1px; border-radius: 0; white-space: nowrap;
          display: flex; align-items: center; gap: 6px;
        }
        .platform-tab:hover { color: var(--text-main); }
        .platform-tab.active { color: var(--primary); border-bottom-color: var(--primary); }
        .tab-er-badge {
          font-size: 9px; font-weight: 800; background: rgba(245,158,11,0.12);
          color: #F59E0B; border: 1px solid rgba(245,158,11,0.25);
          border-radius: 99px; padding: 1px 6px;
        }

        /* Platform compare grid */
        .platform-compare-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .platform-compare-card { padding: 20px; transition: transform 0.15s, box-shadow 0.15s; }
        .platform-compare-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }

        /* Per-platform KPI grid */
        .platform-kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }

        .stats-section-label { font-size: 11px; font-weight: 700; color: var(--text-muted); margin: 32px 0 16px 0; letter-spacing: 0.05em; }
        .stat-card-pro { padding: 24px; }
        .stat-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .stat-card-value { font-size: 28px; font-weight: 800; color: var(--text-main); font-family: 'Outfit'; margin-bottom: 4px; }
        .stat-card-label { font-size: 13px; font-weight: 600; color: var(--text-muted); }

        /* Best times chart */
        .best-times-chart { display: flex; flex-direction: column; gap: 10px; }
        .best-time-bar { display: grid; grid-template-columns: 72px 1fr 40px; align-items: center; gap: 10px; }
        .best-time-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-align: right; white-space: nowrap; }
        .best-time-track { height: 8px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; }
        .best-time-fill { height: 100%; background: linear-gradient(90deg, var(--primary), #8B5CF6); border-radius: 99px; transition: width 0.6s ease; }
        .best-time-value { font-size: 11px; font-weight: 700; color: var(--text-main); text-align: left; }

        .chart-card-pro, .content-list-card-pro { padding: 40px; border: 1px solid var(--border-main); }
        .chart-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .chart-title { font-size: 14px; font-weight: 900; color: var(--primary); margin: 0; letter-spacing: 0.1em; }
        .chart-period { font-size: 10px; font-weight: 900; color: var(--text-dim); border: 1px solid var(--border-main); padding: 4px 12px; border-radius: 20px; }

        .table-wrapper { overflow-x: auto; }
        .posts-table-pro { width: 100%; border-collapse: collapse; min-width: 700px; }
        .posts-table-pro th { text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 700; color: var(--text-muted); border-bottom: 1px solid var(--border-main); }
        .posts-table-pro td { padding: 12px; border-bottom: 1px solid var(--bg-primary); vertical-align: middle; }
        .post-icon-box { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .post-title-cell-pro { font-weight: 600; color: var(--text-main); font-size: 13px; }
        .platform-pill { padding: 2px 7px; border: 1px solid var(--border-main); border-radius: 4px; font-size: 10px; font-weight: 700; color: var(--text-muted); }
        .score-pill { display: inline-block; padding: 3px 10px; border: 1px solid var(--border-main); border-radius: 8px; font-size: 12px; font-weight: 700; }
        .metric-pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; border: 1px solid; font-size: 12px; font-weight: 700; }
        .metric-pill-value { color: var(--text-main); }
        .metric-pill-label { color: var(--text-muted); font-size: 10px; }

        /* Insight card */
        .insight-card { padding: 28px; margin-bottom: 28px; border-left: 3px solid var(--primary); }
        .insight-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
        .insight-title { font-size: 14px; font-weight: 700; color: var(--text-main); }
        .insight-badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; border: 1px solid; }
        .insight-body { display: grid; grid-template-columns: 1fr 1px 1fr; gap: 24px; }
        .insight-divider { background: var(--border-main); }
        .insight-col { display: flex; flex-direction: column; gap: 12px; }
        .insight-col-title { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: var(--text-muted); letter-spacing: 0.05em; text-transform: uppercase; }
        .insight-item { display: flex; gap: 8px; font-size: 13px; color: var(--text-main); line-height: 1.5; }
        .insight-item.decision { color: #4ADE80; }
        .insight-best-post { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-main); display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

        @media (max-width: 1024px) {
          .platform-kpi-grid { grid-template-columns: repeat(3, 1fr); }
          .insight-body { grid-template-columns: 1fr; }
          .insight-divider { display: none; }
        }
        @media (max-width: 768px) {
          .analytics-header { flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
          .platform-kpi-grid { grid-template-columns: 1fr 1fr; }
          .chart-card-pro, .content-list-card-pro { padding: 20px 16px; margin: 0 0 24px 0; border-radius: 16px; }
          .stat-card-pro { padding: 20px; }
          .stat-card-value { font-size: 22px; }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsView;
