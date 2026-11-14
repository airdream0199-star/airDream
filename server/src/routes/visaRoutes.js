const express = require('express');
const router = express.Router();
const visaController = require('../controllers/visaController');
const authenticate = require('../middleware/authenticate');
const validateRequest = require('../middleware/validateRequest');
const { visaValidator } = require('../validators/contentValidators');

// Public
router.get('/', visaController.getAllVisas);
router.get('/:id', visaController.getVisaById);

// Admin protected
router.post('/', authenticate, visaValidator, validateRequest, visaController.createVisa);
router.put('/:id', authenticate, visaController.updateVisa);
router.delete('/:id', authenticate, visaController.deleteVisa);

module.exports = router;
