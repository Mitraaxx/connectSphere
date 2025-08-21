const express = require("express");
const router = express.Router();

const {
  getItems,
  getItem,
  addItem,
  deleteItem,
  upload,
} = require("../Controllers/itemController");
const verifyToken = require("../Middleware/auth");


router.get("/", verifyToken,getItems);
router.get("/:id", verifyToken,getItem);
router.post("/", verifyToken, upload.single("imageUrl"), addItem);
router.delete("/:id", verifyToken, deleteItem);


module.exports = router;
