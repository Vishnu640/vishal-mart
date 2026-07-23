import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', city: '', pincode: '' });
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { login } = useAuth();
  const navigate = useNavigate();

  const strength = (p) => {
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { label: 'Weak', color: '#e53935', w: '25%' };
    if (score === 2) return { label: 'Fair', color: '#ff6f00', w: '50%' };
    if (score === 3) return { label: 'Good', color: '#1a73e8', w: '75%' };
    return { label: 'Strong 💪', color: '#34a853', w: '100%' };
  };
  const ps = strength(form.password);

  const validateStep1 = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.email.includes('@')) return 'Valid email is required';
    if (form.password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(form.password)) return 'Password must contain an uppercase letter';
    if (!/[0-9]/.test(form.password)) return 'Password must contain a number';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) return setError(err);
    setError(''); setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await API.post('/auth/register', form);
      login(res.data);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logoWrap}><span style={s.logo}>🛒</span></div>
        <h2 style={s.title}>Create Account</h2>
        <p style={s.sub}>Join Vishal Mart — Step {step} of 2</p>

        {/* Step indicator */}
        <div style={s.stepRow}>
          {[1, 2].map(n => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ ...s.stepDot, background: step >= n ? '#1a73e8' : '#e0e0e0', color: step >= n ? 'white' : '#bbb' }}>{n}</div>
              <span style={{ fontSize: 11, color: step >= n ? '#1a73e8' : '#bbb', fontWeight: 600 }}>{n === 1 ? 'Account' : 'Address'}</span>
              {n < 2 && <div style={{ width: 30, height: 2, background: step > n ? '#1a73e8' : '#e0e0e0', margin: '0 4px' }} />}
            </div>
          ))}
        </div>

        {error && <div style={s.errorBox}>⚠️ {error}</div>}

        {step === 1 && (
          <div style={s.form}>
            <label style={s.label}>Full Name</label>
            <div style={s.inputWrap}>
              <span style={s.icon}>👤</span>
              <input style={s.input} placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <label style={s.label}>Email Address</label>
            <div style={s.inputWrap}>
              <span style={s.icon}>📧</span>
              <input style={s.input} type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <label style={s.label}>Password</label>
            <div style={s.inputWrap}>
              <span style={s.icon}>🔑</span>
              <input style={s.input} type={showPass ? 'text' : 'password'} placeholder="Min 8 chars, 1 uppercase, 1 number" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              <span style={s.eye} onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁️'}</span>
            </div>
            {form.password && ps && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ height: 5, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: ps.w, background: ps.color, borderRadius: 4, transition: 'width 0.3s' }} />
                </div>
                <p style={{ fontSize: 11, color: ps.color, margin: '3px 0 0', fontWeight: 700 }}>{ps.label}</p>
              </div>
            )}
            <label style={s.label}>Confirm Password</label>
            <div style={s.inputWrap}>
              <span style={s.icon}>🔒</span>
              <input style={s.input} type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
              {form.confirmPassword && <span style={{ position: 'absolute', right: 14, fontSize: 16 }}>{form.password === form.confirmPassword ? '✅' : '❌'}</span>}
            </div>
            <button onClick={handleNext} style={s.btn}>Next →</button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} style={s.form}>
            <label style={s.label}>Phone Number</label>
            <div style={s.inputWrap}>
              <span style={s.icon}>📱</span>
              <input style={s.input} placeholder="10-digit mobile number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <label style={s.label}>City</label>
            <div style={s.inputWrap}>
              <span style={s.icon}>🏙️</span>
              <input style={s.input} placeholder="Your city" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            </div>
            <label style={s.label}>Pincode</label>
            <div style={s.inputWrap}>
              <span style={s.icon}>📮</span>
              <input style={s.input} placeholder="6-digit pincode" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setStep(1)} style={s.backBtn}>← Back</button>
              <button type="submit" disabled={loading} style={s.btn}>{loading ? '⏳ Creating...' : '✅ Create Account'}</button>
            </div>
          </form>
        )}

        <p style={s.linkText}>Already have an account? <Link to="/login" style={s.link}>Login here</Link></p>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg,#0d47a1,#1a73e8,#42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { background: 'rgba(255,255,255,0.97)', borderRadius: 24, padding: '36px', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'fadeIn 0.5s ease' },
  logoWrap: { textAlign: 'center', marginBottom: 8 },
  logo: { fontSize: 44 },
  title: { textAlign: 'center', fontSize: 22, fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px', fontFamily: 'Poppins' },
  sub: { textAlign: 'center', color: '#888', fontSize: 13, margin: '0 0 16px', fontFamily: 'Poppins' },
  stepRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 20 },
  stepDot: { width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 },
  form: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 11, fontWeight: 700, color: '#555', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Poppins' },
  inputWrap: { position: 'relative', marginBottom: 14, display: 'flex', alignItems: 'center' },
  icon: { position: 'absolute', left: 13, fontSize: 15 },
  input: { width: '100%', padding: '11px 40px', borderRadius: 12, border: '2px solid #e8f0fe', fontSize: 13, fontFamily: 'Poppins', outline: 'none', boxSizing: 'border-box' },
  eye: { position: 'absolute', right: 13, cursor: 'pointer', fontSize: 15 },
  btn: { flex: 1, padding: '13px', background: 'linear-gradient(135deg,#1a73e8,#0d47a1)', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Poppins', boxShadow: '0 4px 14px rgba(26,115,232,0.35)' },
  backBtn: { padding: '13px 18px', background: '#f5f5f5', color: '#555', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins' },
  errorBox: { background: '#fff3f3', border: '1px solid #ffcdd2', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#c62828', marginBottom: 14, fontFamily: 'Poppins' },
  linkText: { textAlign: 'center', fontSize: 13, color: '#666', margin: '16px 0 0', fontFamily: 'Poppins' },
  link: { color: '#1a73e8', fontWeight: 700, textDecoration: 'none' },
};
