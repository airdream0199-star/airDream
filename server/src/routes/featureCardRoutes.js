const express = require('express');
const router = express.Router();
const featureCardController = require('../controllers/featureCardController');
const authenticate = require('../middleware/authenticate');

// Public
router.get('/', featureCardController.getAllCards);
router.get('/:id', featureCardController.getCardById);

// Admin protected
router.post('/', authenticate, featureCardController.createCard);
router.put('/:id', authenticate, featureCardController.updateCard);
router.delete('/:id', authenticate, featureCardController.deleteCard);

module.exports = router;
