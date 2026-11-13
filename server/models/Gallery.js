const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: { type: String, default: '' },
  image: { type: String, required: true },
  category: { type: String, default: 'general' },
  alt: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Gallery', gallerySchema);
