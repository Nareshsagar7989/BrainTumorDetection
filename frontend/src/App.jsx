/**
 * App.jsx – Root component with React Router v6 setup.
 * Defines public and protected routes, wraps app in AuthProvider and Toaster.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layout
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Upload from './pages/Upload';
import History from './pages/History';
import AdminPanel from './pages/AdminPanel';
import AdminRoute from './components/AdminRoute';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                {/* Toast notifications (top-right, dark theme) */}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: 'rgba(15, 15, 26, 0.95)',
                            color: '#f1f5f9',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(20px)',
                            fontSize: '14px',
                        },
                        success: {
                            iconTheme: { primary: '#22c55e', secondary: '#0f0f1a' },
                        },
                        error: {
                            iconTheme: { primary: '#f43f5e', secondary: '#0f0f1a' },
                        },
                    }}
                />

                {/* Persistent Navbar */}
                <Navbar />

                {/* Route Definitions */}
                <Routes>
                    {/* ── Public Routes ──────────────────────────────────────────────── */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* ── Protected Routes (require login) ────────────────────────── */}
                    <Route
                        path="/upload"
                        element={
                            <ProtectedRoute>
                                <Upload />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/history"
                        element={
                            <ProtectedRoute>
                                <History />
                            </ProtectedRoute>
                        }
                    />
                    
                    {/* ── Admin Route ─────────────────────────────────────────────────── */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminPanel />
                            </AdminRoute>
                        }
                    />

                    {/* ── Fallback: redirect unknown routes to Home ─────────────── */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
