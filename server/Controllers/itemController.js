const Item = require("../Models/itemModel");
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'connectsphere-items',
    allowed_formats: ['jpeg', 'png', 'jpg'],
  },
});

const upload = multer({ storage: storage });

const getItems = async (req, res) => {
  try {
    // --- MODIFIED ---
    // Only find items that are either 'available' or have a 'requested' status.
    // This effectively hides items that have been marked as 'lent'.
    const items = await Item.find({ status: { $in: ['available', 'requested'] } })
                            .populate('owner', 'username');
    return res.status(200).json(items);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ... other functions (getItem, addItem, deleteItem) are unchanged ...
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
      imageUrl: req.file.path,
      owner: req.user.id
    });

    newItem = await newItem.populate('owner', 'username');

    return res.status(201).json(newItem);
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
