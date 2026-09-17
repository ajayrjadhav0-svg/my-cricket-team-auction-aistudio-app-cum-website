import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield,
  Gavel,
  Upload,
  Sparkles,
  Users,
  Share2,
  Copy,
  Check,
  Plus,
  Edit2,
  RotateCcw,
  AlertTriangle,
  Search,
  Eye,
  ArrowRight,
  IndianRupee,
  Layers,
  ChevronRight,
  X,
  Clock,
  UserCheck,
  UserPlus,
  RefreshCw,
  Trophy,
} from 'lucide-react';
import { useAuction } from '../context/AuctionContext';
import { formatINR, formatPoints, getRoleBadgeStyle } from '../utils/formatters';
import { ActiveNav, Player, PlayerRole, Team } from '../types';

import { ConfirmSaleModal } from './admin/ConfirmSaleModal';
import { SetNewAuctionModal } from './admin/SetNewAuctionModal';
import { EditTeamModal } from './admin/EditTeamModal';
import { TeamSquadModal } from './admin/TeamSquadModal';
import { AddNewPlayerModal } from './admin/AddNewPlayerModal';
import { CsvUploadModal } from './admin/CsvUploadModal';
import { AdminAccessGate } from './admin/AdminAccessGate';

interface AdminPanelProps {
  onSelectNav: (nav: ActiveNav) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onSelectNav }) => {
  const {
    state,
    role,
    setRole,
    updateSettings,
    addTeam,
    updateTeam,
    deleteTeam,
    selectAuctionPlayer,
    sellPlayer,
    markUnsold,
    reopenPlayer,
    resetAuction,
    importCSV,
    getViewerShareUrl,
    showNotification,
  } = useAuction();

  // Top quick state
  const [copiedLink, setCopiedLink] = useState(false);

  // Fast Enter Player into Auction (Search / ID input)
  const [enterPlayerInput, setEnterPlayerInput] = useState('');

  // Fast Sell Console State
  const [sellPlayerIdInput, setSellPlayerIdInput] = useState<string>('');
  const [selectedSellTeamId, setSelectedSellTeamId] = useState<string>('');
  const [sellAmountInput, setSellAmountInput] = useState<number>(1000);

  // Modals state
  const [isConfirmSaleOpen, setIsConfirmSaleOpen] = useState(false);
  const [isSetNewAuctionOpen, setIsSetNewAuctionOpen] = useState(false);
  const [isAddNewPlayerOpen, setIsAddNewPlayerOpen] = useState(false);
  const [isCsvUploadOpen, setIsCsvUploadOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [teamToViewSquad, setTeamToViewSquad] = useState<Team | null>(null);
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);

  // Available & Unsold players search/filter state
  const [availableSearch, setAvailableSearch] = useState('');
  const [availableRoleFilter, setAvailableRoleFilter] = useState('ALL');
  const [unsoldSearch, setUnsoldSearch] = useState('');

  // Synchronize Sell Player input with current bidding player when bidding changes
  useEffect(() => {
    if (state?.bidding?.currentPlayerId) {
      setSellPlayerIdInput(String(state.bidding.currentPlayerId));
      setSellAmountInput(state.bidding.currentBid || 1000);
    }
  }, [state?.bidding?.currentPlayerId]);

  // Set default team for sell
  useEffect(() => {
    if (state?.teams && state.teams.length > 0 && !selectedSellTeamId) {
      setSelectedSellTeamId(state.teams[0].id);
    }
  }, [state?.teams, selectedSellTeamId]);

  if (!state) return null;

  // Resolve currently auctioned player
  const currentStagePlayer = state.players.find((p) => p.id === state.bidding.currentPlayerId);

  // Resolve player to be sold (based on sellPlayerIdInput)
  const resolvedSellPlayer = useMemo(() => {
    if (!sellPlayerIdInput.trim()) return currentStagePlayer || null;
    const clean = sellPlayerIdInput.trim().toUpperCase();
    // match by exact id or code or name prefix
    const byId = state.players.find((p) => String(p.id) === clean);
    if (byId) return byId;
    const byCode = state.players.find((p) => p.code.toUpperCase() === clean);
    if (byCode) return byCode;
    const byName = state.players.find((p) => p.name.toUpperCase().includes(clean));
    return byName || currentStagePlayer || null;
  }, [sellPlayerIdInput, state.players, currentStagePlayer]);

  // Resolve player preview for "Enter Player into Auction"
  const resolvedEnterPlayer = useMemo(() => {
    if (!enterPlayerInput.trim()) return null;
    const clean = enterPlayerInput.trim().toUpperCase();
    const byId = state.players.find((p) => String(p.id) === clean);
    if (byId) return byId;
    const byCode = state.players.find((p) => p.code.toUpperCase() === clean);
    if (byCode) return byCode;
    const byName = state.players.find((p) => p.name.toUpperCase().includes(clean));
    return byName || null;
  }, [enterPlayerInput, state.players]);

  // Resolve selected team to sell to
  const resolvedSellTeam = useMemo(() => {
    return state.teams.find((t) => t.id === selectedSellTeamId) || state.teams[0] || null;
  }, [selectedSellTeamId, state.teams]);

  // Filtered Available Players
  const availablePlayers = useMemo(() => {
    return state.players.filter((p) => {
      if (p.status !== 'AVAILABLE') return false;
      if (availableRoleFilter !== 'ALL' && p.role !== availableRoleFilter) return false;
      if (availableSearch.trim()) {
        const query = availableSearch.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.code.toLowerCase().includes(query) ||
          p.village.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [state.players, availableSearch, availableRoleFilter]);

  // Unsold Players
  const unsoldPlayers = useMemo(() => {
    return state.players.filter((p) => {
      if (p.status !== 'UNSOLD') return false;
      if (unsoldSearch.trim()) {
        const query = unsoldSearch.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.code.toLowerCase().includes(query) ||
          p.village.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [state.players, unsoldSearch]);

  // Handlers
  const handleCopyViewerLink = () => {
    const link = getViewerShareUrl();
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    showNotification('success', 'Viewer link copied! Anyone can view live.');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleEnterPlayerToHammer = async (playerToEnter?: Player) => {
    const target = playerToEnter || resolvedEnterPlayer;
    if (!target) {
      showNotification('error', 'Please enter a valid Player ID or name first.');
      return;
    }
    const success = await selectAuctionPlayer(target.id);
    if (success) {
      setSellPlayerIdInput(String(target.id));
      setSellAmountInput(target.soldPrice > 0 ? target.soldPrice : state.settings.defaultReservePrice || 1000);
      setEnterPlayerInput('');
      showNotification('success', `Now on Auction Block: ${target.name} (${target.code})`);
    }
  };

  const handleInitiateSell = () => {
    if (!resolvedSellPlayer) {
      showNotification('error', 'Please select a player to sell.');
      return;
    }
    if (!resolvedSellTeam) {
      showNotification('error', 'Please select a franchise team.');
      return;
    }
    if (!sellAmountInput || sellAmountInput <= 0) {
      showNotification('error', 'Sold amount must be greater than 0.');
      return;
    }
    // Open confirmation modal
    setIsConfirmSaleOpen(true);
  };

  const handleConfirmSaleFinal = async () => {
    if (!resolvedSellPlayer || !resolvedSellTeam) return;
    setIsSubmittingSale(true);
    try {
      const ok = await sellPlayer(
        resolvedSellPlayer.id,
        resolvedSellTeam.id,
        sellAmountInput,
        true // admin direct confirmation
      );
      if (ok) {
        setIsConfirmSaleOpen(false);
      }
    } finally {
      setIsSubmittingSale(false);
    }
  };

  const handleMarkUnsoldDirect = async () => {
    if (!resolvedSellPlayer) {
      showNotification('error', 'No player selected to mark unsold.');
      return;
    }
    await markUnsold(resolvedSellPlayer.id);
  };

  // Quick Team Count Adjuster
  const handleSetTeamCount = async (targetCount: number) => {
    const currentCount = state.teams.length;
    if (targetCount === currentCount) return;

    if (targetCount > currentCount) {
      const needed = targetCount - currentCount;
      const presets = [
        { name: 'TITANS', short: 'TTN', color: '#0284c7' },
        { name: 'KINGS', short: 'KNG', color: '#e11d48' },
        { name: 'ROYALS', short: 'RYL', color: '#7c3aed' },
        { name: 'WARRIORS', short: 'WAR', color: '#ea580c' },
        { name: 'STRIKERS', short: 'STR', color: '#16a34a' },
        { name: 'CHALLENGERS', short: 'CHL', color: '#b91c1c' },
      ];

      for (let i = 0; i < needed; i++) {
        const p = presets[i % presets.length];
        const uniqueId = `team-${Date.now()}-${i + 1}`;
        await addTeam({
          name: `${p.name} ${currentCount + i + 1}`,
          shortCode: `${p.short}${currentCount + i + 1}`,
          color: p.color,
          startingPoints: state.settings.startingPoints,
          auctionBudget: state.settings.auctionBudget,
        });
      }
      showNotification('success', `Added ${needed} new franchise team(s). Total: ${targetCount} teams.`);
    } else {
      showNotification(
        'info',
        `To reduce team count from ${currentCount} to ${targetCount}, you can delete specific teams below using the edit franchise modal.`
      );
    }
  };

  // Stepper for squad size
  const handleSquadSizeChange = async (delta: number) => {
    const newSize = Math.max(5, Math.min(30, (state.settings.maxSquadSize || 15) + delta));
    await updateSettings({
      maxSquadSize: newSize,
      maxAuctionPlayers: newSize - (state.settings.iconPlayersCount || 2),
    });
    showNotification('success', `Squad size limit set to ${newSize} players per team.`);
  };

  // Guard: Admin panel is strictly for authenticated administrators only
  if (role !== 'admin') {
    return (
      <AdminAccessGate
        onReturnToDashboard={() => onSelectNav('dashboard')}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP COMMAND BAR */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600">
                ADMIN AUCTION DIRECTOR
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                SINGLE-SCREEN COMMAND MODE
              </span>
            </div>
            <h2 className="font-['Outfit'] font-black text-2xl text-slate-900 tracking-tight">
              {state.settings.tournamentName || 'My Cricket League Auction'}
            </h2>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Set New Auction Button */}
            <button
              id="btn-admin-set-new-auction"
              onClick={() => setIsSetNewAuctionOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-['Outfit'] font-black text-xs shadow-sm hover:shadow active:scale-98 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>Set New Auction</span>
            </button>

            {/* Add New Player */}
            <button
              id="btn-admin-add-player"
              onClick={() => setIsAddNewPlayerOpen(true)}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-['Outfit'] font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Add Player</span>
            </button>

            {/* Upload CSV */}
            <button
              id="btn-admin-upload-csv"
              onClick={() => setIsCsvUploadOpen(true)}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-['Outfit'] font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>Upload CSV</span>
            </button>

            {/* Share Viewer Link */}
            <button
              id="btn-admin-share-viewer"
              onClick={handleCopyViewerLink}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-['Outfit'] font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedLink ? 'Link Copied!' : 'Viewer Link'}</span>
            </button>

            {/* Full Stage Shortcut */}
            <button
              onClick={() => onSelectNav('live-auction')}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-['Outfit'] font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <span>Stage View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. AUCTION PARAMETERS & SQUAD RULES BAR */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Number of Teams Selector */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Franchise Teams
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="font-['Outfit'] font-black text-lg text-slate-900">
                {state.teams.length}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Teams</span>
            </div>
            <div className="flex items-center gap-1 mt-1.5">
              {[4, 6, 8, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => handleSetTeamCount(num)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                    state.teams.length === num
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Squad Size per Team Stepper */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Squad Limit
            </span>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-1">
                <span className="font-['Outfit'] font-black text-lg text-slate-900">
                  {state.settings.maxSquadSize}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Slots/Team</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleSquadSizeChange(-1)}
                  title="Decrease squad limit"
                  className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center text-xs"
                >
                  -
                </button>
                <button
                  onClick={() => handleSquadSizeChange(1)}
                  title="Increase squad limit"
                  className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center text-xs"
                >
                  +
                </button>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Total Roster Capacity: {state.teams.length * state.settings.maxSquadSize}
            </span>
          </div>

          {/* Available in Pool */}
          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              Available Players
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="font-['Outfit'] font-black text-lg text-emerald-700 font-mono">
                {state.summary.playersAvailable}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">in Pool</span>
            </div>
            <span className="text-[10px] text-emerald-600 block mt-1">
              Ready for hammer
            </span>
          </div>

          {/* Sold Players */}
          <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">
              Sold Players
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="font-['Outfit'] font-black text-lg text-sky-700 font-mono">
                {state.summary.playersSold}
              </span>
              <span className="text-[11px] text-sky-600 font-medium">Acquired</span>
            </div>
            <span className="text-[10px] text-sky-600 block mt-1">
              Progress: {state.summary.auctionProgressPct}%
            </span>
          </div>

          {/* Unsold Players */}
          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
              Unsold Pool
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="font-['Outfit'] font-black text-lg text-amber-700 font-mono">
                {state.summary.playersUnsold}
              </span>
              <span className="text-[11px] text-amber-600 font-medium">Passed</span>
            </div>
            <span className="text-[10px] text-amber-600 block mt-1">
              Eligible for re-auction
            </span>
          </div>

          {/* Total Registered */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Registered
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="font-['Outfit'] font-black text-lg text-slate-900 font-mono">
                {state.summary.totalPlayers}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Players</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Purse: {formatPoints(state.settings.startingPoints)} pts
            </span>
          </div>
        </div>
      </div>

      {/* 3. HERO COMMAND CONSOLE: BIGGEST ACTION BUTTONS (HIGH PRIORITY) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MODULE A: ENTER PLAYER INTO AUCTION (PROMINENT BIG BUTTON) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Gavel className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
                    STEP 1: SELECT FOR HAMMER
                  </span>
                  <h3 className="font-['Outfit'] font-black text-slate-900 text-base">
                    Enter Player into Auction
                  </h3>
                </div>
              </div>
              {currentStagePlayer && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Hammer Active
                </span>
              )}
            </div>

            {/* Search / Enter by ID */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Enter Player ID, Code or Name
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-enter-player-id"
                    type="text"
                    value={enterPlayerInput}
                    onChange={(e) => setEnterPlayerInput(e.target.value)}
                    placeholder="e.g. 5, P012, or Virat"
                    className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {enterPlayerInput && (
                    <button
                      onClick={() => setEnterPlayerInput('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Resolved Preview Card */}
            {resolvedEnterPlayer ? (
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200">
                <div className="flex items-center justify-between text-xs text-indigo-900 mb-1">
                  <span className="font-mono font-bold">{resolvedEnterPlayer.code}</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                      resolvedEnterPlayer.status === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : resolvedEnterPlayer.status === 'SOLD'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {resolvedEnterPlayer.status}
                  </span>
                </div>
                <h4 className="font-['Outfit'] font-black text-lg text-slate-900">
                  {resolvedEnterPlayer.name}
                </h4>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
                  <span className="px-2 py-0.5 rounded bg-white font-medium border border-indigo-100">
                    {resolvedEnterPlayer.role}
                  </span>
                  <span>Zone: {resolvedEnterPlayer.village}</span>
                  <span className="font-mono font-bold text-indigo-700 ml-auto">
                    Base: {formatPoints(state.settings.defaultReservePrice || 1000)} pts
                  </span>
                </div>
              </div>
            ) : currentStagePlayer ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-mono font-bold">CURRENTLY ON STAGE: {currentStagePlayer.code}</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                      currentStagePlayer.status === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : currentStagePlayer.status === 'SOLD'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {currentStagePlayer.status}
                  </span>
                </div>
                <h4 className="font-['Outfit'] font-black text-lg text-slate-900">
                  {currentStagePlayer.name}
                </h4>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
                  <span className="px-2 py-0.5 rounded bg-white font-medium border border-slate-200">
                    {currentStagePlayer.role}
                  </span>
                  <span>Zone: {currentStagePlayer.village}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Enter player ID or select from Available list below to load onto the stage.
              </div>
            )}
          </div>

          {/* BIG BUTTON: ENTER PLAYER INTO AUCTION */}
          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              id="btn-admin-enter-player-hammer"
              onClick={() => handleEnterPlayerToHammer()}
              className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-['Outfit'] font-black text-sm md:text-base shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2.5"
            >
              <Gavel className="w-5 h-5 text-indigo-200" />
              <span>ENTER PLAYER INTO AUCTION (LOAD TO HAMMER)</span>
            </button>
          </div>
        </div>

        {/* MODULE B: FAST SELL PLAYER CONSOLE (BIGGEST HERO BUTTON ON SCREEN) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-emerald-500/50 p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
          {/* Subtle accent ribbon */}
          <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black tracking-widest uppercase px-4 py-1 rounded-bl-2xl shadow-xs">
            HAMMER DOWN DESK
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                  STEP 2: FINALIZE TRANSACTION
                </span>
                <h3 className="font-['Outfit'] font-black text-slate-900 text-base">
                  Sell Player by ID, Franchise & Amount
                </h3>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* 1. Player ID No */}
              <div className="sm:col-span-4 space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  1. Player ID / No.
                </label>
                <input
                  id="input-sell-player-id"
                  type="text"
                  value={sellPlayerIdInput}
                  onChange={(e) => setSellPlayerIdInput(e.target.value)}
                  placeholder="e.g. 5 or P005"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase"
                />
                {resolvedSellPlayer && (
                  <span className="text-[11px] font-bold text-slate-800 truncate block">
                    {resolvedSellPlayer.code}: {resolvedSellPlayer.name}
                  </span>
                )}
              </div>

              {/* 2. Winning Franchise */}
              <div className="sm:col-span-8 space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  2. Select Winning Team
                </label>
                <select
                  id="select-sell-team"
                  value={selectedSellTeamId}
                  onChange={(e) => setSelectedSellTeamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 font-bold text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {state.teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.shortCode}) • Purse: {formatPoints(t.pointsRemaining)} pts • Squad: {t.totalPlayers}/{state.settings.maxSquadSize}
                    </option>
                  ))}
                </select>
                {/* Visual Quick Click Team Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
                  {state.teams.map((t) => {
                    const isSelected = t.id === selectedSellTeamId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedSellTeamId(t.id)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: t.color }}
                        />
                        <span>{t.shortCode}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Sold Amount & Quick Chips */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  3. Sold Hammer Amount (Points)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {formatPoints(sellAmountInput)} Points
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="input-sell-amount"
                  type="number"
                  step={state.settings.minBidIncrement || 1000}
                  value={sellAmountInput}
                  onChange={(e) => setSellAmountInput(Math.max(0, Number(e.target.value)))}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-black text-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSellAmountInput((prev) => prev + 1000)}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold font-mono transition-colors"
                >
                  +1K
                </button>
                <button
                  type="button"
                  onClick={() => setSellAmountInput((prev) => prev + 5000)}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold font-mono transition-colors"
                >
                  +5K
                </button>
                <button
                  type="button"
                  onClick={() => setSellAmountInput((prev) => prev + 10000)}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold font-mono transition-colors"
                >
                  +10K
                </button>
              </div>
            </div>
          </div>

          {/* SUPER BIG BUTTON: SELL PLAYER (HAMMER DOWN) + CONFIRMATION OPTION */}
          <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <button
              id="btn-admin-sell-player"
              type="button"
              onClick={handleInitiateSell}
              className="sm:col-span-8 w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-['Outfit'] font-black text-base md:text-lg shadow-lg hover:shadow-xl active:scale-98 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Gavel className="w-6 h-6 text-emerald-200" />
              <span>SELL PLAYER (HAMMER DOWN)</span>
            </button>

            <button
              id="btn-admin-mark-unsold"
              type="button"
              onClick={handleMarkUnsoldDirect}
              className="sm:col-span-4 w-full py-4 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-['Outfit'] font-black text-xs md:text-sm shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-200" />
              <span>MARK AS UNSOLD</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. FRANCHISE TEAMS, PURSES & SQUADS (SINGLE SCREEN) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                LEAGUE FRANCHISES & SQUADS
              </span>
              <h3 className="font-['Outfit'] font-black text-slate-900 text-lg">
                Franchise Purses & Team Squads ({state.teams.length} Teams)
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Click name to edit franchise:</span>
            <button
              onClick={() => {
                const uniqueId = `team-${Date.now()}`;
                addTeam({
                  name: `FRANCHISE ${state.teams.length + 1}`,
                  shortCode: `F${state.teams.length + 1}`,
                  color: '#4f46e5',
                  startingPoints: state.settings.startingPoints,
                  auctionBudget: state.settings.auctionBudget,
                });
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Team</span>
            </button>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {state.teams.map((team) => {
            const isFull = team.totalPlayers >= state.settings.maxSquadSize;
            const isOverPoints = team.pointsRemaining < 0;

            return (
              <div
                key={team.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Top Bar with Badge, Name and Edit Button */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-['Outfit'] font-black text-xs text-white shadow-2xs shrink-0"
                        style={{ backgroundColor: team.color }}
                      >
                        {team.shortCode}
                      </div>
                      <h4
                        onClick={() => setTeamToEdit(team)}
                        className="font-['Outfit'] font-black text-sm text-slate-900 truncate hover:text-indigo-600 cursor-pointer flex items-center gap-1.5"
                        title="Click to rename team"
                      >
                        <span>{team.name}</span>
                        <Edit2 className="w-3 h-3 text-slate-400 opacity-60 hover:opacity-100" />
                      </h4>
                    </div>

                    <button
                      onClick={() => setTeamToEdit(team)}
                      title="Edit Franchise Name & Color"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Purse Details */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Remaining Purse</span>
                      <span
                        className={`font-mono font-black text-sm ${
                          isOverPoints ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {formatPoints(team.pointsRemaining)} pts
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Max Safe Bid</span>
                      <span className="font-mono font-black text-sm text-indigo-700">
                        {formatPoints(team.maxSafeBid)} pts
                      </span>
                    </div>
                  </div>

                  {/* Squad Progress Bar */}
                  <div className="mt-2.5">
                    <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                      <span>Squad Fill</span>
                      <span>
                        {team.totalPlayers} / {state.settings.maxSquadSize} Slots
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (team.totalPlayers / state.settings.maxSquadSize) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {team.committeeCash > 0 && (
                    <div className="mt-2 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" />
                      <span>Penalty: {formatINR(team.committeeCash)}</span>
                    </div>
                  )}
                </div>

                {/* View Squad Roster Button */}
                <button
                  onClick={() => setTeamToViewSquad(team)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-['Outfit'] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Squad ({team.totalPlayers} Players)</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. LIVE AUDIT FEED & PLAYER POOLS (AVAILABLE & UNSOLD) ON SINGLE SCREEN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SECTION 1: LIVE PLAYER SOLD FEED */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col max-h-[560px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="font-['Outfit'] font-black text-slate-900 text-sm uppercase tracking-wider">
                Live Sold Feed ({state.transactions.length})
              </h3>
            </div>
            <button
              onClick={() => onSelectNav('auction-history')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-0.5"
            >
              Full Ledger <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
            {state.transactions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 italic">
                No players sold yet. Hammer sales will appear here in real time.
              </div>
            ) : (
              state.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span className="font-mono text-slate-500">#{tx.auctionOrder}</span>
                      <span className="truncate">{tx.playerName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="font-semibold text-indigo-600">{tx.teamName}</span>
                      <span>•</span>
                      <span>{tx.role}</span>
                      <span>•</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatPoints(tx.soldPrice)} pts
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => reopenPlayer(tx.playerId)}
                    title="Undo / Rollback sale"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SECTION 2: AVAILABLE PLAYERS POOL */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col max-h-[560px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
            <h3 className="font-['Outfit'] font-black text-slate-900 text-sm uppercase tracking-wider">
              Available Players ({availablePlayers.length})
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={availableSearch}
                onChange={(e) => setAvailableSearch(e.target.value)}
                placeholder="Search..."
                className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none w-28"
              />
              <select
                value={availableRoleFilter}
                onChange={(e) => setAvailableRoleFilter(e.target.value)}
                className="px-2 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="Batsman">Batsman</option>
                <option value="Bowler">Bowler</option>
                <option value="All-Rounder">All-Rounder</option>
                <option value="Wicket-Keeper">WK</option>
              </select>
            </div>
          </div>

          <div className="overflow-y-auto space-y-2 flex-1 pr-1">
            {availablePlayers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 italic">
                No available players match your filter.
              </div>
            ) : (
              availablePlayers.map((player) => {
                const roleStyle = getRoleBadgeStyle(player.role);
                return (
                  <div
                    key={player.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-indigo-300 transition-all flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500 text-[11px]">{player.code}</span>
                        <span className="font-['Outfit'] font-black text-slate-900 truncate">
                          {player.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                        >
                          {player.role}
                        </span>
                        <span>{player.village}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Put on Hammer */}
                      <button
                        onClick={() => handleEnterPlayerToHammer(player)}
                        title="Load onto Auction Hammer floor"
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-['Outfit'] font-bold text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <Gavel className="w-3 h-3" />
                        <span>Hammer</span>
                      </button>

                      {/* Fill in Sell Box */}
                      <button
                        onClick={() => {
                          setSellPlayerIdInput(String(player.id));
                          setSellAmountInput(state.settings.defaultReservePrice || 1000);
                          showNotification('info', `Selected ${player.name} for sell console.`);
                        }}
                        title="Auto-fill in Fast Sell Console"
                        className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SECTION 3: UNSOLD PLAYERS POOL */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col max-h-[560px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h3 className="font-['Outfit'] font-black text-slate-900 text-sm uppercase tracking-wider">
              Unsold ({unsoldPlayers.length})
            </h3>
            <input
              type="text"
              value={unsoldSearch}
              onChange={(e) => setUnsoldSearch(e.target.value)}
              placeholder="Search..."
              className="px-2 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none w-24"
            />
          </div>

          <div className="overflow-y-auto space-y-2 flex-1 pr-1">
            {unsoldPlayers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 italic">
                No unsold players.
              </div>
            ) : (
              unsoldPlayers.map((player) => (
                <div
                  key={player.id}
                  className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-mono text-slate-500 text-[10px]">{player.code}</span>
                    <h5 className="font-['Outfit'] font-bold text-slate-900 truncate">
                      {player.name}
                    </h5>
                    <span className="text-[10px] text-slate-500">{player.role} • {player.village}</span>
                  </div>

                  <button
                    onClick={() => handleEnterPlayerToHammer(player)}
                    title="Re-open to Auction Hammer"
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] flex items-center gap-1 transition-colors shrink-0"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Re-Auction</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Mandatory Confirmation Modal on Sell Player */}
      <ConfirmSaleModal
        isOpen={isConfirmSaleOpen}
        player={resolvedSellPlayer}
        team={resolvedSellTeam}
        amount={sellAmountInput}
        settings={state.settings}
        isSubmitting={isSubmittingSale}
        onConfirm={handleConfirmSaleFinal}
        onCancel={() => setIsConfirmSaleOpen(false)}
      />

      {/* 2. Set New Auction & Tournament Wizard Modal */}
      <SetNewAuctionModal
        isOpen={isSetNewAuctionOpen}
        currentSettings={state.settings}
        teams={state.teams}
        onClose={() => setIsSetNewAuctionOpen(false)}
        onLaunchNewAuction={async ({ tournamentName, startingPoints, maxSquadSize, targetTeamCount, resetMode }) => {
          // 1. update settings
          await updateSettings({
            tournamentName,
            startingPoints,
            auctionBudget: startingPoints,
            maxSquadSize,
            maxAuctionPlayers: maxSquadSize - (state.settings.iconPlayersCount || 2),
          });

          // 2. adjust team count if needed
          if (targetTeamCount !== state.teams.length) {
            await handleSetTeamCount(targetTeamCount);
          }

          // 3. execute reset mode if selected
          if (resetMode === 'pre-auction') {
            await resetAuction('pre-auction');
          } else if (resetMode === 'official') {
            await resetAuction('official');
          }
          showNotification('success', 'New auction parameters launched successfully!');
        }}
      />

      {/* 3. Rename / Edit Team Modal */}
      <EditTeamModal
        isOpen={!!teamToEdit}
        team={teamToEdit}
        onClose={() => setTeamToEdit(null)}
        onSave={async (teamId, updates) => {
          const ok = await updateTeam(teamId, updates);
          return ok;
        }}
        onDelete={state.teams.length > 2 ? async (teamId) => {
          const ok = await deleteTeam(teamId);
          return ok;
        } : undefined}
      />

      {/* 4. Team Squad Roster Modal */}
      <TeamSquadModal
        isOpen={!!teamToViewSquad}
        team={teamToViewSquad}
        players={state.players}
        settings={state.settings}
        onClose={() => setTeamToViewSquad(null)}
        onReopenPlayer={async (playerId) => {
          const ok = await reopenPlayer(playerId);
          return ok;
        }}
      />

      {/* 5. Add New Player Modal */}
      <AddNewPlayerModal
        isOpen={isAddNewPlayerOpen}
        onClose={() => setIsAddNewPlayerOpen(false)}
        onAddPlayer={async ({ name, role, village, loadDirectlyToAuction }) => {
          const res = await state;
          // We can use fetch or helper
          try {
            const resp = await fetch('/api/players', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, role, village }),
            });
            const data = await resp.json();
            if (data.success && data.player) {
              if (loadDirectlyToAuction) {
                await selectAuctionPlayer(data.player.id);
                setSellPlayerIdInput(String(data.player.id));
              }
              showNotification('success', `Added ${name} to player pool!`);
              return true;
            }
            return false;
          } catch (err) {
            showNotification('error', 'Failed to add player.');
            return false;
          }
        }}
      />

      {/* 6. Upload CSV Modal */}
      <CsvUploadModal
        isOpen={isCsvUploadOpen}
        onClose={() => setIsCsvUploadOpen(false)}
        onImportCSV={async (csvText, replaceExisting) => {
          return await importCSV(csvText, replaceExisting);
        }}
      />
    </div>
  );
};
