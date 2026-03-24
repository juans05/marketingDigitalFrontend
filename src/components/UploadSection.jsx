import { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const UploadSection = ({ artistId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, checking, uploading, success, error
  const [errors, setErrors] = useState([]);
  const [platformWarning, setPlatformWarning] = useState(null);

  const validateFile = (file) => {
    return new Promise((resolve) => {
      const newErrors = [];
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      
      // 1. Validar Peso (< 80MB)
      if (file.size > 80 * 1024 * 1024) {
        newErrors.push("El archivo supera los 80MB permitidos.");
      }

      if (!isVideo && !isImage) {
        newErrors.push("Formato no permitido. Solo se aceptan videos e imágenes.");
        return resolve(newErrors);
      }

      // 2. Validar Resolución (Solo para Videos 9:16)
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
            newErrors.push("El video debe estar en formato vertical (9:16).");
          }
          resolve(newErrors);
        };
        video.src = URL.createObjectURL(file);
      } else {
        // Para imágenes no aplicamos restricciones de ratio por ahora
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
    
    try {
      const isVideo = file.type.startsWith('video/');

      // 0. Obtener carpeta de la agencia para Cloudinary
      const user = JSON.parse(localStorage.getItem('vidalis_user'));
      const agencyFolder = user?.name ? user.name.replace(/\s+/g, '_').toLowerCase() : 'general';

      // 1. Obtener FIRMA del Backend (pasando la carpeta)
      const sigResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/cloudinary-signature?folder=${agencyFolder}`);
      const sigData = await sigResponse.json();

      // 2. Subir directamente a CLOUDINARY
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', sigData.timestamp);
      formData.append('signature', sigData.signature);
      formData.append('folder', sigData.folder);
      // Forzar que sea público y especificar que es video/image
      formData.append('access_mode', 'public');
      formData.append('resource_type', isVideo ? 'video' : 'image');

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/${isVideo ? 'video' : 'image'}/upload`;
      const uploadRes = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) throw new Error("Error subiendo a Cloudinary");

      // 3. Registrar en nuestro BACKEND (Base de Datos + n8n)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoData: {
            title: file.name,
            source_url: uploadData.secure_url,
            artist_id: artistId,
            status: isVideo ? 'analyzing' : 'published'
          }
        })
      });

      if (!response.ok) throw new Error("Error registrando en el backend");

      const responseData = await response.json();
      if (responseData.platformWarning) setPlatformWarning(responseData.platformWarning);

      setStatus('success');
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error("Upload Error:", err);
      setStatus('error');
      setErrors(["Error en la carga: " + err.message]);
    }
  };

  return (
    <div id="dashboard" className="glass-card" style={{ 
      maxWidth: '800px', 
      margin: '60px auto', 
      padding: '40px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>Sube tu Contenido</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
        Aceptamos videos (9:16) e imágenes de alta calidad.
      </p>

      {!file && (
        <label style={{ 
          border: '2px dashed var(--border-glass)', 
          borderRadius: '20px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: '60px', 
          cursor: 'pointer',
          transition: 'border-color 0.3s ease'
        }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
           onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-glass)'}>
          <Upload size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
          <p style={{ fontWeight: '500' }}>Arrastra tus archivos aquí o haz clic para buscar</p>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>
            MP4, MOV, JPG, PNG | Max. 80MB | Video Vertical 9:16
          </span>
          <input type="file" accept="video/*,image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </label>
      )}

      {file && (
        <div style={{ padding: '20px', borderRadius: '15px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 'bold' }}>{file.name}</p>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button onClick={() => { setFile(null); setStatus('idle'); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>

          <div style={{ marginTop: '20px' }}>
            {status === 'checking' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--secondary)' }}>
                <Loader2 className="animate-spin" size={20} /> Verificando resolución y metadatos...
              </div>
            )}
            {status === 'ready' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4ade80' }}>
                <CheckCircle size={20} /> Video validado correctamente (1080x1920).
              </div>
            )}
            {status === 'error' && (
              <div style={{ color: '#f87171' }}>
                {errors.map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                    <AlertCircle size={18} /> {e}
                  </div>
                ))}
              </div>
            )}
          </div>

          {status === 'ready' && (
            <button onClick={handleUpload} className="btn-primary" style={{ width: '100%', marginTop: '30px' }}>
              Procesar y Publicar
            </button>
          )}

          {status === 'uploading' && (
            <button disabled className="btn-primary" style={{ width: '100%', marginTop: '30px', opacity: 0.7, cursor: 'not-allowed', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <Loader2 className="animate-spin" size={20} /> Subiendo a la nube...
            </button>
          )}

          {status === 'success' && (
            <div style={{ marginTop: '30px' }}>
              {platformWarning ? (
                <div style={{
                  padding: '20px',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#f59e0b',
                  fontSize: '13px',
                  lineHeight: '1.6'
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '8px' }}>⚠️ Aviso de publicación</div>
                  {platformWarning}
                </div>
              ) : (
                <div style={{
                  padding: '20px',
                  borderRadius: '12px',
                  background: 'rgba(74, 222, 128, 0.1)',
                  color: '#4ade80',
                  textAlign: 'center',
                  border: '1px solid rgba(74, 222, 128, 0.2)'
                }}>
                  <CheckCircle size={40} style={{ marginBottom: '10px' }} />
                  <p style={{ fontWeight: 'bold' }}>¡Archivo enviado exitosamente!</p>
                  <p style={{ fontSize: '14px' }}>El contenido ya está disponible en tu galería.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadSection;
