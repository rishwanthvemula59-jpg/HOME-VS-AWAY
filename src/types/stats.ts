export interface Innings {
  id: string;
  matchIndex: number;
  runs: number;
  venueId: string;
  type: 'home' | 'away';
  seasonId: number;
}

export type BadgeType =
  | 'whistle-shield'   // CSK
  | 'lion-crown'       // RCB
  | 'vortex-ring'      // MI
  | 'wing-falcon'      // LSG
  | 'chevron-titan'    // GT
  | 'solar-eagle'      // SRH
  | 'flame-knight'     // KKR
  | 'rampart-tiger'    // DC
  | 'royal-palace'     // RR
  | 'crossed-daggers'; // PBKS

export interface StadiumConfig {
  id: string;
  franchise: string;
  venue: string;
  city: string;
  homeEffect: number; // built-in true effect in runs (+11 to -2)
  primaryColor: string;
  secondaryColor: string;
  badgeType: BadgeType;
  accentHex: string;
  badgeBg: string;
  badgeFg: string;
  established: number;
  capacity: string;
}

export interface WelchResult {
  nHome: number;
  nAway: number;
  meanHome: number;
  meanAway: number;
  varianceHome: number;
  varianceAway: number;
  sdHome: number;
  sdAway: number;
  meanDiff: number; // meanHome - meanAway
  standardError: number;
  tStat: number;
  df: number;
  pValue: number; // P(T > t) right-tailed
  tCrit: number;  // Critical value for alpha, df
  isSignificant: boolean; // pValue < alpha
  alpha?: number; // Significance level (default 0.05)
}

export interface StadiumData {
  config: StadiumConfig;
  homeInnings: Innings[];
  awayInnings: Innings[];
  stats: WelchResult;
}

export interface PooledData {
  homeInnings: Innings[];
  awayInnings: Innings[];
  stats: WelchResult;
}

export interface SeasonData {
  seasonId: number;
  timestamp: number;
  stadiums: StadiumData[];
  pooled: PooledData;
}
