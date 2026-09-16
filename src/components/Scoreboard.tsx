import React from 'react';
import type { WelchResult } from '../types/stats';
import { StatNumber } from './StatNumber';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface ScoreboardProps {
  stats: WelchResult;
  stadiumName?: string;
  isPooled?: boolean;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ stats, stadiumName, isPooled = false }) => {
  const isSig = stats.isSignificant;

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-4 sm:p-6 shadow-[var(--shadow-card)] transition-all">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--surface-border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[var(--turf-accent)] animate-pulse" />
            <h3 className="font-scoreboard text-base sm:text-lg font-bold tracking-wide uppercase text-[var(--text-primary)]">
              {isPooled ? 'League-Wide Pooled Welch Test (300 Innings)' : `${stadiumName || 'Stadium'} Hypothesis Scoreboard`}
            </h3>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Right-tailed Welch's two-sample t-test (H₀: &mu;<sub>home</sub> &le; &mu;<sub>away</sub>, &alpha; = 0.05)
          </p>
        </div>

        {/* Verdict Pill */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs sm:text-sm font-semibold tracking-wide uppercase transition-colors shrink-0 ${
            isSig
              ? 'bg-[var(--verdict-sig-bg)] text-[var(--verdict-sig-text)] border-[var(--verdict-sig-border)]'
              : 'bg-[var(--verdict-insig-bg)] text-[var(--verdict-insig-text)] border-[var(--verdict-insig-border)]'
          }`}
        >
          {isSig ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Reject H₀ (Significant Edge)</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Fail to Reject H₀ (Inconclusive)</span>
            </>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 pt-4">
        {/* Home Mean */}
        <div className="bg-[var(--surface-card-subtle)] p-3.5 rounded-xl border border-[var(--surface-border)]">
          <div className="flex items-center justify-between text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
            <span>Home Mean (x̄<sub>H</sub>)</span>
            <span className="w-2 h-2 rounded-full bg-[var(--home-brand)]" />
          </div>
          <div className="mt-1 text-2xl sm:text-3xl font-bold font-scoreboard text-[var(--home-brand)]">
            <StatNumber value={stats.meanHome} decimals={1} />
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5 flex items-center justify-between">
            <span>SD: {stats.sdHome.toFixed(1)}</span>
            <span>n = {stats.nHome}</span>
          </div>
        </div>

        {/* Away Mean */}
        <div className="bg-[var(--surface-card-subtle)] p-3.5 rounded-xl border border-[var(--surface-border)]">
          <div className="flex items-center justify-between text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
            <span>Away Mean (x̄<sub>A</sub>)</span>
            <span className="w-2 h-2 rounded-full bg-[var(--away-brand)]" />
          </div>
          <div className="mt-1 text-2xl sm:text-3xl font-bold font-scoreboard text-[var(--away-brand)]">
            <StatNumber value={stats.meanAway} decimals={1} />
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5 flex items-center justify-between">
            <span>SD: {stats.sdAway.toFixed(1)}</span>
            <span>n = {stats.nAway}</span>
          </div>
        </div>

        {/* Mean Difference */}
        <div className="bg-[var(--surface-card-subtle)] p-3.5 rounded-xl border border-[var(--surface-border)]">
          <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Effect (&Delta;x̄)
          </div>
          <div
            className={`mt-1 text-2xl sm:text-3xl font-bold font-scoreboard ${
              stats.meanDiff >= 0 ? 'text-[var(--text-primary)]' : 'text-rose-500'
            }`}
          >
            <StatNumber
              value={stats.meanDiff}
              decimals={1}
              prefix={stats.meanDiff > 0 ? '+' : ''}
              suffix=" runs"
            />
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
            SE: &plusmn;{stats.standardError.toFixed(2)}
          </div>
        </div>

        {/* Welch's t-statistic */}
        <div className="bg-[var(--surface-card-subtle)] p-3.5 rounded-xl border border-[var(--surface-border)]">
          <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider flex items-center justify-between">
            <span>Welch t-Stat</span>
            <span className="text-[10px] text-[var(--text-muted)]">crit: {stats.tCrit.toFixed(2)}</span>
          </div>
          <div
            className={`mt-1 text-2xl sm:text-3xl font-bold font-scoreboard ${
              stats.tStat >= stats.tCrit ? 'text-emerald-500' : 'text-[var(--text-primary)]'
            }`}
          >
            <StatNumber value={stats.tStat} decimals={3} />
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {stats.tStat >= stats.tCrit ? 'In rejection region' : 'Below threshold'}
          </div>
        </div>

        {/* Welch-Satterthwaite df */}
        <div className="bg-[var(--surface-card-subtle)] p-3.5 rounded-xl border border-[var(--surface-border)]">
          <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Degrees of Freedom (df)
          </div>
          <div className="mt-1 text-2xl sm:text-3xl font-bold font-scoreboard text-[var(--text-primary)]">
            <StatNumber value={stats.df} decimals={2} />
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
            Welch–Satterthwaite
          </div>
        </div>

        {/* p-value */}
        <div
          className={`p-3.5 rounded-xl border transition-colors ${
            isSig
              ? 'bg-[var(--verdict-sig-bg)]/40 border-[var(--verdict-sig-border)]'
              : 'bg-[var(--surface-card-subtle)] border-[var(--surface-border)]'
          }`}
        >
          <div className="text-[11px] font-medium uppercase tracking-wider flex items-center justify-between">
            <span className={isSig ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-[var(--text-muted)]'}>
              p-Value (Right Tail)
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">&alpha; = 0.05</span>
          </div>
          <div
            className={`mt-1 text-2xl sm:text-3xl font-bold font-scoreboard ${
              isSig ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {stats.pValue < 0.0001 ? (
              '&lt; 0.0001'
            ) : (
              <StatNumber value={stats.pValue} decimals={4} />
            )}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {isSig ? 'p < 0.05 (Significant)' : 'p ≥ 0.05 (Not Sig)'}
          </div>
        </div>
      </div>
    </div>
  );
};
