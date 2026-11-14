const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

const uploadBufferToCloudinary = (buffer, folder = 'airdream', filename) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder,
      resource_type: 'image',
      transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
    };

    if (filename) {
      options.public_id = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
    }

    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

const deleteCloudinaryImage = (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

module.exports = {
  uploadBufferToCloudinary,
  deleteCloudinaryImage,
};
