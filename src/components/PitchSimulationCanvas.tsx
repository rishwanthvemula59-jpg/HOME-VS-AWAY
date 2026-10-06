import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { StadiumConfig } from '../types/stats';
import { FranchiseBadge } from './FranchiseBadge';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Trophy, 
  Flame, 
  Activity,
  Zap,
  Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PitchSimulationCanvasProps {
  stadium: StadiumConfig;
  onAddMatch: (homeScore: number, awayScore: number) => void;
}

interface BallOutcome {
  runs: number;
  isWicket: boolean;
  label: string;
  commentary: string;
}

const COMMENTARY_TEMPLATES = {
  six: [
    '⚡ MAXIMUM! Smashed high and handsome over long-on into the crowd!',
    '🚀 HUGE SIX! Launches it into the second tier of the stadium!',
    '🔥 IN THE AIR AND ALL THE WAY! Out of the ground!',
    '⚡ DISPATCHED! Picked up off the pads over deep backward square leg for 6!',
  ],
  four: [
    '🏏 CRACKING FOUR! Pierces the gap between cover and point!',
    '💥 BOUNDARY! Glorious straight drive races across the turf!',
    '⚡ FOUR! Edged and past slip to the third-man boundary!',
    '🏏 BEAUTIFULLY TIMED! Driven on the up through extra cover for 4!',
  ],
  wicket: [
    '🔥 TIMBER! Clean bowled! Stumps sent cartwheeling!',
    '💥 IN THE AIR... TAKEN! Outstanding catch at long-off!',
    '⚡ EDGED AND GONE! Feathered through to the wicketkeeper!',
    '🎯 TRAPPED LBW! Pinpoint yorker right in front of middle stump!',
  ],
  runs: [
    'Smart running between the wickets, nudged into mid-wicket for a quick single.',
    'Punched into the deep cover sweeper for a comfortable couple of runs.',
    'Pushed to long-on to rotate the strike comfortably.',
  ],
  dot: [
    'Good length ball outside off, beaten by the pace and bounce!',
    'Solid defensive block right back to the bowler.',
    'Swung and missed! Superb bowling in the corridor of uncertainty.',
    'Beaten by the seam movement! Close shave for the outside edge.',
  ],
};

