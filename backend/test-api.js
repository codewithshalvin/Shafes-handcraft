import fetch from 'node-fetch';

const testAPI = async () => {
  try {
    console.log('🧪 Testing ShafesChannel API...\n');

    // Test health endpoint
// Change this line:
    const healthResponse = await fetch('https://handcraft-hpi2.onrender.com/api/health');    
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);

    console.log('\n🎉 ShafesChannel API is working properly!');
    console.log('\n📋 Available endpoints:');
    console.log('- POST /api/users/signup - User registration');
    console.log('- POST /api/users/login - User login');
    console.log('- POST /api/admin/login - Admin login');
    console.log('- GET /api/health - Health check');
    console.log('\n🔗 Server: http://localhost:5000');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
};

testAPI();