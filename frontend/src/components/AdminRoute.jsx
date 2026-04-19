import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) return null; // or a loading spinner

    // Restrict if not logged in or not an admin
    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
}
