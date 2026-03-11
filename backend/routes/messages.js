const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', messageController.getHistory);
router.get('/conversations', messageController.getConversations);

module.exports = router;
