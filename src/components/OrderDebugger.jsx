import React, { useState, useEffect } from 'react';

const OrderDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(false);

  const testAllEndpoints = async () => {
    setLoading(true);
    const results = {};

    // Test multiple possible endpoints
    const endpoints = [
      '/api/admin/orders',
      '/api/orders', 
      '/admin/orders',
      '/orders',
      '/api/admin/order',
      '/api/order'
    ];

    console.log('🔍 DEBUGGING: Testing all possible endpoints...');

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing: ${endpoint}`);
        
        const response = await fetch(`http://localhost:5000${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          results[endpoint] = {
            status: response.status,
            success: true,
            data: data,
            orderCount: data.orders ? data.orders.length : (Array.isArray(data) ? data.length : 0)
          };
          console.log(`✅ ${endpoint} SUCCESS:`, data);
        } else {
          results[endpoint] = {
            status: response.status,
            success: false,
            error: `HTTP ${response.status}`
          };
          console.log(`❌ ${endpoint} FAILED: ${response.status}`);
        }
      } catch (error) {
        results[endpoint] = {
          success: false,
          error: error.message
        };
        console.log(`❌ ${endpoint} ERROR:`, error.message);
      }
    }

    // Test backend health
    try {
      const healthResponse = await fetch('http://localhost:5000/api/health');
      results['BACKEND_HEALTH'] = {
        status: healthResponse.status,
        success: healthResponse.ok,
        data: healthResponse.ok ? await healthResponse.json() : 'Failed'
      };
    } catch (error) {
      results['BACKEND_HEALTH'] = {
        success: false,
        error: 'Backend not responding'
      };
    }

    console.log('🔍 ALL RESULTS:', results);
    setDebugInfo(results);
    setLoading(false);
  };

  const createTestOrderWithPhotos = async () => {
    try {
      console.log('🧪 Creating test order with photos...');
      
      const formData = new FormData();
      
      // Add customer info
      formData.append('customerInfo', JSON.stringify({
        name: 'Debug Test Customer',
        email: 'debug@test.com',
        phone: '9876543210',
        address: 'Debug Test Address'
      }));
      
      // Add order items
      formData.append('items', JSON.stringify([
        {
          product: '507f1f77bcf86cd799439011',
          productName: 'Debug Birthday Frame',
          quantity: 1,
          price: 250,
          subtotal: 250,
          specialRequest: 'Debug test with photos'
        }
      ]));
      
      formData.append('totalAmount', '250');
      
      // Create a mock file for testing
      const blob = new Blob(['fake image data'], { type: 'image/jpeg' });
      const file = new File([blob], 'debug-test-photo.jpg', { type: 'image/jpeg' });
      formData.append('referencePhotos', file);
      
      console.log('📤 Sending FormData:', {
        customerInfo: formData.get('customerInfo'),
        items: formData.get('items'),
        totalAmount: formData.get('totalAmount'),
        hasPhoto: formData.has('referencePhotos')
      });
      
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Test order created with photos:', result);
        alert('✅ Test order created successfully! Check the debug info.');
        testAllEndpoints(); // Refresh debug info
      } else {
        const error = await response.text();
        console.error('❌ Failed to create test order:', error);
        alert('❌ Failed to create test order. Check console for details.');
      }
    } catch (error) {
      console.error('❌ Error creating test order:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  const inspectExistingOrder = async () => {
    // Try to get order details from your existing system
    const orderIds = [
      '671150dd8e1b2c0f38b3e1c5', // Sample order ID from your screenshot
      'ORDER_1760708162310_u17ein6my'  // Sample order number
    ];

    for (const orderId of orderIds) {
      try {
        console.log(`🔍 Inspecting existing order: ${orderId}`);
        
        const endpoints = [
          `/api/admin/orders/${orderId}`,
          `/api/orders/${orderId}`,
          `/admin/orders/${orderId}`
        ];
        
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(`http://localhost:5000${endpoint}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log(`✅ Order details from ${endpoint}:`, data);
              
              // Analyze the structure
              if (data.order && data.order.items) {
                data.order.items.forEach((item, index) => {
                  console.log(`📦 Item ${index + 1}:`, item);
                  console.log(`   - Product: ${item.productName || item.name}`);
                  console.log(`   - Photos in referencePhotos:`, item.referencePhotos);
                  console.log(`   - Photos in other fields:`, {
                    photos: item.photos,
                    images: item.images,
                    attachments: item.attachments,
                    customData: item.customData,
                    allKeys: Object.keys(item)
                  });
                });
              }
              break;
            }
          } catch (error) {
            console.log(`❌ ${endpoint} failed:`, error.message);
          }
        }
      } catch (error) {
        console.error(`❌ Error inspecting order ${orderId}:`, error);
      }
    }
  };

  useEffect(() => {
    testAllEndpoints();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      left: '10px', 
      background: 'white', 
      border: '3px solid red', 
      padding: '20px',
      zIndex: 9999,
      width: '500px',
      maxHeight: '80vh',
      overflow: 'auto',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      <h2 style={{ color: 'red', margin: '0 0 15px 0' }}>🔍 ORDER DEBUG PANEL</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <button onClick={testAllEndpoints} disabled={loading} style={{ marginRight: '10px', padding: '8px 12px' }}>
          {loading ? 'Testing...' : 'Test All Endpoints'}
        </button>
        <button onClick={createTestOrderWithPhotos} style={{ marginRight: '10px', padding: '8px 12px', background: '#28a745', color: 'white' }}>
          Create Test Order + Photos
        </button>
        <button onClick={inspectExistingOrder} style={{ padding: '8px 12px', background: '#17a2b8', color: 'white' }}>
          Inspect Existing Orders
        </button>
      </div>

      <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px', marginBottom: '15px' }}>
        <strong>Current Token:</strong> {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}
      </div>

      {Object.keys(debugInfo).length > 0 && (
        <div>
          <h3>Debug Results:</h3>
          {Object.entries(debugInfo).map(([endpoint, result]) => (
            <div key={endpoint} style={{ 
              marginBottom: '10px', 
              padding: '10px', 
              background: result.success ? '#d4edda' : '#f8d7da',
              border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
              borderRadius: '4px'
            }}>
              <div style={{ fontWeight: 'bold' }}>
                {result.success ? '✅' : '❌'} {endpoint}
              </div>
              <div style={{ fontSize: '12px', marginTop: '5px' }}>
                Status: {result.status || 'N/A'} | 
                {result.success ? ` Orders: ${result.orderCount || 0}` : ` Error: ${result.error}`}
              </div>
              {result.success && result.data && (
                <details style={{ marginTop: '5px' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '12px' }}>View Data</summary>
                  <pre style={{ 
                    background: '#fff', 
                    padding: '10px', 
                    fontSize: '10px', 
                    overflow: 'auto',
                    maxHeight: '200px',
                    border: '1px solid #ddd',
                    marginTop: '5px'
                  }}>
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderDebugger;