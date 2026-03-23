import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Sparkles, Building2, User } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState(''); // 'agency' | 'artist'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, account_type: accountType })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Credenciales inválidas');

      localStorage.setItem('vidalis_user', JSON.stringify(data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Fondos animados */}
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,81,224,0.15), transparent 70%)', top: '-100px', right: '-100px', animation: 'pulse 4s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)', bottom: '-50px', left: '-50px', animation: 'pulse 5s ease-in-out infinite' }} />

      <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '50px 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ marginBottom: '35px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
            <Sparkles size={32} color="var(--primary)" />
            <span style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '1px' }}>
              VIDALIS<span style={{ color: 'var(--primary)' }}>.AI</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Accede a tu panel de contenido viral
          </p>
        </div>

        {/* Selector de tipo de cuenta */}
        {!accountType ? (
          <div>
            <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
              ¿Cómo quieres entrar?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '30px' }}>
              {/* Opción: Artista */}
              <button
                onClick={() => setAccountType('artist')}
                style={{
                  padding: '24px 16px',
                  borderRadius: '16px',
                  border: '1px solid rgba(155,81,224,0.3)',
                  background: 'rgba(155,81,224,0.08)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                  color: 'white'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(155,81,224,0.18)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(155,81,224,0.08)'}
              >
                <User size={32} color="var(--primary)" />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px' }}>Soy Artista</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Gestiono mis propias redes
                  </div>
                </div>
              </button>

              {/* Opción: Agencia */}
              <button
                onClick={() => setAccountType('agency')}
                style={{
                  padding: '24px 16px',
                  borderRadius: '16px',
                  border: '1px solid rgba(99,102,241,0.3)',
                  background: 'rgba(99,102,241,0.08)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                  color: 'white'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(99,102,241,0.18)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
              >
                <Building2 size={32} color="#6366f1" />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px' }}>Soy Agencia</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Gestiono varios artistas
                  </div>
                </div>
              </button>
            </div>

            <a href="/" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}>
              ← Volver al inicio
            </a>
          </div>
        ) : (
          /* Formulario de email/password */
          <div>
            {/* Indicador del tipo seleccionado */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: accountType === 'artist' ? 'rgba(155,81,224,0.12)' : 'rgba(99,102,241,0.12)',
              border: `1px solid ${accountType === 'artist' ? 'rgba(155,81,224,0.3)' : 'rgba(99,102,241,0.3)'}`,
              borderRadius: '20px', padding: '6px 14px', marginBottom: '28px',
              fontSize: '13px', fontWeight: '600',
              color: accountType === 'artist' ? 'var(--primary)' : '#818cf8'
            }}>
              {accountType === 'artist' ? <User size={14} /> : <Building2 size={14} />}
              {accountType === 'artist' ? 'Artista' : 'Agencia'}
              <button
                onClick={() => setAccountType('')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '0 0 0 4px' }}
              >×</button>
            </div>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px', display: 'block' }}>
                  Correo electrónico
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 16px' }}>
                  <Mail size={18} color="var(--text-muted)" />
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: '15px', width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '30px', textAlign: 'left' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px', display: 'block' }}>
                  Contraseña
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 16px' }}>
                  <Lock size={18} color="var(--text-muted)" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: '15px', width: '100%' }}
                  />
                </div>
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px', color: '#ef4444', fontSize: '13px', marginBottom: '20px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Verificando...' : <><LogIn size={20} /> Iniciar Sesión</>}
              </button>
            </form>

            <div style={{ marginTop: '20px' }}>
              <button onClick={() => setAccountType('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }}>
                ← Cambiar tipo de cuenta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
