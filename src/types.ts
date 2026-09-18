export type PlayerRole = 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper';

export type PlayerStatus = 'AVAILABLE' | 'SOLD' | 'UNSOLD';

export interface Player {
  id: number;
  code: string;
  name: string;
  role: PlayerRole;
  auctionOrder: number;
  status: PlayerStatus;
  soldToTeamId: string | null;
  soldPrice: number;
  soldAt?: string;
}

export interface Team {
  id: string;
  name: string;
  shortCode: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  startingPoints: number;
  iconCost: number;
  auctionBudget: number;
  totalPlayers: number;
  iconPlayersCount: number;
  auctionPlayersCount: number;
  totalPointsSpent: number;
  pointsRemaining: number;
  maxSafeBid: number;
  committeeCash: number;
  status: 'OK' | 'FULL' | 'OVER POINTS' | 'OVER 13 PLAYERS';
}

export interface AuctionTransaction {
  id: string;
  timestamp: string;
  auctionOrder: number;
  playerId: number;
  playerName: string;
  role: PlayerRole;
  teamId: string;
  teamName: string;
  soldPrice: number;
  committeeCharge: number;
}

export interface LiveBiddingState {
  currentPlayerId: number;
  currentBid: number;
  selectedTeamId: string | null;
  isActive: boolean;
  bidHistory: { teamId: string; amount: number; timestamp: string }[];
}

export type UserRole = 'admin' | 'viewer';

export interface TournamentSettings {
  tournamentName: string;
  maxSquadSize: number;
  maxAuctionPlayers: number;
  iconPlayersCount: number;
  iconCostPerPlayer: number;
  startingPoints: number;
  auctionBudget: number;
  freePoints: number;
  extraPointsAllowed: boolean;
  extraPointsPenaltyRate: number;
  minBidIncrement: number;
  defaultReservePrice: number;
}

export interface DashboardSummary {
  totalPlayers: number;
  playersSold: number;
  playersAvailable: number;
  playersUnsold: number;
  totalAuctionPointsSpent: number;
  totalCommitteeCash: number;
  auctionProgressPct: number;
  completedTeamsCount: number;
}

export interface FullAuctionState {
  settings: TournamentSettings;
  teams: Team[];
  players: Player[];
  transactions: AuctionTransaction[];
  bidding: LiveBiddingState;
  summary: DashboardSummary;
}

export type ActiveNav =
  | 'dashboard'
  | 'live-auction'
  | 'players'
  | 'teams'
  | 'team-squads'
  | 'auction-history'
  | 'admin'
  | 'settings';
