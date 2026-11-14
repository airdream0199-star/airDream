const express = require('express');
const router = express.Router();
const popupController = require('../controllers/popupController');
const authenticate = require('../middleware/authenticate');
const validateRequest = require('../middleware/validateRequest');
const { popupValidator } = require('../validators/contentValidators');

// Public
router.get('/active', popupController.getActivePopup);

// Admin protected
router.get('/', authenticate, popupController.getAllPopups);
router.post('/', authenticate, popupValidator, validateRequest, popupController.createPopup);
router.put('/:id', authenticate, popupValidator, validateRequest, popupController.updatePopup);
router.delete('/:id', authenticate, popupController.deletePopup);

module.exports = router;
