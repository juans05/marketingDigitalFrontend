import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Heart, EyeOff, Eye, Trash2, Loader2, RefreshCw, ChevronLeft, Instagram, ArrowUpRight, Filter, Clock, User, Reply, Lock } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const getToken = () => {
  try { return JSON.parse(localStorage.getItem('vidalis_user') || '{}').token || ''; }
  catch { return ''; }
};

const PLATFORM_COLORS = {
  instagram: { bg: 'rgba(225, 48, 108, 0.12)', color: '#E1306C', border: 'rgba(225, 48, 108, 0.25)' },
  tiktok: { bg: 'rgba(0, 242, 234, 0.10)', color: '#00F2EA', border: 'rgba(0, 242, 234, 0.25)' },
  facebook: { bg: 'rgba(24, 119, 242, 0.12)', color: '#1877F2', border: 'rgba(24, 119, 242, 0.25)' },
  youtube: { bg: 'rgba(255, 0, 0, 0.10)', color: '#FF0000', border: 'rgba(255, 0, 0, 0.25)' },
  twitter: { bg: 'rgba(29, 161, 242, 0.12)', color: '#1DA1F2', border: 'rgba(29, 161, 242, 0.25)' },
};

const PlatformBadge = ({ platform }) => {
  const p = PLATFORM_COLORS[platform] || { bg: 'rgba(79,70,229,0.12)', color: '#818CF8', border: 'rgba(79,70,229,0.25)' };
  return (
    <span style={{
      fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
      background: p.bg, color: p.color, border: `1px solid ${p.border}`,
      padding: '2px 8px', borderRadius: '6px', letterSpacing: '0.04em',
    }}>
      {platform}
    </span>
  );
};

const TimeAgo = ({ date }) => {
  if (!date) return null;
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return <span style={{ fontSize: '11px', color: '#71717A' }}>ahora</span>;
  if (mins < 60) return <span style={{ fontSize: '11px', color: '#71717A' }}>{mins}m</span>;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return <span style={{ fontSize: '11px', color: '#71717A' }}>{hrs}h</span>;
  const days = Math.floor(hrs / 24);
  return <span style={{ fontSize: '11px', color: '#71717A' }}>{days}d</span>;
};

