export interface User {
  id: string;
  email: string;
  role: 'Store Manager' | 'Analyst';
  name: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  expiryDate: string;
  predictedDemand: number;
  currentPrice: number;
  status: 'safe' | 'overstock' | 'expiring' | 'expired';
  daysUntilExpiry: number;
}

export interface ForecastData {
  date: string;
  actual: number;
  predicted: number;
}

export interface MarkdownProduct {
  id: string;
  name: string;
  currentPrice: number;
  suggestedDiscount: number;
  potentialSavings: number;
  expiryDate: string;
}

export interface DonationCenter {
  id: string;
  name: string;
  address: string;
  distance: string;
  acceptedCategories: string[];
  contact: string;
}

export interface KPI {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}