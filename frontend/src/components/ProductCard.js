import { useState } from 'react';

const categoryIcons = {
  'Grocery': '🌾', 'Spices': '🌶️', 'Dairy': '🥛', 'Bakery': '🍞',
  'Snacks': '🍿', 'Beverages': '🥤', 'Sauces': '🫙', 'Household': '🧹',
  'Personal Care': '🧴', 'Clothing': '👗', 'Tea Shirts': '👕',
  'Boys Shoes': '👟', 'Girls Shoes': '👠', 'Sports Kits': '⚽',
  'Home Utensils': '🍳', 'Vegetables': '🥦', 'Fruits': '🍎',
};

const categoryColors = {
  'Grocery': '#e8f5e9', 'Spices': '#fce4ec', 'Dairy': '#e3f2fd',
  'Bakery': '#fff8e1', 'Snacks': '#fff3e0', 'Beverages': '#e0f7fa',
  'Sauces': '#f3e5f5', 'Household': '#e8eaf6', 'Personal Care': '#fce4ec',
  'Clothing': '#e8f0fe', 'Tea Shirts': '#e0f2f1', 'Boys Shoes': '#e3f2fd',
  'Girls Shoes': '#fce4ec', 'Sports Kits': '#e8f5e9', 'Home Utensils': '#fff8e1',
  'Vegetables': '#e8f5e9', 'Fruits': '#fff3e0',
};

export default function ProductCard({ product, onAddToCart }) {
  const icon = categoryIcons[product.category] || '🛍️';
  const bgColor = categoryColors[product.category] || '#f0f4ff';
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="product-card">
      <div className="card-img-box" style={{ background: bgColor }}>
        {product.image && !imgError ? (
          <>
            <img src={product.image} alt={product.name} className="card-img" onError={() => setImgError(true)} />
            <div className="card-img-overlay" />
          </>
        ) : (
          <div className="card-icon-fallback" style={{ background: `linear-gradient(135deg, ${bgColor}, white)` }}>
            {icon}
          </div>
        )}
        <span className="card-badge">{icon} {product.category}</span>
        {product.stock <= 10 && (
          <span className="card-stock-badge">🔥 Only {product.stock} left</span>
        )}
      </div>

      <div className="card-body">
        <h3 className="card-name">{product.name}</h3>
        <p className="card-desc">{product.description}</p>
        <div className="card-divider" />
        <div className="card-bottom">
          <span className="card-price">₹{product.price}</span>
          <button className="card-btn" onClick={handleAdd}>
            {added ? '✅ Added!' : '🛒 Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
