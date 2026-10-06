import React, { useMemo } from 'react';
import type { WelchResult } from '../types/stats';
import { studentTPdf } from '../lib/statsEngine';
import { Info, AlertCircle } from 'lucide-react';

interface HypothesisCurveProps {
  stats: WelchResult;
  stadiumName: string;
}

export const HypothesisCurve: React.FC<HypothesisCurveProps> = ({ stats, stadiumName }) => {
  const { df, tCrit, tStat, isSignificant } = stats;
  const alpha = stats.alpha ?? 0.05;

  const width = 640;
  const height = 240;
  const padding = { top: 30, right: 35, bottom: 40, left: 35 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const baselineY = height - padding.bottom;

  const minT = -3.5;
  const maxT = Math.max(4.5, Math.ceil(tStat + 1.0));

  const tToX = (t: number) => {
    return padding.left + ((t - minT) / (maxT - minT)) * plotWidth;
  };

  const maxPdf = useMemo(() => {
    return studentTPdf(0, Math.max(1, df));
  }, [df]);

  const pdfToY = (pdf: number) => {
    return baselineY - (pdf / (maxPdf * 1.15)) * plotHeight;
  };

  const { curvePath, criticalTailPath } = useMemo(() => {
    const steps = 140;
    const dt = (maxT - minT) / steps;
    const points: [number, number][] = [];

    for (let i = 0; i <= steps; i++) {
      const t = minT + i * dt;
      const pdf = studentTPdf(t, Math.max(1, df));
      points.push([tToX(t), pdfToY(pdf)]);
    }

    let cPath = `M ${points[0][0]},${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      cPath += ` L ${points[i][0]},${points[i][1]}`;
    }

    // Critical Rejection Tail (t >= tCrit)
    const critPoints: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const t = minT + i * dt;
      if (t >= tCrit) {
        const pdf = studentTPdf(t, Math.max(1, df));
        critPoints.push([tToX(t), pdfToY(pdf)]);
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

    return { curvePath: cPath, criticalTailPath: critTail };
  }, [df, minT, maxT, tCrit, baselineY, plotWidth, plotHeight, maxPdf]);

  const tCritX = tToX(tCrit);
  const tStatX = tToX(tStat);
  const tZeroX = tToX(0);

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-5 shadow-[var(--shadow-card)] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--surface-border)]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-scoreboard text-base sm:text-lg font-bold uppercase tracking-wide text-[var(--text-primary)]">
              Hypothesis Decision Curve: Acceptance vs. Rejection Region
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--turf-accent-subtle)] text-[var(--turf-accent)] font-mono font-bold">
              df = {df.toFixed(1)}
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            Right-tailed critical threshold test for {stadiumName}. If calculated t-stat exceeds critical threshold (t &gt; t<sub>crit</sub>), we reject the null hypothesis.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-semibold">
          <span className="px-2.5 py-1 rounded-lg bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] text-[var(--text-secondary)]">
            t<sub>crit</sub> = {tCrit.toFixed(3)}
          </span>
          <span className={`px-2.5 py-1 rounded-lg border font-bold ${
            isSignificant
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
          }`}>
            t<sub>stat</sub> = {tStat.toFixed(3)}
          </span>
        </div>
      </div>

      {/* SVG Curve Plot */}
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
          {/* Grid Baseline */}
          <line
            x1={padding.left}
            y1={baselineY}
            x2={width - padding.right}
            y2={baselineY}
            stroke="var(--surface-border-strong)"
            strokeWidth="1.5"
          />

          {/* Shaded Rejection Critical Tail Area (alpha) */}
          {criticalTailPath && (
            <path
              d={criticalTailPath}
              fill="rgba(244, 63, 94, 0.22)"
              stroke="rgba(244, 63, 94, 0.6)"
              strokeWidth="1"
            />
          )}

          {/* Theoretical t-Distribution Curve Line */}
          <path
            d={curvePath}
            fill="none"
            stroke="var(--text-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Zero center dashed line */}
          <line
            x1={tZeroX}
            y1={baselineY}
            x2={tZeroX}
            y2={pdfToY(maxPdf)}
            stroke="var(--surface-border-strong)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text
            x={tZeroX}
            y={baselineY + 16}
            textAnchor="middle"
            fontSize="10"
            fill="var(--text-muted)"
            fontFamily="monospace"
          >
            0 (H₀)
          </text>

          {/* Critical Value Marker (tCrit) */}
          <line
            x1={tCritX}
            y1={baselineY}
            x2={tCritX}
            y2={padding.top}
            stroke="#f43f5e"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
          <text
            x={tCritX}
            y={padding.top - 8}
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fill="#f43f5e"
            fontFamily="monospace"
          >
            t_crit = {tCrit.toFixed(2)} (α={alpha})
          </text>
          <text
            x={tCritX + 12}
            y={baselineY - 14}
            textAnchor="start"
            fontSize="9"
            fill="#f43f5e"
            fontWeight="600"
          >
            Rejection Region ({alpha * 100}%)
          </text>

          {/* Observed t-Statistic Marker (tStat) */}
          <line
            x1={tStatX}
            y1={baselineY}
            x2={tStatX}
            y2={padding.top + 10}
            stroke={isSignificant ? '#10b981' : '#f59e0b'}
            strokeWidth="3"
          />
          <circle
            cx={tStatX}
            cy={padding.top + 10}
            r="4.5"
            fill={isSignificant ? '#10b981' : '#f59e0b'}
          />
          <text
            x={tStatX}
            y={padding.top + 26}
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fill={isSignificant ? '#10b981' : '#f59e0b'}
            fontFamily="monospace"
          >
            Observed t = {tStat.toFixed(2)}
          </text>
        </svg>
      </div>

      {/* Module VII Hypothesis Decision Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
        {/* Null vs Alternate Statement */}
        <div className="p-3 rounded-xl bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)] uppercase text-[11px]">
            <Info className="w-3.5 h-3.5 text-sky-500" />
            <span>Formulation of Hypotheses (Mean Difference)</span>
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] space-y-1 font-mono">
            <div>
              <strong>H₀ (Null):</strong> &mu;<sub>home</sub> &le; &mu;<sub>away</sub> (No home advantage)
            </div>
            <div>
              <strong>H₁ (Alternate):</strong> &mu;<sub>home</sub> &gt; &mu;<sub>away</sub> (Home teams score higher)
            </div>
            <div className="text-[10px] text-[var(--text-muted)] font-sans pt-1">
              Decision: {isSignificant ? 'Reject H₀ because t_observed > t_crit' : 'Fail to reject H₀ because t_observed ≤ t_crit'}
            </div>
          </div>
        </div>

        {/* Type I & Type II Error Analysis */}
        <div className="p-3 rounded-xl bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)] uppercase text-[11px]">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Error Risks (Level of Significance α)</span>
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] space-y-1">
            <div>
              <strong>Type I Error (α = {alpha}):</strong> Risk of false positive (claiming home ground edge when none exists).
            </div>
            <div>
              <strong>Type II Error (β):</strong> Risk of missing a real advantage due to sample variability (mitigated by larger n).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
