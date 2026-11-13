const Popup = require('../models/Popup');
const store = require('../utils/dataStore');
const mongoose = require('mongoose');

const dbOk = () => mongoose.connection.readyState === 1;

exports.getAllPopups = async (req, res) => {
  try {
    if (dbOk()) {
      const query = {};
      if (req.query.isActive === 'true') query.isActive = true;
      const list = await Popup.find(query).sort({ order: 1, createdAt: -1 }).lean();
      return res.json(list.map(d => ({ ...d, _id: String(d._id), id: String(d._id) })));
    }
    return res.json(store.get('popups'));
  } catch (err) {
    return res.json(store.get('popups'));
  }
};

exports.createPopup = async (req, res) => {
  try {
    if (dbOk()) {
      const doc = new Popup(req.body);
      const saved = await doc.save();
      const plain = { ...saved.toObject(), _id: String(saved._id), id: String(saved._id) };
      store.get('popups').unshift(plain);
      return res.status(201).json(plain);
    }
    return res.status(201).json(store.add('popups', req.body));
  } catch (err) {
    return res.status(400).json({ message: 'Error creating popup', error: err.message });
  }
};

exports.updatePopup = async (req, res) => {
  try {
    if (dbOk()) {
      const updated = await Popup.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
      if (updated) {
        const plain = { ...updated, _id: String(updated._id), id: String(updated._id) };
        const cache = store.get('popups');
        const idx = cache.findIndex(i => String(i._id) === String(updated._id));
        if (idx >= 0) cache[idx] = plain; else cache.unshift(plain);
        return res.json(plain);
      }
    }
    return res.json(store.update('popups', req.params.id, req.body));
  } catch (err) {
    return res.status(400).json({ message: 'Error updating popup', error: err.message });
  }
};

exports.deletePopup = async (req, res) => {
  try {
    if (dbOk()) await Popup.findByIdAndDelete(req.params.id);
    store.delete('popups', req.params.id);
    return res.json({ message: 'Popup deleted successfully', id: req.params.id });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
