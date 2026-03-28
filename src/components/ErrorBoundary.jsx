import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Critical Render Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#000',
          color: '#FFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          textAlign: 'center',
          fontFamily: 'Outfit, system-ui, sans-serif'
        }}>
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid #ef4444', 
            padding: '48px', 
            borderRadius: '12px',
            maxWidth: '600px',
            width: '100%'
          }}>
            <AlertTriangle size={64} color="#ef4444" style={{ marginBottom: '24px' }} />
            <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.02em' }}>
              INTERRUPCIÓN EN EL FLUJO VITAL
            </h1>
            <p style={{ color: '#999', fontSize: '16px', marginBottom: '32px', lineHeight: '1.6' }}>
              Se ha detectado una anomalía en el renderizado. Esto puede deberse a datos incompletos o un error de conexión con la infraestructura.
            </p>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  background: '#FFF', color: '#000', border: 'none', padding: '14px 28px',
                  borderRadius: '8px', fontWeight: '800', fontSize: '12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <RefreshCcw size={16} /> REINTENTAR CARGA
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                style={{
                  background: 'transparent', color: '#FFF', border: '1px solid #333', padding: '14px 28px',
                  borderRadius: '8px', fontWeight: '800', fontSize: '12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <Home size={16} /> VOLVER AL INICIO
              </button>
            </div>

            {this.state.error && (
              <div style={{ 
                marginTop: '40px', 
                padding: '16px', 
                background: '#0a0a0a', 
                border: '1px solid #111', 
                borderRadius: '4px',
                textAlign: 'left'
              }}>
                <p style={{ fontSize: '10px', color: '#444', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase' }}>Detalle Técnico para Soporte:</p>
                <code style={{ fontSize: '11px', color: '#ef4444', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  {this.state.error.toString()}
                </code>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
