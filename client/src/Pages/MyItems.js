import React from 'react';
import styled from 'styled-components';
import { useItems } from '../Context/ItemContext';
import { useAuth } from '../Context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// --- ICONS ---
const UserIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#333"/></svg>
);

const DeleteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/></svg>
);

// --- STYLED COMPONENTS ---

// --- ✨ Theme Update: Matched wrapper to homepage style ---
const PageWrapper = styled.div`
  height: 100vh;
  width: 100%;
  position: fixed;
  background-image: url('/Nature.png');
  background-size: cover;
  background-position: center;
  font-family: 'Inter', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center; /* Centered layout */
`;

// --- ✨ Theme Update: Matched container to homepage style ---
const Container = styled.div`
  width: 95%;
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
`;

const Header = styled.header`
  padding: 12px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08); /* Thinner border */
  flex-shrink: 0;
`;

// --- ✨ Theme Update: Matched NavLink to secondary button style ---
const NavLink = styled(Link)`
  padding: 8px 16px;
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.05);
  color: #000;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const UserProfile = styled.div`
  display: flex; align-items: center; gap: 10px;
  background-color: rgba(0, 0, 0, 0.05); /* Matched background */
  padding: 8px 12px; /* Added padding */
  border-radius: 10px; /* Matched radius */
  transition: all 0.2s ease-in-out;
  span { color: #1c1c1e; font-weight: 600; font-size: 1rem; }
`;

const MainContent = styled.main`
  flex-grow: 1; padding: 25px 30px;
  overflow-y: auto;
  h2 {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0 0 1.5rem;
    text-align: left; /* Matched alignment */
    color: #1c1c1e;
  }
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); border-radius: 10px; }
`;

// --- ✨ Theme Update: Matched grid to homepage style ---
const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); /* Smaller cards */
  gap: 1.5rem;
`;

// --- ✨ Theme Update: Matched card to homepage style ---
const ItemCard = styled.div`
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
  img {
    width: 100%;
    height: 160px; /* Smaller image */
    object-fit: cover;
  }
`;

const CardContent = styled.div`
  padding: 15px;
  h3 {
    margin: 0 0 5px;
    font-size: 1.1rem;
    font-weight: 600;
  }
  p {
    margin: 0;
    font-size: 0.85rem;
    color: #8e8e93; /* iOS secondary text color */
  }
`;

// --- ✨ Theme Update: Restyled delete button ---
const DeleteButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: rgba(0, 0, 0, 0.4); /* Frosted glass effect */
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.9;
  backdrop-filter: blur(5px);
  transition: all 0.2s ease-in-out;
  &:hover {
    opacity: 1;
    background-color: #c0392b; /* Reveals red color on hover */
    transform: scale(1.1);
  }
`;

// --- REACT COMPONENT ---
const MyItemsPage = () => {
    const { user } = useAuth();
    const { items, deleteItem } = useItems();

    const myItems = items.filter(item => item.owner?._id === user?._id);

    const handleDelete = async (itemId) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await deleteItem(itemId);
                toast.success("Item deleted successfully!");
            } catch (error) {
                toast.error("Failed to delete item.");
            }
        }
    };

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
                        {myItems.length > 0 ? (
                            myItems.map(item => (
                                <ItemCard key={item._id}>
                                    <img src={`http://localhost:5000/images/${item.imageUrl}`} alt={item.name} />
                                    <DeleteButton onClick={() => handleDelete(item._id)}>
                                        <DeleteIcon />
                                    </DeleteButton>
                                    <CardContent>
                                        <h3>{item.name}</h3>
                                        <p>{item.description}</p>
                                    </CardContent>
                                </ItemCard>
                            ))
                        ) : (
                            <p>You haven't shared any resource yet.</p>
                        )}
                    </ItemsGrid>
                </MainContent>
            </Container>
        </PageWrapper>
    );
};

export default MyItemsPage;