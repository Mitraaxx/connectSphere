import React, { useState } from 'react';
import api from '../api';
import { useAuth } from '../Context/AuthContext';
import toast from 'react-hot-toast';
import './Reward.css'; // This CSS file is imported

// --- ICONS ---
const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 6L18 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const RewardModal = ({ onClose }) => {
    const [upiId, setUpiId] = useState('');
    const { updateCreditPoints } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!upiId.trim()) {
            toast.error("Please enter a valid UPI ID.");
            return;
        }
        setIsLoading(true);
        try {
            // Call the new rewards endpoint
            const response = await api.post('/rewards/claim', { upiId: upiId.trim() });
            
            // Success!
            toast.success("Reward claimed! Your points have been reset.");
            updateCreditPoints(response.data.creditPoints); // Update points from server response
            onClose();

        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to claim reward.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* Use modal-container class for consistent styling */}
            <div className="modal-container" style={{maxWidth: '400px'}} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Congratulations!</h3>
                    <button className="close-button" onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="reward-modal-content">
                    
                    {/* --- MODIFIED MESSAGE --- */}
                    <p>Congratulations on earning a reward! We sincerely appreciate your contributions to the community. As a token of our gratitude, please enter your UPI ID below to claim your reward. Our team will process your request shortly.</p>
                    
                    {/* Reuse existing form styling */}
                    <form onSubmit={handleSubmit} className="item-form">
                        <div className="input-group">
                            <label className="styled-label" htmlFor="upiId">Your UPI ID</label>
                            <input
                                id="upiId"
                                type="text"
                                placeholder="your-name@upi"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                className="styled-input-form"
                                required
                            />
                        </div>
                        <button type="submit" className="styled-button-form" disabled={isLoading} style={{backgroundColor: '#27ae60'}}>
                            {isLoading ? "Submitting..." : "Claim Reward"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RewardModal;