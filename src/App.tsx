import React, { useState, useEffect, useCallback } from 'react';
import { generateSeason } from './lib/simulator';
import type { SeasonData } from './types/stats';
import { Navbar } from './components/Navbar';
import { SimulatorPage } from './pages/SimulatorPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { AboutPage } from './pages/AboutPage';

export const App: React.FC = () => {
  // Parse URL search params for direct deep-linking
  const getInitialParam = (param: string) => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    }
    return null;
  };

  // Theme state: support ?theme=dark / ?theme=light, else localStorage, else default dark
  const [isDark, setIsDark] = useState<boolean>(() => {
    const themeParam = getInitialParam('theme');
    if (themeParam === 'dark') return true;
    if (themeParam === 'light') return false;

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pitchedge_theme');
      if (stored) return stored === 'dark';
      return true; // Default to floodlit Night Match
    }
    return true;
  });

  // Sync theme with html document class and localStorage
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pitchedge_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pitchedge_theme', 'light');
    }
  }, [isDark]);

  // Season simulation state
  const [seasonCount, setSeasonCount] = useState<number>(1);
  const [seasonData, setSeasonData] = useState<SeasonData>(() => generateSeason(1));
  const [isResimulating, setIsResimulating] = useState<boolean>(false);

  // Active view tab: support ?tab=leaderboard, ?tab=methodology, ?tab=about
  const [currentTab, setCurrentTab] = useState<'simulator' | 'leaderboard' | 'methodology' | 'about'>(() => {
    const tabParam = getInitialParam('tab');
    if (tabParam === 'leaderboard' || tabParam === 'methodology' || tabParam === 'about') {
      return tabParam;
    }
    return 'simulator';
  });

  // Selected stadium: support ?stadium=pbks, ?stadium=csk, etc.
  const [selectedStadiumId, setSelectedStadiumId] = useState<string>(() => {
    const stadiumParam = getInitialParam('stadium');
    if (stadiumParam) return stadiumParam;
    return 'rcb';
  });

  // Resimulate entire season
  const handleRunNewSeason = useCallback(() => {
    setIsResimulating(true);
    setTimeout(() => {
      const nextSeasonId = seasonCount + 1;
      setSeasonCount(nextSeasonId);
      setSeasonData(generateSeason(nextSeasonId));
      setIsResimulating(false);
    }, 280);
  }, [seasonCount]);

  const handleSelectStadiumFromLeaderboard = (stadiumId: string) => {
    setSelectedStadiumId(stadiumId);
    setCurrentTab('simulator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isDark={isDark}
        setIsDark={setIsDark}
        onRunNewSeason={handleRunNewSeason}
        isResimulating={isResimulating}
        seasonId={seasonCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'simulator' && (
          <SimulatorPage
            seasonData={seasonData}
            selectedStadiumId={selectedStadiumId}
            setSelectedStadiumId={setSelectedStadiumId}
            onNavigateToLeaderboard={() => setCurrentTab('leaderboard')}
          />
        )}

        {currentTab === 'leaderboard' && (
          <LeaderboardPage
            seasonData={seasonData}
            onSelectStadium={handleSelectStadiumFromLeaderboard}
          />
        )}

        {currentTab === 'methodology' && <MethodologyPage />}

        {currentTab === 'about' && <AboutPage />}
      </main>

      {/* Clean Sports Product Footer */}
      <footer className="border-t border-[var(--surface-border)] bg-[var(--surface-card)] py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span className="font-scoreboard font-bold text-sm text-[var(--text-primary)]">
              Pitch<span className="text-[var(--turf-accent)]">Edge</span>
            </span>
            <span>&bull;</span>
            <span>Module VII: Testing of Hypothesis (Welch's Two-Sample t-Test Engine)</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentTab('methodology')}
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              Math Specification
            </button>
            <button
              onClick={() => setCurrentTab('about')}
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              Dataset Integration Guide
            </button>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[var(--surface-card-subtle)] border border-[var(--surface-border)]">
              α = 0.05
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
