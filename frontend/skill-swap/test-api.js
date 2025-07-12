// Test script to verify API connectivity
import { apiService } from '../src/services/api.js';

// Test the API connection
async function testApiConnection() {
  console.log('Testing API connection...');
  
  try {
    // Test health endpoint
    const health = await apiService.healthCheck();
    console.log('✅ Backend health check:', health);
    
    // Test registration with sample data
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'testpass123',
      location: 'Test City'
    };
    
    console.log('Testing registration...');
    const registerResponse = await apiService.register(testUser);
    console.log('✅ Registration successful:', registerResponse);
    
    // Test login with the same credentials
    console.log('Testing login...');
    const loginResponse = await apiService.login({
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse);
    
    // Test logout
    console.log('Testing logout...');
    await apiService.logout();
    console.log('✅ Logout successful');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Run the test if this script is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  testApiConnection();
} else {
  // Node environment
  export { testApiConnection };
}
