const express = require('express');
const router = express.Router();
const SiteSetting = require('../models/SiteSetting');
const store = require('../utils/dataStore');
const mongoose = require('mongoose');

const dbOk = () => mongoose.connection.readyState === 1;

// GET site settings
router.get('/', async (req, res) => {
  try {
    if (dbOk()) {
      const s = await SiteSetting.findOne({ singleton: 'main' }).lean();
      if (s) {
        const { _id, __v, singleton, ...rest } = s;
        store.getSettings && Object.assign(store.getSettings(), rest);
        return res.json(rest);
      }
    }
    return res.json(store.getSettings());
  } catch (err) {
    return res.json(store.getSettings());
  }
});

// PUT update settings
router.put('/', async (req, res) => {
  try {
    const updated = store.updateSettings(req.body);

    if (dbOk()) {
      await SiteSetting.findOneAndUpdate(
        { singleton: 'main' },
        { $set: { ...req.body, singleton: 'main' } },
        { upsert: true, new: true }
      );
    }
    return res.json({ success: true, settings: updated });
  } catch (err) {
    return res.status(500).json({ message: 'Error saving settings', error: err.message });
  }
});

module.exports = router;
