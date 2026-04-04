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
  'Free': ['instagram'],
  'Creator': ['instagram', 'facebook'],
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
      const user = JSON.parse(localStorage.getItem('vidalis_user'));
      const agencyFolder = user?.name ? user.name.replace(/\s+/g, '_').toLowerCase() : 'general';

      // 1. Signature
      const sigResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/cloudinary-signature?folder=${agencyFolder}`);
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
        headers: { 'Content-Type': 'application/json' },
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      
      <div className="card-pro direct-schedule-modal animate-fade-in" style={{ 
        position: 'relative', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', 
        background: '#FFF', borderRadius: '24px', padding: '0', display: 'flex', flexDirection: 'column' 
      }}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="var(--primary)" /> Programar Publicación
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
              Para el {initialDate?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#FFF', border: '1px solid var(--border-main)', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}>
            <X size={20} color="var(--text-main)" />
          </button>
        </div>

        <div style={{ padding: '24px', flex: 1 }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {/* 1. Modo IA vs Manual */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#F3F4F6', padding: '6px', borderRadius: '100px' }}>
            <button
              onClick={() => setIsManual(true)}
              style={{ flex: 1, padding: '10px', borderRadius: '100px', border: 'none', background: isManual ? '#FFF' : 'transparent', color: isManual ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: '800', fontSize: '12px', transition: 'all 0.3s', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', boxShadow: isManual ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
            >
              <PenTool size={14} /> MODO MANUAL
            </button>
            <button
              onClick={() => setIsManual(false)}
              style={{ flex: 1, padding: '10px', borderRadius: '100px', border: 'none', background: !isManual ? 'var(--primary)' : 'transparent', color: !isManual ? '#FFF' : 'var(--text-muted)', fontWeight: '800', fontSize: '12px', transition: 'all 0.3s', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', boxShadow: !isManual ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}
            >
              <Sparkles size={14} /> DELEGAR A LA IA
            </button>
          </div>

          {!isManual && (
            <div style={{ background: '#F5F3FF', border: '1px dashed #C4B5FD', padding: '16px', borderRadius: '12px', marginBottom: '24px', color: '#6D28D9', fontSize: '13px', fontWeight: '600', display: 'flex', gap: '12px' }}>
              <div style={{ background: '#DDD6FE', padding: '8px', borderRadius: '50%', height: 'max-content' }}><Sparkles size={16} /></div>
              El archivo subido se enviará primero al motor de Inteligencia Artificial para generar ganchos, copys y extraer hashtags. Podrás revisarlo en el calendario antes de que se publique.
            </div>
          )}

          {/* 2. Carga de Archivo */}
          <div 
            onDragOver={handleDragOver} onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              border: '2px dashed var(--border-main)', borderRadius: '16px', padding: preview ? '16px' : '40px 20px', 
              textAlign: 'center', background: '#F9FAFB', cursor: 'pointer', marginBottom: '24px', 
              transition: 'border-color 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" style={{ display: 'none' }} />
            
            {preview ? (
              <div style={{ width: '100%', position: 'relative', borderRadius: '12px', overflow: 'hidden', maxHeight: '200px' }}>
                {file?.type.startsWith('video/') ? (
                  <video src={preview} style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} muted controls />
                ) : (
                  <img src={preview} style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} alt="Preview" />
                )}
                <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: '800' }}>
                  CAMBIAR
                </div>
              </div>
            ) : (
              <>
                <div style={{ background: '#FFF', padding: '16px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '16px' }}>
                  <UploadCloud size={32} color="var(--primary)" />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Sube tu Contenido</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Arrastra tu imagen o video aquí, o haz clic para explorar.</p>
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
                style={{ width: '100%', minHeight: '120px', background: '#F9FAFB', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '16px', resize: 'vertical', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none' }}
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
                style={{ width: '100%', background: '#F9FAFB', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '12px', fontSize: '14px', outline: 'none' }}
              />
            </div>
            <div style={{ flex: 2, minWidth: '200px' }}>
               <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', textTransform: 'uppercase' }}>Formato</label>
               <div style={{ display: 'flex', gap: '8px' }}>
                  {['reel', 'story', 'feed'].map(type => (
                    <button
                      key={type}
                      onClick={() => setPostType(type)}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '12px',
                        border: postType === type ? '2px solid var(--primary)' : '1px solid var(--border-main)',
                        background: postType === type ? '#EEF2FF' : '#FFF',
                        color: postType === type ? 'var(--primary)' : 'var(--text-muted)',
                        cursor: 'pointer', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase'
                      }}
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
                    style={{
                      padding: '10px 16px', borderRadius: '100px', cursor: 'pointer',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-main)',
                      background: isSelected ? '#EEF2FF' : '#FFF',
                      color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                      fontSize: '12px', fontWeight: '800', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}
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
            className="btn-primary"
            style={{ width: '100%', height: '56px', fontSize: '14px' }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : isManual ? 'CONFIRMAR PROGRAMACIÓN' : 'SUBIR PARA ANÁLISIS IA'}
          </button>
        </div>
      </div>
      
      <style>{`
        @media (max-width: 600px) {
          .direct-schedule-modal { min-width: 100% !important; height: 100vh !important; max-height: 100vh !important; border-radius: 0 !important; }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default DirectScheduleModal;
