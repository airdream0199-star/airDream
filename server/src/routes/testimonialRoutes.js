const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const authenticate = require('../middleware/authenticate');
const validateRequest = require('../middleware/validateRequest');
const { testimonialValidator } = require('../validators/contentValidators');

// Public
router.get('/', testimonialController.getAllTestimonials);
router.get('/:id', testimonialController.getTestimonialById);

// Admin protected
router.post('/', authenticate, testimonialValidator, validateRequest, testimonialController.createTestimonial);
router.put('/:id', authenticate, testimonialController.updateTestimonial);
router.delete('/:id', authenticate, testimonialController.deleteTestimonial);

module.exports = router;
