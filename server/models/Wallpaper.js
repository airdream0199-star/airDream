const mongoose = require('mongoose');

const wallpaperSchema = new mongoose.Schema({
  badge: { type: String, default: '' },
  badgeIcon: { type: String, default: 'fa-plane' },
  title: { type: String, required: true },
  highlight: { type: String, default: '' },
  desc: { type: String, default: '' },
  image: { type: String, default: '' },
  primaryBtnText: { type: String, default: 'Book Now' },
  primaryBtnLink: { type: String, default: '#packages' },
  secondaryBtnText: { type: String, default: 'Request Quote' },
  secondaryBtnLink: { type: String, default: '#contact' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Wallpaper', wallpaperSchema);
