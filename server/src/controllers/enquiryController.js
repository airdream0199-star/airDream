const Enquiry = require('../models/Enquiry');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

/**
 * Public submission of an enquiry or custom quote request
 */
exports.createEnquiry = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      city,
      destination,
      serviceRequired,
      travelDate,
      travellerCount,
      budget,
      paymentPreference,
      message,
      source,
    } = req.body;

    const newEnquiry = new Enquiry({
      fullName: (fullName || '').trim(),
      email: (email || '').trim().toLowerCase(),
      phone: (phone || '').trim(),
      city: (city || '').trim(),
      destination: (destination || '').trim(),
      serviceRequired: (serviceRequired || 'General Inquiry').trim(),
      travelDate: (travelDate || '').trim(),
      travellerCount: (travellerCount || '').trim(),
      budget: (budget || '').trim(),
      paymentPreference: (paymentPreference || '').trim(),
      message: (message || '').trim(),
      source: (source || 'website').trim(),
      status: 'New',
      isRead: false,
    });

    const saved = await newEnquiry.save();

    // Do not expose internal admin notes or internal fields to public response
    const publicSafeResponse = {
      id: saved._id,
      fullName: saved.fullName,
      email: saved.email,
      serviceRequired: saved.serviceRequired,
      createdAt: saved.createdAt,
    };

    return sendSuccess(
      res,
      publicSafeResponse,
      'Your enquiry has been received. Our travel specialist will contact you shortly.',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: List all enquiries with pagination, search, and status filter
 */
exports.getAllEnquiries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { destination: searchRegex },
        { serviceRequired: searchRegex },
      ];
    }

    const [enquiries, total] = await Promise.all([
      Enquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Enquiry.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return sendPaginated(
      res,
      enquiries,
      { page, limit, total, totalPages },
      'Enquiries retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get enquiry by ID
 */
exports.getEnquiryById = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id).lean();
    if (!enquiry) {
      return sendError(res, 'Enquiry not found', 404);
    }
    return sendSuccess(res, enquiry, 'Enquiry retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update enquiry status and/or internal notes
 */
exports.updateEnquiry = async (req, res, next) => {
  try {
    const { status, adminNotes, isRead } = req.body;
    const updateData = {};

    if (status !== undefined) {
      updateData.status = status;
    }
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }
    if (isRead !== undefined) {
      updateData.isRead = Boolean(isRead);
    }

    const updated = await Enquiry.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return sendError(res, 'Enquiry not found', 404);
    }

    return sendSuccess(res, updated, 'Enquiry updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Delete enquiry
 */
exports.deleteEnquiry = async (req, res, next) => {
  try {
    const deleted = await Enquiry.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return sendError(res, 'Enquiry not found', 404);
    }
    return sendSuccess(res, { id: req.params.id }, 'Enquiry deleted successfully');
  } catch (error) {
    next(error);
  }
};
