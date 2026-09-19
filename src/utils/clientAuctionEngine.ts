import {
  FullAuctionState,
  Player,
  Team,
  TournamentSettings,
  AuctionTransaction,
  DashboardSummary,
  LiveBiddingState,
} from '../types';
import { DEFAULT_AUCTION_STATE } from '../data/defaultAuctionState';

export function calculateSummary(players: Player[], teams: Team[], settings: TournamentSettings): DashboardSummary {
  const totalPlayers = players.length;
  const playersSold = players.filter((p) => p.status === 'SOLD').length;
  const playersAvailable = players.filter((p) => p.status === 'AVAILABLE').length;
  const playersUnsold = players.filter((p) => p.status === 'UNSOLD').length;

  const auctionPointsSpent = players
    .filter((p) => p.status === 'SOLD')
    .reduce((sum, p) => sum + (p.soldPrice || 0), 0);

  const totalCommitteeCash = teams.reduce((sum, t) => sum + (t.committeeCash || 0), 0);
  const auctionProgressPct = totalPlayers > 0 ? Math.round((playersSold / totalPlayers) * 100) : 0;
  const completedTeamsCount = teams.filter((t) => (t.totalPlayers || 0) >= (settings.maxSquadSize || 15)).length;

  return {
    totalPlayers,
    playersSold,
    playersAvailable,
    playersUnsold,
    totalAuctionPointsSpent: auctionPointsSpent,
    totalCommitteeCash,
    auctionProgressPct,
    completedTeamsCount,
  };
}

export function recalculateAllTeams(
  teams: Team[],
  players: Player[],
  settings: TournamentSettings
): { updatedTeams: Team[]; summary: DashboardSummary } {
  const updatedTeams = teams.map((team) => {
    const squad = players.filter((p) => p.soldToTeamId === team.id);
    const totalPointsSpent = squad.reduce((sum, p) => sum + (p.soldPrice || 0), 0);

    const effectiveBudget = (team.startingPoints || settings.startingPoints || 100000) + (settings.freePoints || 0);
    const pointsRemaining = effectiveBudget - totalPointsSpent;

    const extraSpent = Math.max(0, totalPointsSpent - effectiveBudget);
    const committeeCash = extraSpent * (settings.extraPointsPenaltyRate || 1);

    const totalCount = squad.length;
    const remainingSlots = Math.max(0, (settings.maxSquadSize || 15) - totalCount);

    const reserveNeed = remainingSlots > 1 ? (remainingSlots - 1) * (settings.minBidIncrement || 500) : 0;
    const maxSafeBid = remainingSlots > 0 ? Math.max(0, pointsRemaining - reserveNeed) : 0;

    let status: Team['status'] = 'OK';
    if (totalCount > (settings.maxSquadSize || 15)) {
      status = 'OVER 13 PLAYERS';
    } else if (pointsRemaining < 0) {
      status = 'OVER POINTS';
    } else if (totalCount === (settings.maxSquadSize || 15)) {
      status = 'FULL';
    }

    return {
      ...team,
      totalPlayers: totalCount,
      iconPlayersCount: 0,
      auctionPlayersCount: totalCount,
      iconCost: 0,
      auctionBudget: effectiveBudget,
      totalPointsSpent,
      pointsRemaining,
      maxSafeBid,
      committeeCash,
      status,
    };
  });

  const summary = calculateSummary(players, updatedTeams, settings);
  return { updatedTeams, summary };
}

export function clientPlaceBid(
  state: FullAuctionState,
  playerId: number,
  teamId: string | null,
  amount: number
): FullAuctionState {
  const newHistory = [
    {
      teamId: teamId || '',
      amount,
      timestamp: new Date().toISOString(),
    },
    ...(state.bidding.bidHistory || []).slice(0, 29),
  ];

  return {
    ...state,
    bidding: {
      ...state.bidding,
      currentPlayerId: playerId,
      selectedTeamId: teamId,
      currentBid: amount,
      isActive: true,
      bidHistory: newHistory,
    },
  };
}

