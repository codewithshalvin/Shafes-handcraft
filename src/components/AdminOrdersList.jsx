import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import AdminOrderDetails from './AdminOrderDetails';

const AdminOrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.adminGetOrders(filters);
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      processing: '#8b5cf6',
      shipped: '#06b6d4',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return <div className="loading-spinner">Loading orders...</div>;
  }

  return (
    <div className="admin-orders-container">
      <div className="orders-header">
        <h1>Orders Management</h1>
        <div className="orders-filters">
          <input
            type="text"
            placeholder="Search orders..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="orders-grid">
        {orders.length === 0 ? (
          <div className="empty-orders">
            <h3>No orders found</h3>
            <p>No orders match your current filters.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <span className="order-number">{order.orderNumber}</span>
                <span 
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status}
                </span>
              </div>

              <div className="order-customer">
                <strong>{order.customer.name}</strong>
                <span>{order.customer.email}</span>
              </div>

              <div className="order-items-preview">
                {order.items.map((item, index) => (
                  <div key={index} className="item-preview">
                    <span>{item.productName}</span>
                    <span>×{item.quantity}</span>
                    {/* Show reference photos indicator */}
                    {item.referencePhotos && item.referencePhotos.length > 0 && (
                      <span className="reference-indicator">
                        📸 {item.referencePhotos.length} photos
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <span className="order-total">₹{order.totalAmount}</span>
                <span className="order-date">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
                <button 
                  className="view-details-btn"
                  onClick={() => setSelectedOrderId(order._id)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrderId && (
        <AdminOrderDetails
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
};

export default AdminOrdersList;