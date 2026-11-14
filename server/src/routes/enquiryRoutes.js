const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
const authenticate = require('../middleware/authenticate');
const rateLimiter = require('../middleware/rateLimiter');
const validateRequest = require('../middleware/validateRequest');
const { createEnquiryValidator, updateEnquiryValidator } = require('../validators/enquiryValidator');

// Public rate limiter for enquiry submissions (30 submissions per hour per IP)
const enquirySubmissionLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: 'Too many enquiries submitted from this network. Please try again later.',
});

// Public enquiry submission
router.post('/', enquirySubmissionLimiter, createEnquiryValidator, validateRequest, enquiryController.createEnquiry);

// Admin enquiry management (Protected)
router.get('/', authenticate, enquiryController.getAllEnquiries);
router.get('/:id', authenticate, enquiryController.getEnquiryById);
router.patch('/:id', authenticate, updateEnquiryValidator, validateRequest, enquiryController.updateEnquiry);
router.put('/:id', authenticate, updateEnquiryValidator, validateRequest, enquiryController.updateEnquiry);
router.delete('/:id', authenticate, enquiryController.deleteEnquiry);

module.exports = router;