export function clientSellPlayer(
  state: FullAuctionState,
  playerId: number,
  teamId: string,
  price: number
): { success: boolean; state: FullAuctionState; message: string } {
  const player = state.players.find((p) => p.id === playerId);
  const team = state.teams.find((t) => t.id === teamId);

  if (!player || !team) {
    return { success: false, state, message: 'Invalid player or franchise team selected' };
  }

  const now = new Date();
  const soldAtTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Update players
  const updatedPlayers = state.players.map((p) => {
    if (p.id === playerId) {
      return {
        ...p,
        status: 'SOLD' as const,
        soldToTeamId: teamId,
        soldPrice: price,
        soldAt: soldAtTime,
      };
    }
    return p;
  });

  // Add transaction
  const newTx: AuctionTransaction = {
    id: `tx-${Date.now()}-${playerId}`,
    timestamp: soldAtTime,
    auctionOrder: player.auctionOrder || player.srNo || player.id,
    playerId: player.id,
    playerName: player.name,
    role: player.role,
    teamId: team.id,
    teamName: team.name,
    soldPrice: price,
    committeeCharge: 0,
  };

  const updatedTransactions = [newTx, ...(state.transactions || [])];

  // Recalculate teams
  const { updatedTeams, summary } = recalculateAllTeams(state.teams, updatedPlayers, state.settings);

  // Next available player
  const nextPlayer = updatedPlayers.find((p) => p.status === 'AVAILABLE' && p.id !== playerId);

  const updatedBidding: LiveBiddingState = {
    currentPlayerId: nextPlayer ? nextPlayer.id : playerId,
    currentBid: state.settings.defaultReservePrice || 500,
    selectedTeamId: null,
    isActive: !!nextPlayer,
    bidHistory: [],
  };

  const newState: FullAuctionState = {
    ...state,
    players: updatedPlayers,
    teams: updatedTeams,
    transactions: updatedTransactions,
    bidding: updatedBidding,
    summary,
  };

  return {
    success: true,
    state: newState,
    message: `HAMMER FELL! Sold ${player.name} to ${team.name} for ${price.toLocaleString()} pts!`,
  };
}

export function clientMarkUnsold(
  state: FullAuctionState,
  playerId: number
): { success: boolean; state: FullAuctionState } {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { success: false, state };

  const updatedPlayers = state.players.map((p) => {
    if (p.id === playerId) {
      return {
        ...p,
        status: 'UNSOLD' as const,
        soldToTeamId: null,
        soldPrice: 0,
      };
    }
    return p;
  });

  const { updatedTeams, summary } = recalculateAllTeams(state.teams, updatedPlayers, state.settings);
  const nextPlayer = updatedPlayers.find((p) => p.status === 'AVAILABLE' && p.id !== playerId);

  return {
    success: true,
    state: {
      ...state,
      players: updatedPlayers,
      teams: updatedTeams,
      summary,
      bidding: {
        ...state.bidding,
        currentPlayerId: nextPlayer ? nextPlayer.id : playerId,
        currentBid: state.settings.defaultReservePrice || 500,
        selectedTeamId: null,
        isActive: !!nextPlayer,
        bidHistory: [],
      },
    },
  };
}

export function clientReopenPlayer(
  state: FullAuctionState,
  playerId: number
): { success: boolean; state: FullAuctionState; message: string } {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { success: false, state, message: 'Player not found' };

  const updatedPlayers = state.players.map((p) => {
    if (p.id === playerId) {
      return {
        ...p,
        status: 'AVAILABLE' as const,
        soldToTeamId: null,
        soldPrice: 0,
        soldAt: undefined,
      };
    }
    return p;
  });

  const updatedTransactions = (state.transactions || []).filter((t) => t.playerId !== playerId);
  const { updatedTeams, summary } = recalculateAllTeams(state.teams, updatedPlayers, state.settings);

  const newState: FullAuctionState = {
    ...state,
    players: updatedPlayers,
    teams: updatedTeams,
    transactions: updatedTransactions,
    summary,
    bidding: {
      ...state.bidding,
      currentPlayerId: playerId,
      currentBid: state.settings.defaultReservePrice || 500,
      selectedTeamId: null,
      isActive: true,
      bidHistory: [],
    },
  };

  return {
    success: true,
    state: newState,
    message: `Reopened ${player.name} back to Available pool and brought to hammer!`,
  };
}

export function clientNavigatePlayer(
  state: FullAuctionState,
  direction?: 'next' | 'prev',
  targetPlayerId?: number
): FullAuctionState {
  if (targetPlayerId) {
    const target = state.players.find((p) => p.id === targetPlayerId);
    if (target) {
      return {
        ...state,
        bidding: {
          ...state.bidding,
          currentPlayerId: target.id,
          currentBid: target.soldPrice > 0 ? target.soldPrice : (state.settings.defaultReservePrice || 500),
          selectedTeamId: target.soldToTeamId || null,
          bidHistory: [],
        },
      };
    }
  }

  const currIndex = state.players.findIndex((p) => p.id === state.bidding.currentPlayerId);
  let nextIndex = currIndex;

  if (direction === 'next') {
    nextIndex = currIndex < state.players.length - 1 ? currIndex + 1 : 0;
  } else if (direction === 'prev') {
    nextIndex = currIndex > 0 ? currIndex - 1 : state.players.length - 1;
  }

  const nextPlayer = state.players[nextIndex] || state.players[0];
  if (!nextPlayer) return state;

  return {
    ...state,
    bidding: {
      ...state.bidding,
      currentPlayerId: nextPlayer.id,
      currentBid: nextPlayer.soldPrice > 0 ? nextPlayer.soldPrice : (state.settings.defaultReservePrice || 500),
      selectedTeamId: nextPlayer.soldToTeamId || null,
      bidHistory: [],
    },
  };
}

