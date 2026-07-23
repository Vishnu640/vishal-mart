import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [count, setCount] = useState({ products: 0, customers: 0, cities: 0 });

  useEffect(() => {
    if (user) navigate('/home');
  }, [user, navigate]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const targets = { products: 500, customers: 10000, cities: 25 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCount({
        products: Math.min(Math.floor((targets.products / steps) * step), targets.products),
        customers: Math.min(Math.floor((targets.customers / steps) * step), targets.customers),
        cities: Math.min(Math.floor((targets.cities / steps) * step), targets.cities),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { icon: '🚚', title: '4 Hour Delivery', desc: 'Lightning fast delivery right to your doorstep', color: '#e3f2fd' },
    { icon: '💰', title: 'Best Prices', desc: 'Unbeatable prices on all daily essentials', color: '#e8f5e9' },
    { icon: '🛍️', title: '500+ Products', desc: 'Huge variety from groceries to clothing', color: '#fff3e0' },
    { icon: '🔒', title: 'Secure Payment', desc: '100% safe and encrypted transactions', color: '#fce4ec' },
    { icon: '📦', title: 'Live Tracking', desc: 'Real-time order tracking at every step', color: '#f3e5f5' },
    { icon: '↩️', title: 'Easy Returns', desc: 'Hassle-free 7-day return policy', color: '#e0f7fa' },
  ];

  const categories = [
    { icon: '🌾', name: 'Grocery', bg: '#fff8e1' },
    { icon: '🌶️', name: 'Spices', bg: '#fce4ec' },
    { icon: '🥛', name: 'Dairy', bg: '#e3f2fd' },
    { icon: '👕', name: 'Clothing', bg: '#f3e5f5' },
    { icon: '🧴', name: 'Personal Care', bg: '#e8f5e9' },
    { icon: '🧹', name: 'Household', bg: '#fff3e0' },
    { icon: '🥤', name: 'Beverages', bg: '#e0f7fa' },
    { icon: '🍎', name: 'Fruits', bg: '#fce4ec' },
    { icon: '🥦', name: 'Vegetables', bg: '#e8f5e9' },
    { icon: '🍞', name: 'Bakery', bg: '#fff8e1' },
  ];

  const steps = [
    { step: '1', icon: '📱', title: 'Browse', desc: 'Explore 500+ products easily' },
    { step: '2', icon: '🛒', title: 'Add to Cart', desc: 'Pick your favourite items' },
    { step: '3', icon: '💳', title: 'Pay Securely', desc: 'Safe & fast checkout' },
    { step: '4', icon: '🚚', title: 'Get Delivered', desc: 'At your door in 4 hours' },
  ];

  const testimonials = [
    { name: 'Rahul Sharma', city: 'Hyderabad', text: 'Amazing service! Got my groceries in just 2 hours. Highly recommended!', rating: '⭐⭐⭐⭐⭐' },
    { name: 'Priya Reddy', city: 'Secunderabad', text: 'Best prices in town. Fresh vegetables and quick delivery every time!', rating: '⭐⭐⭐⭐⭐' },
    { name: 'Anil Kumar', city: 'Warangal', text: 'Love the variety of products. The app is super easy to use!', rating: '⭐⭐⭐⭐⭐' },
  ];

  return (
    <div style={styles.container}>

      {/* Nature Background */}
      <div style={styles.natureBg}>
        <div style={styles.natureSun} />
        <div style={{...styles.cloud,width:140,height:40,top:70,left:'-140px',animation:'cloudDrift 38s linear infinite'}}>
          <div style={{...styles.cloudPuff,width:70,height:62,top:-32,left:20}} />
          <div style={{...styles.cloudPuff,width:52,height:48,top:-24,left:60}} />
        </div>
        <div style={{...styles.cloud,width:100,height:30,top:130,left:'-100px',opacity:0.65,animation:'cloudDrift 52s linear infinite',animationDelay:'-20s'}}>
          <div style={{...styles.cloudPuff,width:50,height:46,top:-24,left:14}} />
          <div style={{...styles.cloudPuff,width:38,height:34,top:-18,left:44}} />
        </div>
        <div style={{...styles.cloud,width:80,height:24,top:40,left:'-80px',opacity:0.5,animation:'cloudDrift 62s linear infinite',animationDelay:'-40s'}}>
          <div style={{...styles.cloudPuff,width:40,height:36,top:-18,left:10}} />
          <div style={{...styles.cloudPuff,width:30,height:28,top:-14,left:36}} />
        </div>
        {['5%','15%','27%','40%','53%','65%','76%','87%','93%','44%'].map((left,i)=>(
          <div key={i} style={{position:'absolute',top:'-60px',left,fontSize:[18,14,22,16,20,15,19,13,21,17][i],animation:`leafFall ${[9,12,10,14,11,13,9,15,10,12][i]}s linear ${[0,2,5,1,7,3,6,4,9,11][i]}s infinite`,opacity:0.85}}>
            {['🍃','🍂','🌿','🍃','🍂','🌿','🍃','🍂','🌿','🍃'][i]}
          </div>
        ))}
        {[{b:'20%',l:'8%',s:8,c:'rgba(255,235,59,0.6)',d:4,dl:0},{b:'38%',l:'28%',s:6,c:'rgba(129,199,132,0.7)',d:5,dl:1},{b:'55%',l:'52%',s:10,c:'rgba(255,183,77,0.5)',d:6,dl:2},{b:'28%',l:'72%',s:7,c:'rgba(165,214,167,0.8)',d:4.5,dl:0.5},{b:'62%',l:'86%',s:9,c:'rgba(255,241,118,0.6)',d:5.5,dl:3}].map((p,i)=>(
          <div key={i} style={{position:'absolute',bottom:p.b,left:p.l,width:p.s,height:p.s,borderRadius:'50%',background:p.c,animation:`floatParticle ${p.d}s ease-in-out ${p.dl}s infinite`}} />
        ))}
        {[{t:'15%',l:'8%',d:3,dl:0},{t:'28%',r:'12%',d:4,dl:1.5},{t:'52%',l:'38%',d:3.5,dl:0.8}].map((b,i)=>(
          <div key={i} style={{position:'absolute',top:b.t,left:b.l,right:b.r,fontSize:22,animation:`butterflyFly ${b.d}s ease-in-out ${b.dl}s infinite`}}>🦋</div>
        ))}
        <div style={{...styles.natureTree,left:18,animationDelay:'0s'}}><div style={{width:80,height:110,borderRadius:'50% 50% 40% 40%',background:'radial-gradient(ellipse,#66bb6a,#388e3c)',marginBottom:-10}} /><div style={{width:14,height:70,background:'linear-gradient(to bottom,#8d6e63,#6d4c41)',borderRadius:'4px 4px 0 0'}} /></div>
        <div style={{...styles.natureTree,left:58,animationDelay:'0.8s'}}><div style={{width:60,height:82,borderRadius:'50% 50% 40% 40%',background:'radial-gradient(ellipse,#81c784,#43a047)',marginBottom:-8}} /><div style={{width:12,height:52,background:'linear-gradient(to bottom,#8d6e63,#6d4c41)',borderRadius:'4px 4px 0 0'}} /></div>
        <div style={{...styles.natureTree,right:18,animationDelay:'1.2s'}}><div style={{width:90,height:122,borderRadius:'50% 50% 40% 40%',background:'radial-gradient(ellipse,#a5d6a7,#2e7d32)',marginBottom:-12}} /><div style={{width:14,height:80,background:'linear-gradient(to bottom,#8d6e63,#6d4c41)',borderRadius:'4px 4px 0 0'}} /></div>
        <div style={{...styles.natureTree,right:62,animationDelay:'0.4s'}}><div style={{width:65,height:86,borderRadius:'50% 50% 40% 40%',background:'radial-gradient(ellipse,#c8e6c9,#388e3c)',marginBottom:-9}} /><div style={{width:12,height:56,background:'linear-gradient(to bottom,#8d6e63,#6d4c41)',borderRadius:'4px 4px 0 0'}} /></div>
        {[{l:140,e:'🌸',dl:0},{l:185,e:'🌼',dl:0.6},{r:140,e:'🌺',dl:1.2},{r:185,e:'🌻',dl:0.3}].map((f,i)=>(
          <div key={i} style={{position:'absolute',bottom:22,left:f.l,right:f.r,fontSize:24,animation:`float 3s ease-in-out ${f.dl}s infinite`}}>{f.e}</div>
        ))}
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:28,background:'linear-gradient(to bottom,#66bb6a,#388e3c)',borderRadius:'50% 50% 0 0 / 12px 12px 0 0',opacity:0.3}} />
      </div>

      {/* Sticky Header */}
      <div style={{ ...styles.header, boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.15)' : 'none' }}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🛒</span>
          <span style={styles.logoText}>Vishal Mart</span>
        </div>
        <div style={styles.headerLinks}>
          <button onClick={() => navigate('/login')} style={styles.loginBtn}>Login</button>
          <button onClick={() => navigate('/register')} style={styles.registerBtn}>Register Free</button>
        </div>
      </div>

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>🎉 India's Fastest Grocery Delivery</div>
          <h1 style={styles.heroTitle}>Fresh Groceries<br /><span style={styles.heroHighlight}>Delivered in 4 Hours!</span></h1>
          <p style={styles.heroSubtitle}>Shop from 500+ products — Groceries, Vegetables, Dairy, Clothing & More at the best prices!</p>
          <div style={styles.heroBtns}>
            <button onClick={() => navigate('/home')} style={styles.shopNowBtn}>
              🛍️ Shop Now
            </button>
            <button onClick={() => navigate('/register')} style={styles.joinBtn}>
              Join Free →
            </button>
          </div>
          <div style={styles.heroStats}>
            <div style={styles.stat}><strong style={styles.statNum}>{count.products}+</strong><span style={styles.statLabel}>Products</span></div>
            <div style={styles.statDivider} />
            <div style={styles.stat}><strong style={styles.statNum}>{count.customers.toLocaleString()}+</strong><span style={styles.statLabel}>Happy Customers</span></div>
            <div style={styles.statDivider} />
            <div style={styles.stat}><strong style={styles.statNum}>{count.cities}+</strong><span style={styles.statLabel}>Cities</span></div>
          </div>
        </div>
        <div style={styles.heroImageBox}>
          <div style={styles.heroEmoji}>🏪</div>
          <div style={styles.floatBadge1}>🚚 Fast Delivery</div>
          <div style={styles.floatBadge2}>✅ Fresh Products</div>
          <div style={styles.floatBadge3}>💰 Best Prices</div>
        </div>
      </div>

      {/* Marquee Banner */}
      <div style={styles.marqueeBox}>
        <div style={styles.marqueeTrack}>
          {['🌾 Fresh Groceries', '🥛 Dairy Products', '🍎 Fresh Fruits', '🥦 Vegetables', '👕 Clothing', '🧴 Personal Care', '🚚 4 Hour Delivery', '💰 Best Prices', '🌾 Fresh Groceries', '🥛 Dairy Products', '🍎 Fresh Fruits', '🥦 Vegetables'].map((item, i) => (
            <span key={i} style={styles.marqueeItem}>{item}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={styles.section}>
        <div style={styles.sectionBadge}>WHY CHOOSE US</div>
        <h2 style={styles.sectionTitle}>Why Thousands Love Vishal Mart</h2>
        <div style={styles.featureGrid}>
          {features.map((f) => (
            <div key={f.title} style={{ ...styles.featureCard, backgroundColor: f.color }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div style={{ ...styles.section, background: 'rgba(232,240,254,0.45)' }}>
        <div style={styles.sectionBadge}>CATEGORIES</div>
        <h2 style={styles.sectionTitle}>Shop by Category</h2>
        <div style={styles.catGrid}>
          {categories.map((cat) => (
            <div key={cat.name} onClick={() => navigate('/home')}
              style={{ ...styles.catCard, backgroundColor: cat.bg }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)'; }}>
              <div style={styles.catIcon}>{cat.icon}</div>
              <p style={styles.catName}>{cat.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div style={styles.section}>
        <div style={styles.sectionBadge}>HOW IT WORKS</div>
        <h2 style={styles.sectionTitle}>Order in 4 Simple Steps</h2>
        <div style={styles.stepsGrid}>
          {steps.map((s, i) => (
            <div key={s.step} style={styles.stepWrapper}>
              <div style={styles.stepCard}>
                <div style={styles.stepNumber}>{s.step}</div>
                <div style={styles.stepIcon}>{s.icon}</div>
                <h3 style={styles.stepTitle}>{s.title}</h3>
                <p style={styles.stepDesc}>{s.desc}</p>
              </div>
              {i < steps.length - 1 && <div style={styles.stepArrow}>→</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ ...styles.section, background: 'rgba(232,240,254,0.45)' }}>
        <div style={styles.sectionBadge}>TESTIMONIALS</div>
        <h2 style={styles.sectionTitle}>What Our Customers Say</h2>
        <div style={styles.testimonialGrid}>
          {testimonials.map((t) => (
            <div key={t.name} style={styles.testimonialCard}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <p style={styles.testimonialRating}>{t.rating}</p>
              <p style={styles.testimonialText}>"{t.text}"</p>
              <div style={styles.testimonialAuthor}>
                <div style={styles.testimonialAvatar}>{t.name[0]}</div>
                <div>
                  <p style={styles.testimonialName}>{t.name}</p>
                  <p style={styles.testimonialCity}>📍 {t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={styles.cta}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Ready to Start Shopping? 🛍️</h2>
          <p style={styles.ctaDesc}>Join 10,000+ happy customers. Get fresh groceries delivered in 4 hours!</p>
          <div style={styles.ctaBtns}>
            <button onClick={() => navigate('/register')} style={styles.ctaBtn}>Create Free Account</button>
            <button onClick={() => navigate('/home')} style={styles.ctaBtnOutline}>Browse Products</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerTop}>
          <div>
            <p style={styles.footerLogo}>🛒 Vishal Mart</p>
            <p style={styles.footerTagline}>Your trusted daily shopping partner</p>
          </div>
          <div style={styles.footerLinks}>
            <span>📞 1800-123-4567</span>
            <span>📧 support@vishalmart.com</span>
            <span>📍 Hyderabad, India</span>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>© 2024 Vishal Mart. All rights reserved. | Made with ❤️ in India</p>
        </div>
      </div>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes leafFall { 0% { transform:translateY(-60px) rotate(0deg); opacity:0.9; } 100% { transform:translateY(110vh) rotate(360deg); opacity:0; } }
        @keyframes floatParticle { 0% { transform:translateY(0) scale(1); opacity:0.7; } 50% { opacity:1; } 100% { transform:translateY(-80px) scale(0.6); opacity:0; } }
        @keyframes treeSway { 0%,100% { transform:rotate(-2deg); } 50% { transform:rotate(2deg); } }
        @keyframes sunRays { 0%,100% { opacity:0.4; transform:scale(1); } 50% { opacity:0.7; transform:scale(1.08); } }
        @keyframes cloudDrift { 0% { transform:translateX(-160px); } 100% { transform:translateX(110vw); } }
        @keyframes butterflyFly { 0%,100% { transform:translateY(0) rotate(-5deg); } 50% { transform:translateY(-20px) rotate(5deg); } }
      `}</style>
    </div>
  );
}

const styles = {
  container: { fontFamily: "'Segoe UI', sans-serif", background: 'linear-gradient(160deg,#e8f5e9 0%,#f1f8e9 30%,#e0f7fa 60%,#e8f0fe 100%)', backgroundAttachment: 'fixed', minHeight: '100vh', overflowX: 'hidden', position: 'relative' },

  // Nature BG
  natureBg: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' },
  natureSun: { position: 'absolute', top: 40, right: 80, width: 90, height: 90, background: 'radial-gradient(circle,#ffe082 30%,#ffca28 60%,transparent 75%)', borderRadius: '50%', boxShadow: '0 0 40px 20px rgba(255,202,40,0.18)', animation: 'sunRays 4s ease-in-out infinite' },
  cloud: { position: 'absolute', background: 'rgba(255,255,255,0.78)', borderRadius: 50 },
  cloudPuff: { position: 'absolute', background: 'rgba(255,255,255,0.78)', borderRadius: '50%' },
  natureTree: { position: 'absolute', bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transformOrigin: 'bottom center', animation: 'treeSway 5s ease-in-out infinite' },

  // Header
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 50px', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.35)', position: 'sticky', top: 0, zIndex: 1000, transition: 'box-shadow 0.3s' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: { fontSize: '32px' },
  logoText: { fontSize: '24px', fontWeight: '800', background: 'linear-gradient(135deg, #1a73e8, #0d47a1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  headerLinks: { display: 'flex', gap: '12px' },
  loginBtn: { backgroundColor: 'transparent', color: '#1a73e8', border: '2px solid #1a73e8', padding: '9px 24px', borderRadius: '25px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', transition: 'all 0.2s' },
  registerBtn: { background: 'linear-gradient(135deg, #1a73e8, #0d47a1)', color: 'white', border: 'none', padding: '9px 24px', borderRadius: '25px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' },

  // Hero
  hero: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '80px 80px', background: 'linear-gradient(135deg, #0d47a1 0%, #1a73e8 50%, #42a5f5 100%)', color: 'white', position: 'relative', minHeight: '520px', overflow: 'hidden' },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' },
  heroContent: { maxWidth: '580px', animation: 'fadeInUp 0.8s ease', position: 'relative', zIndex: 1 },
  heroBadge: { display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '8px 20px', borderRadius: '25px', fontSize: '14px', fontWeight: '600', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.3)' },
  heroTitle: { fontSize: '52px', fontWeight: '900', margin: '0 0 20px 0', lineHeight: 1.15 },
  heroHighlight: { color: '#ffd54f' },
  heroSubtitle: { fontSize: '18px', opacity: 0.9, margin: '0 0 30px 0', lineHeight: 1.6 },
  heroBtns: { display: 'flex', gap: '15px', marginBottom: '40px', flexWrap: 'wrap' },
  shopNowBtn: { background: 'linear-gradient(135deg, #ff6f00, #ff8f00)', color: 'white', border: 'none', padding: '16px 40px', borderRadius: '35px', cursor: 'pointer', fontSize: '17px', fontWeight: '800', boxShadow: '0 6px 20px rgba(255,111,0,0.4)', transition: 'transform 0.2s' },
  joinBtn: { backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.6)', padding: '16px 40px', borderRadius: '35px', cursor: 'pointer', fontSize: '17px', fontWeight: '700', backdropFilter: 'blur(10px)' },
  heroStats: { display: 'flex', gap: '20px', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '16px 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', width: 'fit-content' },
  stat: { textAlign: 'center' },
  statNum: { display: 'block', fontSize: '26px', fontWeight: '900', color: '#ffd54f' },
  statLabel: { fontSize: '12px', opacity: 0.85 },
  statDivider: { width: '1px', height: '40px', backgroundColor: 'rgba(255,255,255,0.3)' },
  heroImageBox: { position: 'relative', zIndex: 1 },
  heroEmoji: { fontSize: '180px', animation: 'float 3s ease-in-out infinite', display: 'block' },
  floatBadge1: { position: 'absolute', top: '10px', right: '-20px', backgroundColor: 'white', color: '#1a73e8', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', animation: 'float 3s ease-in-out infinite 0.5s' },
  floatBadge2: { position: 'absolute', bottom: '60px', right: '-30px', backgroundColor: '#4caf50', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', animation: 'float 3s ease-in-out infinite 1s' },
  floatBadge3: { position: 'absolute', bottom: '10px', left: '-10px', backgroundColor: '#ff6f00', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', animation: 'float 3s ease-in-out infinite 1.5s' },

  // Marquee
  marqueeBox: { backgroundColor: '#1a73e8', padding: '12px 0', overflow: 'hidden' },
  marqueeTrack: { display: 'flex', gap: '0', animation: 'marquee 20s linear infinite', width: 'max-content' },
  marqueeItem: { color: 'white', fontSize: '14px', fontWeight: '600', padding: '0 30px', borderRight: '1px solid rgba(255,255,255,0.3)', whiteSpace: 'nowrap' },

  // Sections
  section: { padding: '70px 60px', background: 'rgba(255,255,255,0.38)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', position: 'relative', zIndex: 1 },
  sectionBadge: { textAlign: 'center', color: '#1a73e8', fontSize: '12px', fontWeight: '800', letterSpacing: '2px', marginBottom: '10px' },
  sectionTitle: { textAlign: 'center', fontSize: '32px', fontWeight: '800', color: '#1a1a2e', marginBottom: '50px', margin: '0 0 50px 0' },

  // Features
  featureGrid: { display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' },
  featureCard: { padding: '30px 25px', borderRadius: '16px', width: '260px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'default', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.6)' },
  featureIcon: { fontSize: '48px', marginBottom: '15px' },
  featureTitle: { fontSize: '17px', fontWeight: '800', color: '#1a1a2e', margin: '0 0 10px 0' },
  featureDesc: { fontSize: '13px', color: '#666', margin: 0, lineHeight: 1.6 },

  // Categories
  catGrid: { display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' },
  catCard: { padding: '22px 28px', borderRadius: '16px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', transition: 'transform 0.25s, box-shadow 0.25s', minWidth: '110px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.55)' },
  catIcon: { fontSize: '42px', marginBottom: '10px' },
  catName: { fontSize: '13px', fontWeight: '700', color: '#333', margin: 0 },

  // Steps
  stepsGrid: { display: 'flex', gap: '0', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' },
  stepWrapper: { display: 'flex', alignItems: 'center', gap: '0' },
  stepCard: { textAlign: 'center', width: '180px', padding: '20px 10px' },
  stepNumber: { background: 'linear-gradient(135deg, #1a73e8, #0d47a1)', color: 'white', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '18px', fontWeight: '800', boxShadow: '0 4px 15px rgba(26,115,232,0.4)' },
  stepIcon: { fontSize: '44px', marginBottom: '12px' },
  stepTitle: { fontSize: '16px', fontWeight: '800', color: '#1a1a2e', margin: '0 0 8px 0' },
  stepDesc: { fontSize: '13px', color: '#666', margin: 0 },
  stepArrow: { fontSize: '28px', color: '#1a73e8', fontWeight: 'bold', padding: '0 5px', marginBottom: '30px' },

  // Testimonials
  testimonialGrid: { display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' },
  testimonialCard: { background: 'rgba(255,255,255,0.62)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', padding: '28px', borderRadius: '16px', width: '300px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'transform 0.3s', border: '1px solid rgba(255,255,255,0.7)' },
  testimonialRating: { fontSize: '18px', margin: '0 0 12px 0' },
  testimonialText: { fontSize: '14px', color: '#555', lineHeight: 1.7, margin: '0 0 20px 0', fontStyle: 'italic' },
  testimonialAuthor: { display: 'flex', alignItems: 'center', gap: '12px' },
  testimonialAvatar: { width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a73e8, #0d47a1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800' },
  testimonialName: { fontSize: '14px', fontWeight: '700', color: '#1a1a2e', margin: 0 },
  testimonialCity: { fontSize: '12px', color: '#888', margin: 0 },

  // CTA
  cta: { background: 'linear-gradient(135deg, #ff6f00, #e65100)', padding: '80px 40px', textAlign: 'center', color: 'white' },
  ctaContent: { maxWidth: '600px', margin: '0 auto' },
  ctaTitle: { fontSize: '38px', fontWeight: '900', margin: '0 0 15px 0' },
  ctaDesc: { fontSize: '17px', opacity: 0.9, margin: '0 0 35px 0', lineHeight: 1.6 },
  ctaBtns: { display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' },
  ctaBtn: { backgroundColor: 'white', color: '#ff6f00', border: 'none', padding: '16px 40px', borderRadius: '35px', cursor: 'pointer', fontSize: '17px', fontWeight: '800', boxShadow: '0 6px 20px rgba(0,0,0,0.2)' },
  ctaBtnOutline: { backgroundColor: 'transparent', color: 'white', border: '2px solid white', padding: '16px 40px', borderRadius: '35px', cursor: 'pointer', fontSize: '17px', fontWeight: '700' },

  // Footer
  footer: { background: 'rgba(13,17,23,0.88)', backdropFilter: 'blur(10px)', color: '#aaa', position: 'relative', zIndex: 1 },
  footerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '40px 60px', flexWrap: 'wrap', gap: '20px' },
  footerLogo: { fontSize: '22px', fontWeight: '800', color: 'white', margin: '0 0 6px 0' },
  footerTagline: { fontSize: '13px', color: '#888', margin: 0 },
  footerLinks: { display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '13px' },
  footerBottom: { borderTop: '1px solid #222', padding: '20px 60px', textAlign: 'center', fontSize: '13px' },
};
