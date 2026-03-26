import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, LogIn } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="glass-panel" style={{ 
      margin: '20px auto', 
      maxWidth: '1000px',
      width: '95%',
      padding: '12px 24px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      position: 'sticky',
      top: '20px',
      zIndex: 1000,
      borderRadius: '8px',
      border: '1px solid #222',
      background: '#000'
    }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} 
        onClick={() => navigate('/')}
      >
        <div style={{ 
          padding: '6px', 
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #444'
        }}>
          <svg width="24" height="23" viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0-3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="white"/>
          </svg>
        </div>
        <span style={{ 
          fontFamily: 'var(--font-heading)',
          fontSize: '18px', 
          fontWeight: '700', 
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: '#FFF'
        }}>
          VIDALIS<span style={{ color: '#666' }}>.AI</span>
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <a href="#pricing" style={{ 
          color: '#9CA3AF', 
          textDecoration: 'none', 
          fontWeight: '500',
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          transition: 'color 0.3s ease'
        }} className="nav-link">Precios</a>
        
        <button 
          onClick={() => navigate('/login')} 
          className="btn-action" 
          style={{ 
            padding: '10px 24px', 
            fontSize: '0.8rem',
            background: '#FFF',
            color: '#000',
            borderRadius: '4px'
          }}
        >
          <LogIn size={14} />
          <span className="hide-mobile">Acceso</span>
        </button>
      </div>

      <style>{`
        .nav-link:hover { color: #FFF; }
        @media (max-width: 600px) {
          .hide-mobile { display: none; }
          nav { padding: 12px 16px; width: 92%; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
