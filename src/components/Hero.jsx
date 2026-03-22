import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, TrendingUp, Zap } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section style={{ 
      padding: '100px 20px', 
      textAlign: 'center', 
      maxWidth: '1200px', 
      margin: '0 auto' 
    }}>
      <div className="animate-float" style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '10px', 
        padding: '8px 16px', 
        borderRadius: '100px', 
        background: 'rgba(155, 81, 224, 0.1)', 
        border: '1px solid rgba(155, 81, 224, 0.2)',
        color: 'var(--primary)',
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '30px'
      }}>
        <Zap size={16} /> NUEVA ERA DE CONTENIDO MUSICAL
      </div>
      
      <h1 className="text-gradient" style={{ 
        fontSize: 'clamp(40px, 8vw, 84px)', 
        fontWeight: '900', 
        lineHeight: '1.1',
        marginBottom: '30px'
      }}>
        Sube una vez.<br />Domina todas las redes.
      </h1>
      
      <p style={{ 
        fontSize: '18px', 
        color: 'var(--text-muted)', 
        maxWidth: '600px', 
        margin: '0 auto 40px',
        lineHeight: '1.6'
      }}>
        Nuestra IA analiza tu video, calcula su <strong>Viral Score</strong> y lo distribuye optimizado para TikTok, Reels y Shorts en segundos.
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '18px 40px', fontSize: '18px' }}>
          Empezar Ahora
        </button>
        <button className="glass-card" style={{ 
          padding: '18px 40px', 
          fontSize: '18px', 
          color: 'white', 
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Play size={20} fill="white" /> Ver Demo
        </button>
      </div>

      <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'center', gap: '60px', opacity: 0.6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TrendingUp size={24} /> +500% Alcance
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={24} /> Posteo Instantáneo
        </div>
      </div>
    </section>
  );
};

export default Hero;
