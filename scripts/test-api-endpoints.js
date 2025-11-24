// API Endpoint Testing Script for AgriSmart
// Run this script after deployment to verify all endpoints are working

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

async function testEndpoint(method, path, data = null, description = '') {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`\n🧪 Testing ${method} ${path}`);
    if (description) console.log(`   Description: ${description}`);

    const response = await fetch(`${BASE_URL}${path}`, options);
    const result = await response.json();

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      console.log(`   ✅ Success`);
      testResults.passed++;
    } else {
      console.log(`   ❌ Failed: ${result.error || 'Unknown error'}`);
      testResults.failed++;
      testResults.errors.push({
        path,
        method,
        status: response.status,
        error: result.error || 'Unknown error'
      });
    }

    return { success: response.ok, data: result, status: response.status };
  } catch (error) {
    console.log(`   ❌ Network Error: ${error.message}`);
    testResults.failed++;
    testResults.errors.push({
      path,
      method,
      error: `Network Error: ${error.message}`
    });
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 Starting AgriSmart API Endpoint Tests');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('='.repeat(60));

  // Public API Tests (No authentication required)
  console.log('\n📡 PUBLIC API TESTS');
  console.log('-'.repeat(30));

  // Test encyclopedia endpoint
  await testEndpoint('GET', '/api/encyclopedia', null, 'Get crop encyclopedia data');
  await testEndpoint('GET', '/api/encyclopedia?search=wheat', null, 'Search encyclopedia for wheat');
  await testEndpoint('GET', '/api/encyclopedia?crop=rice', null, 'Get specific crop info');

  // Test market prices endpoint
  await testEndpoint('GET', '/api/market-prices', null, 'Get market prices');
  await testEndpoint('GET', '/api/market-prices?crop=wheat', null, 'Filter market prices by crop');
  await testEndpoint('GET', '/api/market-prices?state=Maharashtra', null, 'Filter market prices by state');
  await testEndpoint('GET', '/api/market-prices?limit=10', null, 'Get limited market prices');

  // Test weather endpoint
  await testEndpoint('GET', '/api/weather', null, 'Get weather data for default location');
  await testEndpoint('GET', '/api/weather?location=Pune', null, 'Get weather for specific location');
  await testEndpoint('GET', '/api/weather?lat=18.52&lon=73.86', null, 'Get weather by coordinates');

  // Test government schemes
  await testEndpoint('GET', '/api/schemes', null, 'Get government schemes');
  await testEndpoint('GET', '/api/schemes?state=Maharashtra', null, 'Filter schemes by state');

  // Test district statistics
  await testEndpoint('GET', '/api/district-stats', null, 'Get district agricultural statistics');

  // Test disease detection
  await testEndpoint('GET', '/api/disease', null, 'Get disease detection info');

  // Test CROPSAP alerts
  await testEndpoint('GET', '/api/cropsap', null, 'Get CROPSAP alerts');
  await testEndpoint('GET', '/api/cropsap?district=Pune', null, 'Get CROPSAP alerts by district');

  // Test crop recommendations
  await testEndpoint('GET', '/api/recommend', null, 'Get crop recommendations');

  console.log('\n🔒 AUTHENTICATION-PROTECTED API TESTS');
  console.log('-'.repeat(40));
  console.log('Note: These endpoints require authentication and will return 401 Unauthorized');
  console.log('This is expected behavior for unauthenticated requests.');

  // Test protected endpoints (should return 401 without auth)
  await testEndpoint('GET', '/api/profile', null, 'Get user profile (protected)');
  await testEndpoint('GET', '/api/fields', null, 'Get user fields (protected)');

  // Test POST endpoints with sample data
  await testEndpoint('POST', '/api/profile', {
    full_name: 'Test Farmer',
    phone: '+919876543210',
    state: 'Maharashtra',
    district: 'Pune',
    land_area: '5',
    primary_crop: 'Wheat'
  }, 'Create/update user profile (protected)');

  await testEndpoint('POST', '/api/fields', {
    field_name: 'Test Field',
    area_hectares: '2.5',
    soil_type: 'Loamy',
    irrigation_type: 'Drip'
  }, 'Create new field (protected)');

  console.log('\n🛡️ ADMIN API TESTS');
  console.log('-'.repeat(25));
  console.log('Note: Admin endpoints require admin authentication');

  await testEndpoint('POST', '/api/admin/schemes', {
    name: 'Test Scheme',
    description: 'Test government scheme',
    state: 'Maharashtra',
    category: 'Subsidies',
    benefits: 'Test benefits'
  }, 'Create government scheme (admin only)');

  await testEndpoint('POST', '/api/admin/crops', {
    crop_name: 'Test Crop',
    scientific_name: 'Testus cropus',
    description: 'Test crop description',
    planting_season: 'Kharif',
    harvest_time: '3 months'
  }, 'Add crop to encyclopedia (admin only)');

  // Test field management APIs
  console.log('\n🌾 FIELD MANAGEMENT API TESTS');
  console.log('-'.repeat(35));
  console.log('Note: These require authentication');

  await testEndpoint('GET', '/api/crop-cycles', null, 'Get crop cycles (protected)');
  await testEndpoint('POST', '/api/crop-cycles', {
    field_id: 'test-field-id',
    crop_name: 'Wheat',
    variety: 'HD-2967',
    planting_date: new Date().toISOString().split('T')[0]
  }, 'Create crop cycle (protected)');

  await testEndpoint('GET', '/api/field-activities', null, 'Get field activities (protected)');

  // Test sensor APIs (future features)
  console.log('\n📡 IOT SENSOR API TESTS (Future Features)');
  console.log('-'.repeat(40));
  console.log('Note: These are prepared but may not be active yet');

  await testEndpoint('GET', '/api/sensors/data', null, 'Get sensor data (protected)');
  await testEndpoint('GET', '/api/sensors/alerts', null, 'Get sensor alerts (protected)');
  await testEndpoint('GET', '/api/sensors/analytics', null, 'Get sensor analytics (protected)');

  // Print test results summary
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

  if (testResults.errors.length > 0) {
    console.log('\n❌ FAILED TESTS DETAILS:');
    testResults.errors.forEach((error, index) => {
      console.log(`\n${index + 1}. ${error.method} ${error.path}`);
      console.log(`   Status: ${error.status || 'Network Error'}`);
      console.log(`   Error: ${error.error}`);
    });
  }

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (testResults.failed === 0) {
    console.log('✅ All tests passed! Your API endpoints are working correctly.');
    console.log('🔗 Next steps: Test authenticated endpoints with proper user session.');
  } else {
    console.log(`⚠️  ${testResults.failed} test(s) failed. Review the errors above.`);
    console.log('🔧 Common fixes:');
    console.log('   - Check environment variables (SUPABASE_URL, SUPABASE_ANON_KEY)');
    console.log('   - Ensure database migrations have been run');
    console.log('   - Verify API route files exist and have proper exports');
    console.log('   - Check server logs for detailed error information');
  }

  console.log('\n📋 MANUAL TESTING CHECKLIST:');
  console.log('   □ User registration and login flow');
  console.log('   □ Dashboard loads with user data');
  console.log('   □ Field creation and management');
  console.log('   □ Soil health data input and display');
  console.log('   □ Mobile responsiveness on actual devices');
  console.log('   □ Admin panel access with admin account');
  console.log('   □ File upload functionality (if applicable)');
  console.log('   □ Real-time data updates (if applicable)');

  return testResults;
}

