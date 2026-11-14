const HeroSlide = require('../models/HeroSlide');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getAllSlides = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.isPublic === 'true') {
      query.isActive = true;
    }
    const slides = await HeroSlide.find(query).sort({ order: 1, createdAt: -1 }).lean();
    return sendSuccess(res, slides, 'Hero slides retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getSlideById = async (req, res, next) => {
  try {
    const slide = await HeroSlide.findById(req.params.id).lean();
    if (!slide) {
      return sendError(res, 'Hero slide not found', 404);
    }
    return sendSuccess(res, slide, 'Hero slide retrieved');
  } catch (error) {
    next(error);
  }
};

exports.createSlide = async (req, res, next) => {
  try {
    const slide = new HeroSlide(req.body);
    const saved = await slide.save();
    return sendSuccess(res, saved, 'Hero slide created successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.updateSlide = async (req, res, next) => {
  try {
    const updated = await HeroSlide.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return sendError(res, 'Hero slide not found', 404);
    }
    return sendSuccess(res, updated, 'Hero slide updated successfully');
  } catch (error) {
    next(error);
  }
};

exports.deleteSlide = async (req, res, next) => {
  try {
    const deleted = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return sendError(res, 'Hero slide not found', 404);
    }
    return sendSuccess(res, { id: req.params.id }, 'Hero slide deleted successfully');
  } catch (error) {
    next(error);
  }
};
