import React, { useState } from 'react'; // --- MODIFIED: Removed useEffect ---
import { useItems } from '../Context/ItemContext';
import { useAuth } from '../Context/AuthContext';
import ItemForm from '../Components/ItemForm';
import { Link } from 'react-router-dom';
import LocationPopup from '../Components/LocationPopup';
import ChatPopup from '../Components/ChatPopup';
import History from '../Components/History';
import RewardModal from '../Pages/Reward';
import './Home.css';

// --- ICONS ---
const UserIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#333"/></svg>);
const AddIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/></svg>);
const LogoutIcon = ({ color = "currentColor" }) => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 7L15.59 8.41L17.17 10H8V12H17.17L15.59 13.59L17 15L21 11L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill={color}/></svg>);


const HomePage = () => {
    const { user, logout } = useAuth();
    const { items, sendAskRequest, history } = useItems();
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [activeChat, setActiveChat] = useState(null);
    const [activeView, setActiveView] = useState('resources');
    const [isRewardModalVisible, setIsRewardModalVisible] = useState(false); // --- State is still needed ---

    // --- REMOVED: The useEffect that auto-showed the modal ---

    const otherUsersItems = items.filter(item => item.owner?._id !== user?._id);

    const handleContactClick = (item) => {
        if (item && item.owner) {
            setActiveChat({
                recipient: item.owner,
                itemId: item._id
            });
        }
    };

    return (
        <div className="page-wrapper">
            <div className="home-page-container">
                <header className="home-header">
                    <div className="header-group">
                        <div className="user-profile">
                            <UserIcon />
                            {/* --- MODIFIED: Removed points from here --- */}
                            <span>{user?.username || 'User'}</span>
                        </div>
                        
                        {/* --- NEW/MODIFIED POINTS BLOCK --- */}
                        {user && user.creditPoints > 0 ? (
                            <div className="credit-points-box blue">
                                {user.creditPoints}
                            </div>
                        ) : (
                            <button className="credit-points-box green claim" onClick={() => setIsRewardModalVisible(true)}>
                                Claim Reward
                            </button>
                        )}
                        {/* --- END NEW --- */}

                        <button className="logout-button" onClick={logout}>
                            <LogoutIcon color="#c0392b" />
                        </button>
                    </div>

                    <div className="header-group">
                        <button onClick={() => setActiveView('resources')} className={`add-item-button ${activeView === 'resources' ? 'active' : ''}`}>Available Resources</button>
                        <button onClick={() => setActiveView('history')} className={`add-item-button ${activeView === 'history' ? 'active' : ''}`}>History</button>
                        <Link to="/my-items" className="nav-link">My Resources</Link>
                        <button className="add-item-button" onClick={() => setIsFormVisible(true)}>
                            <AddIcon />
                            Add Resource
                        </button>
                    </div>
                </header>
                <main className="main-content">
                    {activeView === 'resources' ? (
                        <>
                            <h2>Available Resources</h2>
                            <div className="items-grid">
                                {otherUsersItems.length > 0 ? (
                                    otherUsersItems.map(item => (
                                        <div className="item-card" key={item._id}>
                                            <img src={item.imageUrl} alt={item.name} onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/EEE/31343C?text=Image+Not+Found'; }}/>
                                            <div className="card-content">
                                                <h3>{item.name}</h3>
                                                <p>By {item.owner?.username}</p>
                                                <div className="card-footer">
                                                    {item.status === 'available' && (
                                                        <button className="card-button location-button" onClick={() => sendAskRequest(item._id)}>Ask</button>
                                                    )}
                                                    {item.status === 'requested' && <span className="item-button">Requested</span>}
                                                   
                                                    <button className="card-button contact-button" onClick={() => handleContactClick(item)}>Contact</button>
                                                    {item.location && item.location.address && (
                                                        <button className="card-button location-button" onClick={() => setSelectedLocation(item.location)}>
                                                            View Location
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No Resources Available</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <History history={history} currentUser={user} />
                    )}
                </main>
            </div>

            {isFormVisible && <ItemForm onClose={() => setIsFormVisible(false)} />}
            {selectedLocation && <LocationPopup location={selectedLocation} onClose={() => setSelectedLocation(null)} />}
            {activeChat && <ChatPopup chatInfo={activeChat} onClose={() => setActiveChat(null)} />}
            
            {/* --- This modal is now triggered by the green button click --- */}
            {isRewardModalVisible && <RewardModal onClose={() => setIsRewardModalVisible(false)} />}
        </div>
    );
};

export default HomePage;