import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, LogIn } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav style={{ 
      width: '100%',
      height: '72px',
      padding: '0 40px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      position: 'sticky',
      top: '0',
      zIndex: 1000,
      background: '#FFFFFF',
      borderBottom: '1px solid var(--border-main)',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} 
        onClick={() => navigate('/')}
      >
        <div style={{ 
          background: 'var(--primary)', 
          padding: '6px', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="22" height="21" viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0-3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="white"/>
          </svg>
        </div>
        <span style={{ 
          fontFamily: 'Outfit, sans-serif',
          fontSize: '22px', 
          fontWeight: '800', 
          letterSpacing: '-0.02em',
          color: 'var(--text-main)'
        }}>
          Vidalis<span style={{ color: 'var(--primary)' }}>.ai</span>
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        <a href="#features" style={{ 
          color: 'var(--text-muted)', 
          textDecoration: 'none', 
          fontWeight: '600',
          fontSize: '14px',
          transition: 'color 0.2s ease'
        }} className="nav-link">Funciones</a>
        <a href="#about" style={{ 
          color: 'var(--text-muted)', 
          textDecoration: 'none', 
          fontWeight: '600',
          fontSize: '14px',
          transition: 'color 0.2s ease'
        }} className="nav-link">Nosotros</a>
        
        <button 
          onClick={() => navigate('/login')} 
          className="btn-primary btn-nav-login"
        >
          <LogIn size={16} />
          <span>Acceso Directo</span>
        </button>
      </div>

      <style>{`
        .nav-link:hover { color: var(--primary); }
        .btn-nav-login { padding: 10px 20px; font-size: 14px; border-radius: 8px; white-space: nowrap; }
        
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-link { display: none; }
          .btn-nav-login { padding: 8px 14px; font-size: 13px; }
          .btn-nav-login span { display: inline; }
        }
        @media (max-width: 400px) {
          .btn-nav-login span { display: none; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
