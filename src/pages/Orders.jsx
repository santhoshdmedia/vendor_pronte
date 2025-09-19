
import React, { useState, useEffect } from 'react';
import { Eye, X, Package, CreditCard } from 'lucide-react';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';
import { collectallorders, getOrderStats, updateOrderStatus } from '../Helper/apiHelper';

const Orders = () => {
  const [orderFilter, setOrderFilter] = useState('today');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");


  useEffect(() => {
    fetchOrders();
    // fetchOrderStats();
  }, [orderFilter]);

  const fetchOrders = async () => {
    try {
      // const params = { status: 'all', period: orderFilter };
      const searchData = {
        search,
        order_status: "vendor assigned",
      };
       const result = await collectallorders(JSON.stringify(searchData));
       console.log(result.data.data)
      setOrders(result.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  // const fetchOrderStats = async () => {
  //   try {
  //     const response = await getOrderStats(orderFilter);
  //     setOrderStats(response.data);
  //   } catch (error) {
  //     console.error('Error fetching order stats:', error);
  //     toast.error(error.response?.data?.message || 'Error fetching order statistics');
  //   }
  // };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, { status });
      toast.success('Order status updated successfully');
      fetchOrders(); // Refresh orders list
      // fetchOrderStats(); // Refresh stats
      setShowOrderModal(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Error updating order status');
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'text-orange-600 bg-orange-100',
      processing: 'text-blue-600 bg-blue-100',
      shipped: 'text-purple-600 bg-purple-100',
      delivered: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100',
      completed: 'text-green-600 bg-green-100'
    };
    return statusColors[status] || 'text-gray-600 bg-gray-100';
  };

  const getPaymentStatusColor = (status) => {
    const statusColors = {
      pending: 'text-orange-600 bg-orange-100',
      paid: 'text-green-600 bg-green-100',
      failed: 'text-red-600 bg-red-100',
      refunded: 'text-purple-600 bg-purple-100'
    };
    return statusColors[status] || 'text-gray-600 bg-gray-100';
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleCompleteOrder = () => {
    if (selectedOrder) {
      handleUpdateOrderStatus(selectedOrder._id, 'completed');
    }
  };

  const handleCancelOrder = () => {
    setShowOrderModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600">Manage and track all your orders</p>
      </div>

      {/* Order Statistics */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Order Statistics</h2>
          <select
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="today">Today</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-700 mb-1">Total Orders</h3>
            <p className="text-2xl font-bold text-blue-900">{orderStats.total}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-700 mb-1">Completed</h3>
            <p className="text-2xl font-bold text-green-900">{orderStats.completed}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-orange-700 mb-1">Pending</h3>
            <p className="text-2xl font-bold text-orange-900">{orderStats.pending}</p>
          </div>
        </div> */}
      </div>

      {/* Customer Orders Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Orders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Invoice No</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Order Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Design File</th>
                {/* <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th> */}
                <th className="text-left py-3 px-4 font-medium text-gray-700">View</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-primary-600">{order.invoice_no
}</td>
                  <td className="py-3 px-4 text-gray-700">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-gray-700">{order.cart_items.product_name}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    <img src={order.designFile} alt="design" className='size-[100px]'/>
                  </td>
                  {/* <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td> */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="btn-primary text-sm flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal isOpen={showOrderModal} onClose={() => setShowOrderModal(false)} title="Order Details">
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Order ID</h4>
                <p className="text-sm text-gray-900">{selectedOrder.orderId}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Invoice No</h4>
                <p className="text-sm text-gray-900">{selectedOrder.invoiceNo}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Customer</h4>
                <p className="text-sm text-gray-900">{selectedOrder.customer.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Payment Status</h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                  <CreditCard className="w-3 h-3 mr-1" />
                  {selectedOrder.paymentStatus}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Order Items</h4>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">${item.price}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-gray-900">${selectedOrder.total}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleCancelOrder}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={handleCompleteOrder}
                  className="btn-primary flex-1"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;