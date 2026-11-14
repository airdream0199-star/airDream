const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    singleton: {
      type: String,
      default: 'main',
      unique: true,
    },
    brandName: {
      type: String,
      default: 'AIR DREAM TRAVEL & TOURISM LLC',
      trim: true,
    },
    brandTagline: {
      type: String,
      default: 'Fly Your Dreams',
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '/assets/air-dream-logo.png',
      trim: true,
    },
    phone: {
      type: String,
      default: '+971 58 833 8927',
      trim: true,
    },
    whatsapp: {
      type: String,
      default: '971588338927',
      trim: true,
    },
    email: {
      type: String,
      default: 'info@airdreamtravel.com',
      trim: true,
    },
    address: {
      type: String,
      default: 'Office 402, Al Asmawi Building, Sheikh Zayed Road, Dubai, UAE',
      trim: true,
    },
    aboutQuote: {
      type: String,
      default:
        'We, at Air Dream Travel Tourism LLC, cater to our clients a lifestyle at its best where they can feel the pulse of Dubai and the unseen facets of the world, through our exclusive guided tours and other value-added services.',
      trim: true,
    },
    aboutArchImg: {
      type: String,
      default: '',
      trim: true,
    },
    bubble1Img: {
      type: String,
      default: '',
      trim: true,
    },
    bubble2Img: {
      type: String,
      default: '',
      trim: true,
    },
    bubble3Img: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const SiteSettings = mongoose.models.SiteSetting || mongoose.model('SiteSetting', siteSettingsSchema);
module.exports = SiteSettings;