export function clientAddPlayer(
  state: FullAuctionState,
  playerData: Partial<Player>
): { success: boolean; state: FullAuctionState; message: string } {
  const maxId = state.players.reduce((max, p) => Math.max(max, p.id || 0), 0);
  const newId = maxId + 1;
  const newSrNo = playerData.srNo || newId;

  const newPlayer: Player = {
    id: newId,
    code: `P${newId.toString().padStart(3, '0')}`,
    name: (playerData.name || 'NEW PLAYER').toUpperCase().trim(),
    role: playerData.role || 'All-Rounder',
    auctionOrder: newSrNo,
    status: 'AVAILABLE',
    soldToTeamId: null,
    soldPrice: 0,
    isIcon: false,
    srNo: newSrNo,
    village: playerData.village || '',
  };

  const updatedPlayers = [...state.players, newPlayer];
  const { updatedTeams, summary } = recalculateAllTeams(state.teams, updatedPlayers, state.settings);

  return {
    success: true,
    state: {
      ...state,
      players: updatedPlayers,
      teams: updatedTeams,
      summary,
    },
    message: `Player ${newPlayer.name} registered successfully!`,
  };
}

export function clientUpdatePlayer(
  state: FullAuctionState,
  id: number,
  playerData: Partial<Player>
): { success: boolean; state: FullAuctionState; message: string } {
  const updatedPlayers = state.players.map((p) => {
    if (p.id === id) {
      return {
        ...p,
        ...playerData,
        name: (playerData.name !== undefined ? playerData.name : p.name).toUpperCase().trim(),
      };
    }
    return p;
  });

  const { updatedTeams, summary } = recalculateAllTeams(state.teams, updatedPlayers, state.settings);

  return {
    success: true,
    state: {
      ...state,
      players: updatedPlayers,
      teams: updatedTeams,
      summary,
    },
    message: 'Player updated successfully!',
  };
}

export function clientDeletePlayer(
  state: FullAuctionState,
  id: number
): { success: boolean; state: FullAuctionState; message: string } {
  const updatedPlayers = state.players.filter((p) => p.id !== id);
  const updatedTransactions = (state.transactions || []).filter((t) => t.playerId !== id);
  const { updatedTeams, summary } = recalculateAllTeams(state.teams, updatedPlayers, state.settings);

  let nextBidding = state.bidding;
  if (state.bidding.currentPlayerId === id) {
    const nextPlayer = updatedPlayers[0];
    nextBidding = {
      ...state.bidding,
      currentPlayerId: nextPlayer ? nextPlayer.id : 1,
      selectedTeamId: null,
      currentBid: state.settings.defaultReservePrice || 500,
      bidHistory: [],
    };
  }

  return {
    success: true,
    state: {
      ...state,
      players: updatedPlayers,
      teams: updatedTeams,
      transactions: updatedTransactions,
      bidding: nextBidding,
      summary,
    },
    message: 'Player deleted successfully!',
  };
}

export function clientUpdateSettings(
  state: FullAuctionState,
  newSettings: Partial<TournamentSettings>
): FullAuctionState {
  const updatedSettings: TournamentSettings = {
    ...state.settings,
    ...newSettings,
  };

  const { updatedTeams, summary } = recalculateAllTeams(state.teams, state.players, updatedSettings);

  return {
    ...state,
    settings: updatedSettings,
    teams: updatedTeams,
    summary,
  };
}

export function clientResetAuction(
  state: FullAuctionState,
  mode: 'official' | 'pre-auction' | 'clear'
): FullAuctionState {
  if (mode === 'clear') {
    const clearedPlayers = state.players.map((p) => ({
      ...p,
      status: 'AVAILABLE' as const,
      soldToTeamId: null,
      soldPrice: 0,
      soldAt: undefined,
    }));

    const { updatedTeams, summary } = recalculateAllTeams(state.teams, clearedPlayers, state.settings);

    return {
      ...state,
      players: clearedPlayers,
      teams: updatedTeams,
      transactions: [],
      bidding: {
        currentPlayerId: clearedPlayers[0]?.id || 1,
        currentBid: state.settings.defaultReservePrice || 500,
        selectedTeamId: null,
        isActive: false,
        bidHistory: [],
      },
      summary,
    };
  }

  // pre-auction or official reset
  return {
    ...DEFAULT_AUCTION_STATE,
    settings: {
      ...DEFAULT_AUCTION_STATE.settings,
      tournamentName: state.settings.tournamentName || DEFAULT_AUCTION_STATE.settings.tournamentName,
    },
  };
}
