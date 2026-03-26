import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, TrendingUp, Zap, Rocket, ShieldCheck, Sparkles } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="animate-fade-in" style={{ 
      padding: '120px 20px 80px', 
      textAlign: 'center', 
      maxWidth: '1200px', 
      margin: '0 auto',
      position: 'relative'
    }}>
      {/* Dynamic Background Element - Purged for absolute minimalist elite status */}

      <div className="glass-panel" style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '8px 20px', 
        borderRadius: '100px', 
        color: '#FFFFFF',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginBottom: '40px',
        border: '2px solid var(--border-glass)'
      }}>
        <Zap size={14} fill="white" /> 
        <span>Impulsando la Elite Creativa</span>
      </div>
      
      <h1 style={{ 
        fontSize: 'clamp(32px, 6vw, 56px)', 
        fontWeight: '700', 
        lineHeight: '1.2',
        marginBottom: '32px',
        fontFamily: 'Outfit', // Changed font
        letterSpacing: '-0.02em',
        maxWidth: '800px',
        margin: '0 auto 32px',
        color: '#FFFFFF'
      }}>
        Escala tu <span style={{ color: '#FFFFFF', textDecoration: 'underline', textDecorationColor: '#444' }}>Marca</span><br />
        Sin Límites.
      </h1>
      
      <p style={{ 
        fontSize: 'clamp(16px, 2.5vw, 19px)', 
        color: 'rgb(156 163 175)', // Changed to slate-400
        maxWidth: '640px', 
        margin: '0 auto 48px',
        lineHeight: '1.6',
        fontWeight: '400',
        letterSpacing: '0.01em'
      }}>
        La infraestructura de post-producción impulsada por IA diseñada para agencias y creadores de alto impacto. 
        Analiza, multiplica y domina la tendencia en segundos.
      </p>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '24px' 
      }}>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          justifyContent: 'center', 
          gap: '20px',
          width: '100%'
        }}>
          <button 
            onClick={() => navigate('/login')} 
            className="btn-action" 
            style={{ padding: '20px 48px', fontSize: '1rem' }}
          >
            <Rocket size={20} />
            Empieza a crecer hoy
          </button>
          
          <button className="glass-panel" style={{ 
            padding: '18px 40px', 
            fontSize: '1rem', 
            color: 'white', 
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)' // Changed color
          }}>
            <div style={{ 
              padding: '6px', 
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #333'
            }}>
              <svg width="20" height="19" viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0-3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="white"/>
              </svg>
            </div>
            Ver Estrategia
          </button>
        </div>

        {/* Social Proof Badges */}
        <div style={{ 
          marginTop: '60px', 
          display: 'flex', 
          flexWrap: 'wrap',
          justifyContent: 'center', 
          gap: '40px', 
          color: '#6B7280',
          fontSize: '0.8rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp size={16} /> 
            <span>+800% Retención Media</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={16} /> 
            <span>Autoridad en 3 Segundos</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          section { padding: 80px 20px 40px; }
          .btn-action { width: 100%; }
          .glass-panel { width: 100%; justify-content: center; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
