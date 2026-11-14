const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const transferSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Transfer title is required'],
      trim: true,
    },
    slug: {
      type: String,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Price is required'],
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },
    vehicle: {
      type: String,
      default: '',
      trim: true,
    },
    capacity: {
      type: String,
      default: '4 Persons',
      trim: true,
    },
    luggageCapacity: {
      type: String,
      default: '3 Bags',
      trim: true,
    },
    features: [
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

transferSchema.pre('save', function (next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug = slugify(this.title);
  }
  next();
});

const Transfer = mongoose.models.Transfer || mongoose.model('Transfer', transferSchema);
module.exports = Transfer;
