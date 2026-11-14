const mongoose = require('mongoose');

const popupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    buttonText: {
      type: String,
      default: 'Claim Deal',
      trim: true,
    },
    buttonLink: {
      type: String,
      default: '#packages',
      trim: true,
    },
    link: {
      type: String,
      trim: true,
      default: '',
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

const Popup = mongoose.models.Popup || mongoose.model('Popup', popupSchema);
module.exports = Popup;
