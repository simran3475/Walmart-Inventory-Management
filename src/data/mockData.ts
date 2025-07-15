import { Product, ForecastData, MarkdownProduct, DonationCenter, KPI } from '../types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Organic Bananas',
    category: 'Produce',
    stock: 45,
    expiryDate: '2025-01-17',
    predictedDemand: 32,
    currentPrice: 2.99,
    status: 'expiring',
    daysUntilExpiry: 2
  },
  {
    id: '2',
    name: 'Greek Yogurt 32oz',
    category: 'Dairy',
    stock: 28,
    expiryDate: '2025-01-19',
    predictedDemand: 25,
    currentPrice: 5.49,
    status: 'safe',
    daysUntilExpiry: 4
  },
  {
    id: '3',
    name: 'Rotisserie Chicken',
    category: 'Deli',
    stock: 12,
    expiryDate: '2025-01-16',
    predictedDemand: 8,
    currentPrice: 4.98,
    status: 'expiring',
    daysUntilExpiry: 1
  },
  {
    id: '4',
    name: 'Strawberries 1lb',
    category: 'Produce',
    stock: 67,
    expiryDate: '2025-01-18',
    predictedDemand: 23,
    currentPrice: 3.99,
    status: 'overstock',
    daysUntilExpiry: 3
  },
  {
    id: '5',
    name: 'Whole Milk Gallon',
    category: 'Dairy',
    stock: 89,
    expiryDate: '2025-01-22',
    predictedDemand: 78,
    currentPrice: 3.79,
    status: 'safe',
    daysUntilExpiry: 7
  },
  {
    id: '6',
    name: 'Caesar Salad Kit',
    category: 'Produce',
    stock: 34,
    expiryDate: '2025-01-20',
    predictedDemand: 28,
    currentPrice: 2.49,
    status: 'safe',
    daysUntilExpiry: 5
  }
];

export const mockForecastData: Record<string, ForecastData[]> = {
  '1': [
    { date: '2025-01-10', actual: 28, predicted: 30 },
    { date: '2025-01-11', actual: 35, predicted: 32 },
    { date: '2025-01-12', actual: 31, predicted: 29 },
    { date: '2025-01-13', actual: 42, predicted: 38 },
    { date: '2025-01-14', actual: 29, predicted: 31 },
    { date: '2025-01-15', actual: 33, predicted: 32 },
    { date: '2025-01-16', actual: null, predicted: 35 },
    { date: '2025-01-17', actual: null, predicted: 32 }
  ],
  '4': [
    { date: '2025-01-10', actual: 18, predicted: 20 },
    { date: '2025-01-11', actual: 22, predicted: 21 },
    { date: '2025-01-12', actual: 15, predicted: 17 },
    { date: '2025-01-13', actual: 25, predicted: 23 },
    { date: '2025-01-14', actual: 19, predicted: 20 },
    { date: '2025-01-15', actual: 21, predicted: 22 },
    { date: '2025-01-16', actual: null, predicted: 24 },
    { date: '2025-01-17', actual: null, predicted: 23 }
  ]
};

export const mockMarkdownProducts: MarkdownProduct[] = [
  {
    id: '1',
    name: 'Organic Bananas',
    currentPrice: 2.99,
    suggestedDiscount: 25,
    potentialSavings: 33.75,
    expiryDate: '2025-01-17'
  },
  {
    id: '3',
    name: 'Rotisserie Chicken',
    currentPrice: 4.98,
    suggestedDiscount: 40,
    potentialSavings: 23.92,
    expiryDate: '2025-01-16'
  },
  {
    id: '4',
    name: 'Strawberries 1lb',
    currentPrice: 3.99,
    suggestedDiscount: 30,
    potentialSavings: 79.80,
    expiryDate: '2025-01-18'
  }
];

export const mockDonationCenters: DonationCenter[] = [
  {
    id: '1',
    name: 'City Food Bank',
    address: '123 Community St, Downtown',
    distance: '0.8 miles',
    acceptedCategories: ['Produce', 'Dairy', 'Bakery'],
    contact: '(555) 123-4567'
  },
  {
    id: '2',
    name: 'Neighborhood Pantry',
    address: '456 Hope Ave, Midtown',
    distance: '1.2 miles',
    acceptedCategories: ['Produce', 'Deli', 'Packaged Goods'],
    contact: '(555) 987-6543'
  },
  {
    id: '3',
    name: 'Senior Center Kitchen',
    address: '789 Elder Way, Uptown',
    distance: '2.1 miles',
    acceptedCategories: ['Dairy', 'Produce', 'Frozen'],
    contact: '(555) 456-7890'
  }
];

export const mockKPIs: KPI[] = [
  {
    title: 'Waste Prevented',
    value: '2,847 lbs',
    change: '+12%',
    trend: 'up',
    icon: 'TrendingUp'
  },
  {
    title: 'Expiring Items',
    value: '23',
    change: '-8%',
    trend: 'down',
    icon: 'Clock'
  },
  {
    title: 'Markdown Efficiency',
    value: '87%',
    change: '+3%',
    trend: 'up',
    icon: 'Target'
  },
  {
    title: 'Money Saved',
    value: '$15,420',
    change: '+18%',
    trend: 'up',
    icon: 'DollarSign'
  }
];

export const wasteOverTimeData = [
  { month: 'Jul', waste: 450 },
  { month: 'Aug', waste: 380 },
  { month: 'Sep', waste: 320 },
  { month: 'Oct', waste: 280 },
  { month: 'Nov', waste: 220 },
  { month: 'Dec', waste: 180 },
  { month: 'Jan', waste: 140 }
];

export const inventoryHealthData = [
  { name: 'Safe', value: 68, fill: '#10B981' },
  { name: 'Overstock', value: 22, fill: '#F59E0B' },
  { name: 'Expiring', value: 10, fill: '#EF4444' }
];