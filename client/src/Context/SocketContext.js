import React, { useContext, createContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

const socket = io.connect("https://connectsphere-wgn7.onrender.com");

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (user) {
            // --- MODIFICATION: Register user with socket server ---
            socket.emit('register_user', user._id);

            const messageHandler = (data) => {
                if (data.senderId !== user._id) {
                    setNotifications((prev) => [...prev, data]);
                    toast(`${data.author} sent a message!`);
                }
            };
            
            socket.on("receive_message", messageHandler);

            return () => {
                socket.off("receive_message", messageHandler);
            };
        }
    }, [user]);

    const clearNotificationsForItem = (itemId) => {
        setNotifications((prev) => prev.filter(n => n.itemId !== itemId));
    };
    
    const value = {
        socket,
        notifications,
        clearNotificationsForItem,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
