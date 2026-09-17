import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  Users,
  Shield,
  Coins,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Team, TournamentSettings } from '../../types';
import { formatPoints } from '../../utils/formatters';

interface SetNewAuctionModalProps {
  isOpen: boolean;
  currentSettings: TournamentSettings;
  teams: Team[];
  onClose: () => void;
  onLaunchNewAuction: (config: {
    tournamentName: string;
    startingPoints: number;
    maxSquadSize: number;
    targetTeamCount: number;
    resetMode: 'pre-auction' | 'official' | 'none';
  }) => Promise<void>;
}

export const SetNewAuctionModal: React.FC<SetNewAuctionModalProps> = ({
  isOpen,
  currentSettings,
  teams,
  onClose,
  onLaunchNewAuction,
}) => {
  if (!isOpen) return null;

  const [tournamentName, setTournamentName] = useState(currentSettings.tournamentName || 'Premier Cricket League 2026');
  const [startingPoints, setStartingPoints] = useState(currentSettings.startingPoints || 100000);
  const [maxSquadSize, setMaxSquadSize] = useState(currentSettings.maxSquadSize || 15);
  const [targetTeamCount, setTargetTeamCount] = useState<number>(teams.length || 6);
  const [resetMode, setResetMode] = useState<'pre-auction' | 'official' | 'none'>('pre-auction');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onLaunchNewAuction({
        tournamentName,
        startingPoints: Number(startingPoints),
        maxSquadSize: Number(maxSquadSize),
        targetTeamCount: Number(targetTeamCount),
        resetMode,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                ADMIN TOURNAMENT SETUP
              </span>
              <h3 className="font-['Outfit'] font-black text-lg text-white">
                Set Up New Auction & League
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Tournament Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tournament / League Title
            </label>
            <input
              type="text"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              placeholder="e.g., Premier Cricket League 2026"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* Number of Teams Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Number of Franchise Teams
              </label>
              <span className="text-xs font-mono font-bold text-indigo-600">
                {targetTeamCount} Teams Selected
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[4, 6, 8, 10].map((count) => {
                const isSelected = targetTeamCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setTargetTeamCount(count)}
                    className={`py-2.5 rounded-xl font-['Outfit'] font-bold text-xs border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {count} Teams
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500">
              You can also individually rename any franchise, change colors, or add custom teams below on the admin screen.
            </p>
          </div>

          {/* Squad Size & Purse Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Squad Size */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Squad Size Limit (Per Team)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={30}
                  value={maxSquadSize}
                  onChange={(e) => setMaxSquadSize(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Slots</span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                Standard: 11 to 16 players per franchise
              </span>
            </div>

            {/* Starting Points Purse */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Starting Purse (Points)
              </label>
              <input
                type="number"
                step={5000}
                value={startingPoints}
                onChange={(e) => setStartingPoints(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-400 block">
                Default: 100,000 points per franchise
              </span>
            </div>
          </div>

          {/* Reset / Start Mode */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Auction State & Bidding Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between text-xs transition-all ${
                  resetMode === 'pre-auction'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-2xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="resetMode"
                  value="pre-auction"
                  checked={resetMode === 'pre-auction'}
                  onChange={() => setResetMode('pre-auction')}
                  className="sr-only"
                />
                <span className="font-bold text-slate-900">Fresh Pre-Auction</span>
                <span className="text-[10px] text-slate-500 mt-1">
                  Reset all bids to 0. All registered players AVAILABLE. Purses fully restored.
                </span>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between text-xs transition-all ${
                  resetMode === 'none'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-2xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="resetMode"
                  value="none"
                  checked={resetMode === 'none'}
                  onChange={() => setResetMode('none')}
                  className="sr-only"
                />
                <span className="font-bold text-slate-900">Keep Current Sales</span>
                <span className="text-[10px] text-slate-500 mt-1">
                  Update tournament rules, squad sizes & titles without altering sold players.
                </span>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between text-xs transition-all ${
                  resetMode === 'official'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-2xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="resetMode"
                  value="official"
                  checked={resetMode === 'official'}
                  onChange={() => setResetMode('official')}
                  className="sr-only"
                />
                <span className="font-bold text-slate-900">Demo Sample Season</span>
                <span className="text-[10px] text-slate-500 mt-1">
                  Load populated sample season with completed test transactions.
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-['Outfit'] font-black text-sm shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Configuring Auction...' : 'Launch New Auction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
