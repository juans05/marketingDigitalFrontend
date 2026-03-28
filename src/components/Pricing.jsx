import React from 'react';
import { Check, Zap, Shield, Crown } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Creator',
      icon: <Zap size={24} color="var(--primary)" />,
      price: '$29',
      features: ['10 Videos / mes (4K Ready)', 'Análisis de Virilidad IA', 'Distribución Instantánea', 'Soporte Prioritario'],
      button: 'Empieza a Escalar',
      popular: false
    },
    {
      name: 'Business Elite',
      icon: <Shield size={24} color="var(--accent)" />,
      price: '$79',
      features: ['50 Videos / mes', 'Optimización Multi-Modelo', 'Estrategia de Retención IA', 'Métricas de Autoridad', 'Vidalis Prime Support'],
      popular: true,
      button: 'Domina el Mercado'
    },
    {
      name: 'Agency Pro',
      icon: <Crown size={24} color="#F59E0B" />,
      price: '$199',
      features: ['Videos Ilimitados', 'Multi-Perfil & Artistas', 'Marca Blanca (White Label)', 'API Access Premium', 'Dedicated Account Manager'],
      button: 'Infraestructura Total',
      popular: false
    }
  ];

  return (
    <section id="pricing" style={{ 
      padding: '100px 20px', 
      textAlign: 'center', 
      position: 'relative',
      background: '#FFFFFF',
      borderTop: '1px solid var(--border-main)'
    }}>
      <div style={{ marginBottom: '60px' }}>
        <h2 style={{ 
          fontSize: 'clamp(28px, 4vw, 42px)', 
          fontFamily: 'var(--font-heading)',
          fontWeight: '800',
          marginBottom: '16px',
          letterSpacing: '-0.02em',
          color: 'var(--text-main)'
        }}>
          Inversión en <span style={{ color: 'var(--primary)' }}>Resultados</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', fontWeight: '500' }}>
          Planes diseñados para proyectar autoridad y maximizar tu impacto digital.
        </p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '32px', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        {plans.map((plan, i) => (
          <div key={i} className="card-pro" style={{ 
            padding: '48px 40px', 
            textAlign: 'left', 
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            border: plan.popular ? '2px solid var(--primary)' : '1px solid var(--border-main)',
            boxShadow: plan.popular ? 'var(--shadow-lg)' : 'var(--shadow-md)',
            background: '#FFFFFF',
            borderRadius: '16px',
            transform: plan.popular ? 'scale(1.02)' : 'scale(1)',
            zIndex: plan.popular ? 2 : 1
          }}>
            {plan.popular && (
              <div style={{ 
                position: 'absolute', 
                top: '20px', 
                right: '20px', 
                background: 'var(--primary)', 
                color: '#FFFFFF',
                padding: '6px 14px', 
                borderRadius: '100px', 
                fontSize: '11px', 
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                MÁS SOLICITADO
              </div>
            )}
            
            <div style={{ marginBottom: '32px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: plan.popular ? '#EEF2FF' : '#F9FAFB',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                {plan.icon}
              </div>
              <h3 style={{ 
                fontSize: '22px', 
                fontFamily: 'var(--font-heading)',
                fontWeight: '800',
                marginBottom: '8px',
                color: 'var(--text-main)'
              }}>{plan.name}</h3>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: '800', 
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-main)',
                letterSpacing: '-0.02em'
              }}>
                {plan.price}<span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: '600', marginLeft: '4px' }}>/mes</span>
              </div>
            </div>
            
            <ul style={{ listStyle: 'none', marginBottom: '40px', flexGrow: 1 }}>
              {plan.features.map((f, j) => (
                <li key={j} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  marginBottom: '14px', 
                  color: 'var(--text-muted)',
                  fontSize: '15px',
                  fontWeight: '500'
                }}>
                  <div style={{ color: plan.popular ? 'var(--primary)' : 'var(--accent)' }}>
                    <Check size={18} strokeWidth={3} />
                  </div> 
                  {f}
                </li>
              ))}
            </ul>
            
            <button className={plan.popular ? "btn-primary" : "btn-secondary"} style={{ 
              width: '100%', 
              height: '56px',
              fontSize: '15px'
            }}>
              {plan.button}
            </button>
          </div>
        ))}
      </div>
      <style>{`
        .price-card { transition: all 0.3s ease; }
        .price-card:hover { transform: translateY(-4px); border-color: #666 !important; }
        @media (max-width: 768px) {
          .price-card { transform: none !important; margin-bottom: 20px; }
        }
      `}</style>
    </section>
  );
};

export default Pricing;
