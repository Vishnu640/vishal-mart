const router = require('express').Router();
const { auth, adminOnly } = require('../middleware/authMiddleware');
const { placeOrder, getMyOrders, updateOrderStatus, getAllOrders, cancelOrder, returnOrder, generateCouponForOrder } = require('../controllers/orderController');

router.post('/', auth, placeOrder);
router.get('/my', auth, getMyOrders);
router.get('/all', auth, adminOnly, getAllOrders);
router.put('/:id/status', auth, adminOnly, updateOrderStatus);
router.put('/:id/cancel', auth, cancelOrder);
router.put('/:id/return', auth, returnOrder);
router.post('/:id/coupon', auth, adminOnly, generateCouponForOrder);

module.exports = router;
