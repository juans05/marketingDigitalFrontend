import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const UploadSection = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, checking, uploading, success, error
  const [errors, setErrors] = useState([]);
  const videoRef = useRef(null);

  const validateVideo = (file) => {
    return new Promise((resolve) => {
      const newErrors = [];
      
      // 1. Validar Peso (< 50MB)
      if (file.size > 50 * 1024 * 1024) {
        newErrors.push("El archivo supera los 50MB permitidos.");
      }

      // 2. Validar Resolución (9:16)
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const { videoWidth, videoHeight } = video;
        const isVertical = videoHeight > videoWidth;
        const ratio = videoWidth / videoHeight;
        const expectedRatio = 9 / 16;
        
        // Permitimos un margen de error pequeño en el ratio
        if (!isVertical || Math.abs(ratio - expectedRatio) > 0.05) {
          newErrors.push("El video debe estar en formato vertical (9:16).");
        }

        resolve(newErrors);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setStatus('checking');
    setErrors([]);

    const validationErrors = await validateVideo(selectedFile);
    
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
      // 0. Obtener info de la agencia desde el localStorage
      const user = JSON.parse(localStorage.getItem('vidalis_user'));
      const agencyFolder = user?.agency ? user.agency.replace(/\s+/g, '_').toLowerCase() : 'general';

      // 1. Obtener FIRMA del Backend (pasando la carpeta)
      const sigResponse = await fetch(`http://localhost:3001/api/vidalis/cloudinary-signature?folder=${agencyFolder}`);
      const sigData = await sigResponse.json();

      // 2. Subir directamente a CLOUDINARY (No consume RAM del servidor)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', sigData.timestamp);
      formData.append('signature', sigData.signature);
      formData.append('upload_preset', sigData.uploadPreset);
      
      // IMPORTANTE: Si la firma incluye carpeta, debemos enviarla también aquí
      if (sigData.folder) {
        formData.append('folder', sigData.folder);
      }

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/video/upload`;
      const uploadRes = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) throw new Error("Error subiendo a Cloudinary");

      // 3. Registrar en nuestro BACKEND (Base de Datos + n8n)
      const response = await fetch('http://localhost:3001/api/vidalis/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          videoData: {
            title: file.name, 
            source_url: uploadData.secure_url,
            status: 'analyzing'
          }
        })
      });

      if (!response.ok) throw new Error("Error registrando en el backend");

      setStatus('success');
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
      <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>Sube tu Video</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
        Verificaremos que tu video esté listo para hacerse viral.
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
          <p style={{ fontWeight: '500' }}>Arrastra tu video aquí o haz clic para buscar</p>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>
            MP4, MOV | Max. 50MB | Formato Vertical 9:16
          </span>
          <input type="file" accept="video/*" style={{ display: 'none' }} onChange={handleFileChange} />
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
            <div style={{ 
              marginTop: '30px', 
              padding: '20px', 
              borderRadius: '12px', 
              background: 'rgba(74, 222, 128, 0.1)', 
              color: '#4ade80',
              textAlign: 'center',
              border: '1px solid rgba(74, 222, 128, 0.2)'
            }}>
              <CheckCircle size={40} style={{ marginBottom: '10px' }} />
              <p style={{ fontWeight: 'bold' }}>¡Video enviado exitosamente!</p>
              <p style={{ fontSize: '14px' }}>n8n está procesando tu contenido viral ahora mismo.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadSection;
