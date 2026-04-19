/**
 * Navbar.jsx – Responsive navigation bar with auth-aware links.
 * Shows different links depending on login state.
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/');
        setMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    const navLinkClass = (path) =>
        `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(path)
            ? 'bg-primary-600/30 text-primary-400 border border-primary-500/30'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-all duration-300">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                            </svg>
                        </div>
                        <span className="font-display font-bold text-lg text-white group-hover:text-primary-400 transition-colors">
                            Brain<span className="text-gradient">Tumor</span> AI
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-2">
                        <Link to="/" className={navLinkClass('/')}>Home</Link>
                        {isAuthenticated && (
                            <>
                                <Link to="/upload" className={navLinkClass('/upload')}>Upload MRI</Link>
                                <Link to="/history" className={navLinkClass('/history')}>History</Link>
                                {user?.role === 'admin' && (
                                    <Link to="/admin" className={navLinkClass('/admin')}>
                                        Admin Panel
                                    </Link>
                                )}
                            </>
                        )}
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                        {user?.username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="text-sm text-white/80 font-medium">{user?.username}</span>
                                </div>
                                <button onClick={handleLogout} className="btn-secondary !py-2 !px-4 text-sm">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="text-white/70 hover:text-white text-sm font-medium px-4 py-2 transition-colors">
                                    Login
                                </Link>
                                <Link to="/signup" className="btn-primary !py-2 !px-5 text-sm">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        className="md:hidden text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {menuOpen
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            }
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden border-t border-white/10 py-4 space-y-1 animate-slide-up">
                        <Link to="/" className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>Home</Link>
                        {isAuthenticated && (
                            <>
                                <Link to="/upload" className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>Upload MRI</Link>
                                <Link to="/history" className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>History</Link>
                                {user?.role === 'admin' && (
                                    <Link to="/admin" className="block px-4 py-3 text-primary-400 font-semibold hover:bg-white/10 rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
                                )}
                            </>
                        )}
                        {isAuthenticated ? (
                            <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors">
                                Logout
                            </button>
                        ) : (
                            <>
                                <Link to="/login" className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>Login</Link>
                                <Link to="/signup" className="block px-4 py-3 text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors font-semibold" onClick={() => setMenuOpen(false)}>Get Started</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
