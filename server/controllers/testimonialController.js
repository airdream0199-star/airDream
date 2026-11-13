const Testimonial = require('../models/Testimonial');
const store = require('../utils/dataStore');
const mongoose = require('mongoose');

const dbOk = () => mongoose.connection.readyState === 1;

exports.getAllTestimonials = async (req, res) => {
  try {
    if (dbOk()) {
      const query = {};
      if (req.query.isPublic === 'true') query.isActive = true;
      const list = await Testimonial.find(query).sort({ createdAt: -1 }).lean();
      return res.json(list.map(d => ({ ...d, _id: String(d._id), id: String(d._id) })));
    }
    return res.json(store.get('testimonials'));
  } catch (err) {
    return res.json(store.get('testimonials'));
  }
};

exports.createTestimonial = async (req, res) => {
  try {
    if (dbOk()) {
      const doc = new Testimonial(req.body);
      const saved = await doc.save();
      const plain = { ...saved.toObject(), _id: String(saved._id), id: String(saved._id) };
      store.get('testimonials').unshift(plain);
      return res.status(201).json(plain);
    }
    return res.status(201).json(store.add('testimonials', req.body));
  } catch (err) {
    return res.status(400).json({ message: 'Error creating testimonial', error: err.message });
  }
};

exports.updateTestimonial = async (req, res) => {
  try {
    if (dbOk()) {
      const updated = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
      if (updated) {
        const plain = { ...updated, _id: String(updated._id), id: String(updated._id) };
        const cache = store.get('testimonials');
        const idx = cache.findIndex(i => String(i._id) === String(updated._id));
        if (idx >= 0) cache[idx] = plain; else cache.unshift(plain);
        return res.json(plain);
      }
    }
    return res.json(store.update('testimonials', req.params.id, req.body));
  } catch (err) {
    return res.status(400).json({ message: 'Error updating testimonial', error: err.message });
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    if (dbOk()) await Testimonial.findByIdAndDelete(req.params.id);
    store.delete('testimonials', req.params.id);
    return res.json({ message: 'Testimonial deleted successfully', id: req.params.id });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
