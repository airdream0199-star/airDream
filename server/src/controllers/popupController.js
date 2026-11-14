const Popup = require('../models/Popup');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getActivePopup = async (req, res, next) => {
  try {
    const popup = await Popup.findOne({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
    return sendSuccess(res, popup || null, 'Active popup retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getAllPopups = async (req, res, next) => {
  try {
    const popups = await Popup.find().sort({ order: 1, createdAt: -1 }).lean();
    return sendSuccess(res, popups, 'Popups retrieved');
  } catch (error) {
    next(error);
  }
};

exports.createPopup = async (req, res, next) => {
  try {
    const popup = new Popup(req.body);
    const saved = await popup.save();
    return sendSuccess(res, saved, 'Popup created successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.updatePopup = async (req, res, next) => {
  try {
    const updated = await Popup.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return sendError(res, 'Popup not found', 404);
    }
    return sendSuccess(res, updated, 'Popup updated successfully');
  } catch (error) {
    next(error);
  }
};

exports.deletePopup = async (req, res, next) => {
  try {
    const deleted = await Popup.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return sendError(res, 'Popup not found', 404);
    }
    return sendSuccess(res, { id: req.params.id }, 'Popup deleted successfully');
  } catch (error) {
    next(error);
  }
};
