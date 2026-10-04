import React, { useState } from 'react';
import { Download } from 'lucide-react';

// Smooth cubic Bézier spline calculation algorithm
const getSmoothSplinePath = (points) => {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
};

const ProductDemandTrendsChart = ({ data = [], onExport }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Fallback 6 months if data is empty or short
  const defaultMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const baseSeries1 = [120, 95, 150, 180, 200, 255];
  const baseSeries2 = [80, 110, 90, 120, 140, 160];
  const baseSeries3 = [60, 75, 85, 95, 110, 130];

  const trendsData = data.length >= 6 ? data.slice(-6) : defaultMonths.map((m, idx) => ({
    month: m,
    series1: baseSeries1[idx],
    series2: baseSeries2[idx],
    series3: baseSeries3[idx],
    demand: baseSeries1[idx] + baseSeries2[idx] + baseSeries3[idx],
  }));

  // Find max value across all 3 series
  const allValues = trendsData.flatMap((d) => [
    d.series1 ?? d.demand ?? 0,
    d.series2 ?? Math.round((d.demand || 0) * 0.65),
    d.series3 ?? Math.round((d.demand || 0) * 0.45),
  ]);
  const rawMax = Math.max(...allValues, 100);

  // Calculate clean tick step (e.g. 65, 50, 100, etc.)
  const calculateTickStep = (maxVal) => {
    const roughStep = maxVal / 4;
    if (roughStep <= 70) return 65; // Matches 0, 65, 130, 195, 260
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalized = roughStep / magnitude;
    let niceMultiplier = 1;
    if (normalized > 5) niceMultiplier = 10;
    else if (normalized > 2.5) niceMultiplier = 5;
    else if (normalized > 1.5) niceMultiplier = 2.5;
    else if (normalized > 1) niceMultiplier = 2;
    return niceMultiplier * magnitude;
  };

  const tickStep = calculateTickStep(rawMax);
  const maxScale = tickStep * 4;

  const yTicks = [0, tickStep, tickStep * 2, tickStep * 3, tickStep * 4];

  // SVG Chart Geometry
  const width = 560;
  const height = 240;
  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingTop = 15;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight; // 485
  const chartHeight = height - paddingTop - paddingBottom; // 190
  const xAxisY = height - paddingBottom; // 205
  const yAxisX = paddingLeft; // 45

  const numMonths = trendsData.length;
  const monthSpacing = chartWidth / (numMonths - 1 || 1);

  // Map data to coordinate points
  const pointsSeries1 = trendsData.map((d, i) => {
    const val = d.series1 !== undefined ? d.series1 : d.demand || 0;
    const x = yAxisX + i * monthSpacing;
    const y = xAxisY - (Math.min(val, maxScale) / maxScale) * chartHeight;
    return { x, y, val, month: d.month };
  });

  const pointsSeries2 = trendsData.map((d, i) => {
    const val = d.series2 !== undefined ? d.series2 : Math.round((d.demand || 0) * 0.65);
    const x = yAxisX + i * monthSpacing;
    const y = xAxisY - (Math.min(val, maxScale) / maxScale) * chartHeight;
    return { x, y, val, month: d.month };
  });

  const pointsSeries3 = trendsData.map((d, i) => {
    const val = d.series3 !== undefined ? d.series3 : Math.round((d.demand || 0) * 0.45);
    const x = yAxisX + i * monthSpacing;
    const y = xAxisY - (Math.min(val, maxScale) / maxScale) * chartHeight;
    return { x, y, val, month: d.month };
  });

  const path1 = getSmoothSplinePath(pointsSeries1);
  const path2 = getSmoothSplinePath(pointsSeries2);
  const path3 = getSmoothSplinePath(pointsSeries3);

  return (
    <div className="bg-white rounded-2xl border border-[#E3E3E3] p-6 shadow-sm flex flex-col justify-between relative select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-bold text-[#0F1729]">Product Demand Trends</h3>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E3E3E3] rounded-lg text-xs font-semibold text-[#0F1729] hover:bg-slate-50 cursor-pointer bg-white transition-colors"
          title="Export CSV"
        >
          <Download size={14} />
          <span>Export</span>
        </button>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[250px]"
          style={{ minWidth: '460px' }}
        >
          {/* Horizontal dashed grid lines at each Y-tick */}
          {yTicks.map((tick, i) => {
            const y = xAxisY - (tick / maxScale) * chartHeight;
            return (
              <g key={`grid-y-${i}`}>
                <line
                  x1={yAxisX}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#EDEDED"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Vertical dashed grid lines at each month */}
          {trendsData.map((_, i) => {
            const x = yAxisX + i * monthSpacing;
            return (
              <g key={`grid-x-${i}`}>
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={xAxisY}
                  stroke="#EDEDED"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Y-Axis Solid Line */}
          <line
            x1={yAxisX}
            y1={paddingTop}
            x2={yAxisX}
            y2={xAxisY}
            stroke="#94A3B8"
            strokeWidth="1.5"
          />

          {/* X-Axis Solid Line */}
          <line
            x1={yAxisX}
            y1={xAxisY}
            x2={width - paddingRight}
            y2={xAxisY}
            stroke="#94A3B8"
            strokeWidth="1.5"
          />

          {/* Y-Axis Ticks & Labels */}
          {yTicks.map((tick, i) => {
            const y = xAxisY - (tick / maxScale) * chartHeight;
            return (
              <g key={`ytick-${i}`}>
                {/* Tick mark */}
                <line
                  x1={yAxisX - 5}
                  y1={y}
                  x2={yAxisX}
                  y2={y}
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                />
                {/* Label */}
                <text
                  x={yAxisX - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="Inter, sans-serif"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* X-Axis Month Ticks & Labels */}
          {trendsData.map((item, i) => {
            const x = yAxisX + i * monthSpacing;
            return (
              <g key={`xtick-${i}`}>
                {/* Tick mark */}
                <line
                  x1={x}
                  y1={xAxisY}
                  x2={x}
                  y2={xAxisY + 5}
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                />
                {/* Month Label */}
                <text
                  x={x}
                  y={xAxisY + 18}
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="Inter, sans-serif"
                >
                  {item.month}
                </text>
              </g>
            );
          })}

          {/* Interactive Vertical Hover Guide */}
          {hoveredIdx !== null && (
            <line
              x1={yAxisX + hoveredIdx * monthSpacing}
              y1={paddingTop}
              x2={yAxisX + hoveredIdx * monthSpacing}
              y2={xAxisY}
              stroke="#D90B37"
              strokeDasharray="2 2"
              strokeWidth="1.5"
              className="opacity-70"
            />
          )}

          {/* 3 Smooth Curved Lines */}
          {/* 1. Red Line (Gift Boxes / Series 1) */}
          <path
            d={path1}
            fill="none"
            stroke="#E83D4F"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* 2. Green Line (Eco Hampers / Series 2) */}
          <path
            d={path2}
            fill="none"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* 3. Orange Line (Custom Swag / Series 3) */}
          <path
            d={path3}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Data Points (Markers) */}
          {/* Series 3 Points (Orange) */}
          {pointsSeries3.map((pt, i) => (
            <circle
              key={`p3-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={hoveredIdx === i ? 5.5 : 3.5}
              fill="#FFFFFF"
              stroke="#F59E0B"
              strokeWidth={hoveredIdx === i ? 2.5 : 2}
              className="transition-all duration-150"
            />
          ))}

          {/* Series 2 Points (Green) */}
          {pointsSeries2.map((pt, i) => (
            <circle
              key={`p2-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={hoveredIdx === i ? 5.5 : 3.5}
              fill="#FFFFFF"
              stroke="#10B981"
              strokeWidth={hoveredIdx === i ? 2.5 : 2}
              className="transition-all duration-150"
            />
          ))}

          {/* Series 1 Points (Red) */}
          {pointsSeries1.map((pt, i) => (
            <circle
              key={`p1-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={hoveredIdx === i ? 5.5 : 3.5}
              fill="#FFFFFF"
              stroke="#E83D4F"
              strokeWidth={hoveredIdx === i ? 2.5 : 2}
              className="transition-all duration-150"
            />
          ))}

          {/* Invisible interactive hover slices */}
          {trendsData.map((_, i) => {
            const x = yAxisX + i * monthSpacing - monthSpacing / 2;
            const w = monthSpacing;
            return (
              <rect
                key={`hover-slice-${i}`}
                x={Math.max(yAxisX, x)}
                y={paddingTop}
                width={w}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Interactive Floating Tooltip (Exact Dashboard Style) */}
        {hoveredIdx !== null && trendsData[hoveredIdx] && (
          <div
            className="absolute z-20 pointer-events-none bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.14)] p-3.5 text-[12px] min-w-[220px] transition-all duration-75 ease-out"
            style={{
              left: `${((yAxisX + hoveredIdx * monthSpacing) / width) * 100}%`,
              top: '8%',
              transform: hoveredIdx >= (trendsData.length / 2)
                ? 'translate(-105%, 0)'
                : 'translate(8%, 0)',
            }}
          >
            <div className="font-semibold text-[#0F1729] text-[13px] border-b border-[#F1F5F9] pb-1.5 mb-2 flex justify-between items-center">
              <span>{trendsData[hoveredIdx].month} Trend</span>
              <span className="text-[#64748B] text-xs font-normal">Demand</span>
            </div>
            <div className="space-y-1.5 font-medium">
              <div className="flex items-center justify-between text-[#64748B]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E83D4F]"></span>
                  <span>Gift Boxes</span>
                </div>
                <span className="font-semibold text-[#0F1729]">{pointsSeries1[hoveredIdx]?.val} units</span>
              </div>
              <div className="flex items-center justify-between text-[#64748B]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                  <span>Eco Hampers</span>
                </div>
                <span className="font-semibold text-[#0F1729]">{pointsSeries2[hoveredIdx]?.val} units</span>
              </div>
              <div className="flex items-center justify-between text-[#64748B]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                  <span>Custom Swag</span>
                </div>
                <span className="font-semibold text-[#0F1729]">{pointsSeries3[hoveredIdx]?.val} units</span>
              </div>
              <div className="flex items-center justify-between text-[#64748B] pt-1.5 border-t border-[#F1F5F9]">
                <span>Total Demand</span>
                <span className="font-bold text-[#E21D48]">
                  {(pointsSeries1[hoveredIdx]?.val || 0) + (pointsSeries2[hoveredIdx]?.val || 0) + (pointsSeries3[hoveredIdx]?.val || 0)} units
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDemandTrendsChart;
