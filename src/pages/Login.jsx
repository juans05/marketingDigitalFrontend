import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, User, Building2, Sparkles, ArrowRight, X } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  // mode: 'login' | 'register'
  const [mode, setMode]           = useState('login');
  const [regStep, setRegStep]     = useState(1);
  const [accountType, setAccountType] = useState('');

  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const resetForm = () => {
    setError(''); setName(''); setEmail(''); setPassword('');
    setAccountType(''); setRegStep(1);
  };

  const switchMode = (m) => { resetForm(); setMode(m); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const body = { email, password };
      if (mode === 'register') { body.account_type = accountType; body.name = name; }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar la solicitud');
      localStorage.setItem('vidalis_user', JSON.stringify(data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputWrapper = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    background: '#FFFFFF', 
    border: '1px solid var(--border-main)', 
    borderRadius: '8px', 
    padding: '12px 16px',
    transition: 'all 0.2s ease',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
  };
  const inputStyle   = { background: 'none', border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '14px', width: '100%', fontFamily: 'Inter' };
  const labelStyle   = { color: 'var(--text-main)', fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px 20px', 
      background: 'var(--bg-primary)', 
      fontFamily: 'Inter',
      overflowY: 'auto' 
    }}>
      
      <div className="card-pro animate-fade-in" style={{ 
        width: '100%', 
        maxWidth: '440px', 
        padding: '48px 40px', 
        textAlign: 'center', 
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-lg)'
      }}>

        {/* Logo Section */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '10px' }}>
              <svg width="24" height="24" viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0-3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="white"/>
              </svg>
            </div>
            <span style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)', fontFamily: 'Outfit' }}>
              Vidalis<span style={{ color: 'var(--primary)' }}>.ai</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>
            {mode === 'login' ? 'Gestiona tu impacto en redes sociales' : 'Comienza tu viaje con Vidalis'}
          </p>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: '10px', padding: '4px', marginBottom: '32px' }}>
          {[
            { id: 'login',    label: 'Ingresar', icon: <LogIn size={16} /> },
            { id: 'register', label: 'Registrarse', icon: <UserPlus size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => switchMode(tab.id)}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '14px', fontWeight: '600',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: mode === tab.id ? '#FFF' : 'transparent',
                color: mode === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: mode === tab.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ─── LOGIN FORM ─── */}
        {mode === 'login' && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={labelStyle}>Email</label>
              <div style={inputWrapper}>
                <Mail size={18} color="#9CA3AF" />
                <input type="email" placeholder="ejemplo@vidalis.ai" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: '24px', textAlign: 'left' }}>
              <label style={labelStyle}>Contraseña</label>
              <div style={inputWrapper}>
                <Lock size={18} color="#9CA3AF" />
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
              </div>
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '8px', padding: '12px', color: '#DC2626', fontSize: '14px', fontWeight: '500', marginBottom: '20px', textAlign: 'left' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: '48px', fontSize: '15px' }}>
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>

            <p style={{ marginTop: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
              ¿No tienes cuenta?{' '}
              <button type="button" onClick={() => switchMode('register')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', fontSize: '14px', padding: 0 }}>
                Regístrate gratis
              </button>
            </p>
          </form>
        )}

        {/* ─── REGISTER FORM ─── */}
        {mode === 'register' && (
          <>
            {regStep === 1 && (
              <div>
                <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px', color: 'var(--text-main)' }}>¿Cómo usarás Vidalis?</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { type: 'artist', icon: <User size={20} />, title: 'Creador / Artista', sub: 'Para gestionar mi marca personal' },
                    { type: 'agency', icon: <Building2 size={20} />, title: 'Agencia / Empresa', sub: 'Para gestionar múltiples marcas' },
                  ].map(opt => (
                    <button
                      key={opt.type}
                      onClick={() => { setAccountType(opt.type); setRegStep(2); }}
                      style={{ 
                        padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-main)', background: '#FFFFFF', 
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-main)', transition: 'all 0.2s ease',
                        textAlign: 'left'
                      }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = '#F9FAFB'; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-main)'; e.currentTarget.style.background = '#FFFFFF'; }}
                    >
                      <div style={{ background: '#F3F4F6', padding: '10px', borderRadius: '8px', color: 'var(--primary)' }}>{opt.icon}</div>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '14px' }}>{opt.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{opt.sub}</div>
                      </div>
                      <ArrowRight size={16} color="#9CA3AF" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {regStep === 2 && (
              <div>
                <div style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '8px', 
                  background: '#F3F4F6', border: '1px solid var(--border-main)', 
                  borderRadius: '20px', padding: '6px 14px', marginBottom: '24px', 
                  fontSize: '12px', fontWeight: '600', color: 'var(--text-main)'
                }}>
                  {accountType === 'artist' ? <User size={14} /> : <Building2 size={14} />}
                  Cuenta {accountType === 'artist' ? 'Artista' : 'Agencia'}
                  <button onClick={() => setRegStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}><X size={14} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                    <label style={labelStyle}>{accountType === 'artist' ? 'Nombre Artístico' : 'Nombre de Agencia'}</label>
                    <div style={inputWrapper}>
                      <User size={18} color="#9CA3AF" />
                      <input type="text" placeholder="Ej: Juan Pérez" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                    <label style={labelStyle}>Email</label>
                    <div style={inputWrapper}>
                      <Mail size={18} color="#9CA3AF" />
                      <input type="email" placeholder="hola@vidalis.ai" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                    <label style={labelStyle}>Contraseña</label>
                    <div style={inputWrapper}>
                      <Lock size={18} color="#9CA3AF" />
                      <input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: '48px', fontSize: '15px' }}>
                    {loading ? 'Creando cuenta...' : 'Confirmar Registro'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-main)', paddingTop: '20px' }}>
          <a href="/" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>
            ← Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
