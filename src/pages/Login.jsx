import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, User, Building2, Sparkles, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  // mode: 'login' | 'register'
  const [mode, setMode]           = useState('login');
  // Registro paso 1 = elegir tipo, paso 2 = formulario
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

  const inputWrapper = { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 16px' };
  const inputStyle   = { background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: '15px', width: '100%' };
  const labelStyle   = { color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px', display: 'block' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,81,224,0.15), transparent 70%)', top: '-100px', right: '-100px', animation: 'pulse 4s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)', bottom: '-50px', left: '-50px', animation: 'pulse 5s ease-in-out infinite' }} />

      <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '50px 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
            <Sparkles size={30} color="var(--primary)" />
            <span style={{ fontSize: '26px', fontWeight: 'bold', letterSpacing: '1px' }}>
              VIDALIS<span style={{ color: 'var(--primary)' }}>.AI</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {mode === 'login' ? 'Accede a tu panel de contenido viral' : 'Crea tu cuenta y empieza a publicar'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', marginBottom: '28px' }}>
          {[
            { id: 'login',    label: 'Iniciar Sesión', icon: <LogIn size={15} /> },
            { id: 'register', label: 'Crear Cuenta',   icon: <UserPlus size={15} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => switchMode(tab.id)}
              style={{
                flex: 1, padding: '10px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: '600',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                background: mode === tab.id ? 'var(--primary)' : 'transparent',
                color: mode === tab.id ? 'white' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ─── LOGIN ─── */}
        {mode === 'login' && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px', textAlign: 'left' }}>
              <label style={labelStyle}>Correo electrónico</label>
              <div style={inputWrapper}>
                <Mail size={18} color="var(--text-muted)" />
                <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: '28px', textAlign: 'left' }}>
              <label style={labelStyle}>Contraseña</label>
              <div style={inputWrapper}>
                <Lock size={18} color="var(--text-muted)" />
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px', color: '#ef4444', fontSize: '13px', marginBottom: '18px' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '15px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Verificando...' : <><LogIn size={18} /> Iniciar Sesión</>}
            </button>

            <p style={{ marginTop: '22px', color: 'var(--text-muted)', fontSize: '13px' }}>
              ¿No tienes cuenta?{' '}
              <button type="button" onClick={() => switchMode('register')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', padding: 0 }}>
                Crear una aquí
              </button>
            </p>
          </form>
        )}

        {/* ─── REGISTRO ─── */}
        {mode === 'register' && (
          <>
            {/* Paso 1: tipo de cuenta */}
            {regStep === 1 && (
              <div>
                <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '18px' }}>¿Cómo vas a usar Vidalis?</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                  {[
                    { type: 'artist', icon: <User size={30} color="var(--primary)" />, title: 'Soy Artista', sub: 'Gestiono mis propias redes', borderColor: 'rgba(155,81,224,0.3)', bg: 'rgba(155,81,224,0.08)', bgHover: 'rgba(155,81,224,0.18)', arrowColor: 'var(--primary)' },
                    { type: 'agency', icon: <Building2 size={30} color="#6366f1" />,   title: 'Soy Agencia', sub: 'Gestiono varios artistas',  borderColor: 'rgba(99,102,241,0.3)',  bg: 'rgba(99,102,241,0.08)',  bgHover: 'rgba(99,102,241,0.18)',  arrowColor: '#6366f1' },
                  ].map(opt => (
                    <button
                      key={opt.type}
                      onClick={() => { setAccountType(opt.type); setRegStep(2); }}
                      style={{ padding: '22px 14px', borderRadius: '16px', border: `1px solid ${opt.borderColor}`, background: opt.bg, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: 'white', transition: 'all 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = opt.bgHover}
                      onMouseOut={e => e.currentTarget.style.background = opt.bg}
                    >
                      {opt.icon}
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '14px' }}>{opt.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{opt.sub}</div>
                      </div>
                      <ArrowRight size={14} color={opt.arrowColor} />
                    </button>
                  ))}
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  ¿Ya tienes cuenta?{' '}
                  <button type="button" onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', padding: 0 }}>
                    Inicia sesión
                  </button>
                </p>
              </div>
            )}

            {/* Paso 2: datos */}
            {regStep === 2 && (
              <div>
                {/* Badge tipo */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: accountType === 'artist' ? 'rgba(155,81,224,0.12)' : 'rgba(99,102,241,0.12)', border: `1px solid ${accountType === 'artist' ? 'rgba(155,81,224,0.3)' : 'rgba(99,102,241,0.3)'}`, borderRadius: '20px', padding: '5px 14px', marginBottom: '22px', fontSize: '12px', fontWeight: '600', color: accountType === 'artist' ? 'var(--primary)' : '#818cf8' }}>
                  {accountType === 'artist' ? <User size={13} /> : <Building2 size={13} />}
                  {accountType === 'artist' ? 'Artista' : 'Agencia'}
                  <button type="button" onClick={() => setRegStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '15px', lineHeight: 1, padding: '0 0 0 2px' }}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                    <label style={labelStyle}>{accountType === 'artist' ? 'Tu nombre artístico' : 'Nombre de la agencia'}</label>
                    <div style={inputWrapper}>
                      {accountType === 'artist' ? <User size={18} color="var(--text-muted)" /> : <Building2 size={18} color="var(--text-muted)" />}
                      <input type="text" placeholder={accountType === 'artist' ? 'Ej: Juan González' : 'Ej: Suizalab Agency'} value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                    <label style={labelStyle}>Correo electrónico</label>
                    <div style={inputWrapper}>
                      <Mail size={18} color="var(--text-muted)" />
                      <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '26px', textAlign: 'left' }}>
                    <label style={labelStyle}>Contraseña</label>
                    <div style={inputWrapper}>
                      <Lock size={18} color="var(--text-muted)" />
                      <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
                    </div>
                  </div>

                  {error && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px', color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '15px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Creando cuenta...' : <><UserPlus size={18} /> Crear Cuenta</>}
                  </button>

                  <p style={{ marginTop: '18px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    ¿Ya tienes cuenta?{' '}
                    <button type="button" onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', padding: 0 }}>
                      Inicia sesión
                    </button>
                  </p>
                </form>
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: '24px' }}>
          <a href="/" style={{ color: 'var(--text-muted)', fontSize: '12px', textDecoration: 'none' }}>← Volver al inicio</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
