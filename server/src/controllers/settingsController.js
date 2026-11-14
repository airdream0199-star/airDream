const SiteSettings = require('../models/SiteSettings');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getSettings = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne({ singleton: 'main' }).lean();
    if (!settings) {
      settings = await SiteSettings.create({ singleton: 'main' });
    }
    return sendSuccess(res, settings, 'Site settings retrieved');
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const updated = await SiteSettings.findOneAndUpdate(
      { singleton: 'main' },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    return sendSuccess(res, updated, 'Site settings updated successfully');
  } catch (error) {
    next(error);
  }
};
