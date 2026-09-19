import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  FullAuctionState,
  Player,
  Team,
  TournamentSettings,
  UserRole,
} from '../types';
import { DEFAULT_AUCTION_STATE } from '../data/defaultAuctionState';
import {
  clientPlaceBid,
  clientSellPlayer,
  clientMarkUnsold,
  clientReopenPlayer,
  clientNavigatePlayer,
  clientAddPlayer,
  clientUpdatePlayer,
  clientDeletePlayer,
  clientUpdateSettings,
  clientResetAuction,
  recalculateAllTeams,
} from '../utils/clientAuctionEngine';

interface AuctionContextType {
  state: FullAuctionState;
  loading: boolean;
  error: string | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  notification: { type: 'success' | 'error' | 'warning'; message: string } | null;
  clearNotification: () => void;
  showNotification: (type: 'success' | 'error' | 'warning', message: string) => void;
  refreshState: () => Promise<void>;
  placeBid: (playerId: number, teamId: string | null, amount: number) => Promise<void>;
  validateSale: (playerId: number, teamId: string, price: number) => Promise<{
    valid: boolean;
    error?: string;
    warning?: string;
    teamRemaining?: number;
    maxSafeBid?: number;
  }>;
  sellPlayer: (playerId: number, teamId: string, price: number, adminOverride?: boolean) => Promise<boolean>;
  markUnsold: (playerId: number) => Promise<boolean>;
  reopenPlayer: (playerId: number) => Promise<boolean>;
  navigatePlayer: (direction?: 'next' | 'prev', playerId?: number) => Promise<void>;
  selectAuctionPlayer: (playerId: number) => Promise<boolean>;
  addPlayer: (player: Partial<Player>) => Promise<boolean>;
  updatePlayer: (id: number, player: Partial<Player>) => Promise<boolean>;
  deletePlayer: (id: number) => Promise<boolean>;
  updateSettings: (settings: Partial<TournamentSettings>) => Promise<boolean>;
  addTeam: (team: Partial<Team>) => Promise<boolean>;
  updateTeam: (id: string, team: Partial<Team>) => Promise<boolean>;
  deleteTeam: (id: string) => Promise<boolean>;
  resetAuction: (mode: 'official' | 'pre-auction' | 'clear' | 'clear-players') => Promise<void>;
  clearAllPlayers: () => Promise<boolean>;
  importPlayers: (players: any[]) => Promise<number>;
  importCSV: (csvText: string, replaceExisting?: boolean) => Promise<{ count: number; message: string } | null>;
  getViewerShareUrl: () => string;
  loginAdmin: (passcodeOrUserId: string, optionalPassword?: string) => boolean;
  logoutAdmin: () => void;
  saveFileAs: (fileName?: string) => Promise<{ success: boolean; fileName: string }>;
}

const LOCAL_STORAGE_KEY = 'cricket_auction_state';

