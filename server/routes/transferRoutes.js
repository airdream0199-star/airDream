const express = require('express');
const router = express.Router();
const Transfer = require('../models/Transfer');
const store = require('../utils/dataStore');
const mongoose = require('mongoose');

const dbOk = () => mongoose.connection.readyState === 1;

router.get('/', async (req, res) => {
  try {
    if (dbOk()) {
      const list = await Transfer.find({}).sort({ order: 1, createdAt: -1 }).lean();
      return res.json(list.map(d => ({ ...d, _id: String(d._id), id: String(d._id) })));
    }
    return res.json(store.get('transfers'));
  } catch (err) {
    return res.json(store.get('transfers'));
  }
});

router.post('/', async (req, res) => {
  try {
    if (dbOk()) {
      const doc = new Transfer(req.body);
      const saved = await doc.save();
      const plain = { ...saved.toObject(), _id: String(saved._id), id: String(saved._id) };
      store.get('transfers').unshift(plain);
      return res.status(201).json(plain);
    }
    return res.status(201).json(store.add('transfers', req.body));
  } catch (err) {
    return res.status(400).json({ message: 'Error creating transfer', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (dbOk()) {
      const updated = await Transfer.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
      if (updated) {
        const plain = { ...updated, _id: String(updated._id), id: String(updated._id) };
        const cache = store.get('transfers');
        const idx = cache.findIndex(i => String(i._id) === String(updated._id));
        if (idx >= 0) cache[idx] = plain; else cache.unshift(plain);
        return res.json(plain);
      }
    }
    return res.json(store.update('transfers', req.params.id, req.body));
  } catch (err) {
    return res.status(400).json({ message: 'Error updating transfer', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (dbOk()) await Transfer.findByIdAndDelete(req.params.id);
    store.delete('transfers', req.params.id);
    return res.json({ message: 'Transfer deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting transfer', error: err.message });
  }
});

module.exports = router;
