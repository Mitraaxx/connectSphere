import React, { useContext, createContext, useState, useEffect } from 'react';
import api from '../api'; // Import the centralized api instance

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
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
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, [token]);

    const registerUser = async (username, password) => {
        return await api.post('/auth/Register', {
            username,
            password,
        });
    };

    const loginUser = async (username, password) => {
        const response = await api.post('/auth/Login', {
            username,
            password,
        });
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        setToken(token);
        setUser(user);
        return response;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
    };

    // --- NEW: Function to update points in state and localStorage ---
    const updateCreditPoints = (newPoints) => {
        setUser(prevUser => {
            if (!prevUser) return null;
            const updatedUser = { ...prevUser, creditPoints: newPoints };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    };
    // --- END NEW ---

    const value = {
        user,
        token,
        registerUser,
        loginUser,
        logout,
        updateCreditPoints // --- NEW: Expose the function ---
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};