/**
 * dataStore.js — MongoDB-first persistent store with in-memory fallback.
 *
 * On Vercel, the filesystem is EPHEMERAL — data-store.json is wiped on every
 * cold-start. All data is now saved to MongoDB. The in-memory object is only
 * used as a temporary cache when MongoDB is unreachable.
 */
const mongoose = require('mongoose');

// ─── Lazy-loaded Mongoose models ───────────────────────────────────────────────
const getModel = (name) => {
  try {
    return mongoose.model(name);
  } catch {
    return null;
  }
};

// ─── In-memory fallback cache (lost on cold start — that's acceptable) ─────────
const memCache = {
  wallpapers: [],
  activities: [],
  tours: [],
  transfers: [],
  holidayPackages: [],
  travelDeals: [],
  gallery: [],
  testimonials: [],
  visas: [],
  popups: [],
  enquiries: [],
  whyChooseUs: [],
  settings: {},
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const isMongoConnected = () =>
  mongoose.connection.readyState === 1; // 1 = connected

const makeId = () =>
  `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

// Map collection name → Mongoose model name
const MODEL_MAP = {
  wallpapers: 'Wallpaper',
  activities: 'Activity',
  tours: 'Tour',
  transfers: 'Transfer',
  holidayPackages: 'HolidayPackage',
  travelDeals: 'TravelDeal',
  gallery: 'Gallery',
  testimonials: 'Testimonial',
  visas: 'Visa',
  popups: 'Popup',
  enquiries: 'Enquiry',
  whyChooseUs: 'WhyChooseUs',
};

class DataStore {
  // ── GET all ──────────────────────────────────────────────────────────────────
  get(collection) {
    if (!memCache[collection]) memCache[collection] = [];
    return memCache[collection];
  }

  // ── GET by ID ─────────────────────────────────────────────────────────────────
  getById(collection, id) {
    const list = this.get(collection);
    return list.find(item => String(item._id || item.id) === String(id)) || null;
  }

  // ── ADD (write to Mongo + cache) ──────────────────────────────────────────────
  async addAsync(collection, data) {
    const id = data._id || data.id || makeId();
    const item = {
      _id: id, id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };

    // Write to Mongo
    if (isMongoConnected()) {
      const ModelName = MODEL_MAP[collection];
      const Model = ModelName ? getModel(ModelName) : null;
      if (Model) {
        try {
          const doc = new Model({ ...data, _id: undefined });
          const saved = await doc.save();
          const plain = saved.toObject ? saved.toObject() : saved;
          item._id = String(plain._id);
          item.id = String(plain._id);
          // Sync cache
          if (!memCache[collection]) memCache[collection] = [];
          memCache[collection].unshift({ ...item, _id: item._id, id: item.id });
          return { ...item, _id: item._id, id: item.id };
        } catch (err) {
          console.warn(`[DataStore] Mongo save failed for ${collection}:`, err.message);
        }
      }
    }

    // Fallback: in-memory only
    if (!memCache[collection]) memCache[collection] = [];
    memCache[collection].unshift(item);
    return item;
  }

  // Sync wrapper (used by old code paths) — returns cached item immediately
  add(collection, data) {
    const id = data._id || data.id || makeId();
    const item = {
      _id: id, id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    if (!memCache[collection]) memCache[collection] = [];
    memCache[collection].unshift(item);

    // Fire-and-forget Mongo write
    if (isMongoConnected()) {
      const ModelName = MODEL_MAP[collection];
      const Model = ModelName ? getModel(ModelName) : null;
      if (Model) {
        const doc = new Model({ ...data, _id: undefined });
        doc.save()
          .then(saved => {
            const mongoId = String(saved._id);
            // Update the cache entry with real Mongo _id
            const idx = memCache[collection].findIndex(i => String(i._id) === String(id));
            if (idx !== -1) {
              memCache[collection][idx]._id = mongoId;
              memCache[collection][idx].id = mongoId;
            }
          })
          .catch(err => console.warn(`[DataStore] Async Mongo save (${collection}):`, err.message));
      }
    }
    return item;
  }

  // ── UPDATE ────────────────────────────────────────────────────────────────────
  update(collection, id, updates) {
    const list = this.get(collection);
    const idx = list.findIndex(i => String(i._id || i.id) === String(id));
    const updated = {
      ...(idx >= 0 ? list[idx] : {}),
      ...updates,
      _id: id, id,
      updatedAt: new Date().toISOString(),
    };
    if (idx >= 0) list[idx] = updated;
    else list.unshift(updated);

    // Fire-and-forget Mongo update
    if (isMongoConnected()) {
      const ModelName = MODEL_MAP[collection];
      const Model = ModelName ? getModel(ModelName) : null;
      if (Model) {
        Model.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true, upsert: false })
          .catch(err => console.warn(`[DataStore] Async Mongo update (${collection}):`, err.message));
      }
    }
    return updated;
  }

  // ── DELETE ────────────────────────────────────────────────────────────────────
  delete(collection, id) {
    if (!memCache[collection]) return false;
    const before = memCache[collection].length;
    memCache[collection] = memCache[collection].filter(i => String(i._id || i.id) !== String(id));
    const deleted = memCache[collection].length < before;

    // Fire-and-forget Mongo delete
    if (isMongoConnected()) {
      const ModelName = MODEL_MAP[collection];
      const Model = ModelName ? getModel(ModelName) : null;
      if (Model) {
        Model.findByIdAndDelete(id)
          .catch(err => console.warn(`[DataStore] Async Mongo delete (${collection}):`, err.message));
      }
    }
    return deleted;
  }

  // ── SETTINGS ──────────────────────────────────────────────────────────────────
  getSettings() {
    return memCache.settings || {};
  }

  updateSettings(newSettings) {
    memCache.settings = { ...memCache.settings, ...newSettings };

    // Fire-and-forget Mongo settings upsert
    if (isMongoConnected()) {
      const SiteSetting = getModel('SiteSetting');
      if (SiteSetting) {
        SiteSetting.findOneAndUpdate(
          { singleton: 'main' },
          { $set: { ...newSettings, singleton: 'main' } },
          { upsert: true, new: true }
        ).catch(err => console.warn('[DataStore] Settings save error:', err.message));
      }
    }
    return memCache.settings;
  }

  // ── LOAD FROM MONGO on startup ─────────────────────────────────────────────────
  async loadFromMongo() {
    if (!isMongoConnected()) return;

    const collections = Object.keys(MODEL_MAP);
    for (const col of collections) {
      const ModelName = MODEL_MAP[col];
      const Model = getModel(ModelName);
      if (!Model) continue;
      try {
        const docs = await Model.find({}).sort({ createdAt: -1 }).lean();
        memCache[col] = docs.map(d => ({
          ...d,
          _id: String(d._id),
          id: String(d._id),
        }));
      } catch (err) {
        console.warn(`[DataStore] Load ${col} from Mongo:`, err.message);
      }
    }

    // Load settings
    try {
      const SiteSetting = getModel('SiteSetting');
      if (SiteSetting) {
        const s = await SiteSetting.findOne({ singleton: 'main' }).lean();
        if (s) {
          const { _id, __v, singleton, ...rest } = s;
          memCache.settings = rest;
        }
      }
    } catch (err) {
      console.warn('[DataStore] Load settings from Mongo:', err.message);
    }
  }

  // ── getAllContent (for /api/site-content) ─────────────────────────────────────
  getAllContent() {
    return {
      wallpapers: this.get('wallpapers'),
      attractions: this.get('activities'),
      tours: this.get('tours'),
      transfers: this.get('transfers'),
      holidayPackages: this.get('holidayPackages'),
      packages: this.get('travelDeals'),
      gallery: this.get('gallery'),
      reviews: this.get('testimonials'),
      visas: this.get('visas'),
      popups: this.get('popups'),
      whyChooseUs: this.getWhyChooseUs(),
      settings: this.getSettings(),
    };
  }

  getWhyChooseUs() {
    const list = this.get('whyChooseUs');
    return list;
  }

  setFullContent(content) {
    if (content.wallpapers) memCache.wallpapers = content.wallpapers;
    if (content.attractions) memCache.activities = content.attractions;
    if (content.activities) memCache.activities = content.activities;
    if (content.tours) memCache.tours = content.tours;
    if (content.transfers) memCache.transfers = content.transfers;
    if (content.holidayPackages) memCache.holidayPackages = content.holidayPackages;
    if (content.packages) memCache.travelDeals = content.packages;
    if (content.travelDeals) memCache.travelDeals = content.travelDeals;
    if (content.gallery) memCache.gallery = content.gallery;
    if (content.reviews) memCache.testimonials = content.reviews;
    if (content.testimonials) memCache.testimonials = content.testimonials;
    if (content.visas) memCache.visas = content.visas;
    if (content.popups) memCache.popups = content.popups;
    if (content.whyChooseUs) memCache.whyChooseUs = content.whyChooseUs;
    if (content.features) memCache.whyChooseUs = content.features;
    if (content.settings) memCache.settings = content.settings;

    // Persist everything to Mongo
    Object.entries(MODEL_MAP).forEach(([col, ModelName]) => {
      if (memCache[col] && isMongoConnected()) {
        // We don't bulk-replace here; individual saves happen through add/update
      }
    });

    return this.getAllContent();
  }
}

const store = new DataStore();
module.exports = store;
