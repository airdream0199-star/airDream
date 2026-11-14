const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const visaSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: [true, 'Country name is required'],
      trim: true,
    },
    slug: {
      type: String,
      index: true,
    },
    flagImage: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: ['Tourist', 'Business', 'Transit', 'Express'],
      default: 'Tourist',
    },
    price: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Visa price is required'],
    },
    originalPrice: {
      type: mongoose.Schema.Types.Mixed,
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    processingTime: {
      type: String,
      default: '3-5 Working Days',
      trim: true,
    },
    isFastTrack: {
      type: Boolean,
      default: true,
    },
    badgeText: {
      type: String,
      default: 'FAST TRACK',
      trim: true,
    },
    getOnDate: {
      type: String,
      trim: true,
      default: '',
    },
    requirements: [
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

visaSchema.pre('save', function (next) {
  if (this.country && (!this.slug || this.isModified('country'))) {
    this.slug = slugify(this.country);
  }
  next();
});

const Visa = mongoose.models.Visa || mongoose.model('Visa', visaSchema);
module.exports = Visa;
