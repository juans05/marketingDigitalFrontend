import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

const AIStatusIndicator = ({ artistId }) => {
  const [analyzingVideo, setAnalyzingVideo] = useState(null);

  useEffect(() => {
    if (!artistId) return;

    const checkStatus = async () => {
      try {
        const userStr = localStorage.getItem('vidalis_user');
        const token = userStr ? JSON.parse(userStr).token : '';
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/gallery/${artistId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const videos = await res.json();
          // Buscar si hay algún video procesándose
          const analyzing = videos.find(v => v.status === 'analyzing' || v.status === 'processing');
          setAnalyzingVideo(analyzing || null);
        }
      } catch (err) {
        console.error('Error fetching AI status:', err);
      }
    };

    checkStatus();
    // Validar estado cada 5 segundos
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [artistId]);

  const [now, setNow] = useState(Date.now());

  // Actualizar el tiempo actual cada segundo para que avance fluido el estado
  // solo si de verdad hay un video analizándose
  useEffect(() => {
    let interval;
    if (analyzingVideo) {
      interval = setInterval(() => setNow(Date.now()), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [analyzingVideo]);

  if (!analyzingVideo) return null;

  // Extraer el texto "Paso X/4" del backend (útil si usa AI interno)
  const rawText = analyzingVideo.ai_copy_short || '';
  let cleanText = rawText;
  const match = rawText.match(/\[Paso \d+\/\d+\]\s*(.*)/);
  
  if (match) {
    cleanText = match[1];
  } else if (!rawText) {
    // Si no hay texto (modo webhook/n8n ciego), simulamos las fases según el tiempo transcurrido
    const createdDate = new Date(analyzingVideo.created_at).getTime();
    const elapsedSeconds = (now - createdDate) / 1000;
    
    if (elapsedSeconds < 15) {
      cleanText = 'Transcripción...';
    } else if (elapsedSeconds < 30) {
      cleanText = 'Entendimiento...';
    } else if (elapsedSeconds < 45) {
      cleanText = 'Creación de datos...';
    } else {
      cleanText = 'Envío...';
    }
  } else {
    cleanText = rawText;
  }

  return (
    <div className="ai-status-indicator">
      <Loader2 size={16} className="animate-spin" />
      <Sparkles size={16} />
      <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        IA en curso: {cleanText}
      </span>
    </div>
  );
};

export default AIStatusIndicator;
