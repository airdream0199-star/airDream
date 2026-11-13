const mongoose = require('mongoose');

const holidayPackageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, default: 'Dubai, UAE' },
  tagline: { type: String, default: '' },
  duration: { type: String, default: 'Full Day' },
  vehicle: { type: String, default: 'VIP Transfer' },
  guide: { type: String, default: 'Driver-guide' },
  capacity: { type: String, default: '4 Persons' },
  price: { type: String, default: '$135' },
  rating: { type: Number, default: 5.0 },
  image: { type: String, default: '' },
  images: [{ type: String }],
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true, strict: false });

module.exports = mongoose.model('HolidayPackage', holidayPackageSchema);
