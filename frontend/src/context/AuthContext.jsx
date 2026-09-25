/**
 * AuthContext.jsx – Global authentication state management.
 *
 * Provides:
 *   - user: object | null       → current logged-in user data
 *   - token: string | null      → JWT access token
 *   - isAuthenticated: boolean  → convenience flag
 *   - login(tokenResponse)      → stores token + user info
 *   - logout()                  → clears all auth state
 *   - isLoading: boolean        → true while checking localStorage on mount
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY = 'braintumor_access_token';
const USER_KEY = 'braintumor_user';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Prevents flicker on refresh

    // ── Rehydrate from localStorage on first mount ──────────────────────────────
    useEffect(() => {
        try {
            const savedToken = localStorage.getItem(TOKEN_KEY);
            const savedUser = localStorage.getItem(USER_KEY);

            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            }
        } catch (err) {
            // If localStorage data is corrupt, clear it
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ── Login: called after successful API login ─────────────────────────────────
    const login = useCallback((tokenResponse) => {
        const userData = {
            user_id: tokenResponse.user_id,
            username: tokenResponse.username,
            email: tokenResponse.email,
        };

        setToken(tokenResponse.access_token);
        setUser(userData);

        // Persist in localStorage for page refresh
        localStorage.setItem(TOKEN_KEY, tokenResponse.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }, []);

    // ── Logout: clears all state and localStorage ────────────────────────────────
    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }, []);

    const value = {
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * useAuth – Custom hook to consume AuthContext in any component.
 * Throws an error if used outside <AuthProvider>.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an <AuthProvider>');
    }
    return context;
}
