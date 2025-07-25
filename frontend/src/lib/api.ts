// lib/api.ts - Optimized API client
import axios from 'axios';

const API_BASE = '/api';

// Create axios instance with optimizations
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for performance tracking
apiClient.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for performance tracking
apiClient.interceptors.response.use(
  (response) => {
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    console.log(`${response.config.url} took ${duration}ms`);
    return response;
  },
  (error) => Promise.reject(error)
);

// Fetch all data in one request
export const fetchAllData = async () => {
  const { data } = await apiClient.get('/all-data');
  return data;
};

export const fetchRiskMetrics = async () => {
  const { data } = await apiClient.get('/risk-metrics');
  return data;
};

export const fetchVaRAnalysis = async () => {
  const { data } = await apiClient.get('/var-analysis');
  return data;
};

export const fetchCorrelationMatrix = async () => {
  const { data } = await apiClient.get('/correlation-matrix');
  return data;
};

export const fetchPortfolio = async () => {
  const { data } = await apiClient.get('/portfolio');
  return data;
};

export const runStressTest = async (scenarios: any[]) => {
  const { data } = await apiClient.post('/stress-test', scenarios);
  return data;
};