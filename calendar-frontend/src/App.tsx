import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Calendar from './pages/Calendar'
import About from './pages/About'
import NotFound from './pages/NotFound'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import MagicURL from './pages/auth/MagicURL'
import Logout from './pages/auth/Logout'
import OAuthCallback from './pages/auth/OAuthCallback'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/magic-url" element={<MagicURL />} />
      <Route path="/auth/logout" element={<Logout />} />
      <Route 
        path="/oauth/google/callback" 
        element={
          <ProtectedRoute>
            <OAuthCallback />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/oauth/microsoft/callback" 
        element={
          <ProtectedRoute>
            <OAuthCallback />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/calendar" 
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        } 
      />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
