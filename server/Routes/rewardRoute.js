const express = require('express');
const router = express.Router();
const { claimReward } = require('../Controllers/rewardController');
const verifyToken = require('../Middleware/auth');

// User route to claim a reward
router.post('/claim', verifyToken, claimReward);

module.exports = router;