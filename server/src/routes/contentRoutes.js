const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// Public aggregate endpoint for initial site hydration
router.get('/', contentController.getAllSiteContent);

module.exports = router;
