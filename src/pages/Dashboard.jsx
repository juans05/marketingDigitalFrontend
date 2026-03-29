import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Sparkles, Upload, Film, BarChart3, Building2, User, ChevronRight, Trash2, Calendar, Users, Loader2 } from 'lucide-react';
import AnalyticsView from '../components/AnalyticsView';
import OnboardingWizard from '../components/OnboardingWizard';
import UploadSection from '../components/UploadSection';
import VideoGallery from '../components/VideoGallery';
import SocialConnect from '../components/SocialConnect';
import ArtistManager from '../components/ArtistManager';
import AIStatusIndicator from '../components/AIStatusIndicator';

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

      {/* Header Pro */}
      <header className="main-header-pro">
        <div className="header-brand">
          <div className="logo-box">
             <Sparkles size={18} color="white" />
          </div>
          <span className="brand-text">Vidalis<span className="dot">.ai</span></span>
        </div>

        <div className="header-actions">
          {currentArtistId && <AIStatusIndicator artistId={currentArtistId} />}
          {isAgency && availableArtists.length > 0 && (
            <div className="brand-selector-wrapper">
              <span className="selector-label hide-mobile">CANAL ACTIVO:</span>
              <select 
                className="brand-dropdown-pro"
                value={activeArtist?.id || ''}
                onChange={(e) => setActiveArtist(availableArtists.find(a => a.id === e.target.value))}
              >
                <option value="">Resumen Global</option>
                {availableArtists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          )}

          <div className="user-profile-box hide-mobile">
             <User size={14} color="var(--text-muted)" />
             <span className="user-email">{user.email}</span>
          </div>

          <button onClick={handleLogout} className="btn-exit-pro">
            <LogOut size={14} /> <span className="hide-mobile">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Sidebar Pro */}
        <aside className="sidebar-pro hide-mobile">
          <div className="sidebar-section-label">PRINCIPAL</div>
          <button className={activeView === 'analytics' ? 'active' : ''} onClick={() => setActiveView('analytics')}>
            <BarChart3 size={20} /> Analítica
          </button>
          <button className={activeView === 'planning' ? 'active' : ''} onClick={() => setActiveView('planning')}>
            <Calendar size={20} /> Calendario
          </button>
          <button className={activeView === 'content' ? 'active' : ''} onClick={() => setActiveView('content')}>
            <Film size={20} /> Contenido
          </button>
          
          {isAgency && (
            <>
              <div className="sidebar-section-label" style={{marginTop: '20px'}}>GESTIÓN</div>
              <button className={activeView === 'artists' ? 'active' : ''} onClick={() => setActiveView('artists')}>
                <Users size={20} /> Mis Marcas
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

        {/* Mobile Nav */}
        <nav className="mobile-nav">
          <button className={activeView === 'analytics' ? 'active' : ''} onClick={() => setActiveView('analytics')}><BarChart3 size={20} /></button>
          <button className={activeView === 'planning' ? 'active' : ''} onClick={() => setActiveView('planning')}><Calendar size={20} /></button>
          <button className={activeView === 'content' ? 'active' : ''} onClick={() => setActiveView('content')}><Film size={20} /></button>
          {isAgency && <button className={activeView === 'artists' ? 'active' : ''} onClick={() => setActiveView('artists')}><Users size={20} /></button>}
        </nav>
      </div>

      <style>{`
        .dashboard-root { min-height: 100vh; background: var(--bg-primary); color: var(--text-main); font-family: 'Inter', sans-serif; }
        .dashboard-container { display: flex; min-height: calc(100vh - 70px); }
        
        .main-header-pro {
          height: 70px; padding: 0 32px; display: flex; justify-content: space-between; align-items: center;
          background: #FFFFFF; border-bottom: 1px solid var(--border-main); position: sticky; top: 0; z-index: 1000;
        }
        .header-brand { display: flex; align-items: center; gap: 12px; }
        .logo-box { background: var(--primary); padding: 6px; border-radius: 8px; display: flex; }
        .brand-text { font-size: 20px; font-weight: 800; color: var(--text-main); font-family: 'Outfit'; }
        .dot { color: var(--primary); }

        .header-actions { display: flex; align-items: center; gap: 20px; }
        .selector-label { font-size: 11px; font-weight: 700; color: var(--text-muted); }
        .brand-dropdown-pro { background: #F3F4F6; color: var(--text-main); border: 1px solid var(--border-main); padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; outline: none; transition: all 0.2s; }
        .brand-dropdown-pro:hover { border-color: var(--primary); background: #FFF; }

        .user-profile-box { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border-main); }
        .user-email { font-size: 13px; font-weight: 500; color: var(--text-muted); }
        .btn-exit-pro { background: #FEF2F2; color: #DC2626; border: 1px solid #FEE2E2; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .btn-exit-pro:hover { background: #FEE2E2; }

        .sidebar-pro { width: 260px; background: #FFFFFF; border-right: 1px solid var(--border-main); padding: 32px 16px; display: flex; flex-direction: column; gap: 4px; }
        .sidebar-section-label { font-size: 11px; font-weight: 700; color: var(--text-muted); padding: 0 16px 8px; letter-spacing: 0.05em; }
        .sidebar-pro button {
          display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px;
          border: none; background: transparent; color: var(--text-muted); cursor: pointer; font-size: 14px; font-weight: 500; text-align: left; transition: all 0.2s;
        }
        .sidebar-pro button:hover { color: var(--primary); background: #F9FAFB; }
        .sidebar-pro button.active { background: #EEF2FF; color: var(--primary); font-weight: 700; }

        .main-content-pro { flex-grow: 1; padding: 32px 40px; overflow-y: auto; max-width: 1400px; margin: 0 auto; width: 100%; }
        .view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .view-title { font-size: 24px; font-weight: 800; color: var(--text-main); font-family: 'Outfit'; }
        .active-artist-tag { font-size: 12px; font-weight: 600; color: var(--primary); background: #EEF2FF; padding: 4px 12px; border-radius: 20px; border: 1px solid #C7D2FE; }

        .section-title { font-size: 14px; font-weight: 700; margin-bottom: 20px; color: var(--text-main); border-left: 3px solid var(--primary); padding-left: 12px; }

        .view-placeholder { padding: 80px 40px; text-align: center; display: flex; flex-direction: column; align-items: center; }
        .view-placeholder h3 { color: var(--text-main); font-size: 18px; margin: 20px 0 10px; }
        .view-placeholder p { color: var(--text-muted); font-size: 14px; max-width: 400px; line-height: 1.6; }

        .mobile-nav { display: none; }

        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .main-header-pro { padding: 0 20px; }
          .main-content-pro { padding: 20px; padding-bottom: 100px; }
          .view-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .active-artist-tag { align-self: flex-start; font-size: 11px; padding: 4px 10px; }
          .mobile-nav { position: fixed; bottom: 0; left: 0; right: 0; height: 75px; background: #FFF; border-top: 1px solid var(--border-main); display: flex; justify-content: space-around; align-items: center; z-index: 2000; box-shadow: 0 -4px 10px rgba(0,0,0,0.05); }
          .mobile-nav button { background: none; border: none; color: var(--text-muted); padding: 15px; }
          .mobile-nav button.active { color: var(--primary); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
