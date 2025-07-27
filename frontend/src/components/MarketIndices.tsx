// components/MarketIndices.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

// Generate realistic market data
const generateMarketData = (basePrice: number, volatility: number = 0.02) => {
  const data = [];
  let price = basePrice;
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add some realistic market movement
    const change = (Math.random() - 0.48) * volatility * price;
    price += change;
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: parseFloat(price.toFixed(2)),
      timestamp: date.getTime()
    });
  }
  
  return data;
};

const MarketIndices = () => {
  const [marketData, setMarketData] = useState({
    sp500: generateMarketData(4750, 0.015),
    nasdaq: generateMarketData(16850, 0.025),
    dow: generateMarketData(38500, 0.012)
  });

  const indices = [
    {
      name: 'S&P 500',
      symbol: 'SPX',
      data: marketData.sp500,
      color: '#3b82f6',
      gradientId: 'sp500Gradient',
      currentPrice: marketData.sp500[marketData.sp500.length - 1].value,
      previousClose: marketData.sp500[marketData.sp500.length - 2].value,
    },
    {
      name: 'NASDAQ',
      symbol: 'IXIC',
      data: marketData.nasdaq,
      color: '#8b5cf6',
      gradientId: 'nasdaqGradient',
      currentPrice: marketData.nasdaq[marketData.nasdaq.length - 1].value,
      previousClose: marketData.nasdaq[marketData.nasdaq.length - 2].value,
    },
    {
      name: 'Dow Jones',
      symbol: 'DJI',
      data: marketData.dow,
      color: '#10b981',
      gradientId: 'dowGradient',
      currentPrice: marketData.dow[marketData.dow.length - 1].value,
      previousClose: marketData.dow[marketData.dow.length - 2].value,
    }
  ];

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => ({
        sp500: updateLastPrice(prev.sp500, 0.001),
        nasdaq: updateLastPrice(prev.nasdaq, 0.0015),
        dow: updateLastPrice(prev.dow, 0.0008)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateLastPrice = (data: any[], volatility: number) => {
    const newData = [...data];
    const lastPrice = newData[newData.length - 1].value;
    const change = (Math.random() - 0.5) * volatility * lastPrice;
    
    newData[newData.length - 1] = {
      ...newData[newData.length - 1],
      value: parseFloat((lastPrice + change).toFixed(2))
    };
    
    return newData;
  };

  const calculateChange = (current: number, previous: number) => {
    const change = current - previous;
    const changePercent = (change / previous) * 100;
    return { change, changePercent };
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-white font-semibold">
            ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Market Summary Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Market Overview</h3>

        {/* Index Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {indices.map((index, i) => {
            const { change, changePercent } = calculateChange(
              index.currentPrice,
              index.previousClose
            );
            const isPositive = change >= 0;

            return (
              <motion.div
                key={index.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-semibold">{index.name}</h4>
                    <p className="text-gray-400 text-sm">{index.symbol}</p>
                  </div>
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-2xl font-bold text-white">
                    {index.currentPrice.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      isPositive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isPositive ? '+' : ''}{change.toFixed(2)}
                    </span>
                    <span className={`text-sm px-2 py-0.5 rounded ${
                      isPositive 
                        ? 'bg-green-400/20 text-green-400' 
                        : 'bg-red-400/20 text-red-400'
                    }`}>
                      {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Mini Chart */}
                <div className="h-16 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={index.data.slice(-10)}>
                      <defs>
                        <linearGradient id={index.gradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={index.color} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={index.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={index.color}
                        strokeWidth={2}
                        fill={`url(#${index.gradientId})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {indices.slice(0, 2).map((index, i) => (
          <motion.div
            key={index.symbol}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="glass-card p-6"
          >
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" style={{ color: index.color }} />
              {index.name} Performance
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={index.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                    domain={['dataMin - 50', 'dataMax + 50']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={index.color}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Market Sentiment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5"
      >
        <h4 className="text-lg font-semibold text-white mb-4">Market Sentiment</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <p className="text-gray-400 text-sm mb-2">VIX (Fear Index)</p>
            <p className="text-2xl font-bold text-white">14.82</p>
            <p className="text-sm text-green-400 mt-1">Low Volatility</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <p className="text-gray-400 text-sm mb-2">Market Breadth</p>
            <p className="text-2xl font-bold text-white">68%</p>
            <p className="text-sm text-blue-400 mt-1">Bullish</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <p className="text-gray-400 text-sm mb-2">Put/Call Ratio</p>
            <p className="text-2xl font-bold text-white">0.85</p>
            <p className="text-sm text-green-400 mt-1">Optimistic</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MarketIndices;