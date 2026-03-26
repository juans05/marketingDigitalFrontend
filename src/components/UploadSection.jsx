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

  const handleUpload = async () => {
    setStatus('uploading');
    setUploadPhase('signing');
    
    try {
      const isVideo = file.type.startsWith('video/');
      const user = JSON.parse(localStorage.getItem('vidalis_user'));
      const agencyFolder = user?.name ? user.name.replace(/\s+/g, '_').toLowerCase() : 'general';

      const sigResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/cloudinary-signature?folder=${agencyFolder}`);
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
      if (isVideo && sigData.eager) {
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

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    published:    { label: 'Publicado',           icon: <CheckCircle size={12} />,   color: '#FFF', bg: '#111' },
    scheduled:    { label: 'Programado',          icon: <Clock size={12} />,         color: '#6B7280', bg: '#0A0A0A' },
    processing:   { label: 'Procesando',          icon: <Clock size={12} />,         color: '#444', bg: '#050505' },
    analyzing:    { label: 'Estrategia IA',      icon: <Sparkles size={12} />,     color: '#FFF', bg: '#222', pulse: true },
    needs_review: { label: 'Review de Autoridad', icon: <AlertTriangle size={12} />, color: '#FFF', bg: '#111' },
    error:        { label: 'Fallo Crítico',       icon: <XCircle size={12} />,       color: '#ef4444', bg: '#200' },
  };

  return (
    <div className="glass-panel" style={{ 
      maxWidth: '850px', 
      margin: '20px auto', 
      padding: '48px',
      position: 'relative'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontFamily: 'var(--font-heading)',
          textTransform: 'uppercase',
          marginBottom: '8px' 
        }}>Sube tu Contenido Premium</h2>
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
          Solo aceptamos archivos optimizados para impacto vertical (9:16).
        </p>
      </div>

      {!file && (
        <label className="upload-zone" style={{ 
          border: '2px dashed var(--border-glass)', 
          borderRadius: '0px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: '80px 40px', 
          cursor: 'pointer',
          background: '#0A0A0A',
          transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
        }}>
          <div style={{ 
            width: '64px', height: '64px',
            background: '#111',
            borderRadius: '0px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            color: '#FFF',
            border: '2px solid var(--border-glass)'
          }}>
            <Upload size={32} />
          </div>
          <p style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '8px' }}>
            Despliega tus archivos aquí
          </p>
          <span style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            MP4, MOV | Max. 80MB | Full Vertical 9:16
          </span>
          <input type="file" accept="video/*,image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </label>
      )}

      {file && (
        <div style={{ 
          padding: '32px', 
          borderRadius: '0px', 
          background: '#0A0A0A',
          border: '2px solid var(--border-glass)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ color: '#FFF' }}>
                <FileVideo size={36} />
              </div>
              <div>
                <p style={{ fontWeight: '700', fontSize: '1.1rem', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</p>
                <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • DISPONIBLE
                </p>
              </div>
            </div>
            <button 
              onClick={() => { setFile(null); setStatus('idle'); }} 
              style={{ background: '#111', border: 'none', color: '#6B7280', padding: '8px', borderRadius: '0px', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ marginTop: '32px' }}>
            {status === 'checking' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#9CA3AF', fontSize: '0.9rem', fontWeight: '600' }}>
                <Loader2 className="animate-spin" size={18} /> Validando integridad y resolución...
              </div>
            )}
            {status === 'ready' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#22c55e', fontSize: '0.9rem', fontWeight: '700' }}>
                <ShieldCheck size={18} /> Geometría Vertical Confirmada (9:16)
              </div>
            )}
            {status === 'error' && (
              <div style={{ background: '#200', padding: '16px', borderRadius: '0px', border: '2px solid #600' }}>
                {errors.map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', fontSize: '0.9rem', fontWeight: '600' }}>
                    <AlertCircle size={16} /> {e}
                  </div>
                ))}
              </div>
            )}
          </div>

          {status === 'ready' && (
            <button 
              onClick={handleUpload} 
              className="btn-action" 
              style={{ width: '100%', marginTop: '40px', height: '64px', borderRadius: '0px', background: '#FFF', color: '#000', border: 'none', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: '800', color: '#FFF', textTransform: 'uppercase' }}>
                    {uploadPhase === 'signing' && 'Seguridad'}
                    {uploadPhase === 'uploading' && 'Carga en Nube'}
                    {uploadPhase === 'registering' && 'Inyectando IA'}
                  </span>
                  <span style={{ color: '#6B7280' }}>
                    {uploadPhase === 'signing' ? '25%' : uploadPhase === 'uploading' ? '65%' : '95%'}
                  </span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  background: '#111', 
                  borderRadius: '0px', 
                  overflow: 'hidden',
                  border: '2px solid var(--border-glass)'
                }}>
                  <div style={{ 
                    height: '100%', 
                    background: '#FFF', 
                    width: uploadPhase === 'signing' ? '25%' : uploadPhase === 'uploading' ? '65%' : '95%',
                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} className="animate-shimmer"></div>
                </div>
                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#6B7280', marginTop: '8px' }}>
                  {uploadPhase === 'signing' && 'Verificando protocolos de seguridad...'}
                  {uploadPhase === 'uploading' && 'Distribuyendo paquetes a Cloudinary...'}
                  {uploadPhase === 'registering' && 'El cerebro de Vidalis está procesando tu video...'}
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div style={{ marginTop: '40px' }}>
              {platformWarning ? (
                <div style={{
                  padding: '24px',
                  borderRadius: '0px',
                  background: '#111',
                  border: '2px solid var(--border-glass)',
                  color: '#FFF'
                }}>
                  <div style={{ fontWeight: '900', fontSize: '1.1rem', marginBottom: '8px', textTransform: 'uppercase' }}>Autorización Pendiente</div>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.5', opacity: 0.9 }}>{platformWarning}</p>
                </div>
              ) : (
                <div style={{
                  padding: '32px',
                  borderRadius: '0px',
                  background: '#0A0A0A',
                  border: '2px solid var(--border-glass)',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    width: '56px', height: '56px', 
                    background: '#111', 
                    borderRadius: '0px', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: '16px',
                    color: '#FFF'
                  }}>
                    <CheckCircle size={32} />
                  </div>
                  <h4 style={{ fontWeight: '800', fontSize: '1.2rem', color: 'white', marginBottom: '4px' }}>Impacto Iniciado</h4>
                  <p style={{ fontSize: '0.9rem', color: '#6B7280' }}>Tu contenido ya está en la biblioteca para el análisis final.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        .upload-zone:hover {
          border-color: #FFF !important;
          background: rgba(255, 255, 255, 0.02) !important;
          box-shadow: inset 0 0 40px rgba(255, 255, 255, 0.03);
        }
      `}</style>
    </div>
  );
};

export default UploadSection;
