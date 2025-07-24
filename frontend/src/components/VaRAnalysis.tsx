// components/VaRAnalysis.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Info, TrendingDown, Shield, HelpCircle, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchVaRAnalysis } from '../lib/api';

// Demo VaR data
const DEMO_VAR_DATA = {
  historical: { "90%": 0.0156, "95%": 0.0234, "99%": 0.0412 },
  parametric: { "90%": 0.0178, "95%": 0.0256, "99%": 0.0445 },
  returns_distribution: {
    mean: 0.0008,
    std: 0.0117,
    skew: -0.234,
    kurtosis: 3.456
  },
  time_series: Array.from({ length: 50 }, (_, i) => ({
    date: new Date(Date.now() - (50 - i) * 24 * 60 * 60 * 1000).toISOString(),
    var_95: 0.02 + Math.random() * 0.01
  }))
};

const VaRAnalysis = () => {
  const [selectedConfidence, setSelectedConfidence] = useState('95%');
  const [showEducation, setShowEducation] = useState(true);
  
  const { data: varData = DEMO_VAR_DATA, isLoading } = useQuery({
    queryKey: ['var-analysis'],
    queryFn: async () => {
      try {
        return await fetchVaRAnalysis();
      } catch {
        return DEMO_VAR_DATA;
      }
    },
    initialData: DEMO_VAR_DATA,
    retry: false,
  });

  const confidenceLevels = ['90%', '95%', '99%'];
  
  // Generate distribution data for visualization
  const distributionData = Array.from({ length: 100 }, (_, i) => {
    const x = -0.1 + (i * 0.002);
    const mean = varData?.returns_distribution?.mean || 0;
    const std = varData?.returns_distribution?.std || 0.02;
    const y = (1 / (std * Math.sqrt(2 * Math.PI))) * 
              Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
    return { 
      x: x * 100, 
      y, 
      fill: x < -(varData?.historical?.[selectedConfidence] || 0) ? '#ef4444' : '#3b82f6' 
    };
  });

  return (
    <div className="space-y-6">
      {/* Educational Banner */}
      {showEducation && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/20"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Understanding Value at Risk (VaR)</h3>
              </div>
              <p className="text-gray-300 mb-3">
                VaR answers the question: <span className="text-white font-medium">"What's the most I could lose on a really bad day?"</span>
              </p>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span><span className="text-white font-medium">95% VaR of 2.34%</span> means: On 95 out of 100 days, you won't lose more than 2.34%</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span><span className="text-white font-medium">Historical VaR</span>: Based on actual past returns (what really happened)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span><span className="text-white font-medium">Parametric VaR</span>: Based on statistical models (assumes normal distribution)</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowEducation(false)}
              className="text-gray-400 hover:text-white ml-4"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Value at Risk Analysis</h2>
          <button
            onClick={() => setShowEducation(!showEducation)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Toggle explanation"
          >
            <HelpCircle className="w-5 h-5 text-gray-400" />
          </button>
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
        
        <p className="text-sm text-gray-400 mt-3">
          {selectedConfidence === '90%' && "Least conservative - expects smaller losses"}
          {selectedConfidence === '95%' && "Standard risk level - balanced approach"}
          {selectedConfidence === '99%' && "Most conservative - prepares for larger losses"}
        </p>
      </motion.div>

      {/* VaR Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Historical VaR
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Based on actual historical returns
              </div>
            </div>
          </h3>
          <div className="space-y-3">
            {Object.entries(varData?.historical || {}).map(([confidence, value]) => (
              <div
                key={confidence}
                className={`p-4 rounded-lg transition-all ${
                  confidence === selectedConfidence
                    ? 'bg-blue-500/20 border border-blue-500/30 scale-105'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{confidence} Confidence</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-white">
                      {(value * 100).toFixed(2)}%
                    </span>
                    <p className="text-xs text-gray-400">
                      Max loss: ${(value * 1000000).toFixed(0).toLocaleString()}
                    </p>
                  </div>
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
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Based on statistical models
              </div>
            </div>
          </h3>
          <div className="space-y-3">
            {Object.entries(varData?.parametric || {}).map(([confidence, value]) => (
              <div
                key={confidence}
                className={`p-4 rounded-lg transition-all ${
                  confidence === selectedConfidence
                    ? 'bg-purple-500/20 border border-purple-500/30 scale-105'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{confidence} Confidence</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-white">
                      {(value * 100).toFixed(2)}%
                    </span>
                    <p className="text-xs text-gray-400">
                      Max loss: ${(value * 1000000).toFixed(0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Example Scenario */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border-yellow-500/20"
      >
        <h3 className="text-lg font-semibold text-white mb-3">💡 Real-World Example</h3>
        <p className="text-gray-300">
          If you have a <span className="text-white font-medium">$1,000,000 portfolio</span> and your{' '}
          <span className="text-white font-medium">{selectedConfidence} VaR is {(varData?.historical?.[selectedConfidence] * 100).toFixed(2)}%</span>:
        </p>
        <div className="mt-4 p-4 bg-white/5 rounded-lg">
          <p className="text-white text-lg">
            On a bad day, you could lose up to{' '}
            <span className="text-red-400 font-bold">
              ${(varData?.historical?.[selectedConfidence] * 1000000).toFixed(0).toLocaleString()}
            </span>
          </p>
          <p className="text-sm text-gray-400 mt-2">
            But there's only a {100 - parseInt(selectedConfidence)}% chance of losing more than this
          </p>
        </div>
      </motion.div>

      {/* Returns Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Returns Distribution</h3>
        <p className="text-sm text-gray-400 mb-4">
          The red area shows the "tail risk" - the worst-case scenarios that VaR measures
        </p>
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
                label={{ value: 'Daily Returns (%)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => value.toFixed(4)}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-gray-400 text-sm">Average Daily Return</p>
            <p className="text-lg font-semibold text-white">
              {((varData?.returns_distribution?.mean || 0) * 100).toFixed(3)}%
            </p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-gray-400 text-sm">Daily Volatility</p>
            <p className="text-lg font-semibold text-white">
              {((varData?.returns_distribution?.std || 0) * 100).toFixed(3)}%
            </p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-gray-400 text-sm">Skewness</p>
            <p className="text-lg font-semibold text-white">
              {varData?.returns_distribution?.skew?.toFixed(3) || 0}
            </p>
            <p className="text-xs text-gray-500">
              {(varData?.returns_distribution?.skew || 0) < 0 ? 'Left-tailed' : 'Right-tailed'}
            </p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-gray-400 text-sm">Kurtosis</p>
            <p className="text-lg font-semibold text-white">
              {varData?.returns_distribution?.kurtosis?.toFixed(3) || 0}
            </p>
            <p className="text-xs text-gray-500">
              {(varData?.returns_distribution?.kurtosis || 0) > 3 ? 'Fat tails' : 'Normal tails'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VaRAnalysis;