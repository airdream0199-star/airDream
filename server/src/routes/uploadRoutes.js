const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authenticate = require('../middleware/authenticate');

// Image upload (Admin Protected)
router.post('/', authenticate, uploadController.uploadMiddleware, uploadController.handleUpload);

// Image deletion (Admin Protected)
router.delete('/:publicId(*)', authenticate, uploadController.handleDelete);

module.exports = router;
