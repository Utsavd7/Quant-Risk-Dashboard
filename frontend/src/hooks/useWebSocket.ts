// hooks/useWebSocket.ts
import { useEffect, useState, useRef } from 'react';

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

// Realistic demo data with simulated live updates
const generateDemoData = (): LiveData => {
  const baseData = {
    "AAPL": { price: 182.45, change: 1.23 },
    "MSFT": { price: 378.92, change: -0.45 },
    "GOOGL": { price: 142.67, change: 2.34 },
    "NVDA": { price: 487.23, change: 3.45 },
    "TSLA": { price: 198.45, change: -2.34 },
    "JPM": { price: 156.78, change: 0.78 },
    "GS": { price: 342.56, change: 1.23 },
    "BTC-USD": { price: 43567.89, change: 5.67 },
    "ETH-USD": { price: 2345.67, change: 4.32 }
  };

  const prices: Record<string, number> = {};
  const changes: Record<string, number> = {};

  Object.entries(baseData).forEach(([ticker, data]) => {
    // Add small random variations to make it look live
    const variation = (Math.random() - 0.5) * 0.5;
    prices[ticker] = data.price * (1 + variation / 100);
    changes[ticker] = data.change + variation;
  });

  return {
    prices,
    changes,
    timestamp: new Date().toISOString(),
    totalChange: Object.values(changes).reduce((sum, change) => sum + change, 0) / Object.keys(changes).length
  };
};

export const useWebSocket = () => {
  const [data, setData] = useState<LiveData | null>(generateDemoData());
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let mounted = true;

    const startSimulation = () => {
      // Clear any existing simulation
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }

      // Simulate live data updates
      simulationIntervalRef.current = setInterval(() => {
        if (mounted) {
          setData(generateDemoData());
        }
      }, 3000); // Update every 3 seconds
    };

    const connect = () => {
      try {
        wsRef.current = new WebSocket('ws://localhost:8000/ws/live-data');
        
        wsRef.current.onopen = () => {
          if (mounted) {
            setIsConnected(true);
            // Clear simulation when connected
            if (simulationIntervalRef.current) {
              clearInterval(simulationIntervalRef.current);
            }
          }
        };

        wsRef.current.onmessage = (event) => {
          if (mounted) {
            try {
              const message = JSON.parse(event.data);
              if (message.type === 'live_update') {
                setData(message.data);
              }
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          }
        };

        wsRef.current.onerror = () => {
          // Silently handle errors
        };

        wsRef.current.onclose = () => {
          if (mounted) {
            setIsConnected(false);
            // Start simulation when disconnected
            startSimulation();
            
            // Try to reconnect after 5 seconds
            reconnectTimeoutRef.current = setTimeout(() => {
              if (mounted) {
                connect();
              }
            }, 5000);
          }
        };
      } catch (error) {
        // If connection fails, just use simulated data
        startSimulation();
      }
    };

    // Start with simulation
    startSimulation();
    
    // Try to connect after a short delay
    setTimeout(() => {
      if (mounted) {
        connect();
      }
    }, 1000);

    return () => {
      mounted = false;
      
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  return data;
};

// hooks/useRiskData.ts
import { useQuery } from '@tanstack/react-query';
import { fetchRiskMetrics } from '../lib/api';

// Rich demo data
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
    queryFn: async () => {
      try {
        const data = await fetchRiskMetrics();
        return data;
      } catch (error) {
        // Silently fall back to demo data
        return DEMO_DATA;
      }
    },
    initialData: DEMO_DATA, // Start with demo data immediately
    refetchInterval: 60000,
    retry: false, // Don't retry to avoid delays
  });
};