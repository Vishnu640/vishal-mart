import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [locked, setLocked] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Please fill in all fields.');
    setLoading(true); setError('');
    try {
      const res = await API.post('/auth/login', form);
      login(res.data);
      navigate('/home');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      const left = err.response?.data?.attemptsLeft;
      const isLocked = err.response?.data?.locked;
      setError(msg);
      if (left !== undefined) setAttemptsLeft(left);
      if (isLocked) setLocked(true);
    }
    setLoading(false);
  };

  const strength = (p) => {
    if (!p) return null;
    if (p.length < 6) return { label: 'Weak', color: '#e53935', w: '30%' };
    if (p.length < 10 || !/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Medium', color: '#ff6f00', w: '60%' };
    return { label: 'Strong', color: '#34a853', w: '100%' };
  };
  const ps = strength(form.password);

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logoWrap}><span style={s.logo}>🛒</span></div>
        <h2 style={s.title}>Welcome Back!</h2>
        <p style={s.sub}>Login to your Vishal Mart account</p>

        {locked && (
          <div style={s.lockedBox}>
            🔒 Account temporarily locked due to too many failed attempts. Please try again later.
          </div>
        )}
        {error && !locked && (
          <div style={s.errorBox}>
            ⚠️ {error}
            {attemptsLeft !== null && attemptsLeft <= 2 && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#b71c1c' }}>⚠️ {attemptsLeft} attempt(s) left before lockout!</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.label}>Email Address</label>
          <div style={s.inputWrap}>
            <span style={s.inputIcon}>📧</span>
            <input style={s.input} type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>

          <label style={s.label}>Password</label>
          <div style={s.inputWrap}>
            <span style={s.inputIcon}>🔑</span>
            <input style={s.input} type={showPass ? 'text' : 'password'} placeholder="Enter password"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <span style={s.eyeBtn} onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁️'}</span>
          </div>

          {form.password && ps && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ height: 4, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: ps.w, background: ps.color, borderRadius: 4, transition: 'width 0.3s' }} />
              </div>
              <p style={{ fontSize: 11, color: ps.color, margin: '3px 0 0', fontWeight: 600 }}>Password strength: {ps.label}</p>
            </div>
          )}

          <button type="submit" disabled={loading || locked} style={{ ...s.btn, opacity: locked ? 0.6 : 1 }}>
            {loading ? '⏳ Logging in...' : '🔐 Login'}
          </button>
        </form>

        <div style={s.divider}><span>or</span></div>
        <p style={s.linkText}>Don't have an account? <Link to="/register" style={s.link}>Register Free</Link></p>
        <p style={s.linkText}><Link to="/" style={s.link}>← Back to Home</Link></p>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg,#0d47a1,#1a73e8,#42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { background: 'rgba(255,255,255,0.97)', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'fadeIn 0.5s ease' },
  logoWrap: { textAlign: 'center', marginBottom: 12 },
  logo: { fontSize: 48 },
  title: { textAlign: 'center', fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px', fontFamily: 'Poppins' },
  sub: { textAlign: 'center', color: '#888', fontSize: 13, margin: '0 0 24px', fontFamily: 'Poppins' },
  form: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Poppins' },
  inputWrap: { position: 'relative', marginBottom: 16, display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 14, fontSize: 16 },
  input: { width: '100%', padding: '12px 44px', borderRadius: 12, border: '2px solid #e8f0fe', fontSize: 14, fontFamily: 'Poppins', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
  eyeBtn: { position: 'absolute', right: 14, cursor: 'pointer', fontSize: 16 },
  btn: { padding: '14px', background: 'linear-gradient(135deg,#1a73e8,#0d47a1)', color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'Poppins', boxShadow: '0 4px 14px rgba(26,115,232,0.4)', marginTop: 4 },
  errorBox: { background: '#fff3f3', border: '1px solid #ffcdd2', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#c62828', marginBottom: 16, fontFamily: 'Poppins' },
  lockedBox: { background: '#fce4ec', border: '1px solid #f48fb1', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#880e4f', marginBottom: 16, fontFamily: 'Poppins', fontWeight: 600 },
  divider: { textAlign: 'center', color: '#ccc', margin: '20px 0', fontSize: 13, position: 'relative' },
  linkText: { textAlign: 'center', fontSize: 13, color: '#666', margin: '8px 0', fontFamily: 'Poppins' },
  link: { color: '#1a73e8', fontWeight: 700, textDecoration: 'none' },
};
