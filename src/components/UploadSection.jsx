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
    published:    { label: 'Publicado',           icon: <CheckCircle size={12} />,   color: '#22c55e', bg: '#ecfdf5' },
    scheduled:    { label: 'Programado',          icon: <Clock size={12} />,         color: '#2C33D8', bg: '#eff6ff' },
    processing:   { label: 'Procesando',          icon: <Loader2 size={12} className="animate-spin" />, color: '#6B7280', bg: '#f9fafb' },
    analyzing:    { label: 'Estrategia IA',      icon: <Sparkles size={12} />,     color: '#7c3aed', bg: '#f5f3ff', pulse: true },
    needs_review: { label: 'Review de Autoridad', icon: <AlertTriangle size={12} />, color: '#d97706', bg: '#fffbeb' },
    error:        { label: 'Fallo Crítico',       icon: <XCircle size={12} />,       color: '#ef4444', bg: '#fef2f2' },
  };

  return (
    <div className="card-pro animate-fade-in" style={{ 
      maxWidth: '850px', 
      margin: '20px auto', 
      padding: '48px',
      position: 'relative',
      border: 'none',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontFamily: 'Outfit, sans-serif',
          fontWeight: '800',
          color: 'var(--text-main)',
          marginBottom: '8px' 
        }}>Sube tu Contenido Premium</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Solo aceptamos archivos optimizados para impacto vertical (9:16).
        </p>
      </div>

      {!file && (
        <label className="upload-zone" style={{ 
          border: '2px dashed var(--border-main)', 
          borderRadius: '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: '80px 40px', 
          cursor: 'pointer',
          background: '#F9FAFB',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ 
            width: '64px', height: '64px',
            background: 'var(--primary)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            color: '#FFF',
            boxShadow: '0 4px 12px rgba(44, 51, 216, 0.2)'
          }}>
            <Upload size={32} />
          </div>
          <p style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '8px' }}>
            Despliega tus archivos aquí
          </p>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            MP4, MOV | Max. 80MB | Full Vertical 9:16
          </span>
          <input type="file" accept="video/*,image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </label>
      )}

      {file && (
        <div style={{ 
          padding: '32px', 
          borderRadius: '16px', 
          background: '#FFFFFF',
          border: '1px solid var(--border-main)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ color: 'var(--primary)', background: '#F5F7FF', padding: '12px', borderRadius: '12px' }}>
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
              style={{ background: '#F3F4F6', border: 'none', color: '#9CA3AF', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
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
                  background: '#F3F4F6', 
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
                  background: '#fffbeb',
                  border: '1px solid #fef3c7',
                  color: '#92400e'
                }}>
                  <div style={{ fontWeight: '900', fontSize: '1.1rem', marginBottom: '8px', textTransform: 'uppercase' }}>Autorización Pendiente</div>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.5', opacity: 0.9 }}>{platformWarning}</p>
                </div>
              ) : (
                <div style={{
                  padding: '32px',
                  borderRadius: '16px',
                  background: '#f0fdf4',
                  border: '1px solid #dcfce7',
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
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
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
          background: #F5F7FF !important;
        }
      `}</style>
    </div>
  );
};

export default UploadSection;
