import type { Innings, SeasonData, StadiumData, PooledData, WelchResult } from '../types/stats';
import { STADIUMS_CONFIG } from '../data/stadiums';
import { runWelchTTest } from './statsEngine';

/**
 * Standard Normal Generator using Box-Muller Transform
 */
export function sampleGaussian(mean: number, stdDev: number): number {
  let u1 = 0;
  let u2 = 0;
  // Prevent Math.log(0)
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();

  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}

/**
 * Generate a single innings score with clipping [95, 260] and whole run rounding
 */
export function generateInningsScore(mean: number, stdDev: number): number {
  const rawScore = sampleGaussian(mean, stdDev);
  const clipped = Math.max(95, Math.min(260, rawScore));
  return Math.round(clipped);
}

const BASE_LEAGUE_MEAN = 169.0;
const BASE_HOME_SD = 24.0;
const AWAY_SD_FACTOR = 1.05; // 25.2 runs
const INNINGS_PER_SIDE = 15;

export interface SimulationOptions {
  sampleSize?: number;
  groundEffectModifier?: number;
  baseStdDev?: number;
  alpha?: number;
}

/**
 * Recalculate stats for a stadium based on innings
 */
export function recalculateStadiumStats(
  homeInnings: Innings[],
  awayInnings: Innings[],
  alpha: number = 0.05
): WelchResult {
  const homeScores = homeInnings.map((item) => item.runs);
  const awayScores = awayInnings.map((item) => item.runs);
  return runWelchTTest(homeScores, awayScores, alpha);
}

/**
 * Generate a full IPL Season dataset across all 10 stadiums plus pooled league data
 */
export function generateSeason(
  seasonId: number = 1,
  options: SimulationOptions = {}
): SeasonData {
  const sampleSize = options.sampleSize ?? INNINGS_PER_SIDE;
  const groundMod = options.groundEffectModifier ?? 0;
  const baseSd = options.baseStdDev ?? BASE_HOME_SD;
  const alpha = options.alpha ?? 0.05;

  const allHomeInnings: Innings[] = [];
  const allAwayInnings: Innings[] = [];

  const stadiumsData: StadiumData[] = STADIUMS_CONFIG.map((config) => {
    const homeMean = BASE_LEAGUE_MEAN + config.homeEffect + groundMod;
    const homeSd = baseSd;
    const awayMean = BASE_LEAGUE_MEAN;
    const awaySd = baseSd * AWAY_SD_FACTOR;

    const homeInnings: Innings[] = [];
    const awayInnings: Innings[] = [];

    for (let i = 0; i < sampleSize; i++) {
      const hRuns = generateInningsScore(homeMean, homeSd);
      const aRuns = generateInningsScore(awayMean, awaySd);

      const hItem: Innings = {
        id: `${config.id}-h-${seasonId}-${i + 1}`,
        matchIndex: i + 1,
        runs: hRuns,
        venueId: config.id,
        type: 'home',
        seasonId,
      };

      const aItem: Innings = {
        id: `${config.id}-a-${seasonId}-${i + 1}`,
        matchIndex: i + 1,
        runs: aRuns,
        venueId: config.id,
        type: 'away',
        seasonId,
      };

      homeInnings.push(hItem);
      awayInnings.push(aItem);

      allHomeInnings.push(hItem);
      allAwayInnings.push(aItem);
    }

    const stats = recalculateStadiumStats(homeInnings, awayInnings, alpha);

    return {
      config,
      homeInnings,
      awayInnings,
      stats,
    };
  });

  // Calculate Pooled / Global Welch's t-test
  const pooledStats = recalculateStadiumStats(allHomeInnings, allAwayInnings, alpha);

  const pooled: PooledData = {
    homeInnings: allHomeInnings,
    awayInnings: allAwayInnings,
    stats: pooledStats,
  };

  return {
    seasonId,
    timestamp: Date.now(),
    stadiums: stadiumsData,
    pooled,
  };
}
