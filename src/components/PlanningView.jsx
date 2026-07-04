import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Loader2, X, Play, Clock, CheckCircle, AlertCircle, Sparkles, Eye } from 'lucide-react';
import DirectScheduleModal from './DirectScheduleModal';

const STATUS_MAP = {
  published: { label: 'Publicado', color: '#10B981', icon: CheckCircle },
  scheduled: { label: 'Programado', color: '#4F46E5', icon: Clock },
  analyzing: { label: 'Analizando IA', color: '#F59E0B', icon: Sparkles },
  processing: { label: 'Procesando', color: '#F59E0B', icon: Loader2 },
  error: { label: 'Error', color: '#EF4444', icon: AlertCircle },
  draft: { label: 'Borrador', color: '#6B7280', icon: Eye },
};

const PlanningView = ({ artistId, activeArtist }) => {
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Day detail modal
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [dayDetailPosts, setDayDetailPosts] = useState([]);
  const [dayDetailDate, setDayDetailDate] = useState(null);
  const [dayDetailIsPast, setDayDetailIsPast] = useState(false);

  const fetchScheduled = async () => {
    if (!artistId) return;
    setLoading(true);
    try {
      const userStr = localStorage.getItem('vidalis_user');
      const token = userStr ? JSON.parse(userStr).token : '';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/gallery/${artistId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const videos = await res.json();
        const activePosts = videos.filter(v => v.scheduled_at || v.created_at);
        setScheduledPosts(activePosts);
      }
    } catch (e) {
      console.error('Error fetching calendar posts', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduled();
  }, [artistId]);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isDatePast = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const check = new Date(year, month, day);
    check.setHours(0, 0, 0, 0);
    return check < today;
  };

  const getPostsForDay = (day) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return scheduledPosts.filter(p => {
      const pDate = new Date(p.scheduled_at || p.created_at);
      const pStr = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}-${String(pDate.getDate()).padStart(2, '0')}`;
      return pStr === dayStr;
    });
  };

  const handleDayClick = (day) => {
    if (!day) return;
    const posts = getPostsForDay(day);
    const past = isDatePast(day);
    const clickedDate = new Date(year, month, day, 12, 0, 0);

    setDayDetailDate(clickedDate);
    setDayDetailPosts(posts);
    setDayDetailIsPast(past);
    setShowDayDetail(true);
  };

  const handleAddVideo = () => {
    setSelectedDate(dayDetailDate);
    setShowDayDetail(false);
    setIsModalOpen(true);
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#1C1C1F', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <CalendarIcon size={24} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
              Calendario de Contenidos
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>
              Planifica y programa tus publicaciones tácticas
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1C1C1F', padding: '4px 8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}><ChevronLeft size={18} color="var(--text-main)" /></button>
          <span style={{ fontSize: '14px', fontWeight: '800', margin: '0 12px', minWidth: '100px', textAlign: 'center', color: '#FAFAFA' }}>
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}><ChevronRight size={18} color="var(--text-main)" /></button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 40px', color: 'var(--text-muted)' }}>
          <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 16px', color: 'var(--primary)' }} />
          <p style={{ fontWeight: '700' }}>Cargando grilla...</p>
        </div>
      ) : (
        <div className="card-pro animate-fade-in calendar-container" style={{ padding: '24px' }}>

          <div className="calendar-grid header-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {weekDays.map(wd => (
              <div key={wd} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {wd}
              </div>
            ))}
          </div>

          <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} style={{ minHeight: '100px', background: '#111113', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}></div>;

              const todaysPosts = getPostsForDay(day);
              const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = dayStr === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
              const isPast = isDatePast(day);

              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`calendar-cell ${isPast ? 'past-day' : ''}`}
                  style={{
                    minHeight: '100px',
                    minWidth: 0,
                    background: isPast ? '#111113' : '#1C1C1F',
                    border: isToday ? '2px solid #4F46E5' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    display: 'flex', flexDirection: 'column',
                    opacity: isPast ? 0.5 : 1
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#4F46E5'; if (!isPast) e.currentTarget.style.background = '#27272A'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = isToday ? '#4F46E5' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = isPast ? '#111113' : '#1C1C1F'; }}
                >
                  <span style={{
                    fontSize: '12px', fontWeight: '800',
                    color: isPast ? '#52525B' : isToday ? '#4F46E5' : '#FAFAFA',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    {day}
                    {todaysPosts.length > 0 && (
                      <span style={{ fontSize: '9px', fontWeight: '700', color: '#A78BFA', background: 'rgba(167,139,250,0.15)', borderRadius: '6px', padding: '2px 5px' }}>
                        {todaysPosts.length}
                      </span>
                    )}
                  </span>

                  <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-start', paddingTop: '8px' }}>
                    {todaysPosts.map(post => (
                      <div key={post.id}
                        className="post-indicator"
                        style={{
                          width: '100%', height: '6px', borderRadius: '100px',
                          background: post.status === 'published' ? '#10B981' : post.status === 'error' ? '#EF4444' : 'var(--primary)',
                          opacity: 0.8
                        }}
                      />
                    ))}
                  </div>

                  {!isPast && (
                    <div className="add-btn" style={{
                      position: 'absolute', top: '8px', right: '8px',
                      background: 'var(--bg-secondary)', color: 'var(--text-main)', borderRadius: '50%', padding: '4px',
                      opacity: 0, transition: 'opacity 0.2s'
                    }}>
                      <Plus size={12} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY DETAIL MODAL */}
      {showDayDetail && dayDetailDate && (
        <div className="day-detail-overlay" onClick={() => setShowDayDetail(false)}>
          <div className="day-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="day-detail-header">
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FAFAFA', margin: 0 }}>
                  {dayDetailDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <p style={{ fontSize: '12px', color: '#71717A', fontWeight: '600', marginTop: '4px' }}>
                  {dayDetailPosts.length > 0 ? `${dayDetailPosts.length} publicaci${dayDetailPosts.length === 1 ? 'ón' : 'ones'}` : 'Sin publicaciones'}
                  {dayDetailIsPast && ' · Día pasado'}
                </p>
              </div>
              <button onClick={() => setShowDayDetail(false)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#71717A', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            <div className="day-detail-body">
              {dayDetailPosts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <CalendarIcon size={40} style={{ color: '#27272A', marginBottom: '16px' }} />
                  <p style={{ color: '#52525B', fontSize: '14px', fontWeight: '600' }}>
                    {dayDetailIsPast ? 'No hubo publicaciones este día' : 'No hay publicaciones programadas'}
                  </p>
                  {!dayDetailIsPast && (
                    <p style={{ color: '#3F3F46', fontSize: '12px', marginTop: '8px' }}>
                      Agrega un video para programar contenido
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {dayDetailPosts.map(post => {
                    const status = STATUS_MAP[post.status] || STATUS_MAP.draft;
                    const StatusIcon = status.icon;
                    const isVideo = post.source_url && (post.source_url.includes('/video/') || post.source_url.endsWith('.mp4') || post.source_url.endsWith('.mov'));
                    const scheduledTime = post.scheduled_at ? new Date(post.scheduled_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : null;

                    return (
                      <div key={post.id} className="day-detail-post">
                        <div className="day-detail-thumb">
                          {post.source_url ? (
                            isVideo ? (
                              <video src={post.source_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} muted />
                            ) : (
                              <img src={post.source_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                            )
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: '#27272A', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Play size={20} color="#52525B" />
                            </div>
                          )}
                          {isVideo && post.source_url && (
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '6px', display: 'flex' }}>
                              <Play size={14} color="#fff" fill="#fff" />
                            </div>
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: '700', color: '#FAFAFA', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {post.title || post.ai_copy_long?.substring(0, 50) || 'Sin título'}
                          </p>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: status.color, background: `${status.color}15`, padding: '3px 8px', borderRadius: '6px' }}>
                              <StatusIcon size={11} />
                              {status.label}
                            </span>

                            {scheduledTime && (
                              <span style={{ fontSize: '11px', color: '#71717A', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Clock size={10} /> {scheduledTime}
                              </span>
                            )}

                            {post.post_type && (
                              <span style={{ fontSize: '10px', fontWeight: '700', color: '#A78BFA', textTransform: 'uppercase' }}>
                                {post.post_type}
                              </span>
                            )}
                          </div>

                          {post.platforms && post.platforms.length > 0 && (
                            <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                              {post.platforms.map(p => (
                                <span key={p} style={{ fontSize: '10px', fontWeight: '600', color: '#52525B', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                                  {p}
                                </span>
                              ))}
                            </div>
                          )}

                          {post.ai_copy_long && (
                            <p style={{ fontSize: '11px', color: '#52525B', marginTop: '6px', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {post.ai_copy_long}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {!dayDetailIsPast && (
              <div className="day-detail-footer">
                <button onClick={handleAddVideo} className="day-detail-add-btn">
                  <Plus size={16} />
                  Agregar Video
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <DirectScheduleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialDate={selectedDate}
          artistId={artistId}
          activePlatforms={activeArtist?.active_platforms || []}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchScheduled();
          }}
        />
      )}

      <style>{`
        .calendar-cell:hover .add-btn { opacity: 1 !important; display: flex !important; }
        .past-day:hover .add-btn { opacity: 0 !important; display: none !important; }

        .day-detail-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.65); backdrop-filter: blur(8px);
          z-index: 10000; display: flex; align-items: center; justify-content: center;
          padding: 20px; animation: ddFadeIn 0.2s ease;
        }
        @keyframes ddFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ddSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .day-detail-modal {
          background: #111113; width: 100%; max-width: 480px;
          border-radius: 20px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
          display: flex; flex-direction: column;
          max-height: 80vh;
          animation: ddSlideUp 0.25s ease;
        }

        .day-detail-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; justify-content: space-between; align-items: flex-start;
        }

        .day-detail-body {
          padding: 16px 24px;
          overflow-y: auto; flex: 1;
        }

        .day-detail-post {
          display: flex; gap: 14px; align-items: flex-start;
          padding: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          transition: border-color 0.2s;
        }
        .day-detail-post:hover {
          border-color: rgba(255,255,255,0.12);
        }

        .day-detail-thumb {
          width: 72px; height: 72px; min-width: 72px;
          border-radius: 10px; overflow: hidden;
          position: relative;
          background: #1C1C1F;
        }

        .day-detail-footer {
          padding: 16px 24px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .day-detail-add-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #4F46E5, #7C3AED);
          color: #fff;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(79,70,229,0.3);
        }
        .day-detail-add-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(79,70,229,0.4);
        }

        @media (max-width: 768px) {
          .calendar-container { padding: 8px !important; }
          .calendar-grid { grid-template-columns: repeat(7, 1fr) !important; gap: 4px !important; }
          .calendar-cell { min-height: 70px !important; padding: 4px !important; min-width: 0 !important; }
          .calendar-cell span { font-size: 10px !important; text-align: center; width: 100%; display: block !important; }
          .post-indicator { width: 6px !important; height: 6px !important; border-radius: 50% !important; margin: 0 auto; }
          .day-detail-overlay { padding: 12px; align-items: flex-end; }
          .day-detail-modal { max-width: 100%; border-radius: 20px 20px 20px 20px; max-height: 85vh; }
          .day-detail-thumb { width: 56px; height: 56px; min-width: 56px; }
        }
      `}</style>
    </div>
  );
};

export default PlanningView;
