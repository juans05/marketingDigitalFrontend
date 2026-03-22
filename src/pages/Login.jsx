import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
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
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Credenciales inválidas');

      // Guardar sesión
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
      {/* Fondo animado */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(155,81,224,0.15), transparent 70%)',
        top: '-100px',
        right: '-100px',
        animation: 'pulse 4s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)',
        bottom: '-50px',
        left: '-50px',
        animation: 'pulse 5s ease-in-out infinite'
      }} />

      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '50px 40px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
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

        {/* Formulario */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px', display: 'block' }}>
              Correo electrónico
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '14px 16px'
            }}>
              <Mail size={18} color="var(--text-muted)" />
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: 'white',
                  fontSize: '15px',
                  width: '100%'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '30px', textAlign: 'left' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px', display: 'block' }}>
              Contraseña
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '14px 16px'
            }}>
              <Lock size={18} color="var(--text-muted)" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: 'white',
                  fontSize: '15px',
                  width: '100%'
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px',
              padding: '12px',
              color: '#ef4444',
              fontSize: '13px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Verificando...' : (
              <>
                <LogIn size={20} />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* Link de regreso */}
        <div style={{ marginTop: '25px' }}>
          <a
            href="/"
            style={{
              color: 'var(--text-muted)',
              fontSize: '13px',
              textDecoration: 'none'
            }}
          >
            ← Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
