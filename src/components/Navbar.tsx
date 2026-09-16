import React from 'react';
import { Sun, Moon, RefreshCw, BarChart2, Award, BookOpen, Info } from 'lucide-react';

interface NavbarProps {
  currentTab: 'simulator' | 'leaderboard' | 'methodology' | 'about';
  setCurrentTab: (tab: 'simulator' | 'leaderboard' | 'methodology' | 'about') => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onRunNewSeason: () => void;
  isResimulating: boolean;
  seasonId: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isDark,
  setIsDark,
  onRunNewSeason,
  isResimulating,
  seasonId,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg-primary)]/90 border-b border-[var(--surface-border)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentTab('simulator')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              {/* Distinctive cricket crease wordmark icon */}
              <div className="w-8 h-8 rounded-lg bg-[var(--turf-accent)] flex items-center justify-center text-white font-scoreboard font-bold text-lg shadow-sm transition-transform group-hover:scale-105">
                P
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-scoreboard text-xl font-bold tracking-tight text-[var(--text-primary)]">
                    Pitch<span className="text-[var(--turf-accent)]">Edge</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] text-[var(--text-muted)] font-semibold">
                    v1.0
                  </span>
                </div>
                <div className="text-[10.5px] text-[var(--text-muted)] hidden sm:block -mt-0.5">
                  IPL Home Advantage Hypothesis Engine
                </div>
              </div>
            </button>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('simulator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                currentTab === 'simulator'
                  ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm border border-[var(--surface-border)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-card-subtle)]'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-[var(--turf-accent)]" />
              <span>Simulator</span>
            </button>

            <button
              onClick={() => setCurrentTab('leaderboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                currentTab === 'leaderboard'
                  ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm border border-[var(--surface-border)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-card-subtle)]'
              }`}
            >
              <Award className="w-4 h-4 text-[var(--floodlight-accent)]" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => setCurrentTab('methodology')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                currentTab === 'methodology'
                  ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm border border-[var(--surface-border)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-card-subtle)]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-sky-500" />
              <span>Methodology</span>
            </button>

            <button
              onClick={() => setCurrentTab('about')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                currentTab === 'about'
                  ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm border border-[var(--surface-border)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-card-subtle)]'
              }`}
            >
              <Info className="w-4 h-4 text-emerald-500" />
              <span>About</span>
            </button>
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Run a new season CTA */}
            <button
              onClick={onRunNewSeason}
              disabled={isResimulating}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-[var(--turf-accent)] hover:opacity-90 active:scale-95 text-white text-xs font-bold font-scoreboard tracking-wider uppercase shadow-sm transition-all focus:outline-none disabled:opacity-50"
              title="Resimulate all 10 stadiums with Box-Muller Gaussian sampling"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResimulating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Run New Season</span>
              <span className="sm:hidden">Reseed</span>
              <span className="px-1.5 py-0.2 bg-black/20 rounded text-[10px] font-mono">
                S#{seasonId}
              </span>
            </button>

            {/* Day Match / Night Match Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] text-[var(--text-primary)] hover:bg-[var(--surface-card-subtle)] transition-colors focus:outline-none"
              title={isDark ? 'Switch to Day Match (Light Mode)' : 'Switch to Night Match (Dark Mode)'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Subnav for 375px screens */}
        <div className="flex md:hidden items-center justify-between py-1.5 border-t border-[var(--surface-border)] text-[11px]">
          <button
            onClick={() => setCurrentTab('simulator')}
            className={`px-2 py-1 rounded-lg font-medium transition-colors ${
              currentTab === 'simulator'
                ? 'bg-[var(--surface-card)] text-[var(--turf-accent)] font-bold shadow-xs'
                : 'text-[var(--text-secondary)]'
            }`}
          >
            Simulator
          </button>
          <button
            onClick={() => setCurrentTab('leaderboard')}
            className={`px-2 py-1 rounded-lg font-medium transition-colors ${
              currentTab === 'leaderboard'
                ? 'bg-[var(--surface-card)] text-[var(--turf-accent)] font-bold shadow-xs'
                : 'text-[var(--text-secondary)]'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setCurrentTab('methodology')}
            className={`px-2 py-1 rounded-lg font-medium transition-colors ${
              currentTab === 'methodology'
                ? 'bg-[var(--surface-card)] text-[var(--turf-accent)] font-bold shadow-xs'
                : 'text-[var(--text-secondary)]'
            }`}
          >
            Methodology
          </button>
          <button
            onClick={() => setCurrentTab('about')}
            className={`px-2 py-1 rounded-lg font-medium transition-colors ${
              currentTab === 'about'
                ? 'bg-[var(--surface-card)] text-[var(--turf-accent)] font-bold shadow-xs'
                : 'text-[var(--text-secondary)]'
            }`}
          >
            About
          </button>
        </div>
      </div>
    </header>
  );
};
