import React, { useMemo } from 'react';
import type { WelchResult } from '../types/stats';
import { studentTPdf } from '../lib/statsEngine';

interface TDistributionPlotProps {
  stats: WelchResult;
  stadiumName?: string;
}

export const TDistributionPlot: React.FC<TDistributionPlotProps> = ({ stats }) => {
  const { tStat, df, pValue, tCrit, isSignificant } = stats;

  // Chart dimensions
  const width = 800;
  const height = 300;
  const paddingLeft = 60;
  const paddingRight = 60;
  const paddingTop = 40;
  const paddingBottom = 45;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const baselineY = height - paddingBottom;

  // Dynamic T-axis range to accommodate observed t and critical t
  const minT = Math.min(-4, Math.floor(tStat - 1));
  const maxT = Math.max(5, Math.ceil(Math.max(tStat + 1.5, tCrit + 1.5)));

  const tToX = (t: number) => {
    return paddingLeft + ((t - minT) / (maxT - minT)) * plotWidth;
  };

  // Peak of Student's t pdf at t = 0
  const maxPdf = useMemo(() => studentTPdf(0, df), [df]);

  const pdfToY = (pdfVal: number) => {
    return baselineY - (pdfVal / (maxPdf * 1.15)) * plotHeight;
  };

  // Generate curve coordinates
  const { curvePath, pTailPath, criticalTailPath } = useMemo(() => {
    const steps = 240;
    const dt = (maxT - minT) / steps;
    const points: [number, number][] = [];

    for (let i = 0; i <= steps; i++) {
      const t = minT + i * dt;
      const pdf = studentTPdf(t, df);
      points.push([tToX(t), pdfToY(pdf)]);
    }

    // SVG path string for entire curve
    let cPath = `M ${points[0][0]},${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      cPath += ` L ${points[i][0]},${points[i][1]}`;
    }

    // Rejection Tail path for t >= tCrit (alpha = 0.05 region)
    const critPoints: [number, number][] = [];
    const pPoints: [number, number][] = [];

    for (let i = 0; i <= steps; i++) {
      const t = minT + i * dt;
      const pdf = studentTPdf(t, df);
      const x = tToX(t);
      const y = pdfToY(pdf);

      if (t >= tCrit) {
        critPoints.push([x, y]);
      }
      if (t >= tStat) {
        pPoints.push([x, y]);
      }
    }

    let critTail = '';
    if (critPoints.length > 0) {
      critTail = `M ${critPoints[0][0]},${baselineY} L ${critPoints[0][0]},${critPoints[0][1]}`;
      for (let i = 1; i < critPoints.length; i++) {
        critTail += ` L ${critPoints[i][0]},${critPoints[i][1]}`;
      }
      critTail += ` L ${critPoints[critPoints.length - 1][0]},${baselineY} Z`;
    }

    let pTail = '';
    if (pPoints.length > 0) {
      pTail = `M ${pPoints[0][0]},${baselineY} L ${pPoints[0][0]},${pPoints[0][1]}`;
      for (let i = 1; i < pPoints.length; i++) {
        pTail += ` L ${pPoints[i][0]},${pPoints[i][1]}`;
      }
      pTail += ` L ${pPoints[pPoints.length - 1][0]},${baselineY} Z`;
    }

    return { curvePath: cPath, pTailPath: pTail, criticalTailPath: critTail };
  }, [df, minT, maxT, tCrit, tStat, maxPdf, baselineY]);

  const xCrit = tToX(tCrit);
  const xObs = tToX(tStat);

  // Discrete integer ticks for T axis
  const tTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let t = Math.ceil(minT); t <= Math.floor(maxT); t++) {
      ticks.push(t);
    }
    return ticks;
  }, [minT, maxT]);

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-4 sm:p-6 shadow-[var(--shadow-card)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-scoreboard text-base font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Student's t-Distribution & Rejection Region
            </h4>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] text-[var(--text-secondary)]">
              df = {df.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Right-tailed critical threshold t<sub>crit</sub> = {tCrit.toFixed(3)} (&alpha; = 0.05). Shaded area represents p = {pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(4)}.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-500 border-t-2 border-dashed border-rose-500" />
            <span className="text-[var(--text-secondary)]">t<sub>crit</sub> (&alpha; = 0.05)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[var(--turf-accent)]" />
            <span className="text-[var(--text-secondary)]">t<sub>obs</sub> ({tStat.toFixed(2)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500" />
            <span className="text-[var(--text-secondary)]">p-value Tail Area</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[620px] h-auto select-none">
          {/* Subtle Grid Lines */}
          {tTicks.map((t) => {
            const x = tToX(t);
            return (
              <g key={`ttick-${t}`}>
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={baselineY}
                  stroke="var(--surface-border)"
                  strokeDasharray="2 3"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={baselineY + 16}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="10"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {t > 0 ? `+${t}` : t}
                </text>
              </g>
            );
          })}

          {/* Critical Rejection Area (Alpha = 0.05 Region: t >= tCrit) */}
          {criticalTailPath && (
            <path
              d={criticalTailPath}
              fill="rgba(244, 63, 94, 0.12)"
              stroke="none"
            />
          )}

          {/* p-value tail area (t >= tStat) */}
          {pTailPath && (
            <path
              d={pTailPath}
              fill={isSignificant ? 'rgba(16, 185, 129, 0.28)' : 'rgba(245, 158, 11, 0.28)'}
              stroke="none"
            />
          )}

          {/* Theoretical t-Distribution Curve */}
          <path
            d={curvePath}
            fill="none"
            stroke="var(--text-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Baseline (Horizontal axis) */}
          <line
            x1={paddingLeft - 10}
            y1={baselineY}
            x2={width - paddingRight + 10}
            y2={baselineY}
            stroke="var(--surface-border-strong)"
            strokeWidth="1.5"
          />

          {/* Axis Label */}
          <text
            x={width - paddingRight + 18}
            y={baselineY + 4}
            textAnchor="start"
            fill="var(--text-muted)"
            fontSize="10"
            fontFamily="'JetBrains Mono', monospace"
          >
            t-score
          </text>

          {/* Rejection Region Shading Label */}
          {xCrit < width - paddingRight - 40 && (
            <g transform={`translate(${xCrit + 35}, ${baselineY - 14})`}>
              <text
                textAnchor="start"
                fill="#f43f5e"
                fontSize="9.5"
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="bold"
              >
                Rejection Region (α = 0.05) &rarr;
              </text>
            </g>
          )}

          {/* Critical Value Vertical Line (tCrit) */}
          <line
            x1={xCrit}
            y1={paddingTop + 10}
            x2={xCrit}
            y2={baselineY}
            stroke="#f43f5e"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <g transform={`translate(${xCrit}, ${paddingTop + 6})`}>
            <rect
              x="-42"
              y="-14"
              width="84"
              height="18"
              rx="4"
              fill="var(--surface-card)"
              stroke="#f43f5e"
              strokeWidth="1.2"
            />
            <text
              textAnchor="middle"
              y="-1"
              fill="#f43f5e"
              fontSize="9"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="bold"
            >
              tcrit = {tCrit.toFixed(3)}
            </text>
          </g>

          {/* Observed t-Statistic Line & Marker (tStat) */}
          <line
            x1={xObs}
            y1={paddingTop + 25}
            x2={xObs}
            y2={baselineY}
            stroke={isSignificant ? 'var(--turf-accent)' : '#f59e0b'}
            strokeWidth="2.5"
          />
          <circle
            cx={xObs}
            cy={pdfToY(studentTPdf(tStat, df))}
            r="6"
            fill={isSignificant ? 'var(--turf-accent)' : '#f59e0b'}
            stroke="#ffffff"
            strokeWidth="2"
            style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }}
          />

          {/* Observed t badge */}
          <g transform={`translate(${xObs}, ${paddingTop + 32})`}>
            <rect
              x="-48"
              y="-14"
              width="96"
              height="18"
              rx="4"
              fill="var(--surface-card)"
              stroke={isSignificant ? 'var(--turf-accent)' : '#f59e0b'}
              strokeWidth="1.5"
            />
            <text
              textAnchor="middle"
              y="-1"
              fill={isSignificant ? 'var(--turf-accent)' : '#f59e0b'}
              fontSize="9"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="bold"
            >
              tobs = {tStat.toFixed(3)}
            </text>
          </g>
        </svg>
      </div>

      {/* Educational Footer */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text-muted)] pt-3 border-t border-[var(--surface-border)]">
        <div>
          <strong className="text-[var(--text-primary)]">Decision Rule: </strong>
          {tStat > tCrit ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              t<sub>obs</sub> ({tStat.toFixed(2)}) &gt; t<sub>crit</sub> ({tCrit.toFixed(2)}) &rarr; In rejection region. Reject H₀.
            </span>
          ) : (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              t<sub>obs</sub> ({tStat.toFixed(2)}) &le; t<sub>crit</sub> ({tCrit.toFixed(2)}) &rarr; Outside rejection region. Fail to reject H₀.
            </span>
          )}
        </div>
        <div className="sm:text-right font-mono text-[11px]">
          Dynamic Welch-Satterthwaite df: <span className="text-[var(--text-primary)] font-bold">{df.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
