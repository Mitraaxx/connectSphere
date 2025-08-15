import React, { useState } from 'react'; // --- FIXED: Consolidated useState import
import styled from 'styled-components';
import { useItems } from '../Context/ItemContext';
import { useAuth } from '../Context/AuthContext';
import ItemForm from '../Components/ItemForm';
import { Link } from 'react-router-dom';
import LocationPopup from '../Components/LocationPopup'; // --- ADDED: Import the popup component

// --- ICONS ---
const UserIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#333"/></svg>);
const AddIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/></svg>);
const LogoutIcon = ({ color = "currentColor" }) => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 7L15.59 8.41L17.17 10H8V12H17.17L15.59 13.59L17 15L21 11L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill={color}/></svg>);

// --- STYLED COMPONENTS ---
const PageWrapper = styled.div`
  height: 100vh;
  width: 100%;
  position: fixed;
  background-image: url('/Nature.png');
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const HomePageContainer = styled.div`
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
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
`;

const HeaderGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const NavLink = styled(Link)`
  padding: 8px 16px;
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.05);
  color: #000;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const AddItemButton = styled.button`
  display: flex; align-items: center; gap: 8px;
  padding: 8px 16px;
  border: none; border-radius: 10px;
  background-color: #000;
  color: #fff;
  font-family: inherit; /* FIX: Inherit global font */
  font-size: 0.9rem;
  
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  &:hover { background-color: #333; }
`;

const UserProfile = styled.div`
  display: flex; align-items: center; gap: 10px;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 8px 12px;
  border-radius: 10px;
  span { color: #1c1c1e; font-weight: 600; font-size: 1rem; }
`;

const LogoutButton = styled.button`
    display: flex; align-items: center;
    gap: 6px; padding: 8px;
    border: none; border-radius: 10px;
    background-color: rgba(0, 0, 0, 0.05);
    color: #c0392b;
    font-family: inherit; /* FIX: Inherit global font */
    font-size: 0.9rem; font-weight: 300;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    &:hover { background-color: rgba(224, 82, 99, 0.1); }
`;

const MainContent = styled.main`
  flex-grow: 1; padding: 25px 30px;
  color: #1c1c1e; overflow-y: auto;
  h2 {
    font-size: 1.8rem; font-weight: 540;
    margin: 0 0 1.5rem;
    text-align: left;
  }
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); border-radius: 10px; }
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
`;

const ItemCard = styled.div`
  background: #fff; border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  display: flex; flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
  img {
    width: 100%; height: 160px;
    object-fit: cover;
  }
`;

const CardContent = styled.div`
  padding: 15px;
  display: flex; flex-direction: column;
  flex-grow: 1;
  h3 { margin: 0 0 5px; font-size: 1.1rem; }
  p { margin: 0 0 1rem; font-size: 0.85rem; color: #8e8e93; flex-grow: 1; }
`;

const CardFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
`;

const CardButton = styled.button`
  width: 100%; padding: 10px;
  border: none; border-radius: 10px;
  font-family: inherit; /* FIX: Inherit global font */
  font-size: 0.9rem; 
  cursor: pointer;
  transition: background-color 0.2s ease;
`;

const ContactButton = styled(CardButton)`
  background-color: #f2f2f7; 
  color: #007AFF;
  &:hover { background-color: #e5e5ea; }
`;

const LocationButton = styled(CardButton)`
  background-color: #f2f2f7;
  color: #5856d6;
  &:hover { background-color: #e5e5ea; }
`;


// --- REACT COMPONENT ---
const HomePage = () => {
    const { user, logout } = useAuth();
    const { items } = useItems();
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);

    const otherUsersItems = items.filter(item => item.owner?._id !== user?._id);

    return (
        <PageWrapper>
            <HomePageContainer>
                <Header>
                    <HeaderGroup>
                        <UserProfile>
                            <UserIcon />
                            <span>{user?.username || 'User'}</span>
                        </UserProfile>
                        <LogoutButton onClick={logout}>
                            <LogoutIcon color="#c0392b" />
                        </LogoutButton>
                    </HeaderGroup>

                    <HeaderGroup>
                        <NavLink to="/my-items">My Resources</NavLink>
                        <AddItemButton onClick={() => setIsFormVisible(true)}>
                            <AddIcon />
                            Add Resource
                        </AddItemButton>
                    </HeaderGroup>
                </Header>
                <MainContent>
                    <h2>Available Resources</h2>
                    <ItemsGrid>
                        {otherUsersItems.length > 0 ? (
                            otherUsersItems.map(item => (
                                <ItemCard key={item._id}>
                                    <img src={`http://localhost:5000/images/${item.imageUrl}`} alt={item.name} />
                                    <CardContent>
                                        <h3>{item.name}</h3>
                                        <p>By {item.owner?.username}</p>
                                        <CardFooter>
                                            <ContactButton>Contact</ContactButton>
                                            {item.location && item.location.address && (
                                                <LocationButton onClick={() => setSelectedLocation(item.location)}>
                                                    View Location
                                                </LocationButton>
                                            )}
                                        </CardFooter>
                                    </CardContent>
                                </ItemCard>
                            ))
                        ) : (
                            <p>No Resources Available</p>
                        )}
                    </ItemsGrid>
                </MainContent>
            </HomePageContainer>

            {isFormVisible && <ItemForm onClose={() => setIsFormVisible(false)} />}

            {selectedLocation && (
                <LocationPopup 
                    location={selectedLocation} 
                    onClose={() => setSelectedLocation(null)} 
                />
            )}
        </PageWrapper>
    );
};

export default HomePage;
