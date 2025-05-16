import fetch from 'node-fetch';

async function checkRevenue() {
  try {
    const response = await fetch('http://localhost:5001/api/admin/revenue');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Revenue Statistics:');
    console.log('-----------------');
    console.log(`Total Revenue: $${data.totalRevenue.toFixed(2)}`);
    console.log(`Transaction Count: ${data.transactionCount}`);
    console.log(`Average Fee Per Transaction: $${data.averageFeePerTransaction.toFixed(2)}`);
    console.log('\nRevenue By Type:');
    console.log(`  Send: $${data.revenueByType.send.toFixed(2)}`);
    console.log(`  Receive: $${data.revenueByType.receive.toFixed(2)}`);
    console.log(`  Trade: $${data.revenueByType.trade.toFixed(2)}`);
  } catch (error) {
    console.error('Error fetching revenue data:', error);
  }
}

checkRevenue();
