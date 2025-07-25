import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchRiskMetrics, fetchAllData, fetchVaRAnalysis, fetchCorrelationMatrix, fetchPortfolio } from '../lib/api';
import { useCallback } from 'react';

export const useRiskData = () => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['risk-metrics'],
    queryFn: async () => {
      const allData = queryClient.getQueryData(['all-data']) as any;
      if (allData?.risk_metrics) {
        return allData.risk_metrics;
      }
      return fetchRiskMetrics();
    },
    staleTime: 30000,
    cacheTime: 300000,
  });
};

export const usePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchTab = useCallback((tabId: string) => {
    switch (tabId) {
      case 'var':
        queryClient.prefetchQuery(['var-analysis'], fetchVaRAnalysis);
        break;
      case 'correlation':
        queryClient.prefetchQuery(['correlation-matrix'], fetchCorrelationMatrix);
        break;
      case 'portfolio':
        queryClient.prefetchQuery(['portfolio'], fetchPortfolio);
        break;
    }
  }, [queryClient]);

  return { prefetchTab };
};