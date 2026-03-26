import React from 'react';
import { Check, Zap, Shield, Crown } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Creator',
      icon: <Zap size={24} color="white" />,
      price: '$29',
      features: ['10 Videos / mes (4K Ready)', 'Análisis de Virilidad IA', 'Distribución Instantánea', 'Soporte Prioritario'],
      color: 'white',
      button: 'Empieza a Escalar'
    },
    {
      name: 'Business Elite',
      icon: <Shield size={24} color="white" />,
      price: '$79',
      features: ['50 Videos / mes', 'Optimización Multi-Modelo', 'Estrategia de Retención IA', 'Métricas de Autoridad', 'Vidalis Prime Support'],
      color: 'white',
      popular: true,
      button: 'Domina el Mercado'
    },
    {
      name: 'Agency Pro',
      icon: <Crown size={24} color="white" />,
      price: '$199',
      features: ['Videos Ilimitados', 'Multi-Perfil & Artistas', 'Marca Blanca (White Label)', 'API Access Premium', 'Dedicated Account Manager'],
      color: 'white',
      button: 'Infraestructura Total'
    }
  ];

  return (
    <section id="pricing" style={{ padding: '100px 20px', textAlign: 'center', position: 'relative' }}>
      <div style={{ marginBottom: '60px' }}>
        <h2 style={{ 
          fontSize: 'clamp(28px, 4vw, 42px)', 
          fontFamily: 'var(--font-heading)',
          fontWeight: '700',
          marginBottom: '16px',
          letterSpacing: '-0.02em',
          color: '#FFFFFF'
        }}>
          Inversión en <span style={{ textDecoration: 'underline', textDecorationColor: '#333' }}>Resultados</span>
        </h2>
        <p style={{ color: '#9CA3AF', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Planes diseñados para proyectar autoridad y maximizar tu impacto digital.
        </p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '40px', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        {plans.map((plan, i) => (
          <div key={i} className="glass-panel price-card" style={{ 
            padding: '40px 32px', 
            textAlign: 'left', 
            display: 'flex',
            flexDirection: 'column',
            border: plan.popular ? '2px solid #FFFFFF' : '2px solid var(--border-glass)',
            zIndex: plan.popular ? 2 : 1,
            transform: plan.popular ? 'scale(1.01)' : 'scale(1)',
            background: plan.popular ? '#111' : '#050505',
            borderRadius: '4px'
          }}>
            {plan.popular && (
              <div style={{ 
                position: 'absolute', 
                top: '20px', 
                right: '20px', 
                background: '#FFFFFF', 
                color: '#000000',
                padding: '4px 12px', 
                borderRadius: '4px', 
                fontSize: '10px', 
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                MÁS SOLICITADO
              </div>
            )}
            
            <div style={{ marginBottom: '32px' }}>
              <div style={{ marginBottom: '16px' }}>{plan.icon}</div>
              <h3 style={{ 
                fontSize: '20px', 
                fontFamily: 'var(--font-heading)',
                fontWeight: '700',
                marginBottom: '8px',
                letterSpacing: '0.05em'
              }}>{plan.name}</h3>
              <div style={{ fontSize: '40px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
                {plan.price}<span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '400' }}>/mes</span>
              </div>
            </div>
            
            <ul style={{ listStyle: 'none', marginBottom: '48px', flexGrow: 1 }}>
              {plan.features.map((f, j) => (
                <li key={j} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  marginBottom: '16px', 
                  color: '#9CA3AF',
                  fontSize: '0.95rem'
                }}>
                  <div style={{ color: 'white' }}>
                    <Check size={16} strokeWidth={3} />
                  </div> 
                  {f}
                </li>
              ))}
            </ul>
            
            <button className="btn-action" style={{ 
              width: '100%', 
              padding: '16px', 
              color: plan.popular ? '#000' : '#FFF', 
              background: plan.popular ? '#FFF' : '#111',
              fontWeight: '700',
              border: '2px solid var(--border-glass)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
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
