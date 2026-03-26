import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Sparkles, Upload, Film, BarChart3, Building2, User, ChevronRight, Trash2 } from 'lucide-react';
import UploadSection from '../components/UploadSection';
import VideoGallery from '../components/VideoGallery';
import SocialConnect from '../components/SocialConnect';
import ArtistManager from '../components/ArtistManager';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total: '0', avgScore: '0', published: '0' });
  const [activeArtist, setActiveArtist] = useState(null);
  const [galleryKey, setGalleryKey] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('vidalis_user');
    if (!saved) { navigate('/login'); return; }
    const parsedUser = JSON.parse(saved);
    setUser(parsedUser);

    if (parsedUser.account_type === 'artist' && parsedUser.artist_id) {
      setActiveArtist({ id: parsedUser.artist_id, name: parsedUser.name });
    }

    if (parsedUser.id) {
      fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/stats/${parsedUser.id}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) setStats({ total: data.total ?? '0', avgScore: data.avgScore ?? '0', published: data.published ?? '0' });
        })
        .catch(() => {});
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('vidalis_user');
    navigate('/');
  };
  
  const handleDeleteArtist = async () => {
    if (!activeArtist) return;
    if (!window.confirm(`¿Estás seguro de que quieres eliminar a ${activeArtist.name} y TODOS sus videos?`)) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/artists/${activeArtist.id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar');
      
      setActiveArtist(null);
      // Forzar recarga de stats
      window.location.reload(); 
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user) return null;

  const isAgency = user.account_type === 'agency';
  const currentArtistId = activeArtist?.id || null;

  return (
    <div style={{ minHeight: '100vh', background: '#000000' }}>
      {/* Upper Navigation Bar */}
      <nav className="glass-panel" style={{ 
        margin: '10px 20px', 
        padding: '12px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        position: 'sticky', 
        top: '10px', 
        zIndex: 1000,
        borderRadius: '8px',
        border: '2px solid var(--border-glass)',
        background: '#050505'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            border: '1px solid #444', 
            padding: '6px', 
            borderRadius: '4px', 
            display: 'flex'
          }}>
            <svg width="20" height="19" viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0-3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="white"/>
            </svg>
          </div>
          <span style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: '18px', 
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            VIDALIS<span style={{ color: '#666' }}>.AI</span>
          </span>
          <div style={{ 
            background: '#111', 
            color: '#FFF', 
            padding: '4px 12px', 
            borderRadius: '4px', 
            fontSize: '10px', 
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            border: '1px solid #333'
          }}>
            {isAgency ? 'Agency Master' : 'Artist Elite'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hide-mobile">
            <User size={14} color="#9CA3AF" />
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#FFF' }}>{user.name || user.email}</span>
          </div>
          <button 
            onClick={handleLogout} 
            style={{ 
              background: '#000', 
              border: '1px solid #333', 
              borderRadius: '4px', 
              padding: '8px 20px', 
              color: '#FFF', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}
          >
            <LogOut size={14} /> Salir
          </button>
        </div>
      </nav>

      <main className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        {/* Breadcrumb */}
        <div style={{ 
          marginBottom: '32px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          color: '#6B7280',
          fontSize: '0.8rem',
          fontWeight: '600',
          textTransform: 'uppercase'
        }}>
          <span>Dashboard</span>
          <ChevronRight size={14} />
          {isAgency && (
            <>
              <span>Management</span>
              <ChevronRight size={14} />
              <span style={{ color: '#FFF' }}>
                {activeArtist ? activeArtist.name : 'Select Artist'}
              </span>
              {activeArtist && (
                <button 
                  onClick={handleDeleteArtist}
                  style={{
                    background: 'none', border: 'none', color: '#444', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', marginLeft: '8px', transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#444'}
                  title="Eliminar Artista"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </>
          )}
          {!isAgency && <span style={{ color: '#FFF' }}>Overview</span>}
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
          gap: '24px',
          marginBottom: '56px' 
        }}>
          {[
            { icon: <Film />, label: 'Contenido Total', value: stats.total },
            { icon: <BarChart3 />, label: 'Viral Score Promedio', value: `${stats.avgScore}/10` },
            { icon: <Upload />, label: 'Posteos Activos', value: stats.published },
            { icon: <Building2 />, label: 'Estatus del Plan', value: user.plan || 'Business Elite' }
          ].map((stat, i) => (
            <div key={i} className="glass-panel" style={{ 
              padding: '32px', 
              position: 'relative',
              background: '#0A0A0A',
              border: '2px solid var(--border-glass)',
              borderRadius: '4px'
            }}>
              <div style={{ 
                color: '#FFFFFF', 
                marginBottom: '16px',
                opacity: 0.8
              }}>{stat.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'var(--font-heading)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                {stat.value}
              </div>
              <div style={{ color: '#6B7280', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
          {isAgency && (
            <ArtistManager
              agencyId={user.id}
              selectedArtistId={currentArtistId}
              onSelectArtist={setActiveArtist}
            />
          )}

          {currentArtistId ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
              <section>
                <h2 className="section-title">Canales de Impacto</h2>
                <SocialConnect artistId={currentArtistId} artistName={activeArtist?.name} />
              </section>

              <section>
                <h2 className="section-title">Nueva Producción</h2>
                <UploadSection artistId={currentArtistId} onUploadSuccess={() => setGalleryKey(k => k + 1)} />
              </section>

              <section className="animate-fade-in" style={{ marginBottom: '80px' }}>
                <h2 className="section-title">Biblioteca de Contenido</h2>
                <VideoGallery artistId={currentArtistId} artistName={activeArtist?.name} refreshKey={galleryKey} />
              </section>
            </div>
          ) : isAgency ? (
            <div className="glass-panel" style={{ padding: '80px 40px', textAlign: 'center', border: '1px solid #1A1A1A' }}>
              <div style={{ color: '#666', marginBottom: '24px' }}>
                <User size={48} style={{ opacity: 0.2, marginBottom: '20px' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'white', marginBottom: '12px' }}>Aún no hay artista seleccionado</h3>
                <p>Selecciona un artista arriba para desbloquear el motor de Vidalis.AI</p>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <style>{`
        .section-title {
          font-family: var(--font-heading);
          text-transform: uppercase;
          font-size: 1rem;
          margin-bottom: 24px;
          letter-spacing: 0.05em;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #FFF;
        }
        .section-title::after {
          content: "";
          flex-grow: 1;
          height: 1px;
          background: #222;
        }
        @media (max-width: 768px) {
          .hide-mobile { display: none; }
          main { padding: 15px; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
