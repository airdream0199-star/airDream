const Testimonial = require('../models/Testimonial');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getAllTestimonials = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.isPublic === 'true') {
      query.isActive = true;
    }
    const testimonials = await Testimonial.find(query).sort({ order: 1, createdAt: -1 }).lean();
    return sendSuccess(res, testimonials, 'Testimonials retrieved successfully');
  } catch (error) {
    next(error);
  }
};

exports.getTestimonialById = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id).lean();
    if (!testimonial) {
      return sendError(res, 'Testimonial not found', 404);
    }
    return sendSuccess(res, testimonial, 'Testimonial retrieved');
  } catch (error) {
    next(error);
  }
};

exports.createTestimonial = async (req, res, next) => {
  try {
    const testimonial = new Testimonial(req.body);
    const saved = await testimonial.save();
    return sendSuccess(res, saved, 'Testimonial created successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.updateTestimonial = async (req, res, next) => {
  try {
    const updated = await Testimonial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return sendError(res, 'Testimonial not found', 404);
    }
    return sendSuccess(res, updated, 'Testimonial updated successfully');
  } catch (error) {
    next(error);
  }
};

exports.deleteTestimonial = async (req, res, next) => {
  try {
    const deleted = await Testimonial.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return sendError(res, 'Testimonial not found', 404);
    }
    return sendSuccess(res, { id: req.params.id }, 'Testimonial deleted successfully');
  } catch (error) {
    next(error);
  }
};
