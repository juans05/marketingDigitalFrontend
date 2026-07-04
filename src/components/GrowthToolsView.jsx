import { useState, useEffect } from 'react';
import { Loader2, Copy, Check, Film, Megaphone, FlaskConical, AlertCircle } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const getToken = () => { try { return JSON.parse(localStorage.getItem('vidalis_user') || '{}').token || ''; } catch { return ''; } };
const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` });

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: copied ? '#10B981' : '#71717A', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600' }}>
      {copied ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
    </button>
  );
};

const GrowthToolsView = ({ artistId }) => {
  const [tab, setTab] = useState('ab');
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [abResult, setAbResult] = useState(null);
  const [adCopies, setAdCopies] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (artistId) fetchVideos();
  }, [artistId]);

  const fetchVideos = async () => {
    setLoadingVideos(true);
    try {
      const res = await fetch(`${API}/api/vidalis/gallery/${artistId}`, { headers: headers() });
      if (res.ok) {
        const data = await res.json();
        const ready = (data.videos || data || []).filter(v => v.status === 'ready' || v.status === 'published');
        setVideos(ready);
      }
    } catch (e) { console.error(e); }
    setLoadingVideos(false);
  };

  const handleABTest = async () => {
    if (!selectedVideo) return;
    setGenerating(true); setError(''); setAbResult(null);
    try {
      let res = await fetch(`${API}/api/vidalis/videos/${selectedVideo.id}/ab-result`, { headers: headers() });
      if (res.ok) {
        setAbResult(await res.json());
      } else {
        res = await fetch(`${API}/api/vidalis/videos/${selectedVideo.id}/ab-variants`, { method: 'POST', headers: headers() });
        const data = await res.json();
        if (res.ok) { setAbResult(data); }
        else if (res.status === 402) { setError(`Sparks insuficientes. Necesitas 10 ⚡ (tienes ${data.current}).`); }
        else { setError(data.error || 'Error generando AB test'); }
      }
    } catch (e) { console.log(e); setError(e.message); }
    setGenerating(false);
  };

  const handleAdCopy = async () => {
    if (!selectedVideo) return;
    setGenerating(true); setError(''); setAdCopies([]);
    try {
      const res = await fetch(`${API}/api/vidalis/videos/${selectedVideo.id}/ad-copy`, { method: 'POST', headers: headers() });
      const data = await res.json();
      if (res.ok) { setAdCopies(Array.isArray(data) ? data : data.copies || []); }
      else if (res.status === 402) { setError(`Sparks insuficientes. Necesitas 10 ⚡ (tienes ${data.current}).`); }
      else { setError(data.error || 'Error generando ad copy'); }
    } catch (e) { console.log(e); setError(e.message); }
    setGenerating(false);
  };

  if (loadingVideos) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#71717A' }}>
      <Loader2 className="animate-spin" size={28} style={{ margin: '0 auto 12px', color: '#818CF8' }} />
    </div>
  );

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => { setTab('ab'); setAbResult(null); setError(''); }}
          style={{ ...tabStyle, color: tab === 'ab' ? '#818CF8' : '#52525B', borderBottomColor: tab === 'ab' ? '#818CF8' : 'transparent' }}>
          <FlaskConical size={14} /> A/B Testing <span style={sparkBadge}>10⚡</span>
        </button>
        <button onClick={() => { setTab('ad'); setAdCopies([]); setError(''); }}
          style={{ ...tabStyle, color: tab === 'ad' ? '#F59E0B' : '#52525B', borderBottomColor: tab === 'ad' ? '#F59E0B' : 'transparent' }}>
          <Megaphone size={14} /> Ad Copy <span style={sparkBadge}>10⚡</span>
        </button>
      </div>

      {/* Video Selector */}
      <div style={{ ...cardStyle, marginBottom: '20px' }}>
        <label style={{ fontSize: '11px', fontWeight: '700', color: '#52525B', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
          Selecciona un video
        </label>
        {videos.length === 0 ? (
          <p style={{ color: '#52525B', fontSize: '13px' }}>No hay videos listos. Sube y analiza contenido primero.</p>
        ) : (
          <select value={selectedVideo?.id || ''} onChange={e => { const v = videos.find(x => x.id === e.target.value); setSelectedVideo(v || null); setAbResult(null); setAdCopies([]); setError(''); }}
            style={{ width: '100%', background: '#1C1C1F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', color: '#FAFAFA', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
            <option value="">— Elige un video —</option>
            {videos.map(v => <option key={v.id} value={v.id}>{v.title || 'Video sin título'}</option>)}
          </select>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '14px 18px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={16} color="#EF4444" />
          <span style={{ fontSize: '13px', color: '#FCA5A5' }}>{error}</span>
        </div>
      )}

      {/* Generate Button */}
      {selectedVideo && (
        <button onClick={tab === 'ab' ? handleABTest : handleAdCopy} disabled={generating}
          style={{
            width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: generating ? 'default' : 'pointer',
            background: generating ? 'rgba(255,255,255,0.06)' : tab === 'ab' ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : 'linear-gradient(135deg, #F59E0B, #D97706)',
            color: generating ? '#71717A' : '#fff', fontSize: '14px', fontWeight: '700',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px',
          }}>
          {generating ? <><Loader2 size={16} className="animate-spin" /> Generando...</> :
            tab === 'ab' ? <><FlaskConical size={16} /> Generar A/B Test (10⚡)</> : <><Megaphone size={16} /> Generar Ad Copy (10⚡)</>}
        </button>
      )}

      {/* AB Test Results */}
      {tab === 'ab' && abResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>VARIANTES GENERADAS</div>

          {(abResult.variants || []).map((variant, i) => {
            const varColors = ['#818CF8', '#F59E0B', '#10B981'];
            const varLabels = ['Humor', 'Emotivo', 'Directo'];
            const color = varColors[i] || '#818CF8';
            return (
            <div key={i} style={{ ...cardStyle, borderLeft: `3px solid ${color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#FAFAFA' }}>Variante {String.fromCharCode(65 + i)}</span>
                  <span style={{ fontSize: '10px', fontWeight: '700', color, background: `${color}18`, padding: '2px 8px', borderRadius: '20px', border: `1px solid ${color}33` }}>{varLabels[i] || ''}</span>
                </div>
                <CopyButton text={variant.caption || ''} />
              </div>

              {variant.caption && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={fieldLabel}>CAPTION</div>
                  <div style={{ ...fieldBox, whiteSpace: 'pre-wrap' }}>{variant.caption}</div>
                </div>
              )}
              {variant.engagement_hook && (
                <div style={{ fontSize: '11px', color: '#71717A', fontStyle: 'italic' }}>
                  💡 {variant.engagement_hook}
                </div>
              )}
              {variant.char_count > 0 && (
                <div style={{ fontSize: '10px', color: '#3F3F46', marginTop: '6px', textAlign: 'right' }}>
                  {variant.char_count} caracteres
                </div>
              )}
            </div>
            );
          })}

          {abResult.recommendation && (
            <div style={{ ...cardStyle, background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.15)' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#10B981', textTransform: 'uppercase', marginBottom: '8px' }}>RECOMENDACIÓN</div>
              <p style={{ fontSize: '13px', color: '#E2E8F0', lineHeight: '1.6', margin: 0 }}>{abResult.recommendation}</p>
            </div>
          )}
        </div>
      )}

      {/* Ad Copy Results */}
      {tab === 'ad' && adCopies.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>COPIES GENERADOS</div>

          {adCopies.map((copy, i) => {
            const platColors = { meta: '#1877F2', tiktok: '#69C9D0', google: '#34A853' };
            const platLabels = { meta: 'Meta Ads', tiktok: 'TikTok Ads', google: 'Google Ads' };
            const color = platColors[copy.platform] || '#F59E0B';
            const label = platLabels[copy.platform] || copy.platform || 'Ad Copy';

            return (
              <div key={i} style={{ ...cardStyle, borderLeft: `3px solid ${color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color, background: `${color}18`, padding: '3px 10px', borderRadius: '20px', border: `1px solid ${color}33` }}>{label}</span>
                  <CopyButton text={`${copy.headline || ''}\n\n${copy.primaryText || copy.primary_text || ''}\n\n${copy.cta || ''}`} />
                </div>

                {(copy.headline) && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={fieldLabel}>HEADLINE</div>
                    <div style={fieldBox}>{copy.headline}</div>
                  </div>
                )}
                {(copy.primaryText || copy.primary_text) && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={fieldLabel}>TEXTO PRINCIPAL</div>
                    <div style={fieldBox}>{copy.primaryText || copy.primary_text}</div>
                  </div>
                )}
                {copy.cta && (
                  <div>
                    <div style={fieldLabel}>CTA</div>
                    <div style={{ ...fieldBox, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B', fontWeight: '600' }}>{copy.cta}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!selectedVideo && (
        <div style={{ textAlign: 'center', padding: '60px 20px', ...cardStyle }}>
          <Film size={40} color="#3F3F46" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#71717A' }}>
            {tab === 'ab' ? 'Genera variantes A/B de tu contenido' : 'Genera copy listo para anuncios'}
          </h3>
          <p style={{ fontSize: '13px', color: '#52525B', maxWidth: '400px', margin: '8px auto 0' }}>
            {tab === 'ab'
              ? 'Selecciona un video y la IA generará hooks, descripciones y hashtags alternativos para probar cuál funciona mejor.'
              : 'Selecciona un video y la IA generará copy optimizado para Meta Ads y TikTok Ads, listo para copiar y pegar.'}
          </p>
        </div>
      )}
    </div>
  );
};

const tabStyle = { padding: '10px 18px', background: 'none', border: 'none', borderBottom: '2px solid transparent', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '-1px', transition: 'all 0.2s' };
const sparkBadge = { fontSize: '9px', fontWeight: '800', color: '#F59E0B', background: 'rgba(245,158,11,0.12)', padding: '2px 6px', borderRadius: '4px' };
const cardStyle = { padding: '20px', borderRadius: '14px', background: '#111113', border: '1px solid rgba(255,255,255,0.06)' };
const fieldLabel = { fontSize: '10px', fontWeight: '700', color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' };
const fieldBox = { padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '13px', color: '#E2E8F0', lineHeight: '1.6' };

export default GrowthToolsView;
