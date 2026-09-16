import type { WelchResult } from '../types/stats';

/**
 * Lanczos approximation for ln(Gamma(z))
 * Precision: ~1e-12
 */
export function logGamma(z: number): number {
  if (z <= 0) return 0;
  const cof = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.001208650973866179,
    -0.000005395239384953,
  ];
  let x = z;
  let y = z;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    y += 1;
    ser += cof[j] / y;
  }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

/**
 * Continued fraction representation of regularized incomplete beta function
 * Uses modified Lentz's method (Numerical Recipes)
 */
function betaContinuedFraction(a: number, b: number, x: number): number {
  const MAX_ITER = 200;
  const EPS = 3.0e-12;
  const FPMIN = 1.0e-30;

  const qab = a + b;
  const qap = a + 1.0;
  const qam = a - 1.0;

  let c = 1.0;
  let d = 1.0 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1.0 / d;
  let h = d;

  for (let m = 1; m <= MAX_ITER; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    h *= d * c;

    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    const del = d * c;
    h *= del;

    if (Math.abs(del - 1.0) < EPS) break;
  }

  return h;
}

/**
 * Regularized Incomplete Beta function I_x(a, b)
 */
export function incompleteBeta(a: number, b: number, x: number): number {
  if (x <= 0.0) return 0.0;
  if (x >= 1.0) return 1.0;

  // Factors in front of the continued fraction
  const lnBeta = logGamma(a) + logGamma(b) - logGamma(a + b);
  const factor = Math.exp(a * Math.log(x) + b * Math.log(1.0 - x) - lnBeta);

  // Symmetry relation for fast convergence
  if (x < (a + 1.0) / (a + b + 2.0)) {
    return (factor * betaContinuedFraction(a, b, x)) / a;
  } else {
    return 1.0 - (factor * betaContinuedFraction(b, a, 1.0 - x)) / b;
  }
}

/**
 * Right-tailed p-value for Student's t-distribution with df degrees of freedom:
 * p = P(T > t)
 */
export function studentTRightTailedPValue(t: number, df: number): number {
  if (df <= 0) return 1.0;
  if (isNaN(t)) return 1.0;
  if (t === 0) return 0.5;

  const x = df / (df + t * t);
  const ib = incompleteBeta(df / 2.0, 0.5, x);

  if (t > 0) {
    return 0.5 * ib;
  } else {
    return 1.0 - 0.5 * ib;
  }
}

/**
 * Probability density function (PDF) of Student's t-distribution:
 * f(t; df)
 */
export function studentTPdf(t: number, df: number): number {
  if (df <= 0) return 0;
  const num = logGamma((df + 1.0) / 2.0);
  const den = logGamma(df / 2.0) + 0.5 * Math.log(Math.PI * df);
  const logTerm = -((df + 1.0) / 2.0) * Math.log(1.0 + (t * t) / df);
  return Math.exp(num - den + logTerm);
}

/**
 * Critical value t_crit such that P(T > t_crit) = alpha for right-tailed test.
 * Solved via bisection on the incomplete beta p-value function.
 */
export function studentTCriticalValue(alpha: number = 0.05, df: number): number {
  if (df <= 0) return 1.645;
  let low = 0.0;
  let high = 25.0; // Reasonable upper bound for alpha = 0.05
  
  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2.0;
    const p = studentTRightTailedPValue(mid, df);
    if (p > alpha) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return (low + high) / 2.0;
}

/**
 * Basic summary statistics (mean, sample variance, sample sd)
 */
export function calculateSampleStats(values: number[]): {
  mean: number;
  variance: number;
  sd: number;
  n: number;
} {
  const n = values.length;
  if (n === 0) return { mean: 0, variance: 0, sd: 0, n: 0 };
  if (n === 1) return { mean: values[0], variance: 0, sd: 0, n: 1 };

  const sum = values.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;
  const sumSqDiff = values.reduce((acc, v) => acc + (v - mean) ** 2, 0);
  const variance = sumSqDiff / (n - 1);
  const sd = Math.sqrt(variance);

  return { mean, variance, sd, n };
}

/**
 * Welch's Two-Sample t-test (unequal variances assumed)
 * 
 * H0: mu_home <= mu_away
 * Ha: mu_home > mu_away (Right-tailed)
 * alpha: 0.05
 */
export function runWelchTTest(homeScores: number[], awayScores: number[]): WelchResult {
  const home = calculateSampleStats(homeScores);
  const away = calculateSampleStats(awayScores);

  const meanDiff = home.mean - away.mean;

  // Standard Error of difference: sqrt( s1^2/n1 + s2^2/n2 )
  const varHomeTerm = home.variance / home.n;
  const varAwayTerm = away.variance / away.n;
  const seSquared = varHomeTerm + varAwayTerm;
  const se = Math.sqrt(seSquared);

  // Welch's t statistic
  const tStat = se > 0 ? meanDiff / se : 0;

  // Welch-Satterthwaite degrees of freedom
  // df = (s1^2/n1 + s2^2/n2)^2 / [ (s1^2/n1)^2/(n1 - 1) + (s2^2/n2)^2/(n2 - 1) ]
  let df = 28; // default fallback
  if (home.n > 1 && away.n > 1 && seSquared > 0) {
    const num = seSquared * seSquared;
    const den =
      (varHomeTerm * varHomeTerm) / (home.n - 1) +
      (varAwayTerm * varAwayTerm) / (away.n - 1);
    df = den > 0 ? num / den : home.n + away.n - 2;
  }

  // Exact right-tailed p-value: P(T_df > t_observed)
  const pValue = studentTRightTailedPValue(tStat, df);
  const tCrit = studentTCriticalValue(0.05, df);
  const isSignificant = pValue < 0.05;

  return {
    nHome: home.n,
    nAway: away.n,
    meanHome: home.mean,
    meanAway: away.mean,
    varianceHome: home.variance,
    varianceAway: away.variance,
    sdHome: home.sd,
    sdAway: away.sd,
    meanDiff,
    standardError: se,
    tStat,
    df,
    pValue,
    tCrit,
    isSignificant,
  };
}
