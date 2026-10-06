import React, { useState, useMemo } from 'react';
import type { Innings, StadiumData } from '../types/stats';
import { FranchiseBadge } from './FranchiseBadge';
import { recalculateStadiumStats } from '../lib/simulator';
import { 
  Edit3, 
  Plus, 
  RotateCcw, 
  Check, 
  Trophy, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Filter
} from 'lucide-react';

interface MatchInspectorProps {
  stadium: StadiumData;
  alpha?: number;
  onUpdateInnings: (homeInnings: Innings[], awayInnings: Innings[]) => void;
  onResetStadium: () => void;
}

interface MatchPair {
  matchIndex: number;
  homeInning: Innings;
  awayInning: Innings;
  margin: number;
  winner: 'home' | 'away' | 'tie';
}

export const MatchInspector: React.FC<MatchInspectorProps> = ({
  stadium,
  alpha = 0.05,
  onUpdateInnings,
  onResetStadium,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editHomeScore, setEditHomeScore] = useState<number>(170);
  const [editAwayScore, setEditAwayScore] = useState<number>(170);
  const [filterMode, setFilterMode] = useState<'all' | 'home-win' | 'away-win'>('all');

  // Form for adding custom match
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHomeScore, setNewHomeScore] = useState(185);
  const [newAwayScore, setNewAwayScore] = useState(165);

  // Group home & away innings into match pairs
  const matchPairs: MatchPair[] = useMemo(() => {
    const pairs: MatchPair[] = [];
    const count = Math.max(stadium.homeInnings.length, stadium.awayInnings.length);

    for (let i = 0; i < count; i++) {
      const h = stadium.homeInnings[i] || {
        id: `${stadium.config.id}-h-custom-${i + 1}`,
        matchIndex: i + 1,
        runs: 160,
        venueId: stadium.config.id,
        type: 'home' as const,
        seasonId: 1,
      };
      const a = stadium.awayInnings[i] || {
        id: `${stadium.config.id}-a-custom-${i + 1}`,
        matchIndex: i + 1,
        runs: 160,
        venueId: stadium.config.id,
        type: 'away' as const,
        seasonId: 1,
      };

      const diff = h.runs - a.runs;
      pairs.push({
        matchIndex: i + 1,
        homeInning: h,
        awayInning: a,
        margin: Math.abs(diff),
        winner: diff > 0 ? 'home' : diff < 0 ? 'away' : 'tie',
      });
    }

    return pairs;
  }, [stadium.homeInnings, stadium.awayInnings, stadium.config.id]);

  const filteredPairs = useMemo(() => {
    if (filterMode === 'home-win') return matchPairs.filter((p) => p.winner === 'home');
    if (filterMode === 'away-win') return matchPairs.filter((p) => p.winner === 'away');
    return matchPairs;
  }, [matchPairs, filterMode]);

  const homeWinsCount = matchPairs.filter((p) => p.winner === 'home').length;
  const awayWinsCount = matchPairs.filter((p) => p.winner === 'away').length;
  const homeWinPct = matchPairs.length > 0 ? ((homeWinsCount / matchPairs.length) * 100).toFixed(1) : '0';

  const startEdit = (pair: MatchPair) => {
    setEditingIndex(pair.matchIndex);
    setEditHomeScore(pair.homeInning.runs);
    setEditAwayScore(pair.awayInning.runs);
  };

  const saveEdit = (pair: MatchPair) => {
    const updatedHome = [...stadium.homeInnings];
    const updatedAway = [...stadium.awayInnings];

    const idx = pair.matchIndex - 1;
    if (idx < updatedHome.length) {
      updatedHome[idx] = { ...updatedHome[idx], runs: Number(editHomeScore) };
    }
    if (idx < updatedAway.length) {
      updatedAway[idx] = { ...updatedAway[idx], runs: Number(editAwayScore) };
    }

    onUpdateInnings(updatedHome, updatedAway);
    setEditingIndex(null);
  };

  const handleAddMatch = () => {
    const nextIdx = matchPairs.length + 1;
    const newH: Innings = {
      id: `${stadium.config.id}-h-user-${nextIdx}`,
      matchIndex: nextIdx,
      runs: Math.max(80, Math.min(270, Number(newHomeScore))),
      venueId: stadium.config.id,
      type: 'home',
      seasonId: 1,
    };
    const newA: Innings = {
      id: `${stadium.config.id}-a-user-${nextIdx}`,
      matchIndex: nextIdx,
      runs: Math.max(80, Math.min(270, Number(newAwayScore))),
      venueId: stadium.config.id,
      type: 'away',
      seasonId: 1,
    };

    onUpdateInnings([...stadium.homeInnings, newH], [...stadium.awayInnings, newA]);
    setShowAddForm(false);
  };

  // Current stats recalculated
  const currentStats = useMemo(() => {
    return recalculateStadiumStats(stadium.homeInnings, stadium.awayInnings, alpha);
  }, [stadium.homeInnings, stadium.awayInnings, alpha]);

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-5 shadow-[var(--shadow-card)] space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--surface-border)]">
        <div className="flex items-center gap-3">
          <FranchiseBadge type={stadium.config.badgeType} size={36} />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-scoreboard text-base sm:text-lg font-bold tracking-wide uppercase text-[var(--text-primary)]">
                Match Inspector & "What-If" Editor
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] font-mono text-[var(--text-secondary)]">
                {stadium.config.venue}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Inspect simulated match scores, adjust runs in real-time, and watch how single outliers sway p-values.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--turf-accent)] text-white text-xs font-semibold hover:opacity-95 active:scale-95 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Match</span>
          </button>
          <button
            onClick={onResetStadium}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            title="Reset stadium innings to freshly sampled simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[var(--surface-card-subtle)] border border-[var(--surface-border)]">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
            Home Win Rate
          </div>
          <div className="mt-1 text-xl font-scoreboard font-bold text-[var(--turf-accent)]">
            {homeWinPct}%
          </div>
          <div className="text-[10.5px] text-[var(--text-muted)] mt-0.5">
            {homeWinsCount} W / {awayWinsCount} L ({matchPairs.length} matches)
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--surface-card-subtle)] border border-[var(--surface-border)]">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
            Mean Run Edge
          </div>
          <div className="mt-1 text-xl font-scoreboard font-bold text-[var(--text-primary)]">
            {currentStats.meanDiff > 0 ? `+${currentStats.meanDiff.toFixed(1)}` : currentStats.meanDiff.toFixed(1)} runs
          </div>
          <div className="text-[10.5px] text-[var(--text-muted)] mt-0.5 font-mono">
            x̄H: {currentStats.meanHome.toFixed(1)} vs x̄A: {currentStats.meanAway.toFixed(1)}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--surface-card-subtle)] border border-[var(--surface-border)]">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
            Welch t-Stat
          </div>
          <div className="mt-1 text-xl font-scoreboard font-bold text-sky-500">
            {currentStats.tStat.toFixed(3)}
          </div>
          <div className="text-[10.5px] text-[var(--text-muted)] mt-0.5 font-mono">
            t-Crit: {currentStats.tCrit.toFixed(3)} (df={currentStats.df.toFixed(1)})
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--surface-card-subtle)] border border-[var(--surface-border)]">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
            Hypothesis Verdict
          </div>
          <div className={`mt-1 text-sm font-bold uppercase tracking-tight flex items-center gap-1.5 ${
            currentStats.isSignificant ? 'text-emerald-500' : 'text-amber-500'
          }`}>
            <span className={`w-2 h-2 rounded-full ${currentStats.isSignificant ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {currentStats.isSignificant ? 'Reject H₀' : 'Fail to Reject'}
          </div>
          <div className="text-[10.5px] text-[var(--text-muted)] mt-0.5 font-mono">
            p = {currentStats.pValue < 0.0001 ? '< 0.0001' : currentStats.pValue.toFixed(4)} (α={alpha})
          </div>
        </div>
      </div>

      {/* Add Custom Match Bar (if active) */}
      {showAddForm && (
        <div className="p-4 rounded-xl border border-[var(--turf-accent)]/50 bg-[var(--turf-accent-subtle)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--turf-accent)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Inject Custom Match Innings
            </span>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1">
                Home Runs ({stadium.config.franchise.split(' ').slice(-1)[0]}):
              </label>
              <input
                type="number"
                min="80"
                max="280"
                value={newHomeScore}
                onChange={(e) => setNewHomeScore(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] text-sm font-mono font-bold text-[var(--home-brand)] focus:outline-none focus:border-[var(--turf-accent)]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1">
                Away Team Runs:
              </label>
              <input
                type="number"
                min="80"
                max="280"
                value={newAwayScore}
                onChange={(e) => setNewAwayScore(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] text-sm font-mono font-bold text-[var(--away-brand)] focus:outline-none focus:border-[var(--turf-accent)]"
              />
            </div>
            <button
              onClick={handleAddMatch}
              className="w-full py-2 rounded-lg bg-[var(--turf-accent)] text-white text-xs font-bold uppercase tracking-wider hover:opacity-95 transition-all shadow-sm"
            >
              Confirm Match Addition
            </button>
          </div>
        </div>
      )}

      {/* Filter and View Bar */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Filter:
          </span>
          <div className="inline-flex rounded-lg border border-[var(--surface-border)] p-0.5 bg-[var(--surface-card-subtle)] text-[11px]">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterMode === 'all'
                  ? 'bg-[var(--surface-card)] text-[var(--text-primary)] font-bold shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              All ({matchPairs.length})
            </button>
            <button
              onClick={() => setFilterMode('home-win')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterMode === 'home-win'
                  ? 'bg-[var(--surface-card)] text-[var(--home-brand)] font-bold shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Home Wins ({homeWinsCount})
            </button>
            <button
              onClick={() => setFilterMode('away-win')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterMode === 'away-win'
                  ? 'bg-[var(--surface-card)] text-[var(--away-brand)] font-bold shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Away Wins ({awayWinsCount})
            </button>
          </div>
        </div>

        <span className="text-[11px] text-[var(--text-muted)]">
          Click any score or edit icon to tweak numbers
        </span>
      </div>

      {/* Match List Table */}
      <div className="border border-[var(--surface-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-96 scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[var(--surface-card-subtle)] border-b border-[var(--surface-border)] text-[var(--text-muted)] font-mono uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Home Score (x̄H)</th>
                <th className="py-2.5 px-3">Away Score (x̄A)</th>
                <th className="py-2.5 px-3">Margin</th>
                <th className="py-2.5 px-3">Result</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-border)] font-mono">
              {filteredPairs.map((pair) => {
                const isEditing = editingIndex === pair.matchIndex;

                return (
                  <tr
                    key={pair.matchIndex}
                    className={`hover:bg-[var(--surface-card-subtle)] transition-colors ${
                      isEditing ? 'bg-[var(--turf-accent-subtle)]/40' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-[var(--text-muted)]">
                      M#{pair.matchIndex}
                    </td>

                    {/* Home Score Column */}
                    <td className="py-2.5 px-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="80"
                            max="280"
                            value={editHomeScore}
                            onChange={(e) => setEditHomeScore(Number(e.target.value))}
                            className="w-20 px-2 py-1 rounded border border-[var(--turf-accent)] bg-[var(--surface-card)] text-xs font-bold text-[var(--home-brand)]"
                          />
                          <span className="text-[10px] text-[var(--text-muted)]">runs</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(pair)}
                          className="font-bold text-[var(--home-brand)] hover:underline flex items-center gap-1.5"
                          title="Click to edit score"
                        >
                          <span>{pair.homeInning.runs}</span>
                          <span className="text-[10px] text-[var(--text-muted)] font-sans">runs</span>
                        </button>
                      )}
                    </td>

                    {/* Away Score Column */}
                    <td className="py-2.5 px-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="80"
                            max="280"
                            value={editAwayScore}
                            onChange={(e) => setEditAwayScore(Number(e.target.value))}
                            className="w-20 px-2 py-1 rounded border border-[var(--turf-accent)] bg-[var(--surface-card)] text-xs font-bold text-[var(--away-brand)]"
                          />
                          <span className="text-[10px] text-[var(--text-muted)]">runs</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(pair)}
                          className="font-bold text-[var(--away-brand)] hover:underline flex items-center gap-1.5"
                          title="Click to edit score"
                        >
                          <span>{pair.awayInning.runs}</span>
                          <span className="text-[10px] text-[var(--text-muted)] font-sans">runs</span>
                        </button>
                      )}
                    </td>

                    {/* Margin Column */}
                    <td className="py-2.5 px-3 font-bold">
                      {pair.winner === 'home' ? (
                        <span className="text-emerald-500 flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5" /> +{pair.margin} runs
                        </span>
                      ) : pair.winner === 'away' ? (
                        <span className="text-rose-500 flex items-center gap-1">
                          <ArrowDownRight className="w-3.5 h-3.5" /> -{pair.margin} runs
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">Tied Match</span>
                      )}
                    </td>

                    {/* Winner Column */}
                    <td className="py-2.5 px-3 font-sans">
                      {pair.winner === 'home' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10.5px] font-semibold">
                          <Trophy className="w-3 h-3" /> Home Win
                        </span>
                      ) : pair.winner === 'away' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10.5px] font-semibold">
                          Away Win
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10.5px] font-semibold">
                          Super Over / Tie
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-2.5 px-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => saveEdit(pair)}
                            className="p-1 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                            title="Save changes"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingIndex(null)}
                            className="p-1 rounded bg-[var(--surface-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--surface-border)]"
                            title="Cancel edit"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(pair)}
                          className="p-1 rounded hover:bg-[var(--surface-card)] text-[var(--text-muted)] hover:text-[var(--turf-accent)] transition-colors"
                          title="Edit this match score"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
