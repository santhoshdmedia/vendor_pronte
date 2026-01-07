import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, CheckCircle, XCircle, Edit, Trash2, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import { getProducts, updateProductStatus } from '../Helper/apiHelper';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const id = localStorage.getItem("user");
  
  
  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      // Transform the data to match component expectations
      const transformedProducts = response.data.data.map(product => ({
        _id: product._id,
        name: product.name,
        category: product.category_details?.name || 'Uncategorized',
        // Use appropriate price based on your business logic
        sellerPrice: product.Deler_product_price || product.customer_product_price || product.MRP_price || 0,
        quantity: product.stock_count || 0,
        vendorDetails: product.vendor_details,
        // Map stocks_status to status (active/inactive/draft)
        status: mapStockStatusToStatus(product.stocks_status, product.is_visible),
        images: Array.isArray(product.images) ? product.images.map(img => 
          typeof img === 'string' ? img : (img.url || img.path)
        ) : [],
        // Keep original data for reference if needed
        originalData: product
      }));
      const filteredtransformedProducts=transformedProducts.filter((res) => {
        return res.originalData.product_type=="vendor Product";
      });
      
      console.log(transformedProducts);
      console.log(id);
        
      
      setProducts(filteredtransformedProducts);
      setFilteredProducts(filteredtransformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error.message);
      toast.error(error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to map stocks_status to status
  const mapStockStatusToStatus = (stocksStatus, isVisible) => {
    if (!isVisible) return 'draft';
    
    switch(stocksStatus?.toLowerCase()) {
      case 'in stock':
      case 'available':
        return 'active';
      case 'out of stock':
      case 'unavailable':
        return 'inactive';
      case 'limited':
        return 'active'; // or 'limited' if you want a separate status
      default:
        return 'draft';
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleProductStatus = async (id) => {
    try {
      const response = await updateProductStatus(id);
      const updatedProduct = response.data.product;
      
      setProducts(products.map(product => 
        product._id === id 
          ? { 
              ...product, 
              status: mapStockStatusToStatus(updatedProduct.stocks_status, updatedProduct.is_visible)
            }
          : product
      ));
      
      toast.success(`Product ${updatedProduct.is_visible ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating product status:', error.message);
      toast.error(error.message || 'Failed to update product status');
    }
  };

  // Apply filter when statusFilter or products change
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.status === statusFilter));
    }
  }, [statusFilter, products]);

  const inventorySummary = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    inactive: products.filter(p => p.status === 'inactive').length,
    draft: products.filter(p => p.status === 'draft').length
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return CheckCircle;
      case 'inactive': return XCircle;
      case 'draft': return Package;
      default: return Package;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage your products and inventory</p>
        </div>
        <Link
          to="/inventory/add-product"
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Product
        </Link>
      </div>

      {/* Inventory Summary */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-700">All Products</p>
                <p className="text-2xl font-bold text-blue-900">{inventorySummary.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-700">Active Products</p>
                <p className="text-2xl font-bold text-green-900">{inventorySummary.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-700">Inactive Products</p>
                <p className="text-2xl font-bold text-red-900">{inventorySummary.inactive}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-700">Draft Products</p>
                <p className="text-2xl font-bold text-yellow-900">{inventorySummary.draft}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Items */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Inventory Items</h3>
          
          {/* Filter Dropdown */}
          <div className="relative">
            <div className="flex items-center space-x-2">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-gray-500">
              {statusFilter === 'all' 
                ? "Get started by adding your first product." 
                : `No ${statusFilter} products found.`}
            </p>
            <div className="mt-6">
              <Link
                to="/inventory/add-product"
                className="btn-primary inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">S.no</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Product code</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Unit Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product,index) => {
                  const StatusIcon = getStatusIcon(product.status);
                  return (
                    <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{index+1}</td>
                      <td className="py-3 px-4">{product.originalData.product_code}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {product.images && product.images.length > 0 && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-md mr-3"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-10 h-10 bg-gray-200 rounded-md mr-3 flex items-center justify-center ${product.images && product.images.length > 0 && product.images[0] ? 'hidden' : 'flex'}`}>
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                          <span className="font-medium text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">₹{product.sellerPrice}</td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-medium ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.quantity}
                        </span>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/inventory/edit-product/${product._id}`}
                            className="text-primary-600 hover:text-primary-700 p-1"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => toggleProductStatus(product._id)}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                              product.status === 'active'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                            disabled={product.status === 'draft'}
                          >
                            {product.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
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

export default Inventory;