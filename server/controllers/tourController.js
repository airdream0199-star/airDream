const Tour = require('../models/Tour');
const store = require('../utils/dataStore');
const mongoose = require('mongoose');

const dbOk = () => mongoose.connection.readyState === 1;

exports.getAllTours = async (req, res) => {
  try {
    if (dbOk()) {
      const query = {};
      if (req.query.category) query.category = req.query.category;
      if (req.query.isPublic === 'true') query.isActive = true;
      const tours = await Tour.find(query).sort({ createdAt: -1 }).lean();
      return res.json(tours.map(t => ({ ...t, _id: String(t._id), id: String(t._id) })));
    }
    return res.json(store.get('tours'));
  } catch (err) {
    return res.json(store.get('tours'));
  }
};

exports.getTourById = async (req, res) => {
  try {
    if (dbOk()) {
      const tour = await Tour.findById(req.params.id).lean();
      if (tour) return res.json({ ...tour, _id: String(tour._id), id: String(tour._id) });
    }
    const cached = store.getById('tours', req.params.id);
    if (cached) return res.json(cached);
    return res.status(404).json({ message: 'Tour not found' });
  } catch (err) {
    const cached = store.getById('tours', req.params.id);
    if (cached) return res.json(cached);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createTour = async (req, res) => {
  try {
    if (dbOk()) {
      const doc = new Tour(req.body);
      const saved = await doc.save();
      const plain = { ...saved.toObject(), _id: String(saved._id), id: String(saved._id) };
      store.get('tours').unshift(plain);
      return res.status(201).json(plain);
    }
    return res.status(201).json(store.add('tours', req.body));
  } catch (err) {
    return res.status(400).json({ message: 'Error creating tour', error: err.message });
  }
};

exports.updateTour = async (req, res) => {
  try {
    if (dbOk()) {
      const updated = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
      if (updated) {
        const plain = { ...updated, _id: String(updated._id), id: String(updated._id) };
        const cache = store.get('tours');
        const idx = cache.findIndex(i => String(i._id) === String(updated._id));
        if (idx >= 0) cache[idx] = plain; else cache.unshift(plain);
        return res.json(plain);
      }
    }
    return res.json(store.update('tours', req.params.id, req.body));
  } catch (err) {
    return res.status(400).json({ message: 'Error updating tour', error: err.message });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    if (dbOk()) await Tour.findByIdAndDelete(req.params.id);
    store.delete('tours', req.params.id);
    return res.json({ message: 'Tour deleted successfully', id: req.params.id });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
