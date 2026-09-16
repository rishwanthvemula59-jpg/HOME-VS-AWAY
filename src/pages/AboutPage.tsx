import React from 'react';
import { Info, Database, Code, FileText, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-card)]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--turf-accent-subtle)] border border-[var(--turf-accent)]/30 text-xs font-semibold text-[var(--turf-accent)] uppercase tracking-wider mb-3">
          <Info className="w-3.5 h-3.5" />
          <span>Product Overview & Architecture</span>
        </div>
        <h1 className="font-scoreboard text-2xl sm:text-4xl font-bold uppercase tracking-tight text-[var(--text-primary)]">
          About PitchEdge v1.0
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
          PitchEdge is an interactive cricket statistics product designed to evaluate the <strong>Home Advantage Hypothesis</strong> across India's 10 premier IPL cricket grounds. Built as a demonstration of Module VII (Testing of Hypothesis), it is finished to the standards of a live sports analytics SaaS application.
        </p>
      </div>

      {/* Simulated Data Disclaimer */}
      <section className="bg-[var(--surface-card)] border border-amber-500/30 rounded-2xl p-6 shadow-[var(--shadow-card)] space-y-3">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider text-xs sm:text-sm font-scoreboard">
          <Database className="w-4 h-4 shrink-0" />
          <span>Simulation Model & Synthetic Data Notice</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          In accordance with the product specification, no proprietary ball-by-ball dataset is bundled. All innings totals are generated on-the-fly client-side using a calibrated <strong>Box-Muller Gaussian sampler</strong> with T20-realistic base parameters (Base mean: 169 runs, Home SD: 24 runs, Away SD: 25.2 runs, sample size: n = 15 home and n = 15 away per ground). Scores are clipped to [95, 260] and rounded to whole integers.
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          Built-in true home ground effects range from +11 runs (Chinnaswamy) to −2 runs (Mullanpur) to guarantee heterogeneous, pedagogically sound test scenarios across seasons.
        </p>
      </section>

      {/* Zero-Change Swapping for Real IPL Ball-by-Ball Data */}
      <section className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 shadow-[var(--shadow-card)] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--surface-border)]">
          <Code className="w-5 h-5 text-[var(--turf-accent)]" />
          <h2 className="font-scoreboard text-lg font-bold uppercase text-[var(--text-primary)]">
            Plugging In A Real Ball-by-Ball Dataset (Zero Stats Code Changes)
          </h2>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          The statistical engine (<code className="px-1.5 py-0.5 rounded bg-[var(--surface-card-subtle)] font-mono text-xs text-[var(--turf-accent)]">src/lib/statsEngine.ts</code>) is decoupled from data generation. Swapping in real-world IPL ball-by-ball records (e.g. from Cricsheet, ESPNcricinfo, or Kaggle) requires <strong>zero changes to the statistics engine</strong>.
        </p>

        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] mt-3">
          Expected CSV / JSON Schema:
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[var(--surface-border)] rounded-xl overflow-hidden">
            <thead className="bg-[var(--surface-card-subtle)] text-[var(--text-primary)] font-mono uppercase">
              <tr>
                <th className="p-3 border-b border-[var(--surface-border)]">Column Name</th>
                <th className="p-3 border-b border-[var(--surface-border)]">Data Type</th>
                <th className="p-3 border-b border-[var(--surface-border)]">Description</th>
                <th className="p-3 border-b border-[var(--surface-border)]">Example Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-border)] font-mono text-[var(--text-secondary)]">
              <tr>
                <td className="p-3 text-[var(--text-primary)] font-bold">franchise</td>
                <td className="p-3">String</td>
                <td className="p-3 font-sans">Designated home franchise identity</td>
                <td className="p-3">Chennai Super Kings</td>
              </tr>
              <tr>
                <td className="p-3 text-[var(--text-primary)] font-bold">venue</td>
                <td className="p-3">String</td>
                <td className="p-3 font-sans">Official stadium name</td>
                <td className="p-3">MA Chidambaram Stadium</td>
              </tr>
              <tr>
                <td className="p-3 text-[var(--text-primary)] font-bold">location</td>
                <td className="p-3">String</td>
                <td className="p-3 font-sans">Host city & jurisdiction</td>
                <td className="p-3">Chennai, Tamil Nadu</td>
              </tr>
              <tr>
                <td className="p-3 text-[var(--text-primary)] font-bold">batting_team_type</td>
                <td className="p-3">Enum</td>
                <td className="p-3 font-sans">'home' or 'away' relative to venue host</td>
                <td className="p-3">home</td>
              </tr>
              <tr>
                <td className="p-3 text-[var(--text-primary)] font-bold">runs_scored</td>
                <td className="p-3">Integer</td>
                <td className="p-3 font-sans">Total 20-over innings score</td>
                <td className="p-3">188</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Engineering Standards */}
      <section className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 shadow-[var(--shadow-card)] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--surface-border)]">
          <FileText className="w-5 h-5 text-[var(--floodlight-accent)]" />
          <h2 className="font-scoreboard text-lg font-bold uppercase text-[var(--text-primary)]">
            Engineering & Product Standards
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card-subtle)] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[var(--text-primary)]">Rigorous Math Engine:</strong>
              <div className="text-[var(--text-muted)] mt-0.5">
                Exact regularized incomplete beta continued fraction implementation (Numerical Recipes) validated against reference cases.
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card-subtle)] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[var(--text-primary)]">Day & Night Match Theming:</strong>
              <div className="text-[var(--text-muted)] mt-0.5">
                Full dynamic light/dark modes inspired by sunlit afternoon fixtures and floodlit night matches.
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card-subtle)] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[var(--text-primary)]">Original Visual Badges:</strong>
              <div className="text-[var(--text-muted)] mt-0.5">
                10 custom geometric vector badges honoring team colors without trademark infringement.
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card-subtle)] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[var(--text-primary)]">Zero-Dependency Visualizations:</strong>
              <div className="text-[var(--text-muted)] mt-0.5">
                Custom SVG population pyramids, dynamic t-distribution curves, and mirrored frequency bars.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
