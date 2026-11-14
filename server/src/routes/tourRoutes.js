const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const authenticate = require('../middleware/authenticate');
const validateRequest = require('../middleware/validateRequest');
const { tourValidator } = require('../validators/contentValidators');

// Public
router.get('/', tourController.getAllTours);
router.get('/:identifier', tourController.getTourBySlugOrId);

// Admin protected
router.post('/', authenticate, tourValidator, validateRequest, tourController.createTour);
router.put('/:id', authenticate, tourController.updateTour);
router.delete('/:id', authenticate, tourController.deleteTour);

module.exports = router;
