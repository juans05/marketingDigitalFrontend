import { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2, FileVideo, ShieldCheck, Clock, Sparkles, AlertTriangle, XCircle } from 'lucide-react';

const UploadSection = ({ artistId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, checking, uploading, success, error
  const [errors, setErrors] = useState([]);
  const [platformWarning, setPlatformWarning] = useState(null);
  const [uploadPhase, setUploadPhase] = useState(''); // signing, uploading, registering

  const validateFile = (file) => {
    return new Promise((resolve) => {
      const newErrors = [];
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (file.size > 80 * 1024 * 1024) {
        newErrors.push("Exceso de peso (>80MB). Optimiza tu exportación.");
      }

      if (!isVideo && !isImage) {
        newErrors.push("Formato no autorizado. Solo RAW/High-Quality Media.");
        return resolve(newErrors);
      }

      if (isVideo) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          const { videoWidth, videoHeight } = video;
          const isVertical = videoHeight > videoWidth;
          const ratio = videoWidth / videoHeight;
          const expectedRatio = 9 / 16;

          if (!isVertical || Math.abs(ratio - expectedRatio) > 0.05) {
            newErrors.push("Geometría incorrecta. Se requiere formato vertical (9:16).");
          }
          resolve(newErrors);
        };
        video.src = URL.createObjectURL(file);
      } else {
        resolve(newErrors);
      }
    });
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setStatus('checking');
    setErrors([]);

    const validationErrors = await validateFile(selectedFile);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setStatus('error');
    } else {
      setStatus('ready');
    }
  };

  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

  const handleUpload = async () => {
    setStatus('uploading');
    setUploadPhase('signing');

    try {
      const isVideo = file.type.startsWith('video/');
      const user = JSON.parse(localStorage.getItem('vidalis_user'));
      const agencyFolder = user?.name ? user.name.replace(/\s+/g, '_').toLowerCase() : 'general';
      const resourceType = isVideo ? 'video' : 'image';


      const sigResponse = await fetch(`${apiBase}/api/vidalis/cloudinary-signature?folder=${agencyFolder}&resourceType=${resourceType}`, {
        headers: { 
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!sigResponse.ok) {
        const errorText = await sigResponse.text();
        throw new Error(`Fallo en firma (${sigResponse.status}): ${errorText || 'Servidor inaccesible'}`);
      }

      const sigData = await sigResponse.json();

      setUploadPhase('uploading');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', sigData.timestamp);
      formData.append('signature', sigData.signature);
      formData.append('folder', sigData.folder);
      formData.append('access_mode', 'public');
      formData.append('resource_type', isVideo ? 'video' : 'image');
      
      // IMPORTANTE: Enviar 'eager' siempre si viene en la firma (especialmente para imágenes)
      if (sigData.eager) {
        formData.append('eager', sigData.eager);
      }

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/${isVideo ? 'video' : 'image'}/upload`;
      const uploadRes = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) throw new Error("Error en el despliegue a Cloudinary");

      setUploadPhase('registering');

      const response = await fetch(`${apiBase}/api/vidalis/upload`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          videoData: {
            title: file.name,
            source_url: uploadData.secure_url,
            artist_id: artistId,
            status: 'analyzing'
          }
        })
      });

      if (!response.ok) throw new Error("Fallo en el registro de metadatos");

      const responseData = await response.json();
      if (responseData.platformWarning) setPlatformWarning(responseData.platformWarning);

      setStatus('success');
      setUploadPhase('');
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error("Upload Error:", err);
      setStatus('error');
      setErrors(["Interrupción en la carga: " + err.message]);
    }
  };

  const STATUS_CONFIG = {
    published: { label: 'Publicado', icon: <CheckCircle size={12} />, color: '#22c55e', bg: '#ecfdf5' },
    scheduled: { label: 'Programado', icon: <Clock size={12} />, color: '#2C33D8', bg: '#eff6ff' },
    processing: { label: 'Procesando', icon: <Loader2 size={12} className="animate-spin" />, color: '#6B7280', bg: '#f9fafb' },
    analyzing: { label: 'Estrategia IA', icon: <Sparkles size={12} />, color: '#7c3aed', bg: '#f5f3ff', pulse: true },
    needs_review: { label: 'Review de Autoridad', icon: <AlertTriangle size={12} />, color: '#d97706', bg: '#fffbeb' },
    error: { label: 'Fallo Crítico', icon: <XCircle size={12} />, color: '#ef4444', bg: '#fef2f2' },
  };

  return (
    <div className="card-pro animate-fade-in upload-card-pro" style={{
      maxWidth: '850px',
      margin: '40px auto',
      padding: '48px',
      position: 'relative',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-main)',
      boxShadow: 'var(--shadow-premium)'
    }}>
      <div style={{ marginBottom: '40px' }}>
        <h2 className="gradient-text" style={{
          fontSize: '32px',
          fontFamily: 'var(--font-heading)',
          fontWeight: '900',
          marginBottom: '12px'
        }}>Sube tu Contenido Premium</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '16px', fontWeight: '500' }}>
          Formatos optimizados para impacto vertical (9:16).
        </p>
      </div>

      {!file && (
        <label className="upload-zone" style={{
          border: '2px dashed var(--border-main)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '80px 40px',
          cursor: 'pointer',
          background: 'rgba(255,255,255,0.02)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <div style={{
            width: '80px', height: '80px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
            color: '#FFF',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Upload size={36} />
          </div>
          <p style={{ fontWeight: '800', fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '12px' }}>
            Despliega tus archivos aquí
          </p>
          <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            MP4, MOV | Max. 80MB | Full Vertical 9:16
          </span>
          <input type="file" accept="video/*,image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </label>
      )}

      {file && (
        <div className="glass-morph" style={{
          padding: '32px',
          borderRadius: '24px',
          border: '1px solid var(--border-active)',
          boxShadow: 'var(--shadow-premium)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ color: 'var(--primary)', background: 'rgba(79,70,229,0.12)', padding: '12px', borderRadius: '12px' }}>
                <FileVideo size={36} />
              </div>
              <div>
                <p style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</p>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • DISPONIBLE
                </p>
              </div>
            </div>
            <button
              onClick={() => { setFile(null); setStatus('idle'); }}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#71717A', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ marginTop: '32px' }}>
            {status === 'checking' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>
                <Loader2 className="animate-spin" size={18} color="var(--primary)" /> Validando integridad y resolución...
              </div>
            )}
            {status === 'ready' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#22c55e', fontSize: '0.9rem', fontWeight: '700' }}>
                <ShieldCheck size={18} /> Geometría Vertical Confirmada (9:16)
              </div>
            )}
            {status === 'error' && (
              <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                {errors.map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', fontSize: '14px', fontWeight: '600' }}>
                    <AlertCircle size={16} /> {e}
                  </div>
                ))}
              </div>
            )}
          </div>

          {status === 'ready' && (
            <button
              onClick={handleUpload}
              className="btn-primary"
              style={{ width: '100%', marginTop: '40px', height: '60px', borderRadius: '12px', fontSize: '1.1rem' }}
            >
              Procesar y Publicar
            </button>
          )}

          {status === 'uploading' && (
            <div style={{ marginTop: '40px' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: '800', color: 'var(--text-main)', textTransform: 'uppercase' }}>
                    {uploadPhase === 'signing' && 'Seguridad'}
                    {uploadPhase === 'uploading' && 'Carga en Nube'}
                    {uploadPhase === 'registering' && 'Inyectando IA'}
                  </span>
                  <span style={{ color: 'var(--primary)', fontWeight: '800' }}>
                    {uploadPhase === 'signing' ? '25%' : uploadPhase === 'uploading' ? '65%' : '95%'}
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '10px',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-main)'
                }}>
                  <div style={{
                    height: '100%',
                    background: 'var(--primary)',
                    width: uploadPhase === 'signing' ? '25%' : uploadPhase === 'uploading' ? '65%' : '95%',
                    transition: 'width 0.8s ease-in-out'
                  }} className="animate-shimmer"></div>
                </div>
                <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  {uploadPhase === 'signing' && 'Verificando protocolos de seguridad...'}
                  {uploadPhase === 'uploading' && 'Distribuyendo paquetes a infraestructura...'}
                  {uploadPhase === 'registering' && 'El cerebro de Vidalis está procesando tu contenido...'}
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div style={{ marginTop: '40px' }}>
              {platformWarning ? (
                <div style={{
                  padding: '24px',
                  borderRadius: '12px',
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  color: '#FCD34D'
                }}>
                  <div style={{ fontWeight: '900', fontSize: '1.1rem', marginBottom: '8px', textTransform: 'uppercase' }}>Autorización Pendiente</div>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.5', opacity: 0.9 }}>{platformWarning}</p>
                </div>
              ) : (
                <div style={{
                  padding: '32px',
                  borderRadius: '16px',
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '56px', height: '56px',
                    background: '#22c55e',
                    borderRadius: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    color: '#FFF',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                  }}>
                    <CheckCircle size={32} />
                  </div>
                  <h4 style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '4px' }}>Impacto Iniciado</h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Tu contenido ya está siendo procesado por el cerebro IA.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        .upload-zone:hover {
          border-color: var(--primary) !important;
          background: rgba(79, 70, 229, 0.05) !important;
          transform: scale(1.01);
        }
        @media (max-width: 768px) {
          .card-pro { padding: 32px 20px !important; margin: 20px !important; }
          .upload-zone { padding: 60px 20px !important; }
        }
        @media (max-width: 600px) {
          .upload-card-pro { padding: 24px !important; }
          .upload-zone { padding: 24px 16px !important; }
        }
      `}</style>
    </div>
  );
};

export default UploadSection;
