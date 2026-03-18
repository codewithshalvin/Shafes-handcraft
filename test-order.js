// Simple test to create an order with reference photos
const formData = new FormData();

// Add customer info
formData.append('customerInfo', JSON.stringify({
  name: 'Test Customer',
  email: 'test@example.com',
  phone: '1234567890',
  address: 'Test Address'
}));

// Add order items
formData.append('items', JSON.stringify([
  {
    product: '507f1f77bcf86cd799439011', // dummy product ID
    productName: 'Birthday Frame',
    quantity: 1,
    price: 250,
    subtotal: 250,
    specialRequest: 'Please make it colorful'
  }
]));

formData.append('totalAmount', '250');

// Test function to send order
async function testOrderCreation() {
  try {
    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    console.log('Order created:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

console.log('Test script ready. In browser console, run: testOrderCreation()');