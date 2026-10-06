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

  const soldTeam = currentPlayer.soldToTeamId
    ? teams.find((t) => t.id === currentPlayer.soldToTeamId)
    : null;

  const roleStyle = getRoleBadgeStyle(currentPlayer.role);
  const statusStyle = getStatusBadgeStyle(currentPlayer.status);

  return (
    <div className="pb-6 max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full px-1 sm:px-2">
      {/* PROMINENT BROADCAST STAGE SHOWCASE (EXPANDS TO FILL BOTH LAPTOP & MOBILE SCREENS) */}
      <div className="rounded-3xl bg-white border-2 border-slate-200 overflow-hidden shadow-2xl transition-all">
        {/* Top Header: Player Code, Carousel Nav Arrows, & Live Status */}
        <div className="py-3 px-4 sm:px-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              id="btn-prev-player-card"
              onClick={() => navigatePlayer('prev')}
              title="Previous Player (or use Left Arrow key)"
              aria-label="Previous Player"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/25 text-slate-200 hover:text-white transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <span className="font-mono font-black text-amber-300 text-sm sm:text-base md:text-lg px-3 py-1 rounded-xl bg-amber-400/20 border border-amber-400/30 shadow-xs">
              {currentPlayer.code}
            </span>

            <span className="text-xs sm:text-sm text-slate-300 font-extrabold tracking-wider uppercase">
              AUCTION #{currentPlayer.auctionOrder || 1}
            </span>

            <button
              id="btn-next-player-card"
              onClick={() => navigatePlayer('next')}
              title="Next Player (or use Right Arrow key)"
              aria-label="Next Player"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/25 text-slate-200 hover:text-white transition-all active:scale-95"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs sm:text-sm font-['Outfit'] font-black px-3.5 sm:px-4 py-1 rounded-full border uppercase tracking-wider shadow-xs ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
            >
              {currentPlayer.status}
            </span>
          </div>
        </div>

        {/* Player Visual & Identity Showcase */}
        <div className="p-5 sm:p-8 md:p-10 flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-12">
          {/* High-Resolution Player Photo */}
          <div className="shrink-0 w-full sm:w-auto flex justify-center">
            {(currentPlayer.photoUrl || currentPlayer.photo) ? (
              <div className="w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-[350px] lg:h-[350px] xl:w-[390px] xl:h-[390px] rounded-3xl overflow-hidden border-4 border-indigo-500 shadow-2xl bg-slate-950 relative group ring-4 ring-indigo-500/20">
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
              <div className="w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-[350px] lg:h-[350px] xl:w-[390px] xl:h-[390px] rounded-3xl bg-gradient-to-br from-indigo-50 via-slate-100 to-indigo-100 border-4 border-indigo-300 flex flex-col items-center justify-center text-8xl sm:text-9xl shadow-2xl relative ring-4 ring-indigo-500/10">
                <span>🏏</span>
                <span className="text-xs sm:text-sm font-black font-['Outfit'] text-indigo-700 tracking-widest uppercase mt-3 bg-white/80 px-3 py-1 rounded-full border border-indigo-200">
                  {currentPlayer.role}
                </span>
              </div>
            )}
          </div>

          {/* Player Identity, Badges, & Integrated Sold Team Card */}
          <div className="flex-1 w-full text-center lg:text-left space-y-4 max-w-xl">
            <div>
              <span className="text-xs sm:text-sm font-mono font-bold text-indigo-600 uppercase tracking-widest block mb-1">
                OFFICIAL PLAYER TOKEN • {currentPlayer.code}
              </span>
              <h2 className="font-['Outfit'] font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-slate-950 tracking-tight uppercase leading-tight drop-shadow-xs break-words">
                {currentPlayer.name}
              </h2>
            </div>

            {/* Role & Village Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-0.5">
              <span
                className={`text-sm sm:text-base font-black px-4 sm:px-5 py-1.5 sm:py-2 rounded-2xl border-2 shadow-xs tracking-wide uppercase inline-flex items-center gap-1.5 ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
              >
                {currentPlayer.role}
              </span>
              {currentPlayer.village && (
                <span className="text-sm sm:text-base font-black px-4 sm:px-5 py-1.5 sm:py-2 rounded-2xl bg-amber-50 text-amber-950 border-2 border-amber-300 shadow-xs tracking-wide uppercase inline-flex items-center gap-1.5">
                  📍 {currentPlayer.village}
                </span>
              )}
            </div>

            {/* INTEGRATED SOLD TEAM DISPLAY */}
            {soldTeam ? (
              <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/70 border-2 border-emerald-400 text-emerald-950 shadow-md">
                <div className="flex items-center justify-center lg:justify-start gap-3.5 sm:gap-4">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-white text-base sm:text-xl shadow-md border-2 border-white shrink-0"
                    style={{ backgroundColor: soldTeam.color || '#059669' }}
                  >
                    {soldTeam.shortCode}
                  </div>
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/90 px-2 py-0.5 rounded-md">
                        SOLD TO
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        Auction #{currentPlayer.auctionOrder || 1}
                      </span>
                    </div>
                    <div className="font-['Outfit'] font-black text-xl sm:text-2xl md:text-3xl text-slate-900 leading-tight truncate">
                      {soldTeam.name}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                      Winning Purse: <span className="font-mono font-black text-emerald-700 text-base sm:text-xl">{formatPoints(currentPlayer.soldPrice)} pts</span>
                    </div>
                  </div>
                </div>

                {role === 'admin' && (
                  <div className="mt-3 pt-2.5 border-t border-emerald-200/80 flex justify-end">
                    <button
                      onClick={() => reopenPlayer(currentPlayer.id)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100/80 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reopen Auction</span>
                    </button>
                  </div>
                )}
              </div>
            ) : currentPlayer.status === 'AVAILABLE' ? (
              <div className="mt-4 p-4 rounded-2xl bg-indigo-50/80 border-2 border-indigo-200 text-indigo-950 flex items-center justify-center lg:justify-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-sm shrink-0">
                  ⚡
                </div>
                <div className="text-left">
                  <span className="text-[11px] font-extrabold text-indigo-700 uppercase tracking-wider block">
                    Live Bidding Stage
                  </span>
                  <span className="font-['Outfit'] font-black text-base sm:text-lg text-slate-900 block leading-tight">
                    Ready on Hammer
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <span className="font-['Outfit'] font-bold text-sm sm:text-base">
                    Player Currently Unsold
                  </span>
                </div>
                {role === 'admin' && (
                  <button
                    onClick={() => reopenPlayer(currentPlayer.id)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-['Outfit'] font-bold text-xs shadow-xs transition-colors"
                  >
                    Reopen
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
