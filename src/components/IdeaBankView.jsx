import { useState, useEffect, useRef } from 'react';
import { Lightbulb, Sparkles, TrendingUp, Palette, ChevronLeft, ChevronRight, X, Heart, Star, FileText, Loader2, Plus, Search, ExternalLink, RefreshCw, Clock, CheckCircle, BarChart3, Zap, AlertCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const getToken = () => { const u = localStorage.getItem('vidalis_user'); return u ? JSON.parse(u).token : ''; };
const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` });

const STATUS_COLORS = { reddit: '#FF4500', youtube: '#FF0000', tiktok: '#00F2EA', instagram: '#E1306C', original: '#818CF8' };
const PLATFORM_EMOJI = { reddit: '🔴', youtube: '🔴', tiktok: '🎵', instagram: '🟣', original: '✨' };

const TABS = [
  { id: 'ideas', label: 'Ideas del Día', icon: Lightbulb },
  { id: 'bank', label: 'Banco de Ideas', icon: Star },
  { id: 'trends', label: 'Tendencias', icon: TrendingUp },
  { id: 'style', label: 'Mi Estilo', icon: Palette },
];

const IdeaBankView = ({ artistId }) => {
  const [activeTab, setActiveTab] = useState('ideas');
  const [ideas, setIdeas] = useState([]);
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [trends, setTrends] = useState([]);
  const [trendRefs, setTrendRefs] = useState([]);
  const [styleProfile, setStyleProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scriptModal, setScriptModal] = useState(null);
  const [expandingId, setExpandingId] = useState(null);
  const [addSourceModal, setAddSourceModal] = useState(false);
  const [sparkError, setSparkError] = useState(null);
  const [swipeAnim, setSwipeAnim] = useState(null);

  useEffect(() => { if (artistId) loadTabData(); }, [artistId, activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'ideas') {
        const res = await fetch(`${API}/api/vidalis/ideas/${artistId}`, { headers: headers() });
        const data = await res.json();
        setIdeas(Array.isArray(data) ? data.filter(i => i.status === 'pending') : []);
        setCurrentIdx(0);
      } else if (activeTab === 'bank') {
        const res = await fetch(`${API}/api/vidalis/ideas/${artistId}/saved`, { headers: headers() });
        const data = await res.json();
        setSavedIdeas(data.ideas || []);
      } else if (activeTab === 'trends') {
        const [tRes, rRes] = await Promise.all([
          fetch(`${API}/api/vidalis/trends/${artistId}`, { headers: headers() }),
          fetch(`${API}/api/vidalis/trends/${artistId}/references`, { headers: headers() })
        ]);
        setTrends(await tRes.json());
        setTrendRefs(await rRes.json());
      } else if (activeTab === 'style') {
        const res = await fetch(`${API}/api/vidalis/style-profile/${artistId}`, { headers: headers() });
        setStyleProfile(await res.json());
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const generateIdeas = async () => {
    setGenerating(true);
    setSparkError(null);
    try {
      const res = await fetch(`${API}/api/vidalis/ideas/${artistId}/generate`, { method: 'POST', headers: headers() });
      const data = await res.json();
      if (res.status === 402) {
        setSparkError(data);
        return;
      }
      setIdeas(Array.isArray(data.ideas) ? data.ideas : Array.isArray(data) ? data : []);
      setCurrentIdx(0);
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const handleSwipe = async (action) => {
    const idea = ideas[currentIdx];
    if (!idea) return;
    setSwipeAnim(action === 'dislike' ? 'left' : 'right');
    setTimeout(async () => {
      try {
        await fetch(`${API}/api/vidalis/ideas/${idea.id}/swipe`, {
          method: 'POST', headers: headers(),
          body: JSON.stringify({ action, artistId })
        });
      } catch (e) { console.error(e); }
      setIdeas(prev => prev.filter((_, i) => i !== currentIdx));
      setSwipeAnim(null);
      if (currentIdx >= ideas.length - 1) setCurrentIdx(Math.max(0, ideas.length - 2));
    }, 300);
  };

  const handleExpand = async (ideaId) => {
    setExpandingId(ideaId);
    try {
      const res = await fetch(`${API}/api/vidalis/ideas/${ideaId}/expand`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ artistId })
      });
      const data = await res.json();
      setScriptModal(data);
    } catch (e) { console.error(e); }
    setExpandingId(null);
  };

  const handleRate = async (ideaId, rating) => {
    try {
      await fetch(`${API}/api/vidalis/ideas/${ideaId}/rate`, {
        method: 'PUT', headers: headers(),
        body: JSON.stringify({ rating, artistId })
      });
      setSavedIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, rating } : i));
    } catch (e) { console.error(e); }
  };

  const addReference = async (type, value, platform) => {
    try {
      await fetch(`${API}/api/vidalis/trends/${artistId}/references`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ type, value, platform })
      });
      setAddSourceModal(false);
      loadTabData();
    } catch (e) { console.error(e); }
  };

  const removeReference = async (refId) => {
    try {
      await fetch(`${API}/api/vidalis/trends/references/${refId}`, {
        method: 'DELETE', headers: headers(),
        body: JSON.stringify({ artistId })
      });
      setTrendRefs(prev => prev.filter(r => r.id !== refId));
    } catch (e) { console.error(e); }
  };

  const analyzeStyle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/vidalis/style-profile/${artistId}/analyze`, { method: 'POST', headers: headers() });
      setStyleProfile(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const currentIdea = ideas[currentIdx];

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#1C1C1F', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Lightbulb size={24} color="#818CF8" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#FAFAFA', marginBottom: '4px' }}>Idea Bank</h2>
            <p style={{ color: '#71717A', fontSize: '0.9rem', fontWeight: '500' }}>Tu banco de ideas personalizado con IA</p>
          </div>
        </div>
        <button onClick={generateIdeas} disabled={generating} style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(79,70,229,0.3)' }}>
          {generating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
          {generating ? 'Generando...' : '5 ⚡ Generar Ideas'}
        </button>
      </div>

      {sparkError && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', animation: 'sparkFadeIn 0.25s ease'
        }}>
          <div style={{
            background: '#111113', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px', padding: '48px 40px', width: '100%', maxWidth: '440px',
            textAlign: 'center', boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            animation: 'sparkSlideUp 0.3s ease'
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <Zap size={36} color="#EF4444" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#FAFAFA', marginBottom: '12px' }}>
              Sin Energía
            </h2>
            <p style={{ color: '#A1A1AA', fontSize: '15px', lineHeight: '1.6', marginBottom: '8px' }}>
              No tienes suficientes Sparks para generar ideas.
            </p>
            <div style={{
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: '14px', padding: '16px', marginBottom: '32px', marginTop: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#71717A', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Necesitas</div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#EF4444' }}>5 ⚡</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#71717A', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Tu saldo</div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#FAFAFA' }}>{sparkError.balance ?? 0} ⚡</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => { setSparkError(null); document.querySelector('[data-view="sparks"]')?.click(); }}
              style={{
                width: '100%', padding: '16px', border: 'none', borderRadius: '14px',
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: '#fff', fontWeight: '900', fontSize: '16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                boxShadow: '0 8px 24px rgba(245,158,11,0.3)', transition: 'all 0.2s'
              }}
            >
              <Zap size={20} /> Recargar Sparks
            </button>
            <button
              onClick={() => setSparkError(null)}
              style={{
                width: '100%', marginTop: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px', background: 'transparent', color: '#71717A',
                fontWeight: '700', fontSize: '14px', cursor: 'pointer'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* TABS */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '32px', background: '#1C1C1F', padding: '6px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', width: 'fit-content', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '10px 20px', borderRadius: '10px', border: 'none',
            background: activeTab === tab.id ? 'linear-gradient(135deg,#4F46E5,#7C3AED)' : 'transparent',
            color: activeTab === tab.id ? '#fff' : '#71717A',
            fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap',
            boxShadow: activeTab === tab.id ? '0 2px 10px rgba(79,70,229,0.3)' : 'none', transition: 'all 0.2s'
          }}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', color: '#71717A' }}>
          <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 16px', color: '#4F46E5' }} />
          <p style={{ fontWeight: '700' }}>Cargando...</p>
        </div>
      ) : (
        <>
          {/* ====== IDEAS DEL DÍA (SWIPE) ====== */}
          {activeTab === 'ideas' && (
            <div>
              {ideas.length === 0 ? (
                <div className="card-pro" style={{ textAlign: 'center', padding: '60px 30px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>💡</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: '#FAFAFA' }}>
                    {generating ? 'Generando ideas...' : 'No hay ideas pendientes'}
                  </h3>
                  <p style={{ color: '#71717A', fontSize: '14px', marginBottom: '24px' }}>
                    {generating ? 'La IA está analizando tendencias y tu estilo' : 'Genera nuevas ideas o vuelve mañana'}
                  </p>
                  {!generating && (
                    <button onClick={generateIdeas} style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', border: 'none', color: '#fff', padding: '14px 28px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <Zap size={16} /> 5 ⚡ Generar Ideas
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: '100%', maxWidth: '460px' }}>
                    {currentIdea && (
                      <div className={`card-pro ib-swipe-card ${swipeAnim === 'left' ? 'ib-swipe-left' : swipeAnim === 'right' ? 'ib-swipe-right' : ''}`} style={{ padding: '28px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(79,70,229,0.12)', color: '#818CF8', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>
                          {PLATFORM_EMOJI[currentIdea.trend_platform] || '✨'} {currentIdea.trend_source || currentIdea.trend_platform || 'Original'}
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', lineHeight: '1.4', color: '#FAFAFA', marginBottom: '20px' }}>"{currentIdea.hook}"</h3>
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '16px' }} />
                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '16px' }}>
                          {(currentIdea.bullets || []).map((b, i) => (
                            <li key={i} style={{ padding: '6px 0', fontSize: '14px', color: '#A1A1AA', display: 'flex', alignItems: 'flex-start', gap: '10px', lineHeight: '1.5' }}>
                              <span style={{ color: '#4F46E5', fontWeight: '900' }}>▸</span> {b}
                            </li>
                          ))}
                        </ul>
                        {currentIdea.cta && (
                          <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#FBBF24', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            ✨ CTA: "{currentIdea.cta}"
                          </div>
                        )}
                        {currentIdea.category && (
                          <div style={{ marginBottom: '20px' }}>
                            <span style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', color: '#71717A', fontWeight: '600' }}>
                              {currentIdea.category}
                            </span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <button onClick={() => handleSwipe('dislike')} className="ib-action-btn ib-skip" title="Descartar"><X size={22} /></button>
                          <button onClick={() => handleExpand(currentIdea.id)} className="ib-action-btn ib-expand" title="Expandir guión" disabled={expandingId === currentIdea.id}>
                            {expandingId === currentIdea.id ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                          </button>
                          <button onClick={() => handleSwipe('save')} className="ib-action-btn ib-star" title="Favorita"><Star size={20} /></button>
                          <button onClick={() => handleSwipe('like')} className="ib-action-btn ib-save" title="Guardar"><Heart size={20} /></button>
                        </div>
                      </div>
                    )}
                    <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#52525B', fontWeight: '700' }}>
                      Idea {currentIdx + 1} de {ideas.length}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
                      {ideas.map((_, i) => (
                        <span key={i} style={{ width: i === currentIdx ? '24px' : '8px', height: '8px', borderRadius: i === currentIdx ? '4px' : '50%', background: i === currentIdx ? 'linear-gradient(90deg,#4F46E5,#7C3AED)' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ====== BANCO DE IDEAS ====== */}
          {activeTab === 'bank' && (
            <div>
              {savedIdeas.length === 0 ? (
                <div className="card-pro" style={{ textAlign: 'center', padding: '60px 30px' }}>
                  <Star size={40} style={{ color: '#27272A', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FAFAFA', marginBottom: '8px' }}>Sin ideas guardadas</h3>
                  <p style={{ color: '#71717A', fontSize: '14px' }}>Las ideas que guardes o marques como favoritas aparecerán aquí</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                  {savedIdeas.map(idea => (
                    <div key={idea.id} className="card-pro" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1,2,3,4,5].map(s => (
                            <span key={s} onClick={() => handleRate(idea.id, s)} style={{ fontSize: '16px', cursor: 'pointer', color: s <= (idea.rating || 0) ? '#FBBF24' : '#27272A' }}>★</span>
                          ))}
                        </div>
                        <span style={{ fontSize: '11px', color: '#52525B' }}>{new Date(idea.created_at).toLocaleDateString('es-ES')}</span>
                      </div>
                      <p style={{ fontSize: '15px', fontWeight: '800', color: '#FAFAFA', marginBottom: '14px', lineHeight: '1.4' }}>"{idea.hook}"</p>
                      <ul style={{ listStyle: 'none', padding: 0, marginBottom: '16px', flex: 1 }}>
                        {(idea.bullets || []).slice(0, 3).map((b, i) => (
                          <li key={i} style={{ fontSize: '13px', color: '#71717A', padding: '3px 0', display: 'flex', gap: '8px' }}>
                            <span style={{ color: '#4F46E5', fontWeight: '900' }}>•</span> {b}
                          </li>
                        ))}
                      </ul>
                      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                        <button onClick={() => handleExpand(idea.id)} disabled={expandingId === idea.id} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#A1A1AA', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          {expandingId === idea.id ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />} Ver Guión
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ====== TENDENCIAS ====== */}
          {activeTab === 'trends' && (
            <div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
                {['reddit', 'tiktok', 'instagram', 'youtube'].map(p => {
                  const count = trendRefs.filter(r => r.platform === p).length;
                  return (
                    <div key={p} className="card-pro" style={{ flex: '1', minWidth: '130px', padding: '16px', textAlign: 'center', cursor: 'default' }}>
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{PLATFORM_EMOJI[p]}</div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#FAFAFA', textTransform: 'capitalize' }}>{p}</div>
                      <div style={{ fontSize: '11px', color: '#52525B', fontWeight: '600', marginTop: '4px' }}>{count} fuente{count !== 1 ? 's' : ''}</div>
                    </div>
                  );
                })}
                <div onClick={() => setAddSourceModal(true)} className="card-pro" style={{ flex: '1', minWidth: '130px', padding: '16px', textAlign: 'center', cursor: 'pointer', borderStyle: 'dashed' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>➕</div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#71717A' }}>Agregar</div>
                </div>
              </div>

              <p style={{ fontSize: '13px', fontWeight: '800', color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>🔥 Top tendencias</p>
              {trends.length === 0 ? (
                <div className="card-pro" style={{ padding: '40px', textAlign: 'center' }}>
                  <TrendingUp size={32} style={{ color: '#27272A', marginBottom: '12px' }} />
                  <p style={{ color: '#52525B', fontSize: '14px' }}>No se encontraron tendencias. Agrega fuentes de monitoreo.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
                  {trends.slice(0, 10).map((t, i) => (
                    <div key={i} className="card-pro" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '18px', fontWeight: '900', color: i < 3 ? '#FBBF24' : '#27272A', minWidth: '28px', textAlign: 'center' }}>{i + 1}</span>
                      <span style={{ fontSize: '22px' }}>{PLATFORM_EMOJI[t.platform] || '📰'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#FAFAFA', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.topic}</p>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#52525B', fontWeight: '600', marginTop: '4px' }}>
                          <span>{t.source}</span>
                          {t.comments && <span>💬 {t.comments}</span>}
                        </div>
                      </div>
                      {t.engagement_score > 0 && (
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#EF4444', whiteSpace: 'nowrap' }}>🔥 {t.engagement_score.toLocaleString()}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {trendRefs.length > 0 && (
                <>
                  <p style={{ fontSize: '13px', fontWeight: '800', color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>⚙️ Mis fuentes</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {trendRefs.map(ref => (
                      <div key={ref.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#111113', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 16px' }}>
                        <span style={{ fontSize: '18px' }}>{PLATFORM_EMOJI[ref.platform]}</span>
                        <span style={{ flex: 1, fontSize: '13px', fontWeight: '700', color: '#FAFAFA' }}>{ref.value}</span>
                        <span style={{ fontSize: '11px', color: '#52525B', fontWeight: '600', minWidth: '70px' }}>{ref.platform}</span>
                        <span style={{ fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>activo</span>
                        <button onClick={() => removeReference(ref.id)} style={{ background: 'none', border: 'none', color: '#3F3F46', cursor: 'pointer', fontSize: '16px', padding: '4px' }}>✕</button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ====== MI ESTILO ====== */}
          {activeTab === 'style' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '800', color: '#52525B', textTransform: 'uppercase' }}>Tu perfil de estilo</p>
                  <p style={{ fontSize: '12px', color: '#3F3F46', marginTop: '4px' }}>
                    {styleProfile?.total_posts_analyzed ? `Basado en ${styleProfile.total_posts_analyzed} videos analizados` : 'Analiza tus videos para generar tu perfil'}
                  </p>
                </div>
                <button onClick={analyzeStyle} disabled={loading} style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', border: 'none', color: '#fff', padding: '10px 18px', borderRadius: '10px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={14} /> Re-analizar
                </button>
              </div>

              {!styleProfile || styleProfile.message ? (
                <div className="card-pro" style={{ textAlign: 'center', padding: '60px 30px' }}>
                  <Palette size={40} style={{ color: '#27272A', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FAFAFA', marginBottom: '8px' }}>Sin perfil de estilo</h3>
                  <p style={{ color: '#71717A', fontSize: '14px', marginBottom: '20px' }}>{styleProfile?.message || 'Sube al menos 3 videos para que la IA analice tu estilo'}</p>
                  <button onClick={analyzeStyle} style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', border: 'none', color: '#fff', padding: '14px 28px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} /> Analizar Mi Estilo
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                    <div className="card-pro" style={{ padding: '24px', textAlign: 'center' }}>
                      <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎭</div>
                      <div style={{ fontSize: '11px', color: '#52525B', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px' }}>Tono</div>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#FAFAFA' }}>{styleProfile.tone || 'N/A'}</p>
                    </div>
                    <div className="card-pro" style={{ padding: '24px', textAlign: 'center' }}>
                      <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
                      <div style={{ fontSize: '11px', color: '#52525B', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px' }}>Formato Top</div>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#FAFAFA' }}>{(styleProfile.preferred_formats || []).join(', ') || 'N/A'}</p>
                    </div>
                    <div className="card-pro" style={{ padding: '24px', textAlign: 'center' }}>
                      <div style={{ fontSize: '32px', marginBottom: '12px' }}>📈</div>
                      <div style={{ fontSize: '11px', color: '#52525B', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px' }}>Engagement</div>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#FAFAFA' }}>{styleProfile.avg_engagement_rate || 0}%</p>
                    </div>
                  </div>

                  {styleProfile.hook_patterns && styleProfile.hook_patterns.length > 0 && (
                    <>
                      <p style={{ fontSize: '13px', fontWeight: '800', color: '#52525B', textTransform: 'uppercase', marginBottom: '16px' }}>🎣 Patrones de Hooks</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                        {styleProfile.hook_patterns.map((h, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ minWidth: '180px', fontSize: '14px', fontWeight: '700', color: '#A1A1AA' }}>{h.pattern || h}</span>
                            <div style={{ flex: 1, height: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '100px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', borderRadius: '100px', background: 'linear-gradient(90deg,#4F46E5,#7C3AED)', width: `${h.effectiveness || 50}%` }} />
                            </div>
                            <span style={{ minWidth: '60px', textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#818CF8' }}>{h.effectiveness || 50}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {styleProfile.common_themes && styleProfile.common_themes.length > 0 && (
                    <>
                      <p style={{ fontSize: '13px', fontWeight: '800', color: '#52525B', textTransform: 'uppercase', marginBottom: '16px' }}>📂 Temas Recurrentes</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '32px' }}>
                        {styleProfile.common_themes.map((t, i) => (
                          <div key={i} className="card-pro" style={{ padding: '18px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '800', color: '#FAFAFA', marginBottom: '4px' }}>{t.theme || t}</div>
                            {t.count && <div style={{ fontSize: '12px', color: '#52525B', fontWeight: '600' }}>{t.count} videos</div>}
                            {t.avg_score && <div style={{ fontSize: '12px', color: '#10B981', fontWeight: '700', marginTop: '4px' }}>Avg: {t.avg_score}</div>}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {styleProfile.best_posting_times && styleProfile.best_posting_times.best_day && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(251,191,36,0.1)', color: '#FBBF24', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
                      🏆 Mejor horario: {styleProfile.best_posting_times.best_day} a las {styleProfile.best_posting_times.best_hour}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* SCRIPT MODAL */}
      {scriptModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setScriptModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', width: '100%', maxWidth: '560px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: '#FAFAFA' }}><FileText size={18} /> Guión Expandido</h3>
              <button onClick={() => setScriptModal(null)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: '#71717A' }}><X size={16} /></button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Outfit, sans-serif', fontSize: '14px', color: '#A1A1AA', lineHeight: '1.7' }}>{scriptModal.script || 'Generando guión...'}</pre>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '10px' }}>
              <button onClick={() => { navigator.clipboard.writeText(scriptModal.script || ''); }} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#A1A1AA', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>📋 Copiar</button>
              <button onClick={() => setScriptModal(null)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>✓ Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SOURCE MODAL */}
      {addSourceModal && <AddSourceModal onClose={() => setAddSourceModal(false)} onAdd={addReference} />}

      <style>{`
        @keyframes sparkFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sparkSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .ib-swipe-card { transition: transform 0.3s ease, opacity 0.3s ease; }
        .ib-swipe-left { transform: translateX(-200px) rotate(-10deg) !important; opacity: 0 !important; }
        .ib-swipe-right { transform: translateX(200px) rotate(10deg) !important; opacity: 0 !important; }
        .ib-action-btn {
          width: 52px; height: 52px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.1); background: transparent;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .ib-skip { color: #EF4444; }
        .ib-skip:hover { border-color: #EF4444; background: rgba(239,68,68,0.1); transform: scale(1.1); }
        .ib-expand { color: #818CF8; }
        .ib-expand:hover { border-color: #818CF8; background: rgba(129,140,248,0.1); transform: scale(1.1); }
        .ib-star { color: #FBBF24; }
        .ib-star:hover { border-color: #FBBF24; background: rgba(251,191,36,0.1); transform: scale(1.1); }
        .ib-save { color: #10B981; }
        .ib-save:hover { border-color: #10B981; background: rgba(16,185,129,0.1); transform: scale(1.1); }
        @media (max-width: 768px) {
          .ib-action-btn { width: 44px; height: 44px; }
        }
      `}</style>
    </div>
  );
};

const AddSourceModal = ({ onClose, onAdd }) => {
  const [platform, setPlatform] = useState('reddit');
  const [type, setType] = useState('subreddit');
  const [value, setValue] = useState('');

  const typeOptions = {
    reddit: ['subreddit'], tiktok: ['hashtag', 'profile'], instagram: ['hashtag', 'profile'], youtube: ['channel', 'category']
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', color: '#FAFAFA' }}>
          Agregar Fuente <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#52525B', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </h3>
        <label style={{ fontSize: '11px', fontWeight: '800', color: '#71717A', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Plataforma</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {['reddit', 'tiktok', 'instagram', 'youtube'].map(p => (
            <button key={p} onClick={() => { setPlatform(p); setType(typeOptions[p][0]); }} style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)',
              background: platform === p ? '#4F46E5' : 'transparent', color: platform === p ? '#fff' : '#71717A',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer', textAlign: 'center', textTransform: 'capitalize'
            }}>{PLATFORM_EMOJI[p]} {p}</button>
          ))}
        </div>
        <label style={{ fontSize: '11px', fontWeight: '800', color: '#71717A', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Tipo</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {typeOptions[platform].map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)',
              background: type === t ? 'rgba(79,70,229,0.1)' : 'transparent', color: type === t ? '#818CF8' : '#71717A',
              fontSize: '12px', fontWeight: '600', cursor: 'pointer', textTransform: 'capitalize'
            }}>{t}</button>
          ))}
        </div>
        <label style={{ fontSize: '11px', fontWeight: '800', color: '#71717A', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Valor</label>
        <input value={value} onChange={e => setValue(e.target.value)} placeholder={
          platform === 'reddit' ? 'Nombre del subreddit (ej: socialmedia)' :
          platform === 'youtube' ? 'Búsqueda (ej: viral tiktok 2026)' :
          platform === 'tiktok' ? type === 'hashtag' ? '#tendencia' : '@usuario' :
          platform === 'instagram' ? type === 'hashtag' ? '#marketing' : '@usuario' : ''
        }
          style={{ width: '100%', background: '#1C1C1F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 16px', color: '#FAFAFA', fontSize: '14px', marginBottom: '12px', outline: 'none', fontFamily: 'Outfit, sans-serif' }}
        />
        <div style={{ fontSize: '11px', color: '#52525B', marginBottom: '20px', lineHeight: 1.5 }}>
          {platform === 'reddit' && '💡 Escribe solo el nombre del subreddit sin r/ ni espacios. Ej: contentcreation, musicproduction'}
          {platform === 'youtube' && '💡 Escribe lo que buscarías en YouTube. Encuentra videos virales de las últimas 48 horas.'}
          {platform === 'tiktok' && '💡 Próximamente — monitoreo de hashtags y perfiles de TikTok.'}
          {platform === 'instagram' && '💡 Próximamente — monitoreo de hashtags y perfiles de Instagram.'}
        </div>
        <button onClick={() => value.trim() && onAdd(type, value.trim(), platform)} disabled={!value.trim()} style={{
          width: '100%', padding: '14px', border: 'none', borderRadius: '12px',
          background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', fontWeight: '800', fontSize: '14px', cursor: 'pointer', opacity: value.trim() ? 1 : 0.5
        }}>Agregar Fuente</button>
      </div>
    </div>
  );
};

export default IdeaBankView;
