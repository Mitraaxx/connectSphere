const mongoose = require('mongoose');
const { Schema } = mongoose;

const itemSchema = new Schema({
  name: {
    type: String,
    required: true, 
    trim: true,
  },
  description: {
    type: String,
    required: true, 
  },
  location: {
    type: {
      address: String,
      lat: Number,
      lng: Number
    },
    required: true
  },
  imageUrl: {
    type: String,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // --- MODIFIED ---
  // Changed 'on loan' to 'lent' to represent an item that is
  // no longer active in the main lists.
  status: {
    type: String,
    enum: ['available', 'requested', 'lent'],
    default: 'available',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
