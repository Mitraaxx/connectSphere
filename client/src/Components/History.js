import React from 'react';
import './History.css';

const History = ({ history, currentUser }) => {
  if (!history || history.length === 0) {
    return (
      <div>
        <h2>Transaction History</h2>
        <p>No transactions yet.</p>
      </div>
    );
  }

  const givenItems = history.filter(h => h.owner._id === currentUser._id);
  const takenItems = history.filter(h => h.borrower._id === currentUser._id);

  return (
    <div className="history-container">
      <h2>Transaction History</h2>
      
      <div className="history-section">
        <h3>Items You've Given</h3>
        {givenItems.length > 0 ? (
          <div className="history-list">
            {givenItems.map(h => (
              <div key={h._id} className="history-card">
                <img src={h.item.imageUrl} alt={h.item.name} onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/60x60/EEE/31343C?text=...'; }}/>
                <div className="history-details">
                  <p><strong>{h.item.name}</strong> given to <strong>{h.borrower.username}</strong></p>
                  <small>{new Date(h.transactionDate).toLocaleDateString()}</small>
                </div>
              </div>
            ))}
          </div>
        ) : <p>You haven't lent any items.</p>}
      </div>

      <div className="history-section">
        <h3>Items You've Taken</h3>
        {takenItems.length > 0 ? (
          <div className="history-list">
            {takenItems.map(h => (
              <div key={h._id} className="history-card">
                <img src={h.item.imageUrl} alt={h.item.name} onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/60x60/EEE/31343C?text=...'; }}/>
                <div className="history-details">
                  <p><strong>{h.item.name}</strong> taken from <strong>{h.owner.username}</strong></p>
                  <small>{new Date(h.transactionDate).toLocaleDateString()}</small>
                </div>
              </div>
            ))}
          </div>
        ) : <p>You haven't borrowed any items.</p>}
      </div>
    </div>
  );
};

export default History;
