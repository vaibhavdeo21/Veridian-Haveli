import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from './NotificationContext.jsx';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // FIX: Initialize state directly from localStorage so it's ready on the VERY FIRST render
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const navigate = useNavigate();
    const { showNotification } = useNotification();

    // Load token and establish axios headers on refresh to maintain session
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
        }
    }, []);

    const login = async (credentials) => {
        try {
            const res = await axios.post('/api/auth/login', credentials);
            if (res.data && res.data.token) {
                const userData = res.data.user;

                // DEBUG: Check if email exists here!
                console.log("User Data from Server:", userData);

                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(userData));
                axios.defaults.headers.common['x-auth-token'] = res.data.token;

                setUser(userData);
                showNotification('Login Successful', 'success');
                navigate('/');
            }
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Login Failed', 'error');
        }
    };

    const register = async (userData) => {
        try {
            const res = await axios.post('/api/auth/register', userData);

            if (res.status === 201 || res.status === 200) {
                showNotification('Account Created! Please log in.', 'success');
                navigate('/login');
            }
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Registration Failed', 'error');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        showNotification('Logged out successfully', 'info');
        navigate('/');
    };

    const updateActiveBooking = (roomStatus) => {
        if (!user) return;
        const updatedUser = { ...user, activeBooking: roomStatus };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    // SYNC FIX: Function to update user stay count and booking data in profile
    const updateUserStays = (newBooking) => {
        if (!user) return;
        const updatedUser = {
            ...user,
            activeBooking: newBooking,
            hasActiveStay: true
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateActiveBooking, updateUserStays }}>
            {children}
        </AuthContext.Provider>
    );
};