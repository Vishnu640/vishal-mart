const router = require('express').Router();
const { auth, adminOnly } = require('../middleware/authMiddleware');
const { getAllProducts, addProduct, deleteProduct } = require('../controllers/productController');

router.get('/', getAllProducts);
router.post('/', auth, adminOnly, addProduct);
router.delete('/:id', auth, adminOnly, deleteProduct);

module.exports = router;
