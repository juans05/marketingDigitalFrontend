import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, User, Building2, Sparkles, ArrowRight, X } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

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
    background: 'rgba(255, 255, 255, 0.03)', 
    border: '1px solid var(--border-main)', 
    borderRadius: '12px', 
    padding: '14px 18px',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };
  const inputStyle   = { background: 'none', border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '15px', width: '100%', fontFamily: 'var(--font-main)' };
  const labelStyle   = { color: 'var(--text-dim)', fontSize: '13px', fontWeight: '700', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px 20px', 
      background: 'var(--bg-primary)', 
      fontFamily: 'var(--font-main)',
      overflowY: 'auto',
      position: 'relative'
    }}>
      {/* Background Orbs */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px', background: 'rgba(79, 70, 229, 0.1)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '300px', height: '300px', background: 'rgba(168, 85, 247, 0.08)', filter: 'blur(80px)', borderRadius: '50%', zIndex: 0 }}></div>
      
      <div className="glass-morph animate-fade-in" style={{ 
        width: '100%', 
        maxWidth: '460px', 
        padding: '56px 48px', 
        textAlign: 'center', 
        borderRadius: '24px',
        border: '1px solid var(--border-main)',
        position: 'relative',
        zIndex: 1
      }}>

        {/* Logo Section */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', padding: '10px', borderRadius: '12px', boxShadow: '0 0 20px rgba(79, 70, 229, 0.4)' }}>
              <Sparkles size={24} color="white" />
            </div>
            <span style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.02em', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
              Vidalis<span style={{ color: 'var(--primary)' }}>.ai</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '600' }}>
            {mode === 'login' ? 'Estrategia Viral con Inteligencia Artificial' : 'Crea tu cuenta empresarial'}
          </p>
        </div>

        {/* Mode Selector */}
        <div className="glass-morph" style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', padding: '6px', marginBottom: '40px', border: '1px solid var(--border-main)' }}>
          {[
            { id: 'login',    label: 'Ingresar', icon: <LogIn size={16} /> },
            { id: 'register', label: 'Registrarse', icon: <UserPlus size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => switchMode(tab.id)}
              style={{
                flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontSize: '14px', fontWeight: '800',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: mode === tab.id ? 'var(--primary)' : 'transparent',
                color: mode === tab.id ? 'white' : 'var(--text-dim)',
                boxShadow: mode === tab.id ? 'var(--shadow-glow)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px', textAlign: 'left' }}>
              <label style={labelStyle}>Email Profesional</label>
              <div style={inputWrapper}>
                <Mail size={18} color="var(--primary)" />
                <input type="email" placeholder="nombre@compania.com" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: '32px', textAlign: 'left' }}>
              <label style={labelStyle}>Contraseña de Seguridad</label>
              <div style={inputWrapper}>
                <Lock size={18} color="var(--primary)" />
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '14px', color: '#EF4444', fontSize: '14px', fontWeight: '600', marginBottom: '24px', textAlign: 'left' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: '54px', fontSize: '16px', fontWeight: '900' }}>
              {loading ? 'Sincronizando...' : 'Ingresar al Dashboard'}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <>
            {regStep === 1 && (
              <div>
                <p style={{ fontSize: '16px', fontWeight: '800', marginBottom: '24px', color: 'var(--text-main)' }}>Selecciona tu ecosistema</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '32px' }}>
                  {[
                    { type: 'artist', icon: <User size={24} />, title: 'Marca Personal', sub: 'Para artistas y figuras públicas' },
                    { type: 'agency', icon: <Building2 size={24} />, title: 'Agencia Digital', sub: 'Múltiples canales y artistas' },
                  ].map(opt => (
                    <button
                      key={opt.type}
                      onClick={() => { setAccountType(opt.type); setRegStep(2); }}
                      style={{ 
                        padding: '24px', borderRadius: '16px', border: '1px solid var(--border-main)', background: 'rgba(255,255,255,0.02)', 
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', color: 'var(--text-main)', transition: 'all 0.3s ease',
                        textAlign: 'left'
                      }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(79, 70, 229, 0.2)'; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-main)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>{opt.icon}</div>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontWeight: '900', fontSize: '15px' }}>{opt.title}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '2px' }}>{opt.sub}</div>
                      </div>
                      <ArrowRight size={18} color="var(--primary)" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {regStep === 2 && (
              <div>
                <div className="glass-morph" style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '10px', 
                  border: '1px solid var(--border-main)', 
                  borderRadius: '12px', padding: '8px 16px', marginBottom: '32px', 
                  fontSize: '13px', fontWeight: '800', color: 'var(--primary)'
                }}>
                  {accountType === 'artist' ? <User size={16} /> : <Building2 size={16} />}
                  Perfil: {accountType === 'artist' ? 'Individual' : 'Agencia'}
                  <button onClick={() => setRegStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', marginLeft: '8px' }}><X size={16} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                    <label style={labelStyle}>{accountType === 'artist' ? 'Nombre Público' : 'Razón Social'}</label>
                    <div style={inputWrapper}>
                      <User size={18} color="var(--primary)" />
                      <input type="text" placeholder="Tu nombre o empresa" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                    <label style={labelStyle}>Email</label>
                    <div style={inputWrapper}>
                      <Mail size={18} color="var(--primary)" />
                      <input type="email" placeholder="hola@vidalis.ai" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '32px', textAlign: 'left' }}>
                    <label style={labelStyle}>Contraseña</label>
                    <div style={inputWrapper}>
                      <Lock size={18} color="var(--primary)" />
                      <input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: '54px', fontSize: '16px', fontWeight: '900' }}>
                    {loading ? 'Creando identidad...' : 'Confirmar Registro'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-main)', paddingTop: '24px' }}>
          <a href="/" style={{ color: 'var(--text-dim)', fontSize: '14px', textDecoration: 'none', fontWeight: '700', transition: 'color 0.3s ease' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = 'var(--text-dim)'}>
            ← Retornar al Portal Principal
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .card-pro { padding: 32px 20px !important; margin: 0; width: 100%; max-width: 100%; border-radius: 12px; }
        }
      `}</style>
    </div>
  );
};

export default Login;
