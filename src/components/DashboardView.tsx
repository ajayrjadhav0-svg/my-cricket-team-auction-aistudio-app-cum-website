import React, { useState, useMemo } from 'react';
import {
  Users,
  CheckCircle,
  Clock,
  Coins,
  IndianRupee,
  TrendingUp,
  Gavel,
  Shield,
  ArrowRight,
  Trophy,
  UserCheck,
  Search,
  ChevronRight,
} from 'lucide-react';
import { useAuction } from '../context/AuctionContext';
import { formatINR, formatPoints, getTeamStatusBadge, getRoleBadgeStyle } from '../utils/formatters';
import { ActiveNav, Team } from '../types';

interface DashboardViewProps {
  onNavigate: (nav: ActiveNav) => void;
  onSelectTeamForSquad?: (teamId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onSelectTeamForSquad,
}) => {
  const { state, role } = useAuction();

  const [soldSearch, setSoldSearch] = useState('');

  const players = state?.players || [];
  const teams = state?.teams || [];

  // Memoized sold players
  const soldPlayers = useMemo(() => {
    return players
      .filter((p) => p.status === 'SOLD' || Boolean(p.soldToTeamId))
      .sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0));
  }, [players]);

  const filteredSoldPlayers = useMemo(() => {
    if (!soldSearch.trim()) return soldPlayers;
    const query = soldSearch.toLowerCase();
    return soldPlayers.filter((p) => {
      const team = teams.find((t) => t.id === p.soldToTeamId);
      return (
        p.name.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query) ||
        p.role.toLowerCase().includes(query) ||
        (team && team.name.toLowerCase().includes(query)) ||
        (team && team.shortCode.toLowerCase().includes(query))
      );
    });
  }, [soldPlayers, soldSearch, teams]);

  if (!state) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        Loading Cricket League Auction Dashboard...
      </div>
    );
  }

  const { summary, bidding, settings } = state;
  const currentPlayer = players.find((p) => p.id === bidding.currentPlayerId) || players[0];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Live Auction Stage Banner */}
      <div className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xl shadow-xs">
            <Gavel className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider">
                CURRENT PLAYER ON HAMMER
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Order #{currentPlayer?.auctionOrder || 1}
              </span>
            </div>
            <h3 className="font-['Outfit'] font-extrabold text-lg md:text-xl text-slate-900 mt-0.5">
              {currentPlayer ? `${currentPlayer.code} • ${currentPlayer.name}` : 'Auction Inactive'}
            </h3>
            <p className="text-xs text-slate-600">
              {currentPlayer?.role}
              {currentPlayer?.soldToTeamId && (
                <span className="ml-2 text-emerald-600 font-medium">
                  (Currently {currentPlayer.status})
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('live-auction')}
          id="btn-dash-jump-auction"
          className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-['Outfit'] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
        >
          <span>OPEN LIVE AUCTION DESK</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 6 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {/* Total Players */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Players</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <span className="font-['Outfit'] font-extrabold text-2xl md:text-3xl text-slate-900">
              {summary.totalPlayers}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {settings.maxSquadSize} per team × {teams.length} teams
            </p>
          </div>
        </div>

        {/* Players Sold */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Players Sold</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="font-['Outfit'] font-extrabold text-2xl md:text-3xl text-emerald-600">
              {summary.playersSold}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Auctioned to teams
            </p>
          </div>
        </div>

        {/* Players Available */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Available</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className="font-['Outfit'] font-extrabold text-2xl md:text-3xl text-amber-600">
              {summary.playersAvailable}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {summary.playersUnsold > 0 ? `(${summary.playersUnsold} Unsold)` : 'Open for auction'}
            </p>
          </div>
        </div>

        {/* Total Points Spent */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Points Spent</span>
            <Coins className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <span className="font-['Outfit'] font-extrabold text-2xl md:text-3xl text-slate-900">
              {formatPoints(summary.totalAuctionPointsSpent)}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">Auction points spent</p>
          </div>
        </div>

        {/* Total Committee Extra Cash */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Extra Cash ₹</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="font-['Outfit'] font-extrabold text-2xl md:text-3xl text-emerald-600">
              {formatINR(summary.totalCommitteeCash)}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">Penalties & Fees</p>
          </div>
        </div>

        {/* Progress % */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Progress</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-['Outfit'] font-extrabold text-2xl md:text-3xl text-indigo-600">
                {summary.auctionProgressPct}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${summary.auctionProgressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* TEAM-WISE LIVE TABLE */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-['Outfit'] font-extrabold text-base md:text-lg text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              <span>TEAM-WISE LIVE AUCTION TABLE</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Purse: {formatINR(settings.startingPoints)} pts • {settings.maxSquadSize} Max Players • Safe Bidding Floor
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => onNavigate('team-squads')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>View Squads ({settings.maxSquadSize} Slots)</span>
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-['Outfit'] uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-bold">TEAM</th>
                <th className="py-3.5 px-3 font-bold text-center">SQUAD PLAYERS</th>
                <th className="py-3.5 px-3 font-bold text-center">SLOTS LEFT</th>
                <th className="py-3.5 px-3 font-bold text-right">POINTS SPENT</th>
                <th className="py-3.5 px-3 font-bold text-right">POINTS REMAINING</th>
                <th className="py-3.5 px-3 font-bold text-right">MAX SAFE BID</th>
                <th className="py-3.5 px-3 font-bold text-right">COMMITTEE ₹</th>
                <th className="py-3.5 px-4 font-bold text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {teams.map((team) => {
                const statusBadge = getTeamStatusBadge(team.status);
                const squadProgressPct = Math.min(
                  100,
                  Math.round((team.totalPlayers / settings.maxSquadSize) * 100)
                );

                return (
                  <tr
                    key={team.id}
                    onClick={() => onSelectTeamForSquad && onSelectTeamForSquad(team.id)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    {/* Team Name & Short Code */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-['Outfit'] font-black text-xs shrink-0 shadow-2xs"
                          style={{ backgroundColor: team.badgeBg || team.color, color: team.badgeText || '#ffffff' }}
                        >
                          {team.shortCode}
                        </div>
                        <div>
                          <span className="font-['Outfit'] font-bold text-slate-900 block">
                            {team.name}
                          </span>
                          {/* Mini progress bar */}
                          <div className="w-24 bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${squadProgressPct}%`,
                                backgroundColor: team.color,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Total Players */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                      {team.totalPlayers} / {settings.maxSquadSize}
                    </td>

                    {/* Slots Left */}
                    <td className="py-3 px-3 text-center font-mono text-slate-600">
                      {Math.max(0, settings.maxSquadSize - team.totalPlayers)}
                    </td>

                    {/* Points Spent */}
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-700">
                      {formatPoints(team.totalPointsSpent)}
                    </td>

                    {/* Points Remaining */}
                    <td className="py-3 px-3 text-right font-mono">
                      <span
                        className={`font-bold ${
                          team.pointsRemaining < 0
                            ? 'text-rose-600'
                            : team.pointsRemaining === 0
                            ? 'text-slate-400'
                            : 'text-emerald-600'
                        }`}
                      >
                        {formatPoints(team.pointsRemaining)}
                      </span>
                    </td>

                    {/* Max Safe Bid */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-indigo-600">
                      {formatPoints(team.maxSafeBid)}
                    </td>

                    {/* Committee ₹ */}
                    <td className="py-3 px-3 text-right font-mono">
                      {team.committeeCash > 0 ? (
                        <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {formatINR(team.committeeCash)}
                        </span>
                      ) : (
                        <span className="text-slate-400">₹0</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border font-['Outfit'] uppercase tracking-wider ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                      >
                        {team.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SOLD PLAYERS (IN SHORT) */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Outfit'] font-extrabold text-base md:text-lg text-slate-900">
                  SOLD PLAYERS ROSTER
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold">
                  {soldPlayers.length} Sold
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Summary of players hammered down and allocated to franchises
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={soldSearch}
                onChange={(e) => setSoldSearch(e.target.value)}
                placeholder="Search sold players..."
                className="w-44 sm:w-56 bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
            <button
              onClick={() => onNavigate('auction-history')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors shrink-0 flex items-center gap-1 shadow-2xs"
            >
              <span>Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {soldPlayers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs space-y-1">
            <UserCheck className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
            <p className="font-medium text-slate-600">No players have been sold yet.</p>
            <p className="text-slate-400 text-[11px]">
              Players sold through the live auction hammer will be listed here with their winning franchise and points.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-72 overflow-y-auto scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-['Outfit'] uppercase tracking-wider text-[10px] border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-4 font-bold"># CODE & PLAYER</th>
                  <th className="py-2.5 px-3 font-bold">ROLE</th>
                  <th className="py-2.5 px-4 font-bold">SOLD TO FRANCHISE</th>
                  <th className="py-2.5 px-4 font-bold text-right">HAMMER PRICE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSoldPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                      No sold players matching &quot;{soldSearch}&quot;
                    </td>
                  </tr>
                ) : (
                  filteredSoldPlayers.map((player) => {
                    const team = teams.find((t) => t.id === player.soldToTeamId);
                    const roleStyle = getRoleBadgeStyle(player.role);
                    return (
                      <tr key={player.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-indigo-600 font-bold text-[11px]">
                              {player.code}
                            </span>
                            <span className="font-['Outfit'] font-bold text-slate-900">
                              {player.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                          >
                            {player.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          {team ? (
                            <div className="flex items-center gap-2">
                              <span
                                className="w-5 h-5 rounded text-[9px] font-black flex items-center justify-center shrink-0 shadow-2xs"
                                style={{ backgroundColor: team.badgeBg || team.color, color: team.badgeText || '#ffffff' }}
                              >
                                {team.shortCode}
                              </span>
                              <span className="font-['Outfit'] font-semibold text-slate-800">
                                {team.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">
                          {formatPoints(player.soldPrice)} pts
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
