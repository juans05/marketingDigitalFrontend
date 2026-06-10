import { useState } from 'react';
import { User, Lock, CreditCard, Key, AlertTriangle, Copy, Check } from 'lucide-react';

const Settings = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || 'Felix',
    lastName: user?.name?.split(' ').slice(1).join(' ') || 'Van Houtte',
    email: user?.email || 'felix.vh@metalabs.ai',
    bio: user?.bio || 'Passionate about the intersection of AI and visual arts. Leading creative teams at MetaLabs to build the future of generative media.'
  });

  const [copied, setCopied] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate?.(formData);
      alert('✅ Cambios guardados');
    } catch (err) {
      alert('❌ Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="settings-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', padding: '32px' }}>
      {/* Left Column - Profile */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Profile Card */}
        <div className="settings-card glass-morph" style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '16px',
          padding: '32px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '32px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <User size={48} color="white" />
              <div style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                width: '32px',
                height: '32px',
                background: '#A78BFA',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #0F172A'
              }}>
                <span style={{ fontSize: '18px' }}>✓</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#F1F5F9', marginBottom: '4px' }}>
                {formData.firstName} {formData.lastName}
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '16px' }}>
                Creative Director @ MetaLabs
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#F1F5F9' }}>42</div>
                  <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', fontWeight: '600' }}>Projects</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#F1F5F9' }}>1.2k</div>
                  <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', fontWeight: '600' }}>Generations</div>
                </div>
              </div>
            </div>
          </div>

          <button style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #C084FC 0%, #A78BFA 100%)',
            border: 'none',
            borderRadius: '8px',
            color: '#0F172A',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            Upgrade Pro Plan
          </button>
        </div>

        {/* Quick Links */}
        <div className="settings-card glass-morph" style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          backdropFilter: 'blur(10px)'
        }}>
          {[
            { icon: User, label: 'Profile Info', color: '#4F46E5' },
            { icon: Lock, label: 'Security', color: '#F59E0B' },
            { icon: CreditCard, label: 'Billing & Subscriptions', color: '#10B981' },
            { icon: Key, label: 'API Access', color: '#8B5CF6' }
          ].map((item, idx) => (
            <button key={idx} style={{
              width: '100%',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'transparent',
              border: 'none',
              borderBottom: idx < 3 ? '1px solid rgba(148, 163, 184, 0.1)' : 'none',
              cursor: 'pointer',
              color: '#E2E8F0',
              transition: 'all 0.3s ease'
            }} onMouseEnter={(e) => e.target.style.background = 'rgba(148, 163, 184, 0.05)'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <item.icon size={20} color={item.color} />
                <span style={{ fontWeight: '600' }}>{item.label}</span>
              </div>
              <span style={{ color: '#64748B' }}>›</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column - Account Settings & API Keys */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Account Settings */}
        <div className="settings-card glass-morph" style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '16px',
          padding: '32px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#F1F5F9', marginBottom: '24px' }}>Account Settings</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase' }}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '8px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '8px',
                  color: '#F1F5F9',
                  fontFamily: 'inherit',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase' }}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '8px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '8px',
                  color: '#F1F5F9',
                  fontFamily: 'inherit',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase' }}>Email Address</label>
            <input
              type="email"
              value={formData.email}
              disabled
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '8px',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '8px',
                color: '#64748B',
                fontFamily: 'inherit',
                fontSize: '14px',
                cursor: 'not-allowed'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase' }}>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '8px',
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
                color: '#F1F5F9',
                fontFamily: 'inherit',
                fontSize: '14px',
                minHeight: '100px',
                resize: 'vertical'
              }}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              padding: '12px',
              background: saving ? '#64748B' : 'linear-gradient(135deg, #A78BFA 0%, #C084FC 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#0F172A',
              fontWeight: '700',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
          >
            {saving ? 'Guardando...' : 'Save Settings'}
          </button>
        </div>

        {/* API Keys */}
        <div className="settings-card glass-morph" style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '16px',
          padding: '32px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#F1F5F9' }}>API Keys</h3>
            <button style={{
              padding: '8px 16px',
              background: 'rgba(148, 163, 184, 0.1)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '6px',
              color: '#F1F5F9',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '12px'
            }}>
              + New Key
            </button>
          </div>

          {[
            { name: 'Production Main', key: 'sk-vidalis-••••••••12b' },
            { name: 'Staging Test', key: 'sk-vidalis-••••••••23c' }
          ].map((api, idx) => (
            <div key={idx} style={{
              padding: '16px',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '8px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#F1F5F9' }}>{api.name}</div>
                <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'monospace', marginTop: '4px' }}>{api.key}</div>
              </div>
              <button
                onClick={() => copyToClipboard(api.key, idx)}
                style={{
                  padding: '8px 12px',
                  background: 'transparent',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '6px',
                  color: copied === idx ? '#10B981' : '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px'
                }}
              >
                {copied === idx ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          ))}
        </div>

        {/* Danger Zone */}
        <div className="settings-card glass-morph" style={{
          background: 'rgba(127, 29, 29, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          padding: '24px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <AlertTriangle size={20} color="#EF4444" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#EF4444', marginBottom: '4px' }}>Danger Zone</h4>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '16px' }}>
                Permanently delete your account and all associated creative assets.
              </p>
              <button style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #EF4444',
                borderRadius: '6px',
                color: '#EF4444',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '12px'
              }}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
