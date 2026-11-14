/**
 * Safe, Idempotent Administrator Setup Script
 * Usage:
 *   node server/src/scripts/seedAdmin.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function seedAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();

  if (!adminEmail || !adminPassword) {
    console.error('[Error] ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env');
    process.exit(1);
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('[Error] MONGO_URI is missing from environment.');
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log(`[Seed Admin] Connected to MongoDB Atlas.`);

  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log(`[Seed Admin] Administrator account already exists for ${adminEmail}. Skipping (no overwrite).`);
  } else {
    await Admin.create({
      email: adminEmail,
      password: adminPassword,
      name: 'System Administrator',
      role: 'superadmin',
    });
    console.log(`[Seed Admin] Successfully created initial administrator account: ${adminEmail}`);
  }

  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error('[Seed Admin Error]', err.message);
  process.exit(1);
});
