const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  price: { type: String, default: '' },
  vehicle: { type: String, default: '' },
  capacity: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Transfer', transferSchema);
