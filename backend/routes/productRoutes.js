const router = require('express').Router();
const { auth, adminOnly } = require('../middleware/authMiddleware');
const { getAllProducts, addProduct, updateProduct, deleteProduct } = require('../controllers/productController');

router.get('/', getAllProducts);
router.post('/', auth, adminOnly, addProduct);
router.put('/:id', auth, adminOnly, updateProduct);
router.delete('/:id', auth, adminOnly, deleteProduct);

module.exports = router;
