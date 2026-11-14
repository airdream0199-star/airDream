/**
 * API Integration Test using native Node.js HTTP & fetch
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const http = require('http');
const app = require('../src/app');

async function testApi() {
  console.log(`Starting API Integration Tests...`);
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/v1`;

  try {
    // 1. Healthcheck
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    console.log('Healthcheck status:', healthData.status);
    if (!healthData.success) throw new Error('Healthcheck failed');

    // 2. Site Content aggregate endpoint
    const contentRes = await fetch(`${baseUrl}/site-content`);
    const contentData = await contentRes.json();
    console.log('Site-content success:', contentData.success);
    console.log('Tours loaded from Mongo:', contentData.data.tours?.length);
    console.log('Activities loaded from Mongo:', contentData.data.activities?.length);
    console.log('Transfers loaded from Mongo:', contentData.data.transfers?.length);
    if (!contentData.success || !Array.isArray(contentData.data.tours)) {
      throw new Error('Site content retrieval failed');
    }

    // 3. Public Tours list
    const toursRes = await fetch(`${baseUrl}/tours`);
    const toursData = await toursRes.json();
    console.log('Tours API status:', toursData.success, 'Count:', toursData.data.length);
    if (!toursData.success) throw new Error('Tours endpoint failed');

    // 3b. Section filtering verification
    const dubaiToursRes = await fetch(`${baseUrl}/tours?section=dubai`);
    const dubaiToursData = await dubaiToursRes.json();
    console.log('Dubai Section Tours Count:', dubaiToursData.data?.length);
    if (!dubaiToursData.success) throw new Error('Section filter failed');

    // 4. Public Enquiry submission
    const enquiryPayload = {
      fullName: 'Integration Test User',
      email: 'integration@testairdream.com',
      phone: '+971 58 123 4567',
      destination: 'Abu Dhabi',
      serviceRequired: 'Louvre Abu Dhabi Tour',
      message: 'Testing API contract',
    };
    const enquiryRes = await fetch(`${baseUrl}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiryPayload),
    });
    const enquiryData = await enquiryRes.json();
    console.log('Enquiry submission response:', enquiryData.success, enquiryData.message);
    if (!enquiryData.success || !enquiryData.data.id) {
      throw new Error('Enquiry submission failed');
    }

    // Clean up created enquiry
    const Enquiry = require('../src/models/Enquiry');
    await Enquiry.findByIdAndDelete(enquiryData.data.id);

    // 5. Test Protected Route without token -> Expect 401
    const protectedRes = await fetch(`${baseUrl}/auth/me`);
    console.log('Unauthenticated access status:', protectedRes.status);
    if (protectedRes.status !== 401) {
      throw new Error('Unauthenticated access should be rejected with 401');
    }

    console.log('\nAll API integration tests passed successfully!');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

testApi().catch((err) => {
  console.error('API test failure:', err);
  process.exit(1);
});
