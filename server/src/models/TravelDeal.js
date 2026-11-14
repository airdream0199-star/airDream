const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const travelDealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Price is required'],
    },
    originalPrice: {
      type: mongoose.Schema.Types.Mixed,
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },
    badge: {
      type: String,
      trim: true,
      default: '',
    },
    badgeColor: {
      type: String,
      default: 'bg-red-500',
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      default: 'tours',
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      default: 'Dubai, UAE',
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
      trim: true,
    },
    duration: {
      type: mongoose.Schema.Types.Mixed,
      default: '5 Days / 4 Nights',
    },
    vehicle: {
      type: String,
      default: 'VIP Transfer',
      trim: true,
    },
    guide: {
      type: String,
      default: 'Driver-guide',
      trim: true,
    },
    capacity: {
      type: String,
      default: '4 Persons',
      trim: true,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    activities: [
      {
        type: String,
        trim: true,
      },
    ],
    included: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

travelDealSchema.pre('save', function (next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug = slugify(this.title);
  }
  next();
});

const TravelDeal = mongoose.models.TravelDeal || mongoose.model('TravelDeal', travelDealSchema);
module.exports = TravelDeal;
