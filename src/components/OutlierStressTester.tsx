import React, { useState, useMemo } from 'react';
import type { Innings, WelchResult } from '../types/stats';
import { runWelchTTest } from '../lib/statsEngine';
import { 
  AlertTriangle, 
  Flame, 
  CloudRain, 
  RotateCcw, 
  TrendingDown, 
  HelpCircle,
  Sliders,
  Sparkles
} from 'lucide-react';

interface OutlierScenario {
  id: string;
  label: string;
  description: string;
  homeRuns: number;
  awayRuns: number;
  type: 'home-boost' | 'home-collapse' | 'away-boost';
}

const OUTLIER_PRESETS: OutlierScenario[] = [
  {
    id: 'record-blitz',
    label: 'IPL Record Blitz (287 Runs)',
    description: 'Extreme home team batting explosion (e.g. SRH 287/3 vs RCB).',
    homeRuns: 287,
    awayRuns: 165,
    type: 'home-boost',
  },
  {
    id: 'historic-collapse',
    label: 'Infamous 49 All-Out Collapse',
    description: 'Catastrophic home batting failure (e.g. RCB 49 all-out vs KKR).',
    homeRuns: 49,
    awayRuns: 172,
    type: 'home-collapse',
  },
  {
    id: 'away-surge',
    label: 'Visiting Team Blitz (272 Runs)',
    description: 'Visiting team posts astronomical total at host ground (e.g. KKR 272/7).',
    homeRuns: 160,
    awayRuns: 272,
    type: 'away-boost',
  },
];

interface OutlierStressTesterProps {
  homeInnings: Innings[];
  awayInnings: Innings[];
  activeStats: WelchResult;
  alpha: number;
  onApplyOutlier: (outlierHome: number | null, outlierAway: number | null) => void;
  activeOutlier: { home: number; away: number; label: string } | null;
}

