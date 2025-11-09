const express = require('express');
const router = express.Router();
const verifyToken = require('../Middleware/auth');
const { getHistory } = require('../Controllers/historyController'); // Import the controller function

// When a GET request comes to the root of this route ('/api/history'),
// first verify the token, then execute the getHistory function.
router.get('/', verifyToken, getHistory);

module.exports = router;

