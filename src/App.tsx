import React, { useState, useEffect, useCallback } from 'react';
import { generateSeason, recalculateStadiumStats, type SimulationOptions } from './lib/simulator';
import { STADIUMS_CONFIG } from './data/stadiums';
import type { SeasonData, StadiumData, Innings } from './types/stats';

// Core Focused Components
import { Navbar } from './components/Navbar';
import { PitchSimulationCanvas } from './components/PitchSimulationCanvas';
import { Scoreboard } from './components/Scoreboard';
import { HypothesisCurve } from './components/HypothesisCurve';
import { InningsDistributionChart } from './components/InningsDistributionChart';
import { OutlierStressTester } from './components/OutlierStressTester';
import { SimulationControls } from './components/SimulationControls';

export const App: React.FC = () => {
  // Theme state: dark / light mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pitchedge_theme');
      if (stored) return stored === 'dark';
      return true; // Default to floodlit Night Match
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pitchedge_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pitchedge_theme', 'light');
    }
  }, [isDark]);

  // Selected Stadium ID
  const [selectedStadiumId, setSelectedStadiumId] = useState<string>('rcb');

  // Simulation mathematical parameters (Module VII)
  const [simulationOptions, setSimulationOptions] = useState<SimulationOptions>({
    sampleSize: 15,
    alpha: 0.05,
    groundEffectModifier: 0,
    baseStdDev: 24,
  });

  const [seasonCount, setSeasonCount] = useState<number>(1);
  const [seasonData, setSeasonData] = useState<SeasonData>(() =>
    generateSeason(1, {
      sampleSize: 15,
      alpha: 0.05,
      groundEffectModifier: 0,
      baseStdDev: 24,
    })
  );
  const [isResimulating, setIsResimulating] = useState<boolean>(false);

  // Active injected outlier tracker
  const [activeOutlier, setActiveOutlier] = useState<{
    home: number;
    away: number;
    label: string;
  } | null>(null);

  // Active stadium data
  const currentStadium: StadiumData =
    seasonData.stadiums.find((s) => s.config.id === selectedStadiumId) ||
    seasonData.stadiums[0];

  // Resimulate Season
  const handleRunNewSeason = useCallback(() => {
    setIsResimulating(true);
    setTimeout(() => {
      const nextId = seasonCount + 1;
      setSeasonCount(nextId);
      setSeasonData(generateSeason(nextId, simulationOptions));
      setActiveOutlier(null);
      setIsResimulating(false);
    }, 250);
  }, [seasonCount, simulationOptions]);

  // Change simulation options
  const handleChangeSimulationOptions = useCallback(
    (newOptions: SimulationOptions) => {
      setSimulationOptions(newOptions);
      setActiveOutlier(null);
      const sampleChanged = newOptions.sampleSize !== simulationOptions.sampleSize;
      const modChanged = newOptions.groundEffectModifier !== simulationOptions.groundEffectModifier;
      const sdChanged = newOptions.baseStdDev !== simulationOptions.baseStdDev;
      const alphaChanged = newOptions.alpha !== simulationOptions.alpha;

      if (sampleChanged || modChanged || sdChanged) {
        setIsResimulating(true);
        setTimeout(() => {
          setSeasonData(generateSeason(seasonCount, newOptions));
          setIsResimulating(false);
        }, 150);
      } else if (alphaChanged) {
        const alpha = newOptions.alpha ?? 0.05;
        setSeasonData((prev) => {
          const nextStadiums = prev.stadiums.map((s) => ({
            ...s,
            stats: recalculateStadiumStats(s.homeInnings, s.awayInnings, alpha),
          }));
          const pooledStats = recalculateStadiumStats(
            prev.pooled.homeInnings,
            prev.pooled.awayInnings,
            alpha
          );
          return {
            ...prev,
            stadiums: nextStadiums,
            pooled: { ...prev.pooled, stats: pooledStats },
          };
        });
      }
    },
    [simulationOptions, seasonCount]
  );

  const handleResetSimulationOptions = useCallback(() => {
    const defaultOptions: SimulationOptions = {
      sampleSize: 15,
      alpha: 0.05,
      groundEffectModifier: 0,
      baseStdDev: 24,
    };
    setSimulationOptions(defaultOptions);
    setActiveOutlier(null);
    setIsResimulating(true);
    setTimeout(() => {
      setSeasonData(generateSeason(seasonCount, defaultOptions));
      setIsResimulating(false);
    }, 150);
  }, [seasonCount]);

  // Add simulated match from pitch bowling delivery
  const handleAddDeliveryMatch = useCallback(
    (hScore: number, aScore: number) => {

      const alpha = simulationOptions.alpha ?? 0.05;
      const nextIdx = currentStadium.homeInnings.length + 1;

      const newHomeInning: Innings = {
        id: `${currentStadium.config.id}-pitch-h-${Date.now()}`,
        matchIndex: nextIdx,
        runs: hScore,
        venueId: currentStadium.config.id,
        type: 'home',
        seasonId: seasonCount,
      };

      const newAwayInning: Innings = {
        id: `${currentStadium.config.id}-pitch-a-${Date.now()}`,
        matchIndex: nextIdx,
        runs: aScore,
        venueId: currentStadium.config.id,
        type: 'away',
        seasonId: seasonCount,
      };

      const updatedHome = [...currentStadium.homeInnings, newHomeInning];
      const updatedAway = [...currentStadium.awayInnings, newAwayInning];
      const newStats = recalculateStadiumStats(updatedHome, updatedAway, alpha);

      setSeasonData((prev) => {
        const nextStadiums = prev.stadiums.map((s) => {
          if (s.config.id === currentStadium.config.id) {
            return {
              ...s,
              homeInnings: updatedHome,
              awayInnings: updatedAway,
              stats: newStats,
            };
          }
          return s;
        });

        const allHome = nextStadiums.flatMap((s) => s.homeInnings);
        const allAway = nextStadiums.flatMap((s) => s.awayInnings);
        const pooledStats = recalculateStadiumStats(allHome, allAway, alpha);

        return {
          ...prev,
          stadiums: nextStadiums,
          pooled: {
            homeInnings: allHome,
            awayInnings: allAway,
            stats: pooledStats,
          },
        };
      });
    },
    [currentStadium, simulationOptions.alpha, seasonCount]
  );

  // Handle Outlier Stress-Testing injection & clearing
  const handleApplyOutlier = useCallback(
    (outlierHome: number | null, outlierAway: number | null) => {
      const alpha = simulationOptions.alpha ?? 0.05;

      setSeasonData((prev) => {
        const nextStadiums = prev.stadiums.map((s) => {
          if (s.config.id === selectedStadiumId) {
            // Remove previous outlier if one was active
            let cleanHome = activeOutlier ? s.homeInnings.slice(0, -1) : [...s.homeInnings];
            let cleanAway = activeOutlier ? s.awayInnings.slice(0, -1) : [...s.awayInnings];

            if (outlierHome !== null && outlierAway !== null) {
              const nextIdx = cleanHome.length + 1;
              const newH: Innings = {
                id: `${s.config.id}-outlier-h-${Date.now()}`,
                matchIndex: nextIdx,
                runs: outlierHome,
                venueId: s.config.id,
                type: 'home',
                seasonId: seasonCount,
              };
              const newA: Innings = {
                id: `${s.config.id}-outlier-a-${Date.now()}`,
                matchIndex: nextIdx,
                runs: outlierAway,
                venueId: s.config.id,
                type: 'away',
                seasonId: seasonCount,
              };
              cleanHome = [...cleanHome, newH];
              cleanAway = [...cleanAway, newA];
            }

            const stats = recalculateStadiumStats(cleanHome, cleanAway, alpha);
            return {
              ...s,
              homeInnings: cleanHome,
              awayInnings: cleanAway,
              stats,
            };
          }
          return s;
        });

        const allHome = nextStadiums.flatMap((s) => s.homeInnings);
        const allAway = nextStadiums.flatMap((s) => s.awayInnings);
        const pooledStats = recalculateStadiumStats(allHome, allAway, alpha);

        return {
          ...prev,
          stadiums: nextStadiums,
          pooled: {
            homeInnings: allHome,
            awayInnings: allAway,
            stats: pooledStats,
          },
        };
      });

      if (outlierHome !== null && outlierAway !== null) {
        setActiveOutlier({
          home: outlierHome,
          away: outlierAway,
          label: `${outlierHome}v${outlierAway}`,
        });
      } else {
        setActiveOutlier(null);
      }
    },
    [selectedStadiumId, activeOutlier, simulationOptions.alpha, seasonCount]
  );

  const handleSelectStadium = (stadiumId: string) => {
    setSelectedStadiumId(stadiumId);
    setActiveOutlier(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      {/* 1. Navbar */}
      <Navbar
        isDark={isDark}
        setIsDark={setIsDark}
        onRunNewSeason={handleRunNewSeason}
        isResimulating={isResimulating}
        seasonId={seasonCount}
        stadiums={STADIUMS_CONFIG}
        selectedStadiumId={selectedStadiumId}
        onSelectStadium={handleSelectStadium}
      />

      {/* Main Simulation Hub */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 2. Interactive 22-Yard Pitch Simulation Canvas */}
        <PitchSimulationCanvas
          stadium={currentStadium.config}
          onAddMatch={handleAddDeliveryMatch}
        />

        {/* 3. Broadcast Hypothesis Scoreboard */}
        <Scoreboard
          stats={currentStadium.stats}
          stadiumName={currentStadium.config.venue}
          isPooled={false}
        />

        {/* 4. Student's t-Distribution & Decision Boundary (Module VII) */}
        <HypothesisCurve
          stats={currentStadium.stats}
          stadiumName={currentStadium.config.venue}
        />

        {/* 5. Score Frequency Distribution Histogram (Module I) */}
        <InningsDistributionChart
          homeInnings={currentStadium.homeInnings}
          awayInnings={currentStadium.awayInnings}
          stats={currentStadium.stats}
        />

        {/* 6. What-If Outlier Stress-Tester (Robustness Check) */}
        <OutlierStressTester
          homeInnings={currentStadium.homeInnings}
          awayInnings={currentStadium.awayInnings}
          activeStats={currentStadium.stats}
          alpha={simulationOptions.alpha ?? 0.05}
          onApplyOutlier={handleApplyOutlier}
          activeOutlier={activeOutlier}
        />

        {/* 7. Math Parameter & Hypothesis Controls */}
        <SimulationControls
          options={simulationOptions}
          onChangeOptions={handleChangeSimulationOptions}
          onResimulate={handleRunNewSeason}
          onReset={handleResetSimulationOptions}
          isResimulating={isResimulating}
          totalInningsCount={currentStadium.homeInnings.length * 2}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--surface-border)] bg-[var(--surface-card)] py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span className="font-scoreboard font-bold text-sm text-[var(--text-primary)]">
              Pitch<span className="text-[var(--turf-accent)]">Edge</span>
            </span>
            <span>&bull;</span>
            <span>Testing of Hypothesis for Mean (Welch's Two-Sample t-Test Engine)</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-[var(--surface-card-subtle)] border border-[var(--surface-border)]">
              α = {simulationOptions.alpha ?? 0.05}
            </span>
            <span className="px-2 py-0.5 rounded bg-[var(--surface-card-subtle)] border border-[var(--surface-border)]">
              n = {currentStadium.homeInnings.length} / side
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
