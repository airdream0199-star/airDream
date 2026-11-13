const mongoose = require('mongoose');

const whyChooseUsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleFormatted: { type: String },
  icon: { type: String, default: '✈️' },
  price: { type: String, default: '' },
  desc: { type: String, default: '' },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  fallback: { type: String, default: '' },
  badge: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true, strict: false });

module.exports = mongoose.model('WhyChooseUs', whyChooseUsSchema);
