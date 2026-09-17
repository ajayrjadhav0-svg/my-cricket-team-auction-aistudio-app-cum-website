import React from 'react';
import { Trophy, Shield, X, RotateCcw, MapPin, IndianRupee } from 'lucide-react';
import { Player, Team, TournamentSettings } from '../../types';
import { formatINR, formatPoints, getRoleBadgeStyle } from '../../utils/formatters';

interface TeamSquadModalProps {
  isOpen: boolean;
  team: Team | null;
  players: Player[];
  settings: TournamentSettings;
  onClose: () => void;
  onReopenPlayer?: (playerId: number) => Promise<boolean>;
}

export const TeamSquadModal: React.FC<TeamSquadModalProps> = ({
  isOpen,
  team,
  players,
  settings,
  onClose,
  onReopenPlayer,
}) => {
  if (!isOpen || !team) return null;

  const squadPlayers = players.filter((p) => p.soldToTeamId === team.id);

  // Village/Zone Breakdown
  const zoneCounts: Record<string, number> = {};
  squadPlayers.forEach((p) => {
    zoneCounts[p.village] = (zoneCounts[p.village] || 0) + 1;
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-['Outfit'] font-black text-lg text-white shadow-2xs shrink-0"
              style={{ backgroundColor: team.color }}
            >
              {team.shortCode}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Outfit'] font-black text-xl text-white">
                  {team.name}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-white border border-white/20 uppercase font-mono">
                  {team.totalPlayers} / {settings.maxSquadSize} SQUAD SLOTS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Remaining Purse: <span className="font-bold text-emerald-400">{formatPoints(team.pointsRemaining)} pts</span> • Max Safe Bid: <span className="font-bold text-indigo-400">{formatPoints(team.maxSafeBid)} pts</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zone Breakdown Chips */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2 flex-wrap text-xs">
          <span className="font-bold text-slate-600 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span>Zone Quota Distribution:</span>
          </span>
          {Object.keys(zoneCounts).length === 0 ? (
            <span className="text-slate-400 italic">No players acquired yet.</span>
          ) : (
            Object.entries(zoneCounts).map(([zone, count]) => (
              <span
                key={zone}
                className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 font-medium text-slate-700"
              >
                {zone}: <strong className="font-mono">{count}</strong>
              </span>
            ))
          )}
        </div>

        {/* Squad Table */}
        <div className="p-4 overflow-y-auto flex-1">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-['Outfit'] uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-bold">SLOT #</th>
                <th className="py-2.5 px-3 font-bold">TYPE</th>
                <th className="py-2.5 px-3 font-bold">PLAYER</th>
                <th className="py-2.5 px-2 font-bold">ROLE</th>
                <th className="py-2.5 px-3 font-bold">ZONE</th>
                <th className="py-2.5 px-3 font-bold text-right">POINTS</th>
                {onReopenPlayer && <th className="py-2.5 px-2 text-center font-bold">ACTION</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {Array.from({ length: settings.maxSquadSize }).map((_, idx) => {
                const slot = idx + 1;
                const player = squadPlayers[idx];

                if (player) {
                  const roleStyle = getRoleBadgeStyle(player.role);
                  return (
                    <tr key={player.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-500">#{slot}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                            player.isIcon
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {player.isIcon ? 'ICON' : 'AUCTION'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-['Outfit'] font-bold text-slate-900">
                        {player.code} - {player.name}
                      </td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                        >
                          {player.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{player.village}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatPoints(player.soldPrice)} pts
                      </td>
                      {onReopenPlayer && (
                        <td className="py-2.5 px-2 text-center">
                          {!player.isIcon && (
                            <button
                              onClick={() => onReopenPlayer(player.id)}
                              title="Rollback player sale back to Available"
                              className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                }

                // Empty Slot
                return (
                  <tr key={`empty-${idx}`} className="bg-slate-50/40 text-slate-400">
                    <td className="py-2.5 px-3 font-mono font-semibold">#{slot}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[9px] px-1.5 py-0.5 rounded border border-dashed border-slate-300">
                        EMPTY
                      </span>
                    </td>
                    <td className="py-2.5 px-3 italic text-slate-400">Unfilled Squad Slot</td>
                    <td className="py-2.5 px-2">—</td>
                    <td className="py-2.5 px-3">—</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">—</td>
                    {onReopenPlayer && <td className="py-2.5 px-2">—</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Total Points Spent: <strong className="text-slate-900 font-mono">{formatPoints(team.totalPointsSpent)} pts</strong>
            {team.committeeCash > 0 && (
              <span className="ml-3 text-rose-600 font-bold">
                Penalty Cash: {formatINR(team.committeeCash)}
              </span>
            )}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Close Roster
          </button>
        </div>
      </div>
    </div>
  );
};
