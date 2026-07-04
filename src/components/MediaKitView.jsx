import { useState, useEffect } from 'react';
import { FileText, Link2, Copy, Loader2, Save, Eye, Globe, Palette, MapPin, Tag, User, AlignLeft, DollarSign, Edit3, Info, Wifi } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const getToken = () => { const u = localStorage.getItem('vidalis_user'); return u ? JSON.parse(u).token : ''; };
const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` });

const ACCENT_COLORS = [
  '#4F46E5', '#7C3AED', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6'
];

const PLATFORM_CONFIG = {
  instagram: { label: 'Instagram', color: '#E1306C', icon: '📸' },
  tiktok: { label: 'TikTok', color: '#00F2EA', icon: '🎵' },
  youtube: { label: 'YouTube', color: '#FF0000', icon: '▶️' },
  facebook: { label: 'Facebook', color: '#1877F2', icon: '📘' },
  twitter: { label: 'Twitter/X', color: '#1DA1F2', icon: '🐦' },
};

const RATE_DESCRIPTIONS = {
  reel: 'Video corto (15-90s) para Instagram Reels o TikTok',
  story: 'Historia efimera de 24h en Instagram o Facebook',
  feed_post: 'Publicacion permanente en el feed con foto o carrusel',
  bundle_3: 'Paquete de 3 contenidos combinados (ej: 1 reel + 1 story + 1 post)',
  ugc_video: 'Video creado para que la marca lo publique en sus propias redes',
};

const MediaKitView = ({ artistId, activeArtist }) => {
  const [kit, setKit] = useState(null);
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rateTab, setRateTab] = useState('total');
  const [editingRates, setEditingRates] = useState(false);
  const [customRates, setCustomRates] = useState({});
  const [form, setForm] = useState({
    display_name: '', bio: '', niche: '', location: '', slug: '', is_public: true, accent_color: '#4F46E5'
  });

  useEffect(() => { if (artistId) fetchData(); }, [artistId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kRes, rRes] = await Promise.all([
        fetch(`${API}/api/vidalis/media-kit/${artistId}`, { headers: headers() }),
        fetch(`${API}/api/vidalis/rate-calculator/${artistId}`, { headers: headers() })
      ]);
      const kitData = await kRes.json();
      const ratesData = await rRes.json();
      if (kitData && !kitData.exists === false) {
        setKit(kitData);
        setForm({
          display_name: kitData.display_name || activeArtist?.name || '',
          bio: kitData.bio || '',
          niche: kitData.niche || activeArtist?.genre || '',
          location: kitData.location || '',
          slug: kitData.slug || '',
          is_public: kitData.is_public !== false,
          accent_color: kitData.accent_color || '#4F46E5'
        });
        if (kitData.custom_rates) setCustomRates(kitData.custom_rates);
      } else {
        setForm(f => ({ ...f, display_name: activeArtist?.name || '', niche: activeArtist?.genre || '' }));
      }
      setRates(ratesData);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const saveKit = async () => {
    setSaving(true);
    try {
      const body = { ...form };
      if (Object.keys(customRates).length > 0) body.custom_rates = customRates;
      const res = await fetch(`${API}/api/vidalis/media-kit/${artistId}`, {
        method: 'PUT', headers: headers(), body: JSON.stringify(body)
      });
      const data = await res.json();
      setKit(data);
      setEditingRates(false);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const copyLink = () => {
    const link = `${window.location.origin}/kit/${kit?.slug || form.slug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasData = rates && (rates.followers > 0 || (rates.platforms && rates.platforms.length > 0));

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#71717A' }}>
      <Loader2 className="animate-spin" size={28} style={{ margin: '0 auto 12px', color: '#4F46E5' }} />
    </div>
  );

  const tierColors = {
    nano: '#FBBF24', micro: '#38BDF8', mid: '#A78BFA', macro: '#10B981', mega: '#EF4444'
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#1C1C1F', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <FileText size={24} color="#A78BFA" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#FAFAFA', marginBottom: '4px' }}>Media Kit</h2>
            <p style={{ color: '#71717A', fontSize: '0.9rem', fontWeight: '500' }}>Tu carta de presentacion para marcas: muestra tu perfil, audiencia y tarifas en un link compartible</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {kit?.slug && (
            <button onClick={copyLink} style={{ background: '#1C1C1F', border: '1px solid rgba(255,255,255,0.08)', color: copied ? '#10B981' : '#A1A1AA', padding: '10px 18px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {copied ? <><Copy size={14} /> Copiado!</> : <><Link2 size={14} /> Copiar Link</>}
            </button>
          )}
          <button onClick={saveKit} disabled={saving} style={{ background: 'linear-gradient(135deg,#A78BFA,#7C3AED)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar
          </button>
        </div>
      </div>

      <div className="mk-main-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: '20px' }}>
        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card-pro" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#FAFAFA', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={14} color="#A78BFA" /> Informacion del Perfil
            </h3>
            {[
              { key: 'display_name', label: 'Nombre', placeholder: 'Tu nombre artistico', icon: User },
              { key: 'bio', label: 'Bio', placeholder: 'Cuentale a las marcas quien eres, que haces y por que deberian trabajar contigo...', textarea: true, icon: AlignLeft },
              { key: 'niche', label: 'Nicho', placeholder: 'Marketing, Fitness, Musica...', icon: Tag },
              { key: 'location', label: 'Ubicacion', placeholder: 'Ciudad, Pais', icon: MapPin },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#71717A', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <f.icon size={10} /> {f.label}
                </label>
                {f.textarea ? (
                  <textarea value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} rows={3}
                    style={{ width: '100%', background: '#1C1C1F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', color: '#FAFAFA', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' }} />
                ) : (
                  <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                    style={{ width: '100%', background: '#1C1C1F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', color: '#FAFAFA', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
                )}
              </div>
            ))}
          </div>

          {/* URL & Color */}
          <div className="card-pro" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#FAFAFA', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={14} color="#A78BFA" /> Link Publico
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#71717A', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>URL personalizada</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#1C1C1F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                <span style={{ padding: '12px', fontSize: '13px', color: '#52525B', whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.06)' }}>vidalis.ai/kit/</span>
                <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} placeholder="mi-nombre"
                  style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px', color: '#FAFAFA', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#71717A', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Palette size={10} /> Color de acento
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {ACCENT_COLORS.map(c => (
                  <button key={c} onClick={() => setForm(p => ({ ...p, accent_color: c }))}
                    style={{
                      width: '32px', height: '32px', borderRadius: '10px', background: c, border: form.accent_color === c ? '2px solid #fff' : '2px solid transparent',
                      cursor: 'pointer', transition: 'transform 0.15s', transform: form.accent_color === c ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: form.accent_color === c ? `0 0 12px ${c}40` : 'none'
                    }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Rates & Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Rates */}
          {rates && (() => {
            const platformsList = rates.platforms || [];
            const tabs = [
              { key: 'total', label: 'Total', icon: '🌐', followers: rates.followers, engagement: rates.engagement_rate, ratesData: rates.suggested_rates, tier: rates.tier },
              ...platformsList.map(p => {
                const cfg = PLATFORM_CONFIG[p.platform] || { label: p.platform, icon: '📱', color: '#71717A' };
                return { key: p.platform, label: cfg.label, icon: cfg.icon, color: cfg.color, followers: p.followers, engagement: p.engagement_rate, ratesData: p.suggested_rates, tier: p.tier };
              })
            ];
            const active = tabs.find(t => t.key === rateTab) || tabs[0];
            const activeTierColor = tierColors[(active.tier || '').toLowerCase()] || '#FBBF24';
            const displayRates = active.ratesData || {};

            return (
              <div className="card-pro" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#FAFAFA', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DollarSign size={14} color="#10B981" /> Tarifas
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: activeTierColor, background: `${activeTierColor}15`, padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
                      {active.tier}
                    </span>
                    <button onClick={() => setEditingRates(!editingRates)} style={{
                      background: editingRates ? 'rgba(167,139,250,0.1)' : 'transparent', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: editingRates ? '#A78BFA' : '#52525B',
                      display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700'
                    }}>
                      <Edit3 size={10} /> {editingRates ? 'Listo' : 'Editar'}
                    </button>
                  </div>
                </div>

                {/* Platform tabs */}
                {tabs.length > 1 && (
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {tabs.map(t => (
                      <button key={t.key} onClick={() => setRateTab(t.key)} style={{
                        padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                        border: rateTab === t.key ? `1px solid ${t.color || '#A78BFA'}` : '1px solid rgba(255,255,255,0.08)',
                        background: rateTab === t.key ? `${t.color || '#A78BFA'}15` : 'transparent',
                        color: rateTab === t.key ? (t.color || '#A78BFA') : '#71717A',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#FAFAFA' }}>{(active.followers || 0).toLocaleString()}</div>
                    <div style={{ fontSize: '10px', color: '#52525B', fontWeight: '700', marginTop: '2px' }}>Seguidores</div>
                  </div>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#FAFAFA' }}>{active.engagement || 0}%</div>
                    <div style={{ fontSize: '10px', color: '#52525B', fontWeight: '700', marginTop: '2px' }}>Engagement</div>
                  </div>
                </div>

                {/* Empty state */}
                {!hasData && !editingRates && (
                  <div style={{ padding: '16px', background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.15)', borderRadius: '10px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Wifi size={14} color="#A78BFA" />
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#A78BFA' }}>Conecta tus redes para tarifas automaticas</span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#71717A', lineHeight: '1.6', margin: 0 }}>
                      Las tarifas se calculan automaticamente segun tus seguidores, views y engagement de cada plataforma conectada. Mientras tanto, puedes editar los precios manualmente con el boton "Editar".
                    </p>
                  </div>
                )}

                {/* Rate rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.entries(displayRates).map(([key, suggestedVal]) => {
                    const customVal = customRates[key];
                    const val = customVal !== undefined ? customVal : suggestedVal;
                    const isCustom = customVal !== undefined;
                    const desc = RATE_DESCRIPTIONS[key] || '';

                    return (
                      <div key={key} style={{
                        padding: '12px 14px', borderRadius: '10px',
                        background: val > 0 ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.02)',
                        border: val > 0 ? '1px solid rgba(16,185,129,0.1)' : '1px solid rgba(255,255,255,0.04)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#A1A1AA', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                              {isCustom && <span style={{ fontSize: '9px', fontWeight: '700', color: '#A78BFA', background: 'rgba(167,139,250,0.15)', padding: '1px 5px', borderRadius: '4px' }}>MANUAL</span>}
                            </div>
                            <p style={{ fontSize: '10px', color: '#52525B', marginTop: '2px', lineHeight: '1.4' }}>{desc}</p>
                          </div>
                          {editingRates ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ color: '#52525B', fontSize: '14px' }}>$</span>
                              <input
                                type="number" min="0"
                                value={customVal !== undefined ? customVal : ''}
                                placeholder={suggestedVal?.toString() || '0'}
                                onChange={e => {
                                  const v = e.target.value;
                                  if (v === '' || v === undefined) {
                                    setCustomRates(prev => { const n = { ...prev }; delete n[key]; return n; });
                                  } else {
                                    setCustomRates(prev => ({ ...prev, [key]: parseInt(v) || 0 }));
                                  }
                                }}
                                style={{ width: '80px', background: '#1C1C1F', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '6px 8px', color: '#FAFAFA', fontSize: '14px', fontWeight: '800', outline: 'none', textAlign: 'right', fontFamily: 'inherit' }}
                              />
                            </div>
                          ) : (
                            <span style={{ fontSize: '16px', fontWeight: '900', color: val > 0 ? '#10B981' : '#3F3F46', minWidth: '60px', textAlign: 'right' }}>${val?.toLocaleString() || 0}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {editingRates && (
                  <p style={{ fontSize: '10px', color: '#52525B', marginTop: '10px', lineHeight: '1.5' }}>
                    Deja el campo vacio para usar la tarifa sugerida automaticamente. Presiona "Guardar" arriba para guardar tus tarifas personalizadas.
                  </p>
                )}

                {!editingRates && rates.note && (
                  <p style={{ fontSize: '11px', color: '#52525B', marginTop: '12px', lineHeight: '1.6' }}>{rates.note}</p>
                )}
              </div>
            );
          })()}

          {/* Preview */}
          <div className="card-pro" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#FAFAFA', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={14} color="#A78BFA" /> Preview
              </h3>
              <span style={{ fontSize: '10px', color: '#3F3F46', fontWeight: '600' }}>Asi veran tu perfil las marcas</span>
            </div>
            <div style={{ background: 'linear-gradient(180deg, #0A0A0C 0%, #111113 100%)', padding: '32px 24px' }}>
              {/* Banner accent */}
              <div style={{
                height: '48px', borderRadius: '12px', marginBottom: '-24px',
                background: `linear-gradient(135deg, ${form.accent_color}, ${form.accent_color}88)`,
                opacity: 0.6
              }} />
              <div style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${form.accent_color}, ${form.accent_color}CC)`,
                  margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', fontWeight: '900', color: '#fff',
                  border: '3px solid #111113', boxShadow: `0 4px 20px ${form.accent_color}30`
                }}>
                  {form.display_name?.[0]?.toUpperCase() || '?'}
                </div>
                <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#FAFAFA' }}>{form.display_name || 'Tu Nombre'}</h4>
                {(form.niche || form.location) && (
                  <p style={{ fontSize: '12px', color: '#71717A', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    {form.niche && <span>{form.niche}</span>}
                    {form.niche && form.location && <span style={{ color: '#3F3F46' }}>·</span>}
                    {form.location && <><MapPin size={10} /> {form.location}</>}
                  </p>
                )}
                {form.bio && (
                  <p style={{ fontSize: '13px', color: '#A1A1AA', marginTop: '14px', lineHeight: '1.6', maxWidth: '300px', margin: '14px auto 0' }}>
                    {form.bio.length > 120 ? form.bio.substring(0, 120) + '...' : form.bio}
                  </p>
                )}
                {!form.bio && <p style={{ fontSize: '13px', color: '#3F3F46', marginTop: '14px', fontStyle: 'italic' }}>Tu bio aparecera aqui...</p>}

                <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '20px', padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#FAFAFA' }}>{rates?.followers?.toLocaleString() || '0'}</div>
                    <div style={{ fontSize: '10px', color: '#52525B', fontWeight: '700', marginTop: '2px' }}>Seguidores</div>
                  </div>
                  <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#FAFAFA' }}>{rates?.engagement_rate || '0'}%</div>
                    <div style={{ fontSize: '10px', color: '#52525B', fontWeight: '700', marginTop: '2px' }}>Engagement</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mk-main-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
        }
      `}</style>
    </div>
  );
};

export default MediaKitView;
