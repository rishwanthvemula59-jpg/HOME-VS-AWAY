import React from 'react';
import type { BadgeType } from '../types/stats';

interface FranchiseBadgeProps {
  type: BadgeType;
  size?: number;
  className?: string;
}

export const FranchiseBadge: React.FC<FranchiseBadgeProps> = ({
  type,
  size = 32,
  className = '',
}) => {
  const renderIcon = () => {
    switch (type) {
      case 'lion-crown': // RCB: Crimson & Gold Geometric Crown
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} fill="none" className={className}>
            <rect width="32" height="32" rx="8" fill="#881337" />
            <path
              d="M7 23h18l-1.5-11-4.5 5-3-8-3 8-4.5-5L7 23z"
              fill="#fbbf24"
              stroke="#fef08a"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="19" r="1.5" fill="#e11d48" />
          </svg>
        );

      case 'whistle-shield': // CSK: Canary Yellow & Cobalt Shield with Slats
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} fill="none" className={className}>
            <rect width="32" height="32" rx="8" fill="#ca8a04" />
            <path
              d="M16 6l9 3.5v7.5c0 6-5.5 9.5-9 11-3.5-1.5-9-5-9-11V9.5L16 6z"
              fill="#facc15"
              stroke="#1d4ed8"
              strokeWidth="1.5"
            />
            <path d="M12 14h8M13 18h6" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case 'vortex-ring': // MI: Cobalt Blue & Gold Kinetic Vortex
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} fill="none" className={className}>
            <rect width="32" height="32" rx="8" fill="#0369a1" />
            <circle cx="16" cy="16" r="10" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 3" />
            <path
              d="M16 8a8 8 0 017 4l-3 1.5M24 16a8 8 0 01-4 7l-1.5-3M16 24a8 8 0 01-7-4l3-1.5M8 16a8 8 0 014-7l1.5 3"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="16" cy="16" r="2.5" fill="#fde047" />
          </svg>
        );

      case 'wing-falcon': // LSG: Cyan & Navy Wing Flurry
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} fill="none" className={className}>
            <rect width="32" height="32" rx="8" fill="#0e7490" />
            <path
              d="M6 14l10-6 10 6-4 4-6-3-6 3-4-4z"
              fill="#22d3ee"
              stroke="#ffffff"
              strokeWidth="1.2"
            />
            <path
              d="M8 19l8-4 8 4-3 3-5-2-5 2-3-3z"
              fill="#06b6d4"
              stroke="#f97316"
              strokeWidth="1.2"
            />
          </svg>
        );

      case 'chevron-titan': // GT: Deep Navy & Gold Prism
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} fill="none" className={className}>
            <rect width="32" height="32" rx="8" fill="#172554" />
            <path
              d="M16 6l10 18h-6l-4-8-4 8H6L16 6z"
              fill="#3b82f6"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <polygon points="16,11 20,19 12,19" fill="#fbbf24" />
          </svg>
        );

      case 'solar-eagle': // SRH: Solar Orange Radiant Sun
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} fill="none" className={className}>
            <rect width="32" height="32" rx="8" fill="#c2410c" />
            <circle cx="16" cy="17" r="6" fill="#fbbf24" />
            <path
              d="M16 6v4M16 24v4M6 17h4M22 17h4M9 10l3 3M20 21l3 3M23 10l-3 3M12 21l-3 3"
              stroke="#f97316"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path d="M10 23c3-3 9-3 12 0" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case 'flame-knight': // KKR: Royal Purple & Gold Flame Blade
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} fill="none" className={className}>
            <rect width="32" height="32" rx="8" fill="#581c87" />
            <path
              d="M16 6c2 4 6 7 6 12 0 4-3 8-6 8s-6-4-6-8c0-5 4-8 6-12z"
              fill="#a855f7"
              stroke="#fde047"
              strokeWidth="1.5"
            />
            <path
              d="M16 13c1 2 3 3.5 3 6 0 2-1.5 4-3 4s-3-2-3-4c0-2.5 2-4 3-6z"
              fill="#fbbf24"
            />
          </svg>
        );

      case 'rampart-tiger': // DC: Capital Blue & Crimson Bastion
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} fill="none" className={className}>
            <rect width="32" height="32" rx="8" fill="#1d4ed8" />
            <path
              d="M7 24V11l4-3 4 3 2-2 2 2 4-3 4 3v13H7z"
              fill="#2563eb"
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <rect x="13" y="17" width="6" height="7" rx="1" fill="#ef4444" />
          </svg>
        );

      case 'royal-palace': // RR: Royal Pink & Indigo Pavilion
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} fill="none" className={className}>
            <rect width="32" height="32" rx="8" fill="#be185d" />
            <path
              d="M16 6c3 3 7 5 7 10v8H9v-8c0-5 4-7 7-10z"
              fill="#ec4899"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <circle cx="16" cy="17" r="3" fill="#1e40af" stroke="#fde047" strokeWidth="1" />
          </svg>
        );

      case 'crossed-daggers': // PBKS: Scarlet & Silver Twin Daggers
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} fill="none" className={className}>
            <rect width="32" height="32" rx="8" fill="#b91c1c" />
            <path
              d="M8 8l16 16M24 8L8 24"
              stroke="#f1f5f9"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="16" cy="16" r="3.5" fill="#ef4444" stroke="#f87171" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="1.5" fill="#ffffff" />
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} fill="none" className={className}>
            <rect width="32" height="32" rx="8" fill="#334155" />
            <circle cx="16" cy="16" r="6" fill="#10b981" />
          </svg>
        );
    }
  };

  return <div className="inline-flex items-center justify-center shrink-0">{renderIcon()}</div>;
};
