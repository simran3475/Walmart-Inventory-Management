import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  TrendingUp, 
  Tag, 
  Heart, 
  BarChart3,
  ArrowRight,
  Clock,
  DollarSign,
  Target
} from 'lucide-react';
import { mockKPIs } from '../data/mockData';

const navigationCards = [
  {
    title: 'Inventory Management',
    description: 'Monitor stock levels and expiry dates',
    href: '/inventory',
    icon: Package,
    color: 'bg-blue-500',
    stats: '156 items tracked'
  },
  {
    title: 'Demand Forecasting',
    description: 'AI-powered sales predictions',
    href: '/forecast',
    icon: TrendingUp,
    color: 'bg-green-500',
    stats: '94% accuracy rate'
  },
  {
    title: 'Markdown Optimization',
    description: 'Smart pricing for maximum recovery',
    href: '/markdown',
    icon: Tag,
    color: 'bg-orange-500',
    stats: '23 items eligible'
  },
  {
    title: 'Redistribution',
    description: 'Coordinate donations efficiently',
    href: '/redistribution',
    icon: Heart,
    color: 'bg-red-500',
    stats: '3 partners nearby'
  }
];

const getIcon = (iconName: string) => {
  const icons = {
    TrendingUp,
    Clock,
    Target,
    DollarSign
  };
  return icons[iconName as keyof typeof icons] || TrendingUp;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Monitor your inventory performance and take action</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/analytics')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <BarChart3 className="h-4 w-4" />
          <span>View Analytics</span>
        </motion.button>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {mockKPIs.map((kpi, index) => {
          const IconComponent = getIcon(kpi.icon);
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <IconComponent className="h-5 w-5 text-blue-600" />
                </div>
                <span className={`text-sm font-medium ${
                  kpi.trend === 'up' ? 'text-green-600' : 
                  kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {kpi.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</div>
              <div className="text-sm text-gray-600">{kpi.title}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Navigation Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {navigationCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(card.href)}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 ${card.color} rounded-lg`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-gray-600 mb-4">{card.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{card.stats}</span>
                <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                  Explore →
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: 'Markdown applied', item: 'Organic Bananas', time: '2 minutes ago', status: 'success' },
            { action: 'Donation scheduled', item: 'Rotisserie Chicken', time: '15 minutes ago', status: 'info' },
            { action: 'Stock alert', item: 'Strawberries 1lb', time: '1 hour ago', status: 'warning' },
            { action: 'Forecast updated', item: 'Greek Yogurt 32oz', time: '2 hours ago', status: 'success' }
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}></div>
                <div>
                  <span className="font-medium text-gray-900">{activity.action}</span>
                  <span className="text-gray-600"> for {activity.item}</span>
                </div>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;