import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Lightbulb, TrendingUp, Users, AlertCircle, Settings, X } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const getToken = () => { const u = localStorage.getItem('vidalis_user'); return u ? JSON.parse(u).token : ''; };
const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` });

const ICON_MAP = {
  milestone: TrendingUp, reminder: Bell, trend: TrendingUp, idea: Lightbulb, collab: Users, system: Settings
};

const NotificationsPanel = ({ artistId, isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && artistId) fetchNotifications();
  }, [isOpen, artistId]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/vidalis/notifications/${artistId}`, { headers: headers() });
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const markRead = async (id) => {
    try {
      await fetch(`${API}/api/vidalis/notifications/${id}/read`, { method: 'PATCH', headers: headers() });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) { console.error(e); }
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API}/api/vidalis/notifications/${artistId}/read-all`, { method: 'POST', headers: headers() });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) { console.error(e); }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!isOpen) return null;

  return (
    <div className="notif-panel">
      <div className="notif-header">
        <h3 style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: '#FAFAFA' }}>
          <Bell size={18} /> Notificaciones
          {unreadCount > 0 && <span style={{ background: '#4F46E5', color: '#fff', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px' }}>{unreadCount}</span>}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#818CF8', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCheck size={14} /> Marcar todo
            </button>
          )}
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', color: '#71717A' }}>
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="notif-body">
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Bell size={32} style={{ color: '#27272A', marginBottom: '12px' }} />
            <p style={{ color: '#52525B', fontSize: '13px' }}>Sin notificaciones</p>
          </div>
        ) : (
          notifications.map(n => {
            const Icon = ICON_MAP[n.type] || Bell;
            return (
              <div key={n.id} onClick={() => !n.is_read && markRead(n.id)} className={`notif-item ${n.is_read ? 'read' : 'unread'}`}>
                <div style={{ background: `${n.color || '#4F46E5'}15`, padding: '8px', borderRadius: '10px', display: 'flex' }}>
                  <Icon size={16} color={n.color || '#4F46E5'} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: n.is_read ? '#71717A' : '#FAFAFA', marginBottom: '2px' }}>{n.title}</p>
                  <p style={{ fontSize: '11px', color: '#52525B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</p>
                </div>
                <span style={{ fontSize: '10px', color: '#3F3F46', fontWeight: '600', whiteSpace: 'nowrap' }}>
                  {timeAgo(n.created_at)}
                </span>
              </div>
            );
          })
        )}
      </div>
      <style>{`
        .notif-panel {
          position: fixed; top: 0; right: 0; bottom: 0; width: 380px; max-width: 100vw;
          background: #111113; border-left: 1px solid rgba(255,255,255,0.08);
          z-index: 10000; display: flex; flex-direction: column;
          box-shadow: -10px 0 40px rgba(0,0,0,0.5);
          animation: notifSlide 0.2s ease;
        }
        @keyframes notifSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .notif-header {
          padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; justify-content: space-between; align-items: center;
        }
        .notif-body { flex: 1; overflow-y: auto; padding: 8px; }
        .notif-item {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 12px; border-radius: 12px; cursor: pointer;
          transition: background 0.2s; margin-bottom: 2px;
        }
        .notif-item.unread { background: rgba(79,70,229,0.05); }
        .notif-item:hover { background: rgba(255,255,255,0.04); }
        .notif-item.read { opacity: 0.6; }
        @media (max-width: 480px) {
          .notif-panel { width: 100vw; border-left: none; }
          .notif-header { padding: 16px 12px; }
          .notif-body { padding: 4px; }
          .notif-item { padding: 12px 8px; gap: 10px; }
        }
      `}</style>
    </div>
  );
};

function timeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default NotificationsPanel;
