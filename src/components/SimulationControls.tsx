import React from 'react';
import { Sliders, RefreshCw, RotateCcw, Sparkles, ShieldAlert, Zap, Target } from 'lucide-react';
import type { SimulationOptions } from '../lib/simulator';

interface SimulationControlsProps {
  options: SimulationOptions;
  onChangeOptions: (newOptions: SimulationOptions) => void;
  onResimulate: () => void;
  onReset: () => void;
  isResimulating: boolean;
  totalInningsCount: number;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  options,
  onChangeOptions,
  onResimulate,
  onReset,
  isResimulating,
  totalInningsCount,
}) => {
  const sampleSize = options.sampleSize ?? 15;
  const alpha = options.alpha ?? 0.05;
  const groundMod = options.groundEffectModifier ?? 0;
  const baseSd = options.baseStdDev ?? 24;

  const handleAlphaChange = (val: number) => {
    onChangeOptions({ ...options, alpha: val });
  };

  const handleSampleSizeChange = (val: number) => {
    onChangeOptions({ ...options, sampleSize: val });
  };

  const handleGroundModChange = (val: number) => {
    onChangeOptions({ ...options, groundEffectModifier: val });
  };

  const handleStdDevChange = (val: number) => {
    onChangeOptions({ ...options, baseStdDev: val });
  };

  const applyPreset = (preset: Partial<SimulationOptions>) => {
    onChangeOptions({
      sampleSize: preset.sampleSize ?? sampleSize,
      alpha: preset.alpha ?? alpha,
      groundEffectModifier: preset.groundEffectModifier ?? groundMod,
      baseStdDev: preset.baseStdDev ?? baseSd,
    });
  };

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-5 shadow-[var(--shadow-card)] space-y-5 transition-all">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--surface-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--turf-accent-subtle)] border border-[var(--turf-accent)]/30 flex items-center justify-center text-[var(--turf-accent)]">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-scoreboard text-sm sm:text-base font-bold tracking-wide uppercase text-[var(--text-primary)]">
              Simulation Sandbox & Hypothesis Controls
            </h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              Tweak statistical parameters in real time to observe live shifts in statistical power and p-values.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card-subtle)] text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--surface-border-strong)] transition-all"
            title="Reset parameters to calibrated defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={onResimulate}
            disabled={isResimulating}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--turf-accent)] text-white text-[11px] font-bold uppercase tracking-wider hover:opacity-95 active:scale-95 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResimulating ? 'animate-spin' : ''}`} />
            <span>{isResimulating ? 'Simulating...' : 'Run New Season'}</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
        <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)] shrink-0 flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Presets:
        </span>
        <button
          onClick={() => applyPreset({ sampleSize: 15, alpha: 0.05, groundEffectModifier: 0, baseStdDev: 24 })}
          className="px-2.5 py-1 rounded-md bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] hover:border-[var(--turf-accent)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap transition-colors"
        >
          Default IPL (n=15, α=0.05)
        </button>
        <button
          onClick={() => applyPreset({ sampleSize: 40, alpha: 0.05, groundEffectModifier: 0, baseStdDev: 24 })}
          className="px-2.5 py-1 rounded-md bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] hover:border-[var(--turf-accent)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap transition-colors"
        >
          High Power (n=40)
        </button>
        <button
          onClick={() => applyPreset({ sampleSize: 15, alpha: 0.01, groundEffectModifier: 0, baseStdDev: 24 })}
          className="px-2.5 py-1 rounded-md bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] hover:border-[var(--turf-accent)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap transition-colors"
        >
          Strict 99% Conf (α=0.01)
        </button>
        <button
          onClick={() => applyPreset({ sampleSize: 15, alpha: 0.05, groundEffectModifier: 10, baseStdDev: 24 })}
          className="px-2.5 py-1 rounded-md bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] hover:border-[var(--turf-accent)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap transition-colors"
        >
          Fortress Boost (+10 runs)
        </button>
        <button
          onClick={() => applyPreset({ sampleSize: 15, alpha: 0.05, groundEffectModifier: -10, baseStdDev: 24 })}
          className="px-2.5 py-1 rounded-md bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] hover:border-[var(--turf-accent)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap transition-colors"
        >
          Away Dominance (-10 runs)
        </button>
        <button
          onClick={() => applyPreset({ sampleSize: 15, alpha: 0.05, groundEffectModifier: 0, baseStdDev: 34 })}
          className="px-2.5 py-1 rounded-md bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] hover:border-[var(--turf-accent)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap transition-colors"
        >
          High Volatility (SD=34)
        </button>
      </div>

      {/* Control Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Sample Size Slider */}
        <div className="bg-[var(--surface-card-subtle)] p-3.5 rounded-xl border border-[var(--surface-border)] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[var(--turf-accent)]" /> Sample Size (n)
            </span>
            <span className="font-mono font-bold text-[var(--turf-accent)] bg-[var(--surface-card)] px-2 py-0.5 rounded border border-[var(--surface-border)]">
              {sampleSize} / side
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="1"
            value={sampleSize}
            onChange={(e) => handleSampleSizeChange(Number(e.target.value))}
            className="w-full h-1.5 bg-[var(--surface-border)] rounded-lg appearance-none cursor-pointer accent-[var(--turf-accent)]"
          />
          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
            <span>5 (Low power)</span>
            <span>Total: {totalInningsCount} inn</span>
            <span>50 (High)</span>
          </div>
        </div>

        {/* 2. Significance Level Alpha Buttons */}
        <div className="bg-[var(--surface-card-subtle)] p-3.5 rounded-xl border border-[var(--surface-border)] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Significance Level (α)
            </span>
            <span className="font-mono font-bold text-amber-500 bg-[var(--surface-card)] px-2 py-0.5 rounded border border-[var(--surface-border)]">
              {alpha === 0.01 ? '1%' : alpha === 0.05 ? '5%' : '10%'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            {[0.01, 0.05, 0.1].map((a) => (
              <button
                key={a}
                onClick={() => handleAlphaChange(a)}
                className={`py-1.5 text-xs font-mono font-semibold rounded-lg border transition-all ${
                  alpha === a
                    ? 'bg-[var(--turf-accent)] text-white border-[var(--turf-accent)] shadow-xs'
                    : 'bg-[var(--surface-card)] text-[var(--text-secondary)] border-[var(--surface-border)] hover:border-[var(--turf-accent)]/50'
                }`}
              >
                α={a}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] text-center">
            {alpha === 0.01 ? 'Rigorous 99% confidence' : alpha === 0.05 ? 'Standard 95% confidence' : 'Lenient 90% confidence'}
          </div>
        </div>

        {/* 3. Ground Edge Modifier */}
        <div className="bg-[var(--surface-card-subtle)] p-3.5 rounded-xl border border-[var(--surface-border)] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-sky-500" /> Ground Bias Shift
            </span>
            <span className="font-mono font-bold text-sky-500 bg-[var(--surface-card)] px-2 py-0.5 rounded border border-[var(--surface-border)]">
              {groundMod > 0 ? `+${groundMod}` : groundMod} runs
            </span>
          </div>
          <input
            type="range"
            min="-15"
            max="25"
            step="1"
            value={groundMod}
            onChange={(e) => handleGroundModChange(Number(e.target.value))}
            className="w-full h-1.5 bg-[var(--surface-border)] rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
            <span>-15 (Away bias)</span>
            <span>0</span>
            <span>+25 (Home edge)</span>
          </div>
        </div>

        {/* 4. Pitch Variance / Std Dev */}
        <div className="bg-[var(--surface-card-subtle)] p-3.5 rounded-xl border border-[var(--surface-border)] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-500" /> Pitch Volatility (σ)
            </span>
            <span className="font-mono font-bold text-purple-500 bg-[var(--surface-card)] px-2 py-0.5 rounded border border-[var(--surface-border)]">
              {baseSd} runs SD
            </span>
          </div>
          <input
            type="range"
            min="12"
            max="36"
            step="1"
            value={baseSd}
            onChange={(e) => handleStdDevChange(Number(e.target.value))}
            className="w-full h-1.5 bg-[var(--surface-border)] rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
            <span>12 (Consistent)</span>
            <span>24</span>
            <span>36 (High variance)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
