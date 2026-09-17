import React, { useState, useEffect } from 'react';
import {
  Gavel,
  ChevronLeft,
  ChevronRight,
  Shield,
  Coins,
  AlertTriangle,
  Check,
  RotateCcw,
  Search,
  MapPin,
  TrendingUp,
  Eye,
  Sliders,
  DollarSign,
  Share2,
} from 'lucide-react';
import { useAuction } from '../context/AuctionContext';
import { Player, Team } from '../types';
import {
  formatINR,
  formatPoints,
  getRoleBadgeStyle,
  getStatusBadgeStyle,
} from '../utils/formatters';

export const LiveAuctionView: React.FC = () => {
  const {
    state,
    role,
    placeBid,
    validateSale,
    sellPlayer,
    markUnsold,
    reopenPlayer,
    navigatePlayer,
    getViewerShareUrl,
    showNotification,
  } = useAuction();

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [customBidInput, setCustomBidInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPlayerPicker, setShowPlayerPicker] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sell Confirmation Modal State
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [adminOverride, setAdminOverride] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    error?: string;
    warning?: string;
    villageCount?: number;
    teamRemaining?: number;
    maxSafeBid?: number;
  } | null>(null);

  if (!state) {
    return <div className="p-8 text-slate-400">Loading live auction console...</div>;
  }

  const { players, teams, bidding, settings } = state;

  // Active player on the hammer
  const currentPlayer =
    players.find((p) => p.id === bidding.currentPlayerId) || players[0] || {
      id: 1,
      code: 'P001',
      name: 'READY FOR AUCTION',
      village: 'General',
      role: 'All-Rounder',
      auctionOrder: 1,
      status: 'AVAILABLE',
      soldToTeamId: null,
      soldPrice: 0,
      isIcon: false,
    };

  // If no team is selected yet, default to the first team or bidding.selectedTeamId
  useEffect(() => {
    if (!selectedTeamId && teams.length > 0) {
      setSelectedTeamId(bidding.selectedTeamId || teams[0].id);
    }
  }, [teams, bidding.selectedTeamId, selectedTeamId]);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  // Compute village/zone count for selected team and current player
  const teamSoldPlayers = players.filter((p) => p.soldToTeamId === selectedTeam?.id);
  const teamVillageCount = teamSoldPlayers.filter(
    (p) => p.village.toLowerCase() === currentPlayer?.village?.toLowerCase()
  ).length;

  const currentBid = bidding.currentBid || settings.defaultReservePrice || 1000;

  // Quick bid increment handler
  const handleAddBid = (increment: number) => {
    if (role !== 'admin') return;
    const nextBid = currentBid + increment;
    placeBid(currentPlayer.id, selectedTeamId, nextBid);
  };

  // Custom bid submission
  const handleCustomBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== 'admin') return;
    const val = parseInt(customBidInput.replace(/,/g, ''), 10);
    if (!isNaN(val) && val > 0) {
      placeBid(currentPlayer.id, selectedTeamId, val);
      setCustomBidInput('');
    }
  };

  // Click "SELL PLAYER" button
  const handleOpenSellModal = async () => {
    if (!selectedTeam) return;
    const val = await validateSale(currentPlayer.id, selectedTeam.id, currentBid);
    setValidationResult(val);
    setAdminOverride(false);
    setConfirmModalOpen(true);
  };

  // Confirm Sale execution
  const handleExecuteSale = async () => {
    if (!selectedTeam) return;
    const ok = await sellPlayer(
      currentPlayer.id,
      selectedTeam.id,
      currentBid,
      adminOverride
    );
    if (ok) {
      setConfirmModalOpen(false);
    }
  };

  // Filtered players for picker
  const filteredPlayers = players.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.village.toLowerCase().includes(q)
    );
  });

  const roleStyle = getRoleBadgeStyle(currentPlayer.role);
  const statusStyle = getStatusBadgeStyle(currentPlayer.status);

  return (
    <div className="space-y-5 pb-12 max-w-7xl mx-auto">
      {/* Viewer Mode Notification Banner */}
      {role === 'viewer' && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-sky-900 uppercase tracking-wide">
                  Live Spectator Broadcast
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs text-sky-700 mt-0.5">
                You are watching real-time live bidding updates and team squads as the tournament director conducts the auction.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const link = getViewerShareUrl();
              navigator.clipboard.writeText(link);
              setCopiedLink(true);
              showNotification('success', 'Viewer link copied!');
              setTimeout(() => setCopiedLink(false), 3000);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-sky-800 text-xs font-bold hover:bg-sky-100/60 transition-all self-start sm:self-auto"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share Stream Link'}</span>
          </button>
        </div>
      )}

      {/* Top Controls: Player Carousel & Quick Jump */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            id="btn-prev-player"
            onClick={() => navigatePlayer('prev')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">PREVIOUS</span>
          </button>

          <span className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-indigo-600">
            {currentPlayer.auctionOrder || 1} / {players.length}
          </span>

          <button
            id="btn-next-player"
            onClick={() => navigatePlayer('next')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold active:scale-95 transition-all"
          >
            <span className="hidden sm:inline">NEXT</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Player Select Drawer Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowPlayerPicker(!showPlayerPicker)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-indigo-600" />
            <span>Browse Player Roster ({players.length})</span>
          </button>

          {/* Dropdown Menu */}
          {showPlayerPicker && (
            <div className="absolute right-0 top-10 w-80 md:w-96 max-h-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 overflow-hidden flex flex-col">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, ID (P001), or zone..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2 font-medium"
              />
              <div className="overflow-y-auto flex-1 divide-y divide-slate-100 space-y-1">
                {filteredPlayers.slice(0, 40).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      navigatePlayer(undefined, p.id);
                      setShowPlayerPicker(false);
                    }}
                    className="w-full text-left py-2 px-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-mono text-slate-400 font-bold mr-2">{p.code}</span>
                      <span className="font-['Outfit'] font-bold text-slate-900">{p.name}</span>
                      <span className="text-[10px] text-slate-500 block">
                        {p.village} • {p.role}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                        p.status === 'SOLD' || p.status === 'ICON'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : p.status === 'UNSOLD'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-sky-100 text-sky-800 border-sky-200'
                      }`}
                    >
                      {p.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MAIN 2-COLUMN BIDDING ARENA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT: PROMINENT PLAYER SHOWCASE (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
          <div>
            {/* Header: Player ID & Status */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-indigo-600 text-sm px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                  {currentPlayer.code}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  AUCTION #{currentPlayer.auctionOrder}
                </span>
              </div>

              <span
                className={`text-xs font-['Outfit'] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
              >
                {currentPlayer.status}
              </span>
            </div>

            {/* Player Visual & Identity */}
            <div className="p-5 md:p-6 text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-100 border border-slate-200 flex items-center justify-center text-4xl shadow-2xs relative">
                🏏
                {currentPlayer.isIcon && (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px] uppercase shadow-sm">
                    ICON
                  </span>
                )}
              </div>

              <div>
                <h2 className="font-['Outfit'] font-black text-2xl md:text-3xl text-slate-900 tracking-tight">
                  {currentPlayer.name}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                  >
                    {currentPlayer.role}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{currentPlayer.village}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Sold Status info if already sold */}
            {currentPlayer.status !== 'AVAILABLE' && (
              <div className="mx-5 mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs">
                {currentPlayer.soldToTeamId ? (
                  <div>
                    <span className="text-slate-500">Allocated to </span>
                    <span className="font-bold text-slate-900">
                      {teams.find((t) => t.id === currentPlayer.soldToTeamId)?.name}
                    </span>
                    <span className="text-slate-500"> for </span>
                    <span className="font-mono font-bold text-indigo-600">
                      {formatPoints(currentPlayer.soldPrice)} pts
                    </span>
                  </div>
                ) : (
                  <span className="text-amber-700 font-bold">Player currently UNSOLD</span>
                )}

                {role === 'admin' && !currentPlayer.isIcon && (
                  <button
                    onClick={() => reopenPlayer(currentPlayer.id)}
                    className="mt-2 text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center justify-center gap-1 mx-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reopen for Live Bidding</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Player Bio & Quota Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 space-y-2">
            <div className="flex justify-between items-center">
              <span>Category / Role</span>
              <span className="font-bold text-slate-900">{currentPlayer.role}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Regional Zone</span>
              <span className="font-bold text-slate-900">{currentPlayer.village}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Selected Team Roster Count from this Zone</span>
              <span
                className={`font-mono font-bold ${
                  teamVillageCount >= settings.maxVillageLimit ? 'text-amber-600' : 'text-slate-900'
                }`}
              >
                {teamVillageCount} / {settings.maxVillageLimit}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE BIDDING DESK & TEAM PURSE CALCULATOR (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* BID DISPLAY CARD */}
          <div className="rounded-2xl bg-white border border-slate-200 p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                Current Winning Bid On Hammer
              </span>
              <span className="text-xs font-mono text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Floor
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-5xl font-['Outfit'] font-black text-slate-900 tracking-tight font-mono">
                  {currentBid.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-indigo-600 uppercase">Points</span>
              </div>

              {selectedTeam && (
                <div className="text-xs text-slate-500">
                  Leading: <span className="font-bold text-slate-900">{selectedTeam.name}</span>
                </div>
              )}
            </div>

            {/* Admin Bidding Controls */}
            {role === 'admin' ? (
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-4">
                {/* Team Selector Pills */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Franchise Placing Bid:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {teams.map((t) => {
                      const isSelected = t.id === selectedTeamId;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTeamId(t.id)}
                          className={`p-2 rounded-xl text-left border transition-all ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: t.color }}
                            />
                            <span className="text-[10px] font-bold font-mono">
                              {formatPoints(t.pointsRemaining)}
                            </span>
                          </div>
                          <p className="font-['Outfit'] font-bold text-xs truncate mt-1">
                            {t.shortCode} - {t.name}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Increment Buttons */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Raise Bid By (+):
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1000, 2000, 5000, 10000].map((inc) => (
                      <button
                        key={inc}
                        onClick={() => handleAddBid(inc)}
                        className="py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 border border-slate-200 text-slate-900 font-bold text-xs transition-all active:scale-95"
                      >
                        +{inc >= 1000 ? `${inc / 1000}K` : inc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Bid Input Form */}
                <form onSubmit={handleCustomBidSubmit} className="flex gap-2">
                  <input
                    type="number"
                    step={settings.minBidIncrement || 1000}
                    value={customBidInput}
                    onChange={(e) => setCustomBidInput(e.target.value)}
                    placeholder="Enter custom bid points..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    Set Bid
                  </button>
                </form>

                {/* Hammer Execution Triggers */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    id="btn-sell-player-modal"
                    onClick={handleOpenSellModal}
                    className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-['Outfit'] font-black text-xs sm:text-sm tracking-wide shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Gavel className="w-4 h-4 text-emerald-200" />
                    <span>HAMMER DOWN (SELL)</span>
                  </button>

                  <button
                    id="btn-mark-unsold"
                    onClick={() => markUnsold(currentPlayer.id)}
                    className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-['Outfit'] font-black text-xs sm:text-sm tracking-wide shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>PASS (UNSOLD)</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Viewer Mode: Read-Only Broadcast Display */
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <span className="font-bold text-slate-900 block mb-0.5">
                    Spectator Live Floor
                  </span>
                  Bidding is actively controlled by the tournament admin desk. This screen syncs automatically every 2.5 seconds.
                </div>

                {/* Team Selector Preview for Viewer to inspect team purses */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Inspect Team Purse & Safe Limits:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {teams.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTeamId(t.id)}
                        className={`p-2 rounded-xl text-left border transition-all ${
                          t.id === selectedTeamId
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className="font-['Outfit'] font-bold text-xs truncate block">
                          {t.shortCode} - {t.name}
                        </span>
                        <span className="text-[10px] font-mono opacity-80 block">
                          {formatPoints(t.pointsRemaining)} pts left
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SELECTED TEAM PURSE & REAL-TIME IMPACT AUDIT */}
          {selectedTeam && (
            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedTeam.color }}
                  />
                  <h4 className="font-['Outfit'] font-black text-slate-900 text-sm">
                    {selectedTeam.name} Purse Status
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {selectedTeam.totalPlayers} / {settings.maxSquadSize} Squad Filled
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Current Remaining</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      selectedTeam.pointsRemaining < 0 ? 'text-rose-600' : 'text-slate-900'
                    }`}
                  >
                    {formatPoints(selectedTeam.pointsRemaining)} pts
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Safe Max Bid</span>
                  <span className="font-mono font-bold text-sm text-indigo-600">
                    {formatPoints(selectedTeam.maxSafeBid)} pts
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">After This Bid</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      selectedTeam.pointsRemaining - currentBid < 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {formatPoints(selectedTeam.pointsRemaining - currentBid)} pts
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Extra Penalty Cash</span>
                  <span className="font-mono font-bold text-sm text-rose-600">
                    {formatINR(selectedTeam.committeeCash)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONFIRMATION HAMMER MODAL (Admin Only) */}
      {confirmModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-emerald-600" />
                <h3 className="font-['Outfit'] font-black text-slate-900 text-lg">
                  Confirm Player Sale
                </h3>
              </div>
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Player:</span>
                <span className="font-bold text-slate-900">
                  {currentPlayer.name} ({currentPlayer.code})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Buying Team:</span>
                <span className="font-bold text-slate-900">{selectedTeam.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Winning Price:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {currentBid.toLocaleString()} Points
                </span>
              </div>
            </div>

            {/* Validation warning if any */}
            {validationResult?.warning && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Tournament Rule Advisory:</span>
                  <span>{validationResult.warning}</span>
                </div>
              </div>
            )}

            {validationResult?.error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {validationResult.error}
              </div>
            )}

            {/* Admin Override Checkbox */}
            {validationResult?.warning && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="admin-override-chk"
                  checked={adminOverride}
                  onChange={(e) => setAdminOverride(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="admin-override-chk" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Authoritative Admin Override (Approve sale anyway)
                </label>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-sale-final"
                onClick={handleExecuteSale}
                disabled={Boolean(validationResult?.error)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm"
              >
                Confirm Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