export const PitchSimulationCanvas: React.FC<PitchSimulationCanvasProps> = ({
  stadium,
  onAddMatch,
}) => {
  // Match flow state
  const [status, setStatus] = useState<'idle' | 'playing' | 'paused' | 'finished'>('idle');
  const [speed, setSpeed] = useState<number>(1); // 1x, 2x, 4x
  const [innings, setInnings] = useState<1 | 2>(1);
  const [totalBalls, setTotalBalls] = useState<number>(0); // 0 to 120 balls (20 overs)

  // Scores (Real 20-Over T20 cricket scores)
  const [runs1, setRuns1] = useState<number>(0);
  const [wickets1, setWickets1] = useState<number>(0);
  const [runs2, setRuns2] = useState<number>(0);
  const [wickets2, setWickets2] = useState<number>(0);

  // Ball history in current over
  const [currentOverBalls, setCurrentOverBalls] = useState<string[]>([]);
  const [latestEvent, setLatestEvent] = useState<string>('Ready for 20-Over Match');
  const [commentary, setCommentary] = useState<string>(
    `Full 20-Over T20 match at ${stadium.venue}. Click "Start 20-Over Match" to bowl the first over!`
  );

  // Ball animation state on pitch
  const [ballPosition, setBallPosition] = useState<{ x: number; y: number } | null>(null);
  const [isBallInAir, setIsBallInAir] = useState<boolean>(false);

  // Match final result banner
  const [finalResult, setFinalResult] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);

  // Max 20 overs = 120 balls
  const MAX_BALLS = 120;
  const target = runs1 + 1;
  const currentRuns = innings === 1 ? runs1 : runs2;
  const currentWickets = innings === 1 ? wickets1 : wickets2;
  const oversCompleted = Math.floor(totalBalls / 6);
  const ballsInCurrentOver = totalBalls % 6;

  // Match Phase detection
  const matchPhase =
    oversCompleted < 6
      ? 'Powerplay (Overs 1-6)'
      : oversCompleted < 15
      ? 'Middle Overs (Overs 7-15)'
      : 'Death Overs (Overs 16-20)';

  // Generate weighted random ball outcome based on phase, team, and ground effect
  const sampleBall = useCallback((): BallOutcome => {
    const isHome = innings === 1;
    // Ground advantage effect adds extra boundary odds
    const homeEdgeBonus = isHome ? stadium.homeEffect * 0.005 : 0;
    const isPowerplay = oversCompleted < 6;
    const isDeathOvers = oversCompleted >= 15;

    // Boundary probability higher in powerplay and death overs
    const boundaryBoost = isDeathOvers ? 0.08 : isPowerplay ? 0.05 : 0;
    const wicketOdds = isDeathOvers ? 0.08 : isPowerplay ? 0.05 : 0.04;

    const roll = Math.random();

    if (roll < wicketOdds) {
      const c = COMMENTARY_TEMPLATES.wicket[Math.floor(Math.random() * COMMENTARY_TEMPLATES.wicket.length)];
      return { runs: 0, isWicket: true, label: 'W', commentary: c };
    }
    if (roll < 0.12 + boundaryBoost + homeEdgeBonus) {
      const c = COMMENTARY_TEMPLATES.six[Math.floor(Math.random() * COMMENTARY_TEMPLATES.six.length)];
      return { runs: 6, isWicket: false, label: '6', commentary: c };
    }
    if (roll < 0.32 + boundaryBoost + homeEdgeBonus) {
      const c = COMMENTARY_TEMPLATES.four[Math.floor(Math.random() * COMMENTARY_TEMPLATES.four.length)];
      return { runs: 4, isWicket: false, label: '4', commentary: c };
    }
    if (roll < 0.52) {
      const c = COMMENTARY_TEMPLATES.runs[Math.floor(Math.random() * COMMENTARY_TEMPLATES.runs.length)];
      return { runs: 2, isWicket: false, label: '2', commentary: c };
    }
    if (roll < 0.78) {
      const c = COMMENTARY_TEMPLATES.runs[Math.floor(Math.random() * COMMENTARY_TEMPLATES.runs.length)];
      return { runs: 1, isWicket: false, label: '1', commentary: c };
    }
    const c = COMMENTARY_TEMPLATES.dot[Math.floor(Math.random() * COMMENTARY_TEMPLATES.dot.length)];
    return { runs: 0, isWicket: false, label: '•', commentary: c };
  }, [innings, stadium.homeEffect, oversCompleted]);

  // Complete match end handler
  const finishMatch = useCallback(
    (hFinal: number, aFinal: number) => {
      setStatus('finished');
      let res = '';
      if (hFinal > aFinal) {
        res = `${stadium.franchise} won by ${hFinal - aFinal} runs at their home fortress!`;
        try {
          confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
      } else if (aFinal > hFinal) {
        res = `Visiting team won by ${10 - wickets2} wickets in a successful run chase!`;
      } else {
        res = `Match Tied! 20-Over thriller heads to a Super Over!`;
      }
      setFinalResult(res);

      // Directly record the real authentic 20-over match scores
      onAddMatch(hFinal, aFinal);
    },
    [stadium.franchise, wickets2, onAddMatch]
  );

  // Play next delivery step
  const stepDelivery = useCallback(() => {
    // Pitch ball animation
    setIsBallInAir(true);
    setBallPosition({ x: 22, y: 50 });

    const stepDelay = Math.max(30, 90 / speed);

    setTimeout(() => {
      setBallPosition({ x: 55, y: 52 });
    }, stepDelay);

    setTimeout(() => {
      setBallPosition({ x: 78, y: 48 });
      setIsBallInAir(false);

      const outcome = sampleBall();
      setCommentary(outcome.commentary);

      if (outcome.isWicket) {
        setLatestEvent(`💥 WICKET! (${oversCompleted}.${ballsInCurrentOver + 1} ov)`);
      } else if (outcome.runs === 6) {
        setLatestEvent(`⚡ SIX! MAXIMUM!`);
      } else if (outcome.runs === 4) {
        setLatestEvent(`🏏 FOUR! BOUNDARY!`);
      } else if (outcome.runs > 0) {
        setLatestEvent(`+${outcome.runs} Runs`);
      } else {
        setLatestEvent(`Dot Ball (0)`);
      }

      // 1st Innings
      if (innings === 1) {
        const nextRuns = runs1 + outcome.runs;
        const nextWickets = outcome.isWicket ? wickets1 + 1 : wickets1;
        const nextBalls = totalBalls + 1;

        setRuns1(nextRuns);
        setWickets1(nextWickets);
        setTotalBalls(nextBalls);
        setCurrentOverBalls((prev) => (nextBalls % 6 === 1 ? [outcome.label] : [...prev, outcome.label]));

        // Check if 1st innings complete (120 balls = 20 overs, or 10 wickets)
        if (nextBalls >= MAX_BALLS || nextWickets >= 10) {
          setInnings(2);
          setTotalBalls(0);
          setCurrentOverBalls([]);
          setCommentary(
            `Innings Break! ${stadium.franchise} posted ${nextRuns}/${nextWickets} in 20.0 overs. Target: ${nextRuns + 1} runs.`
          );
        }
      } else {
        // 2nd Innings
        const nextRuns = runs2 + outcome.runs;
        const nextWickets = outcome.isWicket ? wickets2 + 1 : wickets2;
        const nextBalls = totalBalls + 1;

        setRuns2(nextRuns);
        setWickets2(nextWickets);
        setTotalBalls(nextBalls);
        setCurrentOverBalls((prev) => (nextBalls % 6 === 1 ? [outcome.label] : [...prev, outcome.label]));

        // Check chase completed or 20 overs finished
        if (nextRuns >= target) {
          finishMatch(runs1, nextRuns);
        } else if (nextBalls >= MAX_BALLS || nextWickets >= 10) {
          finishMatch(runs1, nextRuns);
        }
      }
    }, stepDelay * 2);
  }, [
    speed,
    sampleBall,
    innings,
    runs1,
    wickets1,
    runs2,
    wickets2,
    totalBalls,
    oversCompleted,
    ballsInCurrentOver,
    target,
    finishMatch,
    stadium.franchise,
  ]);

  // Main playback timer loop
  // At 1x speed: ~240ms per ball ensures a full 20-over clash (120-240 balls) finishes in ~45-55 seconds!
  useEffect(() => {
    if (status === 'playing') {
      const delay = Math.max(25, 240 / speed);
      timerRef.current = window.setTimeout(() => {
        stepDelivery();
      }, delay);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [status, stepDelivery, speed]);

  const handleStart = () => {
    if (status === 'finished') {
      setInnings(1);
      setTotalBalls(0);
      setRuns1(0);
      setWickets1(0);
      setRuns2(0);
      setWickets2(0);
      setCurrentOverBalls([]);
      setFinalResult(null);
    }
    setStatus('playing');
  };

  const handlePause = () => {
    setStatus('paused');
  };

  const handleReset = () => {
    setStatus('idle');
    setInnings(1);
    setTotalBalls(0);
    setRuns1(0);
    setWickets1(0);
    setRuns2(0);
    setWickets2(0);
    setCurrentOverBalls([]);
    setBallPosition(null);
    setFinalResult(null);
    setLatestEvent('Ready for 20-Over Match');
    setCommentary(`Full 20-Over T20 match at ${stadium.venue}. Click "Start 20-Over Match"!`);
  };

  // Instant skip to 20-over result
  const handleInstantSkip = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // Realistic 20-over scores (e.g. 165 to 210 runs)
    const baseH = Math.round(174 + stadium.homeEffect + (Math.random() - 0.5) * 24);
    const baseA = Math.round(168 + (Math.random() - 0.5) * 24);
    const w1 = Math.min(8, Math.floor(Math.random() * 5) + 3);
    const w2 = Math.min(9, Math.floor(Math.random() * 5) + 4);

    setRuns1(baseH);
    setWickets1(w1);
    setRuns2(baseA);
    setWickets2(w2);
    setInnings(2);
    setTotalBalls(MAX_BALLS);
    finishMatch(baseH, baseA);
  };

  const progressPct =
    innings === 1
      ? ((totalBalls / MAX_BALLS) * 100) / 2
      : 50 + ((totalBalls / MAX_BALLS) * 100) / 2;

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-5 shadow-[var(--shadow-card)] space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--surface-border)]">
        <div className="flex items-center gap-3">
          <FranchiseBadge type={stadium.badgeType} size={38} />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-scoreboard text-base sm:text-lg font-bold tracking-wide uppercase text-[var(--text-primary)]">
                22-Yard Pitch Simulation: {stadium.venue}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--turf-accent-subtle)] text-[var(--turf-accent)] font-mono font-bold">
                20-Over Match Flow
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Live ball-by-ball 20-over T20 match flow across the 22-yard pitch before revealing statistical results.
            </p>
          </div>
        </div>

        {/* Playback & Speed Controls */}
        <div className="flex items-center gap-2">
          {/* Speed Pills */}
          <div className="inline-flex rounded-lg border border-[var(--surface-border)] p-0.5 bg-[var(--surface-card-subtle)] text-[10px] font-mono">
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded transition-colors ${
                  speed === s
                    ? 'bg-[var(--surface-card)] text-[var(--turf-accent)] font-bold shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {status === 'playing' ? (
            <button
              onClick={handlePause}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-amber-700 transition-all shadow-sm"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[var(--turf-accent)] text-white text-xs font-bold uppercase tracking-wider hover:opacity-95 active:scale-95 transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{status === 'finished' ? 'Replay 20-Over Match' : status === 'paused' ? 'Resume' : 'Start 20-Over Match'}</span>
            </button>
          )}

          <button
            onClick={handleInstantSkip}
            disabled={status === 'finished'}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all disabled:opacity-40"
            title="Skip directly to final result"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Skip</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
            title="Reset match"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Match Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[var(--turf-accent)]" />
            {innings === 1 ? '1st Innings: Home Batting' : '2nd Innings: Away Chasing'}
            <span className="text-[10.5px] px-2 py-0.5 rounded bg-[var(--surface-card-subtle)] text-[var(--text-muted)] font-sans font-semibold">
              {matchPhase}
            </span>
          </span>
          <span className="text-[var(--text-muted)] font-bold">
            Over {oversCompleted}.{ballsInCurrentOver} / 20.0 ov
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[var(--surface-card-subtle)] overflow-hidden border border-[var(--surface-border)]">
          <div
            className="h-full bg-[var(--turf-accent)] transition-all duration-150"
            style={{ width: `${Math.min(100, progressPct)}%` }}
          />
        </div>
      </div>

      {/* Visual Cricket Pitch Graphic */}
      <div className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden border border-emerald-900/40 bg-gradient-to-r from-emerald-900/60 via-emerald-800/40 to-emerald-900/60 flex items-center justify-center p-3 select-none">
        {/* Outfield Grass Striping Pattern */}
        <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(90deg,#000_0px,#000_20px,transparent_20px,transparent_40px)]" />

        {/* 22-Yard Turf Pitch Surface */}
        <div className="relative w-11/12 max-w-2xl h-24 sm:h-28 rounded-lg bg-gradient-to-r from-[#d4b185] via-[#e2c499] to-[#d4b185] shadow-inner border border-amber-900/30 flex items-center justify-between px-6 sm:px-10">
          {/* Bowling Crease (Left) */}
          <div className="flex flex-col items-center">
            <div className="flex gap-1 mb-1">
              <div className="w-1.5 h-6 bg-amber-100 border border-amber-900 rounded-t" />
              <div className="w-1.5 h-6 bg-amber-100 border border-amber-900 rounded-t" />
              <div className="w-1.5 h-6 bg-amber-100 border border-amber-900 rounded-t" />
            </div>
            <div className="w-0.5 h-16 bg-white/90 shadow-sm" />
            <span className="text-[9px] font-mono font-bold text-amber-950 uppercase mt-1">
              Bowling End
            </span>
          </div>

          {/* Center Pitch Markings */}
          <div className="flex flex-col items-center opacity-40">
            <div className="w-24 h-1 border-b border-dashed border-amber-900" />
            <span className="text-[10px] font-mono tracking-widest text-amber-950 mt-1 uppercase font-semibold">
              Good Length Spot (6-8m)
            </span>
          </div>

          {/* Batting Crease (Right) */}
          <div className="flex flex-col items-center">
            <div className="flex gap-1 mb-1">
              <div className="w-1.5 h-6 bg-amber-100 border border-amber-900 rounded-t" />
              <div className="w-1.5 h-6 bg-amber-100 border border-amber-900 rounded-t" />
              <div className="w-1.5 h-6 bg-amber-100 border border-amber-900 rounded-t" />
            </div>
            <div className="w-0.5 h-16 bg-white/90 shadow-sm" />
            <span className="text-[9px] font-mono font-bold text-amber-950 uppercase mt-1">
              Popping Crease
            </span>
          </div>

          {/* Animated Cricket Ball */}
          {ballPosition && (
            <div
              className={`absolute w-4 h-4 rounded-full bg-red-600 border border-red-950 shadow-md transition-all duration-100 z-20 flex items-center justify-center ${
                isBallInAir ? 'scale-125 ring-2 ring-amber-300' : ''
              }`}
              style={{
                left: `${ballPosition.x}%`,
                top: `${ballPosition.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="w-full h-0.5 bg-white/70 rotate-45" />
            </div>
          )}
        </div>

        {/* Live Delivery Event Pill Banner */}
        {latestEvent && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/85 backdrop-blur-md border border-white/20 text-white text-xs font-scoreboard font-bold tracking-wider shadow-lg flex items-center gap-1.5 animate-in fade-in">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{latestEvent}</span>
          </div>
        )}
      </div>

      {/* Live Ball-by-Ball HUD & Over Dots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Current Innings Scoreboard */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-card-subtle)] border border-[var(--surface-border)]">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)] uppercase">
            <span>{innings === 1 ? 'Home (1st Innings)' : 'Away (2nd Innings)'}</span>
            <span className="font-mono text-[var(--turf-accent)]">CRR: {totalBalls > 0 ? ((currentRuns / totalBalls) * 6).toFixed(2) : '0.00'}</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="font-scoreboard text-3xl font-bold text-[var(--text-primary)]">
              {currentRuns}/{currentWickets}
            </div>
            <div className="font-mono text-xs text-[var(--text-muted)]">
              {oversCompleted}.{ballsInCurrentOver} / 20.0 ov
            </div>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1">
            {innings === 2 ? `Target: ${target} runs (Need ${Math.max(0, target - currentRuns)} off ${Math.max(0, MAX_BALLS - totalBalls)}b)` : '20-Over Target Setting'}
          </div>
        </div>

        {/* Current Over Ball Strip */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] flex flex-col justify-between">
          <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center justify-between">
            <span>Over #{oversCompleted + 1} Deliveries:</span>
            <span className="font-mono text-[10px] text-[var(--turf-accent)]">{currentOverBalls.length}/6 balls</span>
          </div>
          <div className="flex items-center gap-2 my-1">
            {Array.from({ length: 6 }).map((_, i) => {
              const val = currentOverBalls[i];
              return (
                <div
                  key={i}
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold border transition-all ${
                    val === '6'
                      ? 'bg-purple-600 text-white border-purple-400'
                      : val === '4'
                      ? 'bg-sky-600 text-white border-sky-400'
                      : val === 'W'
                      ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                      : val
                      ? 'bg-[var(--surface-card)] text-[var(--text-primary)] border-[var(--surface-border)]'
                      : 'bg-black/10 border-dashed border-[var(--surface-border)] text-transparent'
                  }`}
                >
                  {val || '•'}
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] font-mono flex items-center gap-1">
            <Shield className="w-3 h-3 text-[var(--turf-accent)]" />
            <span>Built-in Home Edge: +{stadium.homeEffect} runs active</span>
          </div>
        </div>

        {/* Live Ball-by-Ball Commentary Feed */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] flex flex-col justify-between">
          <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Ball Commentary:</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] italic line-clamp-2 my-1">
            "{commentary}"
          </p>
          <div className="text-[10px] text-[var(--text-muted)] font-mono">
            {stadium.venue.split(' ')[0]} pitch conditions
          </div>
        </div>
      </div>

      {/* Finished Result Banner */}
      {finalResult && (
        <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                20-Over T20 Match Completed!
              </div>
              <div className="text-sm font-scoreboard font-bold text-[var(--text-primary)]">
                {finalResult} ({runs1}/{wickets1} vs {runs2}/{wickets2})
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Exact 20-over innings recorded into the hypothesis test below.
              </div>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Play Next 20-Over Match</span>
          </button>
        </div>
      )}
    </div>
  );
};
