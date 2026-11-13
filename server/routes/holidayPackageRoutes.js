const express = require('express');
const router = express.Router();
const HolidayPackage = require('../models/HolidayPackage');
const store = require('../utils/dataStore');
const mongoose = require('mongoose');

const dbOk = () => mongoose.connection.readyState === 1;

router.get('/', async (req, res) => {
  try {
    if (dbOk()) {
      const list = await HolidayPackage.find({}).sort({ order: 1, createdAt: -1 }).lean();
      return res.json(list.map(d => ({ ...d, _id: String(d._id), id: String(d._id) })));
    }
    return res.json(store.get('holidayPackages'));
  } catch (err) {
    return res.json(store.get('holidayPackages'));
  }
});

router.post('/', async (req, res) => {
  try {
    if (dbOk()) {
      const doc = new HolidayPackage(req.body);
      const saved = await doc.save();
      const plain = { ...saved.toObject(), _id: String(saved._id), id: String(saved._id) };
      store.get('holidayPackages').unshift(plain);
      return res.status(201).json(plain);
    }
    return res.status(201).json(store.add('holidayPackages', req.body));
  } catch (err) {
    return res.status(400).json({ message: 'Error creating holiday package', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (dbOk()) {
      const updated = await HolidayPackage.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
      if (updated) {
        const plain = { ...updated, _id: String(updated._id), id: String(updated._id) };
        const cache = store.get('holidayPackages');
        const idx = cache.findIndex(i => String(i._id) === String(updated._id));
        if (idx >= 0) cache[idx] = plain; else cache.unshift(plain);
        return res.json(plain);
      }
    }
    return res.json(store.update('holidayPackages', req.params.id, req.body));
  } catch (err) {
    return res.status(400).json({ message: 'Error updating holiday package', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (dbOk()) await HolidayPackage.findByIdAndDelete(req.params.id);
    store.delete('holidayPackages', req.params.id);
    return res.json({ message: 'Holiday package deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting holiday package', error: err.message });
  }
});

module.exports = router;
