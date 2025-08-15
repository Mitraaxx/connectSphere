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
  imageUrl: {
    type: String,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId, // This creates a reference to another model
    ref: 'User', // The model to which we are referring
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
