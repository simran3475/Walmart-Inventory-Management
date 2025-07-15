const API_BASE_URL = 'http://localhost:5000';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface InventoryItem {
  productId: string;
  productName: string;
  category: string;
  stock: number;
  expiryDate: string;
  currentPrice: number;
  status: 'safe' | 'overstock' | 'expiring' | 'expired';
  daysUntilExpiry: number;
}

export interface ForecastData {
  date: string;
  predicted: number;
  confidence_lower: number;
  confidence_upper: number;
}

export interface ForecastResponse {
  product_id: string;
  forecast: ForecastData[];
  chart_data: Array<{
    date: string;
    actual: number | null;
    predicted: number | null;
    confidence_lower?: number;
    confidence_upper?: number;
  }>;
  accuracy_metrics?: {
    mae: number;
    mape: number;
    accuracy: number;
  };
  forecast_horizon_days: number;
}

export interface MarkdownSuggestion {
  product_id: string;
  optimal_discount: number;
  projected_units_sold: number;
  estimated_waste_reduction: number;
  revenue_impact: number;
  confidence_score: number;
  discounted_price: number;
  potential_savings: number;
}

export interface AnalyticsSummary {
  inventory_overview: {
    total_items: number;
    total_value: number;
    expiring_items: number;
    overstock_items: number;
    safe_items: number;
  };
  waste_prevention: {
    potential_waste_value: number;
    markdown_candidates: number;
    estimated_savings_opportunity: number;
  };
  categories: Record<string, {
    count: number;
    value: number;
    expiring: number;
  }>;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; version: string }>> {
    return this.request('/health');
  }

  // Inventory endpoints
  async getInventory(filters?: {
    category?: string;
    expiry_days?: number;
  }): Promise<ApiResponse<InventoryItem[]>> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.expiry_days !== undefined) params.append('expiry_days', filters.expiry_days.toString());
    
    const queryString = params.toString();
    return this.request(`/inventory${queryString ? `?${queryString}` : ''}`);
  }

  // Forecast endpoints
  async getForecast(productId: string, days: number = 7): Promise<ApiResponse<ForecastResponse>> {
    return this.request(`/forecast/${productId}?days=${days}`);
  }

  // Markdown endpoints
  async getMarkdownSuggestion(productId: string): Promise<ApiResponse<MarkdownSuggestion>> {
    return this.request(`/markdown/${productId}`);
  }

  async saveMarkdownSuggestion(productId: string): Promise<ApiResponse<MarkdownSuggestion>> {
    return this.request(`/markdown/${productId}`, {
      method: 'POST',
    });
  }

  async getBatchMarkdown(productIds?: string[]): Promise<ApiResponse<MarkdownSuggestion[]>> {
    return this.request('/markdown/batch', {
      method: 'POST',
      body: JSON.stringify({ product_ids: productIds }),
    });
  }

  // Analytics endpoints
  async getAnalyticsSummary(): Promise<ApiResponse<AnalyticsSummary>> {
    return this.request('/analytics/summary');
  }

  // Sales history
  async getSalesHistory(productId: string, days: number = 30): Promise<ApiResponse<{
    product_id: string;
    sales_history: Array<{
      date: string;
      units_sold: number;
      price: number;
    }>;
    total_units: number;
    average_daily_sales: number;
    days_covered: number;
  }>> {
    return this.request(`/products/${productId}/sales-history?days=${days}`);
  }
}

export const apiService = new ApiService();