// Simple test to verify backend connectivity
import fetch from 'node-fetch';

async function testBackend() {
  console.log('Testing backend connectivity...');
  
  try {
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Backend health check:', healthData);
    
    // Test user endpoint
    const userResponse = await fetch('http://localhost:3001/api/users/13');
    const userData = await userResponse.json();
    console.log('✅ User data:', {
      name: userData.name,
      skillsOffered: userData.skillsOffered?.length || 0,
      skillsWanted: userData.skillsWanted?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
  }
}

testBackend(); 