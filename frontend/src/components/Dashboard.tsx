// components/Dashboard.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, TrendingUp, AlertTriangle, BarChart3, Grid3x3, Zap, X, ChevronRight, Info, BookOpen, Rocket } from 'lucide-react';
import VaRAnalysis from './VaRAnalysis';
import StressTest from './StressTest';
import CorrelationMatrix from './CorrelationMatrix';
import LivePrices from './LivePrices';
import { useRiskData } from '../hooks/useRiskData';
import { useWebSocket } from '../hooks/useWebSocket';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const { data: riskMetrics, isLoading, error } = useRiskData();
  const liveData = useWebSocket();

  // Check if this is first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedDashboard');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('hasVisitedDashboard', 'true');
    } else {
      setShowWelcome(false);
    }
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, description: 'Key risk metrics at a glance' },
    { id: 'var', label: 'VaR Analysis', icon: Activity, description: 'Value at Risk calculations' },
    { id: 'stress', label: 'Stress Testing', icon: AlertTriangle, description: 'Test extreme scenarios' },
    { id: 'correlation', label: 'Correlations', icon: Grid3x3, description: 'Asset correlation matrix' },
    { id: 'live', label: 'Live Prices', icon: Zap, description: 'Real-time market data' },
  ];

  // Demo data for better UX
  const demoMetrics = {
    var_95_historical: 0.0234,
    volatility_annual: 0.1856,
    sharpe_ratio: 1.24,
    max_drawdown: -0.0821
  };

  const displayMetrics = riskMetrics?.metrics || demoMetrics;

  return (
    <div className="min-h-screen p-6">
      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowWelcome(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-2xl w-full border border-purple-500/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="inline-flex p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4"
                >
                  <Rocket className="w-12 h-12 text-white" />
                </motion.div>
                <h1 className="text-4xl font-bold text-white mb-2">Welcome to Risk Analytics</h1>
                <p className="text-gray-300 text-lg">Your professional portfolio risk management dashboard</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg mt-1">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Real-time Risk Metrics</h3>
                    <p className="text-gray-400 text-sm">Monitor VaR, volatility, Sharpe ratio, and drawdowns</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg mt-1">
                    <AlertTriangle className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Stress Testing</h3>
                    <p className="text-gray-400 text-sm">Simulate market crashes and extreme scenarios</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg mt-1">
                    <Zap className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Live Market Data</h3>
                    <p className="text-gray-400 text-sm">WebSocket connection for real-time price updates</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowWelcome(false);
                    setShowGuide(true);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  Start Tutorial
                </button>
                <button
                  onClick={() => setShowWelcome(false)}
                  className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all"
                >
                  Explore Dashboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guided Tour */}
      {showGuide && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-400" />
              <p className="text-white">
                <span className="font-semibold">Quick Tour:</span> Click on different tabs to explore risk metrics. Start with Overview for key metrics.
              </p>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Quantitative Risk Metrics Dashboard
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
            <button
              onClick={() => setShowWelcome(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Show welcome screen"
            >
              <Info className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Tab Navigation with Descriptions */}
      <div className="mb-8">
        <div className="flex gap-2 mb-2 overflow-x-auto">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap
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
        <p className="text-sm text-gray-400 ml-2">
          {tabs.find(t => t.id === activeTab)?.description}
        </p>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Quick Start Guide */}
            {!error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl border border-purple-500/20"
              >
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-purple-400" />
                  Getting Started
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-500/20 rounded-full text-purple-400 font-semibold">1</div>
                    <p className="text-gray-300 text-sm">View key risk metrics below</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-500/20 rounded-full text-purple-400 font-semibold">2</div>
                    <p className="text-gray-300 text-sm">Click VaR Analysis for detailed risk</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-500/20 rounded-full text-purple-400 font-semibold">3</div>
                    <p className="text-gray-300 text-sm">Try Stress Testing scenarios</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Portfolio VaR (95%)"
                value={displayMetrics.var_95_historical || 0}
                format="percentage"
                icon={<Activity className="w-5 h-5" />}
                trend={-2.3}
                color="blue"
                tooltip="Maximum expected loss at 95% confidence level"
              />
              <MetricCard
                title="Volatility"
                value={displayMetrics.volatility_annual || 0}
                format="percentage"
                icon={<TrendingUp className="w-5 h-5" />}
                trend={5.1}
                color="purple"
                tooltip="Annualized portfolio volatility"
              />
              <MetricCard
                title="Sharpe Ratio"
                value={displayMetrics.sharpe_ratio || 0}
                format="number"
                icon={<BarChart3 className="w-5 h-5" />}
                trend={0.2}
                color="green"
                tooltip="Risk-adjusted return metric"
              />
              <MetricCard
                title="Max Drawdown"
                value={displayMetrics.max_drawdown || 0}
                format="percentage"
                icon={<AlertTriangle className="w-5 h-5" />}
                trend={-1.5}
                color="red"
                tooltip="Largest peak-to-trough decline"
              />
            </div>

            {/* Educational Note */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-3">Understanding Your Risk Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                <div>
                  <span className="font-semibold text-blue-400">VaR (Value at Risk):</span> Shows the maximum amount you might lose in a day with 95% confidence
                </div>
                <div>
                  <span className="font-semibold text-purple-400">Volatility:</span> Measures how much your portfolio value fluctuates
                </div>
                <div>
                  <span className="font-semibold text-green-400">Sharpe Ratio:</span> Higher is better - shows return per unit of risk
                </div>
                <div>
                  <span className="font-semibold text-red-400">Max Drawdown:</span> The worst loss from peak to bottom
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'var' && <VaRAnalysis />}
        {activeTab === 'stress' && <StressTest />}
        {activeTab === 'correlation' && <CorrelationMatrix />}
        {activeTab === 'live' && <LivePrices />}
      </AnimatePresence>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Using Demo Data</h3>
              <p className="text-gray-300 text-sm mt-1">
                Unable to connect to backend. Displaying sample data for demonstration purposes.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: number;
  format: 'percentage' | 'number' | 'currency';
  icon: React.ReactNode;
  trend?: number;
  color: 'blue' | 'purple' | 'green' | 'red';
  tooltip?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  format,
  icon,
  trend,
  color,
  tooltip,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

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
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-10"
          >
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradients[color]} opacity-10`}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-r ${gradients[color]} bg-opacity-20`}>
            {icon}
          </div>
          {trend && (
            <span
              className={`text-sm font-medium ${
                trend > 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white">{formatValue()}</p>
      </div>

      {/* Animated Border */}
      <motion.div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${gradients[color]}`}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.2 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default Dashboard;