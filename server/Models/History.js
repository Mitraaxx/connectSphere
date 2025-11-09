const mongoose = require('mongoose');
const { Schema } = mongoose;

const historySchema = new Schema({
    item: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    borrower: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    transactionDate: {
        type: Date,
        default: Date.now,
    }
});

const History = mongoose.model('History', historySchema);
module.exports = History;