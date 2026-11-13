const Activity = require('../models/Activity');
const store = require('../utils/dataStore');
const mongoose = require('mongoose');

const dbOk = () => mongoose.connection.readyState === 1;

exports.getAllActivities = async (req, res) => {
  try {
    if (dbOk()) {
      const query = {};
      if (req.query.category) query.category = req.query.category;
      if (req.query.isPublic === 'true') query.isActive = true;
      const list = await Activity.find(query).sort({ createdAt: -1 }).lean();
      return res.json(list.map(d => ({ ...d, _id: String(d._id), id: String(d._id) })));
    }
    return res.json(store.get('activities'));
  } catch (err) {
    return res.json(store.get('activities'));
  }
};

exports.getActivityById = async (req, res) => {
  try {
    if (dbOk()) {
      const doc = await Activity.findById(req.params.id).lean();
      if (doc) return res.json({ ...doc, _id: String(doc._id), id: String(doc._id) });
    }
    const cached = store.getById('activities', req.params.id);
    if (cached) return res.json(cached);
    return res.status(404).json({ message: 'Activity not found' });
  } catch (err) {
    const cached = store.getById('activities', req.params.id);
    if (cached) return res.json(cached);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createActivity = async (req, res) => {
  try {
    if (dbOk()) {
      const doc = new Activity(req.body);
      const saved = await doc.save();
      const plain = { ...saved.toObject(), _id: String(saved._id), id: String(saved._id) };
      store.get('activities').unshift(plain);
      return res.status(201).json(plain);
    }
    return res.status(201).json(store.add('activities', req.body));
  } catch (err) {
    return res.status(400).json({ message: 'Error creating activity', error: err.message });
  }
};

exports.updateActivity = async (req, res) => {
  try {
    if (dbOk()) {
      const updated = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
      if (updated) {
        const plain = { ...updated, _id: String(updated._id), id: String(updated._id) };
        const cache = store.get('activities');
        const idx = cache.findIndex(i => String(i._id) === String(updated._id));
        if (idx >= 0) cache[idx] = plain; else cache.unshift(plain);
        return res.json(plain);
      }
    }
    return res.json(store.update('activities', req.params.id, req.body));
  } catch (err) {
    return res.status(400).json({ message: 'Error updating activity', error: err.message });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    if (dbOk()) await Activity.findByIdAndDelete(req.params.id);
    store.delete('activities', req.params.id);
    return res.json({ message: 'Activity deleted successfully', id: req.params.id });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
