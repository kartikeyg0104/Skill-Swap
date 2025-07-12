const apiService = require('./src/services/api');

async function testUserProfile() {
  try {
    console.log('Testing user profile API...');
    
    // First, try to login to get a token
    const loginResponse = await apiService.login({
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (loginResponse && loginResponse.accessToken) {
      console.log('✅ Login successful');
      
      // Test getting user profile
      const profileResponse = await apiService.getUserProfile();
      console.log('✅ User profile response:', JSON.stringify(profileResponse, null, 2));
      
      if (profileResponse.skillsOffered) {
        console.log(`✅ Found ${profileResponse.skillsOffered.length} skills offered`);
        profileResponse.skillsOffered.forEach(skill => {
          console.log(`  - ${skill.skillName} (${skill.level})`);
        });
      } else {
        console.log('❌ No skills offered found in profile');
      }
      
      if (profileResponse.skillsWanted) {
        console.log(`✅ Found ${profileResponse.skillsWanted.length} skills wanted`);
        profileResponse.skillsWanted.forEach(skill => {
          console.log(`  - ${skill.skillName} (${skill.priority})`);
        });
      } else {
        console.log('❌ No skills wanted found in profile');
      }
      
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing user profile:', error.message);
  }
}

testUserProfile(); 