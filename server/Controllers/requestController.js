const Request = require('../Models/Request');
const Item = require('../Models/itemModel');
const History = require('../Models/History');
const User = require('../Models/userModel'); // --- NEW: Import User model

// Create a new request for an item
exports.createRequest = async (req, res) => {
    const { itemId } = req.body;
    const requesterId = req.user.id;
    const io = req.app.get('io');
    const userSocketMap = req.app.get('userSocketMap');

    try {
        const item = await Item.findById(itemId);
        if (!item || item.status !== 'available') {
            return res.status(400).json({ message: "Item is not available for request." });
        }

        // --- Prevent duplicate requests from the same user for the same item ---
        const existingRequest = await Request.findOne({ item: itemId, requester: requesterId, status: 'pending' });
        if (existingRequest) {
            return res.status(400).json({ message: "You have already requested this item." });
        }

        const newRequest = await Request.create({
            item: itemId,
            requester: requesterId,
            owner: item.owner,
        });

        item.status = 'requested';
        await item.save();
        
        // --- Real-time notification to owner ---
        const populatedRequest = await Request.findById(newRequest._id)
            .populate('item', 'name')
            .populate('requester', 'username');

        const ownerSocketId = userSocketMap.get(item.owner.toString());
        if (ownerSocketId) {
            io.to(ownerSocketId).emit('new_request', populatedRequest);
        }

        res.status(201).json(populatedRequest);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all requests received by the logged-in user
exports.getReceivedRequests = async (req, res) => {
    try {
        const requests = await Request.find({ owner: req.user.id, status: 'pending' })
            .populate('item', 'name')
            .populate('requester', 'username');
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Respond to a request (accept or reject)
exports.updateRequestStatus = async (req, res) => {
    const { requestId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    const ownerId = req.user.id;
    const io = req.app.get('io');
    const userSocketMap = req.app.get('userSocketMap');

    try {
        const request = await Request.findById(requestId);
        if (!request || request.owner.toString() !== ownerId) {
            return res.status(404).json({ message: "Request not found or user not authorized." });
        }

        const item = await Item.findById(request.item);
        if (!item) {
             // If item was deleted, just remove the request
            await Request.findByIdAndDelete(requestId);
            return res.status(200).json({ message: "Item no longer exists. Request removed." });
        }

        request.status = status;
        await request.save();

        // --- MODIFIED: Prepare response object ---
        let responseData = { message: `Request ${status}` };

        if (status === 'accepted') {
            item.status = 'lent'; // Item is now lent
            await item.save();

            // --- NEW: Decrement credit points for the owner ---
            const owner = await User.findById(ownerId);
            if (owner && owner.creditPoints > 0) {
                owner.creditPoints -= 1;
                await owner.save();
                responseData.creditPoints = owner.creditPoints; // Add new points total to response
            }
            // --- END NEW ---

            const newHistoryItem = await History.create({
                item: item._id,
                owner: item.owner,
                borrower: request.requester
            });
            
            const populatedHistory = await History.findById(newHistoryItem._id)
                .populate('item', 'name imageUrl')
                .populate('owner', 'username')
                .populate('borrower', 'username');

            // Notify both users
            const ownerSocketId = userSocketMap.get(item.owner.toString());
            const requesterSocketId = userSocketMap.get(request.requester.toString());
            if (ownerSocketId) io.to(ownerSocketId).emit('history_updated', populatedHistory);
            if (requesterSocketId) io.to(requesterSocketId).emit('history_updated', populatedHistory);
            
            await Request.updateMany({ item: item._id, status: 'pending' }, { $set: { status: 'rejected' } });

        } else { // --- THIS IS THE 'REJECTED' LOGIC ---
            const otherPendingRequests = await Request.countDocuments({ item: item._id, status: 'pending' });
            
            // If there are no other pending requests, make the item available again
            if (otherPendingRequests === 0) {
                item.status = 'available';
                await item.save();
            }

            // --- NOTIFY THE REQUESTER THAT THEIR REQUEST WAS REJECTED ---
            const requesterSocketId = userSocketMap.get(request.requester.toString());
            if (requesterSocketId) {
                // Send the item ID and its new 'available' status
                io.to(requesterSocketId).emit('request_resolved', { 
                    itemId: item._id.toString(), 
                    status: 'available' 
                });
            }
        }
        
        // --- MODIFIED: Send the response ---
        res.status(200).json(responseData);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};