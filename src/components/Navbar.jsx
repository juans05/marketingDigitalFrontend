import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, LogIn } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="glass-morph" style={{
      width: '100%',
      height: '80px',
      padding: '0 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: '0',
      zIndex: 1000,
      borderBottom: '1px solid var(--border-main)',
      transition: 'all 0.3s ease'
    }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          padding: '8px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
        }}>
          <Sparkles size={20} color="white" />
        </div>
        <span className="accent-text" style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '24px',
          fontWeight: '900',
          letterSpacing: '-0.03em'
        }}>
          Vidalis
        </span>
      </div>

      <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
        <a href="#features" className="nav-link">Funciones</a>
        <a href="#about" className="nav-link">Nosotros</a>

        <button
          onClick={() => navigate('/login')}
          className="btn-primary btn-nav-login"
        >
          <LogIn size={18} />
          <span>Acceso Directo</span>
        </button>
      </div>

      <style>{`
        .nav-link {
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
          letter-spacing: 0.02em;
        }
        .nav-link:hover { 
          color: var(--text-main);
          transform: translateY(-1px);
        }
        .btn-nav-login { padding: 10px 20px; font-size: 14px; border-radius: 8px; white-space: nowrap; }
        
        @media (max-width: 768px) {
          nav { padding: 0 20px; height: 72px; }
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
