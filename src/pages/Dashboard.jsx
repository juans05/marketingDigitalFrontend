import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Sparkles, Upload, Film, BarChart3, Building2 } from 'lucide-react';
import UploadSection from '../components/UploadSection';
import VideoGallery from '../components/VideoGallery';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total: '—', avgScore: '—', published: '—' });

  useEffect(() => {
    const savedUser = localStorage.getItem('vidalis_user');
    if (!savedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);

    // Cargar estadísticas reales
    if (parsedUser.id) {
      fetch(`http://localhost:3001/api/vidalis/stats/${parsedUser.id}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) setStats({
            total: data.total ?? '—',
            avgScore: data.avgScore ?? '—',
            published: data.published ?? '—'
          });
        })
        .catch(() => {});
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('vidalis_user');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navbar del Dashboard */}
      <nav className="glass-card" style={{
        margin: '20px',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: '20px',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={24} color="var(--primary)" />
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
            VIDALIS<span style={{ color: 'var(--primary)' }}>.AI</span>
          </span>
          <span style={{
            background: 'rgba(155,81,224,0.15)',
            color: 'var(--primary)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            marginLeft: '10px'
          }}>
            Dashboard
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Hola, <strong style={{ color: 'white' }}>{user.agency || user.email}</strong>
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '10px',
              padding: '8px 16px',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px'
            }}
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </nav>

      {/* Estadísticas rápidas */}
      <div style={{
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '0 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
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

      {/* Secciones principales */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px' }}>
        <UploadSection />
        <VideoGallery />
      </div>
    </div>
  );
};

export default Dashboard;
