const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

// We store settings as a single document with all keys flat
const siteSettingSchema = new mongoose.Schema({
  singleton: { type: String, default: 'main', unique: true },
  brandName: { type: String, default: 'Air Dream Travel & Tourism' },
  brandTagline: { type: String, default: 'Fly Your Dreams' },
  logoUrl: { type: String, default: '' },
  phone: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  aboutQuote: { type: String, default: '' },
  aboutArchImg: { type: String, default: '' },
  bubble1Img: { type: String, default: '' },
  bubble2Img: { type: String, default: '' },
  bubble3Img: { type: String, default: '' },
}, { timestamps: true, strict: false });

module.exports = mongoose.model('SiteSetting', siteSettingSchema);