const getInitialState = (): FullAuctionState => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.teams) && Array.isArray(parsed.players) && parsed.teams.length > 0) {
        // Erase old 80 sample players if present in localStorage
        if (parsed.players.length === 80 || (parsed.players.length > 0 && parsed.players[0]?.name === 'ROHIT SHARMA')) {
          parsed.players = [];
          parsed.transactions = [];
          if (parsed.bidding) {
            parsed.bidding.currentPlayerId = 0;
            parsed.bidding.bidHistory = [];
          }
          if (parsed.summary) {
            parsed.summary.totalPlayers = 0;
            parsed.summary.playersSold = 0;
            parsed.summary.playersAvailable = 0;
            parsed.summary.playersUnsold = 0;
          }
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read saved auction state from localStorage', e);
  }
  return DEFAULT_AUCTION_STATE;
};

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const AuctionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FullAuctionState>(getInitialState);
  const stateRef = useRef<FullAuctionState>(state);
  stateRef.current = state;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRoleState] = useState<UserRole>('admin');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  // Synchronize state changes to localStorage
  const updateStateAndPersist = useCallback((newState: FullAuctionState) => {
    setState(newState);
    stateRef.current = newState;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
    } catch (err) {
      console.warn('Failed to persist to localStorage', err);
    }
  }, []);

  // Initialize role from URL query param or localStorage
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      if (urlRole === 'viewer' || urlRole === 'admin') {
        setRoleState(urlRole);
        localStorage.setItem('cricket_auction_role', urlRole);
      } else {
        const saved = localStorage.getItem('cricket_auction_role');
        if (saved === 'viewer' || saved === 'admin') {
          setRoleState(saved as UserRole);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem('cricket_auction_role', newRole);
      const url = new URL(window.location.href);
      url.searchParams.set('role', newRole);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignore
    }
  };

  const getViewerShareUrl = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('role', 'viewer');
      return url.toString();
    } catch {
      return window.location.href;
    }
  };

  const loginAdmin = (passcodeOrUserId: string, optionalPassword?: string): boolean => {
    const user = (optionalPassword ? passcodeOrUserId : 'admin').trim().toLowerCase();
    const pass = (optionalPassword ? optionalPassword : passcodeOrUserId).trim().toLowerCase();
    const validPass = ['admin123', 'rbpl2026', 'auction2026', 'admin', 'director2026'];

    if ((user === 'admin' || user === 'director' || user === 'organizer' || !optionalPassword) && validPass.includes(pass)) {
      setRoleState('admin');
      try {
        localStorage.setItem('cricket_auction_role', 'admin');
        const url = new URL(window.location.href);
        url.searchParams.set('role', 'admin');
        window.history.replaceState({}, '', url.toString());
      } catch {
        // Ignore
      }
      showNotification('success', 'Admin access verified. Admin Panel is now unlocked.');
      return true;
    }
    showNotification('error', 'Incorrect administrator User ID or Password.');
    return false;
  };

  const logoutAdmin = () => {
    setRoleState('viewer');
    try {
      localStorage.setItem('cricket_auction_role', 'viewer');
      const url = new URL(window.location.href);
      url.searchParams.set('role', 'viewer');
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignore
    }
    showNotification('warning', 'Switched to Spectator Mode. Admin Panel is now hidden.');
  };

  const clearNotification = () => setNotification(null);

  const showNotification = (type: 'success' | 'error' | 'warning', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data: FullAuctionState = await res.json();
        if (data && Array.isArray(data.teams) && Array.isArray(data.players) && data.teams.length > 0) {
          updateStateAndPersist(data);
          setError(null);
          return;
        }
      }

      // If /api/state failed (e.g. running statically on Netlify without Node backend),
      // try loading public/myauctionkpl.json if localStorage was empty
      if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
        try {
          const staticRes = await fetch('/myauctionkpl.json');
          if (staticRes.ok) {
            const staticData = await staticRes.json();
            if (staticData && Array.isArray(staticData.teams) && Array.isArray(staticData.players)) {
              updateStateAndPersist(staticData);
              setError(null);
              return;
            }
          }
        } catch {
          // Ignore static fallback error
        }
      }
    } catch (err: any) {
      // Running on Netlify or offline without server
      // State is already loaded from DEFAULT_AUCTION_STATE or localStorage!
      // Do not blank out the UI or crash.
    } finally {
      setLoading(false);
    }
  }, [updateStateAndPersist]);

  // Real-time synchronization polling every 2.5 seconds
  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 2500);
    return () => clearInterval(interval);
  }, [fetchState]);

  const placeBid = async (playerId: number, teamId: string | null, amount: number) => {
    // Client-side immediate update
    const nextState = clientPlaceBid(stateRef.current, playerId, teamId, amount);
    updateStateAndPersist(nextState);

    // Try server update if available
    try {
      const res = await fetch('/api/auction/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, teamId, amount }),
      });
      if (res.ok) {
        const updatedServerState = await res.json();
        if (updatedServerState && updatedServerState.teams) {
          updateStateAndPersist(updatedServerState);
        }
      }
    } catch {
      // Operating in client/Netlify mode
    }
  };

  const validateSale = async (playerId: number, teamId: string, price: number) => {
    try {
      const res = await fetch('/api/auction/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, teamId, price }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to client validation
    }

    // Client-side validation
    const team = stateRef.current.teams.find((t) => t.id === teamId);
    if (!team) return { valid: false, error: 'Team not found' };

    const remainingSlots = Math.max(0, (stateRef.current.settings.maxSquadSize || 15) - team.totalPlayers);
    if (remainingSlots <= 0) {
      return { valid: false, error: `${team.name} already has maximum squad size (${stateRef.current.settings.maxSquadSize || 15} players).` };
    }

    const minIncrement = stateRef.current.settings.minBidIncrement || 500;
    const reserveNeeded = (remainingSlots - 1) * minIncrement;
    const maxSafe = Math.max(0, team.pointsRemaining - reserveNeeded);

    if (price > maxSafe) {
      return {
        valid: true,
        warning: `Bid of ${price.toLocaleString()} pts exceeds safe limit (${maxSafe.toLocaleString()} pts). Team may need penalty cash.`,
        teamRemaining: team.pointsRemaining,
        maxSafeBid: maxSafe,
      };
    }

    return {
      valid: true,
      teamRemaining: team.pointsRemaining,
      maxSafeBid: maxSafe,
    };
  };

  const sellPlayer = async (
    playerId: number,
    teamId: string,
    price: number,
    adminOverride: boolean = false
  ): Promise<boolean> => {
    // Client-side auction transaction execution
    const clientResult = clientSellPlayer(stateRef.current, playerId, teamId, price);
    if (!clientResult.success) {
      showNotification('error', clientResult.message);
      return false;
    }

    updateStateAndPersist(clientResult.state);
    showNotification('success', clientResult.message);

    // Sync to backend if available
    try {
      const res = await fetch('/api/auction/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, teamId, price, adminOverride }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          updateStateAndPersist(data.state);
        }
      }
    } catch {
      // Client/Netlify mode
    }

    return true;
  };

  const markUnsold = async (playerId: number): Promise<boolean> => {
    const result = clientMarkUnsold(stateRef.current, playerId);
    if (result.success) {
      updateStateAndPersist(result.state);
      showNotification('warning', 'Player marked as UNSOLD (Pool 2 eligible)');
    }

    try {
      await fetch('/api/auction/unsold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
    } catch {}

    return true;
  };

  const reopenPlayer = async (playerId: number): Promise<boolean> => {
    const result = clientReopenPlayer(stateRef.current, playerId);
    if (result.success) {
      updateStateAndPersist(result.state);
      showNotification('success', result.message);
    }

    try {
      await fetch('/api/auction/reopen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
    } catch {}

    return true;
  };

  const navigatePlayer = async (direction?: 'next' | 'prev', playerId?: number) => {
    const nextState = clientNavigatePlayer(stateRef.current, direction, playerId);
    updateStateAndPersist(nextState);

    try {
      await fetch('/api/auction/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction, playerId }),
      });
    } catch {}
  };

  const selectAuctionPlayer = async (playerId: number): Promise<boolean> => {
    const nextState = clientNavigatePlayer(stateRef.current, undefined, playerId);
    updateStateAndPersist(nextState);

    try {
      await fetch('/api/auction/select-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
    } catch {}

    showNotification('success', 'Player brought to the auction hammer!');
    return true;
  };

  const addPlayer = async (playerData: Partial<Player>): Promise<boolean> => {
    const result = clientAddPlayer(stateRef.current, playerData);
    if (result.success) {
      updateStateAndPersist(result.state);
      showNotification('success', result.message);
    }

    try {
      await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerData),
      });
    } catch {}

    return true;
  };

  const updatePlayer = async (id: number, playerData: Partial<Player>): Promise<boolean> => {
    const result = clientUpdatePlayer(stateRef.current, id, playerData);
    if (result.success) {
      updateStateAndPersist(result.state);
      showNotification('success', result.message);
    }

    try {
      await fetch(`/api/players/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerData),
      });
    } catch {}

    return true;
  };

  const deletePlayer = async (id: number): Promise<boolean> => {
    const result = clientDeletePlayer(stateRef.current, id);
    if (result.success) {
      updateStateAndPersist(result.state);
      showNotification('success', result.message);
    }

    try {
      await fetch(`/api/players/${id}`, { method: 'DELETE' });
    } catch {}

    return true;
  };

  const updateSettings = async (settingsUpdates: Partial<TournamentSettings>): Promise<boolean> => {
    const nextState = clientUpdateSettings(stateRef.current, settingsUpdates);
    updateStateAndPersist(nextState);
    showNotification('success', 'Tournament settings updated successfully!');

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsUpdates),
      });
    } catch {}

    return true;
  };

  const addTeam = async (teamData: Partial<Team>): Promise<boolean> => {
    const newId = teamData.name?.toLowerCase().replace(/\s+/g, '-') || `team-${Date.now()}`;
    const newTeam: Team = {
      id: newId,
      name: teamData.name || 'NEW TEAM',
      shortCode: teamData.shortCode || 'NT',
      color: teamData.color || '#4f46e5',
      badgeBg: '#e0e7ff',
      badgeText: '#3730a3',
      startingPoints: teamData.startingPoints || stateRef.current.settings.startingPoints || 100000,
      iconCost: 0,
      auctionBudget: teamData.startingPoints || stateRef.current.settings.startingPoints || 100000,
      totalPlayers: 0,
      iconPlayersCount: 0,
      auctionPlayersCount: 0,
      totalPointsSpent: 0,
      pointsRemaining: teamData.startingPoints || stateRef.current.settings.startingPoints || 100000,
      maxSafeBid: (teamData.startingPoints || 100000) - (14 * 500),
      committeeCash: 0,
      status: 'OK',
    };

    const updatedTeams = [...stateRef.current.teams, newTeam];
    const { updatedTeams: recalculated, summary } = recalculateAllTeams(updatedTeams, stateRef.current.players, stateRef.current.settings);

    updateStateAndPersist({
      ...stateRef.current,
      teams: recalculated,
      summary,
    });

    showNotification('success', `Team ${newTeam.name} created!`);

    try {
      await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
      });
    } catch {}

    return true;
  };

  const updateTeam = async (id: string, teamData: Partial<Team>): Promise<boolean> => {
    const updatedTeams = stateRef.current.teams.map((t) => (t.id === id ? { ...t, ...teamData } : t));
    const { updatedTeams: recalculated, summary } = recalculateAllTeams(updatedTeams, stateRef.current.players, stateRef.current.settings);

    updateStateAndPersist({
      ...stateRef.current,
      teams: recalculated,
      summary,
    });

    showNotification('success', 'Team updated successfully!');

    try {
      await fetch(`/api/teams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
      });
    } catch {}

    return true;
  };

  const deleteTeam = async (id: string): Promise<boolean> => {
    const updatedTeams = stateRef.current.teams.filter((t) => t.id !== id);
    const updatedPlayers = stateRef.current.players.map((p) =>
      p.soldToTeamId === id ? { ...p, status: 'AVAILABLE' as const, soldToTeamId: null, soldPrice: 0 } : p
    );
    const { updatedTeams: recalculated, summary } = recalculateAllTeams(updatedTeams, updatedPlayers, stateRef.current.settings);

    updateStateAndPersist({
      ...stateRef.current,
      teams: recalculated,
      players: updatedPlayers,
      summary,
    });

    showNotification('success', 'Team deleted successfully');

    try {
      await fetch(`/api/teams/${id}`, { method: 'DELETE' });
    } catch {}

    return true;
  };

  const resetAuction = async (mode: 'official' | 'pre-auction' | 'clear' | 'clear-players') => {
    if (mode === 'clear-players') {
      await clearAllPlayers();
      return;
    }
    const nextState = clientResetAuction(stateRef.current, mode);
    updateStateAndPersist(nextState);
    showNotification('success', `Reset auction to ${mode} mode.`);

    try {
      await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
    } catch {}
  };

  const clearAllPlayers = async (): Promise<boolean> => {
    try {
      await fetch('/api/players/clear', { method: 'POST' });
    } catch {}

    const updatedTeams = stateRef.current.teams.map((t) => ({
      ...t,
      totalPlayers: 0,
      iconPlayersCount: 0,
      auctionPlayersCount: 0,
      totalPointsSpent: 0,
      pointsRemaining: t.startingPoints || 100000,
      maxSafeBid: (t.startingPoints || 100000) - ((stateRef.current.settings.maxSquadSize - 1) * 500),
    }));

    const nextState: FullAuctionState = {
      ...stateRef.current,
      players: [],
      transactions: [],
      teams: updatedTeams,
      bidding: {
        currentPlayerId: 0,
        currentBid: stateRef.current.settings.defaultReservePrice || 500,
        selectedTeamId: stateRef.current.teams[0]?.id || null,
        isActive: false,
        bidHistory: [],
      },
      summary: {
        totalPlayers: 0,
        playersSold: 0,
        playersAvailable: 0,
        playersUnsold: 0,
        totalAuctionPointsSpent: 0,
        totalCommitteeCash: 0,
        auctionProgressPct: 0,
        completedTeamsCount: 0,
      },
    };

    updateStateAndPersist(nextState);
    showNotification('success', 'All 80 players and data erased successfully!');
    return true;
  };

  const importCSV = async (csvText: string, replaceExisting: boolean = false) => {
    try {
      const res = await fetch('/api/import/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText, replaceExisting }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) updateStateAndPersist(data.state);
        showNotification('success', data.message);
        return { count: data.count, message: data.message };
      }
    } catch {}

    // Client-side CSV parser fallback
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      showNotification('error', 'CSV file appears empty');
      return null;
    }

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += c;
        }
      }
      result.push(cur.trim());
      return result;
    };

    let startIndex = 0;
    let idCol = -1;
    let nameCol = -1;
    let roleCol = -1;
    let villageCol = -1;

    const firstParts = parseLine(lines[0]);
    const lowerFirst = firstParts.map((p) => p.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const isHeader = lowerFirst.some((h) =>
      ['id', 'srno', 'sr', 'name', 'playername', 'player', 'role', 'village', 'city', 'town'].includes(h)
    );

    if (isHeader) {
      startIndex = 1;
      lowerFirst.forEach((h, idx) => {
        if (h === 'id' || h === 'srno' || h === 'sr' || h === 'no' || h === 'slno') idCol = idx;
        else if (h.includes('name') || h.includes('player')) nameCol = idx;
        else if (h.includes('role')) roleCol = idx;
        else if (h.includes('village') || h.includes('city') || h.includes('town')) villageCol = idx;
      });
    }

    if (nameCol === -1) {
      if (firstParts.length >= 4) {
        idCol = 0;
        nameCol = 1;
        roleCol = 2;
        villageCol = 3;
      } else if (firstParts.length === 3) {
        const firstIsNum = /^\d+$/.test(firstParts[0].replace(/\D/g, ''));
        if (firstIsNum) {
          idCol = 0;
          nameCol = 1;
          roleCol = 2;
        } else {
          nameCol = 0;
          roleCol = 1;
          villageCol = 2;
        }
      } else if (firstParts.length === 2) {
        nameCol = 0;
        roleCol = 1;
      } else {
        nameCol = 0;
      }
    }

    let parsedCount = 0;
    const newPlayersList: Player[] = replaceExisting ? [] : [...stateRef.current.players];
    let currentMaxId = replaceExisting ? 0 : newPlayersList.reduce((max, p) => Math.max(max, p.id || 0), 0);

    for (let i = startIndex; i < lines.length; i++) {
      const parts = parseLine(lines[i]);
      if (parts.length === 0 || !parts.some((p) => p.length > 0)) continue;

      const rawName = nameCol >= 0 && parts[nameCol] ? parts[nameCol] : '';
      if (!rawName.trim()) continue;

      let customId: number | null = null;
      if (idCol >= 0 && parts[idCol]) {
        const numOnly = parts[idCol].replace(/[^0-9]/g, '');
        if (numOnly) {
          const parsed = parseInt(numOnly, 10);
          if (!isNaN(parsed) && parsed > 0) customId = parsed;
        }
      }

      const assignedId = customId !== null ? customId : ++currentMaxId;
      const rawRole = roleCol >= 0 && parts[roleCol] ? parts[roleCol] : 'All-Rounder';
      let role: Player['role'] = 'All-Rounder';
      const rLower = rawRole.toLowerCase();
      if (rLower.includes('bat')) role = 'Batsman';
      else if (rLower.includes('bowl')) role = 'Bowler';
      else if (rLower.includes('keeper') || rLower.includes('wk') || rLower.includes('wick')) role = 'Wicket-Keeper';

      const village = villageCol >= 0 && parts[villageCol] ? parts[villageCol].trim() : '';

      newPlayersList.push({
        id: assignedId,
        code: `P${assignedId.toString().padStart(3, '0')}`,
        name: rawName.trim().toUpperCase(),
        role,
        auctionOrder: assignedId,
        status: 'AVAILABLE',
        soldToTeamId: null,
        soldPrice: 0,
        isIcon: false,
        srNo: assignedId,
        village,
      });
      parsedCount++;
    }

    // Sort by id
    newPlayersList.sort((a, b) => a.id - b.id);

    const { updatedTeams, summary } = recalculateAllTeams(stateRef.current.teams, newPlayersList, stateRef.current.settings);
    updateStateAndPersist({
      ...stateRef.current,
      players: newPlayersList,
      teams: updatedTeams,
      summary,
      bidding: {
        ...stateRef.current.bidding,
        currentPlayerId: newPlayersList[0]?.id || 0,
        isActive: Boolean(newPlayersList[0]),
      },
    });

    showNotification('success', `Imported ${parsedCount} players from CSV (ID, Name, Role, Village)!`);
    return { count: parsedCount, message: `Imported ${parsedCount} players` };
  };

  const importPlayers = async (playersList: any[]): Promise<number> => {
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: playersList }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) updateStateAndPersist(data.state);
        showNotification('success', data.message);
        return 1;
      }
    } catch {}

    return 0;
  };

  const saveFileAs = async (fileName: string = 'myauctionkpl'): Promise<{ success: boolean; fileName: string }> => {
    const clean = fileName.replace(/[^a-zA-Z0-9_-]/g, '').trim() || 'myauctionkpl';

    // Persist to localStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateRef.current));
    } catch {}

    // Attempt server save
    try {
      const res = await fetch('/api/save-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: clean }),
      });
      if (res.ok) {
        const data = await res.json();
        showNotification('success', `Saved auction database as ${data.fileName}!`);
        return { success: true, fileName: data.fileName };
      }
    } catch {}

    // Fallback: trigger direct client download
    try {
      const jsonContent = JSON.stringify(stateRef.current, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${clean}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotification('success', `Exported and saved ${clean}.json!`);
      return { success: true, fileName: `${clean}.json` };
    } catch (err: any) {
      showNotification('error', 'Failed to save file: ' + err.message);
      return { success: false, fileName: `${clean}.json` };
    }
  };

  return (
    <AuctionContext.Provider
      value={{
        state,
        loading,
        error,
        role,
        setRole,
        notification,
        clearNotification,
        showNotification,
        refreshState: fetchState,
        placeBid,
        validateSale,
        sellPlayer,
        markUnsold,
        reopenPlayer,
        navigatePlayer,
        selectAuctionPlayer,
        addPlayer,
        updatePlayer,
        deletePlayer,
        updateSettings,
        addTeam,
        updateTeam,
        deleteTeam,
        resetAuction,
        clearAllPlayers,
        importPlayers,
        importCSV,
        getViewerShareUrl,
        loginAdmin,
        logoutAdmin,
        saveFileAs,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
};
