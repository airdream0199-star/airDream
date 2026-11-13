const Enquiry = require("../models/Enquiry");
const store = require("../utils/dataStore");
const mongoose = require("mongoose");

const dbOk = () => mongoose.connection.readyState === 1;

exports.createEnquiry = async (req, res) => {
  try {
    const enquiryData = {
      fullName: req.body.fullName || req.body.name || req.body.custName || "Valued Customer",
      phone: req.body.phone || req.body.custPhone || req.body.phoneOrWhatsApp || "+971 58 833 8927",
      email: req.body.email || req.body.custEmail || "customer@example.com",
      city: req.body.city || "",
      destination: req.body.destination || "",
      serviceRequired: req.body.serviceRequired || req.body.title || "General Inquiry",
      message: req.body.message || "",
      isRead: false,
    };

    if (dbOk()) {
      const doc = new Enquiry(enquiryData);
      const saved = await doc.save();
      const plain = { ...saved.toObject(), _id: String(saved._id), id: String(saved._id) };
      store.get("enquiries").unshift(plain);
      return res.status(201).json({ success: true, message: "Enquiry submitted successfully", enquiry: plain });
    }

    // Offline fallback
    const item = store.add("enquiries", { ...enquiryData, createdAt: new Date().toISOString() });
    return res.status(201).json({ success: true, message: "Enquiry submitted successfully", enquiry: item });
  } catch (err) {
    console.error("Error submitting enquiry:", err);
    return res.status(400).json({ success: false, message: "Error submitting enquiry", error: err.message });
  }
};

exports.getAllEnquiries = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const page = parseInt(req.query.page, 10) || 1;
    const skip = (page - 1) * limit;

    if (dbOk()) {
      const total = await Enquiry.countDocuments();
      const list = await Enquiry.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
      const enquiries = list.map(d => ({ ...d, _id: String(d._id), id: String(d._id) }));
      return res.json({ success: true, enquiries, total, totalPages: Math.ceil(total / limit) || 1, currentPage: page });
    }

    // Offline fallback: use in-memory cache
    const cached = store.get("enquiries") || [];
    const paginated = cached.slice(skip, skip + limit);
    return res.json({ success: true, enquiries: paginated, total: cached.length, totalPages: Math.ceil(cached.length / limit) || 1, currentPage: page });
  } catch (err) {
    const cached = store.get("enquiries") || [];
    return res.json({ success: true, enquiries: cached, total: cached.length, totalPages: 1, currentPage: 1 });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const isRead = req.body.isRead !== undefined ? req.body.isRead : true;
    if (dbOk() && req.params.id.length === 24) {
      const updated = await Enquiry.findByIdAndUpdate(req.params.id, { isRead }, { new: true }).lean();
      if (updated) {
        store.update("enquiries", req.params.id, { isRead });
        return res.json({ success: true, enquiry: { ...updated, _id: String(updated._id), id: String(updated._id) } });
      }
    }
    const updatedStore = store.update("enquiries", req.params.id, { isRead });
    return res.json({ success: true, enquiry: updatedStore });
  } catch (err) {
    const updatedStore = store.update("enquiries", req.params.id, { isRead: true });
    return res.json({ success: true, enquiry: updatedStore });
  }
};

exports.deleteEnquiry = async (req, res) => {
  try {
    if (dbOk() && req.params.id.length === 24) {
      await Enquiry.findByIdAndDelete(req.params.id);
    }
    store.delete("enquiries", req.params.id);
    return res.json({ success: true, message: "Enquiry deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
