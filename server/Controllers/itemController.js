// controllers/itemController.js
const Item = require("../Models/itemModel");
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// --- Configure Cloudinary ---
// These keys will be read from your Render environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Configure Multer to use Cloudinary Storage ---
// This tells multer to upload files to your Cloudinary account
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'connectsphere-items', // This will create a folder in Cloudinary for your item images
    allowed_formats: ['jpeg', 'png', 'jpg'],
  },
});

// Initialize multer with the Cloudinary storage engine
const upload = multer({ storage: storage });

// --- GET ALL ITEMS (No changes needed) ---
const getItems = async (req, res) => {
  try {
    const items = await Item.find().populate('owner', 'username');
    return res.status(200).json(items);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// --- GET A SINGLE ITEM (No changes needed) ---
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

// --- ADD A NEW ITEM (Updated for Cloudinary) ---
const addItem = async (req, res) => {
  const { name, description } = req.body;
  const location = req.body.location ? JSON.parse(req.body.location) : null;

  if (!name || !description) {
    return res.status(400).json({ message: "Name and description are required fields." });
  }

  if (!req.file) {
    return res.status(400).json({ message: "An item image is required." });
  }

  try {
    let newItem = await Item.create({
      name,
      description,
      location,
      // ** IMPORTANT CHANGE HERE **
      // Use req.file.path, which now contains the permanent URL from Cloudinary
      imageUrl: req.file.path,
      owner: req.user.id
    });

    newItem = await newItem.populate('owner', 'username');

    return res.status(201).json(newItem);
  } catch (err) {
    return res.status(500).json({ message: "Failed to add item", error: err.message });
  }
};

// --- DELETE AN ITEM (No changes needed, but consider deleting from Cloudinary too) ---
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "User not authorized to delete this item" });
    }

    // Optional: Delete the image from Cloudinary when the item is deleted
    const publicId = item.imageUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`connectsphere-items/${publicId}`);

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
