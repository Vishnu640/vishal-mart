const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Shared layout wrapper ──────────────────────────────────────────────────────
const layout = (title, bodyHtml) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0d47a1,#1a73e8);padding:28px 40px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:26px;letter-spacing:1px;">🛒 Vishal Mart</h1>
            <p style="margin:4px 0 0;color:#bbdefb;font-size:13px;">Your Trusted Grocery Partner</p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px;">${bodyHtml}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #e9ecef;">
            <p style="margin:0;color:#6c757d;font-size:12px;">© ${new Date().getFullYear()} Vishal Mart. All rights reserved.</p>
            <p style="margin:4px 0 0;color:#6c757d;font-size:12px;">📧 support@vishalmart.com</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ── Status badge helper ────────────────────────────────────────────────────────
const statusBadge = (status) => {
  const map = {
    placed:           { color: '#1a73e8', bg: '#e8f0fe', label: '📦 Order Placed' },
    confirmed:        { color: '#0d47a1', bg: '#e3f2fd', label: '✅ Confirmed' },
    packed:           { color: '#f57c00', bg: '#fff3e0', label: '📦 Packed' },
    shipped:          { color: '#7b1fa2', bg: '#f3e5f5', label: '🚚 Shipped' },
    out_for_delivery: { color: '#e65100', bg: '#fbe9e7', label: '🛵 Out for Delivery' },
    delivered:        { color: '#2e7d32', bg: '#e8f5e9', label: '✅ Delivered' },
    cancelled:        { color: '#c62828', bg: '#ffebee', label: '❌ Cancelled' },
  };
  const s = map[status] || { color: '#555', bg: '#eee', label: status };
  return `<span style="background:${s.bg};color:${s.color};padding:6px 14px;border-radius:20px;font-size:13px;font-weight:bold;">${s.label}</span>`;
};

// ── Items table helper ─────────────────────────────────────────────────────────
const itemsTable = (items = []) => `
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:16px;">
  <thead>
    <tr style="background:#0d47a1;color:#fff;">
      <th style="padding:10px 12px;text-align:left;font-size:13px;">Item</th>
      <th style="padding:10px 12px;text-align:center;font-size:13px;">Qty</th>
      <th style="padding:10px 12px;text-align:right;font-size:13px;">Price</th>
    </tr>
  </thead>
  <tbody>
    ${items.map((item, i) => `
    <tr style="background:${i % 2 === 0 ? '#f8f9fa' : '#fff'};">
      <td style="padding:10px 12px;font-size:13px;color:#333;">${item.name || item.productName || 'Item'}</td>
      <td style="padding:10px 12px;text-align:center;font-size:13px;color:#555;">${item.quantity}</td>
      <td style="padding:10px 12px;text-align:right;font-size:13px;color:#333;">₹${item.price}</td>
    </tr>`).join('')}
  </tbody>
</table>`;

// ── Send helper ────────────────────────────────────────────────────────────────
const sendMail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test')
      console.warn('[Email] Service disabled: EMAIL_USER or EMAIL_PASS not configured.');
    return;
  }
  try {
    await transporter.sendMail({ from: `"Vishal Mart" <${process.env.EMAIL_USER}>`, to, subject, html });
  } catch (err) {
    console.error('[Email] Failed to send:', err.message);
  }
};

// ── 1. Welcome / Registration ──────────────────────────────────────────────────
exports.sendWelcomeEmail = (user) => sendMail({
  to: user.email,
  subject: '🎉 Welcome to Vishal Mart!',
  html: layout('Welcome to Vishal Mart', `
    <h2 style="color:#0d47a1;margin:0 0 8px;">Hi ${user.name}! 👋</h2>
    <p style="color:#555;line-height:1.6;">Welcome to <strong>Vishal Mart</strong> — your one-stop shop for fresh groceries delivered to your door.</p>
    <div style="background:#e8f0fe;border-radius:8px;padding:16px 20px;margin:20px 0;">
      <p style="margin:0;color:#0d47a1;font-size:14px;"><strong>Your account is ready!</strong></p>
      <p style="margin:6px 0 0;color:#555;font-size:13px;">📧 ${user.email}</p>
    </div>
    <p style="color:#555;line-height:1.6;">Start exploring hundreds of products at the best prices. Happy shopping! 🛒</p>
    <div style="text-align:center;margin-top:28px;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="background:linear-gradient(135deg,#0d47a1,#1a73e8);color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:bold;">Shop Now</a>
    </div>`),
});

