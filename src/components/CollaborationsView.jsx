import { useState, useEffect } from 'react';
import { Handshake, Plus, DollarSign, Loader2, X, Edit3, Trash2, BarChart3, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const getToken = () => { const u = localStorage.getItem('vidalis_user'); return u ? JSON.parse(u).token : ''; };
const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` });

const STATUS_CONFIG = {
  lead: { label: 'Lead', color: '#71717A', icon: Clock },
  negotiating: { label: 'Negociando', color: '#F59E0B', icon: Clock },
  confirmed: { label: 'Confirmado', color: '#4F46E5', icon: CheckCircle },
  in_progress: { label: 'En Progreso', color: '#38BDF8', icon: Loader2 },
  delivered: { label: 'Entregado', color: '#A78BFA', icon: CheckCircle },
  paid: { label: 'Pagado', color: '#10B981', icon: DollarSign },
  cancelled: { label: 'Cancelado', color: '#EF4444', icon: AlertCircle },
};

const CollaborationsView = ({ artistId }) => {
  const [collabs, setCollabs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCollab, setEditCollab] = useState(null);
  const [form, setForm] = useState({ brand_name: '', amount: '', status: 'lead', platform: '', notes: '', deliverables: [] });

  useEffect(() => { if (artistId) fetchData(); }, [artistId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        fetch(`${API}/api/vidalis/collabs/${artistId}`, { headers: headers() }),
        fetch(`${API}/api/vidalis/collabs/${artistId}/stats`, { headers: headers() })
      ]);
      setCollabs(await cRes.json());
      setStats(await sRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const saveCollab = async () => {
    try {
      const body = { ...form, amount: parseFloat(form.amount) || 0 };
      if (editCollab) {
        await fetch(`${API}/api/vidalis/collabs/${editCollab.id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) });
      } else {
        await fetch(`${API}/api/vidalis/collabs/${artistId}`, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
      }
      setShowForm(false); setEditCollab(null); setForm({ brand_name: '', amount: '', status: 'lead', platform: '', notes: '', deliverables: [] });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const deleteCollab = async (id) => {
    try {
      await fetch(`${API}/api/vidalis/collabs/${id}`, { method: 'DELETE', headers: headers() });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const openEdit = (c) => {
    setEditCollab(c);
    setForm({ brand_name: c.brand_name, amount: c.amount || '', status: c.status, platform: c.platform || '', notes: c.notes || '', deliverables: c.deliverables || [] });
    setShowForm(true);
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div className="collabs-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
          <div style={{ background: '#1C1C1F', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
            <Handshake size={24} color="#F59E0B" />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: '800', color: '#FAFAFA', marginBottom: '4px' }}>Colaboraciones</h2>
            <p style={{ color: '#71717A', fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', fontWeight: '500' }}>Registra y haz seguimiento de tus acuerdos con marcas: montos, entregas, estados de pago y ganancias</p>
          </div>
        </div>
        <button onClick={() => { setEditCollab(null); setForm({ brand_name: '', amount: '', status: 'lead', platform: '', notes: '', deliverables: [] }); setShowForm(true); }}
          style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Nueva Colaboración
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="collabs-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '28px' }}>
          <div className="card-pro" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#52525B', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>Total Ganado</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#10B981' }}>${stats.total_earned?.toLocaleString() || 0}</div>
          </div>
          <div className="card-pro" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#52525B', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>Por Cobrar</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#F59E0B' }}>${stats.pending_payment?.toLocaleString() || 0}</div>
          </div>
          <div className="card-pro" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#52525B', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>Activas</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#4F46E5' }}>{stats.active || 0}</div>
          </div>
          <div className="card-pro" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#52525B', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>Total Deals</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#FAFAFA' }}>{stats.total || 0}</div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#71717A' }}>
          <Loader2 className="animate-spin" size={28} style={{ margin: '0 auto 12px', color: '#4F46E5' }} />
        </div>
      ) : collabs.length === 0 ? (
        <div className="card-pro" style={{ textAlign: 'center', padding: '60px 30px' }}>
          <Handshake size={40} style={{ color: '#27272A', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FAFAFA', marginBottom: '8px' }}>Sin colaboraciones</h3>
          <p style={{ color: '#71717A', fontSize: '14px' }}>Agrega tu primer deal con una marca</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {collabs.map(c => {
            const st = STATUS_CONFIG[c.status] || STATUS_CONFIG.lead;
            const StIcon = st.icon;
            return (
              <div key={c.id} className="card-pro" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#1C1C1F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '900', color: '#FAFAFA', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {c.brand_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <p style={{ fontSize: '15px', fontWeight: '800', color: '#FAFAFA' }}>{c.brand_name}</p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: st.color, background: `${st.color}15`, padding: '3px 10px', borderRadius: '6px' }}>
                      <StIcon size={10} /> {st.label}
                    </span>
                    {c.platform && <span style={{ fontSize: '11px', color: '#52525B', fontWeight: '600' }}>{c.platform}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                  {c.amount > 0 && <p style={{ fontSize: '18px', fontWeight: '900', color: '#FAFAFA' }}>${parseFloat(c.amount).toLocaleString()}</p>}
                  <p style={{ fontSize: '10px', color: '#3F3F46' }}>{new Date(c.created_at).toLocaleDateString('es-ES')}</p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => openEdit(c)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#71717A' }}><Edit3 size={14} /></button>
                  <button onClick={() => deleteCollab(c.id)} style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '460px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', color: '#FAFAFA', display: 'flex', justifyContent: 'space-between' }}>
              {editCollab ? 'Editar Colaboración' : 'Nueva Colaboración'}
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#52525B', cursor: 'pointer' }}><X size={20} /></button>
            </h3>
            {[
              { key: 'brand_name', label: 'Marca', placeholder: 'Nombre de la marca' },
              { key: 'amount', label: 'Monto (USD)', placeholder: '500', type: 'number' },
              { key: 'platform', label: 'Plataforma', placeholder: 'Instagram, TikTok...' },
              { key: 'notes', label: 'Notas', placeholder: 'Detalles del deal...' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#71717A', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>{f.label}</label>
                <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} type={f.type || 'text'} placeholder={f.placeholder}
                  style={{ width: '100%', background: '#1C1C1F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 16px', color: '#FAFAFA', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
            ))}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#71717A', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Estado</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button key={key} onClick={() => setForm(p => ({ ...p, status: key }))} style={{
                    padding: '8px 12px', borderRadius: '8px', border: `1px solid ${form.status === key ? cfg.color : 'rgba(255,255,255,0.08)'}`,
                    background: form.status === key ? `${cfg.color}15` : 'transparent', color: form.status === key ? cfg.color : '#71717A',
                    fontSize: '11px', fontWeight: '700', cursor: 'pointer'
                  }}>{cfg.label}</button>
                ))}
              </div>
            </div>
            <button onClick={saveCollab} disabled={!form.brand_name.trim()} style={{
              width: '100%', padding: '14px', border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg,#F59E0B,#D97706)',
              color: '#fff', fontWeight: '800', fontSize: '14px', cursor: 'pointer', opacity: form.brand_name.trim() ? 1 : 0.5
            }}>{editCollab ? 'Guardar Cambios' : 'Crear Colaboración'}</button>
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 768px) {
          .collabs-header h2 { font-size: 1.2rem !important; }
          .collabs-header p { font-size: 0.8rem !important; }
        }
        @media (max-width: 480px) {
          .collabs-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .collabs-stats-grid .card-pro { padding: 14px 8px !important; }
          .collabs-stats-grid .card-pro div:last-child { font-size: 18px !important; }
        }
      `}</style>
    </div>
  );
};

export default CollaborationsView;
