import { useState, useRef, useEffect } from 'react';
import { Film, Image, Link, Loader2, Copy, Check, RefreshCw, X, Upload, AlertCircle, ShieldCheck } from 'lucide-react';

// ── Viral Score Ring SVG ──────────────────────────────────────────────────────
const ViralScoreRing = ({ score, animate }) => {
  const r = 90;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width="192" height="192" style={{ transform: 'rotate(-90deg)' }}>
      <defs>
        <linearGradient id="vsr-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#aa0266" />
        </linearGradient>
      </defs>
      <circle cx="96" cy="96" r={r} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
      <circle
        cx="96" cy="96" r={r}
        fill="transparent"
        stroke="url(#vsr-grad)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={animate ? offset : circ}
        style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
};

// ── Copy button ───────────────────────────────────────────────────────────────
const CopyBtn = ({ text, accent }) => {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const color = accent === 'secondary' ? '#ffb0cd' : '#d2bbff';
  const bg = accent === 'secondary' ? 'rgba(255,176,205,0.15)' : 'rgba(210,187,255,0.15)';
  return (
    <button
      onClick={handle}
      style={{
        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
        padding: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer',
        background: copied ? 'rgba(78,222,163,0.15)' : bg,
        color: copied ? '#4edea3' : color,
        opacity: 0, transition: 'opacity 0.2s',
      }}
      className="copy-reveal-btn"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
};

// ── Glass panel ───────────────────────────────────────────────────────────────
const Glass = ({ children, style = {} }) => (
  <div style={{
    backdropFilter: 'blur(16px)',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '16px',
    ...style,
  }}>
    {children}
  </div>
);

const TONES = [
  { id: 'fun',           label: 'Fun',           emoji: '🎉' },
  { id: 'controversial', label: 'Controversial',  emoji: '📢' },
  { id: 'educational',   label: 'Educational',    emoji: '🎓' },
  { id: 'inspirational', label: 'Inspirational',  emoji: '📈' },
];

const PLATFORMS = [
  { id: 'tiktok',   label: 'TikTok / Reels',   sub: 'Optimizado para alta retención',  bg: '#000', icon: '⚡' },
  { id: 'youtube',  label: 'YouTube Shorts',    sub: 'Optimizado para alcance & SEO',   bg: '#FF0000', icon: '▶' },
];

// ── Main Component ────────────────────────────────────────────────────────────
const ContentCopilot = ({ artistId, onUploadSuccess }) => {
  const [script, setScript]     = useState('');
  const [title, setTitle]       = useState('');
  const [tone, setTone]         = useState('controversial');
  const [platform, setPlatform] = useState('tiktok');
  const [file, setFile]         = useState(null);
  const [fileError, setFileError] = useState('');
  const [uploadPhase, setUploadPhase] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult]     = useState(null);
  const [animScore, setAnimScore] = useState(false);
  const [scoreCount, setScoreCount] = useState(0);

  const fileRef = useRef(null);
  const API     = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  const getToken = () => {
    try { return JSON.parse(localStorage.getItem('vidalis_user') || '{}').token || ''; }
    catch { return ''; }
  };

  // Animate score counter when result arrives
  useEffect(() => {
    if (!result) return;
    setAnimScore(false);
    setScoreCount(0);
    const t = setTimeout(() => {
      setAnimScore(true);
      let start = null;
      const target = result.score;
      const step = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / 2000, 1);
        setScoreCount(Math.floor(progress * target));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 200);
    return () => clearTimeout(t);
  }, [result]);

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 80 * 1024 * 1024) { setFileError('Archivo mayor a 80MB'); return; }
    if (!f.type.startsWith('video/') && !f.type.startsWith('image/')) {
      setFileError('Solo se aceptan video o imagen');
      return;
    }
    setFileError('');
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const uploadFileToCloudinary = async (f) => {
    setUploadPhase('signing');
    const user = JSON.parse(localStorage.getItem('vidalis_user') || '{}');
    const folder = user.name?.replace(/\s+/g, '_').toLowerCase() || 'general';
    const resourceType = f.type.startsWith('video/') ? 'video' : 'image';

    const sigRes = await fetch(
      `${API}/api/vidalis/cloudinary-signature?folder=${folder}&resourceType=${resourceType}`,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    const sig = await sigRes.json();

    setUploadPhase('uploading');
    const fd = new FormData();
    fd.append('file', f);
    fd.append('api_key', sig.apiKey);
    fd.append('timestamp', sig.timestamp);
    fd.append('signature', sig.signature);
    fd.append('folder', sig.folder);
    fd.append('access_mode', 'public');
    fd.append('resource_type', resourceType);
    if (sig.eager) fd.append('eager', sig.eager);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/${resourceType}/upload`,
      { method: 'POST', body: fd }
    );
    const uploaded = await uploadRes.json();
    if (!uploadRes.ok) throw new Error('Error subiendo a Cloudinary');

    setUploadPhase('registering');
    await fetch(`${API}/api/vidalis/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoData: { title: title || f.name, source_url: uploaded.secure_url, artist_id: artistId, status: 'analyzing' }
      }),
    });

    setUploadPhase('');
    if (onUploadSuccess) onUploadSuccess();
    return uploaded.secure_url;
  };

  const handleAnalyze = async () => {
    if (!script.trim() && !file) return;
    setAnalyzing(true);
    setResult(null);

    try {
      // Upload file first if present
      if (file) await uploadFileToCloudinary(file);

      const res = await fetch(`${API}/api/vidalis/analyze-content`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: script || title || file?.name, tone, platform, artist_id: artistId }),
      });
      if (!res.ok) throw new Error('Error al analizar contenido');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Analyze error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const canAnalyze = (script.trim().length > 5 || (!!file && title.trim().length > 0)) && !analyzing;

  return (
    <>
      <style>{`
        .copy-reveal-wrap:hover .copy-reveal-btn { opacity: 1 !important; }
        @keyframes scoreGlow {
          0% { text-shadow: 0 0 0 transparent; }
          50% { text-shadow: 0 0 20px rgba(210,187,255,0.5); }
          100% { text-shadow: 0 0 0 transparent; }
        }
        @keyframes ccFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cc-fade-in { animation: ccFadeIn 0.5s ease forwards; }
        @media (max-width: 900px) {
          .cc-grid { flex-direction: column !important; }
          .cc-right { width: 100% !important; min-width: unset !important; }
          .cc-tones { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .cc-root { padding: 16px !important; }
          .cc-suggestions { grid-template-columns: 1fr !important; }
          .cc-tone-platform { grid-template-columns: 1fr !important; }
          .cc-diagnostico-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="cc-root" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ── HERO GRID ─────────────────────────────────────────────────── */}
        <div className="cc-grid" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

          {/* LEFT: Input Panel */}
          <Glass style={{ flex: 1, padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Input Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#d2bbff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Input Content
              </span>

              {/* Textarea */}
              <div style={{ position: 'relative' }}>
                <textarea
                  value={script}
                  onChange={e => setScript(e.target.value)}
                  placeholder="Pega tu link de video o el script aquí..."
                  rows={5}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', padding: '14px 14px 48px',
                    color: '#e7dff0', fontSize: '14px', resize: 'none',
                    outline: 'none', fontFamily: 'Inter, sans-serif',
                    lineHeight: '1.6',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <button
                  style={{
                    position: 'absolute', bottom: '10px', right: '10px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(210,187,255,0.3)',
                    background: 'rgba(210,187,255,0.08)', color: '#d2bbff',
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  }}
                  onClick={() => navigator.clipboard.readText().then(t => setScript(t)).catch(() => {})}
                >
                  <Link size={11} /> Pegar URL
                </button>
              </div>

              {/* Upload buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  onClick={() => { fileRef.current.accept = 'video/*'; fileRef.current.click(); }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', padding: '20px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px dashed rgba(255,255,255,0.15)',
                    borderRadius: '12px', cursor: 'pointer', color: 'rgba(204,195,216,0.7)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(210,187,255,0.5)'; e.currentTarget.style.color = '#d2bbff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(204,195,216,0.7)'; }}
                >
                  <Film size={28} />
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>Subir Video</span>
                </button>
                <button
                  onClick={() => { fileRef.current.accept = 'image/*'; fileRef.current.click(); }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', padding: '20px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px dashed rgba(255,255,255,0.15)',
                    borderRadius: '12px', cursor: 'pointer', color: 'rgba(204,195,216,0.7)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,176,205,0.5)'; e.currentTarget.style.color = '#ffb0cd'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(204,195,216,0.7)'; }}
                >
                  <Image size={28} />
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>Subir Imagen</span>
                </button>
              </div>
              <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFileSelect} />

              {/* File selected indicator */}
              {file && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(78,222,163,0.08)', border: '1px solid rgba(78,222,163,0.2)', borderRadius: '10px' }}>
                    <ShieldCheck size={14} color="#4edea3" />
                    <span style={{ fontSize: '12px', color: '#4edea3', fontWeight: '600', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                    <button onClick={() => { setFile(null); setTitle(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4edea3', padding: '2px', display: 'flex' }}>
                      <X size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(204,195,216,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Título del contenido
                    </span>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Escribe un título para tu contenido..."
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px', padding: '12px 14px',
                        color: '#e7dff0', fontSize: '14px',
                        outline: 'none', fontFamily: 'Inter, sans-serif',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.6)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                </>
              )}
              {fileError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '12px' }}>
                  <AlertCircle size={13} /> {fileError}
                </div>
              )}

              {/* Upload progress */}
              {uploadPhase && (
                <div style={{ padding: '12px 14px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#d2bbff', marginBottom: '8px' }}>
                    <span>{uploadPhase === 'signing' ? 'Verificando seguridad' : uploadPhase === 'uploading' ? 'Subiendo archivo' : 'Registrando en IA'}</span>
                    <span>{uploadPhase === 'signing' ? '25%' : uploadPhase === 'uploading' ? '65%' : '95%'}</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '4px',
                      background: 'linear-gradient(90deg, #7c3aed, #aa0266)',
                      width: uploadPhase === 'signing' ? '25%' : uploadPhase === 'uploading' ? '65%' : '95%',
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
              )}
            </div>

            {/* Tone + Platform */}
            <div className="cc-tone-platform" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Tone */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(204,195,216,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '10px' }}>
                  Tono objetivo
                </span>
                <div className="cc-tones" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {TONES.map(t => {
                    const active = tone === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTone(t.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          padding: '10px 8px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                          border: active ? '1px solid rgba(210,187,255,0.6)' : '1px solid rgba(255,255,255,0.08)',
                          background: active ? 'rgba(210,187,255,0.15)' : 'rgba(255,255,255,0.03)',
                          color: active ? '#d2bbff' : 'rgba(204,195,216,0.7)',
                          boxShadow: active ? '0 0 12px rgba(210,187,255,0.1)' : 'none',
                          transition: 'all 0.2s',
                        }}
                      >
                        <span style={{ fontSize: '14px' }}>{t.emoji}</span> {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Platform */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(204,195,216,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '10px' }}>
                  Plataforma
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {PLATFORMS.map(p => {
                    const active = platform === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setPlatform(p.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0, border: '1px solid rgba(255,255,255,0.15)' }}>
                          {p.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: '#e7dff0', margin: 0 }}>{p.label}</p>
                          <p style={{ fontSize: '10px', color: 'rgba(204,195,216,0.5)', margin: 0 }}>{p.sub}</p>
                        </div>
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                          border: `2px solid ${active ? '#7c3aed' : 'rgba(255,255,255,0.2)'}`,
                          background: active ? '#7c3aed' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {active && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              style={{
                width: '100%', padding: '16px', borderRadius: '14px',
                background: canAnalyze ? 'linear-gradient(135deg, #7c3aed 0%, #aa0266 100%)' : 'rgba(255,255,255,0.06)',
                border: 'none', color: canAnalyze ? '#fff' : 'rgba(204,195,216,0.3)',
                fontSize: '15px', fontWeight: '700', cursor: canAnalyze ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                boxShadow: canAnalyze ? '0 8px 24px rgba(124,58,237,0.3)' : 'none',
                transition: 'all 0.3s',
              }}
            >
              {analyzing ? (
                <><Loader2 size={16} className="animate-spin" /> Analizando estrategia...</>
              ) : (
                <><span style={{ fontSize: '16px' }}>⚡</span> Analizar Estrategia de Contenido</>
              )}
            </button>
          </Glass>

          {/* RIGHT: Score + Audience */}
          <div className="cc-right" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '260px', width: '300px' }}>

            {/* Viral Score */}
            <Glass style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', background: 'rgba(124,58,237,0.2)', borderRadius: '50%', filter: 'blur(50px)' }} />
              <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '120px', height: '120px', background: 'rgba(170,2,102,0.2)', borderRadius: '50%', filter: 'blur(50px)' }} />
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#ffb0cd', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                Potencial Viral
              </span>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ViralScoreRing score={result?.score || 0} animate={animScore} />
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '48px', fontWeight: '800', color: '#e7dff0', lineHeight: 1,
                    fontFamily: 'Outfit, sans-serif',
                    ...(animScore ? { animation: 'scoreGlow 1s ease' } : {}),
                  }}>
                    {result ? scoreCount : '—'}
                  </span>
                  <span style={{ fontSize: '12px', color: 'rgba(204,195,216,0.5)', marginTop: '4px' }}>/ 100</span>
                </div>
              </div>
              {result?.score_confidence && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} className="cc-fade-in">
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: result.score_confidence === 'high' ? '#10B981' : result.score_confidence === 'medium' ? '#F59E0B' : '#EF4444',
                  }} />
                  <span style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(204,195,216,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Confianza: {result.score_confidence === 'high' ? 'Alta' : result.score_confidence === 'medium' ? 'Media' : 'Baja'}
                    {result.score_raw !== undefined && result.score_raw !== result.score && ` (crudo: ${result.score_raw})`}
                  </span>
                </div>
              )}
              {result?.tags && (
                <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px' }} className="cc-fade-in">
                  {result.tags.map((tag, i) => {
                    const colors = ['#4edea3', '#d2bbff', '#ffb0cd'];
                    const bgs = ['rgba(78,222,163,0.1)', 'rgba(210,187,255,0.1)', 'rgba(255,176,205,0.1)'];
                    const borders = ['rgba(78,222,163,0.25)', 'rgba(210,187,255,0.25)', 'rgba(255,176,205,0.25)'];
                    return (
                      <span key={i} style={{
                        padding: '4px 10px', borderRadius: '999px', fontSize: '10px', fontWeight: '700',
                        color: colors[i % 3], background: bgs[i % 3], border: `1px solid ${borders[i % 3]}`,
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>
                        {tag}
                      </span>
                    );
                  })}
                </div>
              )}
              {!result && (
                <p style={{ fontSize: '12px', color: 'rgba(204,195,216,0.35)', textAlign: 'center', marginTop: '12px' }}>
                  Ingresa tu contenido y presiona analizar
                </p>
              )}
            </Glass>

            {/* Audience Insight */}
            {result?.audience && (
              <Glass style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }} className="cc-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#e7dff0' }}>Audiencia</span>
                  <span style={{ fontSize: '18px' }}>👥</span>
                </div>
                <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', borderLeft: '2px solid #7c3aed' }}>
                  <p style={{ fontSize: '11px', color: 'rgba(204,195,216,0.5)', margin: '0 0 4px 0' }}>Demografía principal</p>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#e7dff0', margin: 0, fontFamily: 'Outfit, sans-serif' }}>{result.audience.demographic}</p>
                </div>
                <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', borderLeft: '2px solid #aa0266' }}>
                  <p style={{ fontSize: '11px', color: 'rgba(204,195,216,0.5)', margin: '0 0 4px 0' }}>Pico de engagement</p>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#e7dff0', margin: 0, fontFamily: 'Outfit, sans-serif' }}>{result.audience.peakTime}</p>
                </div>
              </Glass>
            )}
          </div>
        </div>

        {/* ── RESULTS ───────────────────────────────────────────────────── */}
        {result && (
          <div className="cc-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Diagnóstico Algorítmico */}
            {(result.diagnostico_algoritmico || result.match_historico || result.mejora_del_gancho || result.ajuste_estrategico) && (
              <Glass style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '16px' }}>🧠</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Diagnóstico Algorítmico
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="cc-diagnostico-grid">
                  {result.diagnostico_algoritmico && (
                    <div style={{ padding: '14px', background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.15)', borderRadius: '10px' }}>
                      <p style={{ fontSize: '10px', fontWeight: '700', color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px 0' }}>Predicción del Algoritmo</p>
                      <p style={{ fontSize: '13px', color: '#e7dff0', lineHeight: '1.6', margin: 0 }}>{result.diagnostico_algoritmico}</p>
                    </div>
                  )}
                  {result.match_historico && (
                    <div style={{ padding: '14px', background: 'rgba(78,222,163,0.06)', border: '1px solid rgba(78,222,163,0.15)', borderRadius: '10px' }}>
                      <p style={{ fontSize: '10px', fontWeight: '700', color: '#4edea3', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px 0' }}>Match con tu Historial</p>
                      <p style={{ fontSize: '13px', color: '#e7dff0', lineHeight: '1.6', margin: 0 }}>{result.match_historico}</p>
                    </div>
                  )}
                  {result.mejora_del_gancho && (
                    <div style={{ padding: '14px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '10px' }}>
                      <p style={{ fontSize: '10px', fontWeight: '700', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px 0' }}>Gancho Mejorado (3 seg)</p>
                      <p style={{ fontSize: '13px', color: '#e7dff0', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>{result.mejora_del_gancho}</p>
                    </div>
                  )}
                  {result.ajuste_estrategico && (
                    <div style={{ padding: '14px', background: 'rgba(255,176,205,0.06)', border: '1px solid rgba(255,176,205,0.15)', borderRadius: '10px' }}>
                      <p style={{ fontSize: '10px', fontWeight: '700', color: '#ffb0cd', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px 0' }}>Ajuste Estratégico</p>
                      <p style={{ fontSize: '13px', color: '#e7dff0', lineHeight: '1.6', margin: 0 }}>{result.ajuste_estrategico}</p>
                    </div>
                  )}
                </div>
              </Glass>
            )}

            {/* Strategic Suggestions */}
            <Glass style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#e7dff0', margin: 0 }}>Sugerencias Estratégicas</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e7dff0', fontSize: '12px', cursor: 'pointer' }}
                    onClick={handleAnalyze}
                  >
                    <RefreshCw size={12} style={{ display: 'inline', marginRight: '5px' }} />
                    Generar más
                  </button>
                </div>
              </div>

              <div className="cc-suggestions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Hooks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>⚓</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#d2bbff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Viral Hooks</span>
                  </div>
                  {(result.hooks || []).map((hook, i) => (
                    <div key={i} className="copy-reveal-wrap" style={{ position: 'relative', padding: '14px 40px 14px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', cursor: 'default', transition: 'border-color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(210,187,255,0.3)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                    >
                      <p style={{ fontSize: '13px', color: '#e7dff0', lineHeight: '1.6', margin: 0 }}>{hook}</p>
                      <CopyBtn text={hook} accent="primary" />
                    </div>
                  ))}
                </div>

                {/* Descriptions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>📝</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#ffb0cd', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Descripciones</span>
                  </div>
                  {(result.descriptions || []).map((desc, i) => (
                    <div key={i} className="copy-reveal-wrap" style={{ position: 'relative', padding: '14px 40px 14px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', cursor: 'default', transition: 'border-color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,176,205,0.3)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                    >
                      <p style={{ fontSize: '13px', color: '#e7dff0', lineHeight: '1.6', margin: 0 }}>{desc}</p>
                      <CopyBtn text={desc} accent="secondary" />
                    </div>
                  ))}
                </div>
              </div>
            </Glass>

            {/* Improvements */}
            {result.improvements?.length > 0 && (
              <Glass style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '16px' }}>🚀</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Cómo mejorar tu score
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {result.improvements.map((tip, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '12px', alignItems: 'flex-start',
                      padding: '14px', background: 'rgba(245,158,11,0.05)',
                      border: '1px solid rgba(245,158,11,0.15)', borderRadius: '10px',
                    }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#f59e0b', flexShrink: 0, marginTop: '1px' }}>{i + 1}.</span>
                      <p style={{ fontSize: '13px', color: '#e7dff0', lineHeight: '1.6', margin: 0 }}>{tip}</p>
                    </div>
                  ))}
                </div>
              </Glass>
            )}

            {/* Visual & Scene Breakdown */}
            {result.visualBreakdown && (
              <Glass style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '16px' }}>🎬</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#4edea3', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Visual & Scene Breakdown
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  {result.visualBreakdown.map((item, i) => (
                    <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(78,222,163,0.1)', borderRadius: '12px', transition: 'border-color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(78,222,163,0.3)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(78,222,163,0.1)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#4edea3' }}>{item.title}</span>
                        <span style={{ padding: '2px 8px', background: 'rgba(78,222,163,0.1)', color: '#4edea3', borderRadius: '4px', fontSize: '9px', fontWeight: '800' }}>APLICAR</span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#e7dff0', lineHeight: '1.5', margin: 0 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </Glass>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ContentCopilot;
