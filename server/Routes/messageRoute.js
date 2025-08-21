const express = require('express');
const router = express.Router();
const Message = require('../Models/message');
const authMiddleware = require('../Middleware/auth');

// --- NEW ROUTE: Get all unread notifications for the logged-in user ---
router.get('/notifications', authMiddleware, async (req, res) => {
    try {
        const notifications = await Message.find({
            recipient: req.user.id,
            isRead: false
        }).sort({ timestamp: 'desc' });
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

// --- NEW ROUTE: Mark messages as read for a specific item conversation ---
router.post('/mark-as-read', authMiddleware, async (req, res) => {
    try {
        const { itemId } = req.body;
        if (!itemId) {
            return res.status(400).json({ message: 'Item ID is required' });
        }
        await Message.updateMany(
            { recipient: req.user.id, itemId: itemId, isRead: false },
            { $set: { isRead: true } }
        );
        res.status(200).json({ message: 'Notifications marked as read' });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ message: 'Error updating notifications' });
    }
});


// Get all unique conversations for a specific item
router.get('/conversations/:itemId', authMiddleware, async (req, res) => {
    try {
        const { itemId } = req.params;
        const ownerId = req.user.id; 

        const messages = await Message.find({ itemId: itemId });

        const conversationPartners = new Map();

        messages.forEach(message => {
            const senderId = message.sender.toString();
            const recipientId = message.recipient.toString();

            if (senderId !== ownerId) {
                if (!conversationPartners.has(senderId)) {
                    conversationPartners.set(senderId, { senderId: senderId, author: message.author });
                }
            } else if (recipientId !== ownerId) {
                 if (!conversationPartners.has(recipientId)) {
                    const partnerMessage = messages.find(m => m.sender.toString() === recipientId);
                    const authorName = partnerMessage ? partnerMessage.author : 'User';
                    conversationPartners.set(recipientId, { senderId: recipientId, author: authorName });
                }
            }
        });

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