// ── 2. Order Confirmation ──────────────────────────────────────────────────────
exports.sendOrderConfirmationEmail = (user, order) => sendMail({
  to: user.email,
  subject: `✅ Order Confirmed — #VM-${String(order._id).slice(-8).toUpperCase()}`,
  html: layout('Order Confirmed', `
    <h2 style="color:#0d47a1;margin:0 0 4px;">Order Confirmed! 🎉</h2>
    <p style="color:#555;margin:0 0 20px;">Hi <strong>${user.name}</strong>, your order has been placed successfully.</p>
    <div style="background:#f8f9fa;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#555;">Order ID</td>
          <td style="font-size:13px;color:#333;font-weight:bold;text-align:right;">#VM-${String(order._id).slice(-8).toUpperCase()}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#555;padding-top:6px;">Status</td>
          <td style="text-align:right;padding-top:6px;">${statusBadge('placed')}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#555;padding-top:6px;">Payment</td>
          <td style="font-size:13px;color:#333;text-align:right;padding-top:6px;">${order.paymentMethod === 'prepaid' ? '💳 Prepaid' : '💵 Cash on Delivery'}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#555;padding-top:6px;">Delivery To</td>
          <td style="font-size:13px;color:#333;text-align:right;padding-top:6px;">${[order.street, order.city, order.pincode].filter(Boolean).join(', ')}</td>
        </tr>
      </table>
    </div>
    ${itemsTable(order.items)}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
      ${order.couponCode ? `<tr><td style="font-size:13px;color:#2e7d32;padding:4px 0;">🎟️ Coupon <strong>${order.couponCode}</strong></td><td style="text-align:right;font-size:13px;color:#2e7d32;">-₹${order.couponDiscount}</td></tr>` : ''}
      <tr>
        <td style="font-size:15px;font-weight:bold;color:#0d47a1;padding-top:10px;border-top:2px solid #e9ecef;">Total</td>
        <td style="font-size:15px;font-weight:bold;color:#0d47a1;text-align:right;padding-top:10px;border-top:2px solid #e9ecef;">₹${order.totalAmount}</td>
      </tr>
    </table>`),
});

// ── 3. Order Shipped ───────────────────────────────────────────────────────────
exports.sendOrderShippedEmail = (user, order) => sendMail({
  to: user.email,
  subject: `🚚 Your Order is Shipped — #VM-${String(order._id).slice(-8).toUpperCase()}`,
  html: layout('Order Shipped', `
    <h2 style="color:#7b1fa2;margin:0 0 4px;">Your order is on its way! 🚚</h2>
    <p style="color:#555;margin:0 0 20px;">Hi <strong>${user.name}</strong>, your order has been shipped and is heading to you.</p>
    <div style="background:#f3e5f5;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#555;">Order ID</td>
          <td style="font-size:13px;color:#333;font-weight:bold;text-align:right;">#VM-${String(order._id).slice(-8).toUpperCase()}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#555;padding-top:6px;">Status</td>
          <td style="text-align:right;padding-top:6px;">${statusBadge('shipped')}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#555;padding-top:6px;">Delivering To</td>
          <td style="font-size:13px;color:#333;text-align:right;padding-top:6px;">${[order.street, order.city, order.pincode].filter(Boolean).join(', ')}</td>
        </tr>
      </table>
    </div>
    <p style="color:#555;font-size:13px;line-height:1.6;">Please ensure someone is available at the delivery address. You'll receive another update when it's out for delivery.</p>`),
});

