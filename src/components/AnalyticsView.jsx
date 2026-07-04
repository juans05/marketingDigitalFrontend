import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles, BarChart3, Loader2, TrendingUp, Users, Film,
  Heart, MessageCircle, Eye, Share2, Lightbulb, Target, AlertCircle,
  RefreshCw, Bookmark, Clock, Zap, Info, ArrowUpRight, ArrowDownRight,
  MousePointerClick, UserPlus, UserMinus, Timer, Activity
} from 'lucide-react';

// ── Tooltip with portal ──────────────────────────────────────────────────────
const InfoTooltip = ({ text }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const iconRef = useRef(null);
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
    <span style={{
      position: 'fixed', top: coords.top, left: coords.left,
      transform: 'translate(-50%, -100%)', zIndex: 99999,
      background: 'rgba(15,15,20,0.97)', border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '10px', padding: '10px 14px', fontSize: '12px', lineHeight: '1.6',
      color: '#E2E8F0', maxWidth: '260px', width: 'max-content',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)', pointerEvents: 'none',
    }}>
      {text}
      <span style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid rgba(15,15,20,0.97)' }} />
    </span>,
    document.body
  ) : null;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span ref={iconRef} onMouseEnter={show} onMouseLeave={hide} onClick={toggle}
        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', color: 'var(--text-dim)', marginLeft: '4px', opacity: 0.5 }}>
        <Info size={11} />
      </span>
      {tooltip}
    </span>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (!n || n === 0) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
};

const pct = (n) => {
  if (typeof n !== 'number') return '0%';
  return n.toFixed(1) + '%';
};

const PLATFORM_META = {
  instagram: { label: 'Instagram', emoji: '📸', color: '#E1306C', bg: 'rgba(225,48,108,0.1)' },
  tiktok:    { label: 'TikTok',    emoji: '🎵', color: '#69C9D0', bg: 'rgba(105,201,208,0.1)' },
  youtube:   { label: 'YouTube',   emoji: '▶',  color: '#FF0000', bg: 'rgba(255,0,0,0.1)' },
  facebook:  { label: 'Facebook',  emoji: '📘', color: '#1877F2', bg: 'rgba(24,119,242,0.1)' },
};

// ── KPI Card ─────────────────────────────────────────────────────────────────
const KPICard = ({ icon, value, label, explanation, color = '#818CF8', trend, small }) => (
  <div style={{
    padding: small ? '14px' : '20px', borderRadius: '14px',
    background: '#111113', border: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', flexDirection: 'column', gap: '8px',
    transition: 'border-color 0.2s',
  }}
    onMouseEnter={e => e.currentTarget.style.borderColor = `${color}44`}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ background: `${color}18`, color, padding: '6px', borderRadius: '8px', display: 'flex' }}>{icon}</div>
      {trend !== undefined && trend !== 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', fontWeight: '700', color: trend > 0 ? '#10B981' : '#EF4444' }}>
          {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div style={{ fontSize: small ? '20px' : '26px', fontWeight: '800', color: '#FAFAFA', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: '11px', fontWeight: '600', color: '#71717A', display: 'flex', alignItems: 'center' }}>
      {label}<InfoTooltip text={explanation} />
    </div>
  </div>
);

// ── Content Decay Chart ──────────────────────────────────────────────────────
const ContentDecayChart = ({ buckets, color = '#818CF8' }) => {
  if (!buckets || buckets.length === 0) return null;
  const maxPct = Math.max(...buckets.map(b => b.avg_pct || b.percentage || b.value || 0), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {buckets.slice(0, 8).map((b, i) => {
        const val = b.avg_pct || b.percentage || b.value || 0;
        const label = b.label || b.period || `${b.hours || b.days || i}h`;
        return (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 40px', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#71717A', textAlign: 'right' }}>{label}</span>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ width: `${(val / maxPct) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: '99px', transition: 'width 0.6s ease' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#FAFAFA' }}>{val.toFixed(0)}%</span>
          </div>
        );
      })}
    </div>
  );
};

// ── Posting Frequency Chart ──────────────────────────────────────────────────
const PostingFreqChart = ({ rows, color = '#818CF8' }) => {
  if (!rows || rows.length === 0) return null;
  const maxEng = Math.max(...rows.map(r => r.avg_engagement || r.engagement_rate || 0), 1);
  const bestRow = rows.reduce((best, r) => (r.avg_engagement || r.engagement_rate || 0) > (best.avg_engagement || best.engagement_rate || 0) ? r : best, rows[0]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {rows.slice(0, 8).map((r, i) => {
        const eng = r.avg_engagement || r.engagement_rate || 0;
        const freq = r.posts_per_week || r.frequency || r.label || `${i + 1}/sem`;
        const isBest = r === bestRow;
        return (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 55px', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: isBest ? '800' : '600', color: isBest ? color : '#71717A', textAlign: 'right' }}>
              {typeof freq === 'number' ? `${freq}/sem` : freq}
            </span>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                width: `${(eng / maxEng) * 100}%`, height: '100%',
                background: isBest ? `linear-gradient(90deg, ${color}, #10B981)` : `linear-gradient(90deg, ${color}88, ${color}44)`,
                borderRadius: '99px', transition: 'width 0.6s ease',
              }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: isBest ? '800' : '600', color: isBest ? '#10B981' : '#FAFAFA' }}>{eng.toFixed(1)}%</span>
          </div>
        );
      })}
      {bestRow && (
        <div style={{ marginTop: '6px', fontSize: '11px', fontWeight: '700', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Zap size={11} /> Óptimo: {bestRow.posts_per_week || bestRow.frequency || '?'} posts/semana
        </div>
      )}
    </div>
  );
};

