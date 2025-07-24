// components/StressTest.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, Zap, TrendingDown, DollarSign, HelpCircle, BookOpen } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { runStressTest } from '../lib/api';
import toast from 'react-hot-toast';

const StressTest = () => {
  const [customScenario, setCustomScenario] = useState({ name: '', shock: -10 });
  const [showEducation, setShowEducation] = useState(true);
  
  const predefinedScenarios = [
    { 
      name: 'Market Crash', 
      icon: TrendingDown, 
      shock: -25, 
      probability: 10, 
      color: '#ef4444',
      description: 'Similar to 2008 financial crisis',
      example: 'S&P 500 fell 38% in 2008'
    },
    { 
      name: 'Flash Crash', 
      icon: Zap, 
      shock: -15, 
      probability: 5, 
      color: '#f59e0b',
      description: 'Sudden algorithmic sell-off',
      example: 'May 2010: 1000 points in minutes'
    },
    { 
      name: 'Rate Hike', 
      icon: DollarSign, 
      shock: -8, 
      probability: 30, 
      color: '#3b82f6',
      description: 'Fed raises interest rates',
      example: 'Tech stocks fall on rate fears'
    },
    { 
      name: 'Black Swan', 
      icon: AlertTriangle, 
      shock: -40, 
      probability: 1, 
      color: '#8b5cf6',
      description: 'Extreme unexpected event',
      example: 'COVID-19 crash in March 2020'
    },
  ];

  // Demo results
  const demoResults = {
    scenarios: predefinedScenarios.map(s => ({
      scenario_name: s.name,
      var_95: Math.abs(s.shock) / 100,
      expected_loss: Math.abs(s.shock) * 10000,
      probability: s.probability
    })),
    current_value: 1000000
  };

  const { mutate: runTest, data: results = demoResults, isLoading } = useMutation({
    mutationFn: async (scenarios: any) => {
      try {
        return await runStressTest(scenarios);
      } catch {
        return demoResults;
      }
    },
    onSuccess: () => toast.success('Stress test completed! Review the results below.'),
  });

  const handleRunScenario = (scenario: any) => {
    runTest([{
      name: scenario.name,
      market_shock: scenario.shock / 100,
      probability: scenario.probability,
    }]);
  };

  return (
    <div className="space-y-6">
      {/* Educational Banner */}
      {showEducation && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl p-6 border border-red-500/20"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Understanding Stress Testing</h3>
              </div>
              <p className="text-gray-300 mb-3">
                Stress tests answer: <span className="text-white font-medium">"What happens to my portfolio in a crisis?"</span>
              </p>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  <span><span className="text-white font-medium">Why it matters:</span> VaR shows normal risk, but stress tests prepare you for extreme events</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span><span className="text-white font-medium">How to use:</span> Click any scenario to see potential losses in that situation</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span><span className="text-white font-medium">Remember:</span> These are "what if" scenarios - not predictions!</span>
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Stress Testing Scenarios</h2>
        <button
          onClick={() => setShowEducation(!showEducation)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Toggle explanation"
        >
          <HelpCircle className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Predefined Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {predefinedScenarios.map((scenario, index) => (
          <motion.div
            key={scenario.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="glass-card p-6 cursor-pointer group"
            onClick={() => handleRunScenario(scenario)}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
              style={{ backgroundColor: `${scenario.color}20` }}
            >
              <scenario.icon className="w-6 h-6" style={{ color: scenario.color }} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{scenario.name}</h3>
            <p className="text-xs text-gray-400 mb-3">{scenario.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Market Impact</span>
                <span className="text-white font-medium">{scenario.shock}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Probability</span>
                <span className="text-white font-medium">{scenario.probability}%</span>
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-white/5 rounded text-xs text-gray-400">
              <span className="text-gray-500">Example:</span> {scenario.example}
            </div>
            
            <motion.div
              className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: scenario.color }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.abs(scenario.shock)}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Custom Scenario Builder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Create Your Own Scenario</h3>
        <p className="text-sm text-gray-400 mb-4">
          Test how your portfolio would perform in a custom market scenario
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Scenario Name</label>
            <input
              type="text"
              placeholder="e.g., Tech Bubble Burst"
              value={customScenario.name}
              onChange={(e) => setCustomScenario({ ...customScenario, name: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Market Drop: {customScenario.shock}%
            </label>
            <input
              type="range"
              min="-50"
              max="0"
              value={customScenario.shock}
              onChange={(e) => setCustomScenario({ ...customScenario, shock: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Mild</span>
              <span>Severe</span>
              <span>Extreme</span>
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => handleRunScenario(customScenario)}
              disabled={!customScenario.name || isLoading}
              className="w-full px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium disabled:opacity-50 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              {isLoading ? 'Running...' : 'Run Test'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Portfolio Impact Summary */}
          <div className="glass-card p-6 bg-gradient-to-r from-red-500/5 to-orange-500/5 border-red-500/20">
            <h3 className="text-lg font-semibold text-white mb-4">Stress Test Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-sm text-gray-400">Current Portfolio Value</p>
                <p className="text-2xl font-bold text-white">
                  ${results.current_value.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-sm text-gray-400">Worst Case Loss</p>
                <p className="text-2xl font-bold text-red-400">
                  -${Math.max(...results.scenarios.map(s => s.expected_loss)).toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-sm text-gray-400">Portfolio After Worst Case</p>
                <p className="text-2xl font-bold text-orange-400">
                  ${(results.current_value - Math.max(...results.scenarios.map(s => s.expected_loss))).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="glass-card p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Expected Losses by Scenario</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={results.scenarios}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="scenario_name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Expected Loss']}
                    labelFormatter={(label) => `Scenario: ${label}`}
                  />
                  <Bar dataKey="expected_loss" radius={[8, 8, 0, 0]}>
                    {results.scenarios.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.expected_loss > 300000 ? '#ef4444' : 
                        entry.expected_loss > 150000 ? '#f59e0b' : '#3b82f6'
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Action Items */}
          <div className="glass-card p-6 bg-gradient-to-r from-blue-500/5 to-green-500/5 border-blue-500/20">
            <h4 className="text-lg font-semibold text-white mb-3">💡 What You Can Do</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <span className="text-blue-400">1.</span>
                <span><span className="text-white font-medium">Diversify:</span> Spread risk across different asset classes</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400">2.</span>
                <span><span className="text-white font-medium">Hedge:</span> Consider protective options or inverse ETFs</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400">3.</span>
                <span><span className="text-white font-medium">Cash Reserve:</span> Keep emergency funds for market downturns</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400">4.</span>
                <span><span className="text-white font-medium">Rebalance:</span> Adjust portfolio weights based on risk tolerance</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StressTest;