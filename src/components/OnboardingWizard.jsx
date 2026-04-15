import { useState } from 'react';
import { User, Building2, Users, ChevronRight, ChevronLeft, Instagram, Youtube, Facebook, CheckCircle2, LayoutDashboard, Calendar, BarChart3, MessageSquare, Link, Sparkles, X } from 'lucide-react';

const OnboardingWizard = ({ userId, userType, onComplete }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState({
    persona: '',
    teamSize: 'Solo yo',
    agencyName: '',
    brandName: '',
    goals: ['Programación y publicación', 'Análisis y reportes'],
    firstArtist: { name: '', genre: '', tone: '' }
  });
  const [artistId, setArtistId] = useState(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);


  const nextStep = async () => {
    const isIndividual = data.persona === 'individual';
    // Para individuales, el paso social es el 3 (que visualmente es el 4)
    // Para agencias, el paso social es el 4.
    // Gatillamos la creación del artista justo antes de entrar al paso donde se conectan redes.
    const movingToSocialStep = (step === 2 && isIndividual) || (step === 3 && !isIndividual);

    if (movingToSocialStep) {
      setIsSubmitting(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/onboarding`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, persona: data.persona, teamSize: data.teamSize, goals: data.goals, firstArtist: data.firstArtist })
        });
        const result = await response.json();
        if (response.ok && result.artist) {
          setArtistId(result.artist.id);
        }
      } catch (err) {
        console.error('Error pre-guardando marca:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const handleSocialConnect = async (platformId) => {
    if (!artistId) {
      alert('Debes configurar tu marca primero.');
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/connect-social/${artistId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al generar link');
      
      // Abrir popup de conexión
      window.open(data.url, '_blank', 'width=600,height=700');
      
      // Marcar como "intentado" o simplemente dejar que el usuario vea el popup
      // Para saber si se conectó realmente, habría que consultar el status periódicamente.
    } catch (err) {
      console.error('Error al conectar red social:', err);
      alert('Error al conectar: ' + err.message);
    }
  };


  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, persona: data.persona, teamSize: data.teamSize, goals: data.goals, firstArtist: data.firstArtist })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fallo el registro del onboarding');
      }
      const result = await response.json();
      const finalArtistId = artistId || result?.artist?.id || null;
      const finalArtistName = data.firstArtist?.name || data.agencyName || data.brandName || null;
      onComplete(finalArtistId ? { id: finalArtistId, name: finalArtistName } : null);
    } catch (error) {
      console.error('Error al guardar onboarding:', error);
      onComplete(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, persona: 'skipped', teamSize: 'solo', goals: [], firstArtist: {} })
      });
    } catch (error) {
      console.error('Error al omitir onboarding:', error);
    } finally {
      setIsSubmitting(false);
      onComplete(null);
    }
  };

  const renderStep = () => {
    const effectiveStep = (step === 3 && data.persona === 'individual') ? 4 : step;

    switch (effectiveStep) {
      case 1:
        return (
          <div className="step-content animate-fade-in">
            <h2 className="title">¿Qué te describe mejor?</h2>
            <p className="subtitle">Entender quién usa Vidalis nos ayuda a optimizar tu experiencia.</p>
            <div className="grid-selection">
              {[
                { id: 'individual', label: 'Creador de contenido, marca personal o influencer', icon: <User size={32} /> },
                { id: 'agency', label: 'Agencia de marketing / Gestión de múltiples clientes', icon: <Building2 size={32} /> },
              ].map(item => (
                <button key={item.id} className={`card-option ${data.persona === item.id ? 'active' : ''}`} onClick={() => setData({...data, persona: item.id})}>
                  <div className="card-icon">{item.icon}</div>
                  <span className="card-label">{item.label}</span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: '48px' }}>
              <p className="label-small" style={{ marginBottom: '16px', color: '#A1A1AA', fontWeight: '800' }}>¿Cuánta gente va a trabajar contigo?</p>
              <div className="grid-selection small">
                {[
                  { id: 'Solo yo', label: 'Operación Individual', sub: 'Solo tú tendrás acceso a la plataforma', icon: <User size={24} /> },
                  { id: 'Voy a trabajar con más compañeros', label: 'Equipo Colaborativo', sub: 'Múltiples asientos para tu equipo de trabajo', icon: <Users size={24} /> },
                ].map(item => (
                  <button key={item.id} className={`card-option small-flat ${data.teamSize === item.id ? 'active' : ''}`} onClick={() => setData({...data, teamSize: item.id})}>
                    <div className="card-icon mini">{item.icon}</div>
                    <div style={{ textAlign: 'left' }}>
                      <span className="card-label mini">{item.label}</span>
                      <p style={{ margin: 0, fontSize: '11px', color: '#71717A', fontWeight: '500' }}>{item.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content animate-fade-in">
            <h2 className="title">¿Cómo vas a utilizar Vidalis?</h2>
            <p className="subtitle">Esto nos ayuda a orientar y agilizar tu experiencia.</p>
            <div className="grid-selection small">
              {[
                { id: 'publish', label: 'Programación y publicación de contenidos', icon: <Calendar size={28} /> },
                { id: 'analytics', label: 'Análisis y reportes', icon: <BarChart3 size={28} /> },
                { id: 'bio', label: 'Crear una página para tu enlace de biografía', icon: <Link size={28} /> },
                { id: 'inbox', label: 'Gestión de conversaciones', icon: <MessageSquare size={28} /> },
              ].map(item => (
                <button key={item.id} className={`card-option small ${data.goals.includes(item.label) ? 'active' : ''}`}
                  onClick={() => {
                    const exists = data.goals.includes(item.label);
                    setData({ ...data, goals: exists ? data.goals.filter(g => g !== item.label) : [...data.goals, item.label] });
                  }}>
                  <div className="card-icon small">{item.icon}</div>
                  <span className="card-label small">{item.label}</span>
                </button>
              ))}
            </div>
            <p className="info-text">Puedes seleccionar más de una</p>
          </div>
        );

      case 3:
        return (
          <div className="step-content animate-fade-in">
            <h2 className="title">Configura tu Primera Marca</h2>
            <p className="subtitle">Como agencia, el primer paso es añadir un cliente o artista para gestionar.</p>
            <div className="input-group">
              <label>Nombre del Artista o Marca</label>
              <input type="text" placeholder="Ej: David Guetta, Nike Latino..." value={data.firstArtist.name}
                onChange={e => setData({...data, firstArtist: {...data.firstArtist, name: e.target.value}})} />
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Género / Nicho</label>
                <select value={data.firstArtist.genre} onChange={e => setData({...data, firstArtist: {...data.firstArtist, genre: e.target.value}})}>
                  <option value="">Selecciona...</option>
                  <option value="music">Música / Entretenimiento</option>
                  <option value="tech">Tecnología</option>
                  <option value="fashion">Moda / Estilo de Vida</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div className="input-group">
                <label>Tono de Marca</label>
                <select value={data.firstArtist.tone} onChange={e => setData({...data, firstArtist: {...data.firstArtist, tone: e.target.value}})}>
                  <option value="">Selecciona...</option>
                  <option value="energetic">Enérgico</option>
                  <option value="professional">Profesional</option>
                  <option value="funny">Divertido</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content animate-fade-in">
            <h2 className="title">Conecta tus redes sociales</h2>
            <p className="subtitle">Vincula la cuenta de {data.persona === 'agency' ? data.firstArtist.name || 'tu marca' : 'tu perfil'} con tus redes sociales.</p>
            <div className="social-grid">
              {[
                { id: 'instagram', label: 'Instagram', color: '#E1306C', icon: <Instagram size={18} /> },
                { id: 'tiktok', label: 'TikTok', color: '#555', icon: <Sparkles size={18} /> },
                { id: 'facebook', label: 'Facebook', color: '#1877F2', icon: <Facebook size={18} /> },
                { id: 'youtube', label: 'YouTube', color: '#FF0000', icon: <Youtube size={18} /> },
              ].map(platform => (
                <div key={platform.id} className="social-card">
                  <div className="platform-info">
                      <span className="platform-info-text" style={{ color: platform.color }}>
                        {platform.icon} {platform.label}
                      </span>
                    </div>
                    <button 
                      className="btn-connect" 
                      style={{ backgroundColor: platform.color }}
                      onClick={() => handleSocialConnect(platform.id)}
                      disabled={isSubmitting}
                    >
                    {isSubmitting ? 'Procesando...' : `Conectar cuenta de ${platform.label}`}
                  </button>

                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>
        <div className="modal-inner">
          <button
            onClick={handleSkip}
            title="Omitir Onboarding"
            disabled={isSubmitting}
            className="btn-skip"
          >
            <X size={20} />
          </button>

          {renderStep()}

          <div className="modal-footer">
            {step > 1 && (
              <button className="btn-back" onClick={prevStep}>
                <ChevronLeft size={18} /> Atrás
              </button>
            )}
            <div style={{ flexGrow: 1 }} />
            <div className="footer-status">
              <Sparkles size={16} color="#f59e0b" />
              <span>{step === 4 ? '¡Casi listos!' : '¡Cuenta activada!'}</span>
            </div>
            <button
              className="btn-continue"
              onClick={step === 4 ? handleFinish : nextStep}
              disabled={(step === 1 && !data.persona) || isSubmitting}
              style={{
                background: (step === 1 && !data.persona) ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                padding: '16px 24px', borderRadius: '100px',
                boxShadow: (step === 1 && !data.persona) ? 'none' : '0 10px 20px rgba(79,70,229,0.3)',
                whiteSpace: 'nowrap'
              }}
            >
              <span className="btn-continue-text-desktop">
                {step === 4 ? (isSubmitting ? 'Guardando...' : 'Finalizar Configuración') : 'Continuar al siguiente'}
              </span>
              <span className="btn-continue-text-mobile">
                {step === 4 ? (isSubmitting ? 'Guardando...' : 'Finalizar') : 'Continuar'}
              </span>
              {step < 4 && <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .onboarding-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.75); backdrop-filter: blur(12px);
          z-index: 9999; display: flex; align-items: flex-start; justify-content: center;
          padding: 40px 20px; overflow-y: auto; -webkit-overflow-scrolling: touch;
        }
        .onboarding-modal {
          background: #0F0F11; width: 100%; max-width: 800px; border-radius: 24px;
          overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.6); color: #FAFAFA;
          display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,0.08); margin: auto;
        }
        .progress-bar-container { height: 4px; background: rgba(255,255,255,0.06); width: 100%; }
        .progress-bar {
          height: 100%; background: linear-gradient(90deg, #4F46E5, #7C3AED);
          transition: width 0.6s cubic-bezier(0.4,0,0.2,1); box-shadow: 0 0 12px rgba(79,70,229,0.5);
        }
        .modal-inner { padding: 48px; display: flex; flex-direction: column; min-height: 500px; }
        .step-content { flex-grow: 1; }
        .title { font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 800; margin-bottom: 8px; color: #FAFAFA; letter-spacing: -0.02em; }
        .subtitle { color: #71717A; font-size: 17px; margin-bottom: 40px; line-height: 1.5; }
        .grid-selection { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .card-option {
          border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 32px 24px;
          background: #1C1C1F; cursor: pointer; transition: all 0.3s cubic-bezier(0.23,1,0.32,1);
          display: flex; flex-direction: column; align-items: center; text-align: center; gap: 16px; color: #FAFAFA;
        }
        .card-option.small-flat { padding: 20px; flex-direction: row; text-align: left; gap: 16px; border-radius: 16px; width: 100%; justify-content: flex-start; }
        .card-option.small-flat.active { background: rgba(79,70,229,0.12); border-color: #4F46E5; box-shadow: 0 4px 20px rgba(79,70,229,0.15); }
        .card-option.small-flat.active .card-label.mini { color: #818CF8; }
        .card-label.mini { font-weight: 800; font-size: 14px; display: block; margin-bottom: 2px; color: #FAFAFA; }
        .card-icon.mini { width: 44px; height: 44px; background: rgba(255,255,255,0.06); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #818CF8; }
        .card-option:hover { border-color: #4F46E5; transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); background: #27272A; }
        .card-option.active { border-color: #4F46E5; background: rgba(79,70,229,0.12); box-shadow: 0 0 0 1px #4F46E5; }
        .card-icon { width: 72px; height: 72px; background: rgba(255,255,255,0.06); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #818CF8; transition: all 0.3s ease; }
        .card-icon.small { width: 56px; height: 56px; }
        .card-option.active .card-icon { background: #4F46E5; color: #FFF; box-shadow: 0 10px 20px rgba(79,70,229,0.3); }
        .card-label { font-weight: 800; font-size: 16px; line-height: 1.4; color: #FAFAFA; }
        .social-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .social-card { border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 16px; background: #1C1C1F; }
        .btn-connect { width: 100%; padding: 14px; border-radius: 12px; border: none; color: #FFF; font-weight: 800; font-size: 13px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: all 0.2s ease; }
        .btn-connect:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .modal-footer { margin-top: auto; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 20px; }
        .btn-continue { color: #FFF; padding: 16px 32px; border-radius: 100px; border: none; font-weight: 800; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all 0.3s cubic-bezier(0.23,1,0.32,1); }
        .btn-continue:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(79,70,229,0.4); }
        .btn-continue:disabled { background: rgba(255,255,255,0.06) !important; color: #52525B; cursor: not-allowed; box-shadow: none !important; }
        .btn-back { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 14px 28px; border-radius: 100px; font-weight: 700; cursor: pointer; color: #71717A; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        .btn-back:hover { background: rgba(255,255,255,0.08); color: #FAFAFA; }
        .footer-status { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; color: #52525B; }
        .input-group { margin-bottom: 20px; }
        .input-group label { display: block; font-size: 13px; font-weight: 800; margin-bottom: 10px; text-transform: uppercase; color: #71717A; letter-spacing: 0.05em; }
        .input-group input, .input-group select { width: 100%; padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); font-family: inherit; font-size: 15px; background: #1C1C1F; color: #FAFAFA; outline: none; transition: all 0.2s; }
        .input-group input::placeholder { color: var(--text-muted); opacity: 1; }
        .input-group select option { background: #1C1C1F; color: #FAFAFA; }
        .input-group input:focus, .input-group select:focus { border-color: #4F46E5; background: #27272A; box-shadow: 0 0 0 4px rgba(79,70,229,0.12); }
        .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .info-text { margin-top: 12px; color: #52525B; font-size: 13px; font-weight: 500; }
        .btn-continue-text-mobile { display: none; }
        .btn-continue-text-desktop { display: inline; }
        @media (max-width: 640px) {
          .onboarding-overlay { padding: 20px 12px; }
          .grid-selection, .social-grid { grid-template-columns: 1fr; gap: 12px; }
          .modal-inner { padding: 24px 16px; min-height: unset; }
          .title { font-size: 22px; }
          .subtitle { font-size: 14px; margin-bottom: 24px; }
          .modal-footer { flex-wrap: wrap; gap: 12px; padding-top: 20px; }
          .footer-status { display: none; }
          .btn-continue { flex: 1; justify-content: center; padding: 14px 20px !important; }
          .btn-continue-text-desktop { display: none; }
          .btn-continue-text-mobile { display: inline; }
          .btn-back { padding: 14px 20px; flex: 1; max-width: 120px; justify-content: center; }
          .card-option { padding: 16px; flex-direction: row; text-align: left; border-radius: 16px; gap: 16px; align-items: center; }
          .card-icon { width: 48px; height: 48px; min-width: 48px; border-radius: 12px; }
          .card-icon svg { width: 24px; height: 24px; }
          .card-label { font-size: 14px; }
          .card-option.small-flat, .card-option.small { padding: 12px 16px; }
          .card-icon.mini, .card-icon.small { width: 36px; height: 36px; min-width: 36px; }
          .card-icon.mini svg, .card-icon.small svg { width: 18px; height: 18px; }
          .input-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default OnboardingWizard;
