import { useState, useEffect } from 'react';
import { TrendingUp, Users, Eye, Heart, Loader2, BarChart3 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const getToken = () => { const u = localStorage.getItem('vidalis_user'); return u ? JSON.parse(u).token : ''; };
const headers = () => ({ 'Authorization': `Bearer ${getToken()}` });

const METRICS = [
  { key: 'followers', label: 'Seguidores', icon: Users, color: '#4F46E5' },
  { key: 'total_views', label: 'Vistas', icon: Eye, color: '#38BDF8' },
  { key: 'total_likes', label: 'Likes', icon: Heart, color: '#EF4444' },
  { key: 'engagement_rate', label: 'Engagement', icon: BarChart3, color: '#10B981' },
];

const GrowthChart = ({ artistId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [activeMetric, setActiveMetric] = useState('followers');

  useEffect(() => { if (artistId) fetchGrowth(); }, [artistId, days]);

  const fetchGrowth = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/vidalis/growth/${artistId}?days=${days}`, { headers: headers() });
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const metric = METRICS.find(m => m.key === activeMetric);
  const values = data.map(d => parseFloat(d[activeMetric]) || 0);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;

  const firstVal = values[0] || 0;
  const lastVal = values[values.length - 1] || 0;
  const growth = firstVal > 0 ? (((lastVal - firstVal) / firstVal) * 100).toFixed(1) : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div style={{ background: '#1C1C1F', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
            <TrendingUp size={20} color="#10B981" />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: '800', color: '#FAFAFA', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Historial de Crecimiento</h2>
            <p style={{ color: '#71717A', fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', fontWeight: '500' }}>Evolución de tus métricas</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: '#1C1C1F', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)} style={{
              padding: '6px 12px', borderRadius: '8px', border: 'none',
              background: days === d ? '#4F46E5' : 'transparent', color: days === d ? '#fff' : '#71717A',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer'
            }}>{d}d</button>
          ))}
        </div>
      </div>

      {/* Metric selector */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {METRICS.map(m => (
          <button key={m.key} onClick={() => setActiveMetric(m.key)} style={{
            padding: '8px 14px', borderRadius: '10px',
            border: `1px solid ${activeMetric === m.key ? m.color : 'rgba(255,255,255,0.06)'}`,
            background: activeMetric === m.key ? `${m.color}15` : '#111113',
            color: activeMetric === m.key ? m.color : '#71717A',
            fontSize: '12px', fontWeight: '700', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s',
            flex: '1 1 auto', justifyContent: 'center', minWidth: '0'
          }}>
            <m.icon size={13} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#71717A' }}>
          <Loader2 className="animate-spin" size={28} style={{ margin: '0 auto 12px', color: '#4F46E5' }} />
        </div>
      ) : data.length === 0 ? (
        <div className="card-pro" style={{ textAlign: 'center', padding: '60px 30px' }}>
          <BarChart3 size={40} style={{ color: '#27272A', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FAFAFA', marginBottom: '8px' }}>Sin datos de crecimiento</h3>
          <p style={{ color: '#71717A', fontSize: '14px' }}>Los datos se capturan automáticamente cada día. Sincroniza tus redes para empezar.</p>
        </div>
      ) : (
        <>
          {/* Stats summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
            <div className="card-pro" style={{ padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#52525B', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Actual</div>
              <div style={{ fontSize: 'clamp(16px, 3vw, 22px)', fontWeight: '900', color: '#FAFAFA' }}>
                {activeMetric === 'engagement_rate' ? `${lastVal.toFixed(1)}%` : lastVal.toLocaleString()}
              </div>
            </div>
            <div className="card-pro" style={{ padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#52525B', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Cambio</div>
              <div style={{ fontSize: 'clamp(16px, 3vw, 22px)', fontWeight: '900', color: growth >= 0 ? '#10B981' : '#EF4444' }}>
                {growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}%
              </div>
            </div>
            <div className="card-pro" style={{ padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#52525B', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Máximo</div>
              <div style={{ fontSize: 'clamp(16px, 3vw, 22px)', fontWeight: '900', color: '#FAFAFA' }}>
                {activeMetric === 'engagement_rate' ? `${maxVal.toFixed(1)}%` : maxVal.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="card-pro" style={{ padding: 'clamp(12px, 3vw, 24px)' }}>
            <div style={{ height: 'clamp(140px, 25vw, 200px)', display: 'flex', alignItems: 'flex-end', gap: '1px' }}>
              {values.map((v, i) => {
                const h = ((v - minVal) / range) * 100;
                return (
                  <div key={i} title={`${data[i]?.snapshot_date}: ${v}`} style={{
                    flex: 1, minWidth: '2px', borderRadius: '3px 3px 0 0',
                    height: `${Math.max(h, 2)}%`,
                    background: `linear-gradient(180deg, ${metric.color}, ${metric.color}60)`,
                    opacity: 0.8, transition: 'height 0.5s ease',
                    cursor: 'crosshair'
                  }} />
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: '#3F3F46', fontWeight: '600' }}>
              <span>{data[0]?.snapshot_date}</span>
              <span>{data[data.length - 1]?.snapshot_date}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GrowthChart;
