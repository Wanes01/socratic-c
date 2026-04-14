const express = require('express');
const router = express.Router();
const ollamaController = require('../controllers/ollamaController');

router.post('/chat', ollamaController.chat);

module.exports = router;