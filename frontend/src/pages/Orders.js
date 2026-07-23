import { useEffect, useState } from 'react';
import { io } from 'socket.io-client'; // eslint-disable-line no-unused-vars
import API from '../api/axios';

const steps = ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered'];
const stepIcons = ['📦', '✅', '📫', '🚚', '🎉'];
const stepLabels = ['Placed', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered'];

const statusColors = {
  placed: '#1a73e8', confirmed: '#ff6f00', packed: '#9c27b0',
  out_for_delivery: '#00897b', delivered: '#34a853',
  cancelled: '#e53935', return_requested: '#f57c00', returned: '#607d8b',
};

const statusLabels = {
  placed: '📦 Placed', confirmed: '✅ Confirmed', packed: '📫 Packed',
  out_for_delivery: '🚚 Out for Delivery', delivered: '🎉 Delivered',
  cancelled: '❌ Cancelled', return_requested: '↩️ Return Requested', returned: '✔️ Returned',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [returnReason, setReturnReason] = useState({});
  const [showReturnForm, setShowReturnForm] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(null);
  const [upiId, setUpiId] = useState('');
  const [payStep, setPayStep] = useState(1);
  const [payLoading, setPayLoading] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    API.get('/orders/my')
      .then((res) => { setOrders(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    // Poll for order updates every 15 seconds
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const cancelOrder = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    setActionLoading((p) => ({ ...p, [id]: 'cancel' }));
    try {
      await API.put(`/orders/${id}/cancel`);
      setStatuses((p) => ({ ...p, [id]: 'cancelled' }));
      fetchOrders();
    } catch (err) { alert(err.response?.data?.message || 'Could not cancel.'); }
    setActionLoading((p) => ({ ...p, [id]: null }));
  };

  const returnOrder = async (id) => {
    const reason = returnReason[id] || '';
    if (!reason) return alert('Please select a return reason.');
    setActionLoading((p) => ({ ...p, [id]: 'return' }));
    try {
      await API.put(`/orders/${id}/return`, { reason });
      setStatuses((p) => ({ ...p, [id]: 'return_requested' }));
      setShowReturnForm((p) => ({ ...p, [id]: false }));
      fetchOrders();
    } catch (err) { alert(err.response?.data?.message || 'Could not request return.'); }
    setActionLoading((p) => ({ ...p, [id]: null }));
  };

  const handlePrepaidPayment = async (orderId) => {
    if (payStep === 1) { setPayStep(2); return; }
    if (!upiId.trim()) return alert('Enter UPI ID or card details.');
    setPayLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setPayStep(3);
    setPayLoading(false);
    setTimeout(() => { setShowPaymentModal(null); setPayStep(1); setUpiId(''); fetchOrders(); }, 2500);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80, flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 48, height: 48, border: '4px solid rgba(26,115,232,0.2)', borderTopColor: '#1a73e8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#1a73e8', fontWeight: 600, fontFamily: 'Poppins' }}>Loading your orders...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.container}>
        <h2 style={s.title}>📦 My Orders</h2>

        {orders.length === 0 ? (
          <div style={s.emptyBox}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>📭</div>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#333' }}>No orders yet!</p>
            <p style={{ color: '#888' }}>Start shopping to see your orders here 🛒</p>
          </div>
        ) : (
          orders.map((order) => {
            const currentStatus = statuses[order.id] || order.status;
            const currentStep = steps.indexOf(currentStatus);
            const isCancelled = currentStatus === 'cancelled';
            const isReturnRequested = currentStatus === 'return_requested' || currentStatus === 'returned';
            const canCancel = ['placed', 'confirmed'].includes(currentStatus);
            const canReturn = currentStatus === 'delivered';
            const isExpanded = expandedOrder === order.id;
            const isPrepaidPending = order.paymentMethod === 'prepaid' && order.paymentStatus === 'pending';

            return (
              <div key={order.id} style={s.card}>

                {/* Prepaid Payment Alert */}
                {isPrepaidPending && (
                  <div style={s.payAlert}>
                    <span>⚠️ Payment pending for this order!</span>
                    <button onClick={() => { setShowPaymentModal(order.id); setPayStep(1); }} style={s.payNowBtn}>
                      💳 Pay Now
                    </button>
                  </div>
                )}

                {/* Card Header */}
                <div style={s.cardHeader} onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                  <div>
                    <p style={s.orderId}>Order #{order.id}</p>
                    <p style={s.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <p style={s.amount}>₹{order.totalAmount}</p>
                    <span style={{ ...s.statusBadge, background: statusColors[currentStatus] || '#888' }}>
                      {statusLabels[currentStatus] || currentStatus}
                    </span>
                  </div>
                  <span style={s.expandIcon}>{isExpanded ? '▲' : '▼'}</span>
                </div>

                {/* Step Tracker (always visible) */}
                {!isCancelled && !isReturnRequested && (
                  <div style={s.tracker}>
                    {steps.map((step, i) => (
                      <div key={step} style={s.stepWrap}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          {i > 0 && <div style={{ ...s.line, background: i <= currentStep ? '#1a73e8' : '#e0e0e0' }} />}
                          <div style={{ ...s.circle, background: i <= currentStep ? '#1a73e8' : '#e8f0fe', color: i <= currentStep ? 'white' : '#bbb', boxShadow: i === currentStep ? '0 0 0 4px rgba(26,115,232,0.2)' : 'none' }}>
                            {i <= currentStep ? stepIcons[i] : i + 1}
                          </div>
                        </div>
                        <p style={{ ...s.stepLabel, color: i <= currentStep ? '#1a73e8' : '#bbb', fontWeight: i === currentStep ? 800 : 600 }}>
                          {stepLabels[i]}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {isCancelled && <div style={s.cancelledBanner}>❌ This order has been cancelled.</div>}
                {isReturnRequested && (
                  <div style={{ ...s.cancelledBanner, background: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80' }}>
                    ↩️ Return requested. Our team will contact you within 24 hours.
                  </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={s.expandedSection}>

                    {/* Payment Details */}
                    <div style={s.detailBox}>
                      <p style={s.detailTitle}>💳 Payment Details</p>
                      <div style={s.detailGrid}>
                        <div style={s.detailItem}>
                          <span style={s.detailLabel}>Method</span>
                          <span style={{ ...s.detailValue, color: order.paymentMethod === 'prepaid' ? '#1a73e8' : '#ff6f00', fontWeight: 700 }}>
                            {order.paymentMethod === 'prepaid' ? '💳 Prepaid (Online)' : '💵 Cash on Delivery'}
                          </span>
                        </div>
                        <div style={s.detailItem}>
                          <span style={s.detailLabel}>Status</span>
                          <span style={{ ...s.detailValue, color: order.paymentStatus === 'paid' ? '#34a853' : '#e53935', fontWeight: 700 }}>
                            {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                          </span>
                        </div>
                        <div style={s.detailItem}>
                          <span style={s.detailLabel}>Amount</span>
                          <span style={{ ...s.detailValue, fontWeight: 800, color: '#e53935' }}>₹{order.totalAmount}</span>
                        </div>
                        <div style={s.detailItem}>
                          <span style={s.detailLabel}>Order Date</span>
                          <span style={s.detailValue}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    {order.city && (
                      <div style={s.detailBox}>
                        <p style={s.detailTitle}>📍 Delivery Address</p>
                        <p style={{ margin: 0, fontSize: 14, color: '#444', lineHeight: 1.7 }}>
                          {order.street && <>{order.street}<br /></>}
                          {order.city}{order.pincode ? ` - ${order.pincode}` : ''}
                        </p>
                      </div>
                    )}

                    {/* Order Items */}
                    <div style={s.detailBox}>
                      <p style={s.detailTitle}>🛍️ Order Items</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {order.items?.map((item, i) => (
                          <div key={i} style={s.itemRow}>
                            <span style={s.itemNum}>{i + 1}</span>
                            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>Item #{item.product}</span>
                            <span style={{ fontSize: 13, color: '#666' }}>Qty: {item.quantity}</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#e53935' }}>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ETA */}
                    {!isCancelled && currentStatus !== 'delivered' && !isReturnRequested && order.estimatedDelivery && (
                      <div style={s.etaBox}>
                        <span>🕐 Estimated Delivery:</span>
                        <strong>{new Date(order.estimatedDelivery).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} — {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</strong>
                      </div>
                    )}

                    {/* Return Form */}
                    {canReturn && showReturnForm[order.id] && (
                      <div style={s.detailBox}>
                        <p style={s.detailTitle}>↩️ Return Reason</p>
                        {['Damaged product', 'Wrong item delivered', 'Product not as described', 'Changed my mind', 'Other'].map(reason => (
                          <label key={reason} style={s.radioLabel}>
                            <input type="radio" name={`reason-${order.id}`} value={reason}
                              checked={returnReason[order.id] === reason}
                              onChange={() => setReturnReason(p => ({ ...p, [order.id]: reason }))}
                              style={{ marginRight: 8 }} />
                            {reason}
                          </label>
                        ))}
                        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                          <button onClick={() => returnOrder(order.id)} disabled={actionLoading[order.id] === 'return'} style={s.returnBtn}>
                            {actionLoading[order.id] === 'return' ? '⏳ Submitting...' : '✅ Submit Return'}
                          </button>
                          <button onClick={() => setShowReturnForm(p => ({ ...p, [order.id]: false }))} style={s.cancelBtn}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={s.actions}>
                      {canCancel && (
                        <button onClick={() => cancelOrder(order.id)} disabled={actionLoading[order.id] === 'cancel'} style={s.cancelBtn}>
                          {actionLoading[order.id] === 'cancel' ? '⏳ Cancelling...' : '❌ Cancel Order'}
                        </button>
                      )}
                      {canReturn && !showReturnForm[order.id] && !isReturnRequested && (
                        <button onClick={() => setShowReturnForm(p => ({ ...p, [order.id]: true }))} style={s.returnBtn}>
                          ↩️ Return Product
                        </button>
                      )}
                      {isPrepaidPending && (
                        <button onClick={() => { setShowPaymentModal(order.id); setPayStep(1); }} style={s.payNowBtnLg}>
                          💳 Complete Payment
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div style={s.modalOverlay} onClick={() => { setShowPaymentModal(null); setPayStep(1); setUpiId(''); }}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            {payStep === 1 && (
              <>
                <p style={s.modalTitle}>💳 Complete Payment</p>
                <p style={s.modalSub}>Order #{showPaymentModal}</p>
                <div style={s.payMethodGrid}>
                  {[{ icon: '📱', label: 'UPI' }, { icon: '💳', label: 'Credit/Debit Card' }, { icon: '🏦', label: 'Net Banking' }, { icon: '💰', label: 'Wallet' }].map(m => (
                    <div key={m.label} style={s.payMethodCard} onClick={() => setPayStep(2)}>
                      <span style={{ fontSize: 28 }}>{m.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#333' }}>{m.label}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setShowPaymentModal(null); setPayStep(1); }} style={s.modalClose}>Close</button>
              </>
            )}
            {payStep === 2 && (
              <>
                <p style={s.modalTitle}>📱 Enter UPI ID</p>
                <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" style={s.modalInput} />
                <div style={s.modalAmountBox}>
                  <span style={{ color: '#666', fontSize: 14 }}>Amount to Pay</span>
                  <span style={{ fontWeight: 800, fontSize: 22, color: '#1a73e8' }}>
                    ₹{orders.find(o => o.id === showPaymentModal)?.totalAmount}
                  </span>
                </div>
                <button onClick={() => handlePrepaidPayment(showPaymentModal)} disabled={payLoading} style={s.payConfirmBtn}>
                  {payLoading ? '⏳ Processing...' : '🔒 Pay Securely'}
                </button>
                <button onClick={() => setPayStep(1)} style={s.modalClose}>← Back</button>
              </>
            )}
            {payStep === 3 && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 64, marginBottom: 12 }}>✅</div>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#34a853', marginBottom: 8 }}>Payment Successful!</p>
                <p style={{ color: '#666', fontSize: 14 }}>Your order is confirmed. Redirecting...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(160deg,#e8f5e9 0%,#f1f8e9 30%,#e0f7fa 60%,#e8f0fe 100%)', backgroundAttachment: 'fixed' },
  container: { padding: '24px', maxWidth: '860px', margin: '0 auto', fontFamily: "'Poppins', sans-serif" },
  title: { color: '#1a73e8', marginBottom: 24, fontSize: 26, fontWeight: 800 },
  emptyBox: { textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.8)', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
  card: { background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)', borderRadius: 20, padding: 20, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid rgba(26,115,232,0.1)' },
  payAlert: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff3e0', border: '1px solid #ffcc80', borderRadius: 12, padding: '10px 16px', marginBottom: 14, fontSize: 13, fontWeight: 600, color: '#e65100' },
  payNowBtn: { background: 'linear-gradient(135deg,#1a73e8,#0d47a1)', color: 'white', border: 'none', padding: '7px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700 },
  payNowBtnLg: { background: 'linear-gradient(135deg,#1a73e8,#0d47a1)', color: 'white', border: 'none', padding: '10px 22px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, boxShadow: '0 4px 14px rgba(26,115,232,0.3)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, cursor: 'pointer', gap: 10 },
  orderId: { fontWeight: 800, fontSize: 16, color: '#1a1a2e', margin: 0 },
  orderDate: { fontSize: 12, color: '#888', margin: '3px 0 0' },
  amount: { fontWeight: 800, fontSize: 18, color: '#e53935', margin: 0 },
  statusBadge: { display: 'inline-block', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 },
  expandIcon: { fontSize: 12, color: '#888', alignSelf: 'center', flexShrink: 0 },
  tracker: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, padding: '12px 0', overflowX: 'auto' },
  stepWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 60 },
  line: { position: 'absolute', right: '50%', width: '100%', height: 3, top: '50%', transform: 'translateY(-50%)', zIndex: 0 },
  circle: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, zIndex: 1, position: 'relative', transition: 'all 0.3s' },
  stepLabel: { fontSize: 10, textAlign: 'center', marginTop: 6, textTransform: 'capitalize' },
  cancelledBanner: { background: '#fff3f3', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600, marginBottom: 12 },
  expandedSection: { borderTop: '1px solid #f0f0f0', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 },
  detailBox: { background: '#f8faff', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(26,115,232,0.08)' },
  detailTitle: { fontWeight: 800, fontSize: 14, color: '#1a73e8', margin: '0 0 12px' },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  detailItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  detailLabel: { fontSize: 11, color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
  detailValue: { fontSize: 13, color: '#333' },
  itemRow: { display: 'flex', alignItems: 'center', gap: 10, background: 'white', padding: '8px 12px', borderRadius: 10, border: '1px solid #f0f0f0' },
  itemNum: { width: 22, height: 22, borderRadius: '50%', background: '#1a73e8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 },
  etaBox: { display: 'flex', gap: 10, alignItems: 'center', background: '#e8f5e9', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#2e7d32', fontWeight: 600 },
  radioLabel: { display: 'flex', alignItems: 'center', fontSize: 13, color: '#444', marginBottom: 8, cursor: 'pointer' },
  actions: { display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 4 },
  cancelBtn: { padding: '9px 20px', background: 'linear-gradient(135deg,#e53935,#b71c1c)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700 },
  returnBtn: { padding: '9px 20px', background: 'linear-gradient(135deg,#ff6f00,#e65100)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal: { background: 'white', borderRadius: 24, padding: 28, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalTitle: { fontWeight: 800, fontSize: 20, color: '#1a1a2e', margin: '0 0 4px' },
  modalSub: { color: '#888', fontSize: 13, margin: '0 0 20px' },
  payMethodGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 },
  payMethodCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '16px 10px', borderRadius: 14, border: '2px solid #e8f0fe', cursor: 'pointer', transition: 'all 0.2s', background: '#f8faff' },
  modalInput: { width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid #e8f0fe', fontSize: 14, fontFamily: 'Poppins', outline: 'none', marginBottom: 14, boxSizing: 'border-box' },
  modalAmountBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0f7ff', borderRadius: 12, padding: '12px 16px', marginBottom: 16 },
  payConfirmBtn: { width: '100%', padding: '13px', background: 'linear-gradient(135deg,#34a853,#1e7e34)', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 800, marginBottom: 10, boxShadow: '0 4px 14px rgba(52,168,83,0.35)' },
  modalClose: { width: '100%', padding: '10px', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
};
