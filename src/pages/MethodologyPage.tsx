import React from 'react';
import { BookOpen, Layers, GitCompare } from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-card)]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--turf-accent-subtle)] border border-[var(--turf-accent)]/30 text-xs font-semibold text-[var(--turf-accent)] uppercase tracking-wider mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Module VII: Testing of Hypothesis — Formal Statistical Specification</span>
        </div>
        <h1 className="font-scoreboard text-2xl sm:text-4xl font-bold uppercase tracking-tight text-[var(--text-primary)]">
          Methodological Framework & Derivations
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
          PitchEdge implements an exact, client-side execution of Welch's Two-Sample t-test (assuming unequal sample variances) to test the Home Advantage Hypothesis across major IPL cricket grounds. This page outlines the complete mathematical architecture, probability density functions, and decision rules.
        </p>
      </div>

      {/* Section 1: Hypotheses */}
      <section className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 shadow-[var(--shadow-card)] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--surface-border)]">
          <span className="font-scoreboard text-lg font-bold text-[var(--turf-accent)]">3.1</span>
          <h2 className="font-scoreboard text-lg font-bold uppercase text-[var(--text-primary)]">
            Hypothesis Formulation (One-Tailed / Right-Tailed Test)
          </h2>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Let μ<sub>home</sub> denote the true population mean runs scored by teams batting in their designated home venue, and let μ<sub>away</sub> denote the true population mean runs scored by away teams at that same venue.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card-subtle)]">
            <div className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase">Null Hypothesis (H₀)</div>
            <div className="mt-2 font-mono text-xl font-bold text-[var(--text-primary)]">
              H₀: μ<sub>home</sub> ≤ μ<sub>away</sub>
            </div>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              No scoring advantage exists for the home team; home innings scores are less than or equal to visiting innings scores on average.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card-subtle)]">
            <div className="text-xs font-mono font-bold text-[var(--turf-accent)] uppercase">Alternative Hypothesis (Hₐ)</div>
            <div className="mt-2 font-mono text-xl font-bold text-[var(--turf-accent)]">
              Hₐ: μ<sub>home</sub> &gt; μ<sub>away</sub>
            </div>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              A genuine home advantage exists; teams score strictly higher at their home venue than away opposition.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--surface-card-subtle)] text-xs text-[var(--text-muted)] flex items-center justify-between">
          <span>Significance Level Criterion:</span>
          <span className="font-mono font-bold text-[var(--text-primary)]">α = 0.05 (5% risk of Type I error)</span>
        </div>
      </section>

      {/* Section 2: Test Statistic */}
      <section className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 shadow-[var(--shadow-card)] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--surface-border)]">
          <span className="font-scoreboard text-lg font-bold text-[var(--turf-accent)]">3.2</span>
          <h2 className="font-scoreboard text-lg font-bold uppercase text-[var(--text-primary)]">
            Welch's Two-Sample t-Test Statistic (Unequal Variances)
          </h2>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Standard Student's t-tests assume homoscedasticity (σ²<sub>home</sub> = σ²<sub>away</sub>). However, in professional T20 cricket, visiting teams typically exhibit greater score volatility (σ<sub>away</sub> ≈ 1.05 × σ<sub>home</sub>) due to unfamiliar boundary dimensions, variable dew conditions, and pitch wear. Therefore, we deploy <strong>Welch's t-test</strong>, which does not require pooled variance.
        </p>

        {/* Formula Display Box */}
        <div className="p-5 rounded-xl border border-[var(--surface-border-strong)] bg-[var(--surface-card-subtle)] text-center font-mono">
          <div className="inline-block text-left text-sm sm:text-base font-bold text-[var(--text-primary)] py-2">
            <div className="text-center pb-1 border-b-2 border-[var(--text-primary)]">
              x̄<sub>home</sub> − x̄<sub>away</sub>
            </div>
            <div className="text-center pt-1">
              √( s²<sub>home</sub> / n<sub>home</sub> + s²<sub>away</sub> / n<sub>away</sub> )
            </div>
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-3">
            Where x̄ denotes sample mean, s² denotes unbiased sample variance (N − 1), and n denotes sample size.
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
            Welch–Satterthwaite Effective Degrees of Freedom (df)
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            The distribution of the test statistic is approximated by Student's t-distribution with degrees of freedom determined by the Welch–Satterthwaite equation:
          </p>
          <div className="p-5 mt-2 rounded-xl border border-[var(--surface-border-strong)] bg-[var(--surface-card-subtle)] text-center font-mono overflow-x-auto">
            <div className="inline-block text-left text-xs sm:text-sm font-bold text-[var(--text-primary)] py-2">
              <div className="text-center pb-1.5 border-b-2 border-[var(--text-primary)]">
                ( s²<sub>home</sub> / n<sub>home</sub> + s²<sub>away</sub> / n<sub>away</sub> )²
              </div>
              <div className="text-center pt-1.5">
                ( s²<sub>home</sub> / n<sub>home</sub> )² / (n<sub>home</sub> − 1) + ( s²<sub>away</sub> / n<sub>away</sub> )² / (n<sub>away</sub> − 1)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Exact p-value & Continued Fractions */}
      <section className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 shadow-[var(--shadow-card)] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--surface-border)]">
          <span className="font-scoreboard text-lg font-bold text-[var(--turf-accent)]">3.3</span>
          <h2 className="font-scoreboard text-lg font-bold uppercase text-[var(--text-primary)]">
            Exact p-Value Calculation via Regularized Incomplete Beta Function
          </h2>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Unlike approximate lookup tables or polynomial approximations, PitchEdge evaluates the exact right-tailed probability p = P(T<sub>df</sub> &gt; t<sub>observed</sub>) via the <strong>Regularized Incomplete Beta Function</strong> I<sub>x</sub>(a, b):
        </p>

        <div className="p-4 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card-subtle)] font-mono text-xs sm:text-sm space-y-2">
          <div>Let x = df / (df + t²)</div>
          <div>For t &gt; 0: &emsp; p = 0.5 × I<sub>x</sub>(df / 2, 0.5)</div>
          <div>For t ≤ 0: &emsp; p = 1 − 0.5 × I<sub>x</sub>(df / 2, 0.5)</div>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          The function I<sub>x</sub>(a, b) is evaluated using the continued fraction algorithm (modified Lentz's method) and Lanczos log-gamma series:
        </p>

        <div className="p-4 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card-subtle)] font-mono text-xs text-[var(--text-muted)] overflow-x-auto text-center">
          I<sub>x</sub>(a, b) = [ xᵃ(1 − x)ᵇ / (a × B(a, b)) ] × [ 1 / (1 + d₁ / (1 + d₂ / (1 + ...))) ]
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-[var(--text-secondary)] space-y-1">
          <div className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
            Automated Mathematical Verification
          </div>
          <div>• Reference 1: df = 28, t = 2.05 ⇒ p = 0.024917 (Accurate to ±0.0001)</div>
          <div>• Reference 2: df = 10, t = 1.81246 ⇒ p = 0.050000 (Matches exact critical boundary)</div>
          <div>• Reference 3: df = 30, t = 0.00 ⇒ p = 0.500000 (Symmetric median verified)</div>
        </div>
      </section>

      {/* Section 4: Decision Rule & Rejection Region */}
      <section className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 shadow-[var(--shadow-card)] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--surface-border)]">
          <span className="font-scoreboard text-lg font-bold text-[var(--turf-accent)]">3.4</span>
          <h2 className="font-scoreboard text-lg font-bold uppercase text-[var(--text-primary)]">
            Decision Rule & Rejection Region
          </h2>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          For a right-tailed test at significance level α = 0.05, the rejection region is the upper 5% tail of the Student's t-distribution with df degrees of freedom.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">Condition to Reject H₀</span>
            <div className="mt-2 text-sm font-bold text-[var(--text-primary)]">
              t<sub>observed</sub> &gt; t<sub>critical</sub>(0.05, df) ⇔ p &lt; 0.05
            </div>
            <p className="mt-2 text-[var(--text-secondary)] font-sans">
              Conclusion: Sufficient statistical evidence to assert a positive home advantage exists at the 95% confidence level.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
            <span className="text-amber-600 dark:text-amber-400 font-bold uppercase">Condition to Retain H₀</span>
            <div className="mt-2 text-sm font-bold text-[var(--text-primary)]">
              t<sub>observed</sub> ≤ t<sub>critical</sub>(0.05, df) ⇔ p ≥ 0.05
            </div>
            <p className="mt-2 text-[var(--text-secondary)] font-sans">
              Conclusion: Insufficient statistical evidence to reject parity; observed scoring differences are compatible with random sampling variance.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Type I & Type II Errors */}
      <section className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 shadow-[var(--shadow-card)] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--surface-border)]">
          <span className="font-scoreboard text-lg font-bold text-[var(--turf-accent)]">3.5</span>
          <h2 className="font-scoreboard text-lg font-bold uppercase text-[var(--text-primary)]">
            Type I and Type II Error Analysis in Cricket Analytics
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-rose-500/25 bg-rose-500/5">
            <div className="flex items-center justify-between font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              <span>Type I Error (α = 0.05)</span>
              <span>False Positive</span>
            </div>
            <p className="mt-2 text-[var(--text-secondary)] leading-relaxed">
              <strong>Definition:</strong> Concluding that a venue provides a significant home advantage when the true effect is zero or negative (μ<sub>home</sub> ≤ μ<sub>away</sub>).
            </p>
            <div className="mt-3 pt-3 border-t border-rose-500/15 text-[var(--text-muted)] space-y-1">
              <strong className="text-rose-600 dark:text-rose-400">Franchise Ramifications:</strong>
              <div>• Misallocating ₹20+ Crore IPL mega-auction purse towards extreme venue-specific specialists (e.g., extra wrist-spinners for Chepauk or power-hitters for Chinnaswamy) based on spurious sample noise.</div>
              <div>• Suboptimal toss strategy: overconfidently opting to bat first under the illusion that visiting teams cannot chase at this ground.</div>
              <div>• Capital waste on pitch curation adjustments attempting to preserve a non-existent advantage.</div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/5">
            <div className="flex items-center justify-between font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <span>Type II Error (β)</span>
              <span>False Negative</span>
            </div>
            <p className="mt-2 text-[var(--text-secondary)] leading-relaxed">
              <strong>Definition:</strong> Failing to reject the null hypothesis despite the existence of a real, positive home ground scoring edge (μ<sub>home</sub> &gt; μ<sub>away</sub>).
            </p>
            <div className="mt-3 pt-3 border-t border-amber-500/15 text-[var(--text-muted)] space-y-1">
              <strong className="text-amber-600 dark:text-amber-400">Franchise Ramifications:</strong>
              <div>• Abandoning genuine home turf tactical preparation because n = 15 innings yielded p = 0.08 due to single-match outliers (T20 score variance).</div>
              <div>• Miscalibrated in-match win-probability analytics and target-defending models.</div>
              <div>• Surrendering ground familiarity: failing to exploit known boundary asymmetry or prevailing wind vectors.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Stratified vs Pooled Testing */}
      <section className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 shadow-[var(--shadow-card)] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--surface-border)]">
          <span className="font-scoreboard text-lg font-bold text-[var(--turf-accent)]">3.6</span>
          <h2 className="font-scoreboard text-lg font-bold uppercase text-[var(--text-primary)]">
            Global Pooled vs Stratified Ground-by-Ground Testing
          </h2>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          PitchEdge implements both levels of hypothesis testing demanded by rigorous sports analytics:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card-subtle)]">
            <div className="font-bold text-[var(--text-primary)] uppercase flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[var(--turf-accent)]" />
              <span>1. Global Pooled Test (n = 300)</span>
            </div>
            <p className="mt-2 text-[var(--text-secondary)] leading-relaxed">
              Pools all 150 home innings and 150 away innings across India. Tests the macro question: <em>"Does home advantage exist in the IPL on aggregate?"</em> With n = 300, standard error is small (≈ ±2.0 runs), granting massive statistical power to detect even modest (+3 to +4 run) league-wide effects.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card-subtle)]">
            <div className="font-bold text-[var(--text-primary)] uppercase flex items-center gap-1.5">
              <GitCompare className="w-4 h-4 text-[var(--floodlight-accent)]" />
              <span>2. Stratified Ground Test (n = 30 per ground)</span>
            </div>
            <p className="mt-2 text-[var(--text-secondary)] leading-relaxed">
              Disaggregates the league into 10 separate ground tests (15 home vs 15 away). Crucial because grounds are heterogeneous: a Chinnaswamy (+11 run effect) behaves completely differently from a Mullanpur (−2 run parity). Stratification prevents Simpson's Paradox and isolates venue-specific edges.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
