const Visa = require('../models/Visa');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

exports.getAllVisas = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.isPublic === 'true') {
      query.isActive = true;
    }
    if (req.query.type) {
      query.type = req.query.type;
    }

    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);

    if (page && limit) {
      const skip = (page - 1) * limit;
      const [visas, total] = await Promise.all([
        Visa.find(query).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
        Visa.countDocuments(query),
      ]);
      const totalPages = Math.ceil(total / limit);
      return sendPaginated(res, visas, { page, limit, total, totalPages });
    }

    const visas = await Visa.find(query).sort({ order: 1, createdAt: -1 }).lean();
    return sendSuccess(res, visas, 'Visas retrieved successfully');
  } catch (error) {
    next(error);
  }
};

exports.getVisaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let visa = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      visa = await Visa.findById(id).lean();
    }
    if (!visa) {
      visa = await Visa.findOne({ slug: id }).lean();
    }
    if (!visa) {
      return sendError(res, 'Visa service not found', 404);
    }
    return sendSuccess(res, visa, 'Visa details retrieved');
  } catch (error) {
    next(error);
  }
};

exports.createVisa = async (req, res, next) => {
  try {
    const visa = new Visa(req.body);
    const saved = await visa.save();
    return sendSuccess(res, saved, 'Visa created successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.updateVisa = async (req, res, next) => {
  try {
    const updated = await Visa.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return sendError(res, 'Visa not found', 404);
    }
    return sendSuccess(res, updated, 'Visa updated successfully');
  } catch (error) {
    next(error);
  }
};

exports.deleteVisa = async (req, res, next) => {
  try {
    const deleted = await Visa.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return sendError(res, 'Visa not found', 404);
    }
    return sendSuccess(res, { id: req.params.id }, 'Visa deleted successfully');
  } catch (error) {
    next(error);
  }
};
