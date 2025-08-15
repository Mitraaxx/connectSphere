// controllers/itemController.js

// Import the Item model (make sure the path is correct)
const Item = require("../Models/itemModel"); 
const multer = require('multer');

// --- Multer Configuration for Image Uploads ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split('/')[1];
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

const getItems = async (req, res) => {
  try {
    // Find all items and populate the 'owner' field with their username
    // Mongoose includes '_id' by default, so owner will be { _id, username }
    const items = await Item.find().populate('owner', 'username');
    return res.status(200).json(items);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'username');
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(item);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const addItem = async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: "Name and description are required fields." });
  }

  if (!req.file) {
    return res.status(400).json({ message: "An item image is required." });
  }

  try {
    // Create a new item in the database
    let newItem = await Item.create({
      name,
      description,
      imageUrl: req.file.filename, // Save the generated filename
      owner: req.user.id // Link the item to the logged-in user
    });

    // ✨ --- RECOMMENDED CHANGE --- ✨
    // Populate the owner field before sending the response to the client.
    // This ensures the frontend immediately has access to the owner's username.
    newItem = await newItem.populate('owner', 'username');

    return res.status(201).json(newItem); // 201 status for successful creation
  } catch (err) {
    return res.status(500).json({ message: "Failed to add item", error: err.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "User not authorized to delete this item" });
    }

    await Item.deleteOne({ _id: req.params.id });
    
    res.status(200).json({ message: "Item successfully deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete item", error: err.message });
  }
};

module.exports = {
  getItems,
  getItem,
  addItem,
  deleteItem,
  upload 
};
