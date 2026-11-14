const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const authenticate = require('../middleware/authenticate');

// Public
router.get('/', galleryController.getAllGalleryItems);
router.get('/:id', galleryController.getGalleryItemById);

// Admin protected
router.post('/', authenticate, galleryController.createGalleryItem);
router.put('/:id', authenticate, galleryController.updateGalleryItem);
router.delete('/:id', authenticate, galleryController.deleteGalleryItem);

module.exports = router;
