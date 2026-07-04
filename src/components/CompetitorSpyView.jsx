import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Loader2, Zap, Users, Eye, Heart, MessageCircle, TrendingUp, AlertCircle, Target, ArrowUpRight, ArrowDownRight, Edit3, X, Save } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const getToken = () => { try { return JSON.parse(localStorage.getItem('vidalis_user') || '{}').token || ''; } catch { return ''; } };
const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` });
const fmt = (n) => { if (!n) return '0'; if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'; if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'; return String(n); };

const PLATFORMS = {
  tiktok: { emoji: '🎵', label: 'TikTok', color: '#69C9D0', field: 'tiktok_username' },
  youtube: { emoji: '▶', label: 'YouTube', color: '#FF0000', field: 'youtube_username' },
  instagram: { emoji: '📸', label: 'Instagram', color: '#E1306C', field: 'instagram_username' },
};

const CompetitorSpyView = ({ artistId }) => {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', tiktok_username: '', youtube_username: '', instagram_username: '' });
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState('');

  useEffect(() => { if (artistId) fetchCompetitors(); }, [artistId]);

  const fetchCompetitors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/vidalis/competitors/${artistId}`, { headers: headers() });
      if (res.ok) setCompetitors(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!addForm.name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/vidalis/competitors/${artistId}`, {
        method: 'POST', headers: headers(), body: JSON.stringify(addForm),
      });
      if (res.ok) {
        const data = await res.json();
        setCompetitors(prev => [data, ...prev]);
        setAddForm({ name: '', tiktok_username: '', youtube_username: '', instagram_username: '' });
        setShowAdd(false);
      } else {
        const err = await res.json();
        setError(err.error || 'Error agregando competidor');
      }
    } catch (e) { setError(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/api/vidalis/competitors/edit/${id}`, { method: 'DELETE', headers: headers() });
      setCompetitors(prev => prev.filter(c => c.id !== id));
      if (analysis?.competitor?.id === id) setAnalysis(null);
    } catch (e) { console.error(e); }
  };

  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`${API}/api/vidalis/competitors/edit/${id}`, {
        method: 'PUT', headers: headers(), body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setCompetitors(prev => prev.map(c => c.id === id ? updated : c));
        setEditingId(null);
      }
    } catch (e) { console.error(e); }
  };

  const handleAnalyze = async (competitorId) => {
    setAnalyzing(competitorId);
    setAnalysis(null);
    setError('');
    try {
      const res = await fetch(`${API}/api/vidalis/competitors/analyze/${competitorId}`, {
        method: 'POST', headers: headers(),
      });
      const data = await res.json();
      if (res.ok) {
        setAnalysis(data);
      } else if (res.status === 402) {
        setError(`Sparks insuficientes. Necesitas ${data.required} Sparks (tienes ${data.current}).`);
      } else {
        setError(data.error || 'Error analizando competidor');
      }
    } catch (e) { setError(e.message); }
    setAnalyzing(null);
  };

  const loadLastAnalysis = async (competitorId) => {
    try {
      const res = await fetch(`${API}/api/vidalis/competitors/analysis/${competitorId}`, { headers: headers() });
      if (res.ok) {
        const data = await res.json();
        if (data) setAnalysis(data);
      }
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#71717A' }}>
      <Loader2 className="animate-spin" size={28} style={{ margin: '0 auto 12px', color: '#818CF8' }} />
    </div>
  );

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(239,68,68,0.1)', padding: '10px', borderRadius: '12px' }}>
            <Search size={22} color="#EF4444" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#FAFAFA', margin: 0 }}>Spy Mode</h2>
            <p style={{ color: '#71717A', fontSize: '0.85rem', margin: 0 }}>Analiza tu competencia y aprende de sus estrategias</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#71717A', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={11} color="#F59E0B" /> 50 Sparks por análisis
          </span>
          <button onClick={() => setShowAdd(!showAdd)} style={{
            background: 'linear-gradient(135deg, #EF4444, #DC2626)', border: 'none', color: '#fff',
            padding: '10px 18px', borderRadius: '10px', fontWeight: '700', fontSize: '13px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <Plus size={14} /> Agregar Competidor
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '14px 18px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={16} color="#EF4444" />
          <span style={{ fontSize: '13px', color: '#FCA5A5' }}>{error}</span>
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#71717A', cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}

      {/* Add Form */}
      {showAdd && (
        <div style={{ padding: '24px', background: '#111113', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#FAFAFA', marginBottom: '16px' }}>Nuevo Competidor</h3>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Nombre del competidor</label>
            <input value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} placeholder="Ej: Bad Bunny, MrBeast..." style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            {Object.entries(PLATFORMS).map(([key, meta]) => (
              <div key={key}>
                <label style={labelStyle}>{meta.emoji} {meta.label}</label>
                <input
                  value={addForm[meta.field] || ''}
                  onChange={e => setAddForm(p => ({ ...p, [meta.field]: e.target.value }))}
                  placeholder={`@username`}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleAdd} disabled={saving || !addForm.name.trim()} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Agregar
            </button>
            <button onClick={() => setShowAdd(false)} style={btnSecondary}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Competitors List */}
      {competitors.length === 0 && !showAdd && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#111113', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Search size={40} color="#3F3F46" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#71717A' }}>No tienes competidores agregados</h3>
          <p style={{ fontSize: '13px', color: '#52525B', maxWidth: '400px', margin: '8px auto 0' }}>
            Agrega hasta 10 competidores con sus usernames por red social para analizar sus estrategias.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {competitors.map(comp => (
          <div key={comp.id} style={{
            padding: '18px 20px', background: '#111113', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', transition: 'border-color 0.2s',
          }}>
            {editingId === comp.id ? (
              /* Edit mode */
              <div>
                <div style={{ marginBottom: '10px' }}>
                  <input value={editForm.name || ''} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} placeholder="Nombre" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                  {Object.entries(PLATFORMS).map(([key, meta]) => (
                    <div key={key}>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: meta.color, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <span>{meta.emoji}</span> {meta.label}
                      </label>
                      <input value={editForm[meta.field] || ''} onChange={e => setEditForm(p => ({ ...p, [meta.field]: e.target.value }))} placeholder={`@username`} style={{ ...inputStyle, fontSize: '12px', padding: '8px' }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleUpdate(comp.id)} style={{ ...btnPrimary, padding: '6px 12px', fontSize: '12px' }}><Save size={12} /> Guardar</button>
                  <button onClick={() => setEditingId(null)} style={{ ...btnSecondary, padding: '6px 12px', fontSize: '12px' }}>Cancelar</button>
                </div>
              </div>
            ) : (
              /* View mode */
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#FAFAFA' }}>{comp.name}</div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {Object.entries(PLATFORMS).map(([key, meta]) => {
                      const username = comp[meta.field];
                      if (!username) return null;
                      return (
                        <span key={key} style={{ fontSize: '11px', color: meta.color, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          {meta.emoji} @{username}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => { loadLastAnalysis(comp.id); }} style={{ ...btnSecondary, padding: '8px 12px', fontSize: '11px' }}>
                    <Eye size={12} /> Último
                  </button>
                  <button
                    onClick={() => handleAnalyze(comp.id)}
                    disabled={analyzing === comp.id}
                    style={{ ...btnPrimary, padding: '8px 14px', fontSize: '11px', background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
                  >
                    {analyzing === comp.id ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
                    {analyzing === comp.id ? 'Analizando...' : 'Analizar (50⚡)'}
                  </button>
                  <button onClick={() => { setEditingId(comp.id); setEditForm({ name: comp.name, tiktok_username: comp.tiktok_username || '', youtube_username: comp.youtube_username || '', instagram_username: comp.instagram_username || '' }); }} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#71717A', cursor: 'pointer', padding: '8px', display: 'flex' }}>
                    <Edit3 size={12} />
                  </button>
                  <button onClick={() => handleDelete(comp.id)} style={{ background: 'none', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#EF4444', cursor: 'pointer', padding: '8px', display: 'flex' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header */}
          <div style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>ANÁLISIS DE COMPETENCIA</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FAFAFA', margin: 0 }}>
                  {analysis.competitor?.name || 'Competidor'}
                </h3>
              </div>
              {analysis.sparks_remaining !== undefined && (
                <span style={{ fontSize: '11px', color: '#71717A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={11} color="#F59E0B" /> {analysis.sparks_remaining} Sparks restantes
                </span>
              )}
            </div>
          </div>

          {/* Platform comparisons */}
          {analysis.comparisons && Object.entries(analysis.comparisons).map(([plat, data]) => {
            const meta = PLATFORMS[plat] || { emoji: '📱', label: plat, color: '#818CF8' };
            return (
              <div key={plat} style={{ background: '#111113', border: `1px solid ${meta.color}55`, borderRadius: '14px', overflow: 'hidden' }}>
                {/* Barra de color por plataforma */}
                <div style={{ height: '4px', background: meta.color, opacity: 0.85 }} />
                <div style={{ padding: '20px 24px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ background: `${meta.color}18`, borderRadius: '10px', padding: '8px', display: 'flex' }}>
                    <span style={{ fontSize: '20px', lineHeight: 1 }}>{meta.emoji}</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#FAFAFA', margin: 0 }}>{meta.label}</h4>
                    {data.competitor?.username && (
                      <span style={{ fontSize: '12px', color: meta.color, fontWeight: '600' }}>@{data.competitor.username}</span>
                    )}
                  </div>
                </div>

                {/* Metrics comparison */}
                {data.metrics && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                    {Object.entries(data.metrics).map(([key, vals], idx) => {
                      const artVal = vals.artist || 0;
                      const compVal = vals.competitor || 0;
                      const isBetter = artVal >= compVal;
                      const cardThemes = [
                        { accent: '#818CF8', icon: '👥', bg: 'rgba(129,140,248,0.06)', border: 'rgba(129,140,248,0.15)' }, // followers - indigo
                        { accent: '#F59E0B', icon: '❤️', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)' },  // avg likes - amber
                        { accent: '#06B6D4', icon: '📹', bg: 'rgba(6,182,212,0.06)',   border: 'rgba(6,182,212,0.15)'  },  // content volume - cyan
                        { accent: '#A855F7', icon: '⚡', bg: 'rgba(168,85,247,0.06)',  border: 'rgba(168,85,247,0.15)' },  // engagement - purple
                      ];
                      const theme = cardThemes[idx % cardThemes.length];
                      return (
                        <div key={key} style={{ padding: '14px', background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '13px' }}>{theme.icon}</span>
                            <span style={{ fontSize: '10px', fontWeight: '700', color: theme.accent, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{key.replace(/_/g, ' ')}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '10px', color: '#71717A', marginBottom: '2px' }}>Tú</div>
                              <div style={{ fontSize: '18px', fontWeight: '800', color: isBetter ? '#10B981' : '#FAFAFA', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {typeof artVal === 'number' && artVal > 100 ? fmt(artVal) : artVal}
                                {isBetter && artVal > 0 && <ArrowUpRight size={13} color="#10B981" />}
                              </div>
                            </div>
                            <div style={{ width: '1px', height: '32px', background: `${theme.accent}30` }} />
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '10px', color: '#71717A', marginBottom: '2px' }}>Rival</div>
                              <div style={{ fontSize: '18px', fontWeight: '800', color: !isBetter ? '#EF4444' : '#FAFAFA', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                {typeof compVal === 'number' && compVal > 100 ? fmt(compVal) : compVal}
                                {!isBetter && compVal > 0 && <ArrowDownRight size={13} color="#EF4444" />}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Insights */}
                {data.insights?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {data.insights.map((ins, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#E2E8F0', lineHeight: '1.6', padding: '8px 12px', background: `${meta.color}08`, border: `1px solid ${meta.color}18`, borderRadius: '8px' }}>
                        <AlertCircle size={13} color={meta.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{ins}</span>
                      </div>
                    ))}
                  </div>
                )}
                </div>{/* end padding wrapper */}
              </div>
            );
          })}

          {/* Action Plan */}
          {analysis.action_plan?.length > 0 && (
            <div style={{ padding: '24px', background: '#111113', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Target size={16} color="#10B981" />
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#10B981', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan de Acción</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analysis.action_plan.map((action, i) => {
                  const priorityColors = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };
                  const priorityLabels = { high: 'URGENTE', medium: 'IMPORTANTE', low: 'SUGERIDO' };
                  return (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: '10px' }}>
                      <span style={{
                        fontSize: '9px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', flexShrink: 0, marginTop: '2px',
                        color: priorityColors[action.priority] || '#71717A',
                        background: `${priorityColors[action.priority] || '#71717A'}15`,
                        border: `1px solid ${priorityColors[action.priority] || '#71717A'}30`,
                      }}>
                        {priorityLabels[action.priority] || 'INFO'}
                      </span>
                      <div>
                        <span style={{ fontSize: '12px', color: '#E2E8F0', lineHeight: '1.6' }}>{action.action}</span>
                        {action.platform !== 'general' && (
                          <span style={{ fontSize: '10px', color: '#52525B', marginLeft: '6px' }}>({PLATFORMS[action.platform]?.label || action.platform})</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {analysis.analyzed_at && (
            <p style={{ fontSize: '11px', color: '#3F3F46', textAlign: 'right' }}>
              Analizado: {new Date(analysis.analyzed_at).toLocaleString('es-CO')}
            </p>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .spy-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

const labelStyle = { fontSize: '11px', fontWeight: '700', color: '#52525B', textTransform: 'uppercase', display: 'block', marginBottom: '6px' };
const inputStyle = { width: '100%', boxSizing: 'border-box', background: '#1C1C1F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 12px', color: '#FAFAFA', fontSize: '13px', outline: 'none', fontFamily: 'inherit' };
const btnPrimary = { background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', border: 'none', color: '#fff', padding: '10px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' };
const btnSecondary = { background: '#1C1C1F', border: '1px solid rgba(255,255,255,0.08)', color: '#A1A1AA', padding: '10px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' };

export default CompetitorSpyView;
