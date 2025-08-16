import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useSocket } from '../Context/SocketContext';
import axios from 'axios';
import './ChatPopup.css';

// --- ICONS ---
const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 6L18 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const SendIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const ChatPopup = ({ chatInfo, onClose }) => {
    const { socket } = useSocket();
    const { user } = useAuth();
    const { recipient, itemId } = chatInfo;

    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);
    const messageAreaRef = useRef(null);

    const room = recipient ? [user._id, recipient._id, itemId].sort().join('_') : null;

    useEffect(() => {
        const fetchMessages = async () => {
            if (room) {
                try {
                    const response = await axios.get(`https://connectsphere-wgn7.onrender.com/api/messages/${room}`);
                    setMessageList(response.data);
                } catch (error) {
                    console.error("Failed to fetch messages", error);
                }
            }
        };
        fetchMessages();

        if (socket && room) {
            socket.emit("join_chat", room);
            const messageHandler = (data) => {
                if (data.room === room) {
                    setMessageList((list) => [...list, data]);
                }
            };
            socket.on("receive_message", messageHandler);
            return () => socket.off("receive_message", messageHandler);
        }
    }, [socket, room]);

    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messageList]);

    if (!recipient || !room) {
        return null;
    }

    const sendMessage = async (e) => {
        e.preventDefault();
        if (currentMessage.trim() !== "" && socket) {
            const messageData = {
                room: room,
                author: user.username,
                message: currentMessage,
                senderId: user._id,
                recipientId: recipient._id,
                itemId: itemId,
            };
            setMessageList((list) => [...list, messageData]);
            await socket.emit("send_message", messageData);
            setCurrentMessage("");
        }
    };

    return (
        <div className="chat-overlay" onClick={onClose}>
            <div className="chat-container" onClick={(e) => e.stopPropagation()}>
                <div className="chat-header">
                    <span>Chat with {recipient.username}</span>
                    <button className="close-button" onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="message-area" ref={messageAreaRef}>
                    {messageList.map((msg, index) => (
                        <div key={index} className={`message ${msg.senderId === user._id || msg.author === user.username ? 'sender' : 'receiver'}`}>
                            {msg.message}
                        </div>
                    ))}
                </div>
                <form className="input-area" onSubmit={sendMessage}>
                    <input
                        type="text"
                        className="styled-input"
                        value={currentMessage}
                        placeholder="Type a message..."
                        onChange={(e) => setCurrentMessage(e.target.value)}
                    />
                    <button className="send-button" type="submit" disabled={!currentMessage.trim()}>
                        <SendIcon />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPopup;