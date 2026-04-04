import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Sparkles, Upload, Film, BarChart3, Building2, User, ChevronRight, Trash2, Calendar, Users, Loader2 } from 'lucide-react';
import AnalyticsView from '../components/AnalyticsView';
import OnboardingWizard from '../components/OnboardingWizard';
import UploadSection from '../components/UploadSection';
import VideoGallery from '../components/VideoGallery';
import SocialConnect from '../components/SocialConnect';
import ArtistManager from '../components/ArtistManager';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeArtist, setActiveArtist] = useState(null);
  const [activeView, setActiveView] = useState('analytics');
  const [availableArtists, setAvailableArtists] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [galleryKey, setGalleryKey] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🚀 Dashboard initializing...");
    try {
      const saved = localStorage.getItem('vidalis_user');
      if (!saved) { 
        console.warn("⚠️ No session found, redirecting to login.");
        navigate('/login'); 
        return; 
      }
      
      const parsedUser = JSON.parse(saved);
      console.log("👤 User loaded:", parsedUser.email, "| Type:", parsedUser.account_type);
      setUser(parsedUser);
      
      // Onboarding check
      if (!parsedUser.onboarding_completed) {
        setShowOnboarding(true);
      }

      // Logic for Agency vs Artist
      if (parsedUser.account_type === 'agency') {
        fetchAvailableArtists(parsedUser.id);
      } else if (parsedUser.account_type === 'artist' && parsedUser.artist_id) {
        // Individual artist: auto-select their own profile
        console.log("🎨 Auto-selecting artist profile:", parsedUser.name);
        setActiveArtist({ id: parsedUser.artist_id, name: parsedUser.name });
      }

    } catch (err) {
      console.error("❌ Error loading dashboard session:", err);
      // If session is corrupt, clear and login again
      localStorage.removeItem('vidalis_user');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchAvailableArtists = async (uid) => {
    console.log("🔍 Fetching artists for agency:", uid);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/artists/${uid}`);
      if (res.ok) {
        const data = await res.json();
        console.log("✅ Artists loaded:", data.length);
        setAvailableArtists(data);
        if (data.length > 0 && !activeArtist) {
          setActiveArtist(data[0]);
        }
      }
    } catch (err) {
      console.error('❌ Error fetching artists:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vidalis_user');
    navigate('/');
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    if (user) {
      const updatedUser = { ...user, onboarding_completed: true };
      setUser(updatedUser);
      localStorage.setItem('vidalis_user', JSON.stringify(updatedUser));
    }
  };

  const isAgency = user?.account_type === 'agency';
  const currentArtistId = activeArtist?.id || null;

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      {showOnboarding && (
        <OnboardingWizard 
          userId={user.id} 
          userType={user.account_type} 
          onComplete={handleOnboardingComplete} 
        />
      )}

      {/* Header Pro Premium */}
      <header className="main-header-pro glass-morph">
        <div className="header-brand">
          <div className="logo-box" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)' }}>
             <Sparkles size={18} color="white" />
          </div>
          <span className="accent-text" style={{ fontSize: '22px', fontWeight: '900', fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}>
            Vidalis
          </span>
        </div>

        <div className="header-actions">
          {isAgency && availableArtists.length > 0 && (
            <div className="brand-selector-wrapper">
              <select 
                className="brand-dropdown-pro glass-morph"
                value={activeArtist?.id || ''}
                onChange={(e) => setActiveArtist(availableArtists.find(a => a.id === e.target.value))}
                style={{ border: '1px solid var(--border-main)', color: 'var(--text-main)', padding: '10px 16px', borderRadius: '12px' }}
              >
                <option value="">Resumen Global</option>
                {availableArtists.map(a => <option key={a.id} value={a.id} style={{ background: 'var(--bg-secondary)', color: 'var(--text-main)' }}>{a.name}</option>)}
              </select>
            </div>
          )}

          <div className="user-profile-box hide-mobile glass-morph" style={{ border: '1px solid var(--border-main)', padding: '8px 16px', borderRadius: '12px' }}>
             <User size={14} color="var(--primary)" />
             <span className="user-email" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>{user.email}</span>
          </div>

          <button onClick={handleLogout} className="btn-exit-pro glass-morph" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444', height: '40px' }}>
            <LogOut size={14} /> <span className="hide-mobile">Salir</span>
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Sidebar Pro Premium */}
        <aside className="sidebar-pro hide-mobile glass-morph" style={{ background: 'transparent', borderRight: '1px solid var(--border-main)' }}>
          <div className="sidebar-section-label" style={{ padding: '0 24px 12px' }}>PLATAFORMA</div>
          <button className={activeView === 'analytics' ? 'active' : ''} onClick={() => setActiveView('analytics')}>
            <BarChart3 size={20} /> <span style={{ fontWeight: '600' }}>Analítica</span>
          </button>
          <button className={activeView === 'content' ? 'active' : ''} onClick={() => setActiveView('content')}>
            <Film size={20} /> <span style={{ fontWeight: '600' }}>Producción</span>
          </button>
          <button className={activeView === 'planning' ? 'active' : ''} onClick={() => setActiveView('planning')}>
            <Calendar size={20} /> <span style={{ fontWeight: '600' }}>Calendario</span>
          </button>
          
          {isAgency && (
            <>
              <div className="sidebar-section-label" style={{marginTop: '32px', padding: '0 24px 12px'}}>AGENCIA</div>
              <button className={activeView === 'artists' ? 'active' : ''} onClick={() => setActiveView('artists')}>
                <Users size={20} /> <span style={{ fontWeight: '600' }}>Mis Marcas</span>
              </button>
            </>
          )}
        </aside>

        {/* Main Content */}
        <main className="main-content-pro">
           <div className="view-header">
              <h1 className="view-title">
                {activeView === 'analytics' && 'Dashboard de Analítica'}
                {activeView === 'planning' && 'Planificación de Contenido'}
                {activeView === 'content' && 'Producción y Medios'}
                {activeView === 'artists' && 'Gestión de Marcas'}
              </h1>
              {activeArtist && <div className="active-artist-tag">Editando: {activeArtist.name}</div>}
           </div>

           {activeView === 'analytics' && <AnalyticsView userId={user.id} activeArtist={activeArtist} />}
           
           {activeView === 'planning' && (
             <div className="view-placeholder card-pro">
               <Calendar size={48} color="var(--border-main)" />
               <h3>Calendario de Publicaciones</h3>
               <p>Visualiza y organiza tus próximos lanzamientos de forma estratégica.</p>
               <button className="btn-primary" style={{marginTop: '20px'}}>Nueva Programación</button>
             </div>
           )}

           {activeView === 'content' && (
             <div className="view-content" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
               <section className="card-pro">
                 <h2 className="section-title">Nueva Publicación</h2>
                 <UploadSection artistId={currentArtistId} onUploadSuccess={() => setGalleryKey(k => k + 1)} />
               </section>

               {currentArtistId && (
                 <section className="card-pro">
                   <h2 className="section-title">Biblioteca de Medios</h2>
                   <VideoGallery artistId={currentArtistId} artistName={activeArtist?.name} refreshKey={galleryKey} activePlatforms={activeArtist?.active_platforms || []} />
                 </section>
               )}
             </div>
           )}

           {activeView === 'artists' && (
             <div className="view-artists">
               <ArtistManager
                 agencyId={user.id}
                 selectedArtistId={currentArtistId}
                 onSelectArtist={(artist) => {
                   setActiveArtist(artist);
                   setActiveView('analytics');
                 }}
               />
               {currentArtistId && (
                 <section className="card-pro" style={{ marginTop: '32px' }}>
                   <h2 className="section-title">Canales Conectados</h2>
                   <SocialConnect artistId={currentArtistId} artistName={activeArtist?.name} />
                 </section>
               )}
             </div>
           )}
        </main>

        {/* Mobile Nav Premium */}
        <nav className="mobile-nav glass-morph">
          <button className={activeView === 'analytics' ? 'active' : ''} onClick={() => setActiveView('analytics')}><BarChart3 size={22} /></button>
          <button className={activeView === 'content' ? 'active' : ''} onClick={() => setActiveView('content')}><Film size={22} /></button>
          <button className={activeView === 'planning' ? 'active' : ''} onClick={() => setActiveView('planning')}><Calendar size={22} /></button>
          {isAgency && <button className={activeView === 'artists' ? 'active' : ''} onClick={() => setActiveView('artists')}><Users size={22} /></button>}
        </nav>
      </div>

      <style>{`
        .dashboard-root { min-height: 100vh; background: var(--bg-primary); color: var(--text-main); }
        .dashboard-container { display: flex; min-height: calc(100vh - 80px); }
        
        .main-header-pro {
          height: 80px; padding: 0 40px; display: flex; justify-content: space-between; align-items: center;
          position: sticky; top: 0; z-index: 1000; border-bottom: 1px solid var(--border-main);
        }
        
        .sidebar-pro { width: 280px; padding: 40px 16px; display: flex; flex-direction: column; gap: 8px; }
        .sidebar-pro button {
          display: flex; align-items: center; gap: 16px; padding: 14px 24px; border-radius: 12px;
          border: none; background: transparent; color: var(--text-muted); cursor: pointer; font-size: 14px; text-align: left; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sidebar-pro button:hover { color: var(--text-main); background: rgba(255, 255, 255, 0.03); transform: translateX(4px); }
        .sidebar-pro button.active { background: var(--primary); color: white; box-shadow: var(--shadow-glow); }

        .main-content-pro { flex-grow: 1; padding: 48px; overflow-y: auto; max-width: 1600px; margin: 0 auto; width: 100%; }
        .view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px; border-bottom: 1px solid var(--border-main); padding-bottom: 24px; }
        .view-title { font-size: 32px; font-weight: 900; letter-spacing: -0.02em; font-family: var(--font-heading); background: linear-gradient(135deg, #FFF 0%, #A1A1AA 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .active-artist-tag { font-size: 12px; font-weight: 700; color: var(--primary); background: rgba(79, 70, 229, 0.1); padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border-main); text-transform: uppercase; letter-spacing: 0.05em; }

        .section-title { font-size: 16px; font-weight: 800; margin-bottom: 24px; color: var(--text-main); display: flex; align-items: center; gap: 12px; }
        .section-title::before { content: ''; width: 4px; height: 16px; background: var(--primary); border-radius: 2px; }

        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .main-header-pro { padding: 0 20px; height: 72px; }
          .main-content-pro { padding: 24px; padding-bottom: 120px; }
          .view-header { flex-direction: column; align-items: flex-start; gap: 12px; margin-bottom: 32px; }
          .view-title { font-size: 24px; }
          .mobile-nav { position: fixed; bottom: 20px; left: 20px; right: 20px; height: 70px; border-radius: 20px; display: flex; justify-content: space-around; align-items: center; z-index: 2000; border: 1px solid var(--border-active); box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
          .mobile-nav button { background: none; border: none; color: var(--text-dim); padding: 15px; transition: all 0.3s ease; }
          .mobile-nav button.active { color: var(--primary); transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
