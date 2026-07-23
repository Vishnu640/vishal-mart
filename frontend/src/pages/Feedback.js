import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PORTAL_QUESTIONS = [
  { key: 'ease', label: '🖥️ How easy is the website to use?' },
  { key: 'speed', label: '⚡ How fast is the delivery?' },
  { key: 'support', label: '🎧 How is the customer support?' },
  { key: 'value', label: '💰 How good is the value for money?' },
  { key: 'overall', label: '⭐ Overall experience?' },
];

function StarRating({ value, onChange, size = 28 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} style={{ fontSize: size, cursor: 'pointer', transition: 'transform 0.1s', transform: (hover || value) >= star ? 'scale(1.2)' : 'scale(1)' }}
          onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} onClick={() => onChange(star)}>
          {(hover || value) >= star ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  );
}

export default function Feedback() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('product');
  const [selectedOrder, setSelectedOrder] = useState('');
  const [productRating, setProductRating] = useState(0);
  const [productComment, setProductComment] = useState('');
  const [productTags, setProductTags] = useState([]);
  const [portalRatings, setPortalRatings] = useState({ ease: 0, speed: 0, support: 0, value: 0, overall: 0 });
  const [portalComment, setPortalComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const PRODUCT_TAGS = ['Fresh Quality', 'Good Packaging', 'Fast Delivery', 'Value for Money', 'Exactly as Described', 'Would Buy Again', 'Poor Quality', 'Damaged', 'Wrong Item'];

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    API.get('/orders/my').then(res => {
      setOrders(res.data.filter(o => o.status === 'delivered'));
    }).catch(() => {});
  }, [user, navigate]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const submitProductFeedback = async () => {
    if (!selectedOrder) return showToast('⚠️ Please select an order');
    if (productRating === 0) return showToast('⚠️ Please give a star rating');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
    showToast('✅ Product feedback submitted! Thank you!');
  };

  const submitPortalFeedback = async () => {
    const allRated = Object.values(portalRatings).every(v => v > 0);
    if (!allRated) return showToast('⚠️ Please rate all categories');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
    showToast('✅ Portal feedback submitted! Thank you!');
  };

  const toggleTag = (tag) => setProductTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const avgPortal = Object.values(portalRatings).filter(v => v > 0);
  const avgScore = avgPortal.length ? (avgPortal.reduce((a, b) => a + b, 0) / avgPortal.length).toFixed(1) : 0;

  if (submitted) return (
    <div style={s.page}>
      <div style={s.successCard}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
        <h2 style={{ color: '#34a853', fontWeight: 800, fontSize: 24, margin: '0 0 8px' }}>Thank You!</h2>
        <p style={{ color: '#555', fontSize: 15, margin: '0 0 24px' }}>Your feedback helps us improve Vishal Mart for everyone.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => { setSubmitted(false); setProductRating(0); setProductComment(''); setProductTags([]); setPortalRatings({ ease: 0, speed: 0, support: 0, value: 0, overall: 0 }); setPortalComment(''); }} style={s.btn}>📝 Give More Feedback</button>
          <button onClick={() => navigate('/home')} style={s.outlineBtn}>🛒 Continue Shopping</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      {toast && <div style={s.toast}>{toast}</div>}
      <div style={s.container}>
        <h2 style={s.title}>💬 Share Your Feedback</h2>
        <p style={s.sub}>Your opinion makes Vishal Mart better for everyone!</p>

        {/* Tabs */}
        <div style={s.tabs}>
          <button onClick={() => setTab('product')} style={{ ...s.tab, ...(tab === 'product' ? s.tabActive : {}) }}>🛍️ Product Feedback</button>
          <button onClick={() => setTab('portal')} style={{ ...s.tab, ...(tab === 'portal' ? s.tabActive : {}) }}>🌐 Portal Feedback</button>
        </div>

        {/* Product Feedback */}
        {tab === 'product' && (
          <div style={s.card}>
            <h3 style={s.cardTitle}>🛍️ Rate Your Purchase</h3>

            <label style={s.label}>Select Delivered Order</label>
            <select style={s.select} value={selectedOrder} onChange={e => setSelectedOrder(e.target.value)}>
              <option value="">-- Choose an order --</option>
              {orders.map(o => (
                <option key={o.id} value={o.id}>Order #{o.id} — ₹{o.totalAmount} ({new Date(o.createdAt).toLocaleDateString('en-IN')})</option>
              ))}
            </select>
            {orders.length === 0 && <p style={{ color: '#888', fontSize: 13, margin: '8px 0' }}>No delivered orders yet. Complete a purchase to leave feedback!</p>}

            <label style={s.label}>Overall Product Rating</label>
            <StarRating value={productRating} onChange={setProductRating} size={36} />
            {productRating > 0 && (
              <p style={{ color: ['', '#e53935', '#ff6f00', '#1a73e8', '#34a853', '#34a853'][productRating], fontWeight: 700, fontSize: 13, margin: '6px 0 0' }}>
                {['', '😞 Poor', '😐 Fair', '🙂 Good', '😊 Very Good', '🤩 Excellent!'][productRating]}
              </p>
            )}

            <label style={{ ...s.label, marginTop: 16 }}>Quick Tags (select all that apply)</label>
            <div style={s.tagWrap}>
              {PRODUCT_TAGS.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  style={{ ...s.tag, ...(productTags.includes(tag) ? s.tagActive : {}) }}>
                  {tag}
                </button>
              ))}
            </div>

            <label style={{ ...s.label, marginTop: 16 }}>Write a Review (optional)</label>
            <textarea style={s.textarea} placeholder="Tell us about your experience with the product..." value={productComment} onChange={e => setProductComment(e.target.value)} rows={4} />

            <button onClick={submitProductFeedback} disabled={loading} style={s.btn}>
              {loading ? '⏳ Submitting...' : '✅ Submit Product Feedback'}
            </button>
          </div>
        )}

        {/* Portal Feedback */}
        {tab === 'portal' && (
          <div style={s.card}>
            <h3 style={s.cardTitle}>🌐 Rate Vishal Mart Portal</h3>

            {avgScore > 0 && (
              <div style={s.avgBox}>
                <span style={{ fontSize: 36, fontWeight: 800, color: '#1a73e8' }}>{avgScore}</span>
                <span style={{ fontSize: 13, color: '#888', marginLeft: 8 }}>/ 5.0 average so far</span>
              </div>
            )}

            {PORTAL_QUESTIONS.map(q => (
              <div key={q.key} style={s.questionRow}>
                <label style={s.label}>{q.label}</label>
                <StarRating value={portalRatings[q.key]} onChange={v => setPortalRatings(p => ({ ...p, [q.key]: v }))} size={28} />
              </div>
            ))}

            <label style={{ ...s.label, marginTop: 16 }}>Any suggestions to improve? (optional)</label>
            <textarea style={s.textarea} placeholder="Tell us what we can do better..." value={portalComment} onChange={e => setPortalComment(e.target.value)} rows={4} />

            <button onClick={submitPortalFeedback} disabled={loading} style={s.btn}>
              {loading ? '⏳ Submitting...' : '🌟 Submit Portal Feedback'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(160deg,#e8f5e9 0%,#f1f8e9 30%,#e0f7fa 60%,#e8f0fe 100%)', backgroundAttachment: 'fixed', fontFamily: 'Poppins,sans-serif' },
  container: { maxWidth: 680, margin: '0 auto', padding: '24px 16px' },
  title: { fontSize: 24, fontWeight: 800, color: '#1a73e8', margin: 0 },
  sub: { color: '#888', fontSize: 13, margin: '4px 0 20px' },
  tabs: { display: 'flex', gap: 10, marginBottom: 20 },
  tab: { flex: 1, padding: '11px', borderRadius: 14, border: '2px solid #e0e0e0', background: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#555' },
  tabActive: { background: 'linear-gradient(135deg,#1a73e8,#0d47a1)', color: 'white', border: '2px solid transparent' },
  card: { background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  cardTitle: { fontSize: 18, fontWeight: 800, color: '#1a1a2e', margin: '0 0 20px' },
  label: { fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' },
  select: { width: '100%', padding: '11px 14px', borderRadius: 12, border: '2px solid #e8f0fe', fontSize: 13, fontFamily: 'Poppins', outline: 'none', marginBottom: 16, background: 'white' },
  tagWrap: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  tag: { padding: '6px 14px', borderRadius: 20, border: '2px solid #e0e0e0', background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#555', transition: 'all 0.2s' },
  tagActive: { background: 'linear-gradient(135deg,#1a73e8,#0d47a1)', color: 'white', border: '2px solid transparent' },
  textarea: { width: '100%', padding: '12px 14px', borderRadius: 12, border: '2px solid #e8f0fe', fontSize: 13, fontFamily: 'Poppins', outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 16 },
  btn: { width: '100%', padding: '13px', background: 'linear-gradient(135deg,#1a73e8,#0d47a1)', color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,115,232,0.35)' },
  outlineBtn: { padding: '13px 28px', background: 'white', color: '#1a73e8', border: '2px solid #1a73e8', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  questionRow: { marginBottom: 18 },
  avgBox: { display: 'flex', alignItems: 'center', background: '#f0f7ff', borderRadius: 12, padding: '12px 16px', marginBottom: 20 },
  successCard: { maxWidth: 480, margin: '80px auto', background: 'rgba(255,255,255,0.95)', borderRadius: 24, padding: '48px 32px', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' },
  toast: { position: 'fixed', top: 20, right: 20, background: 'linear-gradient(135deg,#34a853,#1e7e34)', color: 'white', padding: '14px 24px', borderRadius: 14, fontWeight: 700, fontSize: 14, zIndex: 9999, boxShadow: '0 8px 25px rgba(52,168,83,0.4)' },
};
