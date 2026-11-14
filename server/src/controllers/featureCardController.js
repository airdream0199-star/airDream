const FeatureCard = require('../models/FeatureCard');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getAllCards = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.isPublic === 'true') {
      query.isActive = true;
    }
    const cards = await FeatureCard.find(query).sort({ order: 1, createdAt: 1 }).lean();
    return sendSuccess(res, cards, 'Feature cards retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getCardById = async (req, res, next) => {
  try {
    const card = await FeatureCard.findById(req.params.id).lean();
    if (!card) {
      return sendError(res, 'Feature card not found', 404);
    }
    return sendSuccess(res, card, 'Feature card retrieved');
  } catch (error) {
    next(error);
  }
};

exports.createCard = async (req, res, next) => {
  try {
    const card = new FeatureCard(req.body);
    const saved = await card.save();
    return sendSuccess(res, saved, 'Feature card created successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.updateCard = async (req, res, next) => {
  try {
    const updated = await FeatureCard.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return sendError(res, 'Feature card not found', 404);
    }
    return sendSuccess(res, updated, 'Feature card updated successfully');
  } catch (error) {
    next(error);
  }
};

exports.deleteCard = async (req, res, next) => {
  try {
    const deleted = await FeatureCard.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return sendError(res, 'Feature card not found', 404);
    }
    return sendSuccess(res, { id: req.params.id }, 'Feature card deleted successfully');
  } catch (error) {
    next(error);
  }
};
