import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Phone, CheckCircle, Clock, Truck } from 'lucide-react';
import { mockDonationCenters, mockProducts } from '../data/mockData';

const Redistribution: React.FC = () => {
  const [donatedItems, setDonatedItems] = useState<Set<string>>(new Set());

  const expiringProducts = mockProducts.filter(p => 
    p.status === 'expiring' || p.daysUntilExpiry <= 2
  );

  const handleDonate = (productId: string) => {
    setDonatedItems(prev => new Set([...prev, productId]));
  };

  const totalDonatedValue = expiringProducts
    .filter(p => donatedItems.has(p.id))
    .reduce((sum, p) => sum + (p.currentPrice * Math.floor(p.stock * 0.7)), 0);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Redistribution Center</h1>
          <p className="text-gray-600 mt-2">Coordinate donations and minimize waste through community partnerships</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Heart className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600">+12</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{mockDonationCenters.length}</div>
          <div className="text-sm text-gray-600">Partner Centers</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600">Ready</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{expiringProducts.length}</div>
          <div className="text-sm text-gray-600">Items Available</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600">Today</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{donatedItems.size}</div>
          <div className="text-sm text-gray-600">Items Donated</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-orange-600">Value</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">${totalDonatedValue.toFixed(0)}</div>
          <div className="text-sm text-gray-600">Donated Value</div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Items Available for Donation</h2>
          
          <div className="space-y-4">
            {expiringProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  donatedItems.has(product.id) 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <span className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    {product.daysUntilExpiry} days left
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3 text-sm text-gray-600">
                  <div>Stock: <span className="font-medium">{product.stock}</span></div>
                  <div>Category: <span className="font-medium">{product.category}</span></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Est. donation: <span className="font-medium">{Math.floor(product.stock * 0.7)} units</span>
                  </div>
                  
                  {donatedItems.has(product.id) ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Donated</span>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDonate(product.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mark as Donated
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Donation Centers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Partner Donation Centers</h2>
          
          <div className="space-y-4">
            {mockDonationCenters.map((center, index) => (
              <motion.div
                key={center.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{center.name}</h3>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>{center.address}</span>
                    </div>
                  </div>
                  <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {center.distance}
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="text-sm text-gray-600 mb-1">Accepts:</div>
                  <div className="flex flex-wrap gap-1">
                    {center.acceptedCategories.map(category => (
                      <span key={category} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{center.contact}</span>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Schedule Pickup
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Impact Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Community Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">2,847</div>
            <div className="text-sm text-gray-600">Pounds Donated This Month</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">1,245</div>
            <div className="text-sm text-gray-600">Families Fed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">$8,450</div>
            <div className="text-sm text-gray-600">Community Value Created</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Redistribution;