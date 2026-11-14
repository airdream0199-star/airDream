const Activity = require('../models/Activity');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

exports.getAllActivities = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.isPublic === 'true') {
      query.isActive = true;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }

    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);

    if (page && limit) {
      const skip = (page - 1) * limit;
      const [activities, total] = await Promise.all([
        Activity.find(query).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
        Activity.countDocuments(query),
      ]);
      const totalPages = Math.ceil(total / limit);
      return sendPaginated(res, activities, { page, limit, total, totalPages });
    }

    const activities = await Activity.find(query).sort({ order: 1, createdAt: -1 }).lean();
    return sendSuccess(res, activities, 'Activities retrieved successfully');
  } catch (error) {
    next(error);
  }
};

exports.getActivityById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let activity = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      activity = await Activity.findById(id).lean();
    }
    if (!activity) {
      activity = await Activity.findOne({ slug: id }).lean();
    }
    if (!activity) {
      return sendError(res, 'Activity not found', 404);
    }
    return sendSuccess(res, activity, 'Activity retrieved');
  } catch (error) {
    next(error);
  }
};

exports.createActivity = async (req, res, next) => {
  try {
    const activity = new Activity(req.body);
    const saved = await activity.save();
    return sendSuccess(res, saved, 'Activity created successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.updateActivity = async (req, res, next) => {
  try {
    const updated = await Activity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return sendError(res, 'Activity not found', 404);
    }
    return sendSuccess(res, updated, 'Activity updated successfully');
  } catch (error) {
    next(error);
  }
};

exports.deleteActivity = async (req, res, next) => {
  try {
    const deleted = await Activity.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return sendError(res, 'Activity not found', 404);
    }
    return sendSuccess(res, { id: req.params.id }, 'Activity deleted successfully');
  } catch (error) {
    next(error);
  }
};
