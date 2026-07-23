const router = require('express').Router();
const { register, login, changePassword, updateProfile, getProfile } = require('../controllers/authController');
const { auth } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);

module.exports = router;
