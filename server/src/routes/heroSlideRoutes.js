const express = require('express');
const router = express.Router();
const heroSlideController = require('../controllers/heroSlideController');
const authenticate = require('../middleware/authenticate');

// Public
router.get('/', heroSlideController.getAllSlides);
router.get('/:id', heroSlideController.getSlideById);

// Admin protected
router.post('/', authenticate, heroSlideController.createSlide);
router.put('/:id', authenticate, heroSlideController.updateSlide);
router.delete('/:id', authenticate, heroSlideController.deleteSlide);

module.exports = router;
