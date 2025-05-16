import fetch from 'node-fetch';

async function checkRevenueWithLogin() {
  try {
    // Step 1: Login to get session cookie
    console.log('Logging in with demo credentials...');
    const loginResponse = await fetch('https://ninjawallet.ninja/api/auth/login', {
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
    
    // Step 2: Use the session cookie to get revenue data
    console.log('Fetching revenue data...');
    const revenueResponse = await fetch('https://ninjawallet.ninja/api/admin/revenue', {
      headers: {
        Cookie: cookies
      }
    });
    
    if (!revenueResponse.ok) {
      throw new Error(`Failed to get revenue data! Status: ${revenueResponse.status}`);
    }
    
    const data = await revenueResponse.json();
    console.log('\nRevenue Statistics:');
    console.log('-----------------');
    console.log(`Total Revenue: $${data.totalRevenue.toFixed(2)}`);
    console.log(`Transaction Count: ${data.transactionCount}`);
    console.log(`Average Fee Per Transaction: $${data.averageFeePerTransaction ? data.averageFeePerTransaction.toFixed(2) : '0.00'}`);
    console.log('\nRevenue By Type:');
    console.log(`  Send: $${data.revenueByType.send.toFixed(2)}`);
    console.log(`  Receive: $${data.revenueByType.receive.toFixed(2)}`);
    console.log(`  Trade: $${data.revenueByType.trade.toFixed(2)}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkRevenueWithLogin();
