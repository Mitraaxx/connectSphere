import React, { useContext, createContext, useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from './AuthContext'; // --- MODIFIED: Ensure useAuth is imported ---
import { useSocket }from './SocketContext';
import toast from 'react-hot-toast';

const ItemContext = createContext();

export const useItems = () => {
    return useContext(ItemContext);
};

export const ItemProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const { token, updateCreditPoints } = useAuth() || {}; // --- MODIFIED: Get updateCreditPoints ---
    const [requests, setRequests] = useState([]);
    const [history, setHistory] = useState([]);
    const { socket } = useSocket();

    useEffect(() => {
        if (socket) {
            const handleNewRequest = (newRequest) => {
                setRequests(prev => {
                    const exists = prev.some(req => req._id === newRequest._id);
                    return exists ? prev : [newRequest, ...prev];
                });
            };

            const handleHistoryUpdate = (newHistoryItem) => {
                setHistory(prev => {
                    const exists = prev.some(item => item._id === newHistoryItem._id);
                    return exists ? prev : [newHistoryItem, ...prev];
                });
            };

            const handleRequestResolved = ({ itemId, status }) => {
                setItems(prevItems =>
                    prevItems.map(item =>
                        item._id === itemId ? { ...item, status: status } : item
                    )
                );
            };

            socket.on('new_request', handleNewRequest);
            socket.on('history_updated', handleHistoryUpdate);
            socket.on('request_resolved', handleRequestResolved);

            return () => {
                socket.off('new_request', handleNewRequest);
                socket.off('history_updated', handleHistoryUpdate);
                socket.off('request_resolved', handleRequestResolved);
            };
        }
    }, [socket]);

    const getItems = async () => {
        try {
            const response = await api.get('/items');
            setItems(response.data);
        } catch (error) {
            console.error("Failed to fetch items", error);
        }
    };

    const fetchReceivedRequests = async () => {
        try {
            const response = await api.get('/requests/received');
            setRequests(response.data);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await api.get('/history');
            setHistory(response.data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    const sendAskRequest = async (itemId) => {
        try {
            await api.post('/requests', { itemId });
            toast.success('Request sent!');
            setItems(prev => prev.map(item =>
                item._id === itemId ? { ...item, status: 'requested' } : item
            ));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request.');
            throw error;
        }
    };
    
    const respondToRequest = async (requestId, status) => {
        try {
            // --- MODIFIED: Get the full response ---
            const response = await api.put(`/requests/${requestId}`, { status });
            toast.success(`Request ${status}!`);
            setRequests(prevRequests => prevRequests.filter(req => req._id !== requestId));
            
            // --- NEW: Check for creditPoints in response and update context ---
            if (response.data && response.data.creditPoints !== undefined) {
                updateCreditPoints(response.data.creditPoints);
            }
            // --- END NEW ---

            getItems();
        } catch (error) {
            toast.error('Failed to respond to request.');
            throw error;
        }
    };

    // --- ADD ITEM (FIXED) ---
    const addItem = async (formData) => {
        try {
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };
            const response = await api.post('/items', formData, config);
            // Add the new item to the top of the list
            setItems(prevItems => [response.data, ...prevItems]);
            return response;
        } catch (error) {
            console.error("Failed to add item", error);
            throw error;
        }
    };

    // --- DELETE ITEM (FIXED) ---
    const deleteItem = async (itemId) => {
        try {
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };
            await api.delete(`/items/${itemId}`, config);
            // Remove the deleted item from the list
            setItems(prevItems => prevItems.filter(item => item._id !== itemId));
        } catch (error) {
            console.error("Failed to delete item", error);
            throw error;
        }
    };

    useEffect(() => {
        if (token) {
            getItems();
            fetchReceivedRequests();
            fetchHistory();
        }
    }, [token]);

    const value = {
        items, getItems, addItem, deleteItem,
        requests, history, sendAskRequest, respondToRequest
    };

    return <ItemContext.Provider value={value}>{children}</ItemContext.Provider>;
};