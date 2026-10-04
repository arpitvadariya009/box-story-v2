import React, { useState } from 'react';
import { Download } from 'lucide-react';

const ClientWiseRevenueChart = ({ data = [], onExport }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Default / Fallback clients if empty
  const clients = data.length > 0 ? data.slice(0, 5) : [
    { client: 'TCS', revenue: 1250000 },
    { client: 'Infosys', revenue: 980000 },
    { client: 'Wipro', revenue: 720000 },
    { client: 'HCL', revenue: 450000 },
    { client: 'TechM', revenue: 350000 },
  ];

  // Calculate nice max scale for X-axis
  const rawMax = Math.max(...clients.map((c) => c.revenue || 0), 100000);
  
  // Calculate round tick step (e.g. 350000, 500000, etc.)
  const calculateTickStep = (maxVal) => {
    const roughStep = maxVal / 4;
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

  const xTicks = [0, tickStep, tickStep * 2, tickStep * 3, tickStep * 4];

  // SVG Chart Geometry
  const width = 560;
  const height = 240;
  const paddingLeft = 70;
  const paddingRight = 30;
  const paddingTop = 15;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight; // 460
  const chartHeight = height - paddingTop - paddingBottom; // 190
  const xAxisY = height - paddingBottom; // 205
  const yAxisX = paddingLeft; // 70

  const rowHeight = chartHeight / clients.length; // ~38px
  const barHeight = 22;

  const formatTick = (val) => {
    if (val === 0) return '0';
    return Number(val).toLocaleString('en-IN');
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E3E3E3] p-6 shadow-sm flex flex-col justify-between relative select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-bold text-[#0F1729]">Client-wise Revenue</h3>
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
          {/* Vertical dashed grid lines at each X-tick */}
          {xTicks.map((tick, i) => {
            const x = yAxisX + (tick / maxScale) * chartWidth;
            return (
              <g key={`grid-v-${i}`}>
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={xAxisY}
                  stroke="#EBEBEB"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Horizontal dashed grid lines at each client row */}
          {clients.map((_, i) => {
            const y = paddingTop + i * rowHeight + rowHeight / 2;
            return (
              <g key={`grid-h-${i}`}>
                <line
                  x1={yAxisX}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#EBEBEB"
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

          {/* X-Axis Ticks & Labels */}
          {xTicks.map((tick, i) => {
            const x = yAxisX + (tick / maxScale) * chartWidth;
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
                {/* Label */}
                <text
                  x={x}
                  y={xAxisY + 18}
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="Inter, sans-serif"
                >
                  {formatTick(tick)}
                </text>
              </g>
            );
          })}

          {/* Client Rows: Y-Ticks, Labels & Horizontal Bars */}
          {clients.map((item, i) => {
            const yCenter = paddingTop + i * rowHeight + rowHeight / 2;
            const barY = yCenter - barHeight / 2;
            const barWidth = Math.max(4, Math.min(chartWidth, (item.revenue / maxScale) * chartWidth));
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={`client-row-${i}`}
                className="cursor-pointer group"
                onMouseEnter={(e) => {
                  setHoveredIdx(i);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltipPos({ x: barWidth / 2, y: barY });
                }}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Y-Axis Tick mark */}
                <line
                  x1={yAxisX - 5}
                  y1={yCenter}
                  x2={yAxisX}
                  y2={yCenter}
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                />

                {/* Client Label */}
                <text
                  x={yAxisX - 8}
                  y={yCenter + 3.5}
                  textAnchor="end"
                  fill="#64748B"
                  fontSize="11"
                  fontWeight="500"
                  fontFamily="Inter, sans-serif"
                >
                  {item.client}
                </text>

                {/* Horizontal Red Bar */}
                <rect
                  x={yAxisX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  rx={2}
                  ry={2}
                  fill={isHovered ? '#D90B37' : '#E83D4F'}
                  className="transition-all duration-300"
                  filter={isHovered ? 'drop-shadow(0 2px 4px rgba(232, 61, 79, 0.35))' : 'none'}
                />
              </g>
            );
          })}
        </svg>

        {/* Interactive Floating Tooltip (Exact Dashboard Style) */}
        {hoveredIdx !== null && clients[hoveredIdx] && (
          <div
            className="absolute z-20 pointer-events-none bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.14)] p-3.5 text-[12px] min-w-[210px] transition-all duration-75 ease-out"
            style={{
              left: `${((yAxisX + Math.min((clients[hoveredIdx].revenue / maxScale) * chartWidth, chartWidth * 0.55)) / width) * 100}%`,
              top: `${Math.max(5, Math.min(60, ((paddingTop + hoveredIdx * rowHeight) / height) * 100))}%`,
              transform: 'translate(12px, 0)',
            }}
          >
            <div className="font-semibold text-[#0F1729] text-[13px] border-b border-[#F1F5F9] pb-1.5 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D90B37]"></span>
              <span>{clients[hoveredIdx].client}</span>
            </div>
            <div className="space-y-1.5 font-medium">
              <div className="flex justify-between items-center text-[#64748B]">
                <span>Total Revenue</span>
                <span className="font-bold text-[#E21D48] text-[13px]">
                  ₹{Number(clients[hoveredIdx].revenue).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#64748B] pt-1.5 border-t border-[#F1F5F9]">
                <span>Share of Max Volume</span>
                <span className="font-semibold text-[#0F1729]">
                  {Math.round((clients[hoveredIdx].revenue / maxScale) * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientWiseRevenueChart;
