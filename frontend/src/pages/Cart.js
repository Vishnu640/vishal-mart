import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Cart({ cart, setCart }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [address, setAddress] = useState({ street: user?.street || '', city: user?.city || '', pincode: user?.pincode || '' });
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');
  const [placing, setPlacing] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = total >= 499 ? 0 : 40;
  const grandTotal = total + deliveryFee;

  const updateQty = (id, qty) => {
    if (qty === 0) return setCart(cart.filter((c) => c.id !== id));
    setCart(cart.map((c) => c.id === id ? { ...c, quantity: qty } : c));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return setLocError('Geolocation not supported by your browser.');
    setLocLoading(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const addr = data.address;
          setAddress({
            street: `${addr.road || addr.neighbourhood || ''}, ${addr.suburb || ''}`.trim().replace(/,$/, ''),
            city: addr.city || addr.town || addr.village || addr.county || '',
            pincode: addr.postcode || '',
          });
        } catch {
          setLocError('Could not fetch address. Please enter manually.');
        }
        setLocLoading(false);
      },
      (err) => {
        setLocError(err.code === 1 ? 'Location permission denied. Please allow location access.' : 'Could not get location. Enter address manually.');
        setLocLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const placeOrder = async () => {
    if (!user) return navigate('/login');
    if (cart.length === 0) return;
    if (!address.street || !address.city || !address.pincode) return setLocError('Please fill in your delivery address.');
    setPlacing(true);
    try {
      const items = cart.map((c) => ({ product: c.id, quantity: c.quantity, price: c.price }));
      await API.post('/orders', { items, totalAmount: grandTotal, ...address, paymentMethod });
      setCart([]);
      navigate('/orders');
    } catch (err) {
      setLocError('Order failed: ' + (err.response?.data?.message || err.message));
    }
    setPlacing(false);
  };

  if (cart.length === 0) return (
    <div style={s.container}>
      <div style={s.emptyBox}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🛒</div>
        <p style={{ fontSize: 20, fontWeight: 700, color: '#333', marginBottom: 8 }}>Your cart is empty!</p>
        <p style={{ color: '#888', marginBottom: 24 }}>Add some products to get started</p>
        <button onClick={() => navigate('/home')} style={s.shopBtn}>🛍️ Start Shopping</button>
      </div>
    </div>
  );

  return (
    <div style={s.container}>
      <h2 style={s.title}>🛒 Your Cart</h2>

      <div style={s.layout}>
        {/* Cart Items */}
        <div style={s.left}>
          {cart.map((item) => (
            <div key={item.id} style={s.item}>
              <div style={s.itemIcon}>{item.name[0]}</div>
              <div style={{ flex: 1 }}>
                <p style={s.name}>{item.name}</p>
                <p style={s.cat}>{item.category}</p>
                <p style={s.unitPrice}>₹{item.price} each</p>
              </div>
              <div style={s.right}>
                <div style={s.qtyBox}>
                  <button onClick={() => updateQty(item.id, item.quantity - 1)} style={s.qtyBtn}>−</button>
                  <span style={s.qty}>{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)} style={s.qtyBtn}>+</button>
                </div>
                <p style={s.price}>₹{(item.price * item.quantity).toFixed(2)}</p>
                <button onClick={() => updateQty(item.id, 0)} style={s.removeBtn}>🗑️</button>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Panel */}
        <div style={s.right2}>

          {/* Delivery Address */}
          <div style={s.panel}>
            <div style={s.panelTitle}>📍 Delivery Address</div>
            <button onClick={detectLocation} style={s.locBtn} disabled={locLoading}>
              {locLoading ? '📡 Detecting...' : '📡 Use Current Location'}
            </button>
            {locError && <p style={s.locError}>{locError}</p>}
            <input style={s.input} placeholder="Street / Area *" value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} />
            <input style={s.input} placeholder="City *" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} />
            <input style={s.input} placeholder="Pincode *" value={address.pincode} onChange={e => setAddress({ ...address, pincode: e.target.value })} />
          </div>

          {/* Payment Method */}
          <div style={s.panel}>
            <div style={s.panelTitle}>💳 Payment Method</div>
            <div style={s.payOptions}>
              <div onClick={() => setPaymentMethod('cod')} style={{ ...s.payOption, ...(paymentMethod === 'cod' ? s.payActive : {}) }}>
                <span style={{ fontSize: 24 }}>💵</span>
                <div>
                  <p style={s.payLabel}>Cash on Delivery</p>
                  <p style={s.payDesc}>Pay when delivered</p>
                </div>
                {paymentMethod === 'cod' && <span style={s.payCheck}>✓</span>}
              </div>
              <div onClick={() => setPaymentMethod('prepaid')} style={{ ...s.payOption, ...(paymentMethod === 'prepaid' ? s.payActive : {}) }}>
                <span style={{ fontSize: 24 }}>💳</span>
                <div>
                  <p style={s.payLabel}>Prepaid (Online)</p>
                  <p style={s.payDesc}>UPI / Card / Net Banking</p>
                </div>
                {paymentMethod === 'prepaid' && <span style={s.payCheck}>✓</span>}
              </div>
            </div>
            {paymentMethod === 'prepaid' && (
              <div style={s.prepaidNote}>
                🔒 Secure payment — Your order will be confirmed instantly after payment
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div style={s.panel}>
            <div style={s.panelTitle}>🧾 Order Summary</div>
            <div style={s.summaryRow}><span>Subtotal ({cart.length} items)</span><span>₹{total.toFixed(2)}</span></div>
            <div style={s.summaryRow}>
              <span>Delivery Fee</span>
              <span style={{ color: deliveryFee === 0 ? '#34a853' : '#e53935' }}>
                {deliveryFee === 0 ? '🎉 FREE' : `₹${deliveryFee}`}
              </span>
            </div>
            {deliveryFee > 0 && <p style={s.freeDeliveryHint}>Add ₹{(499 - total).toFixed(2)} more for free delivery</p>}
            <div style={s.divider} />
            <div style={{ ...s.summaryRow, fontWeight: 800, fontSize: 18, color: '#1a1a2e' }}>
              <span>Grand Total</span><span>₹{grandTotal.toFixed(2)}</span>
            </div>
            <p style={s.deliveryTime}>🚚 Estimated delivery within 4 hours</p>
            <button onClick={placeOrder} disabled={placing} style={s.orderBtn}>
              {placing ? '⏳ Placing Order...' : paymentMethod === 'prepaid' ? '💳 Pay & Place Order' : '✅ Place Order (COD)'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

const s = {
  container: { padding: '24px', maxWidth: '1100px', margin: '0 auto', fontFamily: "'Poppins', sans-serif" },
  title: { color: '#1a73e8', marginBottom: 24, fontSize: 26, fontWeight: 800 },
  layout: { display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' },
  left: { flex: 2, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 12 },
  right2: { flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 16 },
  emptyBox: { textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', maxWidth: 400, margin: '60px auto' },
  shopBtn: { background: 'linear-gradient(135deg,#1a73e8,#0d47a1)', color: 'white', border: 'none', padding: '13px 32px', borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 700 },
  item: { display: 'flex', alignItems: 'center', gap: 14, background: 'white', padding: '16px', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid rgba(26,115,232,0.08)' },
  itemIcon: { width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#e8f0fe,#c5d8ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#1a73e8', flexShrink: 0 },
  name: { fontWeight: 700, fontSize: 15, margin: 0, color: '#1a1a2e' },
  cat: { color: '#1a73e8', fontSize: 12, margin: '2px 0 0', fontWeight: 600 },
  unitPrice: { color: '#888', fontSize: 12, margin: '2px 0 0' },
  right: { display: 'flex', alignItems: 'center', gap: 14 },
  qtyBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#f0f4ff', borderRadius: 10, padding: '4px 8px' },
  qtyBtn: { background: '#1a73e8', color: 'white', border: 'none', width: 28, height: 28, borderRadius: 8, cursor: 'pointer', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qty: { fontSize: 15, fontWeight: 700, minWidth: 24, textAlign: 'center', color: '#1a1a2e' },
  price: { fontWeight: 800, color: '#e53935', fontSize: 16, margin: 0, minWidth: 70, textAlign: 'right' },
  removeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 },
  panel: { background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid rgba(26,115,232,0.08)' },
  panelTitle: { fontWeight: 800, fontSize: 15, color: '#1a1a2e', marginBottom: 14 },
  locBtn: { width: '100%', padding: '10px', background: 'linear-gradient(135deg,#34a853,#1e7e34)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, marginBottom: 10 },
  locError: { color: '#e53935', fontSize: 12, marginBottom: 8, background: '#fff3f3', padding: '8px 12px', borderRadius: 8 },
  input: { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid rgba(26,115,232,0.2)', fontSize: 13, fontFamily: "'Poppins',sans-serif", marginBottom: 8, outline: 'none', boxSizing: 'border-box' },
  payOptions: { display: 'flex', flexDirection: 'column', gap: 10 },
  payOption: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, border: '2px solid #e0e0e0', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' },
  payActive: { border: '2px solid #1a73e8', background: '#f0f7ff' },
  payLabel: { fontWeight: 700, fontSize: 14, margin: 0, color: '#1a1a2e' },
  payDesc: { fontSize: 11, color: '#888', margin: 0 },
  payCheck: { position: 'absolute', right: 14, color: '#1a73e8', fontWeight: 800, fontSize: 16 },
  prepaidNote: { marginTop: 10, background: '#e8f5e9', color: '#2e7d32', padding: '10px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#555', marginBottom: 8 },
  freeDeliveryHint: { fontSize: 11, color: '#ff6f00', marginBottom: 8, fontWeight: 600 },
  divider: { height: 1, background: '#f0f0f0', margin: '10px 0' },
  deliveryTime: { color: '#34a853', fontSize: 12, fontWeight: 600, margin: '10px 0' },
  orderBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg,#1a73e8,#0d47a1)', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 800, boxShadow: '0 4px 14px rgba(26,115,232,0.35)', marginTop: 4 },
};
