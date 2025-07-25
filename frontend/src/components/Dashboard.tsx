// components/Dashboard.tsx - Optimized with lazy loading
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, TrendingUp, AlertTriangle, BarChart3, Grid3x3, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllData } from '../lib/api';
import { useWebSocket } from '../hooks/useWebSocket';

// Lazy load heavy components
const VaRAnalysis = lazy(() => import('./VaRAnalysis'));
const StressTest = lazy(() => import('./StressTest'));
const CorrelationMatrix = lazy(() => import('./CorrelationMatrix'));
const LivePrices = lazy(() => import('./LivePrices'));

// Loading component for lazy loaded tabs
const TabLoader = () => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-400">Loading component...</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showWelcome, setShowWelcome] = useState(false);
  
  // Fetch all data at once
  const { data: allData } = useQuery({
    queryKey: ['all-data'],
    queryFn: fetchAllData,
    staleTime: 30000,
  });
  
  const liveData = useWebSocket();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'var', label: 'VaR Analysis', icon: Activity },
    { id: 'stress', label: 'Stress Testing', icon: AlertTriangle },
    { id: 'correlation', label: 'Correlations', icon: Grid3x3 },
    { id: 'live', label: 'Live Prices', icon: Zap },
  ];

  // Preload components when hovering over tabs
  const preloadComponent = (tabId: string) => {
    switch (tabId) {
      case 'var':
        import('./VaRAnalysis');
        break;
      case 'stress':
        import('./StressTest');
        break;
      case 'correlation':
        import('./CorrelationMatrix');
        break;
      case 'live':
        import('./LivePrices');
        break;
    }
  };

  const displayMetrics = allData?.risk_metrics?.metrics || {
    var_95_historical: 0.0234,
    volatility_annual: 0.1856,
    sharpe_ratio: 1.24,
    max_drawdown: -0.0821
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Quantum Risk Analytics
            </h1>
            <p className="text-gray-400 mt-2">Real-time portfolio risk management</p>
          </div>
          <div className="flex items-center gap-3">
            {liveData && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full border border-green-500/30"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-green-400 text-sm font-medium">LIVE</span>
              </motion.div>
            )}
            <div className="text-right">
              <p className="text-sm text-gray-400">Last Update</p>
              <p className="text-gray-200">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
            onMouseEnter={() => preloadComponent(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
              ${activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Content with instant switching */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <MetricCard
                title="Portfolio VaR (95%)"
                value={displayMetrics.var_95_historical || 0}
                format="percentage"
                icon={<Activity className="w-5 h-5" />}
                trend={-2.3}
                color="blue"
              />
              <MetricCard
                title="Volatility"
                value={displayMetrics.volatility_annual || 0}
                format="percentage"
                icon={<TrendingUp className="w-5 h-5" />}
                trend={5.1}
                color="purple"
              />
              <MetricCard
                title="Sharpe Ratio"
                value={displayMetrics.sharpe_ratio || 0}
                format="number"
                icon={<BarChart3 className="w-5 h-5" />}
                trend={0.2}
                color="green"
              />
              <MetricCard
                title="Max Drawdown"
                value={displayMetrics.max_drawdown || 0}
                format="percentage"
                icon={<AlertTriangle className="w-5 h-5" />}
                trend={-1.5}
                color="red"
              />
            </motion.div>
          )}

          {activeTab === 'var' && (
            <motion.div
              key="var"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Suspense fallback={<TabLoader />}>
                <VaRAnalysis />
              </Suspense>
            </motion.div>
          )}

          {activeTab === 'stress' && (
            <motion.div
              key="stress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Suspense fallback={<TabLoader />}>
                <StressTest />
              </Suspense>
            </motion.div>
          )}

          {activeTab === 'correlation' && (
            <motion.div
              key="correlation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Suspense fallback={<TabLoader />}>
                <CorrelationMatrix />
              </Suspense>
            </motion.div>
          )}

          {activeTab === 'live' && (
            <motion.div
              key="live"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Suspense fallback={<TabLoader />}>
                <LivePrices />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Optimized MetricCard with memo
const MetricCard = React.memo(({ title, value, format, icon, trend, color }) => {
  const formatValue = () => {
    switch (format) {
      case 'percentage':
        return `${(Math.abs(value) * 100).toFixed(2)}%`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      default:
        return value.toFixed(2);
    }
  };

  const gradients = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    red: 'from-red-500 to-orange-500',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradients[color]} opacity-10`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-r ${gradients[color]} bg-opacity-20`}>
            {icon}
          </div>
          {trend && (
            <span className={`text-sm font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white">{formatValue()}</p>
      </div>
    </motion.div>
  );
});

export default Dashboard;