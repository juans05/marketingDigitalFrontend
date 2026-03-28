import { useState } from 'react';
import { User, Building2, Users, ChevronRight, ChevronLeft, Instagram, Youtube, Facebook, CheckCircle2, LayoutDashboard, Calendar, BarChart3, MessageSquare, Link, Sparkles } from 'lucide-react';

const OnboardingWizard = ({ userId, userType, onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    persona: '', // individual, agency
    teamSize: 'Solo yo',
    agencyName: '',
    brandName: '',
    goals: ['Programación y publicación', 'Análisis y reportes'],
    firstArtist: {
      name: '',
      genre: '',
      tone: ''
    }
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleFinish = () => {
    // In search of perfection, we'll save this to the DB later
    onComplete();
  };

  const renderStep = () => {
    // If individual, skip step 3 (Add Artist)
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
                <button 
                  key={item.id}
                  className={`card-option ${data.persona === item.id ? 'active' : ''}`}
                  onClick={() => setData({...data, persona: item.id})}
                >
                  <div className="card-icon">{item.icon}</div>
                  <span className="card-label">{item.label}</span>
                </button>
              ))}
            </div>

            <div style={{ marginTop: '48px' }}>
              <p className="label-small" style={{ marginBottom: '16px', color: '#111', fontWeight: '800' }}>¿Cuánta gente va a trabajar contigo?</p>
              <div className="grid-selection small">
                {[
                  { id: 'Solo yo', label: 'Operación Individual', sub: 'Solo tú tendrás acceso a la plataforma', icon: <User size={24} /> },
                  { id: 'Voy a trabajar con más compañeros', label: 'Equipo Colaborativo', sub: 'Múltiples asientos para tu equipo de trabajo', icon: <Users size={24} /> },
                ].map(item => (
                  <button 
                    key={item.id}
                    className={`card-option small-flat ${data.teamSize === item.id ? 'active' : ''}`}
                    onClick={() => setData({...data, teamSize: item.id})}
                  >
                    <div className="card-icon mini">{item.icon}</div>
                    <div style={{ textAlign: 'left' }}>
                      <span className="card-label mini">{item.label}</span>
                      <p style={{ margin: 0, fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>{item.sub}</p>
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
                <button 
                  key={item.id}
                  className={`card-option small ${data.goals.includes(item.label) ? 'active' : ''}`}
                  onClick={() => {
                    const exists = data.goals.includes(item.label);
                    setData({
                      ...data, 
                      goals: exists ? data.goals.filter(g => g !== item.label) : [...data.goals, item.label]
                    });
                  }}
                >
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
                <input 
                type="text" 
                placeholder="Ej: David Guetta, Nike Latino..."
                value={data.firstArtist.name}
                onChange={e => setData({...data, firstArtist: {...data.firstArtist, name: e.target.value}})}
                />
              </div>
              
              <div className="input-row">
                <div className="input-group">
                  <label>Género / Nicho</label>
                  <select 
                  value={data.firstArtist.genre}
                  onChange={e => setData({...data, firstArtist: {...data.firstArtist, genre: e.target.value}})}
                  >
                    <option value="">Selecciona...</option>
                    <option value="music">Música / Entretenimiento</option>
                    <option value="tech">Tecnología</option>
                    <option value="fashion">Moda / Estilo de Vida</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Tono de Marca</label>
                  <select 
                  value={data.firstArtist.tone}
                  onChange={e => setData({...data, firstArtist: {...data.firstArtist, tone: e.target.value}})}
                  >
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
                { id: 'tiktok', label: 'TikTok', color: '#000000', icon: <Sparkles size={18} /> },
                { id: 'facebook', label: 'Facebook', color: '#1877F2', icon: <Facebook size={18} /> },
                { id: 'youtube', label: 'YouTube', color: '#FF0000', icon: <Youtube size={18} /> },
              ].map(platform => (
                <div key={platform.id} className="social-card">
                  <div className="platform-info">
                    <span style={{ color: platform.color, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                      {platform.icon} {platform.label}
                    </span>
                  </div>
                  <button className="btn-connect" style={{ backgroundColor: platform.color }}>
                    Conectar cuenta de {platform.label}
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
              disabled={step === 1 && !data.persona}
              style={{
                background: (step === 1 && !data.persona) ? '#E5E7EB' : '#111827',
                padding: '16px 32px',
                borderRadius: '100px',
                boxShadow: (step === 1 && !data.persona) ? 'none' : '0 10px 20px rgba(0,0,0,0.1)'
              }}
            >
              {step === 4 ? 'Finalizar Configuración' : 'Continuar al siguiente paso'}
              {step < 4 && <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .onboarding-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(44, 51, 216, 0.05);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .onboarding-modal {
          background: #FFFFFF;
          width: 100%;
          max-width: 800px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(44, 51, 216, 0.1);
          color: var(--text-main);
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-main);
        }

        .progress-bar-container {
          height: 8px;
          background: #F3F4F6;
          width: 100%;
        }

        .progress-bar {
          height: 100%;
          background: var(--primary);
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .modal-inner {
          padding: 48px;
          display: flex;
          flex-direction: column;
          min-height: 500px;
        }

        .step-content {
          flex-grow: 1;
        }

        .title {
          font-family: 'Outfit', sans-serif;
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 8px;
          color: var(--text-main);
          letter-spacing: -0.02em;
        }

        .subtitle {
          color: var(--text-muted);
          font-size: 17px;
          margin-bottom: 40px;
          line-height: 1.5;
        }

        .grid-selection {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .card-option {
          border: 2px solid #F3F4F6;
          border-radius: 20px;
          padding: 32px 24px;
          background: #FFF;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
        }

        .card-option.small-flat {
          padding: 20px;
          flex-direction: row;
          text-align: left;
          gap: 16px;
          border-radius: 16px;
          width: 100%;
          justify-content: flex-start;
        }

        .card-option.small-flat.active {
          background: #F5F7FF;
          border-color: var(--primary);
          box-shadow: 0 4px 20px rgba(44, 51, 216, 0.1);
        }

        .card-option.small-flat.active .card-label.mini { color: var(--primary); }

        .card-label.mini {
          font-weight: 800;
          font-size: 14px;
          display: block;
          margin-bottom: 2px;
          color: var(--text-main);
        }

        .card-icon.mini {
          width: 44px;
          height: 44px;
          background: #F9FAFB;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--primary);
        }

        .card-option:hover {
          border-color: var(--primary);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.06);
        }

        .card-option.active {
          border-color: var(--primary);
          background: #F5F7FF;
          box-shadow: 0 0 0 1px var(--primary);
        }

        .card-icon {
          width: 72px;
          height: 72px;
          background: #F9FAFB;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          transition: all 0.3s ease;
        }

        .card-icon.small {
          width: 56px;
          height: 56px;
        }

        .card-option.active .card-icon {
          background: var(--primary);
          color: #FFF;
          box-shadow: 0 10px 20px rgba(44, 51, 216, 0.2);
        }

        .card-label {
          font-weight: 800;
          font-size: 16px;
          line-height: 1.4;
          color: var(--text-main);
        }

        .social-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .social-card {
          border: 1px solid var(--border-main);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #F9FAFB;
        }

        .btn-connect {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          color: #FFF;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .modal-footer {
          margin-top: auto;
          padding-top: 32px;
          border-top: 1px solid var(--border-main);
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .btn-continue {
          background: var(--primary);
          color: #FFF;
          padding: 16px 32px;
          border-radius: 100px;
          border: none;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 10px 25px rgba(44, 51, 216, 0.2);
        }

        .btn-continue:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(44, 51, 216, 0.3);
        }

        .btn-continue:disabled {
          background: #E5E7EB;
          color: #9CA3AF;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-back {
          background: #FFF;
          border: 1px solid var(--border-main);
          padding: 14px 28px;
          border-radius: 100px;
          font-weight: 700;
          cursor: pointer;
          color: var(--text-muted);
          transition: all 0.2s;
        }

        .btn-back:hover {
          background: #F9FAFB;
          color: var(--text-main);
        }

        .footer-status {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 700;
          color: var(--text-muted);
        }

        .input-group label { 
          display: block; 
          font-size: 13px; 
          font-weight: 800; 
          margin-bottom: 10px; 
          text-transform: uppercase; 
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }
        
        .input-group input, .input-group select {
          width: 100%; 
          padding: 16px; 
          border-radius: 12px; 
          border: 1px solid var(--border-main); 
          font-family: inherit; 
          font-size: 15px;
          background: #F9FAFB;
          outline: none;
          transition: all 0.2s;
        }

        .input-group input:focus, .input-group select:focus {
          border-color: var(--primary);
          background: #FFF;
          box-shadow: 0 0 0 4px rgba(44, 51, 216, 0.1);
        }
        .input-row { display: flex; gap: 20px; }

        @media (max-width: 640px) {
          .grid-selection, .social-grid { grid-template-columns: 1fr; }
          .modal-inner { padding: 24px; }
          .title { font-size: 22px; }
          .hide-mobile { display: none; }
        }
      `}</style>
    </div>
  );
};

export default OnboardingWizard;
