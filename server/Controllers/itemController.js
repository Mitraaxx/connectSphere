// controllers/itemController.js

// Import the Item model
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

// --- GET ALL ITEMS ---
const getItems = async (req, res) => {
  try {
    const items = await Item.find().populate('owner', 'username');
    return res.status(200).json(items);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// --- GET A SINGLE ITEM ---
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

// --- ADD A NEW ITEM (MODIFIED FOR LOCATION) ---
const addItem = async (req, res) => {
  const { name, description } = req.body;

  // --- MODIFIED: Parse the location object from the form data ---
  // The frontend sends the location object as a JSON string, so we parse it here.
  const location = req.body.location ? JSON.parse(req.body.location) : null;

  if (!name || !description) {
    return res.status(400).json({ message: "Name and description are required fields." });
  }

  if (!req.file) {
    return res.status(400).json({ message: "An item image is required." });
  }

  try {
    // Create a new item in the database, now including the location
    let newItem = await Item.create({
      name,
      description,
      location, // Add the parsed location object
      imageUrl: req.file.filename,
      owner: req.user.id
    });

    // Populate the owner field before sending the response
    newItem = await newItem.populate('owner', 'username');

    return res.status(201).json(newItem);
  } catch (err) {
    return res.status(500).json({ message: "Failed to add item", error: err.message });
  }
};

// --- DELETE AN ITEM ---
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Ensure the user deleting the item is the owner
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
