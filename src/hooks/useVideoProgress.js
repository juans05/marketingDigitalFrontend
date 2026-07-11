import { useState, useEffect } from 'react';

const POLL_INTERVAL = 1500; // 1.5 seconds

/**
 * Hook para hacer polling del progreso de procesamiento de un video
 *
 * @param {string} videoId - ID del video a monitorear
 * @param {string} apiUrl - URL base de la API (por defecto usa VITE_API_URL)
 * @returns {Object} { progress, error, isComplete }
 *   - progress: { stage, currentClip, totalClips, ... } o null si aún no hay datos
 *   - error: mensaje de error de conexión (o null)
 *   - isComplete: true cuando stage = 'completed' o 'error'
 */
export function useVideoProgress(videoId, apiUrl = '') {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!videoId) {
      setProgress(null);
      return;
    }

    let isActive = true;
    let pollAttempts = 0;
    const maxAttempts = 80; // ~2 minutos antes de timeout

    // Usar apiUrl del prop o del env
    const baseUrl = (apiUrl || (import.meta.env.VITE_API_URL || '')).replace(/\/+$/, '');

    const poll = async () => {
      if (!isActive || pollAttempts >= maxAttempts) {
        if (!isActive) return;
        // Timeout después de ~2 minutos
        if (pollAttempts >= maxAttempts) {
          setError('Timeout esperando respuesta del servidor');
          setIsComplete(true);
        }
        return;
      }

      try {
        // Usar fetch como hace el proyecto existente
        const token = (() => {
          try {
            return JSON.parse(localStorage.getItem('vidalis_user') || '{}').token || '';
          } catch {
            return '';
          }
        })();

        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        };

        const endpoint = `${baseUrl}/api/vidalis/video/${videoId}`;
        const response = await fetch(endpoint, { headers });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const video = await response.json();
        const data = video.ai_clips_data || {};

        if (!isActive) return;

        setProgress(data);
        setError(null);

        // Detener polling cuando se complete o haya error
        if (['completed', 'error'].includes(data.stage)) {
          setIsComplete(true);
          return;
        }

        pollAttempts++;
      } catch (err) {
        if (!isActive) return;

        // Log pero sigue intentando (error temporal)
        console.debug('[useVideoProgress]', err.message);
        setError(null); // No mostrar error de conexión si sigue intentando
        pollAttempts++;
      }

      // Programar siguiente polling
      if (isActive) {
        setTimeout(poll, POLL_INTERVAL);
      }
    };

    // Iniciar polling de inmediato
    poll();

    return () => {
      isActive = false;
    };
  }, [videoId, apiUrl]);

  return { progress, error, isComplete };
}
