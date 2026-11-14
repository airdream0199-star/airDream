const TravelDeal = require('../models/TravelDeal');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

exports.getAllDeals = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.isPublic === 'true') {
      query.isActive = true;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.featured === 'true') {
      query.featured = true;
    }

    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);

    if (page && limit) {
      const skip = (page - 1) * limit;
      const [deals, total] = await Promise.all([
        TravelDeal.find(query).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
        TravelDeal.countDocuments(query),
      ]);
      const totalPages = Math.ceil(total / limit);
      return sendPaginated(res, deals, { page, limit, total, totalPages });
    }

    const deals = await TravelDeal.find(query).sort({ order: 1, createdAt: -1 }).lean();
    return sendSuccess(res, deals, 'Travel deals retrieved successfully');
  } catch (error) {
    next(error);
  }
};

exports.getDealBySlugOrId = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let deal = null;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      deal = await TravelDeal.findById(identifier).lean();
    }
    if (!deal) {
      deal = await TravelDeal.findOne({ slug: identifier }).lean();
    }

    if (!deal) {
      return sendError(res, 'Package deal not found', 404);
    }

    return sendSuccess(res, deal, 'Deal retrieved');
  } catch (error) {
    next(error);
  }
};

exports.createDeal = async (req, res, next) => {
  try {
    const deal = new TravelDeal(req.body);
    const saved = await deal.save();
    return sendSuccess(res, saved, 'Package deal created successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.updateDeal = async (req, res, next) => {
  try {
    const updated = await TravelDeal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return sendError(res, 'Package deal not found', 404);
    }
    return sendSuccess(res, updated, 'Package deal updated successfully');
  } catch (error) {
    next(error);
  }
};

exports.deleteDeal = async (req, res, next) => {
  try {
    const deleted = await TravelDeal.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return sendError(res, 'Package deal not found', 404);
    }
    return sendSuccess(res, { id: req.params.id }, 'Package deal deleted successfully');
  } catch (error) {
    next(error);
  }
};
