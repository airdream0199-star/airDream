const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const tourSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tour title is required'],
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
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    price: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Tour price is required'],
    },
    originalPrice: {
      type: mongoose.Schema.Types.Mixed,
    },
    currency: {
      type: String,
      default: 'AED',
      trim: true,
    },
    location: {
      type: String,
      default: 'Dubai, UAE',
      trim: true,
    },
    vehicle: {
      type: String,
      default: '4WD Cruiser',
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
    duration: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ days: 1, nights: 0 }),
    },
    category: {
      type: String,
      trim: true,
      default: 'Sightseeing',
    },
    highlights: [
      {
        type: String,
        trim: true,
      },
    ],
    included: [
      {
        name: { type: String, trim: true },
        icon: { type: String, trim: true },
      },
    ],
    activities: [
      {
        type: String,
        trim: true,
      },
    ],
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    seeMoreCount: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
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

// Pre-save hook to ensure slug is generated
tourSchema.pre('save', function (next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug = slugify(this.title);
  }
  next();
});

const Tour = mongoose.models.Tour || mongoose.model('Tour', tourSchema);
module.exports = Tour;
