// components/DemoData.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Copy, Check, ChevronRight, ChevronDown, Database, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllData } from '../lib/api';
import toast from 'react-hot-toast';

const DemoData = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    portfolio: false,
    riskMetrics: false,
    varAnalysis: false,
    correlations: false,
    stressTest: false
  });
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const { data: allData } = useQuery({
    queryKey: ['all-data'],
    queryFn: fetchAllData,
  });

  // Demo data structure
  const demoDataStructure = {
    portfolio: {
      description: "Portfolio holdings with current prices and weights",
      example: {
        "AAPL": {
          weight: 0.20,
          shares: 100,
          current_price: 182.45,
          market_value: 18245,
          daily_change: 1.23,
          current_weight: 0.195
        },
        "MSFT": {
          weight: 0.15,
          shares: 50,
          current_price: 378.92,
          market_value: 18946,
          daily_change: -0.45,
          current_weight: 0.203
        }
      }
    },
    riskMetrics: {
      description: "Key risk metrics for the portfolio",
      example: {
        var_95_historical: 0.0234,
        var_99_historical: 0.0412,
        volatility_annual: 0.1856,
        sharpe_ratio: 1.24,
        max_drawdown: -0.0821,
        returns_stats: {
          daily_mean: 0.0008,
          daily_std: 0.0117,
          annual_return: 0.2016,
          skewness: -0.234,
          kurtosis: 3.456
        }
      }
    },
    varAnalysis: {
      description: "Value at Risk analysis with different confidence levels",
      example: {
        historical: {
          "90%": 0.0156,
          "95%": 0.0234,
          "99%": 0.0412
        },
        parametric: {
          "90%": 0.0178,
          "95%": 0.0256,
          "99%": 0.0445
        },
        returns_distribution: {
          mean: 0.0008,
          std: 0.0117,
          skew: -0.234,
          kurtosis: 3.456
        }
      }
    },
    correlations: {
      description: "Asset correlation matrix showing relationships",
      example: {
        matrix: {
          "AAPL": { "AAPL": 1.0, "MSFT": 0.82, "GOOGL": 0.75 },
          "MSFT": { "AAPL": 0.82, "MSFT": 1.0, "GOOGL": 0.78 },
          "GOOGL": { "AAPL": 0.75, "MSFT": 0.78, "GOOGL": 1.0 }
        },
        highest_correlations: [
          { asset1: "AAPL", asset2: "MSFT", correlation: 0.82 },
          { asset1: "MSFT", asset2: "GOOGL", correlation: 0.78 }
        ],
        average_correlation: 0.48
      }
    },
    stressTest: {
      description: "Stress test scenarios and expected losses",
      example: {
        scenarios: [
          {
            scenario_name: "Market Crash",
            var_95: 0.25,
            expected_loss: 250000,
            probability: 10
          },
          {
            scenario_name: "Flash Crash",
            var_95: 0.15,
            expected_loss: 150000,
            probability: 5
          }
        ],
        current_value: 1000000
      }
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = (data: any, section: string) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedSection(section);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const renderJsonTree = (data: any, level: number = 0): React.ReactNode => {
    if (data === null || data === undefined) {
      return <span className="text-gray-500">null</span>;
    }

    if (typeof data !== 'object') {
      if (typeof data === 'string') {
        return <span className="text-green-400">"{data}"</span>;
      }
      if (typeof data === 'number') {
        return <span className="text-blue-400">{data}</span>;
      }
      if (typeof data === 'boolean') {
        return <span className="text-purple-400">{data.toString()}</span>;
      }
      return <span className="text-gray-300">{String(data)}</span>;
    }

    const isArray = Array.isArray(data);
    const entries = isArray ? data.map((v, i) => [i, v]) : Object.entries(data);

    return (
      <div className={`${level > 0 ? 'ml-4' : ''}`}>
        <span className="text-gray-400">{isArray ? '[' : '{'}</span>
        {entries.map(([key, value], index) => (
          <div key={key} className="my-1">
            <span className="text-purple-300">{isArray ? '' : `"${key}": `}</span>
            {renderJsonTree(value, level + 1)}
            {index < entries.length - 1 && <span className="text-gray-400">,</span>}
          </div>
        ))}
        <span className="text-gray-400">{isArray ? ']' : '}'}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Demo Data Structure</h2>
        </div>
        <p className="text-gray-300">
          Explore the data structure used throughout the dashboard. This shows both the expected format and actual live data.
        </p>
      </motion.div>

      {/* Live Data Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white font-medium">Data Source Status</span>
          </div>
          <span className="text-sm text-gray-400">
            {allData ? 'Connected to API' : 'Using Demo Data'}
          </span>
        </div>
      </motion.div>

      {/* Data Sections */}
      {Object.entries(demoDataStructure).map(([key, section]) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          {/* Section Header */}
          <div
            className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => toggleSection(key)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {expandedSections[key] ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
                <h3 className="text-lg font-semibold text-white capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(section.example, key);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {copiedSection === key ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-2 ml-8">{section.description}</p>
          </div>

          {/* Section Content */}
          {expandedSections[key] && (
            <div className="border-t border-white/10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {/* Example Structure */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Expected Structure
                  </h4>
                  <div className="bg-black/30 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs font-mono">
                      {renderJsonTree(section.example)}
                    </pre>
                  </div>
                </div>

                {/* Live Data */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Current Live Data
                  </h4>
                  <div className="bg-black/30 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs font-mono">
                      {allData ? (
                        renderJsonTree(
                          key === 'portfolio' ? allData.portfolio :
                          key === 'riskMetrics' ? allData.risk_metrics?.metrics :
                          key === 'varAnalysis' ? allData.var_analysis :
                          key === 'correlations' ? allData.correlation_matrix :
                          null
                        )
                      ) : (
                        <span className="text-gray-500">Loading...</span>
                      )}
                    </pre>
                  </div>
                </div>
              </div>

              {/* API Endpoint Info */}
              <div className="px-6 pb-6">
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <p className="text-sm text-blue-300">
                    <span className="font-semibold">API Endpoint:</span>{' '}
                    <code className="bg-black/30 px-2 py-1 rounded">
                      {key === 'portfolio' ? '/api/portfolio' :
                       key === 'riskMetrics' ? '/api/risk-metrics' :
                       key === 'varAnalysis' ? '/api/var-analysis' :
                       key === 'correlations' ? '/api/correlation-matrix' :
                       '/api/stress-test'}
                    </code>
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      ))}

      {/* Usage Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 bg-gradient-to-r from-purple-500/5 to-blue-500/5"
      >
        <h3 className="text-lg font-semibold text-white mb-4">📚 How to Use This Data</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start gap-2">
            <span className="text-purple-400">1.</span>
            <span>
              <span className="text-white font-medium">Portfolio Data:</span> Contains current positions, prices, and weights. Use this to track your holdings.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">2.</span>
            <span>
              <span className="text-white font-medium">Risk Metrics:</span> Key performance indicators like VaR, volatility, and Sharpe ratio for risk assessment.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">3.</span>
            <span>
              <span className="text-white font-medium">API Integration:</span> Use the endpoint URLs to fetch this data in your own applications.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">4.</span>
            <span>
              <span className="text-white font-medium">WebSocket Updates:</span> Connect to <code className="bg-black/30 px-2 py-1 rounded">ws://localhost:8000/ws/live-data</code> for real-time updates.
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DemoData;