// src/Context/ItemContext.js

import React, { useContext, createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ItemContext = createContext();

export const useItems = () => {
    return useContext(ItemContext);
};

export const ItemProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const { token } = useAuth();

    const getItems = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/items');
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
            const response = await axios.post('http://localhost:5000/api/items', formData, config);
            // Add the new item (with populated owner) to the start of the list
            setItems(prevItems => [response.data, ...prevItems]); 
            return response;
        } catch (error) {
            console.error("Failed to add item", error);
            throw error; 
        }
    };
    
    // --- ✨ NEW FUNCTION ---
    // Handles deleting an item by its ID
    const deleteItem = async (itemId) => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            await axios.delete(`http://localhost:5000/api/items/${itemId}`, config);
            // Update the local state by filtering out the deleted item
            setItems(prevItems => prevItems.filter(item => item._id !== itemId));
        } catch (error) {
            console.error("Failed to delete item", error);
            // Re-throw the error so the component can catch it
            throw error;
        }
    };
    
    useEffect(() => {
        // Fetch items whenever the auth token changes (i.e., on login)
        if (token) {
            getItems();
        }
    }, [token]);

    const value = {
        items,
        getItems,
        addItem,
        deleteItem, // --- EXPORT THE NEW FUNCTION ---
    };

    return <ItemContext.Provider value={value}>{children}</ItemContext.Provider>;
};
