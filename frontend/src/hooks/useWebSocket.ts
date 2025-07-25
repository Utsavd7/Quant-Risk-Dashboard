// hooks/useWebSocket.ts - Optimized for instant updates
import { useEffect, useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface LiveData {
  prices: Record<string, number>;
  changes: Record<string, number>;
  timestamp: string;
}

export const useWebSocket = () => {
  const [data, setData] = useState<LiveData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    try {
      wsRef.current = new WebSocket('ws://localhost:8000/ws/live-data');
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'price_update') {
            setData(message.data);
            
            // Update React Query cache with live prices
            queryClient.setQueryData(['live-prices'], message.data);
          } else if (message.type === 'initial_data') {
            // Cache initial data
            if (message.data.risk_metrics) {
              queryClient.setQueryData(['risk-metrics'], message.data.risk_metrics);
            }
            if (message.data.portfolio) {
              queryClient.setQueryData(['portfolio'], message.data.portfolio);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onerror = () => {
        setIsConnected(false);
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      // Fallback to polling
      startPolling();
    }
  }, [queryClient]);

  const startPolling = useCallback(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/portfolio');
        const data = await response.json();
        
        // Extract price data
        const prices: Record<string, number> = {};
        const changes: Record<string, number> = {};
        
        Object.entries(data.portfolio).forEach(([ticker, info]: [string, any]) => {
          prices[ticker] = info.current_price;
          changes[ticker] = info.daily_change;
        });
        
        setData({
          prices,
          changes,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return data;
};