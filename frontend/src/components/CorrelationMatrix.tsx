// components/CorrelationMatrix.tsx
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { useQuery } from '@tanstack/react-query';
import { fetchCorrelationMatrix } from '../lib/api';

const CorrelationMatrix = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { data: correlationData, isLoading } = useQuery({
    queryKey: ['correlation-matrix'],
    queryFn: fetchCorrelationMatrix,
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
      .attr('width', size)
      .attr('height', size);

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
      .interpolator(d3.interpolateRdBu);

    // Add cells
    const cells = g.selectAll('.cell')
      .data(assets.flatMap((row, i) =>
        assets.map((col, j) => ({
          row,
          col,
          value: matrix[row][col],
          i,
          j,
        }))
      ));

    cells.enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => x(d.col)!)
      .attr('y', d => y(d.row)!)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('fill', d => colorScale(d.value))
      .attr('opacity', 0)
      .on('mouseover', function(event, d) {
        // Highlight row and column
        d3.selectAll('.cell')
          .attr('opacity', cell => 
            cell.row === d.row || cell.col === d.col ? 1 : 0.3
          );
        
        // Show tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', '#1f2937')
          .style('border', '1px solid #374151')
          .style('padding', '8px')
          .style('border-radius', '8px')
          .style('color', 'white')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('opacity', 0);

        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);

        tooltip.html(`${d.row} × ${d.col}<br/>Correlation: ${d.value.toFixed(3)}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.selectAll('.cell').attr('opacity', 1);
        d3.selectAll('.tooltip').remove();
      })
      .transition()
      .duration(500)
      .delay((d, i) => i * 2)
      .attr('opacity', 1);

    // Add text values
    cells.enter()
      .append('text')
      .attr('x', d => x(d.col)! + x.bandwidth() / 2)
      .attr('y', d => y(d.row)! + y.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', d => Math.abs(d.value) > 0.5 ? 'white' : 'black')
      .attr('font-size', '10px')
      .attr('opacity', 0)
      .text(d => d.value.toFixed(2))
      .transition()
      .duration(500)
      .delay((d, i) => i * 2)
      .attr('opacity', d => d.i === d.j ? 0 : 1);

    // Add labels
    g.selectAll('.row-label')
      .data(assets)
      .enter()
      .append('text')
      .attr('class', 'row-label')
      .attr('x', -10)
      .attr('y', d => y(d)! + y.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', '12px')
      .text(d => d);

    g.selectAll('.col-label')
      .data(assets)
      .enter()
      .append('text')
      .attr('class', 'col-label')
      .attr('x', d => x(d)! + x.bandwidth() / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', '12px')
      .text(d => d);

    // Add color scale legend
    const legendWidth = 200;
    const legendHeight = 20;
    
    const legendScale = d3.scaleLinear()
      .domain([-1, 1])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .tickValues([-1, -0.5, 0, 0.5, 1])
      .tickFormat(d3.format('.1f'));

    const legend = svg.append('g')
      .attr('transform', `translate(${margin.left + width / 2 - legendWidth / 2}, ${margin.top + height + 40})`);

    // Create gradient
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'correlation-gradient');

    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      gradient.append('stop')
        .attr('offset', `${(i / steps) * 100}%`)
        .attr('stop-color', colorScale((i / steps) * 2 - 1));
    }

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#correlation-gradient)');

    legend.append('g')
      .attr('transform', `translate(0, ${legendHeight})`)
      .call(legendAxis)
      .selectAll('text')
      .style('fill', '#9ca3af');

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Asset Correlation Matrix</h2>
        <div className="flex justify-center">
          <svg ref={svgRef}></svg>
        </div>
      </motion.div>

      {/* Correlation Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Highest Correlations</h3>
          <div className="space-y-3">
            {correlationData?.highest_correlations?.map((corr, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">{corr.asset1} ↔ {corr.asset2}</span>
                <span className="text-green-400 font-medium">
                  {(corr.correlation * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Lowest Correlations</h3>
          <div className="space-y-3">
            {correlationData?.lowest_correlations?.map((corr, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">{corr.asset1} ↔ {corr.asset2}</span>
                <span className="text-red-400 font-medium">
                  {(corr.correlation * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CorrelationMatrix;