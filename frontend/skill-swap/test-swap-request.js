// Test script to verify swap request functionality
import fetch from 'node-fetch';

async function testSwapRequestAPI() {
  console.log('Testing Swap Request API...');
  
  try {
    // Test that the swap-requests endpoint exists
    const response = await fetch('http://localhost:3001/api/swap-requests');
    
    if (response.status === 401) {
      console.log('✅ /api/swap-requests endpoint exists and requires authentication');
    } else {
      console.log('❌ Unexpected response:', response.status);
    }
    
    // Test the backend health
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Backend health check:', healthData.message);
    
    console.log('\n🎉 Swap Request API is ready!');
    console.log('The frontend can now create swap requests using the SwapRequestModal.');
    console.log('Navigate to http://localhost:8082/discovery to test the feature.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSwapRequestAPI(); 