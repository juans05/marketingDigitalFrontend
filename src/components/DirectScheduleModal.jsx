import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UploadCloud, Calendar, Image as ImageIcon, Sparkles, CheckCircle, Loader2, PenTool } from 'lucide-react';

const PLATFORM_CONFIG = {
  tiktok: { label: 'TikTok' },
  instagram: { label: 'Instagram' },
  youtube: { label: 'YouTube' },
  facebook: { label: 'Facebook' },
  linkedin: { label: 'LinkedIn' },
};

const PLAN_RESTRICTIONS = {
  'Mini': ['instagram', 'tiktok'],
  'Artista': ['instagram', 'tiktok', 'facebook'],
  'Estrella': ['instagram', 'tiktok', 'facebook', 'youtube', 'linkedin'],
  'Agencia Pro': ['instagram', 'tiktok', 'facebook', 'youtube', 'linkedin', 'twitter', 'pinterest'],
};

const DirectScheduleModal = ({ isOpen, onClose, initialDate, artistId, activePlatforms = [], onSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isManual, setIsManual] = useState(true);
  
  // Form fields
  const [text, setText] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(activePlatforms?.length ? activePlatforms : ['instagram']);
  const [postType, setPostType] = useState('feed');
  const [scheduledTime, setScheduledTime] = useState('12:00');
  
  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Combinar fecha inicial con la hora
  const getISOString = () => {
    const d = new Date(initialDate);
    const [hh, mm] = scheduledTime.split(':');
    d.setHours(parseInt(hh, 10));
    d.setMinutes(parseInt(mm, 10));
    return d.toISOString();
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      // Auto-set post-type heuristic
      if (selected.type.startsWith('video/')) {
        setPostType('reel');
      } else {
        setPostType('feed');
      }
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      handleFileChange({ target: { files: [e.dataTransfer.files[0]] } });
    }
  };

  const handleUploadAndSchedule = async () => {
    if (!file) return setError('Selecciona una imagen o video.');
    if (isManual && !text.trim()) return setError('Escribe el texto de la publicación.');
    if (selectedPlatforms.length === 0) return setError('Selecciona al menos una red social.');

    setLoading(true);
    setError('');

    try {
      const isVideo = file.type.startsWith('video/');
      const userStr = localStorage.getItem('vidalis_user');
      const token = userStr ? JSON.parse(userStr).token : '';
      const agencyFolder = user?.name ? user.name.replace(/\s+/g, '_').toLowerCase() : 'general';

      // 1. Signature
      const sigResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/cloudinary-signature?folder=${agencyFolder}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const sigData = await sigResponse.json();

      // 2. Cloudinary Upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', sigData.timestamp);
      formData.append('signature', sigData.signature);
      formData.append('folder', sigData.folder);
      formData.append('access_mode', 'public');
      formData.append('resource_type', isVideo ? 'video' : 'image');
      if (isVideo && sigData.eager) formData.append('eager', sigData.eager);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/${isVideo ? 'video' : 'image'}/upload`;
      const uploadRes = await fetch(cloudinaryUrl, { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error("Fallo subiendo recurso a Cloudinary");
      const uploadData = await uploadRes.json();

      // 3. Database Sync
      const finalDate = getISOString();
      const videoData = {
        title: file.name,
        source_url: uploadData.secure_url,
        artist_id: artistId,
        status: isManual ? 'scheduled' : 'analyzing', // Si es IA, forzamos análisis
        scheduled_at: finalDate,
        platforms: selectedPlatforms,
        post_type: postType,
      };

      if (isManual) {
        videoData.ai_copy_long = text;
        videoData.hashtags = text.match(/#\w+/g)?.join(' ') || '';
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/upload`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ videoData })
      });

      if (!response.ok) throw new Error("Fallo guardando en la base de datos");
      
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (key) => {
    setSelectedPlatforms(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-portal">
      <div className="modal-backdrop" onClick={onClose} />

      <div className="card-pro direct-schedule-modal animate-fade-in">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title"><Calendar className="icon-primary" size={20} /> Programar Publicación</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
              Para el {initialDate?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button onClick={onClose} className="btn-close">
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px', flex: 1 }}>
          {error && (
            <div className="alert-error">{error}</div>
          )}

          {/* 1. Modo IA vs Manual */}
          <div className="seg-toggle">
            <button onClick={() => setIsManual(true)} className={`seg-btn ${isManual ? 'active' : ''}`}><PenTool size={14} /> MODO MANUAL</button>
            <button onClick={() => setIsManual(false)} className={`seg-btn ${!isManual ? 'primary active' : ''}`}><Sparkles size={14} /> DELEGAR A LA IA</button>
          </div>

          {!isManual && (
            <div className="alert-info">
              <div className="alert-icon"><Sparkles size={16} /></div>
              El archivo subido se enviará primero al motor de Inteligencia Artificial para generar ganchos, copys y extraer hashtags. Podrás revisarlo en el calendario antes de que se publique.
            </div>
          )}

          {/* 2. Carga de Archivo */}
          <div className="file-drop" onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden-file-input" />

            {preview ? (
              <div className="preview-wrap">
                {file?.type.startsWith('video/') ? (
                  <video src={preview} className="preview-media" muted controls />
                ) : (
                  <img src={preview} className="preview-media img" alt="Preview" />
                )}
                <div className="preview-badge">CAMBIAR</div>
              </div>
            ) : (
              <>
                <div style={{ background: '#FFF', padding: '16px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '16px' }}>
                  <UploadCloud size={32} />
                </div>
                <h4 className="modal-subtitle">Sube tu Contenido</h4>
                <p className="modal-note">Arrastra tu imagen o video aquí, o haz clic para explorar.</p>
              </>
            )}
          </div>

          {/* 3. Modo Manual (Caption) */}
          {isManual && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', textTransform: 'uppercase' }}>Texto de la Publicación (Copy)</label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Escribe el mensaje que acompañará a la foto o video..."
                className="textarea-plain"
              />
            </div>
          )}

          {/* 4. Hora y Redes */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '32px' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', textTransform: 'uppercase' }}>Hora de Lanzamiento</label>
              <input 
                type="time" 
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
                className="time-input"
              />
            </div>
            <div style={{ flex: 2, minWidth: '200px' }}>
               <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', textTransform: 'uppercase' }}>Formato</label>
               <div style={{ display: 'flex', gap: '8px' }}>
                  {['reel', 'story', 'feed'].map(type => (
                    <button
                      key={type}
                      onClick={() => setPostType(type)}
                      className={`format-btn ${postType === type ? 'selected' : ''}`}
                    >
                      {type === 'reel' ? '🎬 REEL' : type === 'story' ? '📱 STORY' : '📰 FEED'}
                    </button>
                  ))}
               </div>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '12px', textTransform: 'uppercase' }}>Selecciona Plataformas</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {activePlatforms
                .filter(p => {
                  const user = JSON.parse(localStorage.getItem('vidalis_user'));
                  if (import.meta.env.VITE_BYPASS_PLAN_LIMITS === 'true') return true;
                  const allowed = PLAN_RESTRICTIONS[user?.plan];
                  return !allowed || allowed.includes(p.toLowerCase());
                })
                .map(platform => {
                const isSelected = selectedPlatforms.includes(platform);
                return (
                  <button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    className={`platform-btn ${isSelected ? 'selected' : ''}`}
                  >
                    {isSelected && <CheckCircle size={14} />}
                    {PLATFORM_CONFIG[platform]?.label || platform}
                  </button>
                );
              })}
              {activePlatforms.length === 0 && (
                <div style={{ fontSize: '12px', color: '#DC2626', fontWeight: '600' }}>Debes conectar redes sociales primero (Configuración).</div>
              )}
            </div>
          </div>

            <button 
            onClick={handleUploadAndSchedule}
            disabled={loading || !file}
            className="btn-primary btn-block"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : isManual ? 'CONFIRMAR PROGRAMACIÓN' : 'SUBIR PARA ANÁLISIS IA'}
          </button>
        </div>
      </div>
      
    </div>,
    document.body
  );
};

