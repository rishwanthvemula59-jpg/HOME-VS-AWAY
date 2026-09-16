import React, { useMemo, useState } from 'react';
import type { Innings, WelchResult } from '../types/stats';
import { motion, AnimatePresence } from 'framer-motion';

interface PopulationPyramidProps {
  homeInnings: Innings[];
  awayInnings: Innings[];
  stats: WelchResult;
  stadiumName?: string;
}

interface DotPosition {
  innings: Innings;
  x: number; // in pixels or percentage
  y: number; // in pixels
  score: number;
  tier: number;
}

export const PopulationPyramid: React.FC<PopulationPyramidProps> = ({
  homeInnings,
  awayInnings,
  stats,
}) => {
  const [hoveredDot, setHoveredDot] = useState<DotPosition | null>(null);

  // SVG coordinate constants
  const svgWidth = 800;
  const svgHeight = 320;
  const paddingX = 50;
  const centerY = svgHeight / 2;
  const minRuns = 90;
  const maxRuns = 260;

  const scoreToX = (score: number) => {
    const clamped = Math.max(minRuns, Math.min(maxRuns, score));
    return paddingX + ((clamped - minRuns) / (maxRuns - minRuns)) * (svgWidth - 2 * paddingX);
  };

  // Bin/stack dots within proximity (e.g. within 3 runs) so they stack neatly like coins
  const homeDots = useMemo(() => {
    const sorted = [...homeInnings].sort((a, b) => a.runs - b.runs);
    const bins: { [binKey: number]: number } = {};
    const dotRadius = 9;
    const binSize = 4; // group scores within 4 runs for stacking

    return sorted.map((inn) => {
      const binKey = Math.round(inn.runs / binSize);
      const tier = bins[binKey] || 0;
      bins[binKey] = tier + 1;

      const x = scoreToX(inn.runs);
      // Stack upward from baseline
      const y = centerY - 24 - tier * (dotRadius * 2 + 4);

      return {
        innings: inn,
        x,
        y,
        score: inn.runs,
        tier,
      };
    });
  }, [homeInnings, centerY]);

  const awayDots = useMemo(() => {
    const sorted = [...awayInnings].sort((a, b) => a.runs - b.runs);
    const bins: { [binKey: number]: number } = {};
    const dotRadius = 9;
    const binSize = 4;

    return sorted.map((inn) => {
      const binKey = Math.round(inn.runs / binSize);
      const tier = bins[binKey] || 0;
      bins[binKey] = tier + 1;

      const x = scoreToX(inn.runs);
      // Stack downward from baseline
      const y = centerY + 24 + tier * (dotRadius * 2 + 4);

      return {
        innings: inn,
        x,
        y,
        score: inn.runs,
        tier,
      };
    });
  }, [awayInnings, centerY]);

  const homeMeanX = scoreToX(stats.meanHome);
  const awayMeanX = scoreToX(stats.meanAway);

  // Run markers for axis
  const axisTicks = [100, 120, 140, 160, 180, 200, 220, 240];

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-4 sm:p-6 shadow-[var(--shadow-card)] relative">
      {/* Title & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h4 className="font-scoreboard text-base font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Distribution Pyramid: Home vs Away Innings
          </h4>
          <p className="text-xs text-[var(--text-muted)]">
            Mirrored dot plot (15 home scores stacked upward vs 15 away scores stacked downward)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[var(--home-brand)] shadow-sm" />
            <span className="text-[var(--text-secondary)]">Home Batting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[var(--away-brand)] shadow-sm" />
            <span className="text-[var(--text-secondary)]">Away Batting</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="w-full overflow-x-auto relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full min-w-[620px] h-auto select-none"
        >
          {/* Subtle Grid Ticks */}
          {axisTicks.map((tick) => {
            const x = scoreToX(tick);
            return (
              <g key={`tick-${tick}`}>
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

          {/* Central Baseline (Runs Axis) */}
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
          <text
            x={svgWidth - paddingX + 18}
            y={centerY + 4}
            textAnchor="start"
            fill="var(--text-muted)"
            fontSize="10"
            fontFamily="'JetBrains Mono', monospace"
          >
            Runs
          </text>

          {/* Vertical Mean Lines */}
          {/* Away Mean Line */}
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
              x="-35"
              y="-12"
              width="70"
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

          {/* Home Mean Line */}
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
              x="-35"
              y="-12"
              width="70"
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

          {/* Home Innings Dots (Stacked Above Axis) */}
          {homeDots.map((dot, index) => {
            const isHovered = hoveredDot?.innings.id === dot.innings.id;
            return (
              <motion.g
                key={dot.innings.id}
                initial={{ y: centerY, opacity: 0, scale: 0.3 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.035,
                  type: 'spring',
                  stiffness: 280,
                  damping: 18,
                }}
                onMouseEnter={() => setHoveredDot(dot)}
                onMouseLeave={() => setHoveredDot(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={isHovered ? 11 : 8.5}
                  fill="var(--home-brand)"
                  stroke={isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'}
                  strokeWidth={isHovered ? 2.5 : 1}
                  className="transition-all duration-150"
                  style={{ filter: isHovered ? 'drop-shadow(0 2px 8px rgba(2,132,199,0.5))' : 'none' }}
                />
                <text
                  x={dot.x}
                  y={dot.y + 3}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="7.5"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {dot.score}
                </text>
              </motion.g>
            );
          })}

          {/* Away Innings Dots (Stacked Below Axis) */}
          {awayDots.map((dot, index) => {
            const isHovered = hoveredDot?.innings.id === dot.innings.id;
            return (
              <motion.g
                key={dot.innings.id}
                initial={{ y: centerY, opacity: 0, scale: 0.3 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.035,
                  type: 'spring',
                  stiffness: 280,
                  damping: 18,
                }}
                onMouseEnter={() => setHoveredDot(dot)}
                onMouseLeave={() => setHoveredDot(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={isHovered ? 11 : 8.5}
                  fill="var(--away-brand)"
                  stroke={isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'}
                  strokeWidth={isHovered ? 2.5 : 1}
                  className="transition-all duration-150"
                  style={{ filter: isHovered ? 'drop-shadow(0 2px 8px rgba(217,119,6,0.5))' : 'none' }}
                />
                <text
                  x={dot.x}
                  y={dot.y + 3}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="7.5"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {dot.score}
                </text>
              </motion.g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        <AnimatePresence>
          {hoveredDot && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-2 right-4 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-xl px-3 py-2 shadow-lg text-xs pointer-events-none z-10"
            >
              <div className="flex items-center gap-1.5 font-semibold">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      hoveredDot.innings.type === 'home'
                        ? 'var(--home-brand)'
                        : 'var(--away-brand)',
                  }}
                />
                <span>
                  Match #{hoveredDot.innings.matchIndex} ({hoveredDot.innings.type === 'home' ? 'Home' : 'Away'})
                </span>
              </div>
              <div className="text-[var(--text-muted)] mt-0.5">
                Score: <strong className="text-[var(--text-primary)]">{hoveredDot.score} runs</strong>
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">
                Diff from {hoveredDot.innings.type} mean:{' '}
                {hoveredDot.score -
                  (hoveredDot.innings.type === 'home' ? stats.meanHome : stats.meanAway) >
                0
                  ? '+'
                  : ''}
                {(
                  hoveredDot.score -
                  (hoveredDot.innings.type === 'home' ? stats.meanHome : stats.meanAway)
                ).toFixed(1)}{' '}
                runs
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Note */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-2 border-t border-[var(--surface-border)]">
        <span>Staggered dot physics indicates individual simulated 20-over matches</span>
        <span className="font-mono">
          Observed Spread: &Delta;x̄ = {(stats.meanHome - stats.meanAway) > 0 ? '+' : ''}
          {(stats.meanHome - stats.meanAway).toFixed(1)} runs
        </span>
      </div>
    </div>
  );
};
