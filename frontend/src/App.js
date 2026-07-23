import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import Feedback from './pages/Feedback';
import Settings from './pages/Settings';

export default function App() {
  const [cart, setCart] = useState([]);
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/home" element={<><Navbar cartCount={cart.length} /><Home cart={cart} setCart={setCart} /></>} />
          <Route path="/login" element={<><Navbar cartCount={cart.length} /><Login /></>} />
          <Route path="/register" element={<><Navbar cartCount={cart.length} /><Register /></>} />
          <Route path="/cart" element={<><Navbar cartCount={cart.length} /><Cart cart={cart} setCart={setCart} /></>} />
          <Route path="/orders" element={<><Navbar cartCount={cart.length} /><Orders /></>} />
          <Route path="/admin" element={<><Navbar cartCount={cart.length} /><AdminDashboard /></>} />
          <Route path="/feedback" element={<><Navbar cartCount={cart.length} /><Feedback /></>} />
          <Route path="/settings" element={<><Navbar cartCount={cart.length} /><Settings /></>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
