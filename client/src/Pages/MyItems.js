import React, { useState } from 'react';
import { useItems } from '../Context/ItemContext';
import { useAuth } from '../Context/AuthContext';
import { useSocket } from '../Context/SocketContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api'; // Import the centralized api instance
import ConversationsModal from '../Components/ConversationModal';
import ChatPopup from '../Components/ChatPopup';
import './MyItems.css';

// --- ICONS ---
const DeleteIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/></svg>);
const UserIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#333"/></svg>);

const MyItemsPage = () => {
  const { user } = useAuth();
  const { items, deleteItem } = useItems();
  const { notifications, clearNotificationsForItem } = useSocket();

  const [viewingConversations, setViewingConversations] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [modalSenders, setModalSenders] = useState([]);

  const myItems = items.filter(item => item.owner?._id === user?._id);

  const handleDelete = async itemId => {
    try {
      await deleteItem(itemId);
      toast.success('Item deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete item.');
    }
  };

  const handleOpenConversations = async item => {
    try {
      const response = await api.get(
        `/messages/conversations/${item._id}`,
      );
      setModalSenders(response.data);
      setViewingConversations(item);
    } catch (error) {
      console.error('Failed to fetch conversations', error);
      toast.error('Could not load conversations.');
    }
  };

  const handleCloseConversations = () => {
    if (viewingConversations) {
      clearNotificationsForItem(viewingConversations._id);
    }
    setViewingConversations(null);
  };

  const handleSelectConversation = (sender, item) => {
    setActiveChat({
      recipient: { _id: sender.senderId, username: sender.author },
      itemId: item._id,
    });
    setViewingConversations(null);
  };

  return (
    <div className="page-wrapper">
      <div className="my-items-container">
        <header className="my-items-header">
          <div className="user-profile">
            <UserIcon />
            <span>{user?.username || 'User'}</span>
          </div>
          <Link to="/home" className="nav-link">Back to Home</Link>
        </header>
        <main className="main-content">
          <h2>My Resources</h2>
          <div className="items-grid">
            {myItems.map(item => {
              const itemNotifications = notifications.filter(
                n => n.itemId === item._id && n.senderId !== user._id,
              );
              return (
                <div className="item-card" key={item._id}>
                  <img
                    className="card-image"
                    src={`https://connectsphere-wgn7.onrender.com/images/${item.imageUrl}`}
                    alt={item.name}
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/EEE/31343C?text=Image+Not+Found'; }}
                  />
                  <div className="card-content">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="card-footer-my-items">
                      <button className="card-button messages-button" onClick={() => handleOpenConversations(item)}>
                        Messages
                        {itemNotifications.length > 0 && (
                          <span className="notification-badge">
                            {itemNotifications.length}
                          </span>
                        )}
                      </button>
                      <button className="card-button delete-button" onClick={() => handleDelete(item._id)}>
                        <DeleteIcon />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </main>
      </div>

      {viewingConversations && (
        <ConversationsModal
          item={viewingConversations}
          senders={modalSenders}
          onClose={handleCloseConversations}
          onSelectConversation={sender =>
            handleSelectConversation(sender, viewingConversations)
          }
        />
      )}
      {activeChat && (
        <ChatPopup chatInfo={activeChat} onClose={() => setActiveChat(null)} />
      )}
    </div>
  )
}

export default MyItemsPage;
