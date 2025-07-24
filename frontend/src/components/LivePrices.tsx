// components/LivePrices.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useQuery } from '@tanstack/react-query';
import { fetchPortfolio } from '../lib/api';

const LivePrices = () => {
  const liveData = useWebSocket();
  const { data: portfolio } = useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolio,
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

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Live Portfolio</h2>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400 animate-pulse" />
            <span className="text-green-400 font-medium">Real-Time</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-1">Total Value</p>
            <p className="text-3xl font-bold text-white">
              {formatPrice(portfolio?.total_value || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-1">Day Change</p>
            <p className={`text-3xl font-bold ${
              (liveData?.totalChange || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatChange(liveData?.totalChange || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-1">Positions</p>
            <p className="text-3xl font-bold text-white">
              {Object.keys(portfolio?.portfolio || {}).length}
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

            return (
              <motion.div
                key={ticker}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                className="glass-card p-6 relative overflow-hidden"
              >
                {/* Background Animation */}
                <motion.div
                  className={`absolute inset-0 ${
                    isPositive ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: liveData?.prices?.[ticker] ? 0.1 : 0 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{ticker}</h3>
                    {isPositive ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                  </div>

                  <div className="space-y-3">
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

                    <div className="flex justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Change</p>
                        <motion.p
                          key={liveChange}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`font-medium ${
                            isPositive ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {formatChange(liveChange)}
                        </motion.p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Value</p>
                        <p className="font-medium text-white">
                          {formatPrice(data.market_value)}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Weight</span>
                        <span className="text-white">
                          {(data.current_weight * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-400">Shares</span>
                        <span className="text-white">{data.shares}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pulse Effect for Updates */}
                {liveData?.prices?.[ticker] && (
                  <motion.div
                    className="absolute inset-0 border-2 border-purple-500 rounded-2xl"
                    initial={{ opacity: 0.5, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Risk Alerts */}
      {liveData?.alerts && liveData.alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Risk Alerts</h3>
          <div className="space-y-3">
            {liveData.alerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  alert.severity === 'high'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-yellow-500/10 border-yellow-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 ${
                    alert.severity === 'high' ? 'text-red-400' : 'text-yellow-400'
                  }`} />
                  <p className="text-white">{alert.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LivePrices;
