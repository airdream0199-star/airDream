const { body } = require('express-validator');

const tourValidator = [
  body('title').trim().notEmpty().withMessage('Tour title is required'),
  body('price').notEmpty().withMessage('Tour price is required'),
  body('section').optional().trim(),
];

const activityValidator = [
  body('title').trim().notEmpty().withMessage('Activity title is required'),
  body('price').notEmpty().withMessage('Activity price is required'),
];

const travelDealValidator = [
  body('title').trim().notEmpty().withMessage('Package title is required'),
  body('price').notEmpty().withMessage('Price is required'),
];

const visaValidator = [
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('price').notEmpty().withMessage('Visa price is required'),
];

const transferValidator = [
  body('title').trim().notEmpty().withMessage('Transfer vehicle title is required'),
  body('price').notEmpty().withMessage('Transfer price is required'),
];

const testimonialValidator = [
  body('name').trim().notEmpty().withMessage('Customer name is required'),
  body('review').trim().notEmpty().withMessage('Review content is required'),
];

const popupValidator = [
  body('title').optional().trim(),
  body('imageUrl').optional().trim(),
];

module.exports = {
  tourValidator,
  activityValidator,
  travelDealValidator,
  visaValidator,
  transferValidator,
  testimonialValidator,
  popupValidator,
};
