import { useState, useEffect } from 'react';
import API from '../api/axios';
import ProductCard from '../components/ProductCard';
import QRScanner from '../components/QRScanner';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Grocery','Spices','Dairy','Bakery','Snacks','Beverages','Sauces','Household','Personal Care','Clothing','Tea Shirts','Boys Shoes','Girls Shoes','Sports Kits','Home Utensils','Vegetables','Fruits'];

export default function Home({ cart, setCart }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Grocery', price: '', stock: '', description: '', image: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    setError('');
    API.get('/products')
      .then((res) => {
        setProducts(res.data);
        const cats = ['All', ...new Set(res.data.map((p) => p.category))];
        setCategories(cats);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError('❌ Cannot connect to backend. Retrying...');
        setTimeout(() => fetchProducts(), 3000);
      });
  };

  useEffect(() => { fetchProducts(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addToCart = (product) => {
    const existing = cart.find((c) => c.id === product.id);
    if (existing) {
      setCart(cart.map((c) => c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setToast(`✅ ${product.name} added to cart!`);
    setTimeout(() => setToast(''), 2000);
  };

  const handleQRScan = (data) => {
    setForm({
      name: data.name || '',
      category: data.category || 'Grocery',
      price: data.price || '',
      stock: data.stock || '',
      description: data.description || '',
      image: data.image || '',
    });
    setShowScanner(false);
    setShowForm(true);
    setToast('✅ Product details filled from QR code!');
    setTimeout(() => setToast(''), 2500);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) return setFormError('Name, Price and Stock are required.');
    setSubmitting(true);
    setFormError('');
    try {
      await API.post('/products', { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) });
      setToast('✅ Product added successfully!');
      setTimeout(() => setToast(''), 2500);
      setForm({ name: '', category: 'Grocery', price: '', stock: '', description: '', image: '' });
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add product.');
    }
    setSubmitting(false);
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || p.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Nature Background */}
      <div className="nature-bg">
        <div className="nature-sun" />
        <div className="nature-cloud cloud-1" />
        <div className="nature-cloud cloud-2" />
        <div className="nature-cloud cloud-3" />
        <div className="nature-leaf leaf-1">🍃</div>
        <div className="nature-leaf leaf-2">🍂</div>
        <div className="nature-leaf leaf-3">🌿</div>
        <div className="nature-leaf leaf-4">🍃</div>
        <div className="nature-leaf leaf-5">🍂</div>
        <div className="nature-leaf leaf-6">🌿</div>
        <div className="nature-leaf leaf-7">🍃</div>
        <div className="nature-leaf leaf-8">🍂</div>
        <div className="nature-leaf leaf-9">🌿</div>
        <div className="nature-leaf leaf-10">🍃</div>
        <div className="nature-particle particle-1" />
        <div className="nature-particle particle-2" />
        <div className="nature-particle particle-3" />
        <div className="nature-particle particle-4" />
        <div className="nature-particle particle-5" />
        <div className="nature-particle particle-6" />
        <div className="nature-butterfly butterfly-1">🦋</div>
        <div className="nature-butterfly butterfly-2">🦋</div>
        <div className="nature-butterfly butterfly-3">🦋</div>
        <div className="nature-tree tree-1"><div className="tree-top" /><div className="tree-trunk" /></div>
        <div className="nature-tree tree-2"><div className="tree-top" /><div className="tree-trunk" /></div>
        <div className="nature-tree tree-3"><div className="tree-top" /><div className="tree-trunk" /></div>
        <div className="nature-tree tree-4"><div className="tree-top" /><div className="tree-trunk" /></div>
        <div className="nature-flower flower-1">🌸</div>
        <div className="nature-flower flower-2">🌼</div>
        <div className="nature-flower flower-3">🌺</div>
        <div className="nature-flower flower-4">🌻</div>
        <div className="nature-grass" />
      </div>

      <div className="page-content" style={{ padding: '10px 14px' }}>

      {/* Hero */}
      <div className="hero-section">
        <div className="hero-title">🛒 Vishal Mart</div>
        <div className="hero-sub">Fresh products delivered to your door in <strong>4 Hours!</strong></div>
        <div className="hero-badges">
          <span className="hero-badge">🚚 Free Delivery above ₹499</span>
          <span className="hero-badge">⚡ 4-Hour Delivery</span>
          <span className="hero-badge">🔒 Secure Payments</span>
          <span className="hero-badge">🌟 {products.length}+ Products</span>
        </div>
      </div>

      {/* Toast */}
      {toast && <div className="toast-msg">{toast}</div>}

      {/* Admin Controls */}
      {user?.role === 'admin' && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px', marginBottom: '10px' }}>
          <button onClick={() => { setShowScanner(true); setShowForm(false); }} style={s.scanBtn}>📷 Scan QR to Add</button>
          <button onClick={() => setShowForm(!showForm)} style={s.addBtn}>
            {showForm ? '✖ Close Form' : '➕ Add Product'}
          </button>
        </div>
      )}

      {/* Add Product Form */}
      {showForm && user?.role === 'admin' && (
        <div className="admin-form-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 800, color: '#1a73e8', fontSize: '18px' }}>➕ Add New Product</h3>
            <button onClick={() => setShowScanner(true)} style={s.scanBtn}>📷 Scan QR</button>
          </div>
          {formError && <p style={s.formError}>{formError}</p>}
          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input className="form-input" placeholder="Product Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input className="form-input" placeholder="Price (₹) *" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              <input className="form-input" placeholder="Stock *" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            </div>
            <input className="form-input" placeholder="Image URL" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} style={{ width: '100%' }} />
            <textarea className="form-input" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical', minHeight: '70px' }} />
            <button type="submit" disabled={submitting} style={s.submitBtn}>
              {submitting ? '⏳ Adding...' : '✅ Add Product'}
            </button>
          </form>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="spinner-wrap">
          <div className="spinner" />
          <p style={{ color: '#1a73e8', fontWeight: 600, fontFamily: 'Poppins' }}>Loading amazing products...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={s.errorBox}>
          <p style={{ color: '#c62828', fontWeight: 600, marginBottom: '12px' }}>{error}</p>
          <button onClick={fetchProducts} style={s.retryBtn}>🔄 Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Search */}
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search products, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Stats */}
          <div className="stats-bar">
            <div className="stat-chip">🛍️ <strong>{products.length}</strong> Total Products</div>
            <div className="stat-chip">📂 <strong>{categories.length - 1}</strong> Categories</div>
            <div className="stat-chip">✅ Showing <strong>{filtered.length}</strong> results</div>
            {search && <div className="stat-chip">🔍 Search: <strong>"{search}"</strong></div>}
          </div>

          {/* Category Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`cat-pill ${category === cat ? 'active' : 'inactive'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Section Title */}
          <div className="section-title">
            {category === 'All' ? '🛒 All Products' : `${category} Products`}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#444', fontFamily: 'Poppins' }}>No products found!</p>
              <p style={{ color: '#999', fontFamily: 'Nunito' }}>Try a different search or category</p>
            </div>
          ) : (
            <div className="products-grid">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          )}
        </>
      )}

      {showScanner && <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />}
      </div>
    </div>
  );
}

