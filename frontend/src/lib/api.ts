import axios from 'axios';

const API_BASE = '/api';

export const fetchRiskMetrics = async () => {
  const { data } = await axios.get(`${API_BASE}/risk-metrics`);
  return data;
};

export const fetchVaRAnalysis = async () => {
  const { data } = await axios.get(`${API_BASE}/var-analysis`);
  return data;
};

export const fetchCorrelationMatrix = async () => {
  const { data } = await axios.get(`${API_BASE}/correlation-matrix`);
  return data;
};

export const fetchPortfolio = async () => {
  const { data } = await axios.get(`${API_BASE}/portfolio`);
  return data;
};

export const runStressTest = async (scenarios: any[]) => {
  const { data } = await axios.post(`${API_BASE}/stress-test`, scenarios);
  return data;
};