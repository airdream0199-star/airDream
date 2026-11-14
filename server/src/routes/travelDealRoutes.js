const express = require('express');
const router = express.Router();
const travelDealController = require('../controllers/travelDealController');
const authenticate = require('../middleware/authenticate');
const validateRequest = require('../middleware/validateRequest');
const { travelDealValidator } = require('../validators/contentValidators');

// Public
router.get('/', travelDealController.getAllDeals);
router.get('/:identifier', travelDealController.getDealBySlugOrId);

// Admin protected
router.post('/', authenticate, travelDealValidator, validateRequest, travelDealController.createDeal);
router.put('/:id', authenticate, travelDealController.updateDeal);
router.delete('/:id', authenticate, travelDealController.deleteDeal);

module.exports = router;
