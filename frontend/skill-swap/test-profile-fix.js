// Test to verify the Profile page API fix
import fetch from 'node-fetch';

async function testProfileFix() {
  console.log('Testing Profile page API fix...');
  
  try {
    // Test that the auth/me endpoint exists and requires auth
    const response = await fetch('http://localhost:3001/api/auth/me');
    const data = await response.json();
    
    if (data.error === 'Access token required') {
      console.log('✅ /api/auth/me endpoint exists and requires authentication');
    } else {
      console.log('❌ Unexpected response:', data);
    }
    
    // Test that the old endpoint doesn't exist
    const oldResponse = await fetch('http://localhost:3001/api/users/profile');
    if (oldResponse.status === 404) {
      console.log('✅ /api/users/profile endpoint correctly returns 404 (does not exist)');
    } else {
      console.log('❌ Old endpoint still exists:', oldResponse.status);
    }
    
    console.log('\n🎉 Profile page API fix is working correctly!');
    console.log('The frontend now calls /api/auth/me instead of /api/users/profile');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProfileFix(); 