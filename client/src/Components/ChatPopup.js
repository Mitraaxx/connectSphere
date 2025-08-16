import React, { useState, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { useAuth } from '../Context/AuthContext';
import { useSocket } from '../Context/SocketContext';
import axios from 'axios';

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


// --- STYLED COMPONENTS ---
const ChatOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  display: flex; justify-content: center; align-items: center;
  z-index: 1100;
  opacity: 0;
  padding: 20px;
  box-sizing: border-box;
  animation: fadeIn 0.3s forwards;
  @keyframes fadeIn { to { opacity: 1; } }
`;

const ChatContainer = styled.div`
  width: 100%;
  max-width: 380px;
  height: 70vh;
  max-height: 600px;
  background: rgba(249, 249, 249, 0.8);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  display: flex;
  flex-direction: column;
  transform: scale(0.95);
  animation: scaleUp 0.3s forwards;
  @keyframes scaleUp { to { transform: scale(1); } }

  @media (max-width: 480px) {
    height: 80vh;
    max-height: 90%;
  }
`;

const Header = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;

  span {
    font-weight: 500;
    font-size: 1.2rem;
    color: #1a1a1a;
  }

  @media (max-width: 480px) {
    padding: 12px 15px;
    span {
        font-size: 1rem;
    }
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  &:hover {
    background-color: rgba(0,0,0,0.1);
  }
`;

const MessageArea = styled.div`
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); border-radius: 10px; }
  
  @media (max-width: 480px) {
    padding: 15px;
  }
`;

const Message = styled.div`
  max-width: 75%;
  padding: 10px 15px;
  border-radius: 18px;
  font-size: 0.95rem;
  line-height: 1.4;
  word-wrap: break-word;
  align-self: ${props => (props.$isSender ? 'flex-end' : 'flex-start')};
  background: ${props => (props.$isSender ? '#000' : '#fff')};
  color: ${props => (props.$isSender ? 'white' : 'black')};
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
`;

const InputArea = styled.form`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);

  @media (max-width: 480px) {
    padding: 10px 15px;
    gap: 8px;
  }
`;

const sharedInputStyles = css`
  width: 100%;
  padding: 12px 16px;
  font-size: 0.95rem;
  border-radius: 12px;
  box-sizing: border-box;
  border: 1px solid transparent;
  background-color: rgba(228, 228, 229, 0.6);
  color: #1c1c1e;
  transition: all 0.2s ease-in-out;

  &::placeholder {
    color: #8e8e93;
  }

  &:focus {
    outline: none;
    background-color: white;
    border-color: rgba(0, 0, 0, 0.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StyledInput = styled.input`
  ${sharedInputStyles}
  flex-grow: 1;
`;

const SendButton = styled.button`
    flex-shrink: 0;
    width: 45px;
    height: 45px;
    border: none;
    border-radius: 12px;
    background-color: #000;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease-in-out;

    &:hover {
        background-color: #333;
        transform: scale(1.05);
    }

    &:disabled {
        background-color: #888;
        cursor: not-allowed;
    }

    @media (max-width: 480px) {
        width: 40px;
        height: 40px;
    }
`;


// --- REACT COMPONENT ---
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
        <ChatOverlay onClick={onClose}>
            <ChatContainer onClick={(e) => e.stopPropagation()}>
                <Header>
                    <span>Chat with {recipient.username}</span>
                    <CloseButton onClick={onClose}><CloseIcon /></CloseButton>
                </Header>
                <MessageArea ref={messageAreaRef}>
                    {messageList.map((msg, index) => (
                        <Message key={index} $isSender={msg.senderId === user._id || msg.author === user.username}>
                            {msg.message}
                        </Message>
                    ))}
                </MessageArea>
                <InputArea onSubmit={sendMessage}>
                    <StyledInput
                        type="text"
                        value={currentMessage}
                        placeholder="Type a message..."
                        onChange={(e) => setCurrentMessage(e.target.value)}
                    />
                    <SendButton type="submit" disabled={!currentMessage.trim()}>
                        <SendIcon />
                    </SendButton>
                </InputArea>
            </ChatContainer>
        </ChatOverlay>
    );
};

export default ChatPopup;
