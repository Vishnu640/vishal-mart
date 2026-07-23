import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', city: '', pincode: '', street: '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false });
  const [notifications, setNotifications] = useState({ orders: true, offers: true, delivery: true, email: true });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    API.get('/auth/profile').then(res => {
      const u = res.data;
      setProfile({ name: u.name || '', email: u.email || '', phone: u.phone || '', city: u.city || '', pincode: u.pincode || '', street: u.street || '' });
      setNotifications(n => ({ ...n, orders: u.notificationsEnabled !== false }));
    }).catch(() => {
      setProfile({ name: user.name || '', email: user.email || '', phone: '', city: '', pincode: '', street: '' });
    });
  }, [user, navigate]);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '', type: 'success' }), 3000); };

  const saveProfile = async () => {
    if (!profile.name.trim()) return showToast('Name is required', 'error');
    setLoading(true);
    try {
      await API.put('/auth/profile', { ...profile, notificationsEnabled: notifications.orders });
      showToast('✅ Profile updated successfully!');
    } catch (err) { showToast(err.response?.data?.message || 'Failed to update', 'error'); }
    setLoading(false);
  };

  const changePassword = async () => {
    if (!passwords.current || !passwords.newPass) return showToast('Fill all password fields', 'error');
    if (passwords.newPass.length < 8) return showToast('New password must be 8+ characters', 'error');
    if (!/[A-Z]/.test(passwords.newPass) || !/[0-9]/.test(passwords.newPass)) return showToast('Password needs uppercase + number', 'error');
    if (passwords.newPass !== passwords.confirm) return showToast('Passwords do not match', 'error');
    setLoading(true);
    try {
      await API.put('/auth/change-password', { currentPassword: passwords.current, newPassword: passwords.newPass });
      showToast('✅ Password changed! Please login again.');
      setPasswords({ current: '', newPass: '', confirm: '' });
      setTimeout(() => { logout(); navigate('/login'); }, 2000);
    } catch (err) { showToast(err.response?.data?.message || 'Failed to change password', 'error'); }
    setLoading(false);
  };

  const strength = (p) => {
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const levels = [null, { label: 'Weak', color: '#e53935', w: '25%' }, { label: 'Fair', color: '#ff6f00', w: '50%' }, { label: 'Good', color: '#1a73e8', w: '75%' }, { label: 'Strong 💪', color: '#34a853', w: '100%' }];
    return levels[score] || levels[1];
  };
  const ps = strength(passwords.newPass);

  const TABS = [
    { key: 'profile', icon: '👤', label: 'Profile' },
    { key: 'security', icon: '🔒', label: 'Security' },
    { key: 'notifications', icon: '🔔', label: 'Notifications' },
    { key: 'account', icon: '⚙️', label: 'Account' },
  ];

  return (
    <div style={s.page}>
      {toast.msg && <div style={{ ...s.toast, background: toast.type === 'error' ? 'linear-gradient(135deg,#e53935,#b71c1c)' : 'linear-gradient(135deg,#34a853,#1e7e34)' }}>{toast.msg}</div>}

      <div style={s.container}>
        <h2 style={s.title}>⚙️ Settings</h2>
        <p style={s.sub}>Manage your account, security and preferences</p>

        <div style={s.layout}>
          {/* Sidebar */}
          <div style={s.sidebar}>
            <div style={s.avatarBox}>
              <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || '👤'}</div>
              <p style={s.avatarName}>{user?.name}</p>
              <p style={s.avatarEmail}>{user?.email}</p>
              <span style={s.roleBadge}>{user?.role === 'admin' ? '👑 Admin' : '👤 Customer'}</span>
            </div>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ ...s.sideBtn, ...(tab === t.key ? s.sideBtnActive : {}) }}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={s.content}>

            {/* Profile Tab */}
            {tab === 'profile' && (
              <div style={s.card}>
                <h3 style={s.cardTitle}>👤 Edit Profile</h3>
                <div style={s.grid2}>
                  {[
                    { key: 'name', label: 'Full Name', icon: '👤', placeholder: 'Your name' },
                    { key: 'phone', label: 'Phone Number', icon: '📱', placeholder: '10-digit number' },
                    { key: 'city', label: 'City', icon: '🏙️', placeholder: 'Your city' },
                    { key: 'pincode', label: 'Pincode', icon: '📮', placeholder: '6-digit pincode' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={s.label}>{f.label}</label>
                      <div style={s.inputWrap}>
                        <span style={s.inputIcon}>{f.icon}</span>
                        <input style={s.input} placeholder={f.placeholder} value={profile[f.key]} onChange={e => setProfile({ ...profile, [f.key]: e.target.value })} />
                      </div>
                    </div>
                  ))}
                </div>
                <label style={s.label}>Email Address</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>📧</span>
                  <input style={{ ...s.input, background: '#f5f5f5', color: '#999' }} value={profile.email} disabled />
                </div>
                <label style={s.label}>Street / Area</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>📍</span>
                  <input style={s.input} placeholder="Street address" value={profile.street} onChange={e => setProfile({ ...profile, street: e.target.value })} />
                </div>
                <button onClick={saveProfile} disabled={loading} style={s.btn}>{loading ? '⏳ Saving...' : '💾 Save Profile'}</button>
              </div>
            )}

            {/* Security Tab */}
            {tab === 'security' && (
              <div style={s.card}>
                <h3 style={s.cardTitle}>🔒 Change Password</h3>
                <div style={s.securityInfo}>
                  <span>🛡️</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>Password Security Tips</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#666' }}>Use 8+ characters with uppercase, numbers & symbols. Never share your password.</p>
                  </div>
                </div>
                {[
                  { key: 'current', label: 'Current Password', showKey: 'current' },
                  { key: 'newPass', label: 'New Password', showKey: 'new' },
                  { key: 'confirm', label: 'Confirm New Password', showKey: null },
                ].map(f => (
                  <div key={f.key}>
                    <label style={s.label}>{f.label}</label>
                    <div style={s.inputWrap}>
                      <span style={s.inputIcon}>🔑</span>
                      <input style={s.input} type={f.showKey && showPass[f.showKey] ? 'text' : 'password'}
                        placeholder={f.label} value={passwords[f.key]}
                        onChange={e => setPasswords({ ...passwords, [f.key]: e.target.value })} />
                      {f.showKey && <span style={s.eye} onClick={() => setShowPass(p => ({ ...p, [f.showKey]: !p[f.showKey] }))}>{showPass[f.showKey] ? '🙈' : '👁️'}</span>}
                      {f.key === 'confirm' && passwords.confirm && <span style={{ position: 'absolute', right: 14, fontSize: 16 }}>{passwords.newPass === passwords.confirm ? '✅' : '❌'}</span>}
                    </div>
                    {f.key === 'newPass' && passwords.newPass && ps && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ height: 4, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: ps.w, background: ps.color, borderRadius: 4, transition: 'width 0.3s' }} />
                        </div>
                        <p style={{ fontSize: 11, color: ps.color, margin: '3px 0 0', fontWeight: 700 }}>{ps.label}</p>
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={changePassword} disabled={loading} style={s.btn}>{loading ? '⏳ Changing...' : '🔐 Change Password'}</button>

                <div style={{ ...s.securityInfo, marginTop: 20, background: '#e8f5e9', border: '1px solid #c8e6c9' }}>
                  <span>🔒</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#2e7d32' }}>Account Protection</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#388e3c' }}>Your account locks after 5 failed login attempts for 15 minutes.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {tab === 'notifications' && (
              <div style={s.card}>
                <h3 style={s.cardTitle}>🔔 Notification Preferences</h3>
                {[
                  { key: 'orders', icon: '📦', label: 'Order Updates', desc: 'Get notified when your order status changes' },
                  { key: 'delivery', icon: '🚚', label: 'Delivery Alerts', desc: 'Real-time delivery tracking notifications' },
                  { key: 'offers', icon: '🎁', label: 'Offers & Coupons', desc: 'Exclusive deals and discount notifications' },
                  { key: 'email', icon: '📧', label: 'Email Notifications', desc: 'Receive order confirmations via email' },
                ].map(n => (
                  <div key={n.key} style={s.notifRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 24 }}>{n.icon}</span>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>{n.label}</p>
                        <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{n.desc}</p>
                      </div>
                    </div>
                    <div style={{ ...s.toggle, background: notifications[n.key] ? '#1a73e8' : '#e0e0e0' }}
                      onClick={() => setNotifications(p => ({ ...p, [n.key]: !p[n.key] }))}>
                      <div style={{ ...s.toggleDot, transform: notifications[n.key] ? 'translateX(22px)' : 'translateX(2px)' }} />
                    </div>
                  </div>
                ))}
                <button onClick={saveProfile} disabled={loading} style={s.btn}>{loading ? '⏳ Saving...' : '💾 Save Preferences'}</button>
              </div>
            )}

            {/* Account Tab */}
            {tab === 'account' && (
              <div style={s.card}>
                <h3 style={s.cardTitle}>⚙️ Account Settings</h3>

                <div style={s.infoBox}>
                  <div style={s.infoRow2}><span style={s.infoLabel}>Account ID</span><span style={s.infoVal}>#{user?.id}</span></div>
                  <div style={s.infoRow2}><span style={s.infoLabel}>Role</span><span style={s.infoVal}>{user?.role}</span></div>
                  <div style={s.infoRow2}><span style={s.infoLabel}>Email</span><span style={s.infoVal}>{user?.email}</span></div>
                  <div style={s.infoRow2}><span style={s.infoLabel}>Status</span><span style={{ ...s.infoVal, color: '#34a853', fontWeight: 700 }}>✅ Active</span></div>
                </div>

                <div style={{ ...s.securityInfo, background: '#fff3e0', border: '1px solid #ffcc80', marginTop: 20 }}>
                  <span>📱</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#e65100' }}>App Version</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#bf360c' }}>Vishal Mart v2.0 — All features up to date</p>
                  </div>
                </div>

                <button onClick={() => { logout(); navigate('/'); }} style={{ ...s.btn, background: 'linear-gradient(135deg,#ff6f00,#e65100)', marginTop: 20 }}>
                  🚪 Logout
                </button>

                <div style={{ marginTop: 24, padding: '16px', background: '#fff3f3', borderRadius: 14, border: '1px solid #ffcdd2' }}>
                  <p style={{ fontWeight: 800, color: '#c62828', fontSize: 14, margin: '0 0 8px' }}>⚠️ Danger Zone</p>
                  <p style={{ fontSize: 12, color: '#888', margin: '0 0 12px' }}>Type DELETE to confirm account deletion</p>
                  <input style={{ ...s.input, marginBottom: 10, borderColor: '#ffcdd2' }} placeholder="Type DELETE to confirm" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} />
                  <button disabled={deleteConfirm !== 'DELETE'} style={{ ...s.btn, background: deleteConfirm === 'DELETE' ? 'linear-gradient(135deg,#e53935,#b71c1c)' : '#ccc', cursor: deleteConfirm === 'DELETE' ? 'pointer' : 'not-allowed' }}>
                    🗑️ Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(160deg,#e8f5e9 0%,#f1f8e9 30%,#e0f7fa 60%,#e8f0fe 100%)', backgroundAttachment: 'fixed', fontFamily: 'Poppins,sans-serif' },
  container: { maxWidth: 960, margin: '0 auto', padding: '24px 16px' },
  title: { fontSize: 24, fontWeight: 800, color: '#1a73e8', margin: 0 },
  sub: { color: '#888', fontSize: 13, margin: '4px 0 20px' },
  layout: { display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' },
  sidebar: { width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 },
  avatarBox: { background: 'rgba(255,255,255,0.9)', borderRadius: 16, padding: '20px 16px', textAlign: 'center', marginBottom: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  avatar: { width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#1a73e8,#0d47a1)', color: 'white', fontSize: 28, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' },
  avatarName: { fontWeight: 800, fontSize: 14, color: '#1a1a2e', margin: '0 0 2px' },
  avatarEmail: { fontSize: 11, color: '#888', margin: '0 0 8px', wordBreak: 'break-all' },
  roleBadge: { background: '#e8f0fe', color: '#1a73e8', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 },
  sideBtn: { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#555', textAlign: 'left' },
  sideBtnActive: { background: 'linear-gradient(135deg,#1a73e8,#0d47a1)', color: 'white', boxShadow: '0 4px 12px rgba(26,115,232,0.3)' },
  content: { flex: 1, minWidth: 280 },
  card: { background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  cardTitle: { fontSize: 18, fontWeight: 800, color: '#1a1a2e', margin: '0 0 20px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4 },
  label: { fontSize: 11, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' },
  inputWrap: { position: 'relative', marginBottom: 14, display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 13, fontSize: 15 },
  input: { width: '100%', padding: '11px 40px', borderRadius: 12, border: '2px solid #e8f0fe', fontSize: 13, fontFamily: 'Poppins', outline: 'none', boxSizing: 'border-box' },
  eye: { position: 'absolute', right: 13, cursor: 'pointer', fontSize: 15 },
  btn: { width: '100%', padding: '13px', background: 'linear-gradient(135deg,#1a73e8,#0d47a1)', color: 'white', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,115,232,0.35)', fontFamily: 'Poppins' },
  securityInfo: { display: 'flex', gap: 12, alignItems: 'flex-start', background: '#f8faff', borderRadius: 12, padding: '12px 14px', marginBottom: 16, border: '1px solid rgba(26,115,232,0.1)', fontSize: 20 },
  notifRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f0f0f0' },
  toggle: { width: 46, height: 24, borderRadius: 12, cursor: 'pointer', position: 'relative', transition: 'background 0.3s', flexShrink: 0 },
  toggleDot: { width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, transition: 'transform 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' },
  infoBox: { background: '#f8faff', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(26,115,232,0.08)' },
  infoRow2: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: 13 },
  infoLabel: { color: '#888', fontWeight: 600 },
  infoVal: { color: '#1a1a2e', fontWeight: 700 },
  toast: { position: 'fixed', top: 20, right: 20, color: 'white', padding: '14px 24px', borderRadius: 14, fontWeight: 700, fontSize: 14, zIndex: 9999, boxShadow: '0 8px 25px rgba(0,0,0,0.2)', fontFamily: 'Poppins' },
};
