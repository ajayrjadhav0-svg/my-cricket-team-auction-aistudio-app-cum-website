import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Gavel,
  CheckCircle,
  Filter,
  Download,
  Shield,
  Eye,
  Share2,
} from 'lucide-react';
import { useAuction } from '../context/AuctionContext';
import { Player, PlayerRole, PlayerStatus, ActiveNav } from '../types';
import {
  formatPoints,
  getRoleBadgeStyle,
  getStatusBadgeStyle,
} from '../utils/formatters';
import { AuctionExportModal } from './AuctionExportModal';

interface PlayersViewProps {
  onNavigateToAuction?: (playerId?: number) => void;
}

export const PlayersView: React.FC<PlayersViewProps> = ({
  onNavigateToAuction,
}) => {
  const {
    state,
    role,
    addPlayer,
    updatePlayer,
    deletePlayer,
    reopenPlayer,
    navigatePlayer,
  } = useAuction();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deletingPlayer, setDeletingPlayer] = useState<Player | null>(null);

  // Form states for Add / Edit
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<PlayerRole>('All-Rounder');
  const [formOrder, setFormOrder] = useState<number>(1);

  const players = state?.players || [];
  const teams = state?.teams || [];
  const settings = state?.settings;

  // Filtered Players
  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'ALL' || p.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [players, searchTerm, roleFilter, statusFilter]);

  if (!state || !settings) {
    return <div className="p-8 text-slate-400">Loading players database...</div>;
  }

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormName('');
    setFormRole('All-Rounder');
    setFormOrder(players.length + 1);
    setIsAddModalOpen(true);
  };

  // Submit Add
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    const ok = await addPlayer({
      name: formName.trim().toUpperCase(),
      role: formRole,
      auctionOrder: Number(formOrder),
    });
    if (ok) setIsAddModalOpen(false);
  };

  // Open Edit Modal
  const handleOpenEditModal = (player: Player) => {
    setEditingPlayer(player);
    setFormName(player.name);
    setFormRole(player.role);
    setFormOrder(player.auctionOrder);
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;
    const ok = await updatePlayer(editingPlayer.id, {
      name: formName.trim().toUpperCase(),
      role: formRole,
      auctionOrder: Number(formOrder),
    });
    if (ok) setEditingPlayer(null);
  };

  // Submit Delete
  const handleDeleteConfirm = async () => {
    if (!deletingPlayer) return;
    const ok = await deletePlayer(deletingPlayer.id);
    if (ok) setDeletingPlayer(null);
  };

  return (
    <div className="space-y-5 pb-12 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <h2 className="font-['Outfit'] font-black text-lg md:text-xl text-slate-900 flex items-center gap-2.5">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>PLAYER DATABASE ({players.length} TOTAL)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered roster for {settings.tournamentName}. Filter by role or status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExportModalOpen(true)}
            id="btn-players-export-modal"
            className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4 text-indigo-600" />
            <span>Print / Share</span>
          </button>

          <a
            href="/api/export/csv"
            download="players_roster.csv"
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-700" />
            <span>Export CSV</span>
          </a>

          {role === 'admin' && (
            <button
              id="btn-add-player-modal"
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-['Outfit'] font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>ADD PLAYER</span>
            </button>
          )}
        </div>
      </div>

      <AuctionExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs shadow-2xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
        >
          <option value="ALL">All Roles / Disciplines</option>
          <option value="Batsman">Batsman</option>
          <option value="Bowler">Bowler</option>
          <option value="All-Rounder">All-Rounder</option>
          <option value="Wicketkeeper">Wicketkeeper</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
        >
          <option value="ALL">All Auction Statuses</option>
          <option value="AVAILABLE">AVAILABLE (In Pool)</option>
          <option value="SOLD">SOLD</option>
          <option value="UNSOLD">UNSOLD</option>
        </select>
      </div>

      {/* Players Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-['Outfit'] uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-bold"># ORDER</th>
                <th className="py-3.5 px-4 font-bold">CODE</th>
                <th className="py-3.5 px-4 font-bold">NAME</th>
                <th className="py-3.5 px-3 font-bold">ROLE</th>
                <th className="py-3.5 px-3 font-bold text-center">STATUS</th>
                <th className="py-3.5 px-3 font-bold">TEAM</th>
                <th className="py-3.5 px-4 font-bold text-right">SOLD PRICE</th>
                {role === 'admin' && (
                  <th className="py-3.5 px-4 font-bold text-center">ACTIONS</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={role === 'admin' ? 8 : 7} className="text-center py-12 text-slate-400">
                    No players found matching current filter query.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => {
                  const roleStyle = getRoleBadgeStyle(player.role);
                  const statusStyle = getStatusBadgeStyle(player.status);
                  const team = teams.find((t) => t.id === player.soldToTeamId);

                  return (
                    <tr key={player.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">
                        {player.auctionOrder}
                      </td>

                      <td className="py-3 px-4 font-mono font-black text-indigo-600">
                        {player.code}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-['Outfit'] font-bold text-slate-900">
                          {player.name}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                        >
                          {player.role}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          {player.status}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {team ? (
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: team.color }}
                            />
                            <span className="font-semibold text-slate-800">{team.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {player.soldPrice > 0 ? (
                          <span>{formatPoints(player.soldPrice)} pts</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {role === 'admin' && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Put on hammer button */}
                            <button
                              onClick={() => {
                                navigatePlayer(undefined, player.id);
                                if (onNavigateToAuction) onNavigateToAuction(player.id);
                              }}
                              title="Send Player to Auction Stage Hammer"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors"
                            >
                              <Gavel className="w-3.5 h-3.5" />
                            </button>

                            {/* Reopen / undo button if sold/unsold */}
                            {player.status !== 'AVAILABLE' && (
                              <button
                                onClick={() => reopenPlayer(player.id)}
                                title="Reopen player for bidding"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-600 transition-colors"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEditModal(player)}
                              title="Edit details"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setDeletingPlayer(player)}
                              title="Delete player"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT PLAYER MODAL (Admin Only) */}
      {(isAddModalOpen || editingPlayer) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-['Outfit'] font-black text-slate-900 text-lg">
              {editingPlayer ? 'Edit Player Record' : 'Add New Player'}
            </h3>

            <form
              onSubmit={editingPlayer ? handleEditSubmit : handleAddSubmit}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-bold mb-1">Player Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. VIRAT SHARMA"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Player Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as PlayerRole)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-Rounder">All-Rounder</option>
                  <option value="Wicketkeeper">Wicketkeeper</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Auction Queue Sequence (#)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formOrder}
                  onChange={(e) => setFormOrder(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingPlayer(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
                >
                  Save Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingPlayer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-['Outfit'] font-black text-rose-600 text-lg">
              Delete Player?
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently remove{' '}
              <strong className="text-slate-900">{deletingPlayer.name}</strong> ({deletingPlayer.code})?
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPlayer(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
