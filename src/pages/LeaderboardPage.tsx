import React, { useState, useMemo } from 'react';
import type { SeasonData } from '../types/stats';
import { FranchiseBadge } from '../components/FranchiseBadge';
import { Award, ArrowUpDown, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface LeaderboardPageProps {
  seasonData: SeasonData;
  onSelectStadium: (stadiumId: string) => void;
}

type SortKey = 'p-value' | 'mean-diff' | 't-stat' | 'name' | 'effect';

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  seasonData,
  onSelectStadium,
}) => {
  const [sortBy, setSortBy] = useState<SortKey>('p-value');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(key);
      setSortAsc(key === 'p-value' || key === 'name');
    }
  };

  const sortedStadiums = useMemo(() => {
    const list = [...seasonData.stadiums];
    return list.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'p-value':
          comparison = a.stats.pValue - b.stats.pValue;
          break;
        case 'mean-diff':
          comparison = b.stats.meanDiff - a.stats.meanDiff;
          break;
        case 't-stat':
          comparison = b.stats.tStat - a.stats.tStat;
          break;
        case 'effect':
          comparison = b.config.homeEffect - a.config.homeEffect;
          break;
        case 'name':
          comparison = a.config.franchise.localeCompare(b.config.franchise);
          break;
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [seasonData.stadiums, sortBy, sortAsc]);

  const significantCount = seasonData.stadiums.filter((s) => s.stats.isSignificant).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 shadow-[var(--shadow-card)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[var(--floodlight-accent)]" />
            <h2 className="font-scoreboard text-xl sm:text-2xl font-bold uppercase tracking-tight text-[var(--text-primary)]">
              IPL Ground Advantage Leaderboard
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            Stratified Welch's two-sample t-test results across all 10 franchises for Season #{seasonData.seasonId}.
            Currently, <strong className="text-emerald-500 font-bold">{significantCount} of 10 grounds</strong> show a statistically significant scoring edge at α = 0.05.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-xs text-[var(--text-muted)] font-medium">Sort by:</span>
          {(
            [
              { key: 'p-value', label: 'p-value' },
              { key: 'mean-diff', label: 'Mean Diff' },
              { key: 't-stat', label: 't-Score' },
              { key: 'effect', label: 'True Effect' },
              { key: 'name', label: 'Team' },
            ] as const
          ).map((item) => {
            const isActive = sortBy === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleSort(item.key)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all ${
                  isActive
                    ? 'bg-[var(--turf-accent)] text-white border-[var(--turf-accent)] shadow-xs'
                    : 'bg-[var(--surface-card-subtle)] text-[var(--text-secondary)] border-[var(--surface-border)] hover:border-[var(--surface-border-strong)]'
                }`}
              >
                <span>{item.label}</span>
                {isActive && <ArrowUpDown className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 10-Card Leaderboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedStadiums.map((stadium, index) => {
          const { config, stats } = stadium;
          const isSig = stats.isSignificant;
          // Calculate percentage for visual p-value bar (0 to 0.5 range mapped to 0-100%)
          // If p < 0.05, bar is very narrow or highlighted in green
          const pBarWidth = Math.min(100, Math.max(4, (stats.pValue / 0.25) * 100));

          return (
            <div
              key={config.id}
              onClick={() => onSelectStadium(config.id)}
              className="group bg-[var(--surface-card)] border border-[var(--surface-border)] hover:border-[var(--turf-accent)] rounded-2xl p-5 shadow-[var(--shadow-card)] hover:shadow-lg transition-all cursor-pointer relative flex flex-col justify-between"
            >
              {/* Card Header: Badge, Franchise & Rank */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FranchiseBadge type={config.badgeType} size={36} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
                          #{index + 1}
                        </span>
                        <h3 className="font-scoreboard text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--turf-accent)] transition-colors">
                          {config.franchise}
                        </h3>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] truncate max-w-[200px]">
                        {config.venue}
                      </div>
                    </div>
                  </div>

                  {/* Significant / Inconclusive Pill */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 ${
                      isSig
                        ? 'bg-[var(--verdict-sig-bg)] text-[var(--verdict-sig-text)] border border-[var(--verdict-sig-border)]'
                        : 'bg-[var(--verdict-insig-bg)] text-[var(--verdict-insig-text)] border border-[var(--verdict-insig-border)]'
                    }`}
                  >
                    {isSig ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>Sig Edge</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>Inconclusive</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Score Stats Row */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[var(--surface-border)]">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                      Mean Diff
                    </span>
                    <div
                      className={`font-scoreboard text-base font-bold ${
                        stats.meanDiff >= 0 ? 'text-[var(--text-primary)]' : 'text-rose-500'
                      }`}
                    >
                      {stats.meanDiff > 0 ? '+' : ''}
                      {stats.meanDiff.toFixed(1)}r
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                      Welch t
                    </span>
                    <div className="font-scoreboard text-base font-bold text-[var(--text-primary)]">
                      {stats.tStat.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                      df
                    </span>
                    <div className="font-scoreboard text-base font-bold text-[var(--text-primary)]">
                      {stats.df.toFixed(1)}
                    </div>
                  </div>
                </div>

                {/* Visual p-Value Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="text-[var(--text-muted)]">
                      p-value: <strong className={isSig ? 'text-emerald-500' : 'text-[var(--text-primary)]'}>
                        {stats.pValue < 0.0001 ? '<0.0001' : stats.pValue.toFixed(4)}
                      </strong>
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      α = 0.05 threshold
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] overflow-hidden relative">
                    {/* Critical threshold line at 0.05 relative to 0.25 max scale = 20% mark */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
                      style={{ left: '20%' }}
                      title="Alpha = 0.05"
                    />
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isSig ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${pBarWidth}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer: Action Prompt */}
              <div className="mt-4 pt-3 border-t border-[var(--surface-border)] flex items-center justify-between text-xs text-[var(--text-muted)] group-hover:text-[var(--turf-accent)]">
                <span>True Ground Bias: {config.homeEffect > 0 ? `+${config.homeEffect}` : config.homeEffect} runs</span>
                <span className="inline-flex items-center gap-1 font-semibold">
                  Inspect Ground
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