const InboxView = ({ artistId, artistName }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState({});
  const replyRef = useRef(null);

  useEffect(() => {
    if (artistId) fetchComments();
  }, [artistId]);

  const fetchComments = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/vidalis/comments/${artistId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error cargando comentarios');
      const items = data.comments || data.posts || data.data || (Array.isArray(data) ? data : []);
      setComments(Array.isArray(items) ? items : []);
      if (data.notice) setError(data.notice);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openPost = async (post) => {
    setSelectedPost(post);
    setPostComments([]);
    setLoadingReplies(true);
    setReplyText('');
    try {
      const postId = post.latePostId || post.postId || post.id;
      const params = new URLSearchParams({ artistId });
      const res = await fetch(`${API}/api/vidalis/comments/${postId}/replies?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      const items = data.comments || data.posts || data.data || (Array.isArray(data) ? data : []);
      setPostComments(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingReplies(false);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selectedPost) return;
    setSending(true);
    try {
      const postId = selectedPost.latePostId || selectedPost.postId || selectedPost.id;
      const res = await fetch(`${API}/api/vidalis/comments/${postId}/reply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: artistId, message: replyText }),
      });
      if (!res.ok) throw new Error('Error enviando respuesta');
      setReplyText('');
      openPost(selectedPost);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const toggleLike = async (postId, commentId) => {
    const key = `like_${commentId}`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      await fetch(`${API}/api/vidalis/comments/${postId}/${commentId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: artistId }),
      });
      if (selectedPost) openPost(selectedPost);
    } catch {} finally {
      setActionLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const toggleHide = async (postId, commentId) => {
    const key = `hide_${commentId}`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      await fetch(`${API}/api/vidalis/comments/${postId}/${commentId}/hide`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: artistId }),
      });
      if (selectedPost) openPost(selectedPost);
    } catch {} finally {
      setActionLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const deleteComment = async (postId) => {
    if (!confirm('¿Eliminar este comentario?')) return;
    try {
      await fetch(`${API}/api/vidalis/comments/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: artistId }),
      });
      if (selectedPost) openPost(selectedPost);
    } catch {}
  };

  const filteredComments = filter === 'all'
    ? comments
    : comments.filter(c => (c.platform || '').toLowerCase() === filter);

  const platforms = [...new Set(comments.map(c => (c.platform || '').toLowerCase()).filter(Boolean))];

  if (!artistId) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ background: 'rgba(79,70,229,0.12)', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <MessageCircle size={28} color="#818CF8" />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FAFAFA', marginBottom: 8 }}>Inbox Unificado</h3>
        <p style={{ color: '#71717A', fontSize: '14px' }}>Configura tu perfil de artista para ver los comentarios de todas tus redes.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', height: 'calc(100vh - 180px)', maxHeight: '800px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {selectedPost && (
            <button onClick={() => setSelectedPost(null)} style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', padding: '6px 8px', cursor: 'pointer', color: '#A1A1AA',
              display: 'flex', alignItems: 'center',
            }}>
              <ChevronLeft size={16} />
            </button>
          )}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FAFAFA', margin: 0 }}>
              {selectedPost ? (selectedPost.title || selectedPost.caption || 'Comentarios del post').slice(0, 50) : 'Todos los comentarios'}
            </h3>
            <p style={{ fontSize: '11px', color: '#71717A', margin: 0 }}>
              {selectedPost
                ? `${postComments.length} respuestas`
                : `${filteredComments.length} conversaciones · ${artistName || ''}`
              }
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!selectedPost && platforms.length > 1 && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setFilter('all')} style={{
                padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                fontSize: '11px', fontWeight: 600,
                background: filter === 'all' ? 'rgba(79,70,229,0.2)' : 'rgba(255,255,255,0.04)',
                color: filter === 'all' ? '#818CF8' : '#71717A',
              }}>Todas</button>
              {platforms.map(p => (
                <button key={p} onClick={() => setFilter(p)} style={{
                  padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
                  background: filter === p ? (PLATFORM_COLORS[p]?.bg || 'rgba(79,70,229,0.2)') : 'rgba(255,255,255,0.04)',
                  color: filter === p ? (PLATFORM_COLORS[p]?.color || '#818CF8') : '#71717A',
                }}>{p}</button>
              ))}
            </div>
          )}
          <button onClick={() => fetchComments(true)} disabled={refreshing} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: '#A1A1AA',
            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600,
          }}>
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 size={28} color="#4F46E5" className="spin" />
          </div>
        ) : error && comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ background: 'rgba(251,191,36,0.1)', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <MessageCircle size={24} color="#FBBF24" />
            </div>
            <p style={{ color: '#FBBF24', fontSize: '13px', marginBottom: 12, lineHeight: '1.6', maxWidth: 320, margin: '0 auto 16px' }}>{error}</p>
            <button onClick={() => fetchComments()} style={{
              background: 'rgba(79,70,229,0.15)', color: '#818CF8', border: '1px solid rgba(79,70,229,0.3)',
              padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            }}>Reintentar</button>
          </div>
        ) : !selectedPost ? (
          /* === POST LIST === */
          filteredComments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <MessageCircle size={36} color="#3F3F46" style={{ marginBottom: 12 }} />
              <p style={{ color: '#71717A', fontSize: '14px' }}>
                {comments.length === 0
                  ? 'No hay comentarios todavía. Conecta tus redes y publica contenido para empezar.'
                  : 'No hay comentarios en esta plataforma.'}
              </p>
            </div>
          ) : (
            <div>
              {filteredComments.map((post, i) => {
                const postId = post.latePostId || post.postId || post.id;
                const title = (post.title || post.caption || post.body || '').slice(0, 80);
                const commentCount = post.commentCount || post.comments || 0;
                const platform = (post.platform || '').toLowerCase();
                return (
                  <button key={postId || i} onClick={() => openPost(post)} style={{
                    width: '100%', textAlign: 'left', display: 'flex', gap: '12px',
                    padding: '14px 20px', border: 'none', cursor: 'pointer',
                    background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background 0.15s',
                    alignItems: 'flex-start',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Thumbnail */}
                    {post.imageUrl || post.thumbnailUrl ? (
                      <img src={post.imageUrl || post.thumbnailUrl} alt="" style={{
                        width: 44, height: 44, borderRadius: '10px', objectFit: 'cover',
                        border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0,
                      }} />
                    ) : (
                      <div style={{
                        width: 44, height: 44, borderRadius: '10px', flexShrink: 0,
                        background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(79,70,229,0.2)',
                      }}>
                        <MessageCircle size={18} color="#818CF8" />
                      </div>
                    )}
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <PlatformBadge platform={platform} />
                        <TimeAgo date={post.publishDate || post.createdAt} />
                      </div>
                      <p style={{
                        fontSize: '13px', fontWeight: 600, color: '#E4E4E7', margin: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {title || 'Post sin título'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#A1A1AA', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MessageCircle size={12} /> {commentCount}
                        </span>
                        {post.likes > 0 && (
                          <span style={{ fontSize: '11px', color: '#A1A1AA', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Heart size={12} /> {post.likes}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronLeft size={16} color="#3F3F46" style={{ transform: 'rotate(180deg)', flexShrink: 0, marginTop: 14 }} />
                  </button>
                );
              })}
            </div>
          )
        ) : (
          /* === COMMENT THREAD === */
          loadingReplies ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <Loader2 size={28} color="#4F46E5" className="spin" />
            </div>
          ) : postComments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <MessageCircle size={32} color="#3F3F46" style={{ marginBottom: 8 }} />
              <p style={{ color: '#71717A', fontSize: '13px' }}>No hay comentarios en este post aún.</p>
            </div>
          ) : (
            <div style={{ padding: '8px 0' }}>
              {postComments.map((c, i) => {
                const cId = c.commentId || c.id || i;
                const postId = selectedPost.latePostId || selectedPost.postId || selectedPost.id;
                const isHidden = c.hidden || c.isHidden;
                return (
                  <div key={cId} style={{
                    padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    opacity: isHidden ? 0.4 : 1,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          {c.profileImageUrl && (
                            <img src={c.profileImageUrl} alt="" style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }} />
                          )}
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#E4E4E7' }}>
                            {c.username || c.commenterName || 'Usuario'}
                          </span>
                          <TimeAgo date={c.commentDate || c.createdAt} />
                          {isHidden && (
                            <span style={{ fontSize: '9px', color: '#EF4444', background: 'rgba(239,68,68,0.12)', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>OCULTO</span>
                          )}
                        </div>
                        <p style={{ fontSize: '13px', color: '#D4D4D8', margin: 0, lineHeight: '1.5', wordBreak: 'break-word' }}>
                          {c.comment || c.text || c.message || ''}
                        </p>
                      </div>
                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <button onClick={() => toggleLike(postId, cId)} disabled={actionLoading[`like_${cId}`]} style={{
                          background: c.liked ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px',
                          padding: '4px 6px', cursor: 'pointer', color: c.liked ? '#EF4444' : '#71717A',
                          display: 'flex', alignItems: 'center',
                        }}>
                          <Heart size={13} fill={c.liked ? '#EF4444' : 'none'} />
                        </button>
                        <button onClick={() => toggleHide(postId, cId)} disabled={actionLoading[`hide_${cId}`]} style={{
                          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', color: '#71717A',
                          display: 'flex', alignItems: 'center',
                        }}>
                          {isHidden ? <Eye size={13} /> : <EyeOff size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Reply bar (only when viewing a post) */}
      {selectedPost && (
        <div style={{
          padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', gap: '8px', alignItems: 'center',
          background: 'rgba(18,18,20,0.9)', backdropFilter: 'blur(8px)',
        }}>
          <input
            ref={replyRef}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
            placeholder="Escribir respuesta..."
            style={{
              flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', padding: '10px 14px', color: '#FAFAFA', fontSize: '13px',
              outline: 'none', fontFamily: 'var(--font-body)',
            }}
          />
          <button onClick={sendReply} disabled={sending || !replyText.trim()} style={{
            background: replyText.trim() ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : 'rgba(255,255,255,0.06)',
            border: 'none', borderRadius: '10px', padding: '10px 14px', cursor: 'pointer',
            color: replyText.trim() ? '#fff' : '#52525B', display: 'flex', alignItems: 'center',
            transition: 'all 0.2s',
          }}>
            {sending ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default InboxView;
