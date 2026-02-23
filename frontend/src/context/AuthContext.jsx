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

    // --- FIXED NAMING AND ROUTE ---
    const updateUsername = async (newUsername) => {
        try {
            const res = await axios.put('/api/auth/update-username', { username: newUsername });

            // Update the local state while preserving other data (like hasActiveStay)
            const updatedUser = { ...user, username: res.data.username };

            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            showNotification('Identity updated successfully', 'success');
            return true;
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Update failed', 'error');
            return false;
        }
    };

    const login = async (credentials) => {
        try {
            const res = await axios.post('/api/auth/login', credentials);
            if (res.data && res.data.token) {
                let userData = res.data.user;
                const token = res.data.token;

                // Set token immediately for the subsequent booking check
                localStorage.setItem('token', token);
                axios.defaults.headers.common['x-auth-token'] = token;

                /* SYNC FIX: Fetch the user's latest booking status from the database.
                   This prevents the "You must have an active reservation" error 
                   when logging back in.
                */
                try {
                    // Fetch all bookings to find matches for the logging-in user
                    const bookingRes = await axios.get('/api/bookings');

                    // Find any booking for this user that is 'Confirmed' or 'Checked-in'
                    // We normalize the status string to handle potential spacing/casing issues
                    const activeBooking = bookingRes.data.find(b => {
                        const isOwner = (b.userId === userData._id || b.email === userData.email);
                        const statusNormalized = (b.status || '').replace(/\s/g, "").toLowerCase();
                        const isActive = statusNormalized === 'confirmed' || statusNormalized === 'checkedin';
                        return isOwner && isActive;
                    });

                    if (activeBooking) {
                        // Re-inject the necessary flags for the Order page check
                        userData = {
                            ...userData,
                            activeBooking: activeBooking,
                            hasActiveStay: true
                        };
                    } else {
                        // Ensure old flags are cleared if no active stay exists
                        userData = {
                            ...userData,
                            activeBooking: null,
                            hasActiveStay: false
                        };
                    }
                } catch (bookingErr) {
                    console.error("Could not sync active booking on login:", bookingErr);
                }

                // Finalize the user state and storage
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);

                showNotification('Welcome back to Veridian Haveli', 'success');

                // Navigate based on role
                navigate(userData.role === 'admin' ? '/admin' : '/');
            }
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Login Failed', 'error');
        }
    };

    // --- NEW: GOOGLE LOGIN / REGISTRATION HANDLER ---
    const googleLogin = async (credential) => {
        try {
            const res = await axios.post('/api/auth/google', { googleProfile: credential });
            if (res.data && res.data.token) {
                let userData = res.data.user;
                const token = res.data.token;

                // Set token immediately for the subsequent booking check
                localStorage.setItem('token', token);
                axios.defaults.headers.common['x-auth-token'] = token;

                // Synchronize active bookings (identical to standard login)
                try {
                    const bookingRes = await axios.get('/api/bookings');

                    const activeBooking = bookingRes.data.find(b => {
                        const isOwner = (b.userId === userData._id || b.email === userData.email);
                        const statusNormalized = (b.status || '').replace(/\s/g, "").toLowerCase();
                        const isActive = statusNormalized === 'confirmed' || statusNormalized === 'checkedin';
                        return isOwner && isActive;
                    });

                    if (activeBooking) {
                        userData = {
                            ...userData,
                            activeBooking: activeBooking,
                            hasActiveStay: true
                        };
                    } else {
                        userData = {
                            ...userData,
                            activeBooking: null,
                            hasActiveStay: false
                        };
                    }
                } catch (bookingErr) {
                    console.error("Could not sync active booking on Google login:", bookingErr);
                }

                // Finalize the user state and storage
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);

                showNotification('Google Authentication Successful', 'success');

                // Navigate based on role
                navigate(userData.role === 'admin' ? '/admin' : '/');
            }
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Google Login Failed', 'error');
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
            throw err;
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

    const updateFullName = async (newFullName) => {
        try {
            const res = await axios.put('/api/auth/update-fullname', { fullName: newFullName });
            const updatedUser = { ...user, fullName: res.data.fullName };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            showNotification('Guest Name updated successfully', 'success');
            return true;
        } catch (err) {
            showNotification('Failed to update name', 'error');
            return false;
        }
    };

    return (
        // FIXED: Exported updateUsername instead of updateProfile
        <AuthContext.Provider value={{
            user, login, googleLogin, register, logout, updateUsername,
            updateActiveBooking, updateUserStays, updateFullName
        }}>
            {children}
        </AuthContext.Provider>
    );
};