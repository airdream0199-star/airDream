const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    title: {
      type: String,
      default: 'Traveler Experience',
      trim: true,
    },
    package: {
      type: String,
      default: 'Traveler',
      trim: true,
    },
    review: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    avatar: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: String,
      trim: true,
      default: () => new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    },
    avatarColor: {
      type: String,
      default: '#00bcd4',
      trim: true,
    },
    initial: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      default: 'Dubai, UAE',
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

testimonialSchema.pre('save', function (next) {
  if (this.name && !this.initial) {
    this.initial = this.name.charAt(0).toUpperCase();
  }
  next();
});

const Testimonial = mongoose.models.Testimonial || mongoose.model('Testimonial', testimonialSchema);
module.exports = Testimonial;
