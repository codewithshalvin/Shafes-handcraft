import React, { useState } from 'react';

const OrderDataDebugger = ({ orderId }) => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      
      // Try multiple possible endpoints
      const endpoints = [
        `/api/admin/orders/${orderId}`,
        `/api/orders/${orderId}`,
        `/admin/orders/${orderId}`,
        `/orders/${orderId}`
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
            console.log(`✅ SUCCESS with ${endpoint}:`, data);
            setOrderData({ endpoint, data });
            break;
          } else {
            console.log(`❌ Failed ${endpoint}:`, response.status);
          }
        } catch (err) {
          console.log(`❌ Error ${endpoint}:`, err.message);
        }
      }
    } catch (error) {
      console.error('Debug error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid red', 
      padding: '1rem',
      zIndex: 9999,
      maxWidth: '400px',
      maxHeight: '600px',
      overflow: 'auto'
    }}>
      <h3>Order Data Debugger</h3>
      <button onClick={fetchOrderData} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Order Data'}
      </button>
      
      {orderData && (
        <div>
          <h4>Successful Endpoint: {orderData.endpoint}</h4>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '10px', 
            fontSize: '12px', 
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(orderData.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default OrderDataDebugger;