import fetch from 'node-fetch';

async function checkRevenue() {
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

    // Check user balance first
    const userResponse = await fetch('http://localhost:5002/api/users/me', {
      headers: {
        Cookie: cookies
      }
    });
    
    const userData = await userResponse.json();
    console.log('\nCurrent user balance:', userData.balance);
    
    // Step 2: Get revenue stats
    console.log('\nFetching revenue data...');
    const revenueResponse = await fetch('http://localhost:5002/api/admin/revenue', {
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

    // Step 3: Get transactions to show the fees
    console.log('\nFetching transactions...');
    const transactionsResponse = await fetch('http://localhost:5002/api/transactions', {
      headers: {
        Cookie: cookies
      }
    });
    
    if (!transactionsResponse.ok) {
      throw new Error(`Failed to get transactions! Status: ${transactionsResponse.status}`);
    }
    
    const transactions = await transactionsResponse.json();
    console.log('\nTransaction History and Fees:');
    console.log('--------------------------');
    transactions.forEach((tx, index) => {
      console.log(`${index + 1}. ${tx.type.toUpperCase()} - $${tx.amount}`);
      console.log(`   Fee: $${tx.fee} (${((tx.fee / tx.amount) * 100).toFixed(1)}%)`);
      console.log(`   Note: ${tx.note || 'N/A'}`);
      console.log('   ---');
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkRevenue();
