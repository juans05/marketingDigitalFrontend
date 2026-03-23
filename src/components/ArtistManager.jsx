import { useState, useEffect } from 'react';
import { Users, Plus, ChevronRight, CheckCircle, Loader2, X } from 'lucide-react';

const ArtistManager = ({ agencyId, onSelectArtist, selectedArtistId }) => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');

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
        body: JSON.stringify({ agency_id: agencyId, name: newName.trim() })
      });
      const artist = await res.json();
      if (!res.ok) throw new Error(artist.error);
      setArtists(prev => [...prev, artist]);
      setNewName('');
      setShowForm(false);
      onSelectArtist(artist);
    } catch (err) {
      alert('Error al crear artista: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '28px', marginBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Users size={20} color="var(--primary)" />
          Tus Artistas
        </h3>
        <button
          onClick={() => setShowForm(f => !f)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(155,81,224,0.15)', border: '1px solid rgba(155,81,224,0.3)',
            borderRadius: '10px', padding: '8px 16px',
            color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
          }}
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Cancelar' : 'Nuevo artista'}
        </button>
      </div>

      {/* Formulario crear artista */}
      {showForm && (
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Nombre del artista..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            required
            autoFocus
            style={{
              flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px', padding: '10px 14px', color: 'white', fontSize: '14px', outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={creating}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {creating ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />}
            Crear
          </button>
        </form>
      )}

      {/* Lista de artistas */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Cargando artistas...
        </div>
      ) : artists.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
          No tienes artistas aún. Crea el primero para empezar.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {artists.map(artist => {
            const isSelected = artist.id === selectedArtistId;
            const platformCount = artist.active_platforms?.length || 0;
            return (
              <button
                key={artist.id}
                onClick={() => onSelectArtist(artist)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', borderRadius: '12px',
                  border: `1px solid ${isSelected ? 'rgba(155,81,224,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  background: isSelected ? 'rgba(155,81,224,0.12)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer', color: 'white', textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Avatar inicial */}
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: isSelected ? 'rgba(155,81,224,0.3)' : 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: '700', color: isSelected ? 'var(--primary)' : 'var(--text-muted)'
                  }}>
                    {artist.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{artist.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {platformCount > 0
                        ? `${platformCount} red${platformCount > 1 ? 'es' : ''} conectada${platformCount > 1 ? 's' : ''}`
                        : 'Sin redes conectadas'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isSelected && <CheckCircle size={16} color="var(--primary)" />}
                  <ChevronRight size={16} color="var(--text-muted)" />
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
