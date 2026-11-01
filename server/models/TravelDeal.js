const mongoose = require('mongoose');

const travelDealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: String, required: true },
  badge: { type: String },
  badgeColor: { type: String, default: 'bg-red-500' },
  image: { type: String, default: '' },
  description: { type: String },
  category: { type: String, default: 'tours' },
  featured: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  activities: [{ type: String }],
  duration: {
    type: mongoose.Schema.Types.Mixed,
    default: '5 Days / 4 Nights'
  },
  included: [{ type: String }],
  inclusions: [{ type: String }],
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('TravelDeal', travelDealSchema);

