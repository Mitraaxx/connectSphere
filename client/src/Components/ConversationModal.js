import React from 'react';
import styled from 'styled-components';

// --- ICONS ---
const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 6L18 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const MessageIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 11.5C21 16.7467 16.7467 21 11.5 21C11.19 21 10.88 20.99 10.58 20.97C6.83 22.38 3 20.9 3 17.29C3 11.5 3 11.5 3 11.5C3 6.25329 7.25329 2 12.5 2C17.7467 2 22 6.25329 22 11.5C21.68 11.5 21.35 11.5 21 11.5Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


// --- STYLED COMPONENTS (THEME ALIGNED) ---
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  display: flex; justify-content: center; align-items: center;
  z-index: 1050;
  opacity: 0;
  animation: fadeIn 0.3s forwards;
  @keyframes fadeIn { to { opacity: 1; } }
`;

const ModalContainer = styled.div`
  width: 90%;
  max-width: 350px;
  padding: 20px 25px;
  background: rgba(249, 249, 249, 0.7);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  position: relative;
  transform: scale(0.95);
  animation: scaleUp 0.3s forwards;
  @keyframes scaleUp { to { transform: scale(1); } }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  h3 {
    margin: 0;
    font-weight: 500;
    font-size: 1.4rem;
    color: #1a1a1a;
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

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  border-radius: 12px;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease-in-out;
  font-weight: 500;
  color: #333;

  &:hover {
    background-color: white;
    border-color: rgba(0, 0, 0, 0.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const NoMessagesText = styled.p`
  text-align: center;
  color: #888;
  padding: 20px 0;
  font-size: 0.9rem;
`;


const ConversationsModal = ({ item, senders, onClose, onSelectConversation }) => {
    return (
        <ModalOverlay onClick={onClose}>
            <ModalContainer onClick={e => e.stopPropagation()}>
                <Header>
                    <h3>Messages for {item.name}</h3>
                    <CloseButton onClick={onClose}><CloseIcon /></CloseButton>
                </Header>
                <List>
                    {senders.length > 0 ? (
                        senders.map(sender => (
                            <ListItem key={sender.senderId} onClick={() => onSelectConversation(sender)}>
                                <MessageIcon />
                                <span>Message from {sender.author}</span>
                            </ListItem>
                        ))
                    ) : (
                        <NoMessagesText>No messages for this item yet.</NoMessagesText>
                    )}
                </List>
            </ModalContainer>
        </ModalOverlay>
    );
};

export default ConversationsModal;