// Alternative function for testing with authentication
async function testAuthenticatedEndpoints(accessToken) {
  console.log('\n🔐 TESTING AUTHENTICATED ENDPOINTS');
  console.log('-'.repeat(40));

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  };

  // Test authenticated endpoints
  const profileTest = await testWithAuth('GET', '/api/profile', null, headers, 'Get authenticated user profile');
  const fieldsTest = await testWithAuth('GET', '/api/fields', null, headers, 'Get user fields');

  // Test creating a field
  const createFieldTest = await testWithAuth('POST', '/api/fields', {
    field_name: 'Test Field from API Test',
    area_hectares: '1.5',
    soil_type: 'Sandy Loam',
    irrigation_type: 'Drip'
  }, headers, 'Create field with authentication');

  async function testWithAuth(method, path, data, headers, description) {
    try {
      console.log(`\n🧪 Testing ${method} ${path}`);
      console.log(`   Description: ${description}`);

      const options = { method, headers };
      if (data) options.body = JSON.stringify(data);

      const response = await fetch(`${BASE_URL}${path}`, options);
      const result = await response.json();

      console.log(`   Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        console.log(`   ✅ Success`);
        return { success: true, data: result };
      } else {
        console.log(`   ❌ Failed: ${result.error || 'Unknown error'}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.log(`   ❌ Network Error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

// Export functions for use in other scripts
module.exports = {
  runAllTests,
  testAuthenticatedEndpoints,
  testEndpoint
};

// Run tests if script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}