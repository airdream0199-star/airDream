const express = require('express');
const router = express.Router();
const Wallpaper = require('../models/Wallpaper');
const store = require('../utils/dataStore');
const mongoose = require('mongoose');

const dbOk = () => mongoose.connection.readyState === 1;

// GET all wallpapers
router.get('/', async (req, res) => {
  try {
    if (dbOk()) {
      const list = await Wallpaper.find({}).sort({ order: 1, createdAt: 1 }).lean();
      return res.json(list.map(d => ({ ...d, _id: String(d._id), id: String(d._id) })));
    }
    return res.json(store.get('wallpapers'));
  } catch (err) {
    return res.json(store.get('wallpapers'));
  }
});

// POST create
router.post('/', async (req, res) => {
  try {
    if (dbOk()) {
      const doc = new Wallpaper(req.body);
      const saved = await doc.save();
      const plain = saved.toObject();
      store.get('wallpapers').unshift({ ...plain, _id: String(plain._id), id: String(plain._id) });
      return res.status(201).json({ ...plain, _id: String(plain._id), id: String(plain._id) });
    }
    // offline fallback
    return res.status(201).json(store.add('wallpapers', req.body));
  } catch (err) {
    return res.status(400).json({ message: 'Error creating wallpaper', error: err.message });
  }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    if (dbOk()) {
      const updated = await Wallpaper.findByIdAndUpdate(req.params.id, req.body, { new: true, upsert: false }).lean();
      if (updated) {
        const plain = { ...updated, _id: String(updated._id), id: String(updated._id) };
        // Sync cache
        const cache = store.get('wallpapers');
        const idx = cache.findIndex(i => String(i._id) === String(updated._id));
        if (idx >= 0) cache[idx] = plain; else cache.unshift(plain);
        return res.json(plain);
      }
    }
    return res.json(store.update('wallpapers', req.params.id, req.body));
  } catch (err) {
    return res.status(400).json({ message: 'Error updating wallpaper', error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    if (dbOk()) {
      await Wallpaper.findByIdAndDelete(req.params.id);
    }
    store.delete('wallpapers', req.params.id);
    return res.json({ message: 'Wallpaper deleted successfully', id: req.params.id });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting wallpaper', error: err.message });
  }
});

module.exports = router;
