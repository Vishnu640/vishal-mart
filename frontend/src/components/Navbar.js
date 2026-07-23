import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client'; // eslint-disable-line no-unused-vars
import API from '../api/axios';

export default function Navbar({ cartCount }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [newOrders, setNewOrders] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    API.get('/orders/all').then(res => {
      setNewOrders(res.data.filter(o => o.status === 'placed').length);
    }).catch(() => {});
    // Poll every 15 seconds for new orders
    const interval = setInterval(() => {
      API.get('/orders/all').then(res => {
        setNewOrders(res.data.filter(o => o.status === 'placed').length);
      }).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.brand}>🛒 Vishal Mart</Link>
      <div style={s.links}>
        <Link to="/home" style={s.link}>🏠 Home</Link>
        <Link to="/cart" style={s.link}>
          🛒 Cart {cartCount > 0 && <span style={s.badge}>{cartCount}</span>}
        </Link>
        {user ? (
          <>
            {user.role === 'admin' ? (
              <Link to="/admin" style={s.adminLink}>
                🏪 Dashboard {newOrders > 0 && <span style={s.alertBadge}>{newOrders}</span>}
              </Link>
            ) : (
              <>
                <Link to="/orders" style={s.link}>📦 Orders</Link>
                <Link to="/feedback" style={s.link}>💬 Feedback</Link>
              </>
            )}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(!menuOpen)} style={s.userChip}>
                👤 {user.name?.split(' ')[0]} ▾
              </button>
              {menuOpen && (
                <div style={s.dropdown} onMouseLeave={() => setMenuOpen(false)}>
                  <Link to="/settings" style={s.dropItem} onClick={() => setMenuOpen(false)}>⚙️ Settings</Link>
                  <Link to="/feedback" style={s.dropItem} onClick={() => setMenuOpen(false)}>💬 Feedback</Link>
                  <div style={s.dropDivider} />
                  <button onClick={handleLogout} style={s.dropLogout}>🚪 Logout</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={s.link}>Login</Link>
            <Link to="/register" style={s.registerBtn}>Register Free</Link>
          </>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}`}</style>
    </nav>
  );
}

const s = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 30px', background: 'linear-gradient(135deg,#0d47a1,#1a73e8)', color: 'white', boxShadow: '0 2px 12px rgba(26,115,232,0.4)', position: 'sticky', top: 0, zIndex: 999, fontFamily: 'Poppins,sans-serif' },
  brand: { color: 'white', textDecoration: 'none', fontSize: '22px', fontWeight: '800' },
  links: { display: 'flex', gap: '14px', alignItems: 'center' },
  link: { color: 'white', textDecoration: 'none', fontSize: '13px', fontWeight: 600, position: 'relative' },
  adminLink: { color: '#ffd54f', textDecoration: 'none', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 },
  userChip: { fontSize: '13px', fontWeight: 600, background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 20, border: 'none', color: 'white', cursor: 'pointer' },
  registerBtn: { background: 'rgba(255,255,255,0.2)', color: 'white', textDecoration: 'none', padding: '6px 14px', borderRadius: 20, fontSize: '13px', fontWeight: 700, border: '1px solid rgba(255,255,255,0.4)' },
  badge: { backgroundColor: '#e53935', color: 'white', borderRadius: '50%', padding: '2px 7px', fontSize: '11px', marginLeft: '4px', fontWeight: 700 },
  alertBadge: { backgroundColor: '#e53935', color: 'white', borderRadius: '50%', padding: '2px 7px', fontSize: '11px', fontWeight: 800, animation: 'pulse 1.5s ease-in-out infinite' },
  dropdown: { position: 'absolute', top: '110%', right: 0, background: 'white', borderRadius: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', minWidth: 160, overflow: 'hidden', zIndex: 1000 },
  dropItem: { display: 'block', padding: '11px 16px', fontSize: 13, fontWeight: 600, color: '#333', textDecoration: 'none', borderBottom: '1px solid #f5f5f5' },
  dropDivider: { height: 1, background: '#f0f0f0' },
  dropLogout: { display: 'block', width: '100%', padding: '11px 16px', fontSize: 13, fontWeight: 700, color: '#e53935', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' },
};