export default DirectScheduleModal;

const styles = `
  .direct-schedule-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(580px, 95vw);
    max-height: 90vh;
    background: #FFFFFF !important;
    color: #111111 !important;
    z-index: 100000;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
    border: none !important;
  }
  
  .modal-header {
    padding: 24px 32px;
    border-bottom: 1px solid #EEEEEE;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #F9FAFB;
  }
  
  .modal-title {
    color: #111111 !important;
    font-size: 18px;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
  }
  
  .modal-header p {
    color: #6B7280 !important;
    margin-top: 4px;
  }
  
  .seg-toggle {
    display: flex;
    background: #F3F4F6;
    padding: 6px;
    border-radius: 14px;
    gap: 6px;
    margin-bottom: 24px;
  }
  
  .seg-btn {
    flex: 1;
    padding: 12px;
    border-radius: 10px;
    border: none;
    font-size: 11px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
    background: transparent;
    color: #6B7280;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .seg-btn.active {
    background: white;
    color: #111111;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  
  .seg-btn.primary.active {
    background: #4F46E5;
    color: white;
  }
  
  label {
    color: #374151 !important;
    font-weight: 800 !important;
    font-size: 11px !important;
    letter-spacing: 0.05em;
  }
  
  .textarea-plain {
    width: 100%;
    background: #F9FAFB !important;
    border: 1px solid #E5E7EB !important;
    border-radius: 12px;
    padding: 16px;
    color: #111111 !important;
    font-size: 14px;
    min-height: 120px;
    outline: none;
  }
  
  .textarea-plain::placeholder {
    color: #9CA3AF;
  }
  
  .time-input {
    width: 100%;
    background: #F9FAFB !important;
    border: 1px solid #E5E7EB !important;
    border-radius: 12px;
    padding: 12px 16px;
    color: #111111 !important;
    font-weight: 700;
  }
  
  .format-btn {
    flex: 1;
    padding: 12px;
    border-radius: 10px;
    border: 1.5px solid #E5E7EB;
    background: white;
    color: #6B7280;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
  }
  
  .format-btn.selected {
    border-color: #4F46E5;
    color: #4F46E5;
    background: #EEF2FF;
  }
  
  .platform-btn {
    padding: 8px 16px;
    border-radius: 100px;
    border: 1px solid #E5E7EB;
    background: white;
    color: #4B5563;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .platform-btn.selected {
    background: #4F46E5;
    color: white;
    border-color: #4F46E5;
  }
  
  .file-drop {
    background: #F9FAFB;
    border: 2px dashed #E5E7EB;
    border-radius: 16px;
    padding: 40px;
    text-align: center;
    cursor: pointer;
    margin-bottom: 24px;
  }
  
  .modal-subtitle { color: #111111 !important; margin-bottom: 8px; font-weight: 800; }
  .modal-note { color: #6B7280 !important; font-size: 13px; }
  
  .alert-info {
    background: #EFF6FF;
    border: 1px solid #DBEAFE;
    color: #1E40AF;
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 12px;
    line-height: 1.5;
    margin-bottom: 24px;
    display: flex;
    gap: 12px;
  }
  
  .btn-close {
    background: #F3F4F6;
    border: none;
    padding: 8px;
    border-radius: 8px;
    color: #6B7280;
    cursor: pointer;
  }

  .modal-backdrop {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(8px);
    z-index: 99999;
  }
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = styles;
  document.head.appendChild(styleTag);
}

