import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('labloom_user');
        const token = localStorage.getItem('labloom_token');
        if (saved && token) {
            try {
                setUser(JSON.parse(saved));
            } catch {
                localStorage.removeItem('labloom_user');
            }
        }
        setLoading(false);
    }, []);

    const saveUser = (userData, token) => {
        setUser(userData);
        localStorage.setItem('labloom_user', JSON.stringify(userData));
        if (token) api.setToken(token);
    };

    // Admin login flow
    const adminRequestOtp = async (phone) => {
        const data = await api.post('/api/admin/request-otp', { phone }, true);
        return data; // { message, otp }
    };

    const adminVerifyOtp = async (phone, otp) => {
        const data = await api.post('/api/admin/verify-otp', { phone, otp }, true);
        // API returns { _id, name, email, phone, role, accessToken } directly
        const userData = { _id: data._id, name: data.name, email: data.email, phone: data.phone, role: data.role || 'admin' };
        saveUser(userData, data.accessToken);
        return data;
    };

    // V2 auth flow (patient/doctor/hospital/lab)
    const signup = async (formData) => {
        const data = await api.post('/api/auth/v2/signup', formData, true);
        if (data.accessToken) {
            const userData = {
                _id: data._id,
                name: data.name,
                role: data.role,
                phone: data.phone,
                isHealthProfileComplete: data.isHealthProfileComplete
            };
            saveUser(userData, data.accessToken);
        }
        return data;
    };

    const requestOtp = async (phone) => {
        const data = await api.post('/api/auth/v2/request-otp', { phone }, true);
        return data; // { message, otp }
    };

    const verifyOtp = async (phone, otp) => {
        const data = await api.post('/api/auth/v2/verify-otp', { phone, otp }, true);
        if (data.accessToken) {
            const userData = {
                _id: data._id || data.user?._id,
                name: data.name || data.user?.name,
                role: data.role || data.user?.role,
                phone,
                isHealthProfileComplete: data.isHealthProfileComplete
            };
            saveUser(userData, data.accessToken);
        }
        return data;
    };

    const logout = () => {
        setUser(null);
        api.clearToken();
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, adminRequestOtp, adminVerifyOtp, signup, requestOtp, verifyOtp, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
