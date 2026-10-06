import React, { useState } from 'react';
import type { SeasonData, StadiumData } from '../types/stats';
import { FranchiseBadge } from './FranchiseBadge';
import { Swords, Trophy, Zap, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HeadToHeadComparisonProps {
  seasonData: SeasonData;
  initialStadiumAId?: string;
  initialStadiumBId?: string;
}

export const HeadToHeadComparison: React.FC<HeadToHeadComparisonProps> = ({
  seasonData,
  initialStadiumAId = 'rcb',
  initialStadiumBId = 'csk',
}) => {
  const [stadiumAId, setStadiumAId] = useState<string>(initialStadiumAId);
  const [stadiumBId, setStadiumBId] = useState<string>(initialStadiumBId);
  const [clashResult, setClashResult] = useState<{
    winner: 'A' | 'B' | 'tie';
    scoreA: number;
    scoreB: number;
    venueName: string;
    summary: string;
  } | null>(null);

  const stadiumA: StadiumData =
    seasonData.stadiums.find((s) => s.config.id === stadiumAId) || seasonData.stadiums[0];
  const stadiumB: StadiumData =
    seasonData.stadiums.find((s) => s.config.id === stadiumBId) || seasonData.stadiums[1];

  const handleSimulateClash = (host: 'A' | 'B') => {
    const hostStadium = host === 'A' ? stadiumA : stadiumB;
    const visitorStadium = host === 'A' ? stadiumB : stadiumA;

    // Home team gets homeMean, visitor gets awayMean
    const baseHome = hostStadium.stats.meanHome;
    const baseAway = visitorStadium.stats.meanAway;

    // Random noise +/- 18 runs
    const scoreHost = Math.round(baseHome + (Math.random() - 0.5) * 32);
    const scoreVisitor = Math.round(baseAway + (Math.random() - 0.5) * 32);

    let winner: 'A' | 'B' | 'tie';
    if (scoreHost > scoreVisitor) {
      winner = host === 'A' ? 'A' : 'B';
    } else if (scoreVisitor > scoreHost) {
      winner = host === 'A' ? 'B' : 'A';
    } else {
      winner = 'tie';
    }

    const winnerName =
      winner === 'A' ? stadiumA.config.franchise : winner === 'B' ? stadiumB.config.franchise : 'Tie';

    setClashResult({
      winner,
      scoreA: host === 'A' ? scoreHost : scoreVisitor,
      scoreB: host === 'B' ? scoreHost : scoreVisitor,
      venueName: hostStadium.config.venue,
      summary:
        winner === 'tie'
          ? `Tied match at ${hostStadium.config.venue}! Super Over thriller!`
          : `${winnerName} claims victory by ${Math.abs(scoreHost - scoreVisitor)} runs at ${hostStadium.config.venue}!`,
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-5 sm:p-6 shadow-[var(--shadow-card)] space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--surface-border)]">
        <div>
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-[var(--turf-accent)]" />
            <h2 className="font-scoreboard text-lg sm:text-xl font-bold uppercase tracking-wide text-[var(--text-primary)]">
              Head-to-Head Stadium & Franchise Comparison
            </h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Compare fortress factors, statistical significance, and scoring environments across any two IPL grounds.
          </p>
        </div>

        <div className="text-xs font-mono text-[var(--text-muted)]">
          Season #{seasonData.seasonId} Live Records
        </div>
      </div>

      {/* Selectors and Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stadium A Card */}
        <div className="p-5 rounded-2xl bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--home-brand)]">
              Venue Profile A
            </span>
            <select
              value={stadiumAId}
              onChange={(e) => setStadiumAId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--turf-accent)]"
            >
              {seasonData.stadiums.map((s) => (
                <option key={s.config.id} value={s.config.id}>
                  {s.config.franchise} ({s.config.venue})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3.5">
            <FranchiseBadge type={stadiumA.config.badgeType} size={48} />
            <div>
              <h3 className="font-scoreboard text-base sm:text-lg font-bold text-[var(--text-primary)]">
                {stadiumA.config.venue}
              </h3>
              <div className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>{stadiumA.config.city}</span>
                <span>&bull;</span>
                <span>Cap: {stadiumA.config.capacity}</span>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center">
              <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Home Mean</div>
              <div className="text-base font-scoreboard font-bold text-[var(--home-brand)]">
                {stadiumA.stats.meanHome.toFixed(1)}
              </div>
              <div className="text-[9.5px] text-[var(--text-muted)]">SD: {stadiumA.stats.sdHome.toFixed(1)}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center">
              <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Net Edge</div>
              <div className="text-base font-scoreboard font-bold text-[var(--text-primary)]">
                {stadiumA.stats.meanDiff > 0 ? `+${stadiumA.stats.meanDiff.toFixed(1)}` : stadiumA.stats.meanDiff.toFixed(1)}
              </div>
              <div className="text-[9.5px] text-[var(--text-muted)]">Built-in: +{stadiumA.config.homeEffect}r</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center">
              <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">p-Value</div>
              <div className="text-base font-mono font-bold text-sky-500">
                {stadiumA.stats.pValue < 0.01 ? '<0.01' : stadiumA.stats.pValue.toFixed(3)}
              </div>
              <div className="text-[9.5px] font-bold">
                {stadiumA.stats.isSignificant ? (
                  <span className="text-emerald-500">Sig (p&lt;0.05)</span>
                ) : (
                  <span className="text-amber-500">Inconclusive</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSimulateClash('A')}
            className="w-full py-2 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] hover:border-[var(--turf-accent)] text-xs font-semibold text-[var(--text-primary)] flex items-center justify-center gap-2 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-[var(--turf-accent)]" />
            <span>Host Clash at {stadiumA.config.venue.split(' ')[0]}</span>
          </button>
        </div>

        {/* Stadium B Card */}
        <div className="p-5 rounded-2xl bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--away-brand)]">
              Venue Profile B
            </span>
            <select
              value={stadiumBId}
              onChange={(e) => setStadiumBId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--turf-accent)]"
            >
              {seasonData.stadiums.map((s) => (
                <option key={s.config.id} value={s.config.id}>
                  {s.config.franchise} ({s.config.venue})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3.5">
            <FranchiseBadge type={stadiumB.config.badgeType} size={48} />
            <div>
              <h3 className="font-scoreboard text-base sm:text-lg font-bold text-[var(--text-primary)]">
                {stadiumB.config.venue}
              </h3>
              <div className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>{stadiumB.config.city}</span>
                <span>&bull;</span>
                <span>Cap: {stadiumB.config.capacity}</span>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center">
              <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Home Mean</div>
              <div className="text-base font-scoreboard font-bold text-[var(--away-brand)]">
                {stadiumB.stats.meanHome.toFixed(1)}
              </div>
              <div className="text-[9.5px] text-[var(--text-muted)]">SD: {stadiumB.stats.sdHome.toFixed(1)}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center">
              <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Net Edge</div>
              <div className="text-base font-scoreboard font-bold text-[var(--text-primary)]">
                {stadiumB.stats.meanDiff > 0 ? `+${stadiumB.stats.meanDiff.toFixed(1)}` : stadiumB.stats.meanDiff.toFixed(1)}
              </div>
              <div className="text-[9.5px] text-[var(--text-muted)]">Built-in: +{stadiumB.config.homeEffect}r</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center">
              <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">p-Value</div>
              <div className="text-base font-mono font-bold text-sky-500">
                {stadiumB.stats.pValue < 0.01 ? '<0.01' : stadiumB.stats.pValue.toFixed(3)}
              </div>
              <div className="text-[9.5px] font-bold">
                {stadiumB.stats.isSignificant ? (
                  <span className="text-emerald-500">Sig (p&lt;0.05)</span>
                ) : (
                  <span className="text-amber-500">Inconclusive</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSimulateClash('B')}
            className="w-full py-2 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] hover:border-[var(--turf-accent)] text-xs font-semibold text-[var(--text-primary)] flex items-center justify-center gap-2 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-[var(--turf-accent)]" />
            <span>Host Clash at {stadiumB.config.venue.split(' ')[0]}</span>
          </button>
        </div>
      </div>

      {/* Clash Result Banner */}
      {clashResult && (
        <div className="p-4 rounded-xl border border-[var(--turf-accent)] bg-[var(--turf-accent-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--turf-accent)] text-white flex items-center justify-center font-scoreboard font-bold text-lg shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--turf-accent)]">
                Simulated Match Result
              </div>
              <div className="font-scoreboard text-base sm:text-lg font-bold text-[var(--text-primary)]">
                {stadiumA.config.franchise} <span className="font-mono text-[var(--home-brand)]">{clashResult.scoreA}</span> vs{' '}
                <span className="font-mono text-[var(--away-brand)]">{clashResult.scoreB}</span> {stadiumB.config.franchise}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{clashResult.summary}</p>
            </div>
          </div>

          <button
            onClick={() => setClashResult(null)}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Comparative Diff Bar Breakdown */}
      <div className="p-4 rounded-xl bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
          Comparative Advantage Radar
        </h4>

        <div className="space-y-2.5 text-xs">
          {/* Home Edge Differential */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-[var(--text-muted)]">Home Edge Advantage</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">
                {stadiumA.stats.meanDiff > stadiumB.stats.meanDiff
                  ? `${stadiumA.config.franchise.split(' ').slice(-1)[0]} (+${(stadiumA.stats.meanDiff - stadiumB.stats.meanDiff).toFixed(1)}r)`
                  : `${stadiumB.config.franchise.split(' ').slice(-1)[0]} (+${(stadiumB.stats.meanDiff - stadiumA.stats.meanDiff).toFixed(1)}r)`}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--surface-card)] overflow-hidden flex border border-[var(--surface-border)]">
              <div
                className="h-full bg-[var(--home-brand)] transition-all"
                style={{
                  width: `${Math.max(15, Math.min(85, (stadiumA.stats.meanDiff / (stadiumA.stats.meanDiff + stadiumB.stats.meanDiff || 1)) * 100))}%`,
                }}
              />
              <div
                className="h-full bg-[var(--away-brand)] transition-all"
                style={{
                  width: `${Math.max(15, Math.min(85, (stadiumB.stats.meanDiff / (stadiumA.stats.meanDiff + stadiumB.stats.meanDiff || 1)) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Overall Scoring Environment */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-[var(--text-muted)]">Scoring Friendliness (Average Innings Runs)</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">
                {((stadiumA.stats.meanHome + stadiumA.stats.meanAway) / 2).toFixed(1)}r vs{' '}
                {((stadiumB.stats.meanHome + stadiumB.stats.meanAway) / 2).toFixed(1)}r
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--surface-card)] overflow-hidden flex border border-[var(--surface-border)]">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{
                  width: `${((stadiumA.stats.meanHome + stadiumA.stats.meanAway) / (stadiumA.stats.meanHome + stadiumA.stats.meanAway + stadiumB.stats.meanHome + stadiumB.stats.meanAway)) * 100}%`,
                }}
              />
              <div
                className="h-full bg-amber-500 transition-all"
                style={{
                  width: `${((stadiumB.stats.meanHome + stadiumB.stats.meanAway) / (stadiumA.stats.meanHome + stadiumA.stats.meanAway + stadiumB.stats.meanHome + stadiumB.stats.meanAway)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
