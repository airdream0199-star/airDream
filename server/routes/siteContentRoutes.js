const express = require('express');
const router = express.Router();
const store = require('../utils/dataStore');
const mongoose = require('mongoose');

// GET /api/site-content — returns ALL site data for the frontend
router.get('/', async (req, res) => {
  try {
    // If Mongo is connected, reload a fresh snapshot from DB
    if (mongoose.connection.readyState === 1) {
      await store.loadFromMongo();
    }
    const content = store.getAllContent();
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving site content', error: err.message });
  }
});

// PUT /api/site-content — bulk-update (admin panel "Save All" if used)
router.put('/', async (req, res) => {
  try {
    const updated = store.setFullContent(req.body);
    res.json({ success: true, content: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error saving site content', error: err.message });
  }
});

module.exports = router;
