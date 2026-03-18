import React, { useState, useEffect } from 'react';

const SimpleOrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders...');
      
      const response = await fetch('http://localhost:5000/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Orders fetched:', data);
        setOrders(data.orders || []);
      } else {
        console.error('Failed to fetch orders:', response.status);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const createTestOrder = async () => {
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
        product: '507f1f77bcf86cd799439011',
        productName: 'Birthday Frame',
        quantity: 1,
        price: 250,
        subtotal: 250,
        specialRequest: 'Please make it colorful with lots of details'
      }
    ]));
    
    formData.append('totalAmount', '250');
    
    // Add some mock reference photos (you can add real photos later)
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      console.log('Test order created:', result);
      alert('Test order created! Check the orders list.');
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error creating test order:', error);
      alert('Error creating order. Check console for details.');
    }
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', margin: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Orders with Reference Photos</h2>
        <div>
          <button onClick={fetchOrders} style={{ marginRight: '10px', padding: '8px 16px' }}>
            Refresh Orders
          </button>
          <button onClick={createTestOrder} style={{ padding: '8px 16px', background: '#007bff', color: 'white' }}>
            Create Test Order
          </button>
        </div>
      </div>
      
      {loading ? (
        <div>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No orders found.</p>
          <p>Click "Create Test Order" to test the system.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {orders.map((order) => (
            <div key={order._id} style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <strong>{order.orderNumber}</strong>
                <span style={{ 
                  padding: '4px 8px', 
                  background: order.status === 'confirmed' ? '#28a745' : '#ffc107', 
                  color: 'white', 
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {order.status}
                </span>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <strong>Customer:</strong> {order.customer?.name} ({order.customer?.email})
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <strong>Total:</strong> ₹{order.totalAmount}
              </div>
              
              <h4>Order Items:</h4>
              {order.items?.map((item, index) => (
                <div key={index} style={{ 
                  border: '1px solid #eee', 
                  padding: '15px', 
                  borderRadius: '6px', 
                  marginBottom: '10px',
                  background: '#f9f9f9'
                }}>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>{item.productName}</strong> - Qty: {item.quantity} × ₹{item.price} = ₹{item.subtotal}
                  </div>
                  
                  {item.specialRequest && (
                    <div style={{ marginBottom: '10px', fontStyle: 'italic', color: '#666' }}>
                      Special Request: {item.specialRequest}
                    </div>
                  )}
                  
                  {/* REFERENCE PHOTOS DISPLAY - THIS IS THE KEY PART! */}
                  {item.referencePhotos && item.referencePhotos.length > 0 ? (
                    <div>
                      <strong style={{ color: '#007bff' }}>
                        📸 Reference Photos ({item.referencePhotos.length}):
                      </strong>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
                        gap: '10px', 
                        marginTop: '10px' 
                      }}>
                        {item.referencePhotos.map((photo, photoIndex) => (
                          <div key={photoIndex} style={{ 
                            border: '2px solid #007bff', 
                            borderRadius: '6px', 
                            overflow: 'hidden',
                            background: 'white'
                          }}>
                            <img 
                              src={photo.path} 
                              alt={`Reference ${photoIndex + 1}`}
                              style={{ 
                                width: '100%', 
                                height: '100px', 
                                objectFit: 'cover',
                                cursor: 'pointer'
                              }}
                              onClick={() => window.open(photo.path, '_blank')}
                            />
                            <div style={{ padding: '5px', fontSize: '11px', textAlign: 'center' }}>
                              <div style={{ fontWeight: 'bold' }}>{photo.originalName}</div>
                              <div style={{ color: '#666' }}>{(photo.size / 1024).toFixed(1)} KB</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#999', fontStyle: 'italic' }}>
                      No reference photos uploaded
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleOrdersView;