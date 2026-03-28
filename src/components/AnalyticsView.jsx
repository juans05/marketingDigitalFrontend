import { useState, useEffect } from 'react';
import { Sparkles, BarChart3, Upload, Loader2, TrendingUp, TrendingDown, Users, Film } from 'lucide-react';

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

  // Cubic Bezier curve path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cp1x = curr.x + (next.x - curr.x) / 2;
    pathD += ` C ${cp1x} ${curr.y}, ${cp1x} ${next.y}, ${next.x} ${next.y}`;
  }

  const areaD = `${pathD} L ${points[points.length-1].x} ${height} L ${points[0].x} ${height} Z`;

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
          <span key={i}>{d.date.split('-').reverse()[0]} {['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][parseInt(d.date.split('-')[1])-1]}</span>
        ))}
      </div>
      <style>{`
        .chart-wrapper { width: 100%; height: 280px; position: relative; margin-top: 24px; padding: 0 10px; }
        .chart-labels { display: flex; justify-content: space-between; padding: 16px 0; color: var(--text-muted); font-size: 11px; font-weight: 600; }
      `}</style>
    </div>
  );
};

const AnalyticsView = ({ userId, activeArtist }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [userId, activeArtist]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const url = new URL(`${import.meta.env.VITE_API_URL}/api/vidalis/stats/${userId}`);
      if (activeArtist?.id) {
        url.searchParams.append('artistId', activeArtist.id);
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Analytics Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num || 0;
  };

  if (loading && !data) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
        <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>Actualizando métricas...</p>
      </div>
    );
  }

  const kpis = [
    { label: 'Impacto Viral', value: data?.avgScore ? data.avgScore.toFixed(1) : '0.0', trend: data?.trend || '+12%', icon: <Sparkles size={18} /> },
    { label: 'Alcance Bruto', value: formatNumber(data?.totalReach), trend: '+18.5%', icon: <BarChart3 size={18} /> },
    { label: 'Publicaciones', value: data?.published || 0, trend: `+${data?.total || 0}`, icon: <Upload size={18} /> },
  ];

  const communityKpis = [
    { label: 'Seguidores', value: formatNumber(data?.followersTotal), trend: '+2.4k', icon: <Users size={18} /> },
    { label: 'Seguidores Diarios', value: `+${data?.followersDaily || 0}`, trend: 'vavg', icon: <TrendingUp size={18} /> },
    { label: 'Seg. por Publicación', value: data?.followersPerPost || 0, trend: 'alta', icon: <Sparkles size={18} /> },
    { label: 'Posts Diarios (Prom)', value: data?.postsDaily || 0, trend: 'estándar', icon: <Upload size={18} /> },
  ];

  return (
    <div className="analytics-container animate-fade-in">
      <div className="analytics-header">
        <div>
          <h2 className="section-title">Análisis de Crecimiento</h2>
          <p className="section-subtitle">Métricas consolidadas de tus canales activos.</p>
        </div>
        <button className="btn-secondary" onClick={fetchStats} disabled={loading} style={{fontSize: '13px'}}>
           {loading ? 'Cargando...' : 'Sincronizar Datos'}
        </button>
      </div>

      <div className="stats-section-label">RESUMEN DE RENDIMIENTO</div>
      <div className="stats-grid">
        {kpis.map((kpi, i) => (
          <div key={i} className="card-pro stat-card-pro">
            <div className="stat-card-header">
              <div className="stat-card-icon-box">{kpi.icon}</div>
              <span className={`stat-card-trend-box up`}>
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

      <div className="stats-section-label">KPIs DE COMUNIDAD</div>
      <div className="community-grid">
        {communityKpis.map((kpi, i) => (
          <div key={i} className="mini-stat-card-pro card-pro">
            <div className="mini-label">{kpi.label}</div>
            <div className="mini-val">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="card-pro chart-card-pro">
        <div className="chart-card-header">
          <h3 className="chart-title">CURVA DE ALCANCE (REACH)</h3>
          <div className="chart-period">ÚLTIMOS 7 DÍAS</div>
        </div>
        <TrendChart data={data?.history} />
      </div>

      <div className="card-pro content-list-card-pro">
        <div className="chart-card-header" style={{ marginBottom: '24px' }}>
          <h3 className="chart-title">CONTENIDO PUBLICADO</h3>
        </div>
        
        <div className="table-wrapper">
          <table className="posts-table-pro">
            <thead>
              <tr>
                <th>CONTENIDO</th>
                <th>FECHA</th>
                <th>CANALES</th>
                <th>VIRAL SCORE</th>
              </tr>
            </thead>
            <tbody>
              {(data?.postList || []).map((post, idx) => {
                const safePlatforms = Array.isArray(post.platforms) ? post.platforms : [];
                const safeScore = typeof post.viral_score === 'number' ? post.viral_score : 0;
                
                return (
                  <tr key={post.id || idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="post-icon-box">
                          <Film size={14} />
                        </div>
                        <span className="post-title-cell-pro">{post.title || 'Video sin título'}</span>
                      </div>
                    </td>
                    <td className="text-muted" style={{fontSize: '13px'}}>{post.date ? new Date(post.date).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                         {safePlatforms.map(p => (
                           <div key={p} className="platform-pill">{p}</div>
                         ))}
                      </div>
                    </td>
                    <td>
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
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .analytics-container { padding-bottom: 40px; }
        .analytics-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
        .section-subtitle { color: var(--text-muted); font-size: 14px; margin: 0; font-weight: 500; }
        
        .stats-section-label { font-size: 11px; font-weight: 700; color: var(--text-muted); margin: 32px 0 16px 0; letter-spacing: 0.05em; }

        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
        .community-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        
        .stat-card-pro { padding: 24px; }
        .stat-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .stat-card-icon-box { background: #EEF2FF; color: var(--primary); padding: 8px; border-radius: 8px; }
        .stat-card-trend-box { 
          display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 20px;
        }
        .stat-card-trend-box.up { background: #F0FDF4; color: #16A34A; }

        .stat-card-value { font-size: 32px; font-weight: 800; color: var(--text-main); font-family: 'Outfit'; margin-bottom: 4px; }
        .stat-card-label { font-size: 13px; font-weight: 600; color: var(--text-muted); }

        .mini-stat-card-pro { padding: 16px; text-align: left; }
        .mini-val { font-size: 18px; font-weight: 700; color: var(--text-main); }
        .mini-label { font-size: 12px; font-weight: 500; color: var(--text-muted); margin-bottom: 2px; }

        .chart-card-pro, .content-list-card-pro { padding: 32px; margin-bottom: 24px; }
        .chart-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .chart-title { font-size: 13px; font-weight: 700; color: var(--text-main); margin: 0; letter-spacing: 0.05em; }
        .chart-period { font-size: 11px; font-weight: 600; color: var(--text-muted); background: var(--bg-primary); padding: 4px 10px; border-radius: 20px; border: 1px solid var(--border-main); }

        .table-wrapper { overflow-x: auto; }
        .posts-table-pro { width: 100%; border-collapse: collapse; min-width: 700px; }
        .posts-table-pro th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 700; color: var(--text-muted); border-bottom: 1px solid var(--border-main); }
        .posts-table-pro td { padding: 16px; border-bottom: 1px solid var(--bg-primary); }
        
        .post-icon-box { width: 32px; height: 32px; background: var(--bg-primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
        .post-title-cell-pro { font-weight: 600; color: var(--text-main); font-size: 14px; }
        
        .platform-pill { padding: 2px 8px; background: #F3F4F6; border-radius: 4px; font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        .score-pill { display: inline-block; padding: 4px 12px; border: 1px solid var(--border-main); border-radius: 8px; font-size: 12px; font-weight: 700; }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: 1fr; }
          .community-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsView;
