import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { StadiumData, Innings } from '../types/stats';
import { FranchiseBadge } from './FranchiseBadge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Zap, 
  Trophy, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LiveMatchSimulatorProps {
  stadium: StadiumData;
  onAddMatchToDataset?: (homeInnings: Innings, awayInnings: Innings) => void;
}

interface OverEvent {
  overNum: number;
  runs: number;
  wickets: number;
  commentary: string;
}

export const LiveMatchSimulator: React.FC<LiveMatchSimulatorProps> = ({
  stadium,
  onAddMatchToDataset,
}) => {
  // Match state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(600); // ms per over
  const [currentInnings, setCurrentInnings] = useState<1 | 2>(1);
  const [over, setOver] = useState<number>(0);
  const [runs1, setRuns1] = useState<number>(0);
  const [wickets1, setWickets1] = useState<number>(0);
  const [oversHistory1, setOversHistory1] = useState<OverEvent[]>([]);

  const [runs2, setRuns2] = useState<number>(0);
  const [wickets2, setWickets2] = useState<number>(0);
  const [oversHistory2, setOversHistory2] = useState<OverEvent[]>([]);

  const [isMatchFinished, setIsMatchFinished] = useState<boolean>(false);
  const [matchResultText, setMatchResultText] = useState<string>('');
  const [matchAdded, setMatchAdded] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  // Home and Away identities
  const homeFranchise = stadium.config.franchise;
  const awayFranchise = 'Visiting Challengers';
  const target = runs1 + 1;

  // Win Probability calculation (dynamic based on overs, wickets, runs needed, and home effect)
  const calculateHomeWinProb = (): number => {
    if (currentInnings === 1) {
      // 1st innings: based on projected score compared to stadium home mean
      const projected = over > 0 ? (runs1 / over) * 20 : stadium.stats.meanHome;
      const baseline = stadium.stats.meanAway;
      const prob = 50 + (projected - baseline) * 1.5 - wickets1 * 3;
      return Math.max(10, Math.min(90, Math.round(prob)));
    } else {
      // 2nd innings: Away chasing target
      if (isMatchFinished) {
        if (runs2 >= target) return 0;
        if (runs2 < target - 1) return 100;
        return 50;
      }
      const ballsLeft = Math.max(1, (20 - over) * 6);
      const runsNeeded = Math.max(0, target - runs2);
      const rrr = (runsNeeded / ballsLeft) * 6;

      let awayChance = 50;
      if (rrr <= 6) awayChance = 85;
      else if (rrr <= 8.5) awayChance = 65;
      else if (rrr <= 11) awayChance = 45;
      else if (rrr <= 14) awayChance = 25;
      else awayChance = 10;

      awayChance -= wickets2 * 7;
      // Home fortress factor dampens away chance
      awayChance -= stadium.config.homeEffect * 0.8;

      const homeChance = 100 - Math.max(5, Math.min(95, Math.round(awayChance)));
      return Math.max(5, Math.min(95, homeChance));
    }
  };

  const homeWinProb = calculateHomeWinProb();

  // Commentary phrases
  const getRandomCommentary = (runsInOver: number, wicketsInOver: number): string => {
    if (wicketsInOver > 0 && runsInOver >= 10) {
      return `Eventful over! Wicket falls, but two massive counter-punching boundaries struck!`;
    }
    if (wicketsInOver > 0) {
      return `TIMBER! Direct hit rattles the stumps! Huge breakthrough for the bowling attack!`;
    }
    if (runsInOver >= 18) {
      return `Carnage! Back-to-back sixes sent into the top tier of ${stadium.config.venue.split(' ')[0]}!`;
    }
    if (runsInOver >= 12) {
      return `Clever batting! Pierces the gap through covers for four, keeping the scoreboard moving.`;
    }
    if (runsInOver <= 3) {
      return `Tidy bowling! Tight length outside off gives away almost nothing in this over.`;
    }
    return `Rotating strike well with smart singles and twos into deep midwicket.`;
  };

  // Step one over forward
  const stepOneOver = useCallback(() => {
    if (isMatchFinished) return;

    if (currentInnings === 1) {
      const nextOver = over + 1;
      // Simulate over runs (typically 4 to 18 runs)
      const baseMeanPerOver = (stadium.stats.meanHome + stadium.config.homeEffect) / 20;
      const overRuns = Math.max(
        1,
        Math.min(26, Math.round(baseMeanPerOver + (Math.random() - 0.45) * 8))
      );
      // Wicket probability: ~12% per over
      const wicket = Math.random() < 0.18 && wickets1 < 9 ? 1 : 0;

      const newRuns = runs1 + overRuns;
      const newWickets = wickets1 + wicket;

      setRuns1(newRuns);
      setWickets1(newWickets);
      setOver(nextOver);
      setOversHistory1((prev) => [
        ...prev,
        {
          overNum: nextOver,
          runs: overRuns,
          wickets: wicket,
          commentary: getRandomCommentary(overRuns, wicket),
        },
      ]);

      if (nextOver >= 20 || newWickets >= 10) {
        // End 1st innings
        setCurrentInnings(2);
        setOver(0);
      }
    } else {
      // 2nd innings
      const nextOver = over + 1;
      const baseMeanPerOver = stadium.stats.meanAway / 20;
      const overRuns = Math.max(
        1,
        Math.min(26, Math.round(baseMeanPerOver + (Math.random() - 0.48) * 8))
      );
      const wicket = Math.random() < 0.22 && wickets2 < 9 ? 1 : 0;

      const newRuns = runs2 + overRuns;
      const newWickets = wickets2 + wicket;

      setRuns2(newRuns);
      setWickets2(newWickets);
      setOver(nextOver);
      setOversHistory2((prev) => [
        ...prev,
        {
          overNum: nextOver,
          runs: overRuns,
          wickets: wicket,
          commentary: getRandomCommentary(overRuns, wicket),
        },
      ]);

      // Check match end conditions
      if (newRuns >= target) {
        setIsMatchFinished(true);
        setIsPlaying(false);
        const marginWickets = 10 - newWickets;
        setMatchResultText(
          `${awayFranchise} won by ${marginWickets} wicket${marginWickets > 1 ? 's' : ''}!`
        );
      } else if (nextOver >= 20 || newWickets >= 10) {
        setIsMatchFinished(true);
        setIsPlaying(false);
        if (newRuns === target - 1) {
          setMatchResultText(`Match Tied! Super Over required!`);
        } else {
          const marginRuns = target - 1 - newRuns;
          setMatchResultText(
            `${homeFranchise} won by ${marginRuns} run${marginRuns > 1 ? 's' : ''} at their home ground!`
          );
          try {
            confetti({
              particleCount: 70,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {
            // ignore
          }
        }
      }
    }
  }, [
    isMatchFinished,
    currentInnings,
    over,
    runs1,
    wickets1,
    runs2,
    wickets2,
    target,
    stadium.stats.meanHome,
    stadium.stats.meanAway,
    stadium.config.homeEffect,
    stadium.config.venue,
    homeFranchise,
    awayFranchise,
  ]);

  // Play loop
  useEffect(() => {
    if (isPlaying && !isMatchFinished) {
      timerRef.current = window.setTimeout(() => {
        stepOneOver();
      }, simulationSpeed);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, isMatchFinished, simulationSpeed, stepOneOver]);

  const handleResetMatch = () => {
    setIsPlaying(false);
    setCurrentInnings(1);
    setOver(0);
    setRuns1(0);
    setWickets1(0);
    setOversHistory1([]);
    setRuns2(0);
    setWickets2(0);
    setOversHistory2([]);
    setIsMatchFinished(false);
    setMatchResultText('');
    setMatchAdded(false);
  };

  const handleSimulateInstant = () => {
    handleResetMatch();
    // Simulate whole match in one shot
    const baseH = Math.round(stadium.stats.meanHome + (Math.random() - 0.5) * 20);
    const baseA = Math.round(stadium.stats.meanAway + (Math.random() - 0.5) * 20);
    const w1 = Math.floor(Math.random() * 8) + 2;
    const w2 = Math.floor(Math.random() * 8) + 2;

    setRuns1(baseH);
    setWickets1(w1);
    setRuns2(baseA);
    setWickets2(w2);
    setOver(20);
    setCurrentInnings(2);
    setIsMatchFinished(true);

    if (baseH > baseA) {
      setMatchResultText(`${homeFranchise} won by ${baseH - baseA} runs at home!`);
      try {
        confetti({ particleCount: 60, spread: 60 });
      } catch {
        // ignore
      }
    } else if (baseA > baseH) {
      setMatchResultText(`${awayFranchise} won by ${10 - w2} wickets!`);
    } else {
      setMatchResultText(`Match Tied! Super Over!`);
    }
  };

  const handleAddResultToDataset = () => {
    if (!onAddMatchToDataset || matchAdded) return;
    const hInning: Innings = {
      id: `${stadium.config.id}-live-h-${Date.now()}`,
      matchIndex: stadium.homeInnings.length + 1,
      runs: runs1,
      venueId: stadium.config.id,
      type: 'home',
      seasonId: 1,
    };
    const aInning: Innings = {
      id: `${stadium.config.id}-live-a-${Date.now()}`,
      matchIndex: stadium.awayInnings.length + 1,
      runs: runs2,
      venueId: stadium.config.id,
      type: 'away',
      seasonId: 1,
    };

    onAddMatchToDataset(hInning, aInning);
    setMatchAdded(true);
  };

  const activeHistory = currentInnings === 1 ? oversHistory1 : oversHistory2;
  const latestEvent = activeHistory[activeHistory.length - 1];

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-5 sm:p-6 shadow-[var(--shadow-card)] space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--surface-border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--turf-accent-subtle)] border border-[var(--turf-accent)]/30 flex items-center justify-center text-[var(--turf-accent)]">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-scoreboard text-base sm:text-lg font-bold tracking-wide uppercase text-[var(--text-primary)]">
                Live Match Simulator & Win Probability Meter
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--turf-accent-subtle)] text-[var(--turf-accent)] font-bold uppercase tracking-wider">
                Live Engine
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Simulate an animated 20-over fixture at {stadium.config.venue} to see real-time win probability and innings progression.
            </p>
          </div>
        </div>

        {/* Speed & Controls */}
        <div className="flex items-center gap-2">
          {/* Speed Pills */}
          <div className="hidden sm:inline-flex rounded-lg border border-[var(--surface-border)] p-0.5 bg-[var(--surface-card-subtle)] text-[10px] font-mono">
            {[
              { label: '1x', speed: 750 },
              { label: '2x', speed: 400 },
              { label: '4x', speed: 180 },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => setSimulationSpeed(s.speed)}
                className={`px-2 py-1 rounded transition-colors ${
                  simulationSpeed === s.speed
                    ? 'bg-[var(--surface-card)] text-[var(--turf-accent)] font-bold shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={isMatchFinished}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white transition-all shadow-sm ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-[var(--turf-accent)] hover:opacity-95'
            } disabled:opacity-40`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play Live'}</span>
          </button>

          <button
            onClick={stepOneOver}
            disabled={isPlaying || isMatchFinished}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all disabled:opacity-40"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>+1 Over</span>
          </button>

          <button
            onClick={handleSimulateInstant}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            title="Simulate complete fixture immediately"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Instant</span>
          </button>

          <button
            onClick={handleResetMatch}
            className="p-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
            title="Reset match"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Broadcast Scoreboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Innings 1 (Home Team) */}
        <div className={`p-4 rounded-xl border transition-all ${
          currentInnings === 1 && !isMatchFinished
            ? 'bg-[var(--surface-card-subtle)] border-[var(--home-brand)] ring-1 ring-[var(--home-brand)]/40'
            : 'bg-[var(--surface-card-subtle)] border-[var(--surface-border)] opacity-85'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FranchiseBadge type={stadium.config.badgeType} size={32} />
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">
                  {homeFranchise}
                </span>
                <span className="text-[10px] text-[var(--home-brand)] font-semibold uppercase">
                  Home Team Batting (1st Innings)
                </span>
              </div>
            </div>
            {currentInnings === 1 && !isMatchFinished && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-[var(--turf-accent)] animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[var(--turf-accent)]" /> Batting
              </span>
            )}
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="font-scoreboard text-3xl sm:text-4xl font-bold text-[var(--home-brand)] tracking-tight">
              {runs1}/{wickets1}
            </div>
            <div className="font-mono text-sm text-[var(--text-muted)]">
              {currentInnings === 1 ? over : 20}.0 ov
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-[var(--surface-border)] flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
            <span>CRR: {currentInnings === 1 && over > 0 ? (runs1 / over).toFixed(2) : (runs1 / 20).toFixed(2)}</span>
            <span>Target: {runs1 > 0 ? target : '-'}</span>
          </div>
        </div>

        {/* Innings 2 (Away Team) */}
        <div className={`p-4 rounded-xl border transition-all ${
          currentInnings === 2 && !isMatchFinished
            ? 'bg-[var(--surface-card-subtle)] border-[var(--away-brand)] ring-1 ring-[var(--away-brand)]/40'
            : 'bg-[var(--surface-card-subtle)] border-[var(--surface-border)] opacity-85'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--away-brand)] text-white flex items-center justify-center font-scoreboard font-bold text-sm">
                A
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">
                  {awayFranchise}
                </span>
                <span className="text-[10px] text-[var(--away-brand)] font-semibold uppercase">
                  Away Team Chasing (2nd Innings)
                </span>
              </div>
            </div>
            {currentInnings === 2 && !isMatchFinished && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-[var(--away-brand)] animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[var(--away-brand)]" /> Chasing
              </span>
            )}
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="font-scoreboard text-3xl sm:text-4xl font-bold text-[var(--away-brand)] tracking-tight">
              {runs2}/{wickets2}
            </div>
            <div className="font-mono text-sm text-[var(--text-muted)]">
              {currentInnings === 2 ? over : isMatchFinished ? over : 0}.0 ov
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-[var(--surface-border)] flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
            <span>
              CRR: {currentInnings === 2 && over > 0 ? (runs2 / over).toFixed(2) : '0.00'}
            </span>
            <span>
              {currentInnings === 2 && !isMatchFinished
                ? `Need ${Math.max(0, target - runs2)} in ${(20 - over) * 6}b`
                : isMatchFinished
                ? 'Innings Closed'
                : 'Yet to bat'}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Win Probability Meter */}
      <div className="p-4 rounded-xl bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--home-brand)] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            {homeFranchise.split(' ').slice(-1)[0]} (Home) {homeWinProb}%
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Live Win Probability Gauge
          </span>
          <span className="font-bold text-[var(--away-brand)]">
            {awayFranchise} {100 - homeWinProb}%
          </span>
        </div>

        {/* Bi-directional progress bar */}
        <div className="w-full h-3 rounded-full bg-[var(--surface-card)] overflow-hidden flex border border-[var(--surface-border)]">
          <div
            className="h-full bg-[var(--home-brand)] transition-all duration-300"
            style={{ width: `${homeWinProb}%` }}
          />
          <div
            className="h-full bg-[var(--away-brand)] transition-all duration-300"
            style={{ width: `${100 - homeWinProb}%` }}
          />
        </div>

        <div className="text-[10.5px] text-[var(--text-muted)] text-center">
          Stadium Ground Bias: <strong className="text-[var(--turf-accent)]">+{stadium.config.homeEffect} runs built-in</strong> factor applied to live odds.
        </div>
      </div>

      {/* Commentary & Events Feed */}
      <div className="p-3.5 rounded-xl bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] space-y-2">
        <div className="flex items-center justify-between text-xs pb-1 border-b border-[var(--surface-border)]">
          <span className="font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Match Highlights & Commentary
          </span>
          {latestEvent && (
            <span className="font-mono text-[11px] text-[var(--turf-accent)] font-bold">
              Over {latestEvent.overNum}: +{latestEvent.runs} runs ({latestEvent.wickets} wkt)
            </span>
          )}
        </div>

        <p className="text-xs text-[var(--text-secondary)] italic">
          {latestEvent
            ? latestEvent.commentary
            : `Match ready to commence at ${stadium.config.venue}. Click "Play Live" or "+1 Over" to bowl the first over.`}
        </p>

        {/* Mini wagon / worm progress bars for current innings */}
        {activeHistory.length > 0 && (
          <div className="flex items-end gap-1 h-12 pt-2">
            {activeHistory.map((ev, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-0.5 group relative"
              >
                <div
                  className={`w-full rounded-t transition-all ${
                    ev.wickets > 0
                      ? 'bg-rose-500'
                      : currentInnings === 1
                      ? 'bg-[var(--home-brand)]'
                      : 'bg-[var(--away-brand)]'
                  }`}
                  style={{ height: `${Math.min(40, ev.runs * 2)}px` }}
                />
                <span className="text-[8px] font-mono text-[var(--text-muted)]">
                  {ev.overNum}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Match Result & Inject Button Banner */}
      {isMatchFinished && (
        <div className="p-4 rounded-xl border border-emerald-500/50 bg-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Match Completed!
              </div>
              <div className="text-sm font-scoreboard font-bold text-[var(--text-primary)]">
                {matchResultText}
              </div>
            </div>
          </div>

          {onAddMatchToDataset && (
            <button
              onClick={handleAddResultToDataset}
              disabled={matchAdded}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
            >
              {matchAdded ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Added to Hypothesis Data</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Stadium Dataset</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
