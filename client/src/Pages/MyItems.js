import React, {useState} from 'react';
import styled from 'styled-components'
import { useItems } from '../Context/ItemContext'
import { useAuth } from '../Context/AuthContext'
import { useSocket } from '../Context/SocketContext'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'

import ConversationsModal from '../Components/ConversationModal'
import ChatPopup from '../Components/ChatPopup'

// --- ICONS ---
const DeleteIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/></svg>);
const UserIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#333"/></svg>);


// --- STYLED COMPONENTS ---
const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  background-image: url('/Nature.png');
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
`;

const Container = styled.div`
  width: 100%;
  max-width: 1300px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  background: rgba(249, 249, 249, 0.6);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.4);

  @media (max-width: 768px) {
    height: auto;
    min-height: 90vh;
  }
`;

const Header = styled.header`
  padding: 12px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    padding: 15px;
  }
`;

const NavLink = styled(Link)`
  padding: 8px 16px;
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.05);
  color: #000;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  text-align: center;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 8px 12px;
  border-radius: 10px;
  span {
    color: #1c1c1e;
    font-weight: 600;
    font-size: 1rem;
  }
  @media (max-width: 480px) {
    justify-content: center;
  }
`;

const MainContent = styled.main`
  flex-grow: 1;
  padding: 25px 30px;
  overflow-y: auto;
  h2 {
    font-weight: 500;
    font-size: 1.8rem;
    margin: 0 0 1.5rem;
    text-align: left;
    color: #1c1c1e;
  }
   @media (max-width: 480px) {
    padding: 20px 15px;
    h2 {
      font-size: 1.5rem;
      text-align: center;
    }
  }
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ItemCard = styled.div`
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
`;

const CardContent = styled.div`
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  h3 {
    margin: 0 0 5px;
    font-size: 1.1rem;
  }
  p {
    margin: 0;
    font-size: 0.85rem;
    color: #8e8e93;
    flex-grow: 1;
  }
`;

const CardFooter = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 15px 15px;
  margin-top: 10px;
`;

const CardButton = styled.button`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const MessagesButton = styled(CardButton)`
  background-color: #f2f2f7;
  color: #007aff;
  &:hover {
    background-color: #e5e5ea;
  }
`;

const DeleteButton = styled(CardButton)`
  background-color: #f2f2f7;
  color: #c0392b;
  &:hover {
    background-color: #e5e5ea;
  }
`;

const NotificationBadge = styled.span`
  background-color: #c0392b;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// --- REACT COMPONENT ---
const MyItemsPage = () => {
  const { user } = useAuth()
  const { items, deleteItem } = useItems()
  const { notifications, clearNotificationsForItem } = useSocket()

  const [viewingConversations, setViewingConversations] = useState(null)
  const [activeChat, setActiveChat] = useState(null)
  const [modalSenders, setModalSenders] = useState([])

  const myItems = items.filter(item => item.owner?._id === user?._id)

  const handleDelete = async itemId => {
    try {
      await deleteItem(itemId)
      toast.success('Item deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete item.')
    }
  }

  const handleOpenConversations = async item => {
    try {
      const response = await axios.get(
        `https://connectsphere-wgn7.onrender.com/api/messages/conversations/${item._id}`,
      )
      setModalSenders(response.data)
      setViewingConversations(item)
    } catch (error) {
      console.error('Failed to fetch conversations', error)
      toast.error('Could not load conversations.')
    }
  }

  const handleCloseConversations = () => {
    if (viewingConversations) {
      clearNotificationsForItem(viewingConversations._id)
    }
    setViewingConversations(null)
  }

  const handleSelectConversation = (sender, item) => {
    setActiveChat({
      recipient: { _id: sender.senderId, username: sender.author },
      itemId: item._id,
    })
    setViewingConversations(null)
  }

  return (
    <PageWrapper>
      <Container>
        <Header>
          <UserProfile>
            <UserIcon />
            <span>{user?.username || 'User'}</span>
          </UserProfile>
          <NavLink to="/home">Back to Home</NavLink>
        </Header>
        <MainContent>
          <h2>My Resources</h2>
          <ItemsGrid>
            {myItems.map(item => {
              const itemNotifications = notifications.filter(
                n => n.itemId === item._id && n.senderId !== user._id,
              )
              return (
                <ItemCard key={item._id}>
                  <CardImage
                    src={`https://connectsphere-wgn7.onrender.com/images/${item.imageUrl}`}
                    alt={item.name}
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/EEE/31343C?text=Image+Not+Found'; }}
                  />
                  <CardContent>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <CardFooter>
                      <MessagesButton
                        onClick={() => handleOpenConversations(item)}
                      >
                        Messages
                        {itemNotifications.length > 0 && (
                          <NotificationBadge>
                            {itemNotifications.length}
                          </NotificationBadge>
                        )}
                      </MessagesButton>
                      <DeleteButton onClick={() => handleDelete(item._id)}>
                        <DeleteIcon />
                      </DeleteButton>
                    </CardFooter>
                  </CardContent>
                </ItemCard>
              )
            })}
          </ItemsGrid>
        </MainContent>
      </Container>

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
    </PageWrapper>
  )
}

export default MyItemsPage
