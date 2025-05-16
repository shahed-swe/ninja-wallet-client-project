import fetch from 'node-fetch';

async function upgradeToPremium() {
  try {
    // Step 1: Login to get session cookie
    console.log('Logging in with demo credentials...');
    const loginResponse = await fetch('http://localhost:5002/api/auth/login', {
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
    
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Login successful!');
    
    // Step 2: Update user to premium directly (since we can't do a real Stripe payment in this test)
    console.log('\nDirectly updating user to premium for testing...');
    
    // First, get the current user to verify the update
    const userBefore = await fetch('http://localhost:5002/api/users/me', {
      headers: {
        Cookie: cookies
      }
    }).then(res => res.json());
    
    console.log('User before update:');
    console.log(`- Username: ${userBefore.username}`);
    console.log(`- Premium: ${userBefore.isPremium ? 'Yes' : 'No'}`);
    
    // Update the user record directly in the database to make them premium
    // Note: In a real app, this would happen through the Stripe subscription process
    // This is just for demonstration purposes
    const premiumExpiry = new Date();
    premiumExpiry.setFullYear(premiumExpiry.getFullYear() + 1); // Premium for 1 year
    
    await fetch('http://localhost:5002/api/execute-sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies
      },
      body: JSON.stringify({
        sql: `UPDATE users SET is_premium = true, premium_expiry = '${premiumExpiry.toISOString()}' WHERE username = 'demouser';`
      })
    });
    
    // Verify the update
    const userAfter = await fetch('http://localhost:5002/api/users/me', {
      headers: {
        Cookie: cookies
      }
    }).then(res => res.json());
    
    console.log('\nUser after update:');
    console.log(`- Username: ${userAfter.username}`);
    console.log(`- Premium: ${userAfter.isPremium ? 'Yes' : 'No'}`);
    console.log(`- Premium Expiry: ${userAfter.premiumExpiry}`);
    
    console.log('\nUser upgraded to premium!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

upgradeToPremium();