// ── Best Times Chart ─────────────────────────────────────────────────────────
const BestTimesChart = ({ times }) => {
  if (!times || times.length === 0) return null;
  const maxEng = Math.max(...times.map(t => t.avg_engagement)) || 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {times.map((t, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '72px 1fr 40px', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#71717A', textAlign: 'right' }}>{t.label}</span>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ width: `${(t.avg_engagement / maxEng) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), #8B5CF6)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#FAFAFA' }}>{t.avg_engagement > 0 ? `~${t.avg_engagement}` : '—'}</span>
        </div>
      ))}
    </div>
  );
};

// ── Post Table ───────────────────────────────────────────────────────────────
const PostsTable = ({ posts, platform, explanations }) => {
  const isIG = platform === 'instagram';
  const isYT = platform === 'youtube';
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '650px' }}>
        <thead>
          <tr>
            <th style={thStyle}>TÍTULO</th>
            <th style={thStyle}>FECHA</th>
            <th style={{ ...thStyle, textAlign: 'center' }}>❤️ Likes</th>
            <th style={{ ...thStyle, textAlign: 'center' }}>💬 Coment.</th>
            <th style={{ ...thStyle, textAlign: 'center' }}>👁 Views</th>
            <th style={{ ...thStyle, textAlign: 'center' }}>🔁 Shares</th>
            {isIG && <th style={{ ...thStyle, textAlign: 'center' }}>📌 Saves</th>}
            {isIG && <th style={{ ...thStyle, textAlign: 'center' }}>⏱ Watch</th>}
            <th style={{ ...thStyle, textAlign: 'center' }}>Share Rate<InfoTooltip text={explanations?.share_rate} /></th>
            <th style={{ ...thStyle, textAlign: 'center' }}>VIRAL</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p, idx) => {
            const hasData = (p.likes || 0) > 0 || (p.views || 0) > 0;
            return (
              <tr key={p.id || idx}>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(129,140,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Film size={12} color="#818CF8" />
                    </div>
                    <span style={{ fontWeight: '600', color: '#FAFAFA', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{p.title || 'Publicación'}</span>
                  </div>
                </td>
                <td style={{ ...tdStyle, fontSize: '11px', color: '#71717A' }}>{p.date ? new Date(p.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : '—'}</td>
                <td style={{ ...tdStyle, textAlign: 'center', fontWeight: '700', color: hasData ? '#FAFAFA' : '#3F3F46', fontSize: '12px' }}>{hasData ? fmt(p.likes) : '—'}</td>
                <td style={{ ...tdStyle, textAlign: 'center', fontWeight: '700', color: hasData ? '#FAFAFA' : '#3F3F46', fontSize: '12px' }}>{hasData ? fmt(p.comments) : '—'}</td>
                <td style={{ ...tdStyle, textAlign: 'center', fontWeight: '700', color: hasData ? '#FAFAFA' : '#3F3F46', fontSize: '12px' }}>{hasData ? fmt(p.views) : '—'}</td>
                <td style={{ ...tdStyle, textAlign: 'center', fontWeight: '700', color: hasData ? '#FAFAFA' : '#3F3F46', fontSize: '12px' }}>{hasData ? fmt(p.shares) : '—'}</td>
                {isIG && <td style={{ ...tdStyle, textAlign: 'center', fontWeight: '700', color: hasData ? '#A78BFA' : '#3F3F46', fontSize: '12px' }}>{hasData ? fmt(p.saves) : '—'}</td>}
                {isIG && <td style={{ ...tdStyle, textAlign: 'center', fontWeight: '700', color: '#71717A', fontSize: '11px' }}>{p.ig_avg_watch_time > 0 ? `${p.ig_avg_watch_time}s` : '—'}</td>}
                <td style={{ ...tdStyle, textAlign: 'center', fontWeight: '700', color: p.share_rate > 1 ? '#10B981' : '#71717A', fontSize: '11px' }}>{p.share_rate > 0 ? `${p.share_rate}%` : '—'}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: p.viral_score > 7 ? '#10B981' : '#818CF8', background: p.viral_score > 7 ? 'rgba(16,185,129,0.1)' : 'rgba(129,140,248,0.1)', border: `1px solid ${p.viral_score > 7 ? 'rgba(16,185,129,0.2)' : 'rgba(129,140,248,0.2)'}` }}>
                    {(p.viral_score || 0).toFixed(1)}
                  </span>
                </td>
              </tr>
            );
          })}
          {posts.length === 0 && (
            <tr><td colSpan={isIG ? 10 : 8} style={{ ...tdStyle, textAlign: 'center', padding: '40px', color: '#52525B' }}>No hay publicaciones con métricas.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = { textAlign: 'left', padding: '8px 10px', fontSize: '10px', fontWeight: '700', color: '#52525B', borderBottom: '1px solid rgba(255,255,255,0.06)', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.03)', verticalAlign: 'middle' };

// ── Platform Command Center ──────────────────────────────────────────────────
const PlatformView = ({ data, explanations }) => {
  if (!data) return null;
  const { platform, kpis, calculated, content_decay, posting_frequency, best_times, posts, platform_insights } = data;
  const meta = PLATFORM_META[platform] || { label: platform, color: '#818CF8', emoji: '📱' };
  const isIG = platform === 'instagram';
  const isYT = platform === 'youtube';

  const mainKPIs = [
    { icon: <Users size={16} />, value: fmt(kpis.followers), label: 'Seguidores', key: 'followers', color: meta.color },
    { icon: <Eye size={16} />, value: fmt(kpis.reach), label: 'Alcance', key: 'reach', color: '#38BDF8' },
    { icon: <Eye size={16} />, value: fmt(kpis.views), label: 'Views', key: 'views', color: '#0EA5E9' },
    { icon: <Heart size={16} />, value: fmt(kpis.likes), label: 'Likes', key: 'likes', color: '#F472B6' },
    { icon: <Share2 size={16} />, value: fmt(kpis.shares), label: 'Compartidos', key: 'shares', color: '#FBBF24' },
    { icon: <MessageCircle size={16} />, value: fmt(kpis.comments), label: 'Comentarios', key: 'comments', color: '#34D399' },
    ...(isIG ? [{ icon: <Bookmark size={16} />, value: fmt(kpis.saves), label: 'Guardados', key: 'saves', color: '#A78BFA' }] : []),
    ...(isYT && platform_insights ? [{ icon: <Timer size={16} />, value: `${fmt(platform_insights.watch_time_total)}m`, label: 'Watch Time Total', key: 'watch_time_total', color: '#FF0000' }] : []),
  ];

  const calcKPIs = [
    { icon: <Zap size={14} />, value: pct(kpis.engagement_rate), label: 'Eng. Rate', key: 'engagement_rate', color: '#F59E0B' },
    { icon: <TrendingUp size={14} />, value: `${calculated.growth_rate > 0 ? '+' : ''}${calculated.growth_rate}%`, label: 'Crecimiento /sem', key: 'growth_rate', color: calculated.growth_rate >= 0 ? '#10B981' : '#EF4444', trend: calculated.growth_rate },
    { icon: <Activity size={14} />, value: pct(calculated.reach_follower_ratio), label: 'Reach/Follower', key: 'reach_follower_ratio', color: '#818CF8' },
    { icon: <Share2 size={14} />, value: pct(calculated.share_rate), label: 'Share Rate', key: 'share_rate', color: '#10B981' },
    ...(isIG ? [
      { icon: <Bookmark size={14} />, value: pct(calculated.save_rate), label: 'Save Rate', key: 'save_rate', color: '#A78BFA' },
      { icon: <Timer size={14} />, value: calculated.avg_watch_time > 0 ? `${calculated.avg_watch_time}s` : '—', label: 'Avg Watch Time', key: 'avg_watch_time', color: '#E1306C' },
    ] : []),
    ...(isIG && calculated.follow_conversion !== undefined ? [
      { icon: <UserPlus size={14} />, value: pct(calculated.follow_conversion), label: 'Follow Conv.', key: 'follow_conversion', color: '#10B981' },
      { icon: <UserMinus size={14} />, value: pct(calculated.churn_rate), label: 'Churn Rate', key: 'churn_rate', color: '#EF4444' },
    ] : []),
    ...(isYT ? [
      { icon: <UserPlus size={14} />, value: `+${platform_insights?.subscribers_gained || 0}`, label: 'Subs Ganados', key: 'sub_conversion_rate', color: '#10B981' },
      { icon: <UserMinus size={14} />, value: `${calculated.net_sub_growth >= 0 ? '+' : ''}${calculated.net_sub_growth || 0}`, label: 'Balance Neto', key: 'net_sub_growth', color: calculated.net_sub_growth >= 0 ? '#10B981' : '#EF4444' },
      { icon: <Timer size={14} />, value: calculated.avg_watch_time > 0 ? `${calculated.avg_watch_time}m` : '—', label: 'Avg Watch/Video', key: 'avg_watch_time', color: '#FF0000' },
    ] : []),
    { icon: <MousePointerClick size={14} />, value: pct(calculated.click_rate), label: 'Click Rate', key: 'click_rate', color: '#06B6D4' },
    { icon: <Activity size={14} />, value: fmt(calculated.engagement_per_post), label: 'Eng/Post', key: 'engagement_per_post', color: '#F59E0B' },
    { icon: <Eye size={14} />, value: `${calculated.views_per_follower}x`, label: 'Views/Follower', key: 'views_per_follower', color: '#0EA5E9' },
    { icon: <TrendingUp size={14} />, value: (calculated.viral_score_avg || 0).toFixed(1), label: 'Viral Avg', key: 'viral_score_avg', color: '#818CF8' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Platform Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderRadius: '14px', background: meta.bg, border: `1px solid ${meta.color}22` }}>
        <span style={{ fontSize: '28px' }}>{meta.emoji}</span>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#FAFAFA', margin: 0 }}>{meta.label}</h2>
          <span style={{ fontSize: '12px', color: '#71717A', fontWeight: '600' }}>{kpis.posts_count} publicaciones · {fmt(kpis.followers)} seguidores</span>
        </div>
        {kpis.engagement_rate > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: '13px', fontWeight: '800', background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '99px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={11} /> {kpis.engagement_rate.toFixed(1)}% ER
          </span>
        )}
      </div>

      {/* Main KPIs */}
      <div className="av-kpi-grid">
        {mainKPIs.map((k, i) => (
          <KPICard key={i} icon={k.icon} value={k.value} label={k.label} explanation={explanations?.[k.key]} color={k.color} />
        ))}
      </div>

      {/* Calculated KPIs */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#52525B', letterSpacing: '0.06em', marginBottom: '12px', textTransform: 'uppercase' }}>KPIs CALCULADOS — DECISIONES</div>
        <div className="av-calc-grid">
          {calcKPIs.map((k, i) => (
            <KPICard key={i} icon={k.icon} value={k.value} label={k.label} explanation={explanations?.[k.key]} color={k.color} trend={k.trend} small />
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="av-charts-grid">
        <div style={{ ...cardStyle }}>
          <div style={chartHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={14} color={meta.color} />
              <span style={chartTitleStyle}>CONTENT DECAY</span>
              <InfoTooltip text={explanations?.content_decay} />
            </div>
            <span style={chartBadgeStyle}>VIDA ÚTIL</span>
          </div>
          {content_decay.length > 0 ? (
            <ContentDecayChart buckets={content_decay} color={meta.color} />
          ) : (
            <p style={emptyStyle}>Sincroniza para ver la curva de vida</p>
          )}
        </div>

        <div style={{ ...cardStyle }}>
          <div style={chartHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={14} color={meta.color} />
              <span style={chartTitleStyle}>POSTING FREQUENCY</span>
              <InfoTooltip text={explanations?.posting_frequency} />
            </div>
            <span style={chartBadgeStyle}>ÓPTIMO</span>
          </div>
          {posting_frequency.length > 0 ? (
            <PostingFreqChart rows={posting_frequency} color={meta.color} />
          ) : (
            <p style={emptyStyle}>Sincroniza para ver frecuencia óptima</p>
          )}
        </div>

        <div style={{ ...cardStyle }}>
          <div style={chartHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={14} color={meta.color} />
              <span style={chartTitleStyle}>MEJOR HORA</span>
              <InfoTooltip text={explanations?.best_times} />
            </div>
            <span style={chartBadgeStyle}>ENGAGEMENT</span>
          </div>
          {best_times.length > 0 ? (
            <BestTimesChart times={best_times} />
          ) : (
            <p style={emptyStyle}>Sincroniza para ver mejores horarios</p>
          )}
        </div>
      </div>

      {/* Posts table */}
      <div style={{ ...cardStyle }}>
        <div style={{ ...chartHeaderStyle, marginBottom: '16px' }}>
          <span style={chartTitleStyle}>PUBLICACIONES EN {meta.label.toUpperCase()}</span>
        </div>
        <PostsTable posts={posts || []} platform={platform} explanations={explanations} />
      </div>
    </div>
  );
};

// ── Shared styles ────────────────────────────────────────────────────────────
const cardStyle = { padding: '24px', borderRadius: '14px', background: '#111113', border: '1px solid rgba(255,255,255,0.06)' };
const chartHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' };
const chartTitleStyle = { fontSize: '12px', fontWeight: '800', color: '#818CF8', letterSpacing: '0.08em' };
const chartBadgeStyle = { fontSize: '9px', fontWeight: '800', color: '#52525B', border: '1px solid rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '20px' };
const emptyStyle = { color: '#3F3F46', fontSize: '12px', textAlign: 'center', padding: '20px 0' };

// ── Overview Tab ─────────────────────────────────────────────────────────────
const OverviewTab = ({ data, explanations, onSelectPlatform }) => {
  if (!data) return null;
  const { overview, platforms, connected_platforms } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Global KPIs */}
      <div className="av-kpi-grid">
        <KPICard icon={<Users size={16} />} value={fmt(overview.total_followers)} label="Seguidores" explanation={explanations?.followers} color="#818CF8" trend={overview.growth_rate} />
        <KPICard icon={<Eye size={16} />} value={fmt(overview.total_reach)} label="Alcance" explanation={explanations?.reach} color="#38BDF8" />
        <KPICard icon={<Zap size={16} />} value={pct(overview.avg_engagement_rate)} label="Eng. Rate" explanation={explanations?.engagement_rate} color="#F59E0B" />
        <KPICard icon={<TrendingUp size={16} />} value={`${overview.growth_rate > 0 ? '+' : ''}${overview.growth_rate}%`} label="Crecimiento /sem" explanation={explanations?.growth_rate} color={overview.growth_rate >= 0 ? '#10B981' : '#EF4444'} />
        <KPICard icon={<Activity size={16} />} value={(overview.viral_score_avg || 0).toFixed(1)} label="Viral Score Avg" explanation={explanations?.viral_score_avg} color="#A78BFA" />
      </div>

      {/* Platform Ranking */}
      <div style={{ ...cardStyle }}>
        <div style={{ ...chartHeaderStyle }}>
          <span style={chartTitleStyle}>RANKING DE PLATAFORMAS</span>
          <span style={chartBadgeStyle}>POR ENGAGEMENT</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(overview.platform_ranking || []).map((p, i) => {
            const meta = PLATFORM_META[p.platform] || {};
            const maxER = overview.platform_ranking[0]?.engagement_rate || 1;
            return (
              <div key={p.platform} onClick={() => onSelectPlatform(p.platform)}
                style={{ display: 'grid', gridTemplateColumns: '28px 100px 1fr 70px', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '18px' }}>{meta.emoji}</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#FAFAFA' }}>{meta.label}</span>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ width: `${(p.engagement_rate / maxER) * 100}%`, height: '100%', background: meta.color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: meta.color, textAlign: 'right' }}>{p.engagement_rate.toFixed(1)}% ER</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Posts */}
      {overview.top_posts?.length > 0 && (
        <div style={{ ...cardStyle }}>
          <div style={{ ...chartHeaderStyle }}>
            <span style={chartTitleStyle}>TOP POSTS DE LA SEMANA</span>
          </div>
          {overview.top_posts.map((p, i) => (
            <div key={p.id || i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 0', borderBottom: i < overview.top_posts.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <span style={{ fontSize: '16px', fontWeight: '800', color: i === 0 ? '#F59E0B' : '#3F3F46', width: '20px' }}>#{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#FAFAFA', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title || 'Publicación'}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  {(p.platforms || []).map(pl => <span key={pl} style={{ fontSize: '10px', color: PLATFORM_META[pl]?.color || '#71717A' }}>{PLATFORM_META[pl]?.emoji} {PLATFORM_META[pl]?.label}</span>)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#FAFAFA' }}>👁 {fmt(p.views)}</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#F472B6' }}>❤️ {fmt(p.likes)}</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#10B981' }}>🔁 {fmt(p.shares)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const AnalyticsView = ({ userId, activeArtist }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const API = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  const getToken = () => { try { return JSON.parse(localStorage.getItem('vidalis_user') || '{}').token || ''; } catch { return ''; } };

  const fetchData = async () => {
    if (!activeArtist?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/vidalis/platform-analytics/${activeArtist.id}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) setData(await res.json());
    } catch (err) { console.error('Platform analytics error:', err); }
    setLoading(false);
  };

  useEffect(() => { setActiveTab('overview'); fetchData(); }, [activeArtist]);

  const handleSync = async () => {
    if (!activeArtist?.id) return;
    setSyncing(true);
    try {
      await Promise.all([
        fetch(`${API}/api/vidalis/artists/${activeArtist.id}/sync`, { method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` } }),
        fetch(`${API}/api/vidalis/artists/${activeArtist.id}/sync-analytics`, { method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` } }),
      ]);
    } catch (err) { console.error('Sync error:', err); }
    setSyncing(false);
    fetchData();
  };

  const fetchInsights = async () => {
    if (!activeArtist?.id) return;
    setInsightsLoading(true);
    try {
      const res = await fetch(`${API}/api/vidalis/analytics-insights/${activeArtist.id}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setInsights(await res.json());
    } catch (err) { console.error('Insights error:', err); }
    setInsightsLoading(false);
  };

  if (loading) return (
    <div style={{ padding: '80px', textAlign: 'center' }}>
      <Loader2 className="animate-spin" size={32} color="var(--primary)" />
      <p style={{ marginTop: '16px', color: '#71717A', fontSize: '14px' }}>Cargando analítica por plataforma...</p>
    </div>
  );

  const connectedPlatforms = data?.connected_platforms || [];
  const explanations = data?.explanations || {};

  const tabs = [
    { key: 'overview', label: '★ Overview', color: '#818CF8' },
    ...connectedPlatforms.map(p => ({
      key: p,
      label: `${PLATFORM_META[p]?.emoji || '📱'} ${PLATFORM_META[p]?.label || p}`,
      color: PLATFORM_META[p]?.color || '#818CF8',
    })),
  ];

  return (
    <div className="av-container">
      {/* Header */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={handleSync} disabled={syncing} style={{ ...btnStyle, background: '#1C1C1F', color: syncing ? '#52525B' : '#FAFAFA' }}>
          <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Sincronizando...' : 'Sincronizar'}
        </button>
        {activeArtist?.id && (
          <button onClick={fetchInsights} disabled={insightsLoading} style={{ ...btnStyle, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: '#fff' }}>
            <Sparkles size={13} />
            {insightsLoading ? 'Analizando...' : 'Analizar con IA'}
          </button>
        )}
      </div>

      {/* AI Insights */}
      {(insights || insightsLoading) && (
        <div style={{ ...cardStyle, marginBottom: '24px', borderLeft: '3px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Sparkles size={14} color="var(--primary)" />
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#FAFAFA' }}>Análisis IA</span>
          </div>
          {insightsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#71717A', fontSize: '13px' }}>
              <Loader2 size={14} className="animate-spin" /> Procesando métricas...
            </div>
          ) : (
            <div className="av-insights-grid">
              <div>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#818CF8', textTransform: 'uppercase', marginBottom: '8px' }}>Observaciones</div>
                {(insights?.insights || []).map((ins, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '12px', color: '#E2E8F0', lineHeight: '1.6', marginBottom: '6px' }}>
                    <AlertCircle size={12} color="#818CF8" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>{ins}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#10B981', textTransform: 'uppercase', marginBottom: '8px' }}>Decisiones</div>
                {(insights?.decisions || []).map((dec, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '12px', color: '#4ADE80', lineHeight: '1.6', marginBottom: '6px' }}>
                    <Lightbulb size={12} color="#10B981" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>{dec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Platform Tabs */}
      <div className="av-tabs">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`av-tab ${activeTab === t.key ? 'active' : ''}`}
            style={{ '--tab-color': t.color }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' ? (
        <OverviewTab data={data} explanations={explanations} onSelectPlatform={setActiveTab} />
      ) : (
        <PlatformView data={data?.platforms?.[activeTab]} explanations={explanations} />
      )}

      <style>{`
        .av-container { padding-bottom: 40px; }
        .av-tabs { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 28px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0; }
        .av-tab {
          padding: 10px 18px; background: none; border: none; border-bottom: 2px solid transparent;
          color: #52525B; font-size: 13px; font-weight: 700; cursor: pointer;
          transition: all 0.2s; margin-bottom: -1px; display: flex; align-items: center; gap: 6px; white-space: nowrap;
        }
        .av-tab:hover { color: #A1A1AA; }
        .av-tab.active { color: var(--tab-color, #818CF8); border-bottom-color: var(--tab-color, #818CF8); }
        .av-kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; }
        .av-calc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
        .av-charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
        .av-insights-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) {
          .av-kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .av-calc-grid { grid-template-columns: repeat(2, 1fr); }
          .av-charts-grid { grid-template-columns: 1fr; }
          .av-insights-grid { grid-template-columns: 1fr; }
          .av-tabs { gap: 2px; }
          .av-tab { padding: 8px 12px; font-size: 12px; }
        }
        @media (max-width: 480px) {
          .av-kpi-grid { grid-template-columns: 1fr; }
          .av-calc-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

const btnStyle = { fontSize: '13px', fontWeight: '700', padding: '10px 18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' };

export default AnalyticsView;
