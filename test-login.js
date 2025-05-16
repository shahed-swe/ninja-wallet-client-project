import fetch from 'node-fetch';

async function testLogin() {
  try {
    // Create session
    console.log('Logging in with demo credentials...');
    const loginResponse = await fetch('http://ninjawallet.ninja/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'demouser',
        password: 'password123'
      }),
      redirect: 'manual'
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed! Status: ${loginResponse.status}`);
    }
    
    const userData = await loginResponse.json();
    console.log('\nLogin successful!');
    console.log('\nUser data:');
    console.log(JSON.stringify(userData, null, 2));
    
    // Check session
    console.log('\nVerifying session...');
    const sessionResponse = await fetch('http://ninjawallet.ninja/api/auth/session', {
      headers: {
        Cookie: loginResponse.headers.get('set-cookie')
      }
    });
    
    if (!sessionResponse.ok) {
      throw new Error(`Session check failed! Status: ${sessionResponse.status}`);
    }
    
    const sessionData = await sessionResponse.json();
    console.log('\nSession valid! Current user:');
    console.log(JSON.stringify(sessionData, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();
