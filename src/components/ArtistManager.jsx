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
    <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px', border: '2px solid var(--border-glass)', background: '#050505', borderRadius: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <Users size={18} color="white" />
          Gestión de Artistas
        </h3>
        <button
          onClick={() => setShowForm(f => !f)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#FFF', border: 'none',
            borderRadius: '4px', padding: '10px 20px',
            color: '#000', cursor: 'pointer', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase'
          }}
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'CANCELAR' : 'NUEVO ARTISTA'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Nombre — requerido */}
          <input
            type="text"
            placeholder="Nombre del artista *"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            required
            autoFocus
            style={{
              background: '#000', border: '2px solid var(--border-glass)',
              borderRadius: '4px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none'
            }}
          />

          {/* Contexto IA — opcionales */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <select
              value={newGenero}
              onChange={e => setNewGenero(e.target.value)}
              style={{
                background: '#000', border: '2px solid var(--border-glass)',
                borderRadius: '4px', padding: '10px 14px', color: newGenero ? 'white' : '#6B7280', fontSize: '13px', outline: 'none',
                appearance: 'none', cursor: 'pointer'
              }}
            >
              <option value="" disabled>Género / nicho</option>
              {GENRE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>

            <input
              type="text"
              placeholder="Audiencia (ej: jóvenes 18-25)"
              value={newAudiencia}
              onChange={e => setNewAudiencia(e.target.value)}
              style={{
                background: '#000', border: '2px solid var(--border-glass)',
                borderRadius: '4px', padding: '10px 14px', color: 'white', fontSize: '13px', outline: 'none'
              }}
            />

            <select
              value={newTono}
              onChange={e => setNewTono(e.target.value)}
              style={{
                background: '#000', border: '2px solid var(--border-glass)',
                borderRadius: '4px', padding: '10px 14px', color: newTono ? 'white' : '#6B7280', fontSize: '13px', outline: 'none',
                appearance: 'none', cursor: 'pointer'
              }}
            >
              <option value="" disabled>Tono de la marca</option>
              {TONE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <p style={{ fontSize: '11px', color: '#555', margin: 0 }}>
            Género, audiencia y tono son opcionales. La IA los usa para generar copy más preciso.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={creating}
              style={{
                padding: '12px 28px', background: '#FFF', color: '#000', border: 'none',
                borderRadius: '4px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              CREAR ARTISTA
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <Loader2 size={20} className="animate-spin" /> Cargando infraestructura...
        </div>
      ) : artists.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280', fontSize: '14px' }}>
          No se han detectado artistas activos. Registra el primero para iniciar el despliegue.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {artists.map(artist => {
            const isSelected = artist.id === selectedArtistId;
            const platformCount = artist.active_platforms?.length || 0;
            return (
              <button
                key={artist.id}
                onClick={() => onSelectArtist(artist)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '24px', borderRadius: '4px',
                  border: isSelected ? '2px solid #FFF' : '2px solid var(--border-glass)',
                  background: isSelected ? '#111' : '#0A0A0A',
                  cursor: 'pointer', color: 'white', textAlign: 'left',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '4px',
                    background: isSelected ? '#FFF' : '#1A1A1A',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: '700', color: isSelected ? '#000' : '#FFF'
                  }}>
                    {artist.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{artist.name}</div>
                    <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {platformCount > 0
                        ? `${platformCount} REDES CONECTADAS`
                        : 'SIN REDES ACTIVAS'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={(e) => handleDelete(e, artist.id)}
                    style={{
                      background: 'none', border: 'none', color: '#666', cursor: 'pointer',
                      padding: '8px', borderRadius: '4px', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                  >
                    <Trash2 size={16} />
                  </button>
                  {isSelected && <CheckCircle size={18} color="white" />}
                  {!isSelected && <ChevronRight size={18} color="#333" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ArtistManager;

