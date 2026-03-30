import { useState, useEffect } from 'react';
import {
  Sparkles, BarChart3, Upload, Loader2, TrendingUp, Users, Film,
  Heart, MessageCircle, Eye, Share2, Lightbulb, Target, AlertCircle, RefreshCw
} from 'lucide-react';

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
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#chartGradient)" />
        <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="6" fill="#FFF" stroke="var(--primary)" strokeWidth="2.5" />
        ))}
      </svg>
      <div className="chart-labels">
        {data.map((d, i) => (
          <span key={i}>
            {d.date.split('-').reverse()[0]}{' '}
            {['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][parseInt(d.date.split('-')[1]) - 1]}
          </span>
        ))}
      </div>
      <style>{`
        .chart-wrapper { width: 100%; height: 280px; position: relative; margin-top: 24px; padding: 0 10px; }
        .chart-labels { display: flex; justify-content: space-between; padding: 16px 0; color: var(--text-muted); font-size: 11px; font-weight: 600; }
      `}</style>
    </div>
  );
};

const MetricPill = ({ icon, value, label, color = '#6366F1' }) => (
  <div className="metric-pill" style={{ borderColor: `${color}22`, background: `${color}08` }}>
    <span style={{ color }}>{icon}</span>
    <span className="metric-pill-value">{value}</span>
    <span className="metric-pill-label">{label}</span>
  </div>
);

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
            <div className="insight-badge" style={{ background: '#F0FDF4', color: '#16A34A', borderColor: '#BBF7D0' }}>
              Mejor: {bestPlatform}
            </div>
          )}
          {engagementRate > 0 && (
            <div className="insight-badge" style={{ background: '#EEF2FF', color: 'var(--primary)', borderColor: '#C7D2FE' }}>
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

const AnalyticsView = ({ userId, activeArtist }) => {
  const [data, setData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    fetchStats();
    if (activeArtist?.id) {
      fetchPostMetrics(activeArtist.id);
    }
  }, [userId, activeArtist]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const url = new URL(`${import.meta.env.VITE_API_URL}/api/vidalis/stats/${userId}`);
      if (activeArtist?.id) url.searchParams.append('artistId', activeArtist.id);
      const res = await fetch(url);
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/analytics-posts/${artistId}`);
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/analytics-insights/${activeArtist.id}`);
      if (res.ok) {
        const json = await res.json();
        setInsights(json);
        // Mergear métricas reales a los posts si vinieron del endpoint
        if (json.posts?.length) setPosts(json.posts);
      }
    } catch (err) {
      console.error('Insights error:', err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const formatNum = (n) => {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  };

  const handleSync = () => {
    fetchStats();
    if (activeArtist?.id) fetchPostMetrics(activeArtist.id);
  };

  const loading = loadingStats && !data;

  if (loading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
        <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>Cargando métricas...</p>
      </div>
    );
  }

  const kpis = [
    { label: 'Impacto Viral', value: data?.avgScore ? data.avgScore.toFixed(1) : '0.0', trend: data?.trend || '—', icon: <Sparkles size={18} /> },
    { label: 'Alcance Bruto', value: formatNum(data?.totalReach), trend: '+reach', icon: <BarChart3 size={18} /> },
    { label: 'Publicaciones', value: data?.published || 0, trend: `total: ${data?.total || 0}`, icon: <Upload size={18} /> },
  ];

  const communityKpis = [
    { label: 'Seguidores', value: formatNum(data?.followersTotal), icon: <Users size={14} /> },
    { label: 'Seg. Diarios', value: `+${data?.followersDaily || 0}`, icon: <TrendingUp size={14} /> },
    { label: 'Seg./Publicación', value: data?.followersPerPost || 0, icon: <Sparkles size={14} /> },
    { label: 'Posts/Día (prom)', value: data?.postsDaily || 0, icon: <Upload size={14} /> },
  ];

  return (
    <div className="analytics-container animate-fade-in">
      <div className="analytics-header">
        <div>
          <h2 className="section-title">Dashboard de Analítica</h2>
          <p className="section-subtitle">Métricas reales de tus canales + decisiones IA.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={handleSync} disabled={loadingStats || loadingPosts} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={13} className={loadingStats ? 'animate-spin' : ''} />
            Sincronizar
          </button>
          {activeArtist?.id && (
            <button
              className="btn-primary"
              onClick={fetchInsights}
              disabled={loadingInsights}
              style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={13} />
              {loadingInsights ? 'Analizando...' : 'Analizar con IA'}
            </button>
          )}
        </div>
      </div>

      {/* Insights IA */}
      {(loadingInsights || insights) && (
        <InsightCard
          insights={insights?.insights}
          decisions={insights?.decisions}
          bestPlatform={insights?.best_platform}
          bestPostTitle={insights?.best_post_title}
          engagementRate={insights?.engagement_rate}
          loading={loadingInsights}
        />
      )}

      {/* KPIs principales */}
      <div className="stats-section-label">RESUMEN DE RENDIMIENTO</div>
      <div className="stats-grid">
        {kpis.map((kpi, i) => (
          <div key={i} className="card-pro stat-card-pro">
            <div className="stat-card-header">
              <div className="stat-card-icon-box">{kpi.icon}</div>
              <span className="stat-card-trend-box up">
                <TrendingUp size={12} />
                {kpi.trend}
              </span>
            </div>
            <div className="stat-card-body">
              <div className="stat-card-value">{kpi.value}</div>
              <div className="stat-card-label">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* KPIs comunidad */}
      <div className="stats-section-label">KPIs DE COMUNIDAD</div>
      <div className="community-grid">
        {communityKpis.map((kpi, i) => (
          <div key={i} className="mini-stat-card-pro card-pro">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--text-muted)' }}>
              {kpi.icon}
              <span className="mini-label">{kpi.label}</span>
            </div>
            <div className="mini-val">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Curva de alcance */}
      <div className="card-pro chart-card-pro">
        <div className="chart-card-header">
          <h3 className="chart-title">CURVA DE ALCANCE (REACH)</h3>
          <div className="chart-period">ÚLTIMOS 7 DÍAS</div>
        </div>
        <TrendChart data={data?.history} />
      </div>

      {/* Tabla de posts con métricas reales */}
      <div className="card-pro content-list-card-pro">
        <div className="chart-card-header" style={{ marginBottom: '24px' }}>
          <h3 className="chart-title">RENDIMIENTO POR PUBLICACIÓN</h3>
          {loadingPosts && <Loader2 size={14} className="animate-spin" color="var(--text-muted)" />}
        </div>

        <div className="table-wrapper">
          <table className="posts-table-pro">
            <thead>
              <tr>
                <th>CONTENIDO</th>
                <th>FECHA</th>
                <th>CANALES</th>
                <th style={{ textAlign: 'center' }}>❤️ Likes</th>
                <th style={{ textAlign: 'center' }}>💬 Comments</th>
                <th style={{ textAlign: 'center' }}>👁 Views</th>
                <th style={{ textAlign: 'center' }}>🔁 Shares</th>
                <th style={{ textAlign: 'center' }}>VIRAL</th>
              </tr>
            </thead>
            <tbody>
              {(posts.length ? posts : data?.postList || []).map((post, idx) => {
                const safePlatforms = Array.isArray(post.platforms) ? post.platforms : [];
                const safeScore = typeof post.viral_score === 'number' ? post.viral_score : 0;
                const hasRealMetrics = post.metrics !== undefined || post.likes !== undefined;
                const likes = post.likes ?? post.metrics?.likes ?? post.metrics?.like_count ?? '—';
                const comments = post.comments ?? post.metrics?.comments ?? post.metrics?.comment_count ?? '—';
                const views = post.views ?? post.metrics?.views ?? post.metrics?.play_count ?? post.metrics?.impressions ?? '—';
                const shares = post.shares ?? post.metrics?.shares ?? post.metrics?.share_count ?? '—';

                return (
                  <tr key={post.id || idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="post-icon-box"><Film size={14} /></div>
                        <span className="post-title-cell-pro">{post.title || 'Sin título'}</span>
                      </div>
                    </td>
                    <td className="text-muted" style={{ fontSize: '13px' }}>
                      {post.date || post.published_at || post.created_at
                        ? new Date(post.date || post.published_at || post.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
                        : 'N/A'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {safePlatforms.map(p => <div key={p} className="platform-pill">{p}</div>)}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <MetricPill icon={<Heart size={11} />} value={formatNum(likes)} label="" color="#EF4444" />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <MetricPill icon={<MessageCircle size={11} />} value={formatNum(comments)} label="" color="#6366F1" />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <MetricPill icon={<Eye size={11} />} value={formatNum(views)} label="" color="#0EA5E9" />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <MetricPill icon={<Share2 size={11} />} value={formatNum(shares)} label="" color="#10B981" />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="score-pill" style={{
                        background: safeScore > 7 ? '#F0FDF4' : '#F9FAFB',
                        color: safeScore > 7 ? '#16A34A' : 'var(--text-main)',
                        borderColor: safeScore > 7 ? '#BBF7D0' : 'var(--border-main)'
                      }}>
                        {safeScore.toFixed(1)}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!posts.length && !data?.postList?.length && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
                    Aún no hay publicaciones con métricas disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .analytics-container { padding-bottom: 40px; }
        .analytics-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
        .section-subtitle { color: var(--text-muted); font-size: 14px; margin: 0; font-weight: 500; }

        .stats-section-label { font-size: 11px; font-weight: 700; color: var(--text-muted); margin: 28px 0 14px; letter-spacing: 0.05em; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
        .community-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }

        .stat-card-pro { padding: 24px; }
        .stat-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .stat-card-icon-box { background: #EEF2FF; color: var(--primary); padding: 8px; border-radius: 8px; }
        .stat-card-trend-box { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 20px; }
        .stat-card-trend-box.up { background: #F0FDF4; color: #16A34A; }
        .stat-card-value { font-size: 32px; font-weight: 800; color: var(--text-main); font-family: 'Outfit'; margin-bottom: 4px; }
        .stat-card-label { font-size: 13px; font-weight: 600; color: var(--text-muted); }

        .mini-stat-card-pro { padding: 16px; }
        .mini-val { font-size: 18px; font-weight: 700; color: var(--text-main); }
        .mini-label { font-size: 12px; font-weight: 500; color: var(--text-muted); }

        .chart-card-pro, .content-list-card-pro { padding: 32px; margin-bottom: 24px; }
        .chart-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .chart-title { font-size: 13px; font-weight: 700; color: var(--text-main); margin: 0; letter-spacing: 0.05em; }
        .chart-period { font-size: 11px; font-weight: 600; color: var(--text-muted); background: var(--bg-primary); padding: 4px 10px; border-radius: 20px; border: 1px solid var(--border-main); }

        .table-wrapper { overflow-x: auto; }
        .posts-table-pro { width: 100%; border-collapse: collapse; min-width: 800px; }
        .posts-table-pro th { text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 700; color: var(--text-muted); border-bottom: 1px solid var(--border-main); }
        .posts-table-pro td { padding: 12px; border-bottom: 1px solid var(--bg-primary); vertical-align: middle; }
        .post-icon-box { width: 32px; height: 32px; background: var(--bg-primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); flex-shrink: 0; }
        .post-title-cell-pro { font-weight: 600; color: var(--text-main); font-size: 13px; }
        .platform-pill { padding: 2px 7px; background: #F3F4F6; border-radius: 4px; font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
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
        .insight-item.decision { color: #15803D; }
        .insight-best-post { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-main); display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: 1fr; }
          .community-grid { grid-template-columns: 1fr 1fr; }
          .insight-body { grid-template-columns: 1fr; }
          .insight-divider { display: none; }
        }
        @media (max-width: 768px) {
          .analytics-header { flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
          .analytics-header > div:last-child { width: 100%; display: flex; flex-direction: column; gap: 10px; }
          .analytics-header > div:last-child button { width: 100%; justify-content: center; height: 44px; }
          
          .chart-wrapper { height: 220px; padding: 0; }
          .chart-card-pro, .content-list-card-pro { 
            padding: 20px 16px; 
            margin: 0 0 24px 0; 
            border-radius: 16px;
            width: 100%; 
            max-width: 100%;
          }
          .stat-card-pro { padding: 20px; }
          
          .community-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
          .mini-stat-card-pro { padding: 12px; }
          .mini-val { font-size: 16px; }
          
          .insight-card { padding: 20px 16px; margin-left: -20px; margin-right: -20px; border-radius: 0; border-right: 0; width: calc(100% + 40px); max-width: 100vw; }
          .insight-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .insight-badge { align-self: flex-start; }
          
          .posts-table-pro th, .posts-table-pro td { white-space: nowrap; padding: 12px 10px; }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsView;
