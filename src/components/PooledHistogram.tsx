import React, { useMemo } from 'react';
import type { Innings, WelchResult } from '../types/stats';
import { motion } from 'framer-motion';

interface PooledHistogramProps {
  homeInnings: Innings[];
  awayInnings: Innings[];
  stats: WelchResult;
}

export const PooledHistogram: React.FC<PooledHistogramProps> = ({
  homeInnings,
  awayInnings,
  stats,
}) => {
  const svgWidth = 800;
  const svgHeight = 320;
  const paddingX = 50;
  const centerY = svgHeight / 2;
  const minRuns = 90;
  const maxRuns = 260;
  const binWidthRuns = 10;

  const bins = useMemo(() => {
    const numBins = Math.ceil((maxRuns - minRuns) / binWidthRuns);
    const homeCounts = new Array(numBins).fill(0);
    const awayCounts = new Array(numBins).fill(0);

    homeInnings.forEach((inn) => {
      const idx = Math.min(numBins - 1, Math.max(0, Math.floor((inn.runs - minRuns) / binWidthRuns)));
      homeCounts[idx]++;
    });

    awayInnings.forEach((inn) => {
      const idx = Math.min(numBins - 1, Math.max(0, Math.floor((inn.runs - minRuns) / binWidthRuns)));
      awayCounts[idx]++;
    });

    const maxCount = Math.max(...homeCounts, ...awayCounts, 1);

    return homeCounts.map((hCount, i) => {
      const start = minRuns + i * binWidthRuns;
      const end = start + binWidthRuns;
      return {
        binIndex: i,
        start,
        end,
        label: `${start}–${end}`,
        homeCount: hCount,
        awayCount: awayCounts[i],
        maxCount,
      };
    });
  }, [homeInnings, awayInnings]);

  const scoreToX = (score: number) => {
    const clamped = Math.max(minRuns, Math.min(maxRuns, score));
    return paddingX + ((clamped - minRuns) / (maxRuns - minRuns)) * (svgWidth - 2 * paddingX);
  };

  const maxBinHeight = 110; // Max bar height in pixels from center
  const overallMaxCount = Math.max(...bins.map((b) => Math.max(b.homeCount, b.awayCount)), 1);

  const homeMeanX = scoreToX(stats.meanHome);
  const awayMeanX = scoreToX(stats.meanAway);

  const axisTicks = [100, 120, 140, 160, 180, 200, 220, 240];

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-4 sm:p-6 shadow-[var(--shadow-card)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h4 className="font-scoreboard text-base font-bold uppercase tracking-wider text-[var(--text-primary)]">
            League-Wide Mirrored Frequency Histogram
          </h4>
          <p className="text-xs text-[var(--text-muted)]">
            Aggregated distribution across all 10 stadiums (150 home innings vs 150 away innings, 10-run bins)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[var(--home-brand)] shadow-sm" />
            <span className="text-[var(--text-secondary)]">Home Innings (n=150)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[var(--away-brand)] shadow-sm" />
            <span className="text-[var(--text-secondary)]">Away Innings (n=150)</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full min-w-[620px] h-auto select-none"
        >
          {/* Subtle Grid Ticks */}
          {axisTicks.map((tick) => {
            const x = scoreToX(tick);
            return (
              <g key={`p-tick-${tick}`}>
                <line
                  x1={x}
                  y1={20}
                  x2={x}
                  y2={svgHeight - 20}
                  stroke="var(--surface-border)"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={centerY + 4}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="10"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="500"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Central Baseline */}
          <line
            x1={paddingX - 10}
            y1={centerY}
            x2={svgWidth - paddingX + 10}
            y2={centerY}
            stroke="var(--surface-border-strong)"
            strokeWidth="1.5"
          />

          {/* Axis Labels */}
          <text
            x={paddingX - 15}
            y={centerY - 10}
            textAnchor="end"
            fill="var(--home-brand)"
            fontSize="10"
            fontFamily="'Chakra Petch', sans-serif"
            fontWeight="bold"
          >
            ▲ HOME
          </text>
          <text
            x={paddingX - 15}
            y={centerY + 18}
            textAnchor="end"
            fill="var(--away-brand)"
            fontSize="10"
            fontFamily="'Chakra Petch', sans-serif"
            fontWeight="bold"
          >
            ▼ AWAY
          </text>

          {/* Mirrored Histogram Bars */}
          {bins.map((bin) => {
            const x1 = scoreToX(bin.start);
            const x2 = scoreToX(bin.end);
            const barWidth = Math.max(4, x2 - x1 - 3);

            const homeHeight = (bin.homeCount / overallMaxCount) * maxBinHeight;
            const awayHeight = (bin.awayCount / overallMaxCount) * maxBinHeight;

            return (
              <g key={`bin-${bin.binIndex}`}>
                {/* Home Bar (Rising Upward) */}
                {bin.homeCount > 0 && (
                  <motion.rect
                    x={x1 + 1.5}
                    y={centerY - homeHeight}
                    width={barWidth}
                    height={homeHeight}
                    fill="var(--home-brand)"
                    rx="3"
                    initial={{ height: 0, y: centerY }}
                    animate={{ height: homeHeight, y: centerY - homeHeight }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: bin.binIndex * 0.02 }}
                    opacity="0.85"
                  />
                )}
                {bin.homeCount > 2 && (
                  <text
                    x={x1 + barWidth / 2 + 1.5}
                    y={centerY - homeHeight - 4}
                    textAnchor="middle"
                    fill="var(--home-brand)"
                    fontSize="9"
                    fontFamily="'JetBrains Mono', monospace"
                    fontWeight="600"
                  >
                    {bin.homeCount}
                  </text>
                )}

                {/* Away Bar (Extending Downward) */}
                {bin.awayCount > 0 && (
                  <motion.rect
                    x={x1 + 1.5}
                    y={centerY}
                    width={barWidth}
                    height={awayHeight}
                    fill="var(--away-brand)"
                    rx="3"
                    initial={{ height: 0 }}
                    animate={{ height: awayHeight }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: bin.binIndex * 0.02 }}
                    opacity="0.85"
                  />
                )}
                {bin.awayCount > 2 && (
                  <text
                    x={x1 + barWidth / 2 + 1.5}
                    y={centerY + awayHeight + 11}
                    textAnchor="middle"
                    fill="var(--away-brand)"
                    fontSize="9"
                    fontFamily="'JetBrains Mono', monospace"
                    fontWeight="600"
                  >
                    {bin.awayCount}
                  </text>
                )}
              </g>
            );
          })}

          {/* Vertical Mean Lines */}
          <line
            x1={awayMeanX}
            y1={centerY}
            x2={awayMeanX}
            y2={svgHeight - 15}
            stroke="var(--away-brand)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <g transform={`translate(${awayMeanX}, ${svgHeight - 8})`}>
            <rect
              x="-40"
              y="-12"
              width="80"
              height="16"
              rx="4"
              fill="var(--surface-card)"
              stroke="var(--away-brand)"
              strokeWidth="1"
            />
            <text
              textAnchor="middle"
              y="0"
              fill="var(--away-brand)"
              fontSize="9"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="bold"
            >
              Away: {stats.meanAway.toFixed(1)}
            </text>
          </g>

          <line
            x1={homeMeanX}
            y1={15}
            x2={homeMeanX}
            y2={centerY}
            stroke="var(--home-brand)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <g transform={`translate(${homeMeanX}, 18)`}>
            <rect
              x="-40"
              y="-12"
              width="80"
              height="16"
              rx="4"
              fill="var(--surface-card)"
              stroke="var(--home-brand)"
              strokeWidth="1"
            />
            <text
              textAnchor="middle"
              y="0"
              fill="var(--home-brand)"
              fontSize="9"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="bold"
            >
              Home: {stats.meanHome.toFixed(1)}
            </text>
          </g>
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-2 border-t border-[var(--surface-border)]">
        <span>Pooled sample size: n = 300 innings (150 home vs 150 away)</span>
        <span className="font-mono">
          League Effect: &Delta;x̄ = {(stats.meanHome - stats.meanAway) > 0 ? '+' : ''}
          {(stats.meanHome - stats.meanAway).toFixed(1)} runs
        </span>
      </div>
    </div>
  );
};
