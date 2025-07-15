import { useState, useEffect } from 'react';
import { apiService, type InventoryItem, type ForecastResponse, type MarkdownSuggestion, type AnalyticsSummary } from '../services/api';

export const useInventoryData = (filters?: { category?: string; expiry_days?: number }) => {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getInventory(filters);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch inventory data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters?.category, filters?.expiry_days]);

  return { data, loading, error, refetch: fetchData };
};

export const useForecastData = (productId: string | null, days: number = 7) => {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getForecast(productId, days);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch forecast data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [productId, days]);

  return { data, loading, error, refetch: fetchData };
};

export const useMarkdownData = (productIds?: string[]) => {
  const [data, setData] = useState<MarkdownSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getBatchMarkdown(productIds);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch markdown data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleMarkdown = async (productId: string) => {
    try {
      const response = await apiService.getMarkdownSuggestion(productId);
      if (response.success && response.data) {
        setData(prev => {
          const filtered = prev.filter(item => item.product_id !== productId);
          return [...filtered, response.data!];
        });
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch markdown suggestion');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  useEffect(() => {
    if (productIds && productIds.length > 0) {
      fetchData();
    }
  }, [productIds?.join(',')]);

  return { data, loading, error, refetch: fetchData, fetchSingleMarkdown };
};

export const useAnalyticsData = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAnalyticsSummary();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch analytics data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

export const useBackendHealth = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const response = await apiService.healthCheck();
      setIsHealthy(response.success);
    } catch (err) {
      setIsHealthy(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return { isHealthy, loading, checkHealth };
};