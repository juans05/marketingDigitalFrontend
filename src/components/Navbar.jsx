import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, LayoutDashboard, CreditCard, LogIn } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="glass-card" style={{ 
      margin: '20px', 
      padding: '15px 30px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      position: 'sticky',
      top: '20px',
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
        <Sparkles size={28} color="var(--primary)" />
        <span style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px' }}>
          VIDALIS<span style={{ color: 'var(--primary)' }}>.AI</span>
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
        <a href="#pricing" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: '500' }}>Precios</a>
        <button onClick={() => navigate('/login')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
          <LogIn size={18} />
          Acceder
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
