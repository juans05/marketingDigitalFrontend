import React, { useEffect, useState } from 'react';

export default function SocialCallback() {
  const [status, setStatus] = useState('success');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) setStatus('error');

    // Intenta cerrar la pestaña automáticamente después de 3s
    const timer = setTimeout(() => {
      window.close();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const isError = status === 'error';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      padding: '24px',
    }}>
      <div style={{
        background: '#13131a',
        borderRadius: '20px',
        padding: '40px 32px',
        maxWidth: '360px',
        width: '100%',
        textAlign: 'center',
        border: `1px solid ${isError ? '#ff4444' : '#00e5ff33'}`,
      }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>
          {isError ? '❌' : '✅'}
        </div>
        <h2 style={{
          color: isError ? '#ff4444' : '#00e5ff',
          fontSize: '20px',
          fontWeight: '700',
          margin: '0 0 12px',
        }}>
          {isError ? 'Error al conectar' : '¡Cuenta conectada!'}
        </h2>
        <p style={{
          color: '#aaa',
          fontSize: '15px',
          lineHeight: '1.5',
          margin: '0 0 28px',
        }}>
          {isError
            ? 'Ocurrió un error al conectar tu cuenta. Vuelve a la app e inténtalo de nuevo.'
            : 'Tu red social fue conectada exitosamente. Vuelve a la app Vidalis y toca "Confirmar".'}
        </p>
        <div style={{
          background: isError ? '#ff444422' : '#00e5ff11',
          borderRadius: '12px',
          padding: '14px 16px',
          color: isError ? '#ff6666' : '#00e5ff',
          fontSize: '13px',
          fontWeight: '600',
        }}>
          {isError ? '← Volver a la app' : '← Regresa a la app Vidalis'}
        </div>
      </div>
    </div>
  );
}
