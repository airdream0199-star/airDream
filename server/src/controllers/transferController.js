const Transfer = require('../models/Transfer');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

exports.getAllTransfers = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.isPublic === 'true') {
      query.isActive = true;
    }

    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);

    if (page && limit) {
      const skip = (page - 1) * limit;
      const [transfers, total] = await Promise.all([
        Transfer.find(query).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
        Transfer.countDocuments(query),
      ]);
      const totalPages = Math.ceil(total / limit);
      return sendPaginated(res, transfers, { page, limit, total, totalPages });
    }

    const transfers = await Transfer.find(query).sort({ order: 1, createdAt: -1 }).lean();
    return sendSuccess(res, transfers, 'Airport transfers retrieved successfully');
  } catch (error) {
    next(error);
  }
};

exports.getTransferById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let transfer = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      transfer = await Transfer.findById(id).lean();
    }
    if (!transfer) {
      transfer = await Transfer.findOne({ slug: id }).lean();
    }
    if (!transfer) {
      return sendError(res, 'Transfer service not found', 404);
    }
    return sendSuccess(res, transfer, 'Transfer details retrieved');
  } catch (error) {
    next(error);
  }
};

exports.createTransfer = async (req, res, next) => {
  try {
    const transfer = new Transfer(req.body);
    const saved = await transfer.save();
    return sendSuccess(res, saved, 'Transfer created successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.updateTransfer = async (req, res, next) => {
  try {
    const updated = await Transfer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return sendError(res, 'Transfer not found', 404);
    }
    return sendSuccess(res, updated, 'Transfer updated successfully');
  } catch (error) {
    next(error);
  }
};

exports.deleteTransfer = async (req, res, next) => {
  try {
    const deleted = await Transfer.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return sendError(res, 'Transfer not found', 404);
    }
    return sendSuccess(res, { id: req.params.id }, 'Transfer deleted successfully');
  } catch (error) {
    next(error);
  }
};
