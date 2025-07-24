// components/CorrelationMatrix.tsx
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { useQuery } from '@tanstack/react-query';
import { fetchCorrelationMatrix } from '../lib/api';
import { HelpCircle, BookOpen } from 'lucide-react';

// Demo correlation data
const DEMO_CORRELATION_DATA = {
  matrix: {
    "AAPL": { "AAPL": 1.0, "MSFT": 0.82, "GOOGL": 0.75, "NVDA": 0.68, "TSLA": 0.45, "JPM": 0.55, "GS": 0.52, "BTC-USD": 0.35, "ETH-USD": 0.38 },
    "MSFT": { "AAPL": 0.82, "MSFT": 1.0, "GOOGL": 0.78, "NVDA": 0.71, "TSLA": 0.42, "JPM": 0.58, "GS": 0.56, "BTC-USD": 0.32, "ETH-USD": 0.36 },
    "GOOGL": { "AAPL": 0.75, "MSFT": 0.78, "GOOGL": 1.0, "NVDA": 0.65, "TSLA": 0.48, "JPM": 0.52, "GS": 0.50, "BTC-USD": 0.28, "ETH-USD": 0.31 },
    "NVDA": { "AAPL": 0.68, "MSFT": 0.71, "GOOGL": 0.65, "NVDA": 1.0, "TSLA": 0.55, "JPM": 0.45, "GS": 0.43, "BTC-USD": 0.41, "ETH-USD": 0.44 },
    "TSLA": { "AAPL": 0.45, "MSFT": 0.42, "GOOGL": 0.48, "NVDA": 0.55, "TSLA": 1.0, "JPM": 0.25, "GS": 0.23, "BTC-USD": 0.52, "ETH-USD": 0.56 },
    "JPM": { "AAPL": 0.55, "MSFT": 0.58, "GOOGL": 0.52, "NVDA": 0.45, "TSLA": 0.25, "JPM": 1.0, "GS": 0.85, "BTC-USD": 0.15, "ETH-USD": 0.18 },
    "GS": { "AAPL": 0.52, "MSFT": 0.56, "GOOGL": 0.50, "NVDA": 0.43, "TSLA": 0.23, "JPM": 0.85, "GS": 1.0, "BTC-USD": 0.12, "ETH-USD": 0.16 },
    "BTC-USD": { "AAPL": 0.35, "MSFT": 0.32, "GOOGL": 0.28, "NVDA": 0.41, "TSLA": 0.52, "JPM": 0.15, "GS": 0.12, "BTC-USD": 1.0, "ETH-USD": 0.88 },
    "ETH-USD": { "AAPL": 0.38, "MSFT": 0.36, "GOOGL": 0.31, "NVDA": 0.44, "TSLA": 0.56, "JPM": 0.18, "GS": 0.16, "BTC-USD": 0.88, "ETH-USD": 1.0 }
  },
  highest_correlations: [
    { asset1: "BTC-USD", asset2: "ETH-USD", correlation: 0.88 },
    { asset1: "JPM", asset2: "GS", correlation: 0.85 },
    { asset1: "AAPL", asset2: "MSFT", correlation: 0.82 },
    { asset1: "MSFT", asset2: "GOOGL", correlation: 0.78 },
    { asset1: "AAPL", asset2: "GOOGL", correlation: 0.75 }
  ],
  lowest_correlations: [
    { asset1: "GS", asset2: "BTC-USD", correlation: 0.12 },
    { asset1: "JPM", asset2: "BTC-USD", correlation: 0.15 },
    { asset1: "GS", asset2: "ETH-USD", correlation: 0.16 },
    { asset1: "JPM", asset2: "ETH-USD", correlation: 0.18 },
    { asset1: "GS", asset2: "TSLA", correlation: 0.23 }
  ],
  average_correlation: 0.48
};

