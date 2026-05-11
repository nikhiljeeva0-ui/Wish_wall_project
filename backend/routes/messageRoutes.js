const express = require('express');
const { 
  getAllMessages, 
  createMessage, 
  deleteMessage 
} = require('../controllers/messageController');

const router = express.Router();

router.get('/', getAllMessages);
router.post('/', createMessage);
router.delete('/:id', deleteMessage);

module.exports = router;
