const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'general',
      trim: true,
    },
    alt: {
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

// Register both Gallery and GalleryItem so legacy and new queries both find the collection
const GalleryItem = mongoose.models.Gallery || mongoose.models.GalleryItem || mongoose.model('Gallery', galleryItemSchema);
module.exports = GalleryItem;
