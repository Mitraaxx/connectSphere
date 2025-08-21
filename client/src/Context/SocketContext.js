import React, { useContext, createContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

// Establish a single socket connection for the entire app
const socket = io.connect("https://connectsphere-wgn7.onrender.com");

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    // This state will hold all incoming message notifications
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (user) {
            // This is our global listener for all incoming messages
            const messageHandler = (data) => {
                // We only want to create a notification if the message is from someone else
                if (data.senderId !== user._id) {
                    setNotifications((prev) => [...prev, data]);
                    toast(`${data.author} sent a message!`);
                }
            };
            
            socket.on("receive_message", messageHandler);

            // Important: Clean up the listener when the component unmounts
            return () => {
                socket.off("receive_message", messageHandler);
            };
        }
    }, [user]);

    // Function to clear notifications for a specific item once they are viewed
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
