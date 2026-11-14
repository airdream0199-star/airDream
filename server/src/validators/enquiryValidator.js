const { body } = require('express-validator');

const createEnquiryValidator = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Customer full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone or WhatsApp number is required')
    .isLength({ min: 5, max: 25 })
    .withMessage('Phone number must be valid'),
  body('city').optional().trim(),
  body('destination').optional().trim(),
  body('serviceRequired').optional().trim(),
  body('travelDate').optional().trim(),
  body('travellerCount').optional().trim(),
  body('budget').optional().trim(),
  body('paymentPreference').optional().trim(),
  body('message').optional().trim(),
  body('source').optional().trim(),
];

const updateEnquiryValidator = [
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Quoted', 'Converted', 'Closed'])
    .withMessage('Invalid enquiry status'),
  body('adminNotes').optional().trim(),
  body('isRead').optional().isBoolean(),
];

module.exports = {
  createEnquiryValidator,
  updateEnquiryValidator,
};
