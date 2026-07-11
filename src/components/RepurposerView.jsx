// src/components/RepurposerView.jsx
import { useState, useEffect, useRef } from 'react';
import { Upload, Loader2, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const getToken = () => { try { return JSON.parse(localStorage.getItem('vidalis_user') || '{}').token || ''; } catch { return ''; } };
const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` });

const MAX_DURATION_SECONDS = 7200; // 2 horas

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const PROCESSING_STEPS = [
  'Transcribiendo el audio',
  'Detectando los mejores momentos',
  'Generando los clips',
  'Validando la calidad visual',
  'Calculando el score de cada clip',
  'Guardando los clips',
];

// Mapea la etapa que reporta el backend (ai_clips_data.stage) al índice del
// paso. Debe coincidir con los stages que emite generateClipsMultiIA() en
// src/services/repurposerService.js del backend (transcribing → analyzing →
// generating → validating → scoring → persisting → completed).
const STAGE_TO_STEP = {
  transcribing: 0,
  analyzing: 1,
  generating: 2,
  validating: 3,
  scoring: 4,
  persisting: 5,
};

const ScoreBadge = ({ score }) => {
  const s = score || 0;
  const color = s >= 8 ? '#10B981' : s >= 5 ? '#F59E0B' : '#71717A';
  return (
    <span style={{ background: color, color: '#0A0A0B', fontWeight: 800, fontSize: '12px', padding: '2px 8px', borderRadius: '100px' }}>
      {s.toFixed(1)}
    </span>
  );
};

const RepurposerView = ({ artistId, activePlatforms = [], artistGenre = '' }) => {
  const [phase, setPhase] = useState('idle'); // idle | processing | gallery
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploadPhase, setUploadPhase] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [clips, setClips] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [clipProgress, setClipProgress] = useState(null); // { current, total } | null
  const [platform, setPlatform] = useState('');
  const [useArtistGenre, setUseArtistGenre] = useState(true);
  const [customNiche, setCustomNiche] = useState('');
  const [rescoringId, setRescoringId] = useState(null);
  const [rescorePlatform, setRescorePlatform] = useState({});
  const pollRef = useRef(null);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const handleFileChange = (f) => {
    if (!f) return;
    if (!f.type.startsWith('video/')) {
      setError('Solo se aceptan archivos de video');
      return;
    }
    setError('');
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const fetchClips = async (id) => {
    try {
      const res = await fetch(`${API}/api/vidalis/clips/${id}`, { headers: headers() });
      const data = await res.json();
      setClips(Array.isArray(data) ? data : []);
      setPhase('gallery');
    } catch (err) {
      console.error('Error cargando los clips generados:', err);
      setError('Error cargando los clips generados');
    }
  };

  const handleRescore = async (clipId, newPlatform) => {
    setRescoringId(clipId);
    try {
      const res = await fetch(`${API}/api/vidalis/clips/${clipId}/rescore`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ platform: newPlatform, niche: useArtistGenre ? artistGenre : customNiche }),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || 'Error al re-puntuar el clip');
      setClips((prev) => prev.map((c) => (c.id === clipId ? { ...c, clip_impact_score: updated.score, ai_copy_short: updated.copy_short, hashtags: (updated.hashtags_suggested || []).join(' ') } : c)));
    } catch (err) {
      setError(err.message);
    } finally {
      setRescoringId(null);
    }
  };

  const handlePublish = async (clipId, clipPlatform) => {
    try {
      const res = await fetch(`${API}/api/vidalis/publish-now/${clipId}`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ platforms: [clipPlatform] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al publicar el clip');
    } catch (err) {
      setError(err.message);
    }
  };

  const startPolling = (id) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/vidalis/video/${id}`, { headers: headers() });
        const video = await res.json();
        if (video.status === 'ready') {
          clearInterval(pollRef.current);
          await fetchClips(id);
        } else if (video.status === 'failed') {
          clearInterval(pollRef.current);
          let message = 'No se pudieron generar los clips';
          try { message = JSON.parse(video.error_log)?.message || message; } catch { /* error_log no es JSON */ }
          setError(message);
          setPhase('idle');
        } else {
          // En progreso: reflejar la etapa actual que reporta el backend
          const stage = video.ai_clips_data?.stage;
          if (stage && STAGE_TO_STEP[stage] !== undefined) setCurrentStep(STAGE_TO_STEP[stage]);

          const { currentClip, totalClips } = video.ai_clips_data || {};
          setClipProgress(totalClips ? { current: currentClip || 0, total: totalClips } : null);
        }
      } catch (err) {
        console.error('Error consultando estado del video:', err);
      }
    }, 4000);
  };

  const handleUpload = async () => {
    if (!file || !platform) return;
    setError('');
    try {
      setUploadPhase('signing');
      setUploadProgress(0);

      // 1. Pedir URL prefirmada al backend
      const presignRes = await fetch(`${API}/api/vidalis/repurpose/presign`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ artistId, filename: file.name, contentType: file.type || 'video/mp4' }),
      });
      const presign = await presignRes.json();
      if (!presignRes.ok) throw new Error(presign.error || 'No se pudo iniciar la subida');

      // 2. PUT directo a R2 con progreso real (el archivo no pasa por el backend)
      setUploadPhase('uploading');
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', presign.uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300)
          ? resolve()
          : reject(new Error('Falló la subida del archivo a R2'));
        xhr.onerror = () => reject(new Error('Error de red al subir el archivo'));
        xhr.send(file);
      });

      // 3. Registrar el video con la URL pública de R2
      setUploadPhase('registering');
      const res = await fetch(`${API}/api/vidalis/repurpose/upload`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          artistId,
          sourceUrl: presign.sourceUrl,
          title: title || file.name,
          platform,
          niche: useArtistGenre ? artistGenre : customNiche,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error registrando el video');

      setCurrentStep(0);
      setClipProgress(null);
      setPhase('processing');
      setUploadPhase('');
      startPolling(data.id);
    } catch (err) {
      setError(err.message);
      setUploadPhase('');
    }
  };

  const reset = () => {
    setPhase('idle'); setFile(null); setTitle(''); setClips([]); setError('');
  };

  const uploadForm = (
    <div className="card-pro" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px' }}>
      <div style={{ color: '#fff', fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>Convierte un video largo en clips virales</div>
      <div style={{ color: '#B8B8C0', fontSize: '13px', marginBottom: '24px' }}>Sube tu podcast, entrevista o stream — la IA encuentra los mejores momentos</div>

      {error && (
        <div style={{ color: '#EF4444', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div style={{ width: '100%', maxWidth: '480px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <div style={{ color: '#B8B8C0', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Red social objetivo</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(activePlatforms.length ? activePlatforms : ['instagram', 'tiktok', 'youtube']).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                style={{
                  padding: '8px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 700,
                  border: platform === p ? '2px solid #7C3AED' : '1px solid rgba(255,255,255,0.15)',
                  background: platform === p ? 'rgba(124,58,237,0.15)' : 'transparent',
                  color: '#fff', cursor: 'pointer', textTransform: 'capitalize',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#B8B8C0', cursor: 'pointer' }}>
            <input type="checkbox" checked={useArtistGenre} onChange={(e) => setUseArtistGenre(e.target.checked)} />
            Usar género del artista {artistGenre ? `(${artistGenre})` : ''}
          </label>
          {!useArtistGenre && (
            <input
              type="text"
              value={customNiche}
              onChange={(e) => setCustomNiche(e.target.value)}
              placeholder="Ej: true crime, comedia, finanzas..."
              style={{ marginTop: '8px', width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: '#121214', color: '#fff', fontSize: '13px' }}
            />
          )}
        </div>
      </div>

      <label
        className="file-drop"
        style={{
          cursor: 'pointer', width: '100%', maxWidth: '480px',
          ...(file ? { background: '#132A1D', border: '2px solid #10B981' } : {}),
        }}
      >
        {file ? (
          <>
            <CheckCircle2 size={32} color="#10B981" />
            <div style={{ color: '#FFFFFF', fontWeight: 700, marginTop: '8px' }}>Video seleccionado</div>
            <div style={{ color: '#B8B8C0', fontSize: '13px', marginTop: '4px', wordBreak: 'break-all', padding: '0 12px' }}>
              {file.name}{file.size ? ` · ${formatFileSize(file.size)}` : ''}
            </div>
            <div style={{ color: '#7C9FFF', fontSize: '12px', marginTop: '10px', textDecoration: 'underline' }}>
              Cambiar archivo
            </div>
          </>
        ) : (
          <>
            <Upload size={32} />
            <div style={{ color: '#fff', fontWeight: 600, marginTop: '8px' }}>Arrastra tu video aquí o haz clic</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>MP4, MOV, WebM — máx 2 horas</div>
          </>
        )}
        <input type="file" accept="video/*" style={{ display: 'none' }} onChange={(e) => handleFileChange(e.target.files?.[0])} />
      </label>

      <button
        onClick={handleUpload}
        disabled={!file || !platform || !!uploadPhase}
        style={{ marginTop: '20px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, opacity: (!file || !platform || uploadPhase) ? 0.5 : 1 }}
      >
        {uploadPhase === 'signing' && 'Preparando subida...'}
        {uploadPhase === 'uploading' && `Subiendo video (${uploadProgress}%)...`}
        {uploadPhase === 'registering' && 'Iniciando análisis...'}
        {!uploadPhase && <><Sparkles size={16} style={{ marginRight: '6px' }} />Generar clips</>}
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {uploadForm}

      {phase === 'processing' && (
        <div className="card-pro" style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={40} className="animate-spin" style={{ color: '#7C3AED', marginBottom: '16px' }} />
          <div style={{ color: '#FFFFFF', fontWeight: 700, marginBottom: '4px' }}>
            {PROCESSING_STEPS[currentStep]}...
            {clipProgress && ` (${clipProgress.current}/${clipProgress.total})`}
          </div>
          <div style={{ color: '#6B6B75', fontSize: '12px', marginBottom: '16px' }}>Esto puede tardar varios minutos en videos largos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', width: '100%', maxWidth: '340px' }}>
            {PROCESSING_STEPS.map((step, i) => {
              const icon = i < currentStep ? '✅' : i === currentStep ? '🔵' : '⚪';
              const percent = i < currentStep
                ? 100
                : i > currentStep
                  ? 0
                  : clipProgress
                    ? Math.round((clipProgress.current / clipProgress.total) * 100)
                    : 0;
              return (
                <div key={step} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: i <= currentStep ? '#FFFFFF' : '#6B6B75', fontWeight: i === currentStep ? 700 : 400 }}>
                  <span>{icon} {step}</span>
                  <span style={{ color: i === currentStep ? '#7C3AED' : '#6B6B75', fontVariantNumeric: 'tabular-nums' }}>{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {phase === 'gallery' && clips.length > 0 && (
        <div>
          {clips.map((clip) => (
            <div key={clip.id} style={{ background: '#121214', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>{clip.title}</div>
              <ScoreBadge score={clip.clip_impact_score} />
              {clip.ai_copy_short && (
                <div style={{ color: '#B8B8C0', fontSize: '12px', marginTop: '8px' }}>{clip.ai_copy_short}</div>
              )}
              {clip.hashtags && (
                <div style={{ color: '#7C9FFF', fontSize: '11px', marginTop: '4px' }}>{clip.hashtags}</div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <select
                  value={rescorePlatform[clip.id] || ''}
                  onChange={(e) => setRescorePlatform((prev) => ({ ...prev, [clip.id]: e.target.value }))}
                  style={{ fontSize: '11px', background: '#1C1C1F', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '4px' }}
                >
                  <option value="">Otra red...</option>
                  {activePlatforms.filter((p) => p !== platform).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <button
                  onClick={() => rescorePlatform[clip.id] && handleRescore(clip.id, rescorePlatform[clip.id])}
                  disabled={!rescorePlatform[clip.id] || rescoringId === clip.id}
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '6px 10px' }}
                >
                  {rescoringId === clip.id ? 'Puntuando...' : 'Puntuar para otra red'}
                </button>
                <button
                  onClick={() => handlePublish(clip.id, platform)}
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '6px 10px' }}
                >
                  Subir a {platform}
                </button>
              </div>
            </div>
          ))}
          <button onClick={reset} className="btn-secondary" style={{ marginTop: '20px' }}>Subir otro video</button>
        </div>
      )}
    </div>
  );
};

export default RepurposerView;
