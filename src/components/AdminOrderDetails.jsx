import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';

const AdminOrderDetails = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.adminGetOrder(orderId);
      setOrder(response.data.order);
    } catch (err) {
      setError('Failed to load order details');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus, adminNotes = '') => {
    try {
      await orderAPI.adminUpdateOrderStatus(orderId, { 
        status: newStatus, 
        adminNotes 
      });
      fetchOrderDetails(); // Refresh order details
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading-spinner">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="error-message">{error}</div>
          <button onClick={onClose} className="close-btn">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content order-details-modal">
        <div className="modal-header">
          <h2>Order Details - {order.orderNumber}</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="order-details-content">
          <div className="order-info-grid">
            {/* Order Information */}
            <div className="order-info-section">
              <h3>Order Information</h3>
              <div className="info-row">
                <label>Order ID:</label>
                <span>{order.orderNumber}</span>
              </div>
              <div className="info-row">
                <label>Date:</label>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="info-row">
                <label>Status:</label>
                <select 
                  value={order.status} 
                  onChange={(e) => updateOrderStatus(e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="info-row">
                <label>Payment:</label>
                <span className={`payment-status ${order.paymentStatus}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="info-row">
                <label>Total:</label>
                <span className="total-amount">₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="customer-details-section">
              <h3>Customer Details</h3>
              <div className="info-row">
                <label>Name:</label>
                <span>{order.customer.name}</span>
              </div>
              <div className="info-row">
                <label>Email:</label>
                <span>{order.customer.email}</span>
              </div>
              <div className="info-row">
                <label>Phone:</label>
                <span>{order.customer.phone}</span>
              </div>
              <div className="info-row">
                <label>Address:</label>
                <span>{order.customer.address}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="order-items-section">
            <h3>Order Items</h3>
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-basic-info">
                  <div className="item-image">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.productName} />
                    ) : (
                      <div className="no-image">📦</div>
                    )}
                  </div>
                  <div className="item-details">
                    <h4>{item.productName}</h4>
                    <p>Quantity: {item.quantity} × ₹{item.price} = ₹{item.subtotal}</p>
                    {item.specialRequest && (
                      <div className="special-request">
                        <strong>Special Request:</strong>
                        <p>{item.specialRequest}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reference Photos Section - THIS IS THE KEY PART */}
                {item.referencePhotos && item.referencePhotos.length > 0 && (
                  <div className="reference-photos-section">
                    <h4>Reference Photos ({item.referencePhotos.length})</h4>
                    <div className="reference-photos-grid">
                      {item.referencePhotos.map((photo, photoIndex) => (
                        <div key={photoIndex} className="reference-photo">
                          <img 
                            src={photo.path} 
                            alt={`Reference ${photoIndex + 1}`}
                            onClick={() => window.open(photo.path, '_blank')}
                          />
                          <div className="photo-info">
                            <span className="photo-name">{photo.originalName}</span>
                            <span className="photo-size">{(photo.size / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Admin Notes */}
          <div className="admin-notes-section">
            <h3>Admin Notes</h3>
            <textarea 
              value={order.adminNotes || ''}
              onChange={(e) => setOrder({...order, adminNotes: e.target.value})}
              placeholder="Add admin notes..."
              rows="3"
            />
            <button 
              onClick={() => updateOrderStatus(order.status, order.adminNotes)}
              className="save-notes-btn"
            >
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;