import React, { useContext, createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    // --- UPDATED: Initialize user state from localStorage ---
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        try {
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            return null;
        }
    });

    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, [token]);

    const registerUser = async (username, password) => {
        // This function correctly does NOT log the user in. No changes needed.
        return await axios.post('https://connectsphere-wgn7.onrender.com/api/auth/Register', {
            username,
            password,
        });
    };

    const loginUser = async (username, password) => {
        const response = await axios.post('https://connectsphere-wgn7.onrender.com/api/auth/Login', {
            username,
            password,
        });
        const { token, user } = response.data;
        
        // --- UPDATED: Save both token and user object to localStorage ---
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user)); // <-- ADD THIS LINE

        setToken(token);
        setUser(user);
        return response;
    };

    const logout = () => {
        // --- UPDATED: Remove both token and user from localStorage ---
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // <-- ADD THIS LINE

        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        token,
        registerUser,
        loginUser,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
