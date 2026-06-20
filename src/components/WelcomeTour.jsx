import { useState } from 'react';
import { Sparkles, Upload, BarChart3, MessageCircle, Share2, Settings, ChevronRight, ChevronLeft, Rocket, X } from 'lucide-react';

const STEPS = [
  {
    icon: <Rocket size={40} />,
    title: '¡Bienvenido a Vidalis!',
    subtitle: 'Tu asistente de marketing con IA',
    description: 'En 5 pasos vas a aprender a usar la plataforma para que tus videos tengan el máximo alcance posible.',
    tip: null,
    color: '#818CF8',
    bg: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(124,58,237,0.15))',
  },
  {
    icon: <Upload size={40} />,
    title: 'Paso 1: Sube tu video',
    subtitle: 'Content Copilot',
    description: 'Sube un video o pega una URL. La IA analiza TODO el contenido: visual, audio, tendencias, y te genera el copy perfecto con hashtags optimizados.',
    tip: 'La IA detecta imitaciones de artistas, lip sync, coreografías y formatos virales automáticamente.',
    color: '#A78BFA',
    bg: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(124,58,237,0.1))',
    navTarget: 'content',
  },
  {
    icon: <BarChart3 size={40} />,
    title: 'Paso 2: Revisa tus métricas',
    subtitle: 'Dashboard de Analítica',
    description: 'Mira tus seguidores, alcance, engagement y tracción viral en tiempo real. Los datos se sincronizan automáticamente desde tus redes.',
    tip: 'Dale a "Sincronizar" para traer los datos más recientes de TikTok, Instagram y YouTube.',
    color: '#38BDF8',
    bg: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(59,130,246,0.1))',
    navTarget: 'analytics',
  },
  {
    icon: <MessageCircle size={40} />,
    title: 'Paso 3: Responde comentarios',
    subtitle: 'Inbox Unificado',
    description: 'Todos los comentarios de todas tus redes en un solo lugar. Responde, da like u oculta comentarios sin salir de Vidalis.',
    tip: 'Puedes filtrar por plataforma para enfocarte en una red a la vez.',
    color: '#34D399',
    bg: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(16,185,129,0.1))',
    navTarget: 'inbox',
  },
  {
    icon: <Share2 size={40} />,
    title: 'Paso 4: Conecta tus redes',
    subtitle: 'Redes Sociales',
    description: 'Vincula TikTok, Instagram, Facebook o YouTube para que Vidalis pueda publicar, sincronizar métricas y gestionar comentarios.',
    tip: 'Solo necesitas conectar una vez. Después todo se sincroniza automáticamente.',
    color: '#F472B6',
    bg: 'linear-gradient(135deg, rgba(244,114,182,0.15), rgba(236,72,153,0.1))',
    navTarget: 'connect',
  },
  {
    icon: <Sparkles size={40} />,
    title: '¡Listo para empezar!',
    subtitle: 'Tu estratega de IA te espera',
    description: 'Sube tu primer video y mira cómo la IA te da un score viral, copy profesional y hashtags optimizados. Entre más videos subas, más aprende sobre tu estilo.',
    tip: null,
    color: '#FBBF24',
    bg: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.1))',
    navTarget: 'content',
    isFinal: true,
  },
];

