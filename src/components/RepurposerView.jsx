// src/components/RepurposerView.jsx
import { useState, useEffect, useRef } from 'react';
import { Upload, Loader2, AlertCircle, Sparkles } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const getToken = () => { try { return JSON.parse(localStorage.getItem('vidalis_user') || '{}').token || ''; } catch { return ''; } };
const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` });

const MAX_DURATION_SECONDS = 7200; // 2 horas

const PROCESSING_STEPS = [
  'Analizando el video',
  'Detectando los mejores capítulos',
  'Generando clips',
  'Calculando el score de cada clip',
];

// Mapea la etapa que reporta el backend (ai_clips_data.stage) al índice del paso.
// Debe coincidir con STAGES en src/services/repurposeProgress.js del backend.
const STAGE_TO_STEP = {
  probing: 0,
  detecting: 1,
  cutting: 2,
  scoring: 3,
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

const RepurposerView = ({ artistId }) => {
  const [phase, setPhase] = useState('upload'); // upload | processing | gallery
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploadPhase, setUploadPhase] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [clips, setClips] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
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
          setPhase('upload');
        } else {
          // En progreso: reflejar la etapa actual que reporta el backend
          const stage = video.ai_clips_data?.stage;
          if (stage && STAGE_TO_STEP[stage] !== undefined) setCurrentStep(STAGE_TO_STEP[stage]);
        }
      } catch (err) {
        console.error('Error consultando estado del video:', err);
      }
    }, 4000);
  };

  const handleUpload = async () => {
    if (!file) return;
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
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error registrando el video');

      setCurrentStep(0);
      setPhase('processing');
      setUploadPhase('');
      startPolling(data.id);
    } catch (err) {
      setError(err.message);
      setUploadPhase('');
    }
  };

  const reset = () => {
    setPhase('upload'); setFile(null); setTitle(''); setClips([]); setError('');
  };

  if (phase === 'processing') {
    return (
      <div className="card-pro" style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: '#7C3AED', marginBottom: '16px' }} />
        <div style={{ color: '#FFFFFF', fontWeight: 700, marginBottom: '16px' }}>{PROCESSING_STEPS[currentStep]}...</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
          {PROCESSING_STEPS.map((step, i) => {
            const icon = i < currentStep ? '✅' : i === currentStep ? '🔵' : '⚪';
            return (
              <div key={step} style={{ color: i <= currentStep ? '#FFFFFF' : '#6B6B75', fontWeight: i === currentStep ? 700 : 400 }}>
                {icon} {step}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === 'gallery') {
    const best = clips.find(c => c.isBest);
    const rest = clips.filter(c => !c.isBest);
    return (
      <div>
        {best && (
          <div style={{ border: '2px solid #7C3AED', borderRadius: '14px', padding: '14px', marginBottom: '20px', background: '#1C1C1F', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-11px', left: '16px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '100px' }}>
              ⭐ MEJOR CLIP
            </div>
            <div style={{ marginTop: '6px' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{best.title}</div>
              <ScoreBadge score={best.viral_score_real} />
            </div>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {rest.map(clip => (
            <div key={clip.id} style={{ background: '#121214', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ color: '#fff', fontSize: '12px', marginBottom: '6px' }}>{clip.title}</div>
              <ScoreBadge score={clip.viral_score_real} />
            </div>
          ))}
        </div>
        <button onClick={reset} className="btn-secondary" style={{ marginTop: '20px' }}>Subir otro video</button>
      </div>
    );
  }

  return (
    <div className="card-pro" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px' }}>
      <div style={{ color: '#fff', fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>Convierte un video largo en clips virales</div>
      <div style={{ color: '#B8B8C0', fontSize: '13px', marginBottom: '24px' }}>Sube tu podcast, entrevista o stream — la IA encuentra los mejores momentos</div>

      {error && (
        <div style={{ color: '#EF4444', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <label className="file-drop" style={{ cursor: 'pointer', width: '100%', maxWidth: '480px' }}>
        <Upload size={32} />
        <div style={{ color: '#fff', fontWeight: 600, marginTop: '8px' }}>
          {file ? file.name : 'Arrastra tu video aquí o haz clic'}
        </div>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>MP4, MOV, WebM — máx 2 horas</div>
        <input type="file" accept="video/*" style={{ display: 'none' }} onChange={(e) => handleFileChange(e.target.files?.[0])} />
      </label>

      <button
        onClick={handleUpload}
        disabled={!file || !!uploadPhase}
        style={{ marginTop: '20px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, opacity: (!file || uploadPhase) ? 0.5 : 1 }}
      >
        {uploadPhase === 'signing' && 'Preparando subida...'}
        {uploadPhase === 'uploading' && `Subiendo video (${uploadProgress}%)...`}
        {uploadPhase === 'registering' && 'Iniciando análisis...'}
        {!uploadPhase && <><Sparkles size={16} style={{ marginRight: '6px' }} />Generar clips</>}
      </button>
    </div>
  );
};

export default RepurposerView;
