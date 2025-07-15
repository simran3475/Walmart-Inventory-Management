import React from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, Leaf, Target } from 'lucide-react';
import { inventoryHealthData, wasteOverTimeData } from '../data/mockData';

const Analytics: React.FC = () => {
  const kpiData = [
    {
      title: 'Waste Reduction',
      value: '42%',
      change: '+8%',
      trend: 'up',
      icon: Leaf,
      description: 'vs last month'
    },
    {
      title: 'Revenue Recovery',
      value: '$15,420',
      change: '+18%',
      trend: 'up',
      icon: DollarSign,
      description: 'from markdowns'
    },
    {
      title: 'Inventory Turnover',
      value: '6.2x',
      change: '+12%',
      trend: 'up',
      icon: Package,
      description: 'annual rate'
    },
    {
      title: 'Forecast Accuracy',
      value: '94.2%',
      change: '+2%',
      trend: 'up',
      icon: Target,
      description: 'prediction rate'
    }
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights into your waste reduction performance</p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {kpiData.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <kpi.icon className="h-5 w-5 text-blue-600" />
              </div>
              <div className={`flex items-center space-x-1 text-sm font-medium ${
                kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpi.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{kpi.change}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</div>
            <div className="text-sm text-gray-600">{kpi.title}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.description}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Health Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Inventory Health Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryHealthData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inventoryHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {inventoryHealthData.map((item, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.fill }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                </div>
                <div className="text-lg font-bold" style={{ color: item.fill }}>
                  {item.value}%
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Waste Reduction Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Waste Reduction Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wasteOverTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`${value} lbs`, 'Food Waste']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="waste" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }}
                  name="Food Waste (lbs)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                68% reduction in food waste over 6 months
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Detailed Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Metrics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-blue-900">AI Prediction Accuracy</h3>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">94.2%</div>
            <div className="text-sm text-blue-700">↑ 2.1% from last month</div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-green-900">Markdown Success Rate</h3>
              <Target className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">87%</div>
            <div className="text-sm text-green-700">↑ 5% from last month</div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-purple-900">Donation Efficiency</h3>
              <Leaf className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-1">92%</div>
            <div className="text-sm text-purple-700">↑ 8% from last month</div>
          </div>
        </div>
      </motion.div>

      {/* Insights and Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Insights & Recommendations</h2>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
            <div className="p-1 bg-green-100 rounded-full mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-green-900">Excellent Progress</div>
              <div className="text-sm text-green-700 mt-1">
                Your waste reduction has improved by 42% this month. The AI forecasting system is performing exceptionally well.
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
            <div className="p-1 bg-blue-100 rounded-full mt-1">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-blue-900">Optimization Opportunity</div>
              <div className="text-sm text-blue-700 mt-1">
                Consider increasing markdown frequency for produce items. Data shows 30% better recovery rates with earlier markdowns.
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
            <div className="p-1 bg-purple-100 rounded-full mt-1">
              <Leaf className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="font-medium text-purple-900">Donation Partnership</div>
              <div className="text-sm text-purple-700 mt-1">
                Two new donation centers have opened nearby. This could increase your donation capacity by 25%.
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;