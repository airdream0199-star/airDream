const Tour = require('../models/Tour');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

exports.getAllTours = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.isPublic === 'true') {
      query.isActive = true;
    }
    if (req.query.section) {
      query.section = req.query.section;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { location: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { section: searchRegex },
      ];
    }

    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);

    if (page && limit) {
      const skip = (page - 1) * limit;
      const [tours, total] = await Promise.all([
        Tour.find(query).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
        Tour.countDocuments(query),
      ]);
      const totalPages = Math.ceil(total / limit);
      return sendPaginated(res, tours, { page, limit, total, totalPages });
    }

    const tours = await Tour.find(query).sort({ order: 1, createdAt: -1 }).lean();
    return sendSuccess(res, tours, 'Tours retrieved successfully');
  } catch (error) {
    next(error);
  }
};

exports.getTourBySlugOrId = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let tour = null;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      tour = await Tour.findById(identifier).lean();
    }
    if (!tour) {
      tour = await Tour.findOne({ slug: identifier }).lean();
    }

    if (!tour) {
      return sendError(res, 'Tour not found', 404);
    }

    return sendSuccess(res, tour, 'Tour retrieved');
  } catch (error) {
    next(error);
  }
};

exports.createTour = async (req, res, next) => {
  try {
    const tour = new Tour(req.body);
    const saved = await tour.save();
    return sendSuccess(res, saved, 'Tour created successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.updateTour = async (req, res, next) => {
  try {
    const updated = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return sendError(res, 'Tour not found', 404);
    }
    return sendSuccess(res, updated, 'Tour updated successfully');
  } catch (error) {
    next(error);
  }
};

exports.deleteTour = async (req, res, next) => {
  try {
    const deleted = await Tour.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return sendError(res, 'Tour not found', 404);
    }
    return sendSuccess(res, { id: req.params.id }, 'Tour deleted successfully');
  } catch (error) {
    next(error);
  }
};
