const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Activity title is required'],
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
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    duration: {
      days: { type: Number, default: 1 },
      nights: { type: Number, default: 0 },
    },
    price: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Activity price is required'],
    },
    originalPrice: {
      type: mongoose.Schema.Types.Mixed,
    },
    currency: {
      type: String,
      default: 'AED',
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'Attraction',
    },
    includedServices: [
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
    seeMoreCount: {
      type: Number,
      default: 0,
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

activitySchema.pre('save', function (next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug = slugify(this.title);
  }
  next();
});

const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
module.exports = Activity;
