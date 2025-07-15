import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, DollarSign, TrendingDown, Calculator, RefreshCw, AlertTriangle } from 'lucide-react';
import { useInventoryData, useMarkdownData } from '../hooks/useBackendData';

const Markdown: React.FC = () => {
  const [customDiscounts, setCustomDiscounts] = useState<Record<string, number>>({});
  
  const { data: products, loading: inventoryLoading } = useInventoryData({ expiry_days: 5 });
  const expiringProductIds = products.filter(p => p.daysUntilExpiry <= 5).map(p => p.productId);
  const { data: markdownData, loading: markdownLoading, error, refetch, fetchSingleMarkdown } = useMarkdownData(expiringProductIds);
  
  const isLoading = inventoryLoading || markdownLoading;

  const updateCustomDiscount = (productId: string, discount: number) => {
    setCustomDiscounts(prev => ({ ...prev, [productId]: discount }));
  };

  const calculateCustomImpact = (product: any, markdownSuggestion: any, customDiscount: number) => {
    const discountedPrice = product.currentPrice * (1 - customDiscount / 100);
    const originalProjectedSales = markdownSuggestion.projected_units_sold;
    
    // Estimate how custom discount affects sales (simple elasticity model)
    const discountRatio = customDiscount / markdownSuggestion.optimal_discount;
    const adjustedSales = originalProjectedSales * Math.min(discountRatio * 1.2, 2); // Cap at 2x
    
    const potentialRevenue = Math.min(adjustedSales, product.stock) * discountedPrice;
    const wasteReduction = Math.min(adjustedSales, product.stock);
    
    return {
      discountedPrice,
      potentialRevenue,
      wasteReduction,
      adjustedSales: Math.min(adjustedSales, product.stock)
    };
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
          <h1 className="text-3xl font-bold text-gray-900">Markdown Optimization</h1>
          <p className="text-gray-600 mt-2">AI-powered pricing strategies to maximize revenue recovery</p>
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

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Tag className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-orange-600">
              {isLoading ? '...' : `+${markdownData.length}`}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {isLoading ? <RefreshCw className="h-6 w-6 animate-spin text-gray-400" /> : markdownData.length}
          </div>
          <div className="text-sm text-gray-600">Eligible Items</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600">Potential</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {isLoading ? (
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            ) : (
              `$${markdownData.reduce((sum, item) => sum + item.potential_savings, 0).toFixed(0)}`
            )}
          </div>
          <div className="text-sm text-gray-600">Potential Savings</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingDown className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600">Avg</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {isLoading ? (
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            ) : markdownData.length > 0 ? (
              `${Math.round(markdownData.reduce((sum, item) => sum + item.optimal_discount, 0) / markdownData.length)}%`
            ) : (
              '0%'
            )}
          </div>
          <div className="text-sm text-gray-600">Avg Discount</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calculator className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600">AI</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {isLoading ? (
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            ) : markdownData.length > 0 ? (
              `${Math.round(markdownData.reduce((sum, item) => sum + item.confidence_score, 0) / markdownData.length * 100)}%`
            ) : (
              '0%'
            )}
          </div>
          <div className="text-sm text-gray-600">Confidence</div>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">Loading markdown suggestions...</span>
        </div>
      )}

      {/* Markdown Products */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold text-gray-900">AI-Powered Markdown Suggestions</h2>
          
          {markdownData.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No markdown opportunities</h3>
              <p className="text-gray-600">All products are currently in good condition or not approaching expiry.</p>
            </div>
          ) : (
            markdownData.map((suggestion, index) => {
              const product = products.find(p => p.productId === suggestion.product_id);
              if (!product) return null;

              const currentDiscount = customDiscounts[suggestion.product_id] ?? suggestion.optimal_discount;
              const customImpact = calculateCustomImpact(product, suggestion, currentDiscount);
              
              return (
                <motion.div
                  key={suggestion.product_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{product.productName}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded-full">
                            Expires: {new Date(product.expiryDate).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            {Math.round(suggestion.confidence_score * 100)}% confidence
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-600">Current Price</div>
                          <div className="text-lg font-semibold text-gray-900">${product.currentPrice.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Discounted Price</div>
                          <div className="text-lg font-semibold text-green-600">${customImpact.discountedPrice.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Current Stock</div>
                          <div className="text-lg font-semibold text-gray-900">{product.stock}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">AI Suggested Discount</div>
                          <div className="text-lg font-semibold text-blue-600">{suggestion.optimal_discount}%</div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">
                            Discount Percentage
                          </label>
                          <span className="text-sm text-blue-600">
                            Current: {currentDiscount}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="70"
                          value={currentDiscount}
                          onChange={(e) => updateCustomDiscount(suggestion.product_id, parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>10%</span>
                          <span className="font-medium text-blue-600">{currentDiscount}%</span>
                          <span>70%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Impact Preview</h4>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">New Price:</span>
                          <span className="text-sm font-medium text-gray-900">${customImpact.discountedPrice.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Discount Amount:</span>
                          <span className="text-sm font-medium text-red-600">
                            -${(product.currentPrice - customImpact.discountedPrice).toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Projected Units Sold:</span>
                          <span className="text-sm font-medium text-blue-600">{customImpact.adjustedSales.toFixed(0)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Potential Revenue:</span>
                          <span className="text-sm font-medium text-green-600">${customImpact.potentialRevenue.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Waste Reduction:</span>
                          <span className="text-sm font-medium text-purple-600">{customImpact.wasteReduction.toFixed(0)} units</span>
                        </div>
                        
                        <div className="flex justify-between border-t border-gray-200 pt-2">
                          <span className="text-sm font-medium text-gray-900">Estimated Savings:</span>
                          <span className="text-sm font-bold text-blue-600">
                            ${(customImpact.wasteReduction * product.currentPrice).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Apply {currentDiscount}% Markdown
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}

      {/* AI Strategy Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Markdown Strategy</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="font-medium text-blue-900 mb-2">Timing Optimization</div>
            <div className="text-sm text-blue-700">
              AI analyzes historical data to recommend optimal markdown timing based on product category and expiry patterns.
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="font-medium text-green-900 mb-2">Price Elasticity</div>
            <div className="text-sm text-green-700">
              Machine learning models estimate demand response to price changes for each product category.
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="font-medium text-purple-900 mb-2">Revenue Optimization</div>
            <div className="text-sm text-purple-700">
              AI balances revenue recovery with waste reduction to find the optimal discount percentage.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Markdown;