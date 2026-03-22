import React from 'react';
import { Check, Star } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Pro',
      price: '$29',
      features: ['10 Videos / mes', 'Análisis Gemini 1.5', 'Posteo en TikTok/IG', 'Soporte vía Email'],
      color: 'var(--text-muted)'
    },
    {
      name: 'Business',
      price: '$79',
      features: ['50 Videos / mes', 'Optimización Claude 3.5', 'Posteo en todas las redes', 'Viral Score Avanzado', 'Soporte 24/7'],
      color: 'var(--primary)',
      popular: true
    },
    {
      name: 'Agency',
      price: '$199',
      features: ['Videos Ilimitados', 'Creación de Empresas/Artistas', 'Marca Blanca Total', 'Facturación vía Stripe', 'Account Manager Dedicado'],
      color: 'var(--secondary)'
    }
  ];

  return (
    <section id="pricing" style={{ padding: '80px 20px', textAlign: 'center' }}>
      <h2 style={{ fontSize: '40px', marginBottom: '10px' }}>Planes de Crecimiento</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '50px' }}>Escala tu música al siguiente nivel.</p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '30px', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        {plans.map((plan, i) => (
          <div key={i} className="glass-card" style={{ 
            padding: '40px', 
            textAlign: 'left', 
            position: 'relative',
            border: plan.popular ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
            transform: plan.popular ? 'scale(1.05)' : 'scale(1)'
          }}>
            {plan.popular && (
              <div style={{ 
                position: 'absolute', 
                top: '-15px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                background: 'var(--primary)', 
                padding: '5px 15px', 
                borderRadius: '20px', 
                fontSize: '12px', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Star size={12} fill="white" /> MÁS RECOMENDADO
              </div>
            )}
            <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>{plan.name}</h3>
            <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '30px' }}>
              {plan.price}<span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>/mes</span>
            </div>
            
            <ul style={{ listStyle: 'none', marginBottom: '40px' }}>
              {plan.features.map((f, j) => (
                <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: 'var(--text-main)', opacity: 0.9 }}>
                  <Check size={18} color={plan.color} /> {f}
                </li>
              ))}
            </ul>
            
            <button className={plan.popular ? "btn-primary" : "glass-card"} style={{ width: '100%', padding: '15px', color: 'white' }}>
              Seleccionar Plan
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;