const CorrelationMatrix = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [showEducation, setShowEducation] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{row: string, col: string, value: number} | null>(null);
  
  const { data: correlationData = DEMO_CORRELATION_DATA, isLoading } = useQuery({
    queryKey: ['correlation-matrix'],
    queryFn: async () => {
      try {
        return await fetchCorrelationMatrix();
      } catch {
        return DEMO_CORRELATION_DATA;
      }
    },
    initialData: DEMO_CORRELATION_DATA,
    retry: false,
  });

  useEffect(() => {
    if (!correlationData || !svgRef.current) return;

    const matrix = correlationData.matrix;
    const assets = Object.keys(matrix);
    const size = 600;
    const margin = { top: 80, right: 80, bottom: 80, left: 80 };
    const width = size - margin.left - margin.right;
    const height = size - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${size} ${size}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .style('max-width', '600px')
      .style('height', 'auto');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleBand()
      .domain(assets)
      .range([0, width])
      .padding(0.05);

    const y = d3.scaleBand()
      .domain(assets)
      .range([0, height])
      .padding(0.05);

    const colorScale = d3.scaleSequential()
      .domain([-1, 1])
      .interpolator(d3.interpolateRdBu)
      .clamp(true);

    // Add cells
    const cellData = assets.flatMap((row, i) =>
      assets.map((col, j) => ({
        row,
        col,
        value: matrix[row][col],
        i,
        j,
      }))
    );

    // Add cell groups
    const cells = g.selectAll('.cell-group')
      .data(cellData)
      .enter()
      .append('g')
      .attr('class', 'cell-group');

    // Add rectangles
    cells.append('rect')
      .attr('x', d => x(d.col)!)
      .attr('y', d => y(d.row)!)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('fill', d => colorScale(d.value))
      .attr('stroke', '#1f2937')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        setHoveredCell({ row: d.row, col: d.col, value: d.value });
        d3.select(this)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
      })
      .on('mouseout', function() {
        setHoveredCell(null);
        d3.select(this)
          .attr('stroke', '#1f2937')
          .attr('stroke-width', 1);
      });

    // Add text values (only for non-diagonal cells)
    cells.filter(d => d.i !== d.j)
      .append('text')
      .attr('x', d => x(d.col)! + x.bandwidth() / 2)
      .attr('y', d => y(d.row)! + y.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', d => Math.abs(d.value) > 0.6 ? 'white' : 'black')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('pointer-events', 'none')
      .text(d => d.value.toFixed(2));

    // Add labels with better styling
    g.selectAll('.row-label')
      .data(assets)
      .enter()
      .append('text')
      .attr('class', 'row-label')
      .attr('x', -10)
      .attr('y', d => y(d)! + y.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#f3f4f6')
      .attr('font-size', '14px')
      .attr('font-weight', '500')
      .text(d => d);

    g.selectAll('.col-label')
      .data(assets)
      .enter()
      .append('text')
      .attr('class', 'col-label')
      .attr('x', d => x(d)! + x.bandwidth() / 2)
      .attr('y', -10)
      .attr('text-anchor', 'start')
      .attr('transform', d => `rotate(-45, ${x(d)! + x.bandwidth() / 2}, -10)`)
      .attr('fill', '#f3f4f6')
      .attr('font-size', '14px')
      .attr('font-weight', '500')
      .text(d => d);

    // Add color scale legend
    const legendWidth = 200;
    const legendHeight = 20;
    
    const legendScale = d3.scaleLinear()
      .domain([-1, 1])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .tickValues([-1, -0.5, 0, 0.5, 1])
      .tickFormat(d => d === -1 ? 'Negative' : d === 0 ? 'No' : d === 1 ? 'Perfect' : d.toString());

    const legend = svg.append('g')
      .attr('transform', `translate(${margin.left + width / 2 - legendWidth / 2}, ${margin.top + height + 50})`);

    // Create gradient
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'correlation-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', d3.interpolateRdBu(0));

    gradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', d3.interpolateRdBu(0.5));

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d3.interpolateRdBu(1));

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#correlation-gradient)')
      .attr('stroke', '#374151')
      .attr('stroke-width', 1);

    legend.append('g')
      .attr('transform', `translate(0, ${legendHeight})`)
      .call(legendAxis)
      .selectAll('text')
      .style('fill', '#9ca3af')
      .style('font-size', '12px');

    legend.append('text')
      .attr('x', legendWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f3f4f6')
      .attr('font-size', '14px')
      .attr('font-weight', '500')
      .text('Correlation Strength');

  }, [correlationData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Educational Banner */}
      {showEducation && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-purple-500/20"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Understanding Correlations</h3>
              </div>
              <p className="text-gray-300 mb-3">
                Correlation shows how assets move together: <span className="text-white font-medium">"Do they go up and down at the same time?"</span>
              </p>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span><span className="text-blue-300 font-medium">Blue (positive):</span> Assets move together - when one goes up, the other tends to go up</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  <span><span className="text-red-300 font-medium">Red (negative):</span> Assets move opposite - when one goes up, the other tends to go down</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span><span className="text-white font-medium">Why it matters:</span> Low correlation = better diversification = lower risk</span>
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
        <h2 className="text-2xl font-bold text-white">Asset Correlation Matrix</h2>
        <button
          onClick={() => setShowEducation(!showEducation)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Toggle explanation"
        >
          <HelpCircle className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex justify-center mb-4">
          <svg ref={svgRef}></svg>
        </div>

        {/* Hover Info */}
        {hoveredCell && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-4 bg-white/5 rounded-lg"
          >
            <p className="text-white">
              <span className="font-semibold">{hoveredCell.row}</span> ↔ <span className="font-semibold">{hoveredCell.col}</span>
            </p>
            <p className="text-2xl font-bold mt-1" style={{ 
              color: hoveredCell.value > 0 ? '#3b82f6' : '#ef4444' 
            }}>
              {(hoveredCell.value * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {hoveredCell.value > 0.7 ? 'Strong positive correlation' :
               hoveredCell.value > 0.3 ? 'Moderate positive correlation' :
               hoveredCell.value > -0.3 ? 'Weak/No correlation' :
               hoveredCell.value > -0.7 ? 'Moderate negative correlation' :
               'Strong negative correlation'}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Correlation Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">🔗 Highest Correlations</h3>
          <p className="text-sm text-gray-400 mb-4">These assets tend to move together</p>
          <div className="space-y-3">
            {correlationData?.highest_correlations?.map((corr, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <span className="text-gray-300 font-medium">{corr.asset1} ↔ {corr.asset2}</span>
                <span className="text-blue-400 font-semibold">
                  {(corr.correlation * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <p className="text-sm text-yellow-300">
              ⚠️ High correlation means less diversification benefit
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">🛡️ Lowest Correlations</h3>
          <p className="text-sm text-gray-400 mb-4">These assets provide good diversification</p>
          <div className="space-y-3">
            {correlationData?.lowest_correlations?.map((corr, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <span className="text-gray-300 font-medium">{corr.asset1} ↔ {corr.asset2}</span>
                <span className="text-green-400 font-semibold">
                  {(corr.correlation * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <p className="text-sm text-green-300">
              ✅ Low correlation helps reduce portfolio risk
            </p>
          </div>
        </motion.div>
      </div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 bg-gradient-to-r from-purple-500/5 to-blue-500/5"
        >
        <h3 className="text-lg font-semibold text-white mb-3">💡 Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-white/5 rounded-lg">
            <h4 className="font-semibold text-purple-400 mb-2">Tech Stocks Correlation</h4>
            <p className="text-gray-300">
              Tech giants (AAPL, MSFT, GOOGL) show high correlation (75-82%), meaning they often move together during market events.
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h4 className="font-semibold text-blue-400 mb-2">Crypto Correlation</h4>
            <p className="text-gray-300">
              BTC and ETH are highly correlated (88%), but have lower correlation with traditional stocks, offering diversification.
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h4 className="font-semibold text-green-400 mb-2">Banking Sector</h4>
            <p className="text-gray-300">
              JPM and GS show very high correlation (85%), as banking stocks typically react similarly to interest rate changes.
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h4 className="font-semibold text-orange-400 mb-2">Portfolio Balance</h4>
            <p className="text-gray-300">
              Average correlation of {(correlationData.average_correlation * 100).toFixed(0)}% suggests moderate diversification.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CorrelationMatrix;