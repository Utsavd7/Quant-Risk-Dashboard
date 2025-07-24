// hooks/useRiskData.ts
import { useQuery } from '@tanstack/react-query';
import { fetchRiskMetrics } from '../lib/api';

// Demo data for when backend is not available
const DEMO_DATA = {
  timestamp: new Date().toISOString(),
  metrics: {
    var_95_historical: 0.0234,
    var_99_historical: 0.0412,
    var_95_parametric: 0.0256,
    var_99_parametric: 0.0445,
    volatility_annual: 0.1856,
    sharpe_ratio: 1.24,
    max_drawdown: -0.0821,
    returns_stats: {
      daily_mean: 0.0008,
      daily_std: 0.0117,
      annual_return: 0.2016,
      skewness: -0.234,
      kurtosis: 3.456
    }
  },
  portfolio: {
    "AAPL": { weight: 0.20, shares: 100 },
    "MSFT": { weight: 0.15, shares: 50 },
    "GOOGL": { weight: 0.15, shares: 30 },
    "NVDA": { weight: 0.15, shares: 40 },
    "TSLA": { weight: 0.10, shares: 25 },
    "JPM": { weight: 0.10, shares: 60 },
    "GS": { weight: 0.05, shares: 15 },
    "BTC-USD": { weight: 0.05, shares: 0.5 },
    "ETH-USD": { weight: 0.05, shares: 2 }
  }
};

export const useRiskData = () => {
  return useQuery({
    queryKey: ['risk-metrics'],
    queryFn: fetchRiskMetrics,
    refetchInterval: 60000, // Refetch every minute
    retry: 2,
    retryDelay: 1000,
    // Provide demo data as fallback
    placeholderData: DEMO_DATA,
    // Handle errors gracefully
    onError: (error) => {
      console.warn('Failed to fetch risk metrics, using demo data:', error);
    },
  });
};

// hooks/useWebSocket.ts
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface LiveData {
  prices: Record<string, number>;
  changes: Record<string, number>;
  timestamp: string;
  alerts?: Array<{
    ticker: string;
    type: string;
    message: string;
    severity: string;
  }>;
  totalChange?: number;
}

// Demo live data
const DEMO_LIVE_DATA: LiveData = {
  prices: {
    "AAPL": 182.45,
    "MSFT": 378.92,
    "GOOGL": 142.67,
    "NVDA": 487.23,
    "TSLA": 198.45,
    "JPM": 156.78,
    "GS": 342.56,
    "BTC-USD": 43567.89,
    "ETH-USD": 2345.67
  },
  changes: {
    "AAPL": 1.23,
    "MSFT": -0.45,
    "GOOGL": 2.34,
    "NVDA": 3.45,
    "TSLA": -2.34,
    "JPM": 0.78,
    "GS": 1.23,
    "BTC-USD": 5.67,
    "ETH-USD": 4.32
  },
  timestamp: new Date().toISOString(),
  totalChange: 1.85
};

export const useWebSocket = () => {
  const [data, setData] = useState<LiveData | null>(DEMO_LIVE_DATA);
  const [isConnected, setIsConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket('ws://localhost:8000/ws/live-data');

        ws.onopen = () => {
          setIsConnected(true);
          setRetryCount(0);
          console.log('WebSocket connected');
          // Don't show success toast on initial connection to reduce noise
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'live_update') {
              setData(message.data);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.warn('WebSocket error:', error);
        };

        ws.onclose = () => {
          setIsConnected(false);
          
          // Only show disconnect message after successful connection
          if (retryCount === 0) {
            console.log('WebSocket disconnected, using demo data');
          }
          
          // Exponential backoff for reconnection
          const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 30000);
          setRetryCount(prev => prev + 1);
          
          // Only retry a few times to avoid spamming
          if (retryCount < 3) {
            reconnectTimeout = setTimeout(connect, backoffTime);
          }
        };
      } catch (error) {
        console.warn('WebSocket connection failed, using demo data');
        // Use demo data with simulated updates
        const interval = setInterval(() => {
          setData(prev => {
            if (!prev) return DEMO_LIVE_DATA;
            
            // Simulate price changes
            const newPrices = { ...prev.prices };
            const newChanges = { ...prev.changes };
            
            Object.keys(newPrices).forEach(ticker => {
              const randomChange = (Math.random() - 0.5) * 2;
              newPrices[ticker] = newPrices[ticker] * (1 + randomChange / 100);
              newChanges[ticker] = newChanges[ticker] + randomChange;
            });
            
            return {
              ...prev,
              prices: newPrices,
              changes: newChanges,
              timestamp: new Date().toISOString()
            };
          });
        }, 5000);
        
        return () => clearInterval(interval);
      }
    };

    // Initial connection attempt
    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return data;
};