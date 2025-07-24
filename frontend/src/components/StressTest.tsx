import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, Zap, TrendingDown, DollarSign } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { runStressTest } from '../lib/api';
import toast from 'react-hot-toast';

const StressTest = () => {
  const [customScenario, setCustomScenario] = useState({ name: '', shock: -10 });
  
  const predefinedScenarios = [
    { name: 'Market Crash', icon: TrendingDown, shock: -25, probability: 10, color: '#ef4444' },
    { name: 'Flash Crash', icon: Zap, shock: -15, probability: 5, color: '#f59e0b' },
    { name: 'Rate Hike', icon: DollarSign, shock: -8, probability: 30, color: '#3b82f6' },
    { name: 'Black Swan', icon: AlertTriangle, shock: -40, probability: 1, color: '#8b5cf6' },
  ];

  const { mutate: runTest, data: results, isLoading } = useMutation({
    mutationFn: runStressTest,
    onSuccess: () => toast.success('Stress test completed'),
    onError: () => toast.error('Failed to run stress test'),
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
      {/* Predefined Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {predefinedScenarios.map((scenario, index) => (
          <motion.div
            key={scenario.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="glass-card p-6 cursor-pointer"
            onClick={() => handleRunScenario(scenario)}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
              style={{ backgroundColor: `${scenario.color}20` }}
            >
              <scenario.icon className="w-6 h-6" style={{ color: scenario.color }} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{scenario.name}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Shock</span>
                <span className="text-white font-medium">{scenario.shock}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Probability</span>
                <span className="text-white font-medium">{scenario.probability}%</span>
              </div>
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
        <h3 className="text-lg font-semibold text-white mb-4">Custom Scenario</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Scenario name"
            value={customScenario.name}
            onChange={(e) => setCustomScenario({ ...customScenario, name: e.target.value })}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="-50"
              max="0"
              value={customScenario.shock}
              onChange={(e) => setCustomScenario({ ...customScenario, shock: Number(e.target.value) })}
              className="flex-1"
            />
            <span className="text-white font-medium w-12">{customScenario.shock}%</span>
          </div>
          <button
            onClick={() => handleRunScenario(customScenario)}
            disabled={!customScenario.name}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium disabled:opacity-50 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            Run Test
          </button>
        </div>
      </motion.div>

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Stress Test Results</h3>
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
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Bar dataKey="expected_loss" radius={[8, 8, 0, 0]}>
                  {results.scenarios.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">
              Portfolio Value: ${results.current_value.toLocaleString()}
            </p>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
          />
        </div>
      )}
    </div>
  );
};

export default StressTest;
