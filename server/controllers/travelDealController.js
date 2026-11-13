const TravelDeal = require('../models/TravelDeal');
const store = require('../utils/dataStore');
const mongoose = require('mongoose');

const dbOk = () => mongoose.connection.readyState === 1;

exports.getDeals = async (req, res) => {
  try {
    if (dbOk()) {
      const query = req.query.all ? {} : { active: true };
      const deals = await TravelDeal.find(query).sort({ order: 1, createdAt: -1 }).lean();
      return res.json(deals.map(d => ({ ...d, _id: String(d._id), id: String(d._id) })));
    }
    return res.json(store.get('travelDeals'));
  } catch (err) {
    return res.json(store.get('travelDeals'));
  }
};

exports.getDealById = async (req, res) => {
  try {
    if (dbOk()) {
      const deal = await TravelDeal.findById(req.params.id).lean();
      if (deal) return res.json({ ...deal, _id: String(deal._id), id: String(deal._id) });
    }
    const cached = store.getById('travelDeals', req.params.id);
    if (cached) return res.json(cached);
    return res.status(404).json({ message: 'Deal not found' });
  } catch (err) {
    const cached = store.getById('travelDeals', req.params.id);
    if (cached) return res.json(cached);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.createDeal = async (req, res) => {
  try {
    if (dbOk()) {
      const doc = new TravelDeal(req.body);
      const saved = await doc.save();
      const plain = { ...saved.toObject(), _id: String(saved._id), id: String(saved._id) };
      store.get('travelDeals').unshift(plain);
      return res.status(201).json(plain);
    }
    return res.status(201).json(store.add('travelDeals', req.body));
  } catch (err) {
    return res.status(500).json({ message: 'Error creating travel deal', error: err.message });
  }
};

exports.updateDeal = async (req, res) => {
  try {
    if (dbOk()) {
      const updated = await TravelDeal.findByIdAndUpdate(req.params.id, req.body, {
        new: true, runValidators: false
      }).lean();
      if (updated) {
        const plain = { ...updated, _id: String(updated._id), id: String(updated._id) };
        const cache = store.get('travelDeals');
        const idx = cache.findIndex(i => String(i._id) === String(updated._id));
        if (idx >= 0) cache[idx] = plain; else cache.unshift(plain);
        return res.json(plain);
      }
    }
    return res.json(store.update('travelDeals', req.params.id, req.body));
  } catch (err) {
    return res.status(400).json({ message: 'Error updating deal', error: err.message });
  }
};

exports.deleteDeal = async (req, res) => {
  try {
    if (dbOk()) await TravelDeal.findByIdAndDelete(req.params.id);
    store.delete('travelDeals', req.params.id);
    return res.json({ message: 'Deal deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};
