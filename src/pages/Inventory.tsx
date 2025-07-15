import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useInventoryData } from '../hooks/useBackendData';

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expiryFilter, setExpiryFilter] = useState<number | undefined>(undefined);

  const { data: products, loading, error, refetch } = useInventoryData({
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    expiry_days: expiryFilter
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-100 text-green-800';
      case 'expiring': return 'bg-yellow-100 text-yellow-800';
      case 'overstock': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe': return <CheckCircle className="h-4 w-4" />;
      case 'expiring': return <Clock className="h-4 w-4" />;
      case 'overstock': return <AlertTriangle className="h-4 w-4" />;
      case 'expired': return <AlertTriangle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="text-red-800 font-medium">Backend Connection Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={refetch}
                className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Monitor stock levels and expiry dates across all products</p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="safe">Safe</option>
              <option value="expiring">Expiring</option>
              <option value="overstock">Overstock</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Categories</option>
              <option value="Produce">Produce</option>
              <option value="Dairy">Dairy</option>
              <option value="Deli">Deli</option>
              <option value="Bakery">Bakery</option>
              <option value="Seafood">Seafood</option>
            </select>
          </div>

          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={expiryFilter || ''}
              onChange={(e) => setExpiryFilter(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Expiry</option>
              <option value="1">Expires in 1 day</option>
              <option value="3">Expires in 3 days</option>
              <option value="7">Expires in 7 days</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">Loading inventory data...</span>
        </div>
      )}

      {/* Inventory table */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">Product Name</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">Category</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">Stock</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">Expiry Date</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">Price</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product.productId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{product.productName}</div>
                      <div className="text-sm text-gray-500">ID: {product.productId}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{product.category}</td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${
                        product.stock < 10 ? 'text-red-600' :
                        product.stock > 50 ? 'text-blue-600' :
                        'text-gray-900'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{new Date(product.expiryDate).toLocaleDateString()}</div>
                      <div className={`text-xs ${
                        product.daysUntilExpiry <= 1 ? 'text-red-600' :
                        product.daysUntilExpiry <= 3 ? 'text-yellow-600' :
                        'text-gray-500'
                      }`}>
                        {product.daysUntilExpiry} days left
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">${product.currentPrice.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {getStatusIcon(product.status)}
                        <span className="capitalize">{product.status}</span>
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Summary stats */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Total Items', value: filteredProducts.length, color: 'text-blue-600' },
            { label: 'Expiring Soon', value: filteredProducts.filter(p => p.status === 'expiring').length, color: 'text-yellow-600' },
            { label: 'Overstock', value: filteredProducts.filter(p => p.status === 'overstock').length, color: 'text-orange-600' },
            { label: 'Safe Stock', value: filteredProducts.filter(p => p.status === 'safe').length, color: 'text-green-600' }
          ].map((stat, index) => (
            <div key={stat.label} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Inventory;