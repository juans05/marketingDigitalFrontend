import { useState, useEffect } from 'react';
import { Users, Plus, ChevronRight, CheckCircle, Loader2, X, Trash2 } from 'lucide-react';

const ArtistManager = ({ agencyId, onSelectArtist, selectedArtistId }) => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGenero, setNewGenero] = useState('');
  const [newAudiencia, setNewAudiencia] = useState('');
  const [newTono, setNewTono] = useState('');
  
  const GENRE_OPTIONS = [
    "Reggaeton / Urbano", "Pop / Comercial", "Hip-Hop / Trap", 
    "Electronic / EDM", "Rock / Alternative", "Indie / Singer-Songwriter", 
    "R&B / Soul", "Jazz / Blues", "Classical / Cinematic", 
    "Folk / Country", "Podcast / Talk Show", "Gaming / Tutorial", 
    "Lifestyle / Vlogging"
  ];

  const TONE_OPTIONS = [
    "Energético / High-Energy", "Inspiracional / Motivating", 
    "Profesional / Authoritative", "Divertido / Humorístico", 
    "Lujoso / Premium", "Auténtico / Raw", "Educativo / Informative", 
    "Provocativo / Edgy", "Minimalista / Clean", "Emocional / Deep"
  ];

  useEffect(() => {
    fetchArtists();
  }, [agencyId]);

  const fetchArtists = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/artists/${agencyId}`);
      const data = await res.json();
      setArtists(Array.isArray(data) ? data : []);
    } catch {
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/artists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agency_id: agencyId,
          name: newName.trim(),
          ai_genre: newGenero.trim() || null,
          ai_audience: newAudiencia.trim() || null,
          ai_tone: newTono.trim() || null,
        })
      });
      const artist = await res.json();
      if (!res.ok) throw new Error(artist.error);
      setArtists(prev => [...prev, artist]);
      setNewName(''); setNewGenero(''); setNewAudiencia(''); setNewTono('');
      setShowForm(false);
      onSelectArtist(artist);
    } catch (err) {
      alert('Error al crear artista: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, artistId) => {
    e.stopPropagation(); // Evitar seleccionar el artista al querer borrarlo
    if (!window.confirm('¿Estás seguro de que quieres eliminar este artista y TODOS sus videos? Esta acción no se puede deshacer.')) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vidalis/artists/${artistId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar');
      
      setArtists(prev => prev.filter(a => a.id !== artistId));
      if (selectedArtistId === artistId) onSelectArtist(null);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="card-pro animate-fade-in" style={{ padding: '32px', marginBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <Users size={20} color="var(--primary)" />
          Gestión de Marcas y Artistas
        </h3>
        <button
          onClick={() => setShowForm(f => !f)}
          className={showForm ? 'btn-secondary' : 'btn-primary'}
          style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px' }}
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'CANCELAR' : 'NUEVO ARTISTA'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid var(--border-main)' }}>
          {/* Nombre — requerido */}
          <div className="input-group">
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Nombre Completo</label>
            <input
              type="text"
              placeholder="Ej: Marc Anthony, Warner Music..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%', background: '#F9FAFB', border: '1px solid var(--border-main)',
                borderRadius: '8px', padding: '12px 16px', color: 'var(--text-main)', fontSize: '14px', outline: 'none'
              }}
            />
          </div>

          {/* Contexto IA — opcionales */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Género / Nicho</label>
              <select
                value={newGenero}
                onChange={e => setNewGenero(e.target.value)}
                style={{
                  width: '100%', background: '#F9FAFB', border: '1px solid var(--border-main)',
                  borderRadius: '8px', padding: '12px 14px', color: newGenero ? 'var(--text-main)' : '#9CA3AF', fontSize: '13px', outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="" disabled>Selecciona género</option>
                {GENRE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Audiencia Objetivo</label>
              <input
                type="text"
                placeholder="Ej: Jóvenes 18-25"
                value={newAudiencia}
                onChange={e => setNewAudiencia(e.target.value)}
                style={{
                  width: '100%', background: '#F9FAFB', border: '1px solid var(--border-main)',
                  borderRadius: '8px', padding: '12px 14px', color: 'var(--text-main)', fontSize: '13px', outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Tono de Marca</label>
              <select
                value={newTono}
                onChange={e => setNewTono(e.target.value)}
                style={{
                  width: '100%', background: '#F9FAFB', border: '1px solid var(--border-main)',
                  borderRadius: '8px', padding: '12px 14px', color: newTono ? 'var(--text-main)' : '#9CA3AF', fontSize: '13px', outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="" disabled>Selecciona tono</option>
                {TONE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
              * Los campos adicionales ayudan a la IA a generar copy más preciso.
            </p>
            <button
              type="submit"
              disabled={creating}
              className="btn-primary"
              style={{ padding: '12px 32px', borderRadius: '8px', fontSize: '13px' }}
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              CREAR MARCA
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <Loader2 size={24} className="animate-spin" color="var(--primary)" /> Cargando perfiles...
        </div>
      ) : artists.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px', background: '#F9FAFB', borderRadius: '12px', border: '1px dashed var(--border-main)' }}>
          No hay marcas activas. Registra la primera para comenzar.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {artists.map(artist => {
            const isSelected = artist.id === selectedArtistId;
            const platformCount = artist.active_platforms?.length || 0;
            return (
              <div
                key={artist.id}
                onClick={() => onSelectArtist(artist)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', borderRadius: '12px',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-main)',
                  background: isSelected ? '#F5F7FF' : '#FFFFFF',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(44, 51, 216, 0.1)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: isSelected ? 'var(--primary)' : '#F3F4F6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: '800', color: isSelected ? '#FFF' : 'var(--text-muted)'
                  }}>
                    {artist.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>{artist.name}</div>
                    <div style={{ fontSize: '11px', color: isSelected ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '600' }}>
                      {platformCount > 0
                        ? `${platformCount} REDES ACTIVAS`
                        : 'SIN REDES'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={(e) => handleDelete(e, artist.id)}
                    style={{
                      background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer',
                      padding: '6px', borderRadius: '6px', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                  >
                    <Trash2 size={16} />
                  </button>
                  {isSelected ? <CheckCircle size={20} color="var(--primary)" /> : <ChevronRight size={18} color="#D1D5DB" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ArtistManager;

