const express = require('express');
const router = express.Router();
const WhyChooseUs = require('../models/WhyChooseUs');
const store = require('../utils/dataStore');
const mongoose = require('mongoose');

const dbOk = () => mongoose.connection.readyState === 1;

router.get('/', async (req, res) => {
  try {
    if (dbOk()) {
      const list = await WhyChooseUs.find({}).sort({ order: 1, createdAt: 1 }).lean();
      return res.json(list.map(d => ({ ...d, _id: String(d._id), id: String(d._id) })));
    }
    return res.json(store.get('whyChooseUs'));
  } catch (err) {
    return res.json(store.get('whyChooseUs'));
  }
});

router.post('/', async (req, res) => {
  try {
    if (dbOk()) {
      const doc = new WhyChooseUs(req.body);
      const saved = await doc.save();
      const plain = { ...saved.toObject(), _id: String(saved._id), id: String(saved._id) };
      store.get('whyChooseUs').unshift(plain);
      return res.status(201).json(plain);
    }
    return res.status(201).json(store.add('whyChooseUs', req.body));
  } catch (err) {
    return res.status(400).json({ message: 'Error creating feature card', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (dbOk()) {
      const updated = await WhyChooseUs.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
      if (updated) {
        const plain = { ...updated, _id: String(updated._id), id: String(updated._id) };
        const cache = store.get('whyChooseUs');
        const idx = cache.findIndex(i => String(i._id) === String(updated._id));
        if (idx >= 0) cache[idx] = plain; else cache.unshift(plain);
        return res.json(plain);
      }
    }
    return res.json(store.update('whyChooseUs', req.params.id, req.body));
  } catch (err) {
    return res.status(400).json({ message: 'Error updating feature card', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (dbOk()) await WhyChooseUs.findByIdAndDelete(req.params.id);
    store.delete('whyChooseUs', req.params.id);
    return res.json({ message: 'Feature card deleted successfully', id: req.params.id });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting feature card', error: err.message });
  }
});

module.exports = router;
