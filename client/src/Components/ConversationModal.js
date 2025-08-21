import React from 'react';
import './ConversationModal.css';

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

const ConversationsModal = ({ item, senders, onClose, onSelectConversation }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Messages for {item.name}</h3>
                    <button className="close-button" onClick={onClose}><CloseIcon /></button>
                </div>
                <ul className="conversation-list">
                    {senders.length > 0 ? (
                        senders.map(sender => (
                            // --- UPDATE ---
                            // The list item now displays the unread count if it's greater than 0.
                            <li key={sender.senderId} className="conversation-list-item" onClick={() => onSelectConversation(sender)}>
                                <div className="conversation-info">
                                    <MessageIcon />
                                    <span>Message from {sender.author}</span>
                                </div>
                                {sender.unreadCount > 0 && (
                                    <span className="unread-badge">{sender.unreadCount}</span>
                                )}
                            </li>
                        ))
                    ) : (
                        <p className="no-messages-text">No messages for this item yet.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ConversationsModal;
