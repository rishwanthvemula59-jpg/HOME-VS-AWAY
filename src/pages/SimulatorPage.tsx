import React, { useState } from 'react';
import type { SeasonData, StadiumData } from '../types/stats';
import { FranchiseBadge } from '../components/FranchiseBadge';
import { Scoreboard } from '../components/Scoreboard';
import { PopulationPyramid } from '../components/PopulationPyramid';
import { PooledHistogram } from '../components/PooledHistogram';
import { TDistributionPlot } from '../components/TDistributionPlot';
import { RiskCallout } from '../components/RiskCallout';
import { StatNumber } from '../components/StatNumber';
import { Layers, MapPin, Zap, ChevronRight } from 'lucide-react';

interface SimulatorPageProps {
  seasonData: SeasonData;
  selectedStadiumId: string;
  setSelectedStadiumId: (id: string) => void;
  onNavigateToLeaderboard: () => void;
}

export const SimulatorPage: React.FC<SimulatorPageProps> = ({
  seasonData,
  selectedStadiumId,
  setSelectedStadiumId,
  onNavigateToLeaderboard,
}) => {
  const [viewMode, setViewMode] = useState<'stratified' | 'pooled'>(() => {
    if (typeof window !== 'undefined') {
      const v = new URLSearchParams(window.location.search).get('view');
      if (v === 'pooled') return 'pooled';
    }
    return 'stratified';
  });

  const currentStadium: StadiumData =
    seasonData.stadiums.find((s) => s.config.id === selectedStadiumId) ||
    seasonData.stadiums[0];

  const pooledStats = seasonData.pooled.stats;
  const isPooled = viewMode === 'pooled';
  const activeStats = isPooled ? pooledStats : currentStadium.stats;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Hero Banner with Live Headline Stat */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-6 sm:p-8 shadow-[var(--shadow-card)]">
        {/* Subtle decorative stadium floodlight glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--floodlight-glow)] rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 opacity-60" />
        
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--turf-accent-subtle)] border border-[var(--turf-accent)]/30 text-xs font-semibold text-[var(--turf-accent)] uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Season #{seasonData.seasonId} Live Simulation Engine</span>
          </div>

          <h1 className="font-scoreboard text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)] uppercase">
            Is Home Advantage Real,{' '}
            <span className="text-[var(--turf-accent)]">Or Just Noise?</span>
          </h1>

          {/* Live Headline Stat Sentence */}
          <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-3xl">
            Across 10 grounds and 300 simulated innings, home teams average{' '}
            <strong className="text-[var(--text-primary)] font-scoreboard text-base sm:text-lg">
              <StatNumber
                value={pooledStats.meanDiff}
                decimals={1}
                prefix={pooledStats.meanDiff > 0 ? '+' : ''}
                suffix=" runs"
              />
            </strong>{' '}
            over away teams (p ={' '}
            <span className="font-mono font-bold text-[var(--text-primary)]">
              {pooledStats.pValue < 0.0001 ? '< 0.0001' : pooledStats.pValue.toFixed(4)}
            </span>
            , {pooledStats.isSignificant ? 'statistically significant' : 'not statistically significant'}).
            Explore grounds individually to discover which stadiums produce genuine statistical edges.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'stratified' ? 'pooled' : 'stratified')}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[var(--surface-card-subtle)] border border-[var(--surface-border-strong)] text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] hover:border-[var(--turf-accent)] transition-colors"
            >
              <Layers className="w-4 h-4 text-[var(--turf-accent)]" />
              <span>
                {viewMode === 'stratified' ? 'Pooled League View' : 'Per-Ground View'}
                <span className="hidden sm:inline"> {viewMode === 'stratified' ? '(300 Innings)' : '(30 Innings)'}</span>
              </span>
            </button>

            <button
              onClick={onNavigateToLeaderboard}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <span>10-Ground Leaderboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Stadium Picker Bar (When in Stratified Mode) */}
      <section className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[var(--turf-accent)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Select Venue / Franchise ({seasonData.stadiums.length} Major IPL Grounds)
            </span>
          </div>

          {/* Mode Switch Pills */}
          <div className="inline-flex rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] p-1 text-xs font-semibold">
            <button
              onClick={() => setViewMode('stratified')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'stratified'
                  ? 'bg-[var(--turf-accent)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Stratified (Per Ground)
            </button>
            <button
              onClick={() => setViewMode('pooled')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'pooled'
                  ? 'bg-[var(--turf-accent)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Pooled (All 10 Grounds)
            </button>
          </div>
        </div>

        {/* Stadium horizontal scroll strip */}
        {viewMode === 'stratified' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
            {seasonData.stadiums.map((stadium) => {
              const isSelected = stadium.config.id === selectedStadiumId;
              const isGroundSig = stadium.stats.isSignificant;

              return (
                <button
                  key={stadium.config.id}
                  onClick={() => setSelectedStadiumId(stadium.config.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left shrink-0 transition-all ${
                    isSelected
                      ? 'bg-[var(--surface-card)] border-[var(--turf-accent)] shadow-md ring-1 ring-[var(--turf-accent)]'
                      : 'bg-[var(--surface-card)] border-[var(--surface-border)] hover:border-[var(--surface-border-strong)] opacity-85 hover:opacity-100'
                  }`}
                >
                  <FranchiseBadge type={stadium.config.badgeType} size={28} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[120px]">
                        {stadium.config.franchise.replace('Royal Challengers Bengaluru', 'RCB').replace('Chennai Super Kings', 'CSK').replace('Kolkata Knight Riders', 'KKR').replace('Mumbai Indians', 'MI').replace('Sunrisers Hyderabad', 'SRH').replace('Gujarat Titans', 'GT').replace('Delhi Capitals', 'DC').replace('Rajasthan Royals', 'RR').replace('Lucknow Super Giants', 'LSG').replace('Punjab Kings', 'PBKS')}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isGroundSig ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        title={isGroundSig ? 'Significant (p < 0.05)' : 'Not significant'}
                      />
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono">
                      {stadium.stats.meanDiff > 0 ? '+' : ''}
                      {stadium.stats.meanDiff.toFixed(1)}r | p={stadium.stats.pValue < 0.01 ? '<0.01' : stadium.stats.pValue.toFixed(2)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Venue Details Header Bar (if stratified) */}
      {!isPooled && (
        <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3.5">
            <FranchiseBadge type={currentStadium.config.badgeType} size={42} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-scoreboard text-lg sm:text-xl font-bold uppercase text-[var(--text-primary)]">
                  {currentStadium.config.venue}
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--surface-card-subtle)] border border-[var(--surface-border)] text-[var(--text-secondary)] font-mono">
                  {currentStadium.config.city}
                </span>
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5 flex flex-wrap items-center gap-3">
                <span>Franchise: <strong className="text-[var(--text-primary)]">{currentStadium.config.franchise}</strong></span>
                <span>Capacity: {currentStadium.config.capacity}</span>
                <span>Built-in ground effect: <strong className="font-mono text-[var(--turf-accent)]">{currentStadium.config.homeEffect > 0 ? `+${currentStadium.config.homeEffect}` : currentStadium.config.homeEffect} runs</strong></span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs text-[var(--text-muted)]">Stratified Sample:</span>
            <div className="text-xs font-mono font-bold text-[var(--text-primary)]">
              15 Home Innings vs 15 Away Innings
            </div>
          </div>
        </div>
      )}

      {/* 4. Scoreboard Readout */}
      <Scoreboard
        stats={activeStats}
        stadiumName={currentStadium.config.venue}
        isPooled={isPooled}
      />

      {/* 5. Distribution Views: Population Pyramid (Stratified) or Mirrored Histogram (Pooled) */}
      {isPooled ? (
        <PooledHistogram
          homeInnings={seasonData.pooled.homeInnings}
          awayInnings={seasonData.pooled.awayInnings}
          stats={pooledStats}
        />
      ) : (
        <PopulationPyramid
          homeInnings={currentStadium.homeInnings}
          awayInnings={currentStadium.awayInnings}
          stats={currentStadium.stats}
          stadiumName={currentStadium.config.venue}
        />
      )}

      {/* 6. Live t-Distribution & Rejection Region Plot */}
      <TDistributionPlot
        stats={activeStats}
        stadiumName={isPooled ? 'Pooled League' : currentStadium.config.venue}
      />

      {/* 7. Contextual Type I and Type II Error Analysis */}
      <RiskCallout
        stats={activeStats}
        stadiumName={isPooled ? 'All 10 IPL Grounds Combined' : currentStadium.config.venue}
        franchise={isPooled ? 'League Level (Global Test)' : currentStadium.config.franchise}
      />
    </div>
  );
};
