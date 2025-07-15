import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Target, RefreshCw, AlertTriangle } from 'lucide-react';
import { useInventoryData, useForecastData } from '../hooks/useBackendData';

const Forecast: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState('PROD001');
  const [forecastDays, setForecastDays] = useState(7);
  
  const { data: products, loading: inventoryLoading } = useInventoryData();
  const { data: forecastData, loading: forecastLoading, error: forecastError, refetch } = useForecastData(selectedProduct, forecastDays);
  
  const currentProduct = products.find(p => p.productId === selectedProduct);
  const isLoading = inventoryLoading || forecastLoading;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Demand Forecasting</h1>
          <p className="text-gray-600 mt-2">AI-powered sales predictions to optimize inventory planning</p>
        </div>
        <button
          onClick={refetch}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600">
              {forecastData?.accuracy_metrics ? `${forecastData.accuracy_metrics.accuracy}%` : 'N/A'}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {forecastData?.accuracy_metrics?.accuracy || 'N/A'}%
          </div>
          <div className="text-sm text-gray-600">Forecast Accuracy</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600">{forecastDays} days</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{forecastDays}</div>
          <div className="text-sm text-gray-600">Forecast Horizon</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600">Real-time</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">Live</div>
          <div className="text-sm text-gray-600">Data Updates</div>
        </div>
      </motion.div>

      {/* Product Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Product Forecast</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="forecast-days" className="text-sm font-medium text-gray-700">
                Forecast Days:
              </label>
              <select
                id="forecast-days"
                value={forecastDays}
                onChange={(e) => setForecastDays(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={3}>3 days</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="product-select" className="text-sm font-medium text-gray-700">
                Select Product:
              </label>
              <select
                id="product-select"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {products.map(product => (
                  <option key={product.productId} value={product.productId}>
                    {product.productName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {currentProduct && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Current Stock</div>
                <div className="text-lg font-semibold text-gray-900">{currentProduct.stock}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Days Until Expiry</div>
                <div className="text-lg font-semibold text-gray-900">{currentProduct.daysUntilExpiry}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Current Price</div>
                <div className="text-lg font-semibold text-gray-900">${currentProduct.currentPrice.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <div className={`text-lg font-semibold capitalize ${
                  currentProduct.status === 'safe' ? 'text-green-600' :
                  currentProduct.status === 'expiring' ? 'text-yellow-600' :
                  currentProduct.status === 'overstock' ? 'text-blue-600' :
                  'text-red-600'
                }`}>
                  {currentProduct.status}
                </div>
              </div>
            </div>
          </div>
        )}

        {forecastError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="text-red-800 font-medium">Forecast Error</h3>
                <p className="text-red-700 text-sm mt-1">{forecastError}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600">Loading forecast data...</span>
          </div>
        ) : forecastData?.chart_data ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData.chart_data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="Actual Sales"
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  name="Predicted Sales"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-80 text-gray-500">
            No forecast data available
          </div>
        )}
      </motion.div>

      {/* Forecast Summary */}
      {forecastData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Forecast Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-900 mb-2">Total Predicted Demand</div>
              <div className="text-2xl font-bold text-blue-600">
                {forecastData.forecast.reduce((sum, f) => sum + f.predicted, 0).toFixed(0)} units
              </div>
              <div className="text-sm text-blue-700 mt-1">Next {forecastDays} days</div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="font-medium text-green-900 mb-2">Average Daily Demand</div>
              <div className="text-2xl font-bold text-green-600">
                {(forecastData.forecast.reduce((sum, f) => sum + f.predicted, 0) / forecastDays).toFixed(1)} units
              </div>
              <div className="text-sm text-green-700 mt-1">Per day average</div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="font-medium text-purple-900 mb-2">Confidence Range</div>
              <div className="text-2xl font-bold text-purple-600">
                ±{forecastData.forecast.length > 0 ? 
                  ((forecastData.forecast[0].confidence_upper - forecastData.forecast[0].confidence_lower) / 2).toFixed(0) : 
                  '0'} units
              </div>
              <div className="text-sm text-purple-700 mt-1">Prediction interval</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Insights</h2>
        <div className="space-y-4">
          {currentProduct && forecastData && (
            <>
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <div className="p-1 bg-blue-100 rounded-full mt-1">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-blue-900">Demand Analysis</div>
                  <div className="text-sm text-blue-700 mt-1">
                    {currentProduct.productName} shows predicted demand of {' '}
                    {forecastData.forecast.reduce((sum, f) => sum + f.predicted, 0).toFixed(0)} units 
                    over the next {forecastDays} days.
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                <div className="p-1 bg-green-100 rounded-full mt-1">
                  <Target className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-green-900">Stock Recommendation</div>
                  <div className="text-sm text-green-700 mt-1">
                    {currentProduct.stock > forecastData.forecast.reduce((sum, f) => sum + f.predicted, 0) * 1.2 
                      ? 'Current stock levels are sufficient. Consider markdown opportunities.'
                      : currentProduct.stock < forecastData.forecast.reduce((sum, f) => sum + f.predicted, 0) * 0.8
                      ? 'Stock levels may be insufficient. Consider restocking soon.'
                      : 'Stock levels are optimal for predicted demand.'
                    }
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
                <div className="p-1 bg-yellow-100 rounded-full mt-1">
                  <Calendar className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <div className="font-medium text-yellow-900">Expiry Alert</div>
                  <div className="text-sm text-yellow-700 mt-1">
                    {currentProduct.daysUntilExpiry <= 3 
                      ? `Product expires in ${currentProduct.daysUntilExpiry} days. Consider immediate markdown or donation.`
                      : `Product expires in ${currentProduct.daysUntilExpiry} days. Monitor closely for markdown opportunities.`
                    }
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Forecast;