import { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Info, TrendingDown, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchVaRAnalysis } from '../lib/api';

const VaRAnalysis = () => {
  const [selectedConfidence, setSelectedConfidence] = useState('95%');
  const { data: varData, isLoading } = useQuery({
    queryKey: ['var-analysis'],
    queryFn: fetchVaRAnalysis,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  const confidenceLevels = ['90%', '95%', '99%'];
  
  // Generate distribution data for visualization
  const distributionData = Array.from({ length: 100 }, (_, i) => {
    const x = -0.1 + (i * 0.002);
    const mean = varData?.returns_distribution?.mean || 0;
    const std = varData?.returns_distribution?.std || 0.02;
    const y = (1 / (std * Math.sqrt(2 * Math.PI))) * 
              Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
    return { x: x * 100, y, fill: x < -varData?.historical?.[selectedConfidence] ? '#ef4444' : '#3b82f6' };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Value at Risk Analysis</h2>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Maximum expected loss at confidence level</span>
          </div>
        </div>

        {/* Confidence Level Selector */}
        <div className="flex gap-2">
          {confidenceLevels.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedConfidence(level)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedConfidence === level
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {level} Confidence
            </button>
          ))}
        </div>
      </motion.div>

      {/* VaR Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Historical VaR
          </h3>
          <div className="space-y-3">
            {Object.entries(varData?.historical || {}).map(([confidence, value]) => (
              <div
                key={confidence}
                className={`p-4 rounded-lg ${
                  confidence === selectedConfidence
                    ? 'bg-blue-500/20 border border-blue-500/30'
                    : 'bg-white/5'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{confidence} Confidence</span>
                  <span className="text-xl font-bold text-white">
                    {(value * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-purple-400" />
            Parametric VaR
          </h3>
          <div className="space-y-3">
            {Object.entries(varData?.parametric || {}).map(([confidence, value]) => (
              <div
                key={confidence}
                className={`p-4 rounded-lg ${
                  confidence === selectedConfidence
                    ? 'bg-purple-500/20 border border-purple-500/30'
                    : 'bg-white/5'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{confidence} Confidence</span>
                  <span className="text-xl font-bold text-white">
                    {(value * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Returns Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Returns Distribution</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={distributionData}>
              <defs>
                <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="x" 
                stroke="#9ca3af"
                label={{ value: 'Returns (%)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="y"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorDist)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Mean Return</p>
            <p className="text-lg font-semibold text-white">
              {((varData?.returns_distribution?.mean || 0) * 100).toFixed(3)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Volatility</p>
            <p className="text-lg font-semibold text-white">
              {((varData?.returns_distribution?.std || 0) * 100).toFixed(3)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Skewness</p>
            <p className="text-lg font-semibold text-white">
              {varData?.returns_distribution?.skew?.toFixed(3) || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Kurtosis</p>
            <p className="text-lg font-semibold text-white">
              {varData?.returns_distribution?.kurtosis?.toFixed(3) || 0}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Time Series */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Rolling VaR (95%)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={varData?.time_series || []}>
              <defs>
                <linearGradient id="colorVar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis 
                stroke="#9ca3af"
                tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value) => `${(value * 100).toFixed(2)}%`}
              />
              <Area
                type="monotone"
                dataKey="var_95"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorVar)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default VaRAnalysis;