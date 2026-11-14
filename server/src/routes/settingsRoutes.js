const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authenticate = require('../middleware/authenticate');

// Public
router.get('/', settingsController.getSettings);

// Admin protected
router.put('/', authenticate, settingsController.updateSettings);

module.exports = router;
