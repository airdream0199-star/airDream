const Visa = require('../models/Visa');
const store = require('../utils/dataStore');
const mongoose = require('mongoose');

const dbOk = () => mongoose.connection.readyState === 1;

exports.getAllVisas = async (req, res) => {
  try {
    if (dbOk()) {
      const query = {};
      if (req.query.isPublic === 'true') query.isActive = true;
      const list = await Visa.find(query).sort({ createdAt: -1 }).lean();
      return res.json(list.map(d => ({ ...d, _id: String(d._id), id: String(d._id) })));
    }
    return res.json(store.get('visas'));
  } catch (err) {
    return res.json(store.get('visas'));
  }
};

exports.getVisaById = async (req, res) => {
  try {
    if (dbOk()) {
      const doc = await Visa.findById(req.params.id).lean();
      if (doc) return res.json({ ...doc, _id: String(doc._id), id: String(doc._id) });
    }
    const cached = store.getById('visas', req.params.id);
    if (cached) return res.json(cached);
    return res.status(404).json({ message: 'Visa not found' });
  } catch (err) {
    const cached = store.getById('visas', req.params.id);
    if (cached) return res.json(cached);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createVisa = async (req, res) => {
  try {
    if (dbOk()) {
      const doc = new Visa(req.body);
      const saved = await doc.save();
      const plain = { ...saved.toObject(), _id: String(saved._id), id: String(saved._id) };
      store.get('visas').unshift(plain);
      return res.status(201).json(plain);
    }
    return res.status(201).json(store.add('visas', req.body));
  } catch (err) {
    return res.status(400).json({ message: 'Error creating visa', error: err.message });
  }
};

exports.updateVisa = async (req, res) => {
  try {
    if (dbOk()) {
      const updated = await Visa.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
      if (updated) {
        const plain = { ...updated, _id: String(updated._id), id: String(updated._id) };
        const cache = store.get('visas');
        const idx = cache.findIndex(i => String(i._id) === String(updated._id));
        if (idx >= 0) cache[idx] = plain; else cache.unshift(plain);
        return res.json(plain);
      }
    }
    return res.json(store.update('visas', req.params.id, req.body));
  } catch (err) {
    return res.status(400).json({ message: 'Error updating visa', error: err.message });
  }
};

exports.deleteVisa = async (req, res) => {
  try {
    if (dbOk()) await Visa.findByIdAndDelete(req.params.id);
    store.delete('visas', req.params.id);
    return res.json({ message: 'Visa deleted successfully', id: req.params.id });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
