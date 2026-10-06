import React, { useMemo, useState } from 'react';
import type { Innings, WelchResult } from '../types/stats';
import { BarChart2 } from 'lucide-react';

interface InningsDistributionChartProps {
  homeInnings: Innings[];
  awayInnings: Innings[];
  stats: WelchResult;
}

export const InningsDistributionChart: React.FC<InningsDistributionChartProps> = ({
  homeInnings,
  awayInnings,
  stats,
}) => {
  const [hoveredBin, setHoveredBin] = useState<string | null>(null);

  // Group into 15-run bins from 100 to 250
  const binEdges = [105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255];

  const bins = useMemo(() => {
    return binEdges.slice(0, -1).map((low, i) => {
      const high = binEdges[i + 1];
      const hMatches = homeInnings.filter((inn) => inn.runs >= low && inn.runs < high);
      const aMatches = awayInnings.filter((inn) => inn.runs >= low && inn.runs < high);
      return {
        label: `${low}-${high}`,
        low,
        high,
        homeCount: hMatches.length,
        awayCount: aMatches.length,
        homeRuns: hMatches.map((m) => m.runs),
        awayRuns: aMatches.map((m) => m.runs),
      };
    });
  }, [homeInnings, awayInnings]);

  const maxCount = Math.max(1, ...bins.map((b) => Math.max(b.homeCount, b.awayCount)));

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-5 shadow-[var(--shadow-card)] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--surface-border)]">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[var(--turf-accent)]" />
            <h3 className="font-scoreboard text-base sm:text-lg font-bold uppercase tracking-wide text-[var(--text-primary)]">
              Score Frequency Distribution (Module I: Histogram & Central Tendency)
            </h3>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            Binned innings totals showing the spread, central tendency, and variance between home and away batting performances.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[var(--home-brand)]" />
            <span className="text-[var(--text-primary)]">
              Home (x̄ = {stats.meanHome.toFixed(1)}, s = {stats.sdHome.toFixed(1)})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[var(--away-brand)]" />
            <span className="text-[var(--text-primary)]">
              Away (x̄ = {stats.meanAway.toFixed(1)}, s = {stats.sdAway.toFixed(1)})
            </span>
          </div>
        </div>
      </div>

      {/* Histogram Binned Bars */}
      <div className="space-y-3 pt-2">
        <div className="grid grid-cols-10 gap-2 h-44 items-end border-b border-[var(--surface-border)] pb-2">
          {bins.map((bin) => {
            const hHeight = (bin.homeCount / maxCount) * 100;
            const aHeight = (bin.awayCount / maxCount) * 100;
            const isHovered = hoveredBin === bin.label;

            return (
              <div
                key={bin.label}
                onMouseEnter={() => setHoveredBin(bin.label)}
                onMouseLeave={() => setHoveredBin(null)}
                className={`relative flex items-end justify-center gap-1 h-full cursor-pointer transition-opacity ${
                  hoveredBin && !isHovered ? 'opacity-40' : 'opacity-100'
                }`}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 bg-black/90 text-white text-[10px] py-1 px-2 rounded-md shadow-md whitespace-nowrap font-mono pointer-events-none">
                    <div>{bin.label} runs</div>
                    <div>Home: {bin.homeCount} inn | Away: {bin.awayCount} inn</div>
                  </div>
                )}

                {/* Home Bar */}
                <div
                  className="w-1/2 rounded-t bg-[var(--home-brand)] transition-all duration-300 relative group"
                  style={{ height: `${Math.max(4, hHeight)}%` }}
                >
                  {bin.homeCount > 0 && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-[var(--home-brand)]">
                      {bin.homeCount}
                    </span>
                  )}
                </div>

                {/* Away Bar */}
                <div
                  className="w-1/2 rounded-t bg-[var(--away-brand)] transition-all duration-300 relative group"
                  style={{ height: `${Math.max(4, aHeight)}%` }}
                >
                  {bin.awayCount > 0 && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-[var(--away-brand)]">
                      {bin.awayCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis Labels */}
        <div className="grid grid-cols-10 gap-2 text-center text-[10px] font-mono text-[var(--text-muted)]">
          {bins.map((bin) => (
            <div key={bin.label} className="truncate">
              {bin.low}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
