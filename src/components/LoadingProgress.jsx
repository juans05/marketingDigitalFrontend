import React, { useEffect } from 'react';
import { useVideoProgress } from '../hooks/useVideoProgress';
import './LoadingProgress.css';

// Mapeo de etapas del backend al formato visual
const STAGES = [
  { id: 'transcribing', label: 'Transcribiendo audio', icon: '🎙️' },
  { id: 'analyzing', label: 'Analizando momentos', icon: '✨' },
  { id: 'generating', label: 'Generando clips', icon: '✂️' },
  { id: 'validating', label: 'Validando calidad', icon: '✅' },
  { id: 'scoring', label: 'Calculando score', icon: '⭐' },
];

/**
 * Componente que muestra el progreso multi-etapa del procesamiento de video
 *
 * @param {Object} props
 * @param {string} props.videoId - ID del video siendo procesado
 * @param {Function} props.onComplete - Callback cuando se completa (recibe progress)
 * @param {Function} props.onError - Callback cuando hay error (recibe mensaje)
 * @param {string} props.apiUrl - URL base de la API (opcional)
 */
export function LoadingProgress({ videoId, onComplete, onError, apiUrl = '' }) {
  const { progress, error, isComplete } = useVideoProgress(videoId, apiUrl);

  // Ejecutar callbacks cuando cambien los estados de progreso
  useEffect(() => {
    if (isComplete && progress?.stage === 'completed') {
      onComplete?.(progress);
    }
  }, [isComplete, progress, onComplete]);

  useEffect(() => {
    if (progress?.stage === 'error') {
      onError?.(progress.errorMessage || 'Error desconocido');
    }
  }, [progress?.stage, progress?.errorMessage, onError]);

  // Estado de inicialización: esperando datos
  if (!progress) {
    return (
      <div className="loading-progress-container loading-init">
        <div className="loading-spinner">
          <div className="spinner" />
          <p>Inicializando procesamiento...</p>
        </div>
      </div>
    );
  }

  // Error de conexión temporal (pero sigue intentando)
  if (error) {
    return (
      <div className="loading-progress-container loading-error-temp">
        <div className="error-temp">
          <p>⚠️ Reconectando...</p>
          <p className="error-detail">{error}</p>
        </div>
      </div>
    );
  }

  // Calcular índice de etapa actual
  const currentStageIndex = STAGES.findIndex(s => s.id === progress.stage);
  const isUnknownStage = currentStageIndex === -1;
  const stageIndex = isUnknownStage ? 0 : currentStageIndex;
  const currentStage = STAGES[stageIndex] || {};
  const progressPercent = ((stageIndex + 1) / STAGES.length) * 100;

  return (
    <div className="loading-progress-container">
      <div className="progress-header">
        <h2>Detectando los mejores capítulos...</h2>
      </div>

      <div className="progress-stages">
        {STAGES.map((stage, idx) => {
          const isActive = idx === stageIndex;
          const isComplete = idx < stageIndex;

          return (
            <div
              key={stage.id}
              className={`stage ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
            >
              <div className="stage-icon">{stage.icon}</div>
              <div className="stage-content">
                <div className="stage-label">{stage.label}</div>
                {isActive && progress.currentClip && (
                  <div className="stage-progress">
                    Clip {progress.currentClip}/{progress.totalClips || progress.clipCount || '?'}
                  </div>
                )}
              </div>
              {isComplete && <div className="checkmark">✓</div>}
              {isActive && <div className="spinner-small" />}
            </div>
          );
        })}
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <p className="eta">Tiempo estimado: 5-10 minutos</p>

      {progress.stage === 'error' && (
        <div className="error-message">
          <p>❌ Error: {progress.errorMessage || 'Error desconocido en el procesamiento'}</p>
        </div>
      )}
    </div>
  );
}

export default LoadingProgress;
