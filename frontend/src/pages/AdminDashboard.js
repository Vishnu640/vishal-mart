import { useEffect, useState } from 'react';
import { io } from 'socket.io-client'; // eslint-disable-line no-unused-vars
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ORDER_STEPS = ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered'];
const STEP_LABELS = { placed: '📦 Placed', confirmed: '✅ Confirmed', packed: '📫 Packed', out_for_delivery: '🚚 Out for Delivery', delivered: '🎉 Delivered', cancelled: '❌ Cancelled', return_requested: '↩️ Return Requested', returned: '✔️ Returned' };
const STEP_COLORS = { placed: '#1a73e8', confirmed: '#ff6f00', packed: '#9c27b0', out_for_delivery: '#00897b', delivered: '#34a853', cancelled: '#e53935', return_requested: '#f57c00', returned: '#607d8b' };
const NEXT_STEP = { placed: 'confirmed', confirmed: 'packed', packed: 'out_for_delivery', out_for_delivery: 'delivered' };
const NEXT_LABEL = { placed: '✅ Confirm Order', confirmed: '📫 Mark Packed', packed: '🚚 Out for Delivery', out_for_delivery: '🎉 Mark Delivered' };

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [filter, setFilter] = useState('all');
  const [newOrderIds, setNewOrderIds] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [toast, setToast] = useState('');
  const [coupons, setCoupons] = useState({});
  const [generatingCoupon, setGeneratingCoupon] = useState({});

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/home'); return; }
    fetchOrders();
    // Poll for new orders every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [user, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrders = () => {
    setLoading(true);
    API.get('/orders/all')
      .then(res => { setOrders(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const generateCoupon = async (orderId) => {
    setGeneratingCoupon(p => ({ ...p, [orderId]: true }));
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'VM';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    const order = orders.find(o => o.id === orderId);
    const discount = Math.round((order?.totalAmount || 0) * 0.05);
    setCoupons(p => ({ ...p, [orderId]: { code, discount } }));
    setGeneratingCoupon(p => ({ ...p, [orderId]: false }));
    showToast(`🎟️ Coupon ${code} generated! ₹${discount} off next order`);
  };

  const copyCoupon = (code) => { navigator.clipboard.writeText(code); showToast(`📋 Coupon ${code} copied!`); };

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(p => ({ ...p, [orderId]: true }));
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setNewOrderIds(prev => prev.filter(id => id !== orderId));
      showToast(`✅ Order #${orderId} updated to "${STEP_LABELS[newStatus]}"`);
    } catch (err) { showToast('❌ Failed to update order.'); }
    setUpdating(p => ({ ...p, [orderId]: false }));
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    if (filter === 'new') return o.status === 'placed';
    if (filter === 'active') return ['confirmed', 'packed', 'out_for_delivery'].includes(o.status);
    if (filter === 'done') return ['delivered', 'cancelled', 'returned', 'return_requested'].includes(o.status);
    return true;
  });

  const counts = {
    all: orders.length,
    new: orders.filter(o => o.status === 'placed').length,
    active: orders.filter(o => ['confirmed', 'packed', 'out_for_delivery'].includes(o.status)).length,
    done: orders.filter(o => ['delivered', 'cancelled', 'returned', 'return_requested'].includes(o.status)).length,
  };

  const PROFIT_MARGIN_COD = 0.15;   // 15% profit on COD
  const PROFIT_MARGIN_PREPAID = 0.22; // 22% profit on Prepaid

  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const codOrders = deliveredOrders.filter(o => o.paymentMethod === 'cod');
  const prepaidOrders = deliveredOrders.filter(o => o.paymentMethod === 'prepaid');
  const codRevenue = codOrders.reduce((s, o) => s + o.totalAmount, 0);
  const prepaidRevenue = prepaidOrders.reduce((s, o) => s + o.totalAmount, 0);
  const codProfit = Math.round(codRevenue * PROFIT_MARGIN_COD);
  const prepaidProfit = Math.round(prepaidRevenue * PROFIT_MARGIN_PREPAID);
  const totalRevenue = codRevenue + prepaidRevenue;
  const totalProfit = codProfit + prepaidProfit;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 48, height: 48, border: '4px solid rgba(26,115,232,0.2)', borderTopColor: '#1a73e8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#1a73e8', fontWeight: 600 }}>Loading orders...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );

  return (
    <div style={s.page}>
      {toast && <div style={s.toast}>{toast}</div>}

      <div style={s.container}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h2 style={s.title}>🏪 Admin Dashboard</h2>
            <p style={s.subtitle}>Manage and confirm customer orders</p>
          </div>
          <button onClick={fetchOrders} style={s.refreshBtn}>🔄 Refresh</button>
        </div>

        {/* Stats */}
        <div style={s.statsRow}>
          <div style={{ ...s.statCard, borderLeft: '4px solid #1a73e8' }}>
            <p style={s.statNum}>{counts.all}</p>
            <p style={s.statLabel}>📋 Total Orders</p>
          </div>
          <div style={{ ...s.statCard, borderLeft: '4px solid #ff6f00' }}>
            <p style={{ ...s.statNum, color: '#ff6f00' }}>{counts.new}</p>
            <p style={s.statLabel}>🔔 New Orders</p>
          </div>
          <div style={{ ...s.statCard, borderLeft: '4px solid #34a853' }}>
            <p style={{ ...s.statNum, color: '#34a853' }}>₹{totalRevenue.toLocaleString()}</p>
            <p style={s.statLabel}>💰 Total Revenue</p>
          </div>
          <div style={{ ...s.statCard, borderLeft: '4px solid #9c27b0' }}>
            <p style={{ ...s.statNum, color: '#9c27b0' }}>₹{totalProfit.toLocaleString()}</p>
            <p style={s.statLabel}>📈 Total Profit</p>
          </div>
        </div>

        {/* Profit Breakdown */}
        <div style={s.profitRow}>
          <div style={s.profitCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: '#e65100' }}>💵 Cash on Delivery</p>
              <span style={{ fontSize: 11, background: '#fff3e0', color: '#e65100', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>{codOrders.length} orders</span>
            </div>
            <div style={s.profitStat}><span style={s.profitLabel}>Revenue</span><span style={{ fontWeight: 800, color: '#e65100', fontSize: 16 }}>₹{codRevenue.toLocaleString()}</span></div>
            <div style={s.profitStat}><span style={s.profitLabel}>Profit (15%)</span><span style={{ fontWeight: 800, color: '#34a853', fontSize: 16 }}>₹{codProfit.toLocaleString()}</span></div>
            <div style={{ height: 6, background: '#f5f5f5', borderRadius: 4, marginTop: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: totalRevenue ? `${(codRevenue / totalRevenue) * 100}%` : '0%', background: 'linear-gradient(135deg,#ff6f00,#e65100)', borderRadius: 4 }} />
            </div>
            <p style={{ fontSize: 11, color: '#888', margin: '4px 0 0' }}>{totalRevenue ? Math.round((codRevenue / totalRevenue) * 100) : 0}% of total revenue</p>
          </div>

          <div style={{ ...s.profitCard, borderLeft: '4px solid #1a73e8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: '#1a73e8' }}>💳 Prepaid Orders</p>
              <span style={{ fontSize: 11, background: '#e8f0fe', color: '#1a73e8', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>{prepaidOrders.length} orders</span>
            </div>
            <div style={s.profitStat}><span style={s.profitLabel}>Revenue</span><span style={{ fontWeight: 800, color: '#1a73e8', fontSize: 16 }}>₹{prepaidRevenue.toLocaleString()}</span></div>
            <div style={s.profitStat}><span style={s.profitLabel}>Profit (22%)</span><span style={{ fontWeight: 800, color: '#34a853', fontSize: 16 }}>₹{prepaidProfit.toLocaleString()}</span></div>
            <div style={{ height: 6, background: '#f5f5f5', borderRadius: 4, marginTop: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: totalRevenue ? `${(prepaidRevenue / totalRevenue) * 100}%` : '0%', background: 'linear-gradient(135deg,#1a73e8,#0d47a1)', borderRadius: 4 }} />
            </div>
            <p style={{ fontSize: 11, color: '#888', margin: '4px 0 0' }}>{totalRevenue ? Math.round((prepaidRevenue / totalRevenue) * 100) : 0}% of total revenue</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={s.tabs}>
          {[['all', '📋 All'], ['new', '🔔 New'], ['active', '⚡ Active'], ['done', '✅ Done']].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} style={{ ...s.tab, ...(filter === key ? s.tabActive : {}) }}>
              {label} <span style={s.tabCount}>{counts[key]}</span>
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div style={s.emptyBox}>
            <div style={{ fontSize: 56 }}>📭</div>
            <p style={{ fontWeight: 700, color: '#555', marginTop: 12 }}>No orders in this category</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const isNew = newOrderIds.includes(order.id) || order.status === 'placed';
            const isExpanded = expandedOrder === order.id;
            const nextStatus = NEXT_STEP[order.status];
            const currentStepIdx = ORDER_STEPS.indexOf(order.status);
            const isActive = ['placed', 'confirmed', 'packed', 'out_for_delivery'].includes(order.status);

            return (
              <div key={order.id} style={{ ...s.card, ...(isNew && order.status === 'placed' ? s.cardNew : {}) }}>
                {isNew && order.status === 'placed' && (
                  <div style={s.newBadge}>🔔 NEW ORDER</div>
                )}

                {/* Card Header */}
                <div style={s.cardHeader} onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ ...s.orderIcon, background: STEP_COLORS[order.status] + '22' }}>
                      <span style={{ fontSize: 20 }}>{STEP_LABELS[order.status]?.split(' ')[0]}</span>
                    </div>
                    <div>
                      <p style={s.orderId}>Order #{order.id}</p>
                      <p style={s.customerName}>👤 {order.User?.name || 'Customer'} — {order.User?.email || ''}</p>
                      <p style={s.orderDate}>{new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <p style={s.amount}>₹{order.totalAmount}</p>
                    <span style={{ ...s.statusBadge, background: STEP_COLORS[order.status] || '#888' }}>
                      {STEP_LABELS[order.status] || order.status}
                    </span>
                    <span style={{ ...s.payBadge, color: order.paymentMethod === 'prepaid' ? '#1a73e8' : '#ff6f00' }}>
                      {order.paymentMethod === 'prepaid' ? '💳 Prepaid' : '💵 COD'}
                    </span>
                  </div>
                  <span style={s.expandIcon}>{isExpanded ? '▲' : '▼'}</span>
                </div>

                {/* Step Progress Bar */}
                {isActive && (
                  <div style={s.progressWrap}>
                    {ORDER_STEPS.slice(0, 5).map((step, i) => (
                      <div key={step} style={s.progressStep}>
                        {i > 0 && <div style={{ ...s.progressLine, background: i <= currentStepIdx ? STEP_COLORS[order.status] : '#e0e0e0' }} />}
                        <div style={{ ...s.progressDot, background: i <= currentStepIdx ? STEP_COLORS[order.status] : '#e0e0e0', transform: i === currentStepIdx ? 'scale(1.3)' : 'scale(1)' }} />
                        <p style={{ ...s.progressLabel, color: i <= currentStepIdx ? STEP_COLORS[order.status] : '#bbb', fontWeight: i === currentStepIdx ? 800 : 500 }}>
                          {['Placed', 'Confirmed', 'Packed', 'Delivery', 'Done'][i]}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Confirm / Next Step Button */}
                {nextStatus && (
                  <div style={s.actionRow}>
                    <button
                      onClick={() => updateStatus(order.id, nextStatus)}
                      disabled={updating[order.id]}
                      style={{ ...s.confirmBtn, background: `linear-gradient(135deg, ${STEP_COLORS[nextStatus]}, ${STEP_COLORS[nextStatus]}cc)` }}
                    >
                      {updating[order.id] ? '⏳ Updating...' : NEXT_LABEL[order.status]}
                    </button>
                    {order.status === 'placed' && (
                      <button onClick={() => updateStatus(order.id, 'cancelled')} disabled={updating[order.id]} style={s.rejectBtn}>
                        ❌ Reject Order
                      </button>
                    )}
                  </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={s.expandedSection}>
                    {/* Customer Info */}
                    <div style={s.detailBox}>
                      <p style={s.detailTitle}>👤 Customer Details</p>
                      <div style={s.detailGrid}>
                        <div style={s.detailItem}><span style={s.detailLabel}>Name</span><span style={s.detailValue}>{order.User?.name || '—'}</span></div>
                        <div style={s.detailItem}><span style={s.detailLabel}>Email</span><span style={s.detailValue}>{order.User?.email || '—'}</span></div>
                        <div style={s.detailItem}><span style={s.detailLabel}>City</span><span style={s.detailValue}>{order.city || '—'}</span></div>
                        <div style={s.detailItem}><span style={s.detailLabel}>Pincode</span><span style={s.detailValue}>{order.pincode || '—'}</span></div>
                      </div>
                      {order.street && <p style={{ fontSize: 13, color: '#555', marginTop: 8 }}>📍 {order.street}</p>}
                    </div>

                    {/* Payment Info */}
                    <div style={s.detailBox}>
                      <p style={s.detailTitle}>💳 Payment Details</p>
                      <div style={s.detailGrid}>
                        <div style={s.detailItem}><span style={s.detailLabel}>Method</span><span style={{ ...s.detailValue, fontWeight: 700, color: order.paymentMethod === 'prepaid' ? '#1a73e8' : '#ff6f00' }}>{order.paymentMethod === 'prepaid' ? '💳 Prepaid' : '💵 Cash on Delivery'}</span></div>
                        <div style={s.detailItem}><span style={s.detailLabel}>Status</span><span style={{ ...s.detailValue, fontWeight: 700, color: order.paymentStatus === 'paid' ? '#34a853' : '#e53935' }}>{order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}</span></div>
                        <div style={s.detailItem}><span style={s.detailLabel}>Total</span><span style={{ ...s.detailValue, fontWeight: 800, color: '#e53935', fontSize: 16 }}>₹{order.totalAmount}</span></div>
                        <div style={s.detailItem}><span style={s.detailLabel}>Order ID</span><span style={s.detailValue}>#{order.id}</span></div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div style={s.detailBox}>
                      <p style={s.detailTitle}>🛍️ Ordered Items</p>
                      {order.items?.map((item, i) => (
                        <div key={i} style={s.itemRow}>
                          <span style={s.itemNum}>{i + 1}</span>
                          <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>Product #{item.product}</span>
                          <span style={{ fontSize: 13, color: '#666' }}>Qty: {item.quantity}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#e53935' }}>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Coupon Section - Prepaid Only */}
                    {order.paymentMethod === 'prepaid' && order.status === 'delivered' && (
                      <div style={{ ...s.detailBox, background: '#e8f5e9', border: '1px solid #c8e6c9' }}>
                        <p style={{ ...s.detailTitle, color: '#2e7d32' }}>🎟️ Coupon for Next Order</p>
                        {coupons[order.id] ? (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', borderRadius: 12, padding: '12px 16px', border: '2px dashed #34a853' }}>
                              <span style={{ fontSize: 22 }}>🎟️</span>
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: '#1a73e8', letterSpacing: 2 }}>{coupons[order.id].code}</p>
                                <p style={{ margin: 0, fontSize: 12, color: '#34a853', fontWeight: 700 }}>₹{coupons[order.id].discount} off on next order (5% discount)</p>
                              </div>
                              <button onClick={() => copyCoupon(coupons[order.id].code)} style={{ padding: '7px 14px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>📋 Copy</button>
                            </div>
                            <p style={{ fontSize: 11, color: '#888', margin: '6px 0 0' }}>Valid for 30 days. Share with customer via email/SMS.</p>
                          </div>
                        ) : (
                          <div>
                            <p style={{ fontSize: 13, color: '#555', margin: '0 0 10px' }}>Generate a 5% discount coupon for this prepaid customer as a reward!</p>
                            <button onClick={() => generateCoupon(order.id)} disabled={generatingCoupon[order.id]} style={{ padding: '9px 20px', background: 'linear-gradient(135deg,#34a853,#1e7e34)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                              {generatingCoupon[order.id] ? '⏳ Generating...' : '✨ Generate Coupon'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Return Request */}
                    {order.status === 'return_requested' && (
                      <div style={{ ...s.detailBox, background: '#fff3e0', border: '1px solid #ffcc80' }}>
                        <p style={{ ...s.detailTitle, color: '#e65100' }}>↩️ Return Requested</p>
                        <p style={{ fontSize: 13, color: '#555', margin: 0 }}>Customer has requested a return. Please contact them within 24 hours.</p>
                        <button onClick={() => updateStatus(order.id, 'returned')} style={{ ...s.confirmBtn, marginTop: 12, background: 'linear-gradient(135deg,#607d8b,#455a64)' }}>
                          ✔️ Mark as Returned
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(160deg,#e8f5e9 0%,#f1f8e9 30%,#e0f7fa 60%,#e8f0fe 100%)', backgroundAttachment: 'fixed' },
  container: { padding: '24px', maxWidth: '960px', margin: '0 auto', fontFamily: "'Poppins',sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { color: '#1a73e8', fontSize: 26, fontWeight: 800, margin: 0 },
  subtitle: { color: '#888', fontSize: 13, margin: '4px 0 0' },
  refreshBtn: { background: 'linear-gradient(135deg,#1a73e8,#0d47a1)', color: 'white', border: 'none', padding: '9px 20px', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 700 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14, marginBottom: 20 },
  statCard: { background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(10px)', borderRadius: 14, padding: '16px 18px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  statNum: { fontSize: 26, fontWeight: 800, color: '#1a73e8', margin: 0 },
  statLabel: { fontSize: 12, color: '#888', margin: '4px 0 0', fontWeight: 600 },
  tabs: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  tab: { padding: '8px 18px', borderRadius: 20, border: '2px solid #e0e0e0', background: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#555', display: 'flex', alignItems: 'center', gap: 6 },
  tabActive: { background: 'linear-gradient(135deg,#1a73e8,#0d47a1)', color: 'white', border: '2px solid transparent' },
  tabCount: { background: 'rgba(255,255,255,0.3)', borderRadius: 10, padding: '1px 7px', fontSize: 11 },
  emptyBox: { textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.7)', borderRadius: 20 },
  card: { background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)', borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid rgba(26,115,232,0.1)', position: 'relative', overflow: 'hidden' },
  cardNew: { border: '2px solid #ff6f00', boxShadow: '0 4px 24px rgba(255,111,0,0.2)' },
  newBadge: { position: 'absolute', top: 0, right: 0, background: 'linear-gradient(135deg,#ff6f00,#e65100)', color: 'white', fontSize: 10, fontWeight: 800, padding: '4px 14px', borderRadius: '0 20px 0 12px', letterSpacing: '0.5px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', gap: 10, marginBottom: 12 },
  orderIcon: { width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  orderId: { fontWeight: 800, fontSize: 16, color: '#1a1a2e', margin: 0 },
  customerName: { fontSize: 13, color: '#1a73e8', fontWeight: 600, margin: '2px 0' },
  orderDate: { fontSize: 11, color: '#888', margin: 0 },
  amount: { fontWeight: 800, fontSize: 18, color: '#e53935', margin: 0 },
  statusBadge: { display: 'inline-block', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 },
  payBadge: { fontSize: 12, fontWeight: 700, background: '#f0f4ff', padding: '3px 10px', borderRadius: 20 },
  expandIcon: { fontSize: 12, color: '#888', alignSelf: 'center', flexShrink: 0 },
  progressWrap: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 4px 12px', overflowX: 'auto' },
  progressStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', minWidth: 50 },
  progressLine: { position: 'absolute', right: '50%', top: 7, width: '100%', height: 3, zIndex: 0 },
  progressDot: { width: 16, height: 16, borderRadius: '50%', zIndex: 1, position: 'relative', transition: 'all 0.3s' },
  progressLabel: { fontSize: 9, marginTop: 5, textAlign: 'center' },
  actionRow: { display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 },
  confirmBtn: { padding: '10px 22px', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' },
  rejectBtn: { padding: '10px 22px', background: 'linear-gradient(135deg,#e53935,#b71c1c)', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700 },
  expandedSection: { borderTop: '1px solid #f0f0f0', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 },
  detailBox: { background: '#f8faff', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(26,115,232,0.08)' },
  detailTitle: { fontWeight: 800, fontSize: 14, color: '#1a73e8', margin: '0 0 10px' },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  detailItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  detailLabel: { fontSize: 10, color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
  detailValue: { fontSize: 13, color: '#333' },
  itemRow: { display: 'flex', alignItems: 'center', gap: 10, background: 'white', padding: '8px 12px', borderRadius: 10, border: '1px solid #f0f0f0', marginBottom: 6 },
  itemNum: { width: 22, height: 22, borderRadius: '50%', background: '#1a73e8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 },
  toast: { position: 'fixed', top: 20, right: 20, background: 'linear-gradient(135deg,#34a853,#1e7e34)', color: 'white', padding: '14px 24px', borderRadius: 14, fontWeight: 700, fontSize: 14, zIndex: 9999, boxShadow: '0 8px 25px rgba(52,168,83,0.4)', fontFamily: 'Poppins' },
  profitRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 },
  profitCard: { background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: '16px 18px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderLeft: '4px solid #ff6f00' },
  profitStat: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  profitLabel: { fontSize: 12, color: '#888', fontWeight: 600 },
};
