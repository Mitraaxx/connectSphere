import React, { useContext, createContext, useState, useEffect } from 'react';
import api from '../api'; // Import the centralized api instance
import { useAuth } from './AuthContext';

const ItemContext = createContext();

export const useItems = () => {
    return useContext(ItemContext);
};

export const ItemProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const { token } = useAuth() || {};

    const getItems = async () => {
        try {
            const response = await api.get('/items');
            setItems(response.data);
        } catch (error) {
            console.error("Failed to fetch items", error);
        }
    };

    const addItem = async (formData) => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            const response = await api.post('/items', formData, config);
            setItems(prevItems => [response.data, ...prevItems]);
            return response;
        } catch (error) {
            console.error("Failed to add item", error);
            throw error;
        }
    };

    const deleteItem = async (itemId) => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            await api.delete(`/items/${itemId}`, config);
            setItems(prevItems => prevItems.filter(item => item._id !== itemId));
        } catch (error) {
            console.error("Failed to delete item", error);
            throw error;
        }
    };

    useEffect(() => {
        if (token) {
            getItems();
        }
    }, [token]);

    const value = {
        items,
        getItems,
        addItem,
        deleteItem,
    };

    return <ItemContext.Provider value={value}>{children}</ItemContext.Provider>;
};
