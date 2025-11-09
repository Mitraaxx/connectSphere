const express = require('express');
const router = express.Router();
const { createRequest, getReceivedRequests, updateRequestStatus } = require('../Controllers/requestController');
const verifyToken = require('../Middleware/auth');

router.post('/', verifyToken, createRequest);
router.get('/received', verifyToken, getReceivedRequests);
router.put('/:requestId', verifyToken, updateRequestStatus);

module.exports = router;