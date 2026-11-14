const {
  HeroSlide,
  FeatureCard,
  Tour,
  Activity,
  TravelDeal,
  Transfer,
  GalleryItem,
  Testimonial,
  Popup,
  SiteSettings,
} = require('../models');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Public aggregate endpoint: reads all live content collections from MongoDB
 */
exports.getAllSiteContent = async (req, res, next) => {
  try {
    const [
      wallpapers,
      whyChooseUs,
      tours,
      activities,
      travelDeals,
      transfers,
      gallery,
      testimonials,
      activePopup,
      settings,
    ] = await Promise.all([
      HeroSlide.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean(),
      FeatureCard.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean(),
      Tour.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean(),
      Activity.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean(),
      TravelDeal.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean(),
      Transfer.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean(),
      GalleryItem.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean(),
      Testimonial.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean(),
      Popup.findOne({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean(),
      SiteSettings.findOne({ singleton: 'main' }).lean(),
    ]);

    // Separate holiday packages from deals for backwards compatibility with frontends expecting holidayPackages
    const holidayPackages = travelDeals.filter((d) => d.category === 'holiday');
    const packages = travelDeals;

    const aggregateData = {
      wallpapers,
      heroSlides: wallpapers,
      whyChooseUs,
      tours,
      activities,
      attractions: activities, // Alias for frontend
      travelDeals,
      packages,
      holidayPackages,
      transfers,
      gallery,
      testimonials,
      reviews: testimonials, // Alias for frontend
      activePopup: activePopup || null,
      settings: settings || {},
    };

    return sendSuccess(res, aggregateData, 'Site content loaded successfully');
  } catch (error) {
    next(error);
  }
};
