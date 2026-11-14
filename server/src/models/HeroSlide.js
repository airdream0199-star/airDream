const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema(
  {
    badge: {
      type: String,
      default: '',
      trim: true,
    },
    badgeIcon: {
      type: String,
      default: 'fa-plane',
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Slide title is required'],
      trim: true,
    },
    highlight: {
      type: String,
      default: '',
      trim: true,
    },
    desc: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    primaryBtnText: {
      type: String,
      default: 'Book Now',
      trim: true,
    },
    primaryBtnLink: {
      type: String,
      default: '#packages',
      trim: true,
    },
    secondaryBtnText: {
      type: String,
      default: 'Request Quote',
      trim: true,
    },
    secondaryBtnLink: {
      type: String,
      default: '#contact',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Bind to Wallpaper model so existing collection in Atlas ('wallpapers') is used directly
const HeroSlide = mongoose.models.Wallpaper || mongoose.model('Wallpaper', heroSlideSchema);
module.exports = HeroSlide;
