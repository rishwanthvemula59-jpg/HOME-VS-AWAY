import React from 'react';
import type { WelchResult } from '../types/stats';
import { AlertCircle, ShieldAlert, TrendingUp, Info } from 'lucide-react';

interface RiskCalloutProps {
  stats: WelchResult;
  stadiumName: string;
  franchise: string;
}

export const RiskCallout: React.FC<RiskCalloutProps> = ({
  stats,
  stadiumName,
  franchise,
}) => {
  const { isSignificant, meanDiff, pValue, nHome } = stats;

  // Detect likely Type II risk scenario: positive practical difference (> 3.0 runs) but p >= 0.05
  const isLikelyTypeII = !isSignificant && meanDiff > 3.0;

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-4 sm:p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 pb-3 border-b border-[var(--surface-border)]">
        <ShieldAlert className="w-5 h-5 text-[var(--floodlight-accent)]" />
        <h4 className="font-scoreboard text-base font-bold uppercase tracking-wider text-[var(--text-primary)]">
          Hypothesis Error Analysis & Franchise Risk Matrix
        </h4>
      </div>

      {/* Dynamic Ground Specific Risk Callout */}
      <div className="mt-4 p-4 rounded-xl border transition-colors bg-[var(--surface-card-subtle)] border-[var(--surface-border)]">
        <div className="flex items-start gap-3">
          {isSignificant ? (
            <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : isLikelyTypeII ? (
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
          )}

          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-[var(--text-primary)]">
              {isSignificant
                ? `Current Verdict: Significant Advantage Found (${franchise})`
                : isLikelyTypeII
                ? `High Type II Error Risk Flagged (${franchise})`
                : `Null Retained: True Home Parity (${franchise})`}
            </div>

            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              {isSignificant ? (
                <>
                  With <strong className="text-[var(--text-primary)]">p = {pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(4)}</strong>, we reject H₀. 
                  The primary statistical risk here is a <strong>Type I Error (False Positive)</strong> — concluding that {venueShort(stadiumName)} provides a genuine home boost when variation was random noise. Under our strict &alpha; = 0.05 threshold, there is at most a <strong>5% probability</strong> of committing this error.
                </>
              ) : isLikelyTypeII ? (
                <>
                  Notice that the home team averaged <strong className="text-amber-500">+{meanDiff.toFixed(1)} runs</strong> over away teams, yet the test yielded <strong className="text-[var(--text-primary)]">p = {pValue.toFixed(3)}</strong> (fail to reject). 
                  This is a classic <strong>Type II Error (False Negative)</strong> risk: an authentic tactical advantage exists, but due to high innings variance (T20 match volatility) and sample size (n = {nHome}), the test lacked statistical power to reach p &lt; 0.05.
                </>
              ) : (
                <>
                  With a small effect (&Delta;x̄ = {meanDiff > 0 ? '+' : ''}{meanDiff.toFixed(1)} runs) and p = {pValue.toFixed(3)}, the data shows no discernible home scoring edge. The franchise should treat conditions as neutral and avoid distorting team selection based on perceived home bias.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Two-Column Explainer for Type I and Type II Errors in Sports Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
        {/* Type I Error Box */}
        <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5">
          <div className="flex items-center justify-between font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
            <span>Type I Error (&alpha; = 0.05)</span>
            <span>False Positive</span>
          </div>
          <p className="mt-1.5 text-[var(--text-secondary)] leading-relaxed">
            <strong>Statistical Definition:</strong> Rejecting H₀ when H₀ is actually true (declaring a ground advantage that doesn't exist).
          </p>
          <div className="mt-2 pt-2 border-t border-rose-500/15 text-[var(--text-muted)]">
            <strong className="text-rose-600 dark:text-rose-400">Franchise Cost:</strong> Overpaying in mega-auctions for specialized spin/pace squads tailored to a "mirage" home advantage; aggressive batting-first toss miscalculations; wasted pitch re-laying budgets.
          </div>
        </div>

        {/* Type II Error Box */}
        <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center justify-between font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
            <span>Type II Error (&beta;)</span>
            <span>False Negative</span>
          </div>
          <p className="mt-1.5 text-[var(--text-secondary)] leading-relaxed">
            <strong>Statistical Definition:</strong> Failing to reject H₀ when Hₐ is true (missing a genuine home ground advantage).
          </p>
          <div className="mt-2 pt-2 border-t border-amber-500/15 text-[var(--text-muted)]">
            <strong className="text-amber-600 dark:text-amber-400">Franchise Cost:</strong> Abandoning a real tactical edge (e.g. dimensions, boundary lengths, pitch wear); miscalibrating pre-game win probability models; yielding strategic home ground mastery to visiting teams.
          </div>
        </div>
      </div>
    </div>
  );
};

function venueShort(name: string) {
  return name.split(',')[0].replace('Stadium', 'Ground');
}
