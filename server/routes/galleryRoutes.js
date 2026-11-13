const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const store = require('../utils/dataStore');
const mongoose = require('mongoose');

const dbOk = () => mongoose.connection.readyState === 1;

router.get('/', async (req, res) => {
  try {
    if (dbOk()) {
      const list = await Gallery.find({}).sort({ order: 1, createdAt: -1 }).lean();
      return res.json(list.map(d => ({ ...d, _id: String(d._id), id: String(d._id) })));
    }
    return res.json(store.get('gallery'));
  } catch (err) {
    return res.json(store.get('gallery'));
  }
});

router.post('/', async (req, res) => {
  try {
    if (dbOk()) {
      const doc = new Gallery(req.body);
      const saved = await doc.save();
      const plain = { ...saved.toObject(), _id: String(saved._id), id: String(saved._id) };
      store.get('gallery').unshift(plain);
      return res.status(201).json(plain);
    }
    return res.status(201).json(store.add('gallery', req.body));
  } catch (err) {
    return res.status(400).json({ message: 'Error creating gallery item', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (dbOk()) {
      const updated = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
      if (updated) {
        const plain = { ...updated, _id: String(updated._id), id: String(updated._id) };
        const cache = store.get('gallery');
        const idx = cache.findIndex(i => String(i._id) === String(updated._id));
        if (idx >= 0) cache[idx] = plain; else cache.unshift(plain);
        return res.json(plain);
      }
    }
    return res.json(store.update('gallery', req.params.id, req.body));
  } catch (err) {
    return res.status(400).json({ message: 'Error updating gallery item', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (dbOk()) await Gallery.findByIdAndDelete(req.params.id);
    store.delete('gallery', req.params.id);
    return res.json({ message: 'Gallery item deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting gallery item', error: err.message });
  }
});

module.exports = router;
