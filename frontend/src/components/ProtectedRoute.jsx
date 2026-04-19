/**
 * ProtectedRoute.jsx – Route guard for authenticated-only pages.
 * Redirects unauthenticated users to /login.
 * Shows a loading spinner while the auth state is being rehydrated from localStorage.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking localStorage for saved token
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                    <p className="text-white/50 text-sm">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // Redirect to login, but save the current location so we can redirect back after login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
