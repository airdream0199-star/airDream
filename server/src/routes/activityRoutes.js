const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const authenticate = require('../middleware/authenticate');
const validateRequest = require('../middleware/validateRequest');
const { activityValidator } = require('../validators/contentValidators');

// Public
router.get('/', activityController.getAllActivities);
router.get('/:id', activityController.getActivityById);

// Admin protected
router.post('/', authenticate, activityValidator, validateRequest, activityController.createActivity);
router.put('/:id', authenticate, activityController.updateActivity);
router.delete('/:id', authenticate, activityController.deleteActivity);

module.exports = router;
