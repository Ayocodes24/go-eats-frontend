import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import RestaurantDetail from './pages/RestaurantDetail'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Delivery from './pages/Delivery'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <Navbar />
            <Routes>
              <Route path="/"                element={<Home />} />
              <Route path="/login"           element={<Login />} />
              <Route path="/register"        element={<Register />} />
              <Route path="/restaurants/:id" element={<RestaurantDetail />} />
              <Route path="/delivery"        element={<Delivery />} />

              <Route path="/cart"            element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/orders"          element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/orders/:id"      element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
            </Routes>
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
