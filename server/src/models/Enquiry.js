const mongoose = require('mongoose');

const ENQUIRY_STATUSES = ['New', 'Contacted', 'Quoted', 'Converted', 'Closed'];

const enquirySchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    destination: {
      type: String,
      trim: true,
      default: '',
    },
    serviceRequired: {
      type: String,
      trim: true,
      default: 'General Inquiry',
    },
    travelDate: {
      type: String,
      trim: true,
      default: '',
    },
    travellerCount: {
      type: String,
      trim: true,
      default: '',
    },
    budget: {
      type: String,
      trim: true,
      default: '',
    },
    paymentPreference: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    source: {
      type: String,
      default: 'website',
      trim: true,
    },
    status: {
      type: String,
      enum: ENQUIRY_STATUSES,
      default: 'New',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for backwards compatibility with 'name'
enquirySchema.virtual('name').get(function () {
  return this.fullName;
});

const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', enquirySchema);
Enquiry.STATUSES = ENQUIRY_STATUSES;

module.exports = Enquiry;
