import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Loader2, Image as ImageIcon } from 'lucide-react';
import DirectScheduleModal from './DirectScheduleModal';

const PlanningView = ({ artistId, activeArtist }) => {
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Calendario state
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchScheduled = async () => {
    if (!artistId) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/gallery/${artistId}`);
      if (res.ok) {
        const videos = await res.json();
        // Solo tomar los que están programados (scheduled), publicados, o en proceso de IA (analyzing / processing)
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

  // Generación del calendario
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month); // 0 = Domingo

  const days = [];
  // Celdas vacías previas
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Días del mes
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDayClick = (day) => {
    if (!day) return;
    const clickedDate = new Date(year, month, day, 12, 0, 0); // Seleccionar mediodía por defecto
    setSelectedDate(clickedDate);
    setIsModalOpen(true);
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* HEADER DEL CALENDARIO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#F3F4F6', padding: '12px', borderRadius: '12px' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFF', padding: '4px 8px', borderRadius: '12px', border: '1px solid var(--border-main)' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}><ChevronLeft size={18} color="var(--text-main)" /></button>
          <span style={{ fontSize: '14px', fontWeight: '800', margin: '0 12px', minWidth: '100px', textAlign: 'center' }}>
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
          
          {/* Cabecera de días */}
          <div className="calendar-grid header-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {weekDays.map(wd => (
              <div key={wd} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {wd}
              </div>
            ))}
          </div>

          {/* Grilla principal */}
          <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} style={{ minHeight: '100px', background: '#F9FAFB', borderRadius: '12px' }}></div>;

              // Buscar posts del día
              const dayStr = `${year}-${String(month+1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const todaysPosts = scheduledPosts.filter(p => {
                const pDate = new Date(p.scheduled_at || p.created_at);
                const pStr = `${pDate.getFullYear()}-${String(pDate.getMonth()+1).padStart(2, '0')}-${String(pDate.getDate()).padStart(2, '0')}`;
                return pStr === dayStr;
              });

              const isToday = dayStr === `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

              return (
                <div 
                  key={day} 
                  onClick={() => handleDayClick(day)}
                  className="calendar-cell"
                  style={{ 
                    minHeight: '100px', 
                    minWidth: 0,
                    background: '#FFF', 
                    border: isToday ? '2px solid var(--primary)' : '1px solid var(--border-main)', 
                    borderRadius: '12px', 
                    padding: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    display: 'flex', flexDirection: 'column'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = isToday ? 'var(--primary)' : 'var(--border-main)'}
                >
                  <span style={{ 
                    fontSize: '12px', fontWeight: '800', 
                    color: isToday ? 'var(--primary)' : 'var(--text-main)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    {day}
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
                        title={post.title || 'Draft'}
                      />
                    ))}
                  </div>

                  {/* Botón flotante al hacer hover, por CSS en estilo inyectado */}
                  <div className="add-btn" style={{ 
                    position: 'absolute', top: '8px', right: '8px', 
                    background: '#F3F4F6', color: 'var(--text-main)', borderRadius: '50%', padding: '4px',
                    opacity: 0, transition: 'opacity 0.2s', display: 'none'
                  }}>
                    <Plus size={12} />
                  </div>
                </div>
              );
            })}
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
        .calendar-cell:hover .add-btn { opacity: 1 !important; }
        @media (max-width: 768px) {
          .calendar-container { padding: 8px !important; }
          .calendar-grid { grid-template-columns: repeat(7, 1fr) !important; gap: 4px !important; }
          .calendar-cell { min-height: 70px !important; padding: 4px !important; min-width: 0 !important; }
          .calendar-cell span { font-size: 10px !important; text-align: center; width: 100%; display: block !important; }
          .post-indicator { width: 6px !important; height: 6px !important; border-radius: 50% !important; margin: 0 auto; }
        }
      `}</style>
    </div>
  );
};

export default PlanningView;
