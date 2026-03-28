import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, TrendingUp, Zap, Rocket, ShieldCheck, Sparkles } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="animate-fade-in" style={{ 
      padding: '100px 20px 100px', 
      textAlign: 'center', 
      maxWidth: '1200px', 
      margin: '0 auto',
      position: 'relative',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '6px 16px', 
        borderRadius: '20px', 
        background: '#EEF2FF',
        color: 'var(--primary)',
        fontSize: '12px',
        fontWeight: '700',
        marginBottom: '32px',
        border: '1px solid #C7D2FE'
      }}>
        <Zap size={14} fill="currentColor" /> 
        <span>SOCIAL MEDIA INTELLIGENCE</span>
      </div>
      
      <h1 style={{ 
        fontSize: 'clamp(40px, 8vw, 64px)', 
        fontWeight: '800', 
        lineHeight: '1.1',
        marginBottom: '24px',
        fontFamily: 'Outfit, sans-serif',
        letterSpacing: '-0.03em',
        maxWidth: '900px',
        margin: '0 auto 24px',
        color: 'var(--text-main)'
      }}>
        Multiplica tu <span style={{ color: 'var(--primary)' }}>Impacto Visual</span> en segundos.
      </h1>
      
      <p style={{ 
        fontSize: 'clamp(18px, 3vw, 20px)', 
        color: 'var(--text-muted)',
        maxWidth: '700px', 
        margin: '0 auto 48px',
        lineHeight: '1.6',
        fontWeight: '500'
      }}>
        La plataforma de gestión y distribución impulsada por IA creada para agencias y creadores que buscan dominar las tendencias mundiales.
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
          gap: '16px',
          width: '100%'
        }}>
          <button 
            onClick={() => navigate('/login')} 
            className="btn-primary" 
            style={{ padding: '16px 40px', fontSize: '1.1rem', borderRadius: '12px' }}
          >
            <Rocket size={20} />
            Empezar Gratis
          </button>
          
          <button className="btn-secondary" style={{ 
            padding: '16px 40px', 
            fontSize: '1.1rem',
            borderRadius: '12px'
          }}>
            <Play size={20} fill="currentColor" />
            Ver Demo
          </button>
        </div>

        {/* Dynamic Social Proof */}
        <div style={{ 
          marginTop: '64px', 
          paddingTop: '32px',
          borderTop: '1px solid var(--border-main)',
          display: 'flex', 
          flexWrap: 'wrap',
          justifyContent: 'center', 
          gap: '48px', 
          color: 'var(--text-muted)',
          fontSize: '13px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--primary)" /> 
            <span>+800% Retención Media</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="var(--accent)" /> 
            <span>Distribución Multi-Canal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#F59E0B" /> 
            <span>AI-Driven Analysis</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          section { padding: 60px 20px !important; }
          h1 { font-size: 2.5rem !important; }
          .btn-primary, .btn-secondary { width: 100%; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