const s = {
  addBtn: { background: 'linear-gradient(135deg,#1a73e8,#0d47a1)', color: 'white', border: 'none', padding: '11px 22px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: 'Poppins', boxShadow: '0 4px 14px rgba(26,115,232,0.35)' },
  scanBtn: { background: 'linear-gradient(135deg,#ff6f00,#e65100)', color: 'white', border: 'none', padding: '11px 22px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: 'Poppins', boxShadow: '0 4px 14px rgba(255,111,0,0.35)' },
  submitBtn: { background: 'linear-gradient(135deg,#34a853,#1e7e34)', color: 'white', border: 'none', padding: '13px', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: 700, fontFamily: 'Poppins', boxShadow: '0 4px 14px rgba(52,168,83,0.35)' },
  formError: { color: '#c62828', background: '#fff3f3', padding: '10px 14px', borderRadius: '8px', marginBottom: '8px', fontSize: '13px', fontFamily: 'Poppins' },
  errorBox: { background: '#fff3f3', border: '1px solid #ffcdd2', borderRadius: '16px', padding: '40px', textAlign: 'center' },
  retryBtn: { background: 'linear-gradient(135deg,#1a73e8,#0d47a1)', color: 'white', border: 'none', padding: '11px 28px', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: 700, fontFamily: 'Poppins' },
  empty: { textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
};