const WelcomeTour = ({ onClose, onNavigate }) => {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      if (current.navTarget && onNavigate) onNavigate(current.navTarget);
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="tour-overlay">
      <div className="tour-modal">
        {/* Progress bar */}
        <div className="tour-progress-track">
          <div className="tour-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Step indicators */}
        <div className="tour-steps-row">
          {STEPS.map((_, i) => (
            <button
              key={i}
              className={`tour-step-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
              onClick={() => setStep(i)}
            />
          ))}
          <button className="tour-skip" onClick={handleSkip}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="tour-content" key={step}>
          <div className="tour-icon-box" style={{ background: current.bg }}>
            <div style={{ color: current.color }}>{current.icon}</div>
          </div>

          <div className="tour-subtitle" style={{ color: current.color }}>{current.subtitle}</div>
          <h2 className="tour-title">{current.title}</h2>
          <p className="tour-desc">{current.description}</p>

          {current.tip && (
            <div className="tour-tip">
              <Sparkles size={14} color="#FBBF24" />
              <span>{current.tip}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="tour-footer">
          {step > 0 ? (
            <button className="tour-btn-back" onClick={handlePrev}>
              <ChevronLeft size={16} /> Atrás
            </button>
          ) : (
            <button className="tour-btn-skip" onClick={handleSkip}>
              Omitir tour
            </button>
          )}

          <span className="tour-counter">{step + 1} / {STEPS.length}</span>

          <button className="tour-btn-next" onClick={handleNext} style={{
            background: current.isFinal
              ? `linear-gradient(135deg, #FBBF24, #F59E0B)`
              : `linear-gradient(135deg, #4F46E5, #7C3AED)`,
          }}>
            {current.isFinal ? 'Empezar' : 'Siguiente'}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <style>{`
        .tour-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
          z-index: 10000; display: flex; align-items: center; justify-content: center;
          padding: 20px; animation: tourFadeIn 0.3s ease;
        }
        @keyframes tourFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tourSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .tour-modal {
          background: #111113; width: 100%; max-width: 440px;
          border-radius: 24px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 40px 80px rgba(0,0,0,0.5);
          display: flex; flex-direction: column;
        }

        .tour-progress-track {
          height: 3px; background: rgba(255,255,255,0.06); width: 100%;
        }
        .tour-progress-fill {
          height: 100%; background: linear-gradient(90deg, #4F46E5, #7C3AED);
          transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 0 10px rgba(79,70,229,0.5);
        }

        .tour-steps-row {
          display: flex; align-items: center; gap: 8px;
          padding: 16px 20px 0;
        }
        .tour-step-dot {
          width: 8px; height: 8px; border-radius: 50%; border: none; cursor: pointer;
          background: rgba(255,255,255,0.1); transition: all 0.3s;
          padding: 0;
        }
        .tour-step-dot.active {
          width: 24px; border-radius: 4px;
          background: linear-gradient(90deg, #4F46E5, #7C3AED);
        }
        .tour-step-dot.done { background: rgba(79,70,229,0.4); }
        .tour-skip {
          margin-left: auto; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;
          padding: 4px 6px; cursor: pointer; color: #52525B;
          display: flex; align-items: center; transition: all 0.2s;
        }
        .tour-skip:hover { color: #A1A1AA; background: rgba(255,255,255,0.08); }

        .tour-content {
          padding: 32px 28px 24px; text-align: center;
          animation: tourSlideUp 0.4s ease;
        }
        .tour-icon-box {
          width: 88px; height: 88px; border-radius: 24px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .tour-subtitle {
          font-size: 11px; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.08em; margin-bottom: 8px;
        }
        .tour-title {
          font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800;
          color: #FAFAFA; margin: 0 0 12px; letter-spacing: -0.02em;
        }
        .tour-desc {
          font-size: 14px; color: #A1A1AA; line-height: 1.6; margin: 0;
          max-width: 360px; margin: 0 auto;
        }
        .tour-tip {
          margin-top: 16px; display: inline-flex; align-items: center; gap: 8px;
          background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.15);
          border-radius: 10px; padding: 10px 16px;
          font-size: 12px; color: #FBBF24; font-weight: 600;
          text-align: left; line-height: 1.5;
        }

        .tour-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px 20px; border-top: 1px solid rgba(255,255,255,0.06);
          gap: 12px;
        }
        .tour-counter {
          font-size: 12px; font-weight: 700; color: #52525B;
        }
        .tour-btn-back {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 10px 16px; cursor: pointer;
          color: #71717A; font-weight: 700; font-size: 13px;
          display: flex; align-items: center; gap: 4px; transition: all 0.2s;
        }
        .tour-btn-back:hover { color: #FAFAFA; background: rgba(255,255,255,0.08); }
        .tour-btn-skip {
          background: none; border: none; cursor: pointer;
          color: #52525B; font-weight: 600; font-size: 12px;
          padding: 10px 12px; transition: color 0.2s;
        }
        .tour-btn-skip:hover { color: #A1A1AA; }
        .tour-btn-next {
          border: none; border-radius: 12px; padding: 10px 20px;
          cursor: pointer; color: #fff; font-weight: 800; font-size: 13px;
          display: flex; align-items: center; gap: 6px;
          transition: all 0.2s; box-shadow: 0 4px 15px rgba(79,70,229,0.3);
        }
        .tour-btn-next:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79,70,229,0.4); }

        @media (max-width: 480px) {
          .tour-overlay { padding: 12px; align-items: flex-end; }
          .tour-modal { max-width: 100%; border-radius: 20px 20px 20px 20px; }
          .tour-content { padding: 24px 20px 20px; }
          .tour-title { font-size: 20px; }
          .tour-desc { font-size: 13px; }
          .tour-icon-box { width: 72px; height: 72px; border-radius: 20px; }
          .tour-icon-box svg { width: 32px; height: 32px; }
          .tour-tip { font-size: 11px; padding: 8px 12px; }
        }
      `}</style>
    </div>
  );
};

export default WelcomeTour;
