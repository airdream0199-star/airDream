const Admin = require('./Admin');
const Tour = require('./Tour');
const Activity = require('./Activity');
const TravelDeal = require('./TravelDeal');
const Visa = require('./Visa');
const Transfer = require('./Transfer');
const Enquiry = require('./Enquiry');
const Testimonial = require('./Testimonial');
const Popup = require('./Popup');
const GalleryItem = require('./GalleryItem');
const HeroSlide = require('./HeroSlide');
const FeatureCard = require('./FeatureCard');
const SiteSettings = require('./SiteSettings');

module.exports = {
  Admin,
  Tour,
  Activity,
  TravelDeal,
  HolidayPackage: TravelDeal, // Alias for HolidayPackage
  Visa,
  Transfer,
  Enquiry,
  Testimonial,
  Popup,
  GalleryItem,
  Gallery: GalleryItem, // Alias for Gallery
  HeroSlide,
  Wallpaper: HeroSlide, // Alias for Wallpaper
  FeatureCard,
  WhyChooseUs: FeatureCard, // Alias for WhyChooseUs
  SiteSettings,
  SiteSetting: SiteSettings, // Alias for SiteSetting
};
