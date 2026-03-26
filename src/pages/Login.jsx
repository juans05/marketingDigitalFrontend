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
    background: '#000', 
    border: '1px solid #333', 
    borderRadius: '4px', 
    padding: '14px 18px',
    transition: 'border-color 0.3s ease'
  };
  const inputStyle   = { background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: '14px', width: '100%', fontFamily: 'Outfit' };
  const labelStyle   = { color: '#6B7280', fontSize: '11px', fontWeight: '700', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '80px 20px', 
      background: '#000', 
      fontFamily: 'Outfit',
      overflowY: 'auto' 
    }}>
      
      {/* Structural Background Contrast */}
      <div style={{ 
        position: 'absolute', 
        width: '100%', 
        height: '100%', 
        background: '#000000',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div className="glass-panel" style={{ 
        width: '100%', 
        maxWidth: '450px', 
        padding: '64px 48px', 
        textAlign: 'center', 
        position: 'relative', 
        zIndex: 1,
        background: '#050505',
        border: '1px solid #1A1A1A',
        borderRadius: '4px',
        boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
      }}>

        {/* Logo Section */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ border: '1px solid #444', padding: '6px', borderRadius: '4px' }}>
              <svg width="28" height="27" viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0-3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="white"/>
              </svg>
            </div>
            <span style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              VIDALIS<span style={{ color: '#666' }}>.AI</span>
            </span>
          </div>
          <p style={{ color: '#6B7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {mode === 'login' ? 'Workstation de Impacto Viral' : 'Alta de Consultoría Estratégica'}
          </p>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', background: '#000', border: '1px solid #222', borderRadius: '4px', padding: '4px', marginBottom: '40px' }}>
          {[
            { id: 'login',    label: 'ACCESO', icon: <LogIn size={14} /> },
            { id: 'register', label: 'REGISTRO', icon: <UserPlus size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => switchMode(tab.id)}
              style={{
                flex: 1, padding: '12px', borderRadius: '2px', border: 'none', cursor: 'pointer',
                fontSize: '11px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: mode === tab.id ? '#FFF' : 'transparent',
                color: mode === tab.id ? '#000' : '#6B7280',
                transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                textTransform: 'uppercase'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ─── LOGIN FORM ─── */}
        {mode === 'login' && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px', textAlign: 'left' }}>
              <label style={labelStyle}>Identidad (Email)</label>
              <div style={inputWrapper}>
                <Mail size={16} color="#444" />
                <input type="email" placeholder="agencia@vidalis.ai" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: '40px', textAlign: 'left' }}>
              <label style={labelStyle}>Clave de Seguridad</label>
              <div style={inputWrapper}>
                <Lock size={16} color="#444" />
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
              </div>
            </div>

            {error && (
              <div style={{ background: '#200', border: '1px solid #411', borderRadius: '4px', padding: '14px', color: '#ef4444', fontSize: '12px', fontWeight: '700', marginBottom: '24px', textAlign: 'left' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-action" disabled={loading} style={{ width: '100%', height: '56px', fontSize: '12px', padding: 0 }}>
              {loading ? 'AUTENTICANDO...' : <><LogIn size={18} /> INICIAR SESIÓN</>}
            </button>

            <p style={{ marginTop: '32px', color: '#6B7280', fontSize: '11px', fontWeight: '600' }}>
              ¿SIN INFRAESTRUCTURA?{' '}
              <button type="button" onClick={() => switchMode('register')} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontWeight: '800', fontSize: '11px', padding: 0, textDecoration: 'underline' }}>
                CREAR CUENTA
              </button>
            </p>
          </form>
        )}

        {/* ─── REGISTER FORM ─── */}
        {mode === 'register' && (
          <>
            {regStep === 1 && (
              <div>
                <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '24px', textTransform: 'uppercase', color: '#FFF' }}>Nivel de Operación</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '32px' }}>
                  {[
                    { type: 'artist', icon: <User size={24} />, title: 'CREADOR / ARTISTA', sub: 'GESTIÓN INDIVIDUAL' },
                    { type: 'agency', icon: <Building2 size={24} />, title: 'AGENCIA / CORPORATIVO', sub: 'MULTI-ENTIDAD' },
                  ].map(opt => (
                    <button
                      key={opt.type}
                      onClick={() => { setAccountType(opt.type); setRegStep(2); }}
                      style={{ 
                        padding: '24px', borderRadius: '4px', border: '1px solid #1A1A1A', background: '#0A0A0A', 
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', color: 'white', transition: 'all 0.3s ease',
                        textAlign: 'left'
                      }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = '#FFF'; e.currentTarget.style.background = '#111'; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = '#1A1A1A'; e.currentTarget.style.background = '#0A0A0A'; }}
                    >
                      <div style={{ border: '1px solid #222', padding: '12px', borderRadius: '4px' }}>{opt.icon}</div>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontWeight: '800', fontSize: '13px', letterSpacing: '0.05em' }}>{opt.title}</div>
                        <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: '600', marginTop: '4px', letterSpacing: '0.05em' }}>{opt.sub}</div>
                      </div>
                      <ArrowRight size={16} color="#444" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {regStep === 2 && (
              <div>
                <div style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '10px', 
                  background: '#111', border: '1px solid #333', 
                  borderRadius: '4px', padding: '8px 16px', marginBottom: '32px', 
                  fontSize: '11px', fontWeight: '800', color: '#FFF',
                  textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  {accountType === 'artist' ? <User size={14} /> : <Building2 size={14} />}
                  MODO {accountType === 'artist' ? 'ARTISTA' : 'AGENCIA'}
                  <button onClick={() => setRegStep(1)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', display: 'flex' }}><X size={14} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                    <label style={labelStyle}>{accountType === 'artist' ? 'Nombre Artístico' : 'Razón Social / Agencia'}</label>
                    <div style={inputWrapper}>
                      <User size={16} color="#444" />
                      <input type="text" placeholder="Identificador Público" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                    <label style={labelStyle}>Email Corporativo</label>
                    <div style={inputWrapper}>
                      <Mail size={16} color="#444" />
                      <input type="email" placeholder="tu@empresa.com" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '32px', textAlign: 'left' }}>
                    <label style={labelStyle}>Contraseña Maestra</label>
                    <div style={inputWrapper}>
                      <Lock size={16} color="#444" />
                      <input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
                    </div>
                  </div>

                  <button type="submit" className="btn-action" disabled={loading} style={{ width: '100%', height: '56px', fontSize: '12px' }}>
                    {loading ? 'GENERANDO INFRAESTRUCTURA...' : <><UserPlus size={18} /> CREAR CUENTA</>}
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: '40px', borderTop: '1px solid #1A1A1A', paddingTop: '24px' }}>
          <a href="/" style={{ color: '#6B7280', fontSize: '11px', textDecoration: 'none', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ← Volver al Portal de Lanzamiento
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
