import React, { useEffect } from 'react';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuction } from '../context/AuctionContext';
import {
  formatPoints,
  getRoleBadgeStyle,
  getStatusBadgeStyle,
} from '../utils/formatters';
import { getDefaultAvatarForRole } from '../data/presetAvatars';

export const LiveAuctionView: React.FC = () => {
  const {
    state,
    role,
    reopenPlayer,
    navigatePlayer,
  } = useAuction();

  // Support keyboard arrow navigation (Left / Right keys or projector clickers)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        navigatePlayer('prev');
      } else if (e.key === 'ArrowRight') {
        navigatePlayer('next');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigatePlayer]);

  if (!state) {
    return <div className="p-8 text-slate-400">Loading live auction console...</div>;
  }

  const { players, teams, bidding } = state;

  // Active player on the hammer
  const currentPlayer =
    players.find((p) => p.id === bidding.currentPlayerId) || players[0] || {
      id: 1,
      code: 'P001',
      name: 'READY FOR AUCTION',
      role: 'All-Rounder',
      auctionOrder: 1,
      status: 'AVAILABLE',
      soldToTeamId: null,
      soldPrice: 0,
    };

  const roleStyle = getRoleBadgeStyle(currentPlayer.role);
  const statusStyle = getStatusBadgeStyle(currentPlayer.status);

  return (
    <div className="pb-4 max-w-xl md:max-w-2xl mx-auto w-full">
      {/* PROMINENT FULL-STAGE PLAYER SHOWCASE (COMPACT TO FIT SCREEN) */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-lg flex flex-col justify-between transition-all">
        <div>
          {/* Header: Player ID, Carousel Arrows, & Status */}
          <div className="py-2.5 px-3.5 sm:px-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                id="btn-prev-player-card"
                onClick={() => navigatePlayer('prev')}
                title="Previous Player (or use Left Arrow key)"
                aria-label="Previous Player"
                className="p-1 rounded-lg bg-white/10 hover:bg-white/25 text-slate-200 hover:text-white transition-all active:scale-95"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="font-mono font-black text-amber-300 text-sm sm:text-base px-2.5 py-0.5 rounded-lg bg-amber-400/20 border border-amber-400/30 shadow-2xs">
                {currentPlayer.code}
              </span>

              <span className="text-xs text-slate-300 font-extrabold tracking-wider uppercase">
                AUCTION #{currentPlayer.auctionOrder || 1}
              </span>

              <button
                id="btn-next-player-card"
                onClick={() => navigatePlayer('next')}
                title="Next Player (or use Right Arrow key)"
                aria-label="Next Player"
                className="p-1 rounded-lg bg-white/10 hover:bg-white/25 text-slate-200 hover:text-white transition-all active:scale-95"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-['Outfit'] font-black px-3 py-0.5 rounded-full border uppercase tracking-wider shadow-2xs ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
              >
                {currentPlayer.status}
              </span>
            </div>
          </div>

          {/* Player Visual & Identity */}
          <div className="p-4 sm:p-5 text-center space-y-3.5">
            {(currentPlayer.photoUrl || currentPlayer.photo) ? (
              <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 max-w-full mx-auto rounded-2xl overflow-hidden border-3 border-indigo-500 shadow-xl bg-slate-950 relative group ring-4 ring-indigo-500/20">
                <img
                  src={currentPlayer.photoUrl || currentPlayer.photo}
                  alt={currentPlayer.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getDefaultAvatarForRole(currentPlayer.role);
                  }}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 max-w-full mx-auto rounded-2xl bg-gradient-to-br from-indigo-50 via-slate-100 to-indigo-100 border-3 border-indigo-300 flex flex-col items-center justify-center text-6xl sm:text-7xl shadow-xl relative ring-4 ring-indigo-500/10">
                <span>🏏</span>
                <span className="text-[11px] font-black font-['Outfit'] text-indigo-700 tracking-widest uppercase mt-2 bg-white/80 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  {currentPlayer.role}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <h2 className="font-['Outfit'] font-black text-2xl sm:text-3xl md:text-4xl text-slate-950 tracking-tight uppercase leading-none drop-shadow-2xs break-words">
                {currentPlayer.name}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
                <span
                  className={`text-xs sm:text-sm font-black px-3.5 py-1 rounded-xl border shadow-2xs tracking-wide uppercase inline-flex items-center gap-1.5 ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                >
                  {currentPlayer.role}
                </span>
                {currentPlayer.village && (
                  <span className="text-xs sm:text-sm font-black px-3.5 py-1 rounded-xl bg-amber-50 text-amber-950 border border-amber-300 shadow-2xs tracking-wide uppercase inline-flex items-center gap-1">
                    📍 {currentPlayer.village}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sold Status info if already sold */}
          {currentPlayer.status !== 'AVAILABLE' && (
            <div className="mx-4 mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs sm:text-sm">
              {currentPlayer.soldToTeamId ? (
                <div>
                  <span className="text-slate-600 font-medium">Allocated to </span>
                  <span className="font-['Outfit'] font-black text-slate-950 text-sm sm:text-base">
                    {teams.find((t) => t.id === currentPlayer.soldToTeamId)?.name}
                  </span>
                  <span className="text-slate-600 font-medium"> for </span>
                  <span className="font-mono font-black text-indigo-700 text-sm sm:text-base">
                    {formatPoints(currentPlayer.soldPrice)} pts
                  </span>
                </div>
              ) : (
                <span className="text-amber-700 font-black text-xs uppercase tracking-wider">Player currently UNSOLD</span>
              )}

              {role === 'admin' && (
                <button
                  onClick={() => reopenPlayer(currentPlayer.id)}
                  className="mt-2 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1 mx-auto transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reopen for Live Bidding</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Player Bio Footer */}
        <div className="py-2.5 px-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-500 uppercase tracking-wider text-[10px]">Category / Playing Role</span>
            <span className="font-black text-slate-900 text-xs sm:text-sm">{currentPlayer.role}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-500 uppercase tracking-wider text-[10px]">Official Token Code</span>
            <span className="font-mono font-black text-indigo-700 text-xs sm:text-sm">{currentPlayer.code}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
