/**
 * Automated Backend Test Suite
 * Tests authentication, database CRUD, enquiry workflows, validators, and security.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = require('../src/app');
const Admin = require('../src/models/Admin');
const Enquiry = require('../src/models/Enquiry');
const Tour = require('../src/models/Tour');
const Activity = require('../src/models/Activity');
const TravelDeal = require('../src/models/TravelDeal');
const Visa = require('../src/models/Visa');
const Transfer = require('../src/models/Transfer');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  FAIL: ${testName}`);
    failedTests++;
  }
}

async function runTests() {
  console.log(`\n======================================================`);
  console.log(`  AIR DREAM BACKEND VERIFICATION TEST SUITE`);
  console.log(`======================================================\n`);

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is missing. Cannot run tests.');
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
  console.log(`Connected to MongoDB Atlas: ${mongoose.connection.host}\n`);

  // ── TEST SUITE 1: Authentication & Security ──────────────────
  console.log(`[Suite 1] Authentication & Security`);

  // Ensure test admin exists
  const testEmail = 'testadmin@airdream.com';
  const testPassword = 'SecureAdminPassword123!';
  await Admin.deleteOne({ email: testEmail });
  const testAdmin = await Admin.create({
    email: testEmail,
    password: testPassword,
    name: 'Test Administrator',
    role: 'admin',
  });

  // Test 1.1: Password hashing
  const isHashed = testAdmin.password !== testPassword && testAdmin.password.startsWith('$2');
  assert(isHashed, 'Admin password is encrypted with bcryptjs');

  // Test 1.2: Password comparison method
  const matchSuccess = await testAdmin.comparePassword(testPassword);
  assert(matchSuccess === true, 'comparePassword succeeds with correct password');

  const matchFail = await testAdmin.comparePassword('WrongPassword!');
  assert(matchFail === false, 'comparePassword rejects incorrect password');

  // Test 1.3: JWT Generation & Verification
  const token = jwt.sign(
    { id: testAdmin._id, email: testAdmin.email, role: testAdmin.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  assert(decoded.email === testEmail, 'JWT encodes and decodes admin credentials securely');

  // Test 1.4: Reject forged / mock tokens
  let mockRejected = false;
  try {
    jwt.verify('mock-admin-token-airdream', process.env.JWT_SECRET);
  } catch (err) {
    mockRejected = true;
  }
  assert(mockRejected, 'Mock admin token is strictly rejected');

  // ── TEST SUITE 2: Enquiry Workflow & Validation ──────────────
  console.log(`\n[Suite 2] Enquiry Workflow & Validation`);

  // Test 2.1: Valid enquiry creation
  const validEnquiry = await Enquiry.create({
    fullName: 'Jane Doe',
    email: 'janedoe@testtravel.com',
    phone: '+971 50 123 4567',
    destination: 'Dubai',
    serviceRequired: 'VIP Desert Safari',
    message: 'Looking for a private family safari.',
    status: 'New',
  });
  assert(validEnquiry._id && validEnquiry.status === 'New', 'Valid enquiry saved to MongoDB with status "New"');

  // Test 2.2: Updating enquiry status and admin notes
  validEnquiry.status = 'Quoted';
  validEnquiry.adminNotes = 'Sent quotation AED 1,200 via WhatsApp';
  await validEnquiry.save();

  const refreshedEnquiry = await Enquiry.findById(validEnquiry._id);
  assert(
    refreshedEnquiry.status === 'Quoted' && refreshedEnquiry.adminNotes.includes('Sent quotation'),
    'Enquiry status and internal admin notes successfully updated'
  );

  // Test 2.3: Reject invalid status
  let invalidStatusRejected = false;
  try {
    refreshedEnquiry.status = 'NonExistentStatus';
    await refreshedEnquiry.save();
  } catch (e) {
    invalidStatusRejected = true;
  }
  assert(invalidStatusRejected, 'Invalid enquiry status rejected by schema enum');

  // Clean up test enquiry
  await Enquiry.findByIdAndDelete(validEnquiry._id);

  // ── TEST SUITE 3: Content Model Persistence & Slugs ─────────
  console.log(`\n[Suite 3] Content Models Persistence & Auto-slugs`);

  // Test 3.1: Tour auto-slug generation
  const testTour = await Tour.create({
    title: 'Test Luxury Helicopter Tour Dubai',
    price: 650,
    currency: 'AED',
    category: 'Adventure',
  });
  assert(testTour.slug === 'test-luxury-helicopter-tour-dubai', 'Tour generates clean URL-friendly slug automatically');
  await Tour.findByIdAndDelete(testTour._id);

  // Test 3.2: Activity auto-slug generation
  const testActivity = await Activity.create({
    title: 'Test Scuba Diving Palm Jumeirah',
    price: 320,
    currency: 'AED',
  });
  assert(testActivity.slug === 'test-scuba-diving-palm-jumeirah', 'Activity generates clean slug automatically');
  await Activity.findByIdAndDelete(testActivity._id);

  // Test 3.3: Visa persistence
  const testVisa = await Visa.create({
    country: 'Test Country Visa Service',
    price: 450,
    currency: 'AED',
  });
  assert(testVisa._id && testVisa.country === 'Test Country Visa Service', 'Visa service persists to database');
  await Visa.findByIdAndDelete(testVisa._id);

  // Test 3.4: Transfer persistence
  const testTransfer = await Transfer.create({
    title: 'VIP Chauffeur Mercedes S-Class',
    price: '$99',
    vehicle: 'Mercedes S-Class',
  });
  assert(testTransfer._id && testTransfer.vehicle === 'Mercedes S-Class', 'Transfer vehicle persists to database');
  await Transfer.findByIdAndDelete(testTransfer._id);

  // Clean up test admin
  await Admin.deleteOne({ email: testEmail });

  console.log(`\n======================================================`);
  console.log(`  TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log(`======================================================\n`);

  await mongoose.disconnect();

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
