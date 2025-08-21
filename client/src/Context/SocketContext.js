import React, { useContext, createContext, useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import api from '../api'; // You need a configured axios instance for API calls

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

// Establish a single socket connection for the entire app
const socket = io.connect("https://connectsphere-wgn7.onrender.com");

export const SocketProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [notifications, setNotifications] = useState([]);

    // --- NEW: Fetch missed notifications when the user logs in ---
    useEffect(() => {
        const fetchMissedNotifications = async () => {
            if (user && token) {
                try {
                    // This API call gets all messages where the user is the recipient and isRead is false
                    const response = await api.get('/messages/notifications');
                    setNotifications(prev => {
                        // This logic prevents adding duplicate notifications if one arrives
                        // via socket while the initial fetch is in progress.
                        const existingIds = new Set(prev.map(n => n._id));
                        const newNotifications = response.data.filter(n => !existingIds.has(n._id));
                        return [...prev, ...newNotifications];
                    });
                } catch (error) {
                    console.error("Could not fetch notifications", error);
                }
            }
        };
        fetchMissedNotifications();
    }, [user, token]); // Reruns when the user logs in

    // --- UPDATED: Real-time message listener ---
    useEffect(() => {
        if (user) {
            const messageHandler = (data) => {
                // Check if the notification is from someone else and not already in our state
                if (data.senderId !== user._id && !notifications.some(n => n._id === data._id)) {
                    setNotifications((prev) => [...prev, data]);
                    toast(`${data.author} sent a message!`);
                }
            };
            
            socket.on("receive_message", messageHandler);

            return () => {
                socket.off("receive_message", messageHandler);
            };
        }
    }, [user, notifications]); // Dependency array includes notifications to avoid race conditions

    // --- UPDATED: Function to clear notifications ---
    const clearNotificationsForItem = useCallback(async (itemId) => {
        // First, remove the notifications from the UI for a fast user experience
        setNotifications((prev) => prev.filter(n => n.itemId !== itemId));
        
        // Then, send a request to the backend to update the database
        try {
            await api.post('/messages/mark-as-read', { itemId });
        } catch (error) {
            console.error("Failed to mark notifications as read on the server", error);
            // If the API call fails, you might want to add the notifications back to the UI
        }
    }, []); // useCallback ensures this function doesn't get recreated on every render
    
    const value = {
        socket,
        notifications,
        clearNotificationsForItem,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
