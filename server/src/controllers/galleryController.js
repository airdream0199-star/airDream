const GalleryItem = require('../models/GalleryItem');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getAllGalleryItems = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.isPublic === 'true') {
      query.isActive = true;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }
    const items = await GalleryItem.find(query).sort({ order: 1, createdAt: -1 }).lean();
    return sendSuccess(res, items, 'Gallery items retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getGalleryItemById = async (req, res, next) => {
  try {
    const item = await GalleryItem.findById(req.params.id).lean();
    if (!item) {
      return sendError(res, 'Gallery item not found', 404);
    }
    return sendSuccess(res, item, 'Gallery item retrieved');
  } catch (error) {
    next(error);
  }
};

exports.createGalleryItem = async (req, res, next) => {
  try {
    const item = new GalleryItem(req.body);
    const saved = await item.save();
    return sendSuccess(res, saved, 'Gallery item created successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.updateGalleryItem = async (req, res, next) => {
  try {
    const updated = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return sendError(res, 'Gallery item not found', 404);
    }
    return sendSuccess(res, updated, 'Gallery item updated successfully');
  } catch (error) {
    next(error);
  }
};

exports.deleteGalleryItem = async (req, res, next) => {
  try {
    const deleted = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return sendError(res, 'Gallery item not found', 404);
    }
    return sendSuccess(res, { id: req.params.id }, 'Gallery item deleted successfully');
  } catch (error) {
    next(error);
  }
};
