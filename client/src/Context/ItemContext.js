// src/Context/ItemContext.js

import React, { useContext, createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext'; // Assuming AuthContext exists

const ItemContext = createContext();

export const useItems = () => {
    return useContext(ItemContext);
};

export const ItemProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    // Assuming a useAuth hook that provides the token
    const { token } = useAuth() || {}; // Default to an empty object if useAuth is not available

    const getItems = async () => {
        try {
            const response = await axios.get('https://connectsphere-wgn7.onrender.com/api/items');
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
            const response = await axios.post('https://connectsphere-wgn7.onrender.com/api/items', formData, config);
            setItems(prevItems => [response.data, ...prevItems]);
            return response;
        } catch (error) {
            console.error("Failed to add item", error);
            throw error;
        }
    };

    // This function correctly handles the deletion logic without a popup.
    const deleteItem = async (itemId) => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            await axios.delete(`https://connectsphere-wgn7.onrender.com/api/items/${itemId}`, config);
            // Update the local state by filtering out the deleted item
            setItems(prevItems => prevItems.filter(item => item._id !== itemId));
        } catch (error) {
            console.error("Failed to delete item", error);
            throw error;
        }
    };

    useEffect(() => {
        // Fetch items when the component mounts or when the token changes
        getItems();
    }, [token]);

    const value = {
        items,
        getItems,
        addItem,
        deleteItem,
    };

    return <ItemContext.Provider value={value}>{children}</ItemContext.Provider>;
};