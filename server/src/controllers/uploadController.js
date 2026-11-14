const multer = require('multer');
const { uploadBufferToCloudinary, deleteCloudinaryImage } = require('../services/uploadService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Multer memory storage - serverless compatible
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
  if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and SVG images are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
});

exports.uploadMiddleware = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'image', maxCount: 1 },
]);

exports.handleUpload = async (req, res, next) => {
  try {
    const file = req.files?.file?.[0] || req.files?.image?.[0] || req.file;
    if (!file) {
      return sendError(res, 'No image file uploaded', 400);
    }

    const folder = req.body.folder || 'airdream';
    const result = await uploadBufferToCloudinary(file.buffer, folder);

    return sendSuccess(
      res,
      {
        url: result.secure_url,
        fullUrl: result.secure_url,
        publicId: result.public_id,
        filename: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
      },
      'Image uploaded successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

exports.handleDelete = async (req, res, next) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);
    if (!publicId) {
      return sendError(res, 'Public ID is required for image deletion', 400);
    }

    const result = await deleteCloudinaryImage(publicId);
    return sendSuccess(res, result, 'Image deleted successfully');
  } catch (error) {
    next(error);
  }
};
