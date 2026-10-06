import React from 'react';
import { Sun, Moon, RefreshCw, MapPin } from 'lucide-react';
import type { StadiumConfig } from '../types/stats';

interface NavbarProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onRunNewSeason: () => void;
  isResimulating: boolean;
  seasonId: number;
  stadiums: StadiumConfig[];
  selectedStadiumId: string;
  onSelectStadium: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDark,
  setIsDark,
  onRunNewSeason,
  isResimulating,
  seasonId,
  stadiums,
  selectedStadiumId,
  onSelectStadium,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg-primary)]/90 border-b border-[var(--surface-border)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[var(--turf-accent)] flex items-center justify-center text-white font-scoreboard font-bold text-xl shadow-sm">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-scoreboard text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  Pitch<span className="text-[var(--turf-accent)]">Edge</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] text-[var(--turf-accent)] font-bold">
                  Module VII Engine
                </span>
              </div>
              <div className="text-[10.5px] text-[var(--text-muted)] hidden sm:block -mt-0.5">
                IPL Home Advantage Hypothesis Simulation
              </div>
            </div>
          </div>

          {/* Quick Stadium Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)]">
              <MapPin className="w-3.5 h-3.5 text-[var(--turf-accent)] shrink-0" />
              <select
                value={selectedStadiumId}
                onChange={(e) => onSelectStadium(e.target.value)}
                className="bg-transparent text-xs font-bold text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                {stadiums.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[var(--surface-card)] text-[var(--text-primary)]">
                    {s.franchise} ({s.venue.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Resimulate Button */}
            <button
              onClick={onRunNewSeason}
              disabled={isResimulating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] hover:border-[var(--turf-accent)] text-xs font-semibold text-[var(--text-primary)] transition-all disabled:opacity-50"
              title="Resimulate Season"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[var(--turf-accent)] ${isResimulating ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Season #{seasonId}</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              title={isDark ? 'Switch to Day Match (Light)' : 'Switch to Floodlit Night Match (Dark)'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-600" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