export const OutlierStressTester: React.FC<OutlierStressTesterProps> = ({
  homeInnings,
  awayInnings,
  activeStats,
  alpha,
  onApplyOutlier,
  activeOutlier,
}) => {
  const [customHome, setCustomHome] = useState<number>(275);
  const [customAway, setCustomAway] = useState<number>(140);

  // Baseline clean scores (without any temporary injected outlier)
  const baselineScores = useMemo(() => {
    // If activeOutlier is currently attached, the last innings might be the outlier
    const cleanHome = activeOutlier ? homeInnings.slice(0, -1).map((i) => i.runs) : homeInnings.map((i) => i.runs);
    const cleanAway = activeOutlier ? awayInnings.slice(0, -1).map((i) => i.runs) : awayInnings.map((i) => i.runs);
    return {
      home: cleanHome,
      away: cleanAway,
      stats: runWelchTTest(cleanHome, cleanAway, alpha),
    };
  }, [homeInnings, awayInnings, activeOutlier, alpha]);

  const baselineStats = baselineScores.stats;
  const stressedStats = activeStats;

  // Compute Before vs After Deltas
  const deltaMeanDiff = stressedStats.meanDiff - baselineStats.meanDiff;
  const deltaSDHome = stressedStats.sdHome - baselineStats.sdHome;
  const deltaSDAway = stressedStats.sdAway - baselineStats.sdAway;
  const deltaTStat = stressedStats.tStat - baselineStats.tStat;
  const deltaPValue = stressedStats.pValue - baselineStats.pValue;

  const statusFlipped = baselineStats.isSignificant !== stressedStats.isSignificant;

  const handleInjectPreset = (preset: OutlierScenario) => {
    onApplyOutlier(preset.homeRuns, preset.awayRuns);
  };

  const handleInjectCustom = () => {
    onApplyOutlier(customHome, customAway);
  };

  const handleClearOutlier = () => {
    onApplyOutlier(null, null);
  };

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-5 shadow-[var(--shadow-card)] space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--surface-border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-scoreboard text-base sm:text-lg font-bold tracking-wide uppercase text-[var(--text-primary)]">
                Robustness & Outlier Stress-Tester (Module I & VII)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold">
                Sensitivity Lab
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Inject historic real-world cricket outliers to stress-test the fragility of Welch's t-test and observe variance inflation.
            </p>
          </div>
        </div>

        {activeOutlier && (
          <button
            onClick={handleClearOutlier}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider hover:bg-rose-500/20 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Remove Outlier & Restore Baseline</span>
          </button>
        )}
      </div>

      {/* Preset Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {OUTLIER_PRESETS.map((preset) => {
          const isActive =
            activeOutlier &&
            activeOutlier.home === preset.homeRuns &&
            activeOutlier.away === preset.awayRuns;

          return (
            <button
              key={preset.id}
              onClick={() => handleInjectPreset(preset)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500 shadow-sm ring-1 ring-amber-500'
                  : 'bg-[var(--surface-card-subtle)] border-[var(--surface-border)] hover:border-[var(--turf-accent)]/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-scoreboard text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  {preset.type === 'home-boost' && <Flame className="w-3.5 h-3.5 text-rose-500" />}
                  {preset.type === 'home-collapse' && <CloudRain className="w-3.5 h-3.5 text-sky-500" />}
                  {preset.type === 'away-boost' && <TrendingDown className="w-3.5 h-3.5 text-purple-500" />}
                  {preset.label}
                </span>
                <span className="font-mono text-[10px] font-bold text-[var(--text-muted)]">
                  {preset.homeRuns}v{preset.awayRuns}
                </span>
              </div>
              <p className="text-[10.5px] text-[var(--text-secondary)] line-clamp-2">
                {preset.description}
              </p>
              {isActive && (
                <span className="mt-2 inline-flex items-center gap-1 text-[9.5px] font-bold uppercase text-amber-600 dark:text-amber-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  Currently Injected
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Outlier Sliders (Toggleable) */}
      <div className="p-3.5 rounded-xl bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[var(--turf-accent)]" />
            Custom Outlier Match Creator
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">
            Test any arbitrary outlier score
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-[var(--text-muted)]">Home Score:</span>
              <span className="font-mono font-bold text-[var(--home-brand)]">{customHome} runs</span>
            </div>
            <input
              type="range"
              min="40"
              max="300"
              value={customHome}
              onChange={(e) => setCustomHome(Number(e.target.value))}
              className="w-full h-1.5 bg-[var(--surface-border)] rounded-lg appearance-none cursor-pointer accent-[var(--home-brand)]"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-[var(--text-muted)]">Away Score:</span>
              <span className="font-mono font-bold text-[var(--away-brand)]">{customAway} runs</span>
            </div>
            <input
              type="range"
              min="40"
              max="300"
              value={customAway}
              onChange={(e) => setCustomAway(Number(e.target.value))}
              className="w-full h-1.5 bg-[var(--surface-border)] rounded-lg appearance-none cursor-pointer accent-[var(--away-brand)]"
            />
          </div>

          <button
            onClick={handleInjectCustom}
            className="w-full py-2 rounded-xl bg-[var(--turf-accent)] text-white text-xs font-bold uppercase tracking-wider hover:opacity-95 transition-all shadow-sm"
          >
            Inject Custom Match ({customHome}v{customAway})
          </button>
        </div>
      </div>

      {/* Before vs After Stress-Test Comparison Table */}
      {activeOutlier && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Before vs After Stress-Testing Matrix (1-Match Impact)
            </h4>
            {statusFlipped ? (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold uppercase">
                ⚠️ Hypothesis Decision Flipped!
              </span>
            ) : (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                ✅ Decision Resilient
              </span>
            )}
          </div>

          <div className="overflow-x-auto border border-[var(--surface-border)] rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[var(--surface-card-subtle)] text-[var(--text-muted)] font-mono uppercase tracking-wider border-b border-[var(--surface-border)]">
                <tr>
                  <th className="py-2.5 px-3">Statistical Metric</th>
                  <th className="py-2.5 px-3">Clean Baseline</th>
                  <th className="py-2.5 px-3">With 1 Outlier</th>
                  <th className="py-2.5 px-3">Delta Impact (Δ)</th>
                  <th className="py-2.5 px-3">Academic Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--surface-border)] font-mono text-[var(--text-secondary)]">
                {/* 1. Mean Difference */}
                <tr>
                  <td className="py-2.5 px-3 font-sans font-bold text-[var(--text-primary)]">
                    Mean Edge (x̄<sub>H</sub> - x̄<sub>A</sub>)
                  </td>
                  <td className="py-2.5 px-3">
                    {baselineStats.meanDiff > 0 ? `+${baselineStats.meanDiff.toFixed(1)}` : baselineStats.meanDiff.toFixed(1)}r
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[var(--text-primary)]">
                    {stressedStats.meanDiff > 0 ? `+${stressedStats.meanDiff.toFixed(1)}` : stressedStats.meanDiff.toFixed(1)}r
                  </td>
                  <td className={`py-2.5 px-3 font-bold ${deltaMeanDiff > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {deltaMeanDiff > 0 ? `+${deltaMeanDiff.toFixed(1)}` : deltaMeanDiff.toFixed(1)}r
                  </td>
                  <td className="py-2.5 px-3 font-sans text-[11px] text-[var(--text-muted)]">
                    Arithmetic mean shifts noticeably with n={baselineStats.nHome}
                  </td>
                </tr>

                {/* 2. Standard Deviation Home */}
                <tr>
                  <td className="py-2.5 px-3 font-sans font-bold text-[var(--text-primary)]">
                    Home Variance / SD (s<sub>H</sub>)
                  </td>
                  <td className="py-2.5 px-3">{baselineStats.sdHome.toFixed(1)}r</td>
                  <td className="py-2.5 px-3 font-bold text-[var(--home-brand)]">{stressedStats.sdHome.toFixed(1)}r</td>
                  <td className="py-2.5 px-3 font-bold text-amber-500">
                    {deltaSDHome > 0 ? `+${deltaSDHome.toFixed(1)}` : deltaSDHome.toFixed(1)}r
                  </td>
                  <td className="py-2.5 px-3 font-sans text-[11px] text-[var(--text-muted)]">
                    Variance inflation due to squared deviations (x - x̄)²
                  </td>
                </tr>

                {/* 3. Standard Deviation Away */}
                <tr>
                  <td className="py-2.5 px-3 font-sans font-bold text-[var(--text-primary)]">
                    Away Variance / SD (s<sub>A</sub>)
                  </td>
                  <td className="py-2.5 px-3">{baselineStats.sdAway.toFixed(1)}r</td>
                  <td className="py-2.5 px-3 font-bold text-[var(--away-brand)]">{stressedStats.sdAway.toFixed(1)}r</td>
                  <td className="py-2.5 px-3 font-bold text-amber-500">
                    {deltaSDAway > 0 ? `+${deltaSDAway.toFixed(1)}` : deltaSDAway.toFixed(1)}r
                  </td>
                  <td className="py-2.5 px-3 font-sans text-[11px] text-[var(--text-muted)]">
                    Away innings variance shift
                  </td>
                </tr>

                {/* 3. Welch t-Statistic */}
                <tr>
                  <td className="py-2.5 px-3 font-sans font-bold text-[var(--text-primary)]">
                    Welch t-Stat (t<sub>obs</sub>)
                  </td>
                  <td className="py-2.5 px-3">{baselineStats.tStat.toFixed(3)}</td>
                  <td className="py-2.5 px-3 font-bold text-sky-500">{stressedStats.tStat.toFixed(3)}</td>
                  <td className={`py-2.5 px-3 font-bold ${deltaTStat > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {deltaTStat > 0 ? `+${deltaTStat.toFixed(3)}` : deltaTStat.toFixed(3)}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-[11px] text-[var(--text-muted)]">
                    t_crit = {stressedStats.tCrit.toFixed(3)}
                  </td>
                </tr>

                {/* 4. p-Value */}
                <tr>
                  <td className="py-2.5 px-3 font-sans font-bold text-[var(--text-primary)]">
                    p-Value (P(T &gt; t))
                  </td>
                  <td className="py-2.5 px-3">{baselineStats.pValue < 0.001 ? '< 0.001' : baselineStats.pValue.toFixed(4)}</td>
                  <td className={`py-2.5 px-3 font-bold ${stressedStats.isSignificant ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {stressedStats.pValue < 0.001 ? '< 0.001' : stressedStats.pValue.toFixed(4)}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[var(--text-primary)]">
                    {deltaPValue > 0 ? `+${deltaPValue.toFixed(4)}` : deltaPValue.toFixed(4)}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-[11px] font-bold">
                    {stressedStats.isSignificant ? (
                      <span className="text-emerald-500">Reject H₀ (p &lt; {alpha})</span>
                    ) : (
                      <span className="text-amber-500">Fail to Reject H₀ (p ≥ {alpha})</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Academic Lesson Callout Card (What to explain to the Teacher) */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <strong className="text-[var(--text-primary)] block uppercase tracking-wide font-scoreboard">
                Key Academic Takeaway for Evaluation (Module I & VII):
              </strong>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Parametric hypothesis tests like <strong>Welch's two-sample t-test</strong> rely on sample means and sample variances. Because variance squares every deviation <span className="font-mono">(x<sub>i</sub> - x̄)²</span>, a single heavy-tailed outlier inflates the Standard Error <span className="font-mono">SE = √(s₁²/n₁ + s₂²/n₂)</span>. In small samples (e.g. n=15), this can drastically sway the t-statistic and induce either a <strong>Type I Error</strong> (spurious significance) or a <strong>Type II Error</strong> (loss of power).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