// ── 4. Out for Delivery ────────────────────────────────────────────────────────
exports.sendOutForDeliveryEmail = (user, order) => sendMail({
  to: user.email,
  subject: `🛵 Out for Delivery — #VM-${String(order._id).slice(-8).toUpperCase()}`,
  html: layout('Out for Delivery', `
    <h2 style="color:#e65100;margin:0 0 4px;">Almost there! 🛵</h2>
    <p style="color:#555;margin:0 0 20px;">Hi <strong>${user.name}</strong>, your order is out for delivery and will arrive today!</p>
    <div style="background:#fbe9e7;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#555;">Order ID</td>
          <td style="font-size:13px;color:#333;font-weight:bold;text-align:right;">#VM-${String(order._id).slice(-8).toUpperCase()}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#555;padding-top:6px;">Status</td>
          <td style="text-align:right;padding-top:6px;">${statusBadge('out_for_delivery')}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#555;padding-top:6px;">Delivering To</td>
          <td style="font-size:13px;color:#333;text-align:right;padding-top:6px;">${[order.street, order.city, order.pincode].filter(Boolean).join(', ')}</td>
        </tr>
      </table>
    </div>
    <p style="color:#555;font-size:13px;line-height:1.6;">Please be available at the delivery address. For COD orders, please keep the exact amount ready.</p>`),
});

// ── 5. Delivered ───────────────────────────────────────────────────────────────
exports.sendDeliveredEmail = (user, order) => sendMail({
  to: user.email,
  subject: `✅ Order Delivered — #VM-${String(order._id).slice(-8).toUpperCase()}`,
  html: layout('Order Delivered', `
    <h2 style="color:#2e7d32;margin:0 0 4px;">Order Delivered! ✅</h2>
    <p style="color:#555;margin:0 0 20px;">Hi <strong>${user.name}</strong>, your order has been delivered successfully. Enjoy your groceries!</p>
    <div style="background:#e8f5e9;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#555;">Order ID</td>
          <td style="font-size:13px;color:#333;font-weight:bold;text-align:right;">#VM-${String(order._id).slice(-8).toUpperCase()}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#555;padding-top:6px;">Status</td>
          <td style="text-align:right;padding-top:6px;">${statusBadge('delivered')}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#555;padding-top:6px;">Total Paid</td>
          <td style="font-size:13px;font-weight:bold;color:#2e7d32;text-align:right;padding-top:6px;">₹${order.totalAmount}</td>
        </tr>
      </table>
    </div>
    ${order.couponCode ? `<div style="background:#fff8e1;border-radius:8px;padding:14px 20px;margin-bottom:20px;border-left:4px solid #f9a825;"><p style="margin:0;font-size:13px;color:#555;">🎟️ Your coupon code: <strong style="color:#f57c00;">${order.couponCode}</strong> (saves ₹${order.couponDiscount} on next order)</p></div>` : ''}
    <p style="color:#555;font-size:13px;line-height:1.6;">Thank you for shopping with Vishal Mart! You can download your invoice from the Orders page.</p>`),
});

// ── 6. Password Reset ──────────────────────────────────────────────────────────
exports.sendPasswordResetEmail = (user, resetToken) => sendMail({
  to: user.email,
  subject: '🔐 Password Reset Request — Vishal Mart',
  html: layout('Password Reset', `
    <h2 style="color:#0d47a1;margin:0 0 8px;">Reset Your Password 🔐</h2>
    <p style="color:#555;line-height:1.6;">Hi <strong>${user.name}</strong>, we received a request to reset your password.</p>
    <div style="background:#fff3e0;border-radius:8px;padding:16px 20px;margin:20px 0;border-left:4px solid #f57c00;">
      <p style="margin:0;font-size:13px;color:#555;">Your OTP / Reset Token:</p>
      <p style="margin:8px 0 0;font-size:28px;font-weight:bold;color:#e65100;letter-spacing:6px;">${resetToken}</p>
      <p style="margin:8px 0 0;font-size:12px;color:#888;">Valid for 15 minutes only.</p>
    </div>
    <p style="color:#555;font-size:13px;line-height:1.6;">If you did not request a password reset, please ignore this email. Your account remains secure.</p>`),
});
