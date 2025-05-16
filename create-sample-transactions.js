import fetch from 'node-fetch';

async function createSampleTransactions() {
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
    
    // Step 2: Create a variety of transactions to demonstrate fee structure
    const transactions = [
      // Small transaction with standard fee (15%)
      {
        type: 'send',
        amount: 50, 
        recipient: 'Alice',
        note: 'Small transfer - standard fee (15%)'
      },
      // Medium transaction with standard fee (13%)
      {
        type: 'send',
        amount: 500,
        recipient: 'Bob',
        note: 'Medium transfer - standard fee (13%)'
      },
      // Large transaction with standard fee (10%)
      {
        type: 'send',
        amount: 1500,
        recipient: 'Charlie',
        note: 'Large transfer - standard fee (10%)'
      },
      // International transfer with currency exchange markup
      {
        amount: 200,
        recipient: 'David',
        note: 'International transfer with markup',
        fromCurrency: 'USD',
        toCurrency: 'EUR'
      },
      // Trade/investment with higher fee
      {
        assetType: 'crypto',
        assetName: 'Bitcoin',
        assetSymbol: 'BTC',
        amount: 300
      }
    ];
    
    console.log('\nCreating sample transactions to demonstrate fee structure...');
    
    // Process regular transactions
    for (let i = 0; i < 3; i++) {
      console.log(`\nProcessing transaction ${i+1}: ${transactions[i].note}`);
      const response = await fetch('http://localhost:5002/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookies
        },
        body: JSON.stringify(transactions[i])
      });
      
      const data = await response.json();
      console.log('Transaction created:');
      console.log(`- Amount: $${data.amount}`);
      console.log(`- Fee: $${data.fee} (${((data.fee / data.amount) * 100).toFixed(1)}%)`);
    }
    
    // Process international transfer
    console.log('\nProcessing international transfer');
    const intlResponse = await fetch('http://localhost:5002/api/international-transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies
      },
      body: JSON.stringify(transactions[3])
    });
    
    const intlData = await intlResponse.json();
    console.log('International transfer created:');
    console.log(`- Amount: $${intlData.transaction.amount}`);
    console.log(`- Fee: $${intlData.transaction.fee}`);
    console.log(`- Exchange rate: ${intlData.exchange.exchangeRate.toFixed(4)} (with ${intlData.exchange.markupPercentage}% markup)`);
    
    // Process investment
    console.log('\nProcessing investment');
    const investResponse = await fetch('http://localhost:5002/api/investments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies
      },
      body: JSON.stringify(transactions[4])
    });
    
    if (investResponse.ok) {
      console.log('Investment created successfully');
    } else {
      console.log('Investment creation failed:', await investResponse.text());
    }
    
    // Step 3: Check revenue stats
    console.log('\nChecking total revenue...');
    const revenueResponse = await fetch('http://localhost:5002/api/admin/revenue', {
      headers: {
        Cookie: cookies
      }
    });
    
    if (!revenueResponse.ok) {
      throw new Error(`Failed to get revenue data! Status: ${revenueResponse.status}`);
    }
    
    const revenueData = await revenueResponse.json();
    console.log('\nRevenue Statistics:');
    console.log('-----------------');
    console.log(`Total Revenue: $${revenueData.totalRevenue.toFixed(2)}`);
    console.log(`Transaction Count: ${revenueData.transactionCount}`);
    console.log(`Average Fee Per Transaction: $${revenueData.averageFeePerTransaction ? revenueData.averageFeePerTransaction.toFixed(2) : '0.00'}`);
    console.log('\nRevenue By Type:');
    console.log(`  Send: $${revenueData.revenueByType.send.toFixed(2)}`);
    console.log(`  Receive: $${revenueData.revenueByType.receive.toFixed(2)}`);
    console.log(`  Trade: $${revenueData.revenueByType.trade.toFixed(2)}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createSampleTransactions();
