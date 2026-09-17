import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  FullAuctionState,
  Player,
  Team,
  TournamentSettings,
  UserRole,
} from '../types';

interface AuctionContextType {
  state: FullAuctionState | null;
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
    villageCount?: number;
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
  resetAuction: (mode: 'official' | 'pre-auction' | 'clear') => Promise<void>;
  importPlayers: (players: any[]) => Promise<number>;
  importCSV: (csvText: string, replaceExisting?: boolean) => Promise<{ count: number; message: string } | null>;
  getViewerShareUrl: () => string;
  loginAdmin: (passcode: string) => boolean;
  logoutAdmin: () => void;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const AuctionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FullAuctionState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRoleState] = useState<UserRole>('admin');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

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

  const loginAdmin = (passcode: string): boolean => {
    const clean = (passcode || '').trim().toLowerCase();
    // Valid passcodes for auction organizers
    if (['admin123', 'rbpl2026', 'auction2026', 'admin', 'director2026'].includes(clean)) {
      setRoleState('admin');
      try {
        localStorage.setItem('cricket_auction_role', 'admin');
        const url = new URL(window.location.href);
        url.searchParams.set('role', 'admin');
        window.history.replaceState({}, '', url.toString());
      } catch {
        // Ignore
      }
      showNotification('success', 'Admin access granted. Admin Panel is now unlocked.');
      return true;
    }
    showNotification('error', 'Incorrect administrator passcode.');
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
      if (!res.ok) throw new Error(`Failed to fetch auction state (${res.status})`);
      const data: FullAuctionState = await res.json();
      setState(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching state:', err);
      setError(err.message || 'Connection to auction server failed.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time synchronization polling every 2.5 seconds
  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 2500);
    return () => clearInterval(interval);
  }, [fetchState]);

  const placeBid = async (playerId: number, teamId: string | null, amount: number) => {
    try {
      const res = await fetch('/api/auction/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, teamId, amount }),
      });
      if (res.ok) {
        const updatedState = await res.json();
        setState(updatedState);
      }
    } catch (err: any) {
      showNotification('error', 'Failed to submit bid: ' + err.message);
    }
  };

  const validateSale = async (playerId: number, teamId: string, price: number) => {
    try {
      const res = await fetch('/api/auction/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, teamId, price }),
      });
      return await res.json();
    } catch (err: any) {
      return { valid: false, error: err.message };
    }
  };

  const sellPlayer = async (
    playerId: number,
    teamId: string,
    price: number,
    adminOverride: boolean = false
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/auction/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, teamId, price, adminOverride }),
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification('error', data.error || 'Sale rejected');
        return false;
      }
      showNotification('success', data.message);
      if (data.state) {
        setState(data.state);
      } else {
        await fetchState();
      }
      return true;
    } catch (err: any) {
      showNotification('error', 'Sale failed: ' + err.message);
      return false;
    }
  };

  const markUnsold = async (playerId: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/auction/unsold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
      if (!res.ok) throw new Error('Failed to mark unsold');
      const data = await res.json();
      if (data.state) setState(data.state);
      showNotification('warning', 'Player marked as UNSOLD (Pool 2 eligible)');
      return true;
    } catch (err: any) {
      showNotification('error', err.message);
      return false;
    }
  };

  const reopenPlayer = async (playerId: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/auction/reopen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification('error', data.error || 'Failed to reopen player');
        return false;
      }
      if (data.state) setState(data.state);
      showNotification('success', data.message || 'Player reopened for auction');
      return true;
    } catch (err: any) {
      showNotification('error', err.message);
      return false;
    }
  };

  const navigatePlayer = async (direction?: 'next' | 'prev', playerId?: number) => {
    try {
      const res = await fetch('/api/auction/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction, playerId }),
      });
      if (res.ok) {
        const updatedState = await res.json();
        setState(updatedState);
      }
    } catch (err: any) {
      console.error('Navigation error:', err);
    }
  };

  const selectAuctionPlayer = async (playerId: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/auction/select-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to select player');
      if (data.state) setState(data.state);
      showNotification('success', data.message);
      return true;
    } catch (err: any) {
      showNotification('error', err.message);
      return false;
    }
  };

  const addPlayer = async (playerData: Partial<Player>): Promise<boolean> => {
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add player');
      showNotification('success', data.message);
      await fetchState();
      return true;
    } catch (err: any) {
      showNotification('error', err.message);
      return false;
    }
  };

  const updatePlayer = async (id: number, playerData: Partial<Player>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/players/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update player');
      showNotification('success', data.message);
      await fetchState();
      return true;
    } catch (err: any) {
      showNotification('error', err.message);
      return false;
    }
  };

  const deletePlayer = async (id: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/players/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete player');
      showNotification('success', data.message);
      await fetchState();
      return true;
    } catch (err: any) {
      showNotification('error', err.message);
      return false;
    }
  };

  const updateSettings = async (settingsUpdates: Partial<TournamentSettings>): Promise<boolean> => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsUpdates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');
      if (data.state) setState(data.state);
      showNotification('success', 'Tournament settings updated successfully!');
      return true;
    } catch (err: any) {
      showNotification('error', err.message);
      return false;
    }
  };

  const addTeam = async (teamData: Partial<Team>): Promise<boolean> => {
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add team');
      showNotification('success', data.message);
      await fetchState();
      return true;
    } catch (err: any) {
      showNotification('error', err.message);
      return false;
    }
  };

  const updateTeam = async (id: string, teamData: Partial<Team>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/teams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update team');
      showNotification('success', data.message);
      await fetchState();
      return true;
    } catch (err: any) {
      showNotification('error', err.message);
      return false;
    }
  };

  const deleteTeam = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/teams/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete team');
      showNotification('success', data.message);
      await fetchState();
      return true;
    } catch (err: any) {
      showNotification('error', err.message);
      return false;
    }
  };

  const resetAuction = async (mode: 'official' | 'pre-auction' | 'clear') => {
    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (data.state) setState(data.state);
      showNotification('success', data.message || `Reset to ${mode} mode.`);
    } catch (err: any) {
      showNotification('error', 'Reset failed: ' + err.message);
    }
  };

  const importCSV = async (csvText: string, replaceExisting: boolean = false) => {
    try {
      const res = await fetch('/api/import/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText, replaceExisting }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'CSV import failed');
      if (data.state) setState(data.state);
      showNotification('success', data.message);
      return { count: data.count, message: data.message };
    } catch (err: any) {
      showNotification('error', err.message);
      return null;
    }
  };

  const importPlayers = async (playersList: any[]): Promise<number> => {
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: playersList }),
      });
      const data = await res.json();
      if (data.state) setState(data.state);
      showNotification('success', data.message);
      return 1;
    } catch (err: any) {
      showNotification('error', 'Import failed: ' + err.message);
      return 0;
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
        importPlayers,
        importCSV,
        getViewerShareUrl,
        loginAdmin,
        logoutAdmin,
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
