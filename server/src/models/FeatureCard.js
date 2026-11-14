const mongoose = require('mongoose');

const featureCardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Card title is required'],
      trim: true,
    },
    titleFormatted: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: '✈️',
      trim: true,
    },
    price: {
      type: String,
      default: '',
      trim: true,
    },
    desc: {
      type: String,
      default: '',
      trim: true,
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
    fallback: {
      type: String,
      default: '',
      trim: true,
    },
    badge: {
      type: String,
      default: '',
      trim: true,
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
  }
);

// Map description to desc if modified
featureCardSchema.pre('save', function (next) {
  if (this.desc && !this.description) {
    this.description = this.desc;
  } else if (this.description && !this.desc) {
    this.desc = this.description;
  }
  next();
});

const FeatureCard = mongoose.models.WhyChooseUs || mongoose.model('WhyChooseUs', featureCardSchema);
module.exports = FeatureCard;
