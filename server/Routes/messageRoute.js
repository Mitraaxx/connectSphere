const express = require('express');
const router = express.Router();
const Message = require('../Models/message');
const authMiddleware = require('../Middleware/auth');

// --- FIXED ROUTE ORDER ---
// This more specific route MUST come before the '/:room' route.
// Get all unique conversations for a specific item
router.get('/conversations/:itemId', authMiddleware, async (req, res) => {
    try {
        const { itemId } = req.params;
        const ownerId = req.user.id; // The person requesting is the owner

        // 1. Fetch ALL messages for the item.
        const messages = await Message.find({ itemId: itemId });

        // 2. Use a Map to store unique conversation partners to prevent duplicates.
        const conversationPartners = new Map();

        messages.forEach(message => {
            const senderId = message.sender.toString();
            const recipientId = message.recipient.toString();

            // 3. Identify the "other person" in the chat who is not the owner.
            if (senderId !== ownerId) {
                // If the sender is not the owner, they are a conversation partner.
                if (!conversationPartners.has(senderId)) {
                    conversationPartners.set(senderId, { senderId: senderId, author: message.author });
                }
            } else if (recipientId !== ownerId) {
                // If the owner is the sender, the recipient is the conversation partner.
                // We need to fetch the recipient's username. We'll find another message from them to get their username.
                 if (!conversationPartners.has(recipientId)) {
                    // Find a message from this recipient to get their username
                    const partnerMessage = messages.find(m => m.sender.toString() === recipientId);
                    const authorName = partnerMessage ? partnerMessage.author : 'User'; // Fallback name
                    conversationPartners.set(recipientId, { senderId: recipientId, author: authorName });
                }
            }
        });

        // 4. Convert the Map values back to an array to send as the response.
        const uniqueSenders = Array.from(conversationPartners.values());
        res.json(uniqueSenders);

    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Error fetching conversations' });
    }
});


// Get all messages for a specific room
router.get('/:room', authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({ room: req.params.room }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
});


module.exports = router;
