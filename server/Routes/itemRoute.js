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

app.use(verifyToken);

router.get("/", getItems);
router.get("/:id", getItem);
router.post("/",  upload.single("imageUrl"), addItem);
router.delete("/:id", deleteItem);


module.exports = router;
