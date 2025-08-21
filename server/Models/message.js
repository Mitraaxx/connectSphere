const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    room: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    author: { type: String, required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    timestamp: { type: Date, default: Date.now }
});


const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

module.exports = Message;
