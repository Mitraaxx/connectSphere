const History = require('../Models/History');

// This function will be imported and used in the route file.
exports.getHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find all history records where the current user is either the owner or the borrower.
        const history = await History.find({
            $or: [{ owner: userId }, { borrower: userId }]
        })
        .populate('item', 'name imageUrl') // Populate with item details
        .populate('owner', 'username')     // Populate with owner's username
        .populate('borrower', 'username')  // Populate with borrower's username
        .sort({ transactionDate: -1 });    // Sort by most recent
        
        res.status(200).json(history);
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ message: "Server error while fetching history." });
    }
};
