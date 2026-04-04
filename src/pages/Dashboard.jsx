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
import PlanningView from '../components/PlanningView';

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

      // Comprobación inicial de onboarding
      let needsOnboarding = !parsedUser.onboarding_completed;

      // Logic for Agency vs Artist
      if (parsedUser.account_type === 'agency') {
        fetchAvailableArtists(parsedUser.id);
      } else if (parsedUser.account_type === 'artist' && parsedUser.artist_id) {
        // Individual artist: auto-select their own profile
        console.log("🎨 Auto-selecting artist profile:", parsedUser.name);
        setActiveArtist({ id: parsedUser.artist_id, name: parsedUser.name });
        needsOnboarding = false; // ¡El artista ya está creado! Bypasear onboarding forzosamente
      }

      setShowOnboarding(needsOnboarding);

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
        if (data.length > 0) {
          if (!activeArtist) {
            setActiveArtist(data[0]);
            setActiveView('artists'); // Mostrar su dashboard de clientes primero
          }
          setShowOnboarding(false);
        } else {
          setActiveView('artists'); // Si no tiene, que los cree
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
          {currentArtistId && <AIStatusIndicator artistId={currentArtistId} />}
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

          <div className="user-profile-box hide-mobile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={12} color="var(--primary)" />
              <span className="user-email" style={{ fontWeight: '700' }}>{user.email}</span>
            </div>
            <span style={{ fontSize: '9px', fontWeight: '900', color: 'var(--primary)', background: '#EEF2FF', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
              PLAN {user.plan || 'FREE'}
            </span>
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
          {((user.plan !== 'Free' && user.plan !== 'Creator') || import.meta.env.VITE_BYPASS_PLAN_LIMITS === 'true') && (
            <button className={activeView === 'planning' ? 'active' : ''} onClick={() => setActiveView('planning')}>
              <Calendar size={20} /> Calendario
            </button>
          )}
          <button className={activeView === 'content' ? 'active' : ''} onClick={() => setActiveView('content')}>
            <Film size={20} /> Contenido
          </button>

          {isAgency && (
            <>
              <div className="sidebar-section-label" style={{ marginTop: '32px', padding: '0 24px 12px' }}>AGENCIA</div>
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
            <div className="view-planning" style={{ width: '100%' }}>
              <PlanningView artistId={currentArtistId} activeArtist={activeArtist} onNavigateToContent={() => setActiveView('content')} />
            </div>
          )}

          {activeView === 'content' && (
            <div className="view-content" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <section style={{ marginBottom: '40px' }}>
                <h2 className="section-title">Nueva Publicación</h2>
                <UploadSection artistId={currentArtistId} onUploadSuccess={() => setGalleryKey(k => k + 1)} />
              </section>

              {currentArtistId && (
                <section>
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
          height: 70px; padding: 0 32px; display: flex; justify-content: space-between; align-items: center;
          background: #FFFFFF; border-bottom: 1px solid var(--border-main); position: sticky; top: 0; z-index: 1000;
        }
        .header-brand { display: flex; align-items: center; gap: 12px; }
        .logo-box { background: var(--primary); padding: 6px; border-radius: 8px; display: flex; box-shadow: 0 4px 10px rgba(44, 51, 216, 0.2); }
        .brand-text { font-size: 20px; font-weight: 800; color: var(--text-main); font-family: 'Outfit'; }
        .dot { color: var(--primary); }

        .header-actions { display: flex; align-items: center; gap: 12px; }
        .brand-dropdown-pro { background: #F3F4F6; color: var(--text-main); border: 1px solid var(--border-main); padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; outline: none; transition: all 0.2s; max-width: 200px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }
        .brand-dropdown-pro:hover { border-color: var(--primary); background: #FFF; }

        .user-profile-box { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border-main); }
        .user-email { font-size: 13px; font-weight: 500; color: var(--text-muted); }
        .btn-exit-pro { background: #FEF2F2; color: #DC2626; border: 1px solid #FEE2E2; padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .btn-exit-pro:hover { background: #FEE2E2; }

        .sidebar-pro { width: 260px; background: #FFFFFF; border-right: 1px solid var(--border-main); padding: 32px 16px; display: flex; flex-direction: column; gap: 4px; }
        .sidebar-section-label { font-size: 11px; font-weight: 700; color: var(--text-muted); padding: 0 16px 8px; letter-spacing: 0.05em; }
        .sidebar-pro button {
          display: flex; align-items: center; gap: 16px; padding: 14px 24px; border-radius: 12px;
          border: none; background: transparent; color: var(--text-muted); cursor: pointer; font-size: 14px; text-align: left; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sidebar-pro button:hover { color: var(--text-main); background: rgba(255, 255, 255, 0.03); transform: translateX(4px); }
        .sidebar-pro button.active { background: var(--primary); color: white; box-shadow: var(--shadow-glow); }

        .main-content-pro { flex-grow: 1; padding: 32px 40px; overflow-y: auto; max-width: 1400px; margin: 0 auto; width: 100%; min-width: 0; }
        .view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
        .view-title { font-size: 24px; font-weight: 800; color: var(--text-main); font-family: 'Outfit'; }
        .active-artist-tag { font-size: 12px; font-weight: 600; color: var(--primary); background: #EEF2FF; padding: 4px 12px; border-radius: 20px; border: 1px solid #C7D2FE; }

        .section-title { font-size: 16px; font-weight: 800; margin-bottom: 24px; color: var(--text-main); display: flex; align-items: center; gap: 12px; }
        .section-title::before { content: ''; width: 4px; height: 16px; background: var(--primary); border-radius: 2px; }

        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .brand-text { display: none !important; } /* Ocultar texto Vidalis.ai para liberar espacio */
          .main-header-pro { padding: 0 16px; border-bottom: none; background: transparent; }
          .header-actions { gap: 8px; }
          .brand-dropdown-pro { font-size: 12px; padding: 6px 10px; max-width: 140px; margin-left: auto; }
          .btn-exit-pro { padding: 8px; }
          .main-content-pro { padding: 20px; padding-bottom: 100px; }
          .view-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .active-artist-tag { align-self: flex-start; font-size: 11px; padding: 4px 10px; }
          .mobile-nav { 
            position: fixed; bottom: 0; left: 0; width: 100%; 
            height: calc(75px + env(safe-area-inset-bottom)); 
            padding-bottom: env(safe-area-inset-bottom);
            background: #FFFFFF; border-top: 1px solid var(--border-main); 
            display: flex; justify-content: space-between; align-items: center; 
            z-index: 2000; box-shadow: 0 -4px 20px rgba(0,0,0,0.08); 
            padding: 0 24px; box-sizing: border-box;
          }
          .mobile-nav button { 
             background: transparent; border: none; color: #9CA3AF; 
             padding: 12px 20px; border-radius: 16px; 
             display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
             transition: all 0.2s ease; cursor: pointer;
          }
          .mobile-nav button.active { 
             color: var(--primary); background: #EEF2FF; transform: translateY(-2px);
          }
          .mobile-nav button:hover { background: #F9FAFB; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
