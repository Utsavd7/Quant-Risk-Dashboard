// App.tsx - Optimized with data preloading
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import { Toaster } from 'react-hot-toast';
import { fetchAllData } from './lib/api';

// Configure React Query for aggressive caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // Data stays fresh for 30 seconds
      cacheTime: 300000, // Keep in cache for 5 minutes
      refetchInterval: 30000, // Refetch every 30 seconds
      refetchOnWindowFocus: false, // Don't refetch on focus
      retry: 1,
      retryDelay: 500,
    },
  },
});

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Preload all data on app start
    const preloadData = async () => {
      try {
        // Fetch all data in one request
        const allData = await fetchAllData();
        
        // Prime the cache with all data
        queryClient.setQueryData(['all-data'], allData);
        queryClient.setQueryData(['risk-metrics'], allData.risk_metrics);
        queryClient.setQueryData(['var-analysis'], allData.var_analysis);
        queryClient.setQueryData(['correlation-matrix'], allData.correlation_matrix);
        queryClient.setQueryData(['portfolio'], allData.portfolio);
        
        setIsReady(true);
      } catch (error) {
        console.error('Failed to preload data:', error);
        setIsReady(true); // Still show app with fallback data
      }
    };

    preloadData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
        {isReady ? (
          <Dashboard />
        ) : (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white text-lg">Initializing Dashboard...</p>
            </div>
          </div>
        )}
        <Toaster position="bottom-right" />
      </div>
    </QueryClientProvider>
  );
}

export default App;
