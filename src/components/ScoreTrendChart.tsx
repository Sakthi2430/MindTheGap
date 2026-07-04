import { useState } from 'react';

interface TrendItem {
  id: string;
  jobTitle: string;
  readinessScore: number;
  createdAt: string;
}

interface ScoreTrendChartProps {
  data: TrendItem[];
}

export function ScoreTrendChart({ data }: ScoreTrendChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <p className="text-sm text-slate-400 font-medium">No historical trends available yet.</p>
      </div>
    );
  }

  // Ensure data is sorted by date ascending for the chart rendering
  const sortedData = [...data]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-7); // show last 7 records

  const scores = sortedData.map(d => d.readinessScore);
  const minScore = 0;
  const maxScore = 100;

  // Chart layout specs
  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Calculate coordinates for points
  const points = sortedData.map((item, index) => {
    const x = paddingX + (index / Math.max(1, sortedData.length - 1)) * chartWidth;
    // Map score 0-100 to y coordinate (remember SVG y increases downwards)
    const y = paddingY + chartHeight - ((item.readinessScore - minScore) / (maxScore - minScore)) * chartHeight;
    return { x, y, score: item.readinessScore, title: item.jobTitle, date: new Date(item.createdAt).toLocaleDateString() };
  });

  // Create path strings
  let linePath = '';
  let areaPath = '';

  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingY + chartHeight} L ${points[0].x} ${paddingY + chartHeight} Z`;
  }

  return (
    <div className="glass p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-sm font-semibold text-white">Job Readiness Trend</h4>
          <p className="text-xs text-slate-400 mt-0.5">Chronological readiness scores over the last 7 analyses</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-md shadow-blue-500/50"></span> 80%+ Ready
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-md shadow-amber-500/50"></span> 55%-79% Gap
          </span>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          {/* Gradients */}
          <defs>
            <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 25, 50, 75, 100].map((level, i) => {
            const y = paddingY + chartHeight - (level / 100) * chartHeight;
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="font-mono text-[9px] fill-slate-500"
                >
                  {level}%
                </text>
              </g>
            );
          })}

          {/* Shaded Area under the curve */}
          {points.length > 0 && (
            <path d={areaPath} fill="url(#chartGlow)" />
          )}

          {/* Main Line path */}
          {points.length > 0 && (
            <path
              d={linePath}
              fill="transparent"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive data point markers */}
          {points.map((p, idx) => (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? 7 : 4.5}
                className="transition-all duration-150"
                fill={p.score >= 80 ? '#3b82f6' : p.score >= 55 ? '#f59e0b' : '#f43f5e'}
                stroke="#0f172a"
                strokeWidth="2"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="12"
                fill="transparent"
              />
            </g>
          ))}
        </svg>

        {/* Dynamic HTML Tooltip Overlay inside container */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div
            className="absolute z-10 p-3 bg-slate-950/95 border border-white/10 rounded-xl shadow-2xl text-white pointer-events-none backdrop-blur-md"
            style={{
              left: `${(points[hoveredIdx].x / width) * 100}%`,
              top: `${(points[hoveredIdx].y / height) * 100 - 30}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">{points[hoveredIdx].date}</p>
            <h5 className="text-xs font-bold mt-1 max-w-[160px] truncate text-white">{points[hoveredIdx].title}</h5>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${
                points[hoveredIdx].score >= 80 ? 'bg-blue-400' : points[hoveredIdx].score >= 55 ? 'bg-amber-400' : 'bg-rose-400'
              }`}></span>
              <p className={`text-xs font-bold ${
                points[hoveredIdx].score >= 80 ? 'text-blue-400' : points[hoveredIdx].score >= 55 ? 'text-amber-400' : 'text-rose-400'
              }`}>{points[hoveredIdx].score}% Readiness</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
