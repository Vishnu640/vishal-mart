const router = require('express').Router();
const { register, login, changePassword, updateProfile, getProfile, sendOtp, verifyOtp, getAllUsers } = require('../controllers/authController');
const { auth } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.get('/users', auth, adminOnly, getAllUsers);

module.exports = router;
