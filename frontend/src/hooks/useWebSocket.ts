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

export const useWebSocket = () => {
  const [data, setData] = useState<LiveData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/live-data');

    ws.onopen = () => {
      setIsConnected(true);
      toast.success('Connected to live data feed');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'live_update') {
        setData(message.data);
      }
    };

    ws.onerror = () => {
      toast.error('WebSocket connection error');
    };

    ws.onclose = () => {
      setIsConnected(false);
      toast.error('Disconnected from live data feed');
    };

    return () => {
      ws.close();
    };
  }, []);

  return data;
};
