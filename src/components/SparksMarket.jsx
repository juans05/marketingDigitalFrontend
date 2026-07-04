import { useState, useEffect } from 'react';
import { Zap, ShieldCheck, Rocket, Diamond, ArrowRight, TrendingUp, Sparkles, Calendar, BarChart3, Lightbulb, Send, Loader2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const getToken = () => { const u = localStorage.getItem('vidalis_user'); return u ? JSON.parse(u).token : ''; };

const SPARK_ACTIONS = [
  { action: 'Publicar contenido', cost: 10, icon: Send, desc: 'Programar y publicar en redes sociales' },
  { action: 'Generar ideas IA', cost: 5, icon: Lightbulb, desc: 'Generar 5 ideas personalizadas con IA' },
  { action: 'Análisis y sync', cost: 0, icon: BarChart3, desc: 'Sincronizar métricas y analytics' },
  { action: 'Calendario', cost: 0, icon: Calendar, desc: 'Planificar y ver tu calendario' },
  { action: 'Growth History', cost: 0, icon: TrendingUp, desc: 'Ver historial de crecimiento' },
];

const SparksMarket = ({ user }) => {
  const whatsappNumber = "51902191948";
  const [balance, setBalance] = useState(user?.sparks_balance ?? 0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch(`${API}/api/vidalis/me`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
        if (res.ok) {
          const data = await res.json();
          setBalance(data.sparks_balance ?? user?.sparks_balance ?? 0);
        }
      } catch (e) { console.error(e); }
      setLoadingBalance(false);
    };
    fetchBalance();
  }, []);

  const handleBuy = (pack, sparks) => {
    const message = `Hola! Soy ${user?.email || 'un usuario'} y quiero recargar el ${pack} de ${sparks} Sparks en Vidalis.`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const pricingCards = [
    {
      id: 'starter',
      name: 'Starter',
      sparks: 100,
      price: '$5',
      priceDetail: '$0.05 por Spark',
      icon: <Zap size={32} color="#00FBFF" />,
      features: [
        '10 publicaciones en redes',
        '20 generaciones de ideas IA',
        'Analytics y sync ilimitado',
        'Calendario ilimitado',
      ],
      color: '#00FBFF',
      popular: false
    },
    {
      id: 'growth',
      name: 'Growth',
      sparks: 500,
      price: '$20',
      priceDetail: '$0.04 por Spark',
      icon: <Rocket size={32} color="#A855F7" />,
      features: [
        '50 publicaciones en redes',
        '100 generaciones de ideas IA',
        'Analytics y sync ilimitado',
        'Calendario ilimitado',
      ],
      color: '#A855F7',
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro Max',
      sparks: 1500,
      price: '$50',
      priceDetail: '$0.03 por Spark',
      icon: <Diamond size={32} color="#F59E0B" />,
      features: [
        '150 publicaciones en redes',
        '300 generaciones de ideas IA',
        'Analytics y sync ilimitado',
        'Calendario ilimitado',
      ],
      color: '#F59E0B',
      popular: false
    }
  ];

  const postsRemaining = Math.floor(balance / 10);
  const ideasRemaining = Math.floor(balance / 5);

  return (
    <div className="sparks-market-view" style={{ paddingBottom: '40px' }}>
      {/* SALDO ACTUAL */}
      <div className="sparks-balance-card" style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #A855F7 100%)',
        borderRadius: '24px', padding: '32px 40px', marginBottom: '32px',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px',
        boxShadow: '0 20px 50px rgba(79,70,229,0.3)',
      }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: '800', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Tu Energía Disponible</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            {loadingBalance ? (
              <Loader2 size={32} color="#fff" className="animate-spin" />
            ) : (
              <span style={{ fontSize: '56px', fontWeight: '900', color: '#fff', lineHeight: 1 }}>{balance}</span>
            )}
            <span style={{ fontSize: '20px', fontWeight: '700', color: 'rgba(255,255,255,0.7)' }}>Sparks ⚡</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '14px', padding: '14px 20px', textAlign: 'center', minWidth: '100px' }}>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>{postsRemaining}</div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>Publicaciones</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '14px', padding: '14px 20px', textAlign: 'center', minWidth: '100px' }}>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>{ideasRemaining}</div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>Ideas IA</div>
          </div>
        </div>
      </div>

      {/* TABLA DE COSTOS */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#FAFAFA', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--primary)" /> ¿Cuánto cuesta cada acción?
        </h3>
        <div className="sparks-cost-table" style={{
          background: '#1C1C1F', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden'
        }}>
          {SPARK_ACTIONS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px',
                borderBottom: i < SPARK_ACTIONS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color="var(--primary)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#FAFAFA' }}>{item.action}</p>
                  <p style={{ fontSize: '11px', color: '#71717A' }}>{item.desc}</p>
                </div>
                <div style={{
                  fontSize: '14px', fontWeight: '900',
                  color: item.cost > 0 ? '#F59E0B' : '#10B981',
                  background: item.cost > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                  padding: '6px 14px', borderRadius: '8px', whiteSpace: 'nowrap'
                }}>
                  {item.cost > 0 ? `${item.cost} ⚡` : 'Gratis'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HERO */}
      <div className="market-hero" style={{
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
        borderRadius: '24px', padding: '40px', marginBottom: '40px',
        border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center'
      }}>
        <span style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Centro de Energía Vidalis</span>
        <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF', marginBottom: '16px' }}>Recarga tus <span style={{ color: 'var(--primary)' }}>Sparks</span></h2>
        <p style={{ color: '#A1A1AA', maxWidth: '600px', margin: '0 auto', fontSize: '15px', marginBottom: '24px' }}>
          Los Sparks son la energía que usa Vidalis para publicar tu contenido y generar ideas con IA. Elige el pack que mejor se adapte a tu ritmo de creación.
        </p>
        <div style={{
          display: 'inline-flex', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
          padding: '10px 20px', borderRadius: '100px', alignItems: 'center', gap: '8px'
        }}>
          <ShieldCheck size={16} color="#10B981" />
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#10B981' }}>
            No caducan · Se acumulan · Compra única
          </span>
        </div>
      </div>

      {/* PACKS */}
      <div className="sparks-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {pricingCards.map((card) => (
          <div key={card.id} className={`price-card ${card.popular ? 'popular' : ''}`} style={{
            background: '#1C1C1F', borderRadius: '24px',
            border: card.popular ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
            padding: '40px 32px', display: 'flex', flexDirection: 'column', position: 'relative',
            transition: 'transform 0.3s ease'
          }}>
            {card.popular && (
              <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--primary)', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '4px 12px', borderRadius: '20px' }}>
                MÁS POPULAR
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>{card.icon}</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>{card.name}</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '36px', fontWeight: 900, color: card.color }}>{card.sparks}</span>
              <span style={{ color: '#71717A', fontWeight: 600 }}>SPARKS</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '22px', fontWeight: '900', color: '#FAFAFA' }}>{card.price}</span>
              <span style={{ fontSize: '12px', color: '#52525B', fontWeight: '600' }}>USD</span>
            </div>
            <p style={{ fontSize: '12px', color: '#71717A', marginBottom: '28px' }}>{card.priceDetail}</p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', flexGrow: 1 }}>
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
                background: card.popular ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : 'rgba(255,255,255,0.05)',
                color: '#FFFFFF',
                border: card.popular ? 'none' : '1px solid rgba(255,255,255,0.1)',
                padding: '16px', borderRadius: '12px', fontWeight: 800, fontSize: '14px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: card.popular ? '0 8px 24px rgba(79,70,229,0.3)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Recargar {card.sparks} ⚡ <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="sparks-faq" style={{
        marginTop: '48px', padding: '28px 32px', background: '#121214', borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexWrap: 'wrap',
        justifyContent: 'space-between', alignItems: 'center', gap: '20px'
      }}>
        <div className="sparks-faq-text" style={{ flex: 1, minWidth: '240px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
            ¿Necesitas un paquete personalizado?
          </h4>
          <p style={{ color: '#71717A', fontSize: '13px', lineHeight: '1.6' }}>
            Si publicas a gran volumen o gestionas múltiples marcas, podemos armar un plan a tu medida con precios especiales.
          </p>
        </div>
        <button
          onClick={() => window.open(`https://wa.me/${whatsappNumber}?text=Hola! Necesito un paquete personalizado de Sparks para Vidalis.`, '_blank')}
          style={{
            background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)',
            padding: '12px 24px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
          }}
        >
          Hablar con Ventas
        </button>
      </div>

      {/* MÉTODOS DE PAGO */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: '#52525B', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>Métodos de Pago Aceptados</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', opacity: 0.5 }}>
          {['YAPE', 'BIZUM', 'VISA', 'MASTER', 'PAYPAL'].map(m => (
            <span key={m} style={{ fontWeight: 900, fontSize: '14px', color: '#FAFAFA' }}>{m}</span>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sparks-balance-card { padding: 24px 20px !important; }
          .sparks-balance-card span[style*="56px"] { font-size: 40px !important; }
          .market-hero { padding: 24px 16px !important; }
          .market-hero h2 { font-size: 22px !important; }
          .market-hero p { font-size: 13px !important; }
          .sparks-grid { grid-template-columns: 1fr !important; }
          .sparks-faq { padding: 20px 16px !important; flex-direction: column !important; }
          .sparks-faq-text { min-width: unset !important; }
          .sparks-cost-table > div { padding: 12px 14px !important; }
        }
        @media (max-width: 480px) {
          .sparks-balance-card span[style*="56px"] { font-size: 32px !important; }
          .market-hero h2 { font-size: 18px !important; }
          .sparks-market-view .price-card { padding: 28px 20px !important; }
        }
      `}</style>
    </div>
  );
};

export default SparksMarket;
