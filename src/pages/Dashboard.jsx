import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Sparkles, Upload, Film, BarChart3, Building2, User } from 'lucide-react';
import UploadSection from '../components/UploadSection';
import VideoGallery from '../components/VideoGallery';
import SocialConnect from '../components/SocialConnect';
import ArtistManager from '../components/ArtistManager';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total: '—', avgScore: '—', published: '—' });
  // Para agencias: artista actualmente seleccionado
  const [activeArtist, setActiveArtist] = useState(null);
  const [galleryKey, setGalleryKey] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('vidalis_user');
    if (!saved) { navigate('/login'); return; }
    const parsedUser = JSON.parse(saved);
    setUser(parsedUser);

    // Para artistas solos el artist_id ya viene en la sesión
    if (parsedUser.account_type === 'artist' && parsedUser.artist_id) {
      setActiveArtist({ id: parsedUser.artist_id, name: parsedUser.name });
    }

    if (parsedUser.id) {
      fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/stats/${parsedUser.id}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) setStats({ total: data.total ?? '—', avgScore: data.avgScore ?? '—', published: data.published ?? '—' });
        })
        .catch(() => {});
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('vidalis_user');
    navigate('/');
  };

  if (!user) return null;

  const isAgency = user.account_type === 'agency';
  // El artistId activo para las secciones de contenido
  const currentArtistId = activeArtist?.id || null;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="glass-card" style={{ margin: '20px', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '20px', zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={24} color="var(--primary)" />
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
            VIDALIS<span style={{ color: 'var(--primary)' }}>.AI</span>
          </span>
          <span style={{ background: 'rgba(155,81,224,0.15)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginLeft: '10px' }}>
            {isAgency ? 'Agencia' : 'Artista'}
          </span>
          {/* Artista activo en agencias */}
          {isAgency && activeArtist && (
            <span style={{ background: 'rgba(255,255,255,0.06)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <User size={12} />
              {activeArtist.name}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Hola, <strong style={{ color: 'white' }}>{user.name || user.agency || user.email}</strong>
          </span>
          <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '8px 16px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <LogOut size={16} /> Salir
          </button>
        </div>
      </nav>

      {/* Stats */}
      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {[
          { icon: <Film size={24} />, label: 'Videos Subidos', value: stats.total, color: '#9b51e0' },
          { icon: <BarChart3 size={24} />, label: 'Viral Score Promedio', value: stats.avgScore !== '—' ? `${stats.avgScore}/10` : '—', color: '#6366f1' },
          { icon: <Upload size={24} />, label: 'Publicaciones', value: stats.published, color: '#10b981' },
          { icon: <Building2 size={24} />, label: 'Plan Actual', value: user.plan || 'Pro', color: '#f59e0b' }
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ color: stat.color, marginBottom: '12px' }}>{stat.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>{stat.value}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Contenido principal */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px' }}>

        {/* MODO AGENCIA: primero gestionar artistas */}
        {isAgency && (
          <ArtistManager
            agencyId={user.id}
            selectedArtistId={currentArtistId}
            onSelectArtist={setActiveArtist}
          />
        )}

        {/* Secciones de contenido — solo visibles si hay un artista activo */}
        {currentArtistId ? (
          <>
            <SocialConnect artistId={currentArtistId} />
            <UploadSection artistId={currentArtistId} onUploadSuccess={() => setGalleryKey(k => k + 1)} />
            <VideoGallery artistId={currentArtistId} refreshKey={galleryKey} />
          </>
        ) : isAgency ? (
          <div className="glass-card" style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Selecciona o crea un artista arriba para gestionar su contenido.
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Dashboard;
