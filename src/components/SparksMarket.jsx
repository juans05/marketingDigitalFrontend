import React from 'react';
import { Zap, ShieldCheck, Rocket, Diamond, HelpCircle, ArrowRight } from 'lucide-react';

const SparksMarket = ({ user }) => {
  const whatsappNumber = "51902191948";
  
  const handleBuy = (pack, sparks) => {
    const message = `Hola! Soy ${user?.email || 'un usuario'} y quiero recargar el ${pack} de ${sparks} Sparks en Vidalis.`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const pricingCards = [
    {
      id: 'individual',
      name: 'Pack Individual',
      sparks: 100,
      price: 'Plan Base',
      icon: <Zap className="text-cyan-400" size={32} />,
      features: ['10 Publicaciones Virales', 'Análisis IA Básico', 'Soporte vía WhatsApp', 'Válido de por vida'],
      color: '#00FBFF',
      popular: false
    },
    {
      id: 'viral',
      name: 'Plan Viral',
      sparks: 500,
      price: 'Crecimiento',
      icon: <Rocket className="text-purple-400" size={32} />,
      features: ['50 Publicaciones Estratégicas', 'Análisis Realtime', 'Sincronización Multi', 'Auditoría Gratis'],
      color: '#A855F7',
      popular: true
    },
    {
      id: 'elite',
      name: 'Elite Pro',
      sparks: 1500,
      price: 'Agencia',
      icon: <Diamond className="text-amber-400" size={32} />,
      features: ['150 Posts de Alto Valor', 'IA Predictiva', 'Gestión de 5 Marcas', 'Manager Dedicado'],
      color: '#F59E0B',
      popular: false
    }
  ];

  return (
    <div className="sparks-market-view" style={{ paddingBottom: '40px' }}>
      <div className="market-hero" style={{ 
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
        borderRadius: '24px',
        padding: '40px',
        marginBottom: '40px',
        border: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center'
      }}>
        <span style={{ 
          color: 'var(--primary)', 
          fontSize: '12px', 
          fontWeight: 900, 
          letterSpacing: '2px', 
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: '12px'
        }}>Centro de Energía Vidalis</span>
        <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF', marginBottom: '16px' }}>Potencia tu Contenido con <span style={{ color: 'var(--primary)' }}>Sparks</span></h2>
        <p style={{ color: '#A1A1AA', maxWidth: '600px', margin: '0 auto', fontSize: '15px' }}>
          Los Sparks son la unidad de energía que utiliza nuestra IA para procesar, programar y viralizar tus contenidos en todas las redes sociales.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px' 
      }}>
        {pricingCards.map((card) => (
          <div key={card.id} className={`price-card ${card.popular ? 'popular' : ''}`} style={{
            background: '#1C1C1F',
            borderRadius: '24px',
            border: card.popular ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
            padding: '40px 32px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            transition: 'transform 0.3s ease'
          }}>
            {card.popular && (
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 900,
                padding: '4px 12px',
                borderRadius: '20px'
              }}>RECOMENDADO</div>
            )}
            
            <div style={{ marginBottom: '24px' }}>{card.icon}</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>{card.name}</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '36px', fontWeight: 900, color: card.color }}>{card.sparks}</span>
              <span style={{ color: '#71717A', fontWeight: 600 }}>SPARKS</span>
            </div>
            <div style={{ color: '#A1A1AA', fontSize: '14px', marginBottom: '32px' }}>{card.price}</div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', flexGrow: 1 }}>
              {card.features.map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: '#D4D4D8', fontSize: '14px' }}>
                  <ShieldCheck size={16} color={card.color} />
                  {f}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleBuy(card.name, card.sparks)}
              style={{
                background: card.popular ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: '#FFFFFF',
                border: card.popular ? 'none' : '1px solid rgba(255,255,255,0.1)',
                padding: '16px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              Recargar Ahora <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '60px', 
        padding: '32px', 
        background: '#121214', 
        borderRadius: '20px', 
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px'
      }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={20} color="var(--primary)" /> ¿Necesitas una recarga personalizada?
          </h4>
          <p style={{ color: '#71717A', fontSize: '14px' }}>Contáctanos para planes de agencia superiores a 5000 Sparks con descuentos exclusivos.</p>
        </div>
        <button 
          onClick={() => window.open(`https://wa.me/${whatsappNumber}?text=Hola! Necesito un plan corporativo de Sparks`, '_blank')}
          style={{ 
            background: 'transparent', 
            color: 'var(--primary)', 
            border: '1px solid var(--primary)', 
            padding: '12px 24px', 
            borderRadius: '10px', 
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >Hablar con Ventas</button>
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
         <p style={{ fontSize: '11px', color: '#52525B', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>Métodos de Pago Soportados</p>
         <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', opacity: 0.5 }}>
            <span style={{ fontWeight: 900, fontSize: '14px' }}>YAPE</span>
            <span style={{ fontWeight: 900, fontSize: '14px' }}>BIZUM</span>
            <span style={{ fontWeight: 900, fontSize: '14px' }}>VISA</span>
            <span style={{ fontWeight: 900, fontSize: '14px' }}>MASTER</span>
            <span style={{ fontWeight: 900, fontSize: '14px' }}>PAYPAL</span>
         </div>
      </div>
    </div>
  );
};

export default SparksMarket;
