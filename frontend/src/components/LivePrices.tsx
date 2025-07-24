// components/LivePrices.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, HelpCircle, BookOpen, DollarSign, Percent } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useQuery } from '@tanstack/react-query';
import { fetchPortfolio } from '../lib/api';

// Demo portfolio data
const DEMO_PORTFOLIO = {
  portfolio: {
    "AAPL": { weight: 0.20, shares: 100, current_price: 182.45, market_value: 18245, daily_change: 1.23, current_weight: 0.195 },
    "MSFT": { weight: 0.15, shares: 50, current_price: 378.92, market_value: 18946, daily_change: -0.45, current_weight: 0.203 },
    "GOOGL": { weight: 0.15, shares: 30, current_price: 142.67, market_value: 4280.1, daily_change: 2.34, current_weight: 0.046 },
    "NVDA": { weight: 0.15, shares: 40, current_price: 487.23, market_value: 19489.2, daily_change: 3.45, current_weight: 0.209 },
    "TSLA": { weight: 0.10, shares: 25, current_price: 198.45, market_value: 4961.25, daily_change: -2.34, current_weight: 0.053 },
    "JPM": { weight: 0.10, shares: 60, current_price: 156.78, market_value: 9406.8, daily_change: 0.78, current_weight: 0.101 },
    "GS": { weight: 0.05, shares: 15, current_price: 342.56, market_value: 5138.4, daily_change: 1.23, current_weight: 0.055 },
    "BTC-USD": { weight: 0.05, shares: 0.5, current_price: 43567.89, market_value: 21783.95, daily_change: 5.67, current_weight: 0.233 },
    "ETH-USD": { weight: 0.05, shares: 2, current_price: 2345.67, market_value: 4691.34, daily_change: 4.32, current_weight: 0.050 }
  },
  total_value: 93342.99,
  timestamp: new Date().toISOString()
};

const LivePrices = () => {
  const [showEducation, setShowEducation] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const liveData = useWebSocket();
  
  const { data: portfolio = DEMO_PORTFOLIO } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      try {
        return await fetchPortfolio();
      } catch {
        return DEMO_PORTFOLIO;
      }
    },
    initialData: DEMO_PORTFOLIO,
    retry: false,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change: number) => {
    const formatted = change.toFixed(2);
    return change >= 0 ? `+${formatted}%` : `${formatted}%`;
  };

  // Calculate portfolio metrics
  const totalDayChange = Object.values(portfolio.portfolio).reduce((sum, asset) => 
    sum + (asset.market_value * asset.daily_change / 100), 0
  );
  const totalDayChangePercent = (totalDayChange / portfolio.total_value) * 100;

  return (
    <div className="space-y-6">
      {/* Educational Banner */}
      {showEducation && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl p-6 border border-green-500/20"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Understanding Live Prices</h3>
              </div>
              <p className="text-gray-300 mb-3">
                Monitor your portfolio in real-time: <span className="text-white font-medium">"How is my portfolio performing right now?"</span>
              </p>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span><span className="text-white font-medium">Price Updates:</span> See live market prices (simulated every 3 seconds)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span><span className="text-white font-medium">Weight vs Target:</span> Compare current weights to your target allocation</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span><span className="text-white font-medium">Daily Changes:</span> Track how much each position gained/lost today</span>
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Live Portfolio Monitor</h2>
        <button
          onClick={() => setShowEducation(!showEducation)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Toggle explanation"
        >
          <HelpCircle className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Portfolio Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Portfolio Summary</h3>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400 animate-pulse" />
            <span className="text-green-400 font-medium">Live Updates</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Value</p>
            <p className="text-3xl font-bold text-white">
              {formatPrice(portfolio?.total_value || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">All positions combined</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Day Change</p>
            <p className={`text-3xl font-bold ${
              totalDayChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatChange(totalDayChangePercent)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatPrice(Math.abs(totalDayChange))}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Positions</p>
            <p className="text-3xl font-bold text-white">
              {Object.keys(portfolio?.portfolio || {}).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Diversified assets</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Best Performer</p>
            <p className="text-xl font-bold text-green-400">
              {Object.entries(portfolio?.portfolio || {})
                .sort((a, b) => b[1].daily_change - a[1].daily_change)[0]?.[0]}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatChange(
                Object.entries(portfolio?.portfolio || {})
                  .sort((a, b) => b[1].daily_change - a[1].daily_change)[0]?.[1].daily_change
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Live Price Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {portfolio?.portfolio && Object.entries(portfolio.portfolio).map(([ticker, data]: [string, any]) => {
            const livePrice = liveData?.prices?.[ticker] || data.current_price;
            const liveChange = liveData?.changes?.[ticker] || data.daily_change;
            const isPositive = liveChange >= 0;
            const isSelected = selectedAsset === ticker;

            return (
              <motion.div
                key={ticker}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                className={`glass-card p-6 relative overflow-hidden cursor-pointer ${
                  isSelected ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedAsset(isSelected ? null : ticker)}
              >
                {/* Live Update Animation */}
                {liveData?.prices?.[ticker] && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 1 }}
                  />
                )}

                {/* Background Gradient */}
                <motion.div
                  className={`absolute inset-0 ${
                    isPositive ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.05 }}
                />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{ticker}</h3>
                      <p className="text-xs text-gray-400">
                        {ticker.includes('USD') ? 'Cryptocurrency' : 'Stock'}
                      </p>
                    </div>
                    {isPositive ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-gray-400 text-sm">Price</p>
                        <motion.p
                          key={livePrice}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-2xl font-semibold text-white"
                        >
                          {formatPrice(livePrice)}
                        </motion.p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">Change</p>
                        <motion.p
                          key={liveChange}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`text-xl font-medium ${
                            isPositive ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {formatChange(liveChange)}
                        </motion.p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-400">Shares</p>
                          <p className="text-white font-medium">{data.shares}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Value</p>
                          <p className="text-white font-medium">
                            {formatPrice(data.market_value)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Target</p>
                          <p className="text-white font-medium">
                            {(data.weight * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Current</p>
                          <p className={`font-medium ${
                            Math.abs(data.current_weight - data.weight) > 0.02
                              ? 'text-yellow-400'
                              : 'text-white'
                          }`}>
                            {(data.current_weight * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Rebalancing Indicator */}
                    {Math.abs(data.current_weight - data.weight) > 0.02 && (
                      <div className="pt-2">
                        <p className="text-xs text-yellow-400">
                          {data.current_weight > data.weight ? '⚠️ Overweight' : '⚠️ Underweight'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Educational Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5"
      >
        <h3 className="text-lg font-semibold text-white mb-3">💡 Portfolio Management Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg mt-0.5">
              <Percent className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Rebalancing</h4>
              <p className="text-gray-300">
                When actual weights drift from targets by more than 5%, consider rebalancing to maintain your risk profile.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg mt-0.5">
              <DollarSign className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Dollar-Cost Averaging</h4>
              <p className="text-gray-300">
                Regular investments help smooth out market volatility. Consider monthly contributions to reduce timing risk.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LivePrices;