const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const authenticate = require('../middleware/authenticate');
const validateRequest = require('../middleware/validateRequest');
const { transferValidator } = require('../validators/contentValidators');

// Public
router.get('/', transferController.getAllTransfers);
router.get('/:id', transferController.getTransferById);

// Admin protected
router.post('/', authenticate, transferValidator, validateRequest, transferController.createTransfer);
router.put('/:id', authenticate, transferController.updateTransfer);
router.delete('/:id', authenticate, transferController.deleteTransfer);

module.exports = router;
