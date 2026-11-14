/**
 * Safe, Idempotent Data Migration Script
 * Migrates legacy records from server/data-store.json into MongoDB Atlas collections.
 *
 * Usage:
 *   node server/src/scripts/migrateData.js --dry-run
 *   node server/src/scripts/migrateData.js
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

const {
  Tour,
  Activity,
  TravelDeal,
  Visa,
  Transfer,
  Enquiry,
  Testimonial,
  Popup,
  GalleryItem,
  HeroSlide,
  FeatureCard,
  SiteSettings,
} = require('../models');

const isDryRun = process.argv.includes('--dry-run');

const PRIMARY_STORE = path.resolve(__dirname, '../../data-store.json');
const BACKUP_STORE = path.resolve(__dirname, '../../data-store.json.bak');
const DATA_STORE_PATH = fs.existsSync(PRIMARY_STORE) ? PRIMARY_STORE : BACKUP_STORE;

function normalizeEnquiryStatus(rawStatus, isRead) {
  const s = (rawStatus || '').toLowerCase().trim();
  if (s === 'responded' || s === 'contacted') return 'Contacted';
  if (s === 'quoted') return 'Quoted';
  if (s === 'converted') return 'Converted';
  if (s === 'closed') return 'Closed';
  if (isRead) return 'Contacted';
  return 'New';
}

async function migrate() {
  console.log(`\n======================================================`);
  console.log(`  AIR DREAM SAFE DATA MIGRATION`);
  console.log(`  Mode: ${isDryRun ? 'DRY RUN (no database writes)' : 'LIVE EXECUTION'}`);
  console.log(`======================================================\n`);

  if (!fs.existsSync(DATA_STORE_PATH)) {
    console.error(`[Error] data-store.json not found at: ${DATA_STORE_PATH}`);
    process.exit(1);
  }

  const rawJson = fs.readFileSync(DATA_STORE_PATH, 'utf8');
  let dataStore;
  try {
    dataStore = JSON.parse(rawJson);
  } catch (err) {
    console.error(`[Error] Failed to parse data-store.json:`, err.message);
    process.exit(1);
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error(`[Error] MONGO_URI is missing from environment.`);
    process.exit(1);
  }

  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log(`Connected to MongoDB Atlas: ${mongoose.connection.host}\n`);

  const summary = {
    heroSlides: { processed: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
    featureCards: { processed: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
    transfers: { processed: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
    holidayPackages: { processed: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
    travelDeals: { processed: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
    galleryItems: { processed: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
    testimonials: { processed: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
    visas: { processed: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
    tours: { processed: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
    activities: { processed: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
    popups: { processed: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
    enquiries: { processed: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
    siteSettings: { processed: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
  };

  // 1. HeroSlides (Wallpapers)
  if (Array.isArray(dataStore.wallpapers)) {
    console.log(`--- Migrating HeroSlides (${dataStore.wallpapers.length} items) ---`);
    for (const item of dataStore.wallpapers) {
      summary.heroSlides.processed++;
      try {
        const query = item.title ? { title: item.title.trim() } : { _id: item._id };
        const existing = await HeroSlide.findOne(query);
        if (existing) {
          summary.heroSlides.skipped++;
        } else {
          if (!isDryRun) {
            await HeroSlide.create({
              title: item.title || 'Welcome to Air Dream',
              badge: item.badge || '',
              badgeIcon: item.badgeIcon || 'fa-plane',
              highlight: item.highlight || '',
              desc: item.desc || '',
              image: item.image || '',
              primaryBtnText: item.primaryBtnText || 'Book Now',
              primaryBtnLink: item.primaryBtnLink || '#packages',
              secondaryBtnText: item.secondaryBtnText || 'Request Quote',
              secondaryBtnLink: item.secondaryBtnLink || '#contact',
              order: item.order || 0,
              isActive: item.isActive !== false,
            });
          }
          summary.heroSlides.inserted++;
        }
      } catch (err) {
        summary.heroSlides.failed++;
        console.warn(`  [Warning] HeroSlide error:`, err.message);
      }
    }
  }

  // 2. FeatureCards (WhyChooseUs)
  if (Array.isArray(dataStore.whyChooseUs)) {
    console.log(`--- Migrating FeatureCards (${dataStore.whyChooseUs.length} items) ---`);
    for (let idx = 0; idx < dataStore.whyChooseUs.length; idx++) {
      const item = dataStore.whyChooseUs[idx];
      summary.featureCards.processed++;
      try {
        const query = item.title ? { title: item.title.trim() } : { _id: item._id };
        const existing = await FeatureCard.findOne(query);
        if (existing) {
          summary.featureCards.skipped++;
        } else {
          const parsedOrder = typeof item.order === 'number' ? item.order : (typeof item.id === 'number' ? item.id : idx);
          if (!isDryRun) {
            await FeatureCard.create({
              title: item.title || 'Feature',
              titleFormatted: item.titleFormatted || item.title || '',
              icon: item.icon || '✈️',
              price: item.price || '',
              description: item.description || item.desc || '',
              desc: item.desc || item.description || '',
              image: item.image || '',
              fallback: item.fallback || '',
              badge: item.badge || '',
              order: parsedOrder,
              isActive: item.isActive !== false,
            });
          }
          summary.featureCards.inserted++;
        }
      } catch (err) {
        summary.featureCards.failed++;
        console.warn(`  [Warning] FeatureCard error:`, err.message);
      }
    }
  }

  // 3. Transfers
  if (Array.isArray(dataStore.transfers)) {
    console.log(`--- Migrating Transfers (${dataStore.transfers.length} items) ---`);
    for (const item of dataStore.transfers) {
      summary.transfers.processed++;
      try {
        const query = item.title ? { title: item.title.trim() } : { _id: item._id };
        const existing = await Transfer.findOne(query);
        if (existing) {
          summary.transfers.skipped++;
        } else {
          if (!isDryRun) {
            await Transfer.create({
              title: item.title,
              description: item.description || '',
              image: item.image || '',
              price: item.price || '$45',
              vehicle: item.vehicle || '',
              capacity: item.capacity || '4 Persons',
              order: typeof item.order === 'number' ? item.order : 0,
              isActive: item.isActive !== false,
            });
          }
          summary.transfers.inserted++;
        }
      } catch (err) {
        summary.transfers.failed++;
        console.warn(`  [Warning] Transfer error:`, err.message);
      }
    }
  }

  // 4. Holiday Packages (into TravelDeal with category='holiday')
  if (Array.isArray(dataStore.holidayPackages)) {
    console.log(`--- Migrating HolidayPackages (${dataStore.holidayPackages.length} items) ---`);
    for (const item of dataStore.holidayPackages) {
      summary.holidayPackages.processed++;
      try {
        const existing = await TravelDeal.findOne({ title: item.title?.trim() });
        if (existing) {
          summary.holidayPackages.skipped++;
        } else {
          if (!isDryRun) {
            await TravelDeal.create({
              title: item.title,
              location: item.location || 'Dubai, UAE',
              tagline: item.tagline || '',
              duration: item.duration || 'Full Day',
              vehicle: item.vehicle || 'VIP Transfer',
              guide: item.guide || 'Driver-guide',
              capacity: item.capacity || '4 Persons',
              price: item.price || '$135',
              rating: item.rating || 5.0,
              image: item.image || (item.images && item.images[0]) || '',
              images: item.images || (item.image ? [item.image] : []),
              category: 'holiday',
              order: typeof item.order === 'number' ? item.order : 0,
              isActive: item.isActive !== false,
            });
          }
          summary.holidayPackages.inserted++;
        }
      } catch (err) {
        summary.holidayPackages.failed++;
        console.warn(`  [Warning] HolidayPackage error:`, err.message);
      }
    }
  }

  // 5. TravelDeals
  if (Array.isArray(dataStore.travelDeals)) {
    console.log(`--- Migrating TravelDeals (${dataStore.travelDeals.length} items) ---`);
    for (const item of dataStore.travelDeals) {
      summary.travelDeals.processed++;
      try {
        const existing = await TravelDeal.findOne({ title: item.title?.trim() });
        if (existing) {
          summary.travelDeals.skipped++;
        } else {
          if (!isDryRun) {
            await TravelDeal.create({
              title: item.title,
              price: item.price || 'AED 299',
              badge: item.badge || '',
              badgeColor: item.badgeColor || 'bg-red-500',
              image: item.image || '',
              description: item.description || '',
              category: item.category || 'tours',
              featured: item.featured || item.isFeatured || false,
              duration: item.duration || '5 Days / 4 Nights',
              activities: item.activities || [],
              included: item.included || item.inclusions || [],
              order: typeof item.order === 'number' ? item.order : 0,
              isActive: item.active !== false && item.isActive !== false,
            });
          }
          summary.travelDeals.inserted++;
        }
      } catch (err) {
        summary.travelDeals.failed++;
        console.warn(`  [Warning] TravelDeal error:`, err.message);
      }
    }
  }

  // 6. Gallery Items
  if (Array.isArray(dataStore.gallery)) {
    console.log(`--- Migrating Gallery (${dataStore.gallery.length} items) ---`);
    for (const item of dataStore.gallery) {
      summary.galleryItems.processed++;
      if (!item.image) {
        summary.galleryItems.skipped++;
        continue;
      }
      try {
        const existing = await GalleryItem.findOne({ image: item.image });
        if (existing) {
          summary.galleryItems.skipped++;
        } else {
          if (!isDryRun) {
            await GalleryItem.create({
              title: item.title || '',
              image: item.image,
              category: item.category || 'general',
              alt: item.alt || item.title || 'Air Dream Gallery Image',
              order: typeof item.order === 'number' ? item.order : 0,
              isActive: item.isActive !== false,
            });
          }
          summary.galleryItems.inserted++;
        }
      } catch (err) {
        summary.galleryItems.failed++;
        console.warn(`  [Warning] Gallery error:`, err.message);
      }
    }
  }

  // 7. Testimonials
  if (Array.isArray(dataStore.testimonials)) {
    console.log(`--- Migrating Testimonials (${dataStore.testimonials.length} items) ---`);
    for (const item of dataStore.testimonials) {
      summary.testimonials.processed++;
      try {
        const existing = await Testimonial.findOne({ name: item.name?.trim() });
        if (existing) {
          summary.testimonials.skipped++;
        } else {
          if (!isDryRun) {
            await Testimonial.create({
              name: item.name,
              title: item.title || item.package || 'Traveler Experience',
              package: item.package || 'Traveler',
              review: item.review,
              rating: item.rating || 5,
              date: item.date || 'Recent',
              avatar: item.avatar || '',
              avatarColor: item.avatarColor || '#00bcd4',
              initial: item.initial || (item.name ? item.name.charAt(0).toUpperCase() : 'A'),
              isActive: item.isActive !== false,
            });
          }
          summary.testimonials.inserted++;
        }
      } catch (err) {
        summary.testimonials.failed++;
        console.warn(`  [Warning] Testimonial error:`, err.message);
      }
    }
  }

  // 8. Visas
  if (Array.isArray(dataStore.visas)) {
    console.log(`--- Migrating Visas (${dataStore.visas.length} items) ---`);
    for (const item of dataStore.visas) {
      summary.visas.processed++;
      try {
        const existing = await Visa.findOne({ country: item.country?.trim() });
        if (existing) {
          summary.visas.skipped++;
        } else {
          if (!isDryRun) {
            await Visa.create({
              country: item.country,
              flagImage: item.flagImage || '',
              type: item.type || 'Tourist',
              price: item.price || 1500,
              originalPrice: item.originalPrice || 2000,
              currency: item.currency || 'INR',
              processingTime: item.processingTime || '3-5 Working Days',
              isFastTrack: item.isFastTrack !== false,
              badgeText: item.badgeText || 'FAST TRACK',
              getOnDate: item.getOnDate || '',
              isActive: item.isActive !== false,
            });
          }
          summary.visas.inserted++;
        }
      } catch (err) {
        summary.visas.failed++;
        console.warn(`  [Warning] Visa error:`, err.message);
      }
    }
  }

  // 9. Tours
  if (Array.isArray(dataStore.tours)) {
    console.log(`--- Migrating Tours (${dataStore.tours.length} items) ---`);
    for (const item of dataStore.tours) {
      summary.tours.processed++;
      try {
        const existing = await Tour.findOne({ title: item.title?.trim() });
        if (existing) {
          summary.tours.skipped++;
        } else {
          if (!isDryRun) {
            await Tour.create({
              title: item.title,
              description: item.description || '',
              images: item.images || [],
              price: item.price || 150,
              originalPrice: item.originalPrice || 200,
              currency: item.currency || 'INR',
              duration: item.duration || { days: 1, nights: 0 },
              category: item.category || 'Sightseeing',
              highlights: item.highlights || [],
              included: item.included || [],
              activities: item.activities || [],
              rating: item.rating || 4.8,
              isActive: item.isActive !== false,
            });
          }
          summary.tours.inserted++;
        }
      } catch (err) {
        summary.tours.failed++;
        console.warn(`  [Warning] Tour error:`, err.message);
      }
    }
  }

  // 10. Activities
  if (Array.isArray(dataStore.activities)) {
    console.log(`--- Migrating Activities (${dataStore.activities.length} items) ---`);
    for (const item of dataStore.activities) {
      summary.activities.processed++;
      const title = item.title || item.name;
      if (!title) {
        summary.activities.skipped++;
        continue;
      }
      try {
        const existing = await Activity.findOne({ title: title.trim() });
        if (existing) {
          summary.activities.skipped++;
        } else {
          if (!isDryRun) {
            await Activity.create({
              title: title.trim(),
              description: item.description || '',
              images: item.images || (item.image ? [item.image] : []),
              price: item.price || 50,
              originalPrice: item.originalPrice || 75,
              currency: item.currency || 'AED',
              duration: item.duration || { days: 1, nights: 0 },
              category: item.category || 'Attraction',
              includedServices: item.includedServices || [],
              activities: item.activities ? (Array.isArray(item.activities) ? item.activities : [item.activities]) : [],
              rating: item.rating || 4.8,
              isActive: item.isActive !== false,
            });
          }
          summary.activities.inserted++;
        }
      } catch (err) {
        summary.activities.failed++;
        console.warn(`  [Warning] Activity error:`, err.message);
      }
    }
  }

  // 11. Popups
  if (Array.isArray(dataStore.popups)) {
    console.log(`--- Migrating Popups (${dataStore.popups.length} items) ---`);
    for (const item of dataStore.popups) {
      summary.popups.processed++;
      try {
        const existing = await Popup.findOne({ title: item.title });
        if (existing) {
          summary.popups.skipped++;
        } else {
          if (!isDryRun) {
            await Popup.create({
              title: item.title || 'Special Ramadan Umrah Offer',
              message: item.message || '',
              imageUrl: item.imageUrl || item.image || '',
              buttonText: item.buttonText || 'Claim Deal',
              buttonLink: item.buttonLink || item.link || '#packages',
              link: item.link || item.buttonLink || '#packages',
              order: typeof item.order === 'number' ? item.order : 0,
              isActive: item.isActive !== false,
            });
          }
          summary.popups.inserted++;
        }
      } catch (err) {
        summary.popups.failed++;
        console.warn(`  [Warning] Popup error:`, err.message);
      }
    }
  }

  // 12. Enquiries
  if (Array.isArray(dataStore.enquiries)) {
    console.log(`--- Migrating Enquiries (${dataStore.enquiries.length} items) ---`);
    for (const item of dataStore.enquiries) {
      summary.enquiries.processed++;
      try {
        const name = (item.fullName || item.name || '').trim();
        const email = (item.email || '').trim().toLowerCase();
        const phone = (item.phone || '').trim();

        if (!name || !email || !phone) {
          summary.enquiries.skipped++;
          continue;
        }

        const existing = await Enquiry.findOne({ email, phone });
        if (existing) {
          summary.enquiries.skipped++;
        } else {
          const status = normalizeEnquiryStatus(item.status, item.isRead);
          if (!isDryRun) {
            await Enquiry.create({
              fullName: name,
              email: email,
              phone: phone,
              city: item.city || '',
              destination: item.destination || '',
              serviceRequired: item.serviceRequired || item.packageTitle || item.serviceType || 'General Inquiry',
              message: item.message || '',
              isRead: item.isRead || false,
              status: status,
              createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
            });
          }
          summary.enquiries.inserted++;
        }
      } catch (err) {
        summary.enquiries.failed++;
        console.warn(`  [Warning] Enquiry error:`, err.message);
      }
    }
  }

  // 13. SiteSettings
  if (dataStore.settings && typeof dataStore.settings === 'object') {
    console.log(`--- Migrating SiteSettings ---`);
    summary.siteSettings.processed++;
    try {
      const existing = await SiteSettings.findOne({ singleton: 'main' });
      if (existing) {
        summary.siteSettings.skipped++;
      } else {
        if (!isDryRun) {
          await SiteSettings.create({
            singleton: 'main',
            brandName: dataStore.settings.brandName || 'AIR DREAM TRAVEL & TOURISM LLC',
            brandTagline: dataStore.settings.brandTagline || 'Fly Your Dreams',
            logoUrl: dataStore.settings.logoUrl || '/assets/air-dream-logo.png',
            phone: dataStore.settings.phone || '+971 58 833 8927',
            whatsapp: dataStore.settings.whatsapp || '971588338927',
            email: dataStore.settings.email || 'info@airdreamtravel.com',
            address: dataStore.settings.address || 'Office 402, Al Asmawi Building, Sheikh Zayed Road, Dubai, UAE',
            aboutQuote: dataStore.settings.aboutQuote || '',
            aboutArchImg: dataStore.settings.aboutArchImg || '',
            bubble1Img: dataStore.settings.bubble1Img || '',
            bubble2Img: dataStore.settings.bubble2Img || '',
            bubble3Img: dataStore.settings.bubble3Img || '',
          });
        }
        summary.siteSettings.inserted++;
      }
    } catch (err) {
      summary.siteSettings.failed++;
      console.warn(`  [Warning] SiteSettings error:`, err.message);
    }
  }

  console.log(`\n======================================================`);
  console.log(`  MIGRATION SUMMARY`);
  console.log(`======================================================`);
  console.table(summary);

  await mongoose.disconnect();
  console.log(`\nMigration completed successfully.`);
}

migrate().catch(err => {
  console.error(`Fatal migration error:`, err);
  process.exit(1);
});
