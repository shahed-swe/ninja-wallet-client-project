import fetch from 'node-fetch';

async function testPremiumTransactions() {
  try {
    // Step 1: Login to get session cookie
    console.log('Logging in with premium demo credentials...');
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
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
    const userData = await loginResponse.json();
    console.log('Login successful!');
    console.log(`User (${userData.username}) is premium: ${userData.isPremium ? 'Yes' : 'No'}`);

    // Add funds for transactions
    console.log('\nAdding funds for testing...');
    await fetch('http://localhost:5001/api/add-funds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies
      },
      body: JSON.stringify({
        amount: 2000
      })
    });
    
    // Create transactions as premium user
    const transactions = [
      // Small transaction with premium fee (8% instead of 15%)
      {
        type: 'send',
        amount: 50, 
        recipient: 'Premium-Alice',
        note: 'Small transfer - premium fee (8% instead of 15%)'
      },
      // Medium transaction with premium fee (8% instead of 13%)
      {
        type: 'send',
        amount: 500,
        recipient: 'Premium-Bob',
        note: 'Medium transfer - premium fee (8% instead of 13%)'
      },
      // Large transaction with premium fee (8% instead of 10%)
      {
        type: 'send',
        amount: 1500,
        recipient: 'Premium-Charlie',
        note: 'Large transfer - premium fee (8% instead of 10%)'
      }
    ];
    
    console.log('\nCreating premium transactions to demonstrate reduced fees...');
    
    for (let i = 0; i < transactions.length; i++) {
      console.log(`\nProcessing premium transaction ${i+1}: ${transactions[i].note}`);
      const response = await fetch('http://localhost:5001/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookies
        },
        body: JSON.stringify(transactions[i])
      });
      
      if (!response.ok) {
        console.error(`Transaction failed: ${await response.text()}`);
        continue;
      }
      
      const data = await response.json();
      console.log('Transaction created:');
      console.log(`- Amount: $${data.amount}`);
      console.log(`- Fee: $${data.fee} (${((data.fee / data.amount) * 100).toFixed(1)}%)`);
    }
    
    // Check updated revenue stats
    console.log('\nChecking updated revenue stats...');
    const revenueResponse = await fetch('http://localhost:5001/api/admin/revenue', {
      headers: {
        Cookie: cookies
      }
    });
    
    if (!revenueResponse.ok) {
      throw new Error(`Failed to get revenue data! Status: ${revenueResponse.status}`);
    }
    
    const revenueData = await revenueResponse.json();
    console.log('\nUpdated Revenue Statistics:');
    console.log('--------------------------');
    console.log(`Total Revenue: $${revenueData.totalRevenue.toFixed(2)}`);
    console.log(`Transaction Count: ${revenueData.transactionCount}`);
    console.log(`Average Fee Per Transaction: $${revenueData.averageFeePerTransaction.toFixed(2)}`);
    
    // Calculate savings from premium
    console.log('\nPremium Savings Analysis:');
    console.log('-------------------------');
    console.log('Transaction 1 ($50):');
    console.log(`- Standard fee (15%): $${(50 * 0.15).toFixed(2)}`);
    console.log(`- Premium fee (8%): $${(50 * 0.08).toFixed(2)}`);
    console.log(`- Savings: $${(50 * 0.15 - 50 * 0.08).toFixed(2)} (${((1 - 0.08/0.15) * 100).toFixed(0)}% reduction)`);
    
    console.log('\nTransaction 2 ($500):');
    console.log(`- Standard fee (13%): $${(500 * 0.13).toFixed(2)}`);
    console.log(`- Premium fee (8%): $${(500 * 0.08).toFixed(2)}`);
    console.log(`- Savings: $${(500 * 0.13 - 500 * 0.08).toFixed(2)} (${((1 - 0.08/0.13) * 100).toFixed(0)}% reduction)`);
    
    console.log('\nTransaction 3 ($1500):');
    console.log(`- Standard fee (10%): $${(1500 * 0.10).toFixed(2)}`);
    console.log(`- Premium fee (8%): $${(1500 * 0.08).toFixed(2)}`);
    console.log(`- Savings: $${(1500 * 0.10 - 1500 * 0.08).toFixed(2)} (${((1 - 0.08/0.10) * 100).toFixed(0)}% reduction)`);
    
    console.log('\nTotal Monthly Premium Cost: $9.99');
    console.log(`Total Savings on These Transactions: $${(
      50 * 0.15 - 50 * 0.08 +
      500 * 0.13 - 500 * 0.08 +
      1500 * 0.10 - 1500 * 0.08
    ).toFixed(2)}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPremiumTransactions();
