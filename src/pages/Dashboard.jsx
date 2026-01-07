
import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  ShoppingCart, 
  Package, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { getProducts, getOrders, getOrderStats, getDashboardData } from '../Helper/apiHelper';

const Dashboard = () => {
  const [salesFilter, setSalesFilter] = useState('weekly');
  const [salesData, setSalesData] = useState({});
  const [orderStats, setOrderStats] = useState({});
  const [productStats, setProductStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from backend API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productResponse = await getProducts();
        const productData = productResponse.data;
        
        const totalProducts = productData.products?.length || 0;
        const activeProducts = productData.products?.filter(p => p.status === 'active').length || 0;
        const inactiveProducts = totalProducts - activeProducts;

        setProductStats({
          total: totalProducts,
          active: activeProducts,
          inactive: inactiveProducts
        });
        
        // Fetch order stats
        const orderStatsResponse = await getOrderStats(salesFilter);
        setOrderStats(orderStatsResponse.data);
        
        // Fetch recent orders
        const ordersResponse = await getOrders({ limit: 5, sort: '-createdAt' });
        setRecentOrders(ordersResponse.data.orders || []);
        
        // Fetch dashboard data
        const dashboardResponse = await getDashboardData();
        setSalesData(dashboardResponse.data.sales || {});
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [salesFilter]);

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

  const getStatusIcon = (status) => {
    const statusIcons = {
      pending: Clock,
      processing: Clock,
      shipped: Clock,
      delivered: CheckCircle,
      cancelled: AlertCircle,
      completed: CheckCircle
    };
    return statusIcons[status] || Clock;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your business overview.</p>
      </div>

      {/* Sales Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Sales Overview</h2>
          <select
            value={salesFilter}
            onChange={(e) => setSalesFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="today">Today</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8" />
              <div className="ml-4">
                <p className="text-primary-100">Total Sales</p>
                <p className="text-3xl font-bold">{orderStats.total || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <IndianRupee className="h-8 w-8" />
              <div className="ml-4">
                <p className="text-green-100">Total Amount</p>
                <p className="text-3xl font-bold">₹{salesData.totalAmount?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Orders Stats */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <ShoppingCart className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-gray-700">All Orders</span>
              </div>
              <span className="font-semibold text-blue-600">{orderStats.total || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-orange-600 mr-3" />
                <span className="text-gray-700">Pending</span>
              </div>
              <span className="font-semibold text-orange-600">{orderStats.pending || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-gray-700">Completed</span>
              </div>
              <span className="font-semibold text-green-600">{orderStats.completed || 0}</span>
            </div>
          </div>
        </div>

        {/* Products Stats */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Products</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-gray-700">Total Products</span>
              </div>
              <span className="font-semibold text-purple-600">{productStats.total || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-gray-700">Active Products</span>
              </div>
              <span className="font-semibold text-green-600">{productStats.active || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                <span className="text-gray-700">Inactive Products</span>
              </div>
              <span className="font-semibold text-red-600">{productStats.inactive || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recent orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date & Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const StatusIcon = getStatusIcon(order.status);
                  return (
                    <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-primary-600">#{order.invoiceNo || order._id.slice(-6)}</td>
                      <td className="py-3 px-4 text-gray-700">{order.customer?.name || 'Unknown Customer'}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">₹{order.total || 0}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                        <div>{new Date(order.createdAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;