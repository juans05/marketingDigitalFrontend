import { useState, useEffect } from 'react';
import { Sparkles, BarChart3, Upload, Loader2, TrendingUp, Users, Film } from 'lucide-react';

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

  const areaD = `${pathD} L ${points[points.length-1].x} ${height} L ${points[0].x} ${height} Z`;

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
          <span key={i}>{d.date.split('-').reverse()[0]} {['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][parseInt(d.date.split('-')[1])-1]}</span>
        ))}
      </div>
      <style>{`
        .chart-wrapper { width: 100%; height: 280px; position: relative; margin-top: 32px; }
        .chart-labels { display: flex; justify-content: space-between; padding: 16px 0; color: var(--text-dim); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
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
        <Loader2 className="animate-spin" size={32} style={{ color: 'var(--primary)' }} />
        <p style={{ marginTop: '20px', color: 'var(--text-dim)', fontSize: '13px', fontWeight: '700', letterSpacing: '0.1em' }}>SINCRONIZANDO MÉTRICAS...</p>
      </div>
    );
  }

  const kpis = [
    { label: 'Impacto Viral', value: data?.avgScore ? data.avgScore.toFixed(1) : '0.0', trend: data?.trend || '+12%', icon: <Sparkles size={18} /> },
    { label: 'Alcance Bruto', value: formatNumber(data?.totalReach), trend: '+18.5%', icon: <BarChart3 size={18} /> },
    { label: 'Publicaciones', value: data?.published || 0, trend: `+${data?.total || 0}`, icon: <Upload size={18} /> },
  ];

  const communityKpis = [
    { label: 'Seguidores', value: formatNumber(data?.followersTotal), trend: '+2.4k', icon: <Users size={16} /> },
    { label: 'Crecimiento Hoy', value: `+${data?.followersDaily || 0}`, trend: 'vavg', icon: <TrendingUp size={16} /> },
    { label: 'Retención IA', value: `${data?.followersPerPost || 0}%`, trend: 'alta', icon: <Sparkles size={16} /> },
    { label: 'Posts / Día', value: data?.postsDaily || 0, trend: 'estándar', icon: <Upload size={16} /> },
  ];

  return (
    <div className="analytics-container animate-fade-in">
      <div className="analytics-header">
        <div>
          <h2 className="gradient-text" style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px' }}>Estrategia de Crecimiento</h2>
          <p className="section-subtitle">Inteligencia de datos para maximizar tu impacto orgánico.</p>
        </div>
        <button className="btn-primary glass-morph" onClick={fetchStats} disabled={loading} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-main)', height: '40px' }}>
           {loading ? 'Sincronizando...' : 'Refrescar Datos'}
        </button>
      </div>

      <div className="stats-section-label">KPIs DE RENDIMIENTO GLOBAL</div>
      <div className="stats-grid">
        {kpis.map((kpi, i) => (
          <div key={i} className="card-pro stat-card-pro">
            <div className="stat-card-header">
              <div className="stat-card-icon-box">{kpi.icon}</div>
              <span className="stat-card-trend-box up">
                <TrendingUp size={12} /> {kpi.trend}
              </span>
            </div>
            <div className="stat-card-body">
              <div className="stat-card-value accent-text">{kpi.value}</div>
              <div className="stat-card-label">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="stats-section-label">AUDIENCIA Y COMUNIDAD</div>
      <div className="community-grid">
        {communityKpis.map((kpi, i) => (
          <div key={i} className="mini-stat-card-pro card-pro glass-morph">
            <div className="mini-label">{kpi.label}</div>
            <div className="mini-val">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="card-pro chart-card-pro" style={{ marginBottom: '32px' }}>
        <div className="chart-card-header">
          <h3 className="chart-title">TRACCIÓN VIRAL (7 DÍAS)</h3>
          <div className="chart-period">MÉTRICA LIVE</div>
        </div>
        <TrendChart data={data?.history} />
      </div>

      <div className="card-pro content-list-card-pro">
        <div className="chart-card-header" style={{ marginBottom: '32px' }}>
          <h3 className="chart-title">REGISTRO DE IMPACTO</h3>
        </div>
        
        <div className="table-wrapper">
          <table className="posts-table-pro">
            <thead>
              <tr>
                <th>PRODUCCIÓN</th>
                <th>LATENCIA / FECHA</th>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="post-icon-box glass-morph">
                          <Film size={14} color="var(--primary)" />
                        </div>
                        <span className="post-title-cell-pro">{post.title || 'Inyección de Contenido'}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-dim)', fontSize: '13px', fontWeight: '600' }}>
                      {post.date ? new Date(post.date).toLocaleDateString() : 'Pendiente'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                         {safePlatforms.map(p => (
                           <div key={p} className="platform-pill glass-morph">{p}</div>
                         ))}
                      </div>
                    </td>
                    <td>
                      <div className="score-pill glass-morph" style={{ 
                        color: safeScore > 7 ? '#10B981' : 'var(--primary)',
                        borderColor: safeScore > 7 ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-main)'
                      }}>
                        {safeScore.toFixed(1)} <span style={{ fontSize: '10px', opacity: 0.6 }}>/10</span>
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
        .analytics-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; border-bottom: 1px solid var(--border-main); padding-bottom: 24px; }
        .section-subtitle { color: var(--text-dim); font-size: 15px; margin: 0; font-weight: 600; }
        
        .stats-section-label { font-size: 11px; font-weight: 900; color: var(--text-dim); margin: 40px 0 20px 0; letter-spacing: 0.15em; filter: brightness(1.5); }

        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px; }
        .community-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
        
        .stat-card-pro { padding: 32px; border: 1px solid var(--border-main); }
        .stat-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .stat-card-icon-box { background: rgba(79, 70, 229, 0.1); color: var(--primary); padding: 10px; border-radius: 12px; }
        .stat-card-trend-box { 
          display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800; padding: 6px 12px; border-radius: 20px;
        }
        .stat-card-trend-box.up { background: rgba(16, 185, 129, 0.1); color: #10B981; }

        .stat-card-value { font-size: 42px; font-weight: 900; color: var(--text-main); font-family: var(--font-heading); margin-bottom: 4px; letter-spacing: -0.02em; }
        .stat-card-label { font-size: 14px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; }

        .mini-stat-card-pro { padding: 20px; text-align: left; border: 1px solid var(--border-main); }
        .mini-val { font-size: 20px; font-weight: 800; color: var(--text-main); margin-top: 4px; }
        .mini-label { font-size: 11px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; }

        .chart-card-pro, .content-list-card-pro { padding: 40px; border: 1px solid var(--border-main); }
        .chart-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .chart-title { font-size: 14px; font-weight: 900; color: var(--text-main); margin: 0; letter-spacing: 0.1em; color: var(--primary); }
        .chart-period { font-size: 10px; font-weight: 900; color: var(--text-dim); border: 1px solid var(--border-main); padding: 4px 12px; border-radius: 20px; }

        .table-wrapper { overflow-x: auto; }
        .posts-table-pro { width: 100%; border-collapse: collapse; min-width: 800px; }
        .posts-table-pro th { text-align: left; padding: 16px; font-size: 11px; font-weight: 900; color: var(--text-dim); border-bottom: 1px solid var(--border-main); letter-spacing: 0.1em; }
        .posts-table-pro td { padding: 20px 16px; border-bottom: 1px solid var(--bg-secondary); }
        
        .post-icon-box { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .post-title-cell-pro { font-weight: 800; color: var(--text-main); font-size: 15px; }
        
        .platform-pill { padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; color: var(--text-dim); text-transform: uppercase; border: 1px solid var(--border-main); }
        .score-pill { display: inline-flex; align-items: center; gap: 4px; padding: 6px 16px; border: 1px solid var(--border-main); border-radius: 12px; font-size: 14px; font-weight: 900; }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: 1fr; }
          .community-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsView;
