import { Player, Team, TournamentSettings, PlayerRole, AuctionTransaction } from './types';

export const DEFAULT_SETTINGS: TournamentSettings = {
  tournamentName: 'My Cricket League Auction',
  maxSquadSize: 15,
  maxAuctionPlayers: 15,
  iconPlayersCount: 0,
  iconCostPerPlayer: 0,
  startingPoints: 100000,
  auctionBudget: 100000,
  freePoints: 0,
  extraPointsAllowed: true,
  extraPointsPenaltyRate: 1, // 1 cash or penalty unit per point over budget
  minBidIncrement: 500,
  defaultReservePrice: 500,
};

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'mumbai-titans',
    name: 'MUMBAI TITANS',
    shortCode: 'MT',
    color: '#0284c7', // Sky Blue
    badgeBg: '#e0f2fe',
    badgeText: '#0369a1',
    startingPoints: 100000,
    iconCost: 0,
    auctionBudget: 100000,
    totalPlayers: 0,
    iconPlayersCount: 0,
    auctionPlayersCount: 0,
    totalPointsSpent: 0,
    pointsRemaining: 100000,
    maxSafeBid: 86000,
    committeeCash: 0,
    status: 'OK',
  },
  {
    id: 'delhi-strikers',
    name: 'DELHI STRIKERS',
    shortCode: 'DS',
    color: '#dc2626', // Red
    badgeBg: '#fee2e2',
    badgeText: '#b91c1c',
    startingPoints: 100000,
    iconCost: 0,
    auctionBudget: 100000,
    totalPlayers: 0,
    iconPlayersCount: 0,
    auctionPlayersCount: 0,
    totalPointsSpent: 0,
    pointsRemaining: 100000,
    maxSafeBid: 86000,
    committeeCash: 0,
    status: 'OK',
  },
  {
    id: 'chennai-royals',
    name: 'CHENNAI ROYALS',
    shortCode: 'CR',
    color: '#ca8a04', // Yellow / Gold
    badgeBg: '#fef9c3',
    badgeText: '#854d0e',
    startingPoints: 100000,
    iconCost: 0,
    auctionBudget: 100000,
    totalPlayers: 0,
    iconPlayersCount: 0,
    auctionPlayersCount: 0,
    totalPointsSpent: 0,
    pointsRemaining: 100000,
    maxSafeBid: 86000,
    committeeCash: 0,
    status: 'OK',
  },
  {
    id: 'bangalore-blasters',
    name: 'BANGALORE BLASTERS',
    shortCode: 'BB',
    color: '#059669', // Emerald
    badgeBg: '#d1fae5',
    badgeText: '#047857',
    startingPoints: 100000,
    iconCost: 0,
    auctionBudget: 100000,
    totalPlayers: 0,
    iconPlayersCount: 0,
    auctionPlayersCount: 0,
    totalPointsSpent: 0,
    pointsRemaining: 100000,
    maxSafeBid: 86000,
    committeeCash: 0,
    status: 'OK',
  },
  {
    id: 'kolkata-knights',
    name: 'KOLKATA KNIGHTS',
    shortCode: 'KK',
    color: '#7c3aed', // Purple
    badgeBg: '#ede9fe',
    badgeText: '#6d28d9',
    startingPoints: 100000,
    iconCost: 0,
    auctionBudget: 100000,
    totalPlayers: 0,
    iconPlayersCount: 0,
    auctionPlayersCount: 0,
    totalPointsSpent: 0,
    pointsRemaining: 100000,
    maxSafeBid: 86000,
    committeeCash: 0,
    status: 'OK',
  },
  {
    id: 'rajasthan-riders',
    name: 'RAJASTHAN RIDERS',
    shortCode: 'RR',
    color: '#db2777', // Pink
    badgeBg: '#fce7f3',
    badgeText: '#be185d',
    startingPoints: 100000,
    iconCost: 0,
    auctionBudget: 100000,
    totalPlayers: 0,
    iconPlayersCount: 0,
    auctionPlayersCount: 0,
    totalPointsSpent: 0,
    pointsRemaining: 100000,
    maxSafeBid: 86000,
    committeeCash: 0,
    status: 'OK',
  },
  {
    id: 'punjab-warriors',
    name: 'PUNJAB WARRIORS',
    shortCode: 'PW',
    color: '#ea580c', // Orange
    badgeBg: '#ffedd5',
    badgeText: '#c2410c',
    startingPoints: 100000,
    iconCost: 0,
    auctionBudget: 100000,
    totalPlayers: 0,
    iconPlayersCount: 0,
    auctionPlayersCount: 0,
    totalPointsSpent: 0,
    pointsRemaining: 100000,
    maxSafeBid: 86000,
    committeeCash: 0,
    status: 'OK',
  },
  {
    id: 'gujarat-gliders',
    name: 'GUJARAT GLIDERS',
    shortCode: 'GG',
    color: '#0d9488', // Teal
    badgeBg: '#ccfbf1',
    badgeText: '#0f766e',
    startingPoints: 100000,
    iconCost: 0,
    auctionBudget: 100000,
    totalPlayers: 0,
    iconPlayersCount: 0,
    auctionPlayersCount: 0,
    totalPointsSpent: 0,
    pointsRemaining: 100000,
    maxSafeBid: 86000,
    committeeCash: 0,
    status: 'OK',
  },
];

// Sample players pool ready for any league auction - all equal auction players
export const RAW_PLAYERS_LIST: {
  id: number;
  name: string;
    role: PlayerRole;
}[] = [
  { id: 1, name: 'ROHIT SHARMA', role: 'Batsman' },
  { id: 2, name: 'JASPRIT BUMRAH', role: 'Bowler' },
  { id: 3, name: 'RISHABH PANT', role: 'Wicket-Keeper' },
  { id: 4, name: 'AXAR PATEL', role: 'All-Rounder' },
  { id: 5, name: 'MS DHONI', role: 'Wicket-Keeper' },
  { id: 6, name: 'RAVINDRA JADEJA', role: 'All-Rounder' },
  { id: 7, name: 'VIRAT KOHLI', role: 'Batsman' },
  { id: 8, name: 'MOHAMMED SIRAJ', role: 'Bowler' },
  { id: 9, name: 'SHREYAS IYER', role: 'Batsman' },
  { id: 10, name: 'ANDRE RUSSELL', role: 'All-Rounder' },
  { id: 11, name: 'SANJU SAMSON', role: 'Wicket-Keeper' },
  { id: 12, name: 'YUZVENDRA CHAHAL', role: 'Bowler' },
  { id: 13, name: 'SHIKHAR DHAWAN', role: 'Batsman' },
  { id: 14, name: 'ARSHDEEP SINGH', role: 'Bowler' },
  { id: 15, name: 'SHUBMAN GILL', role: 'Batsman' },
  { id: 16, name: 'RASHID KHAN', role: 'Bowler' },
  { id: 17, name: 'SURYAKUMAR YADAV', role: 'Batsman' },
  { id: 18, name: 'KL RAHUL', role: 'Wicket-Keeper' },
  { id: 19, name: 'HARDIK PANDYA', role: 'All-Rounder' },
  { id: 20, name: 'KULDEEP YADAV', role: 'Bowler' },
  { id: 21, name: 'YASHASVI JAISWAL', role: 'Batsman' },
  { id: 22, name: 'RINKU SINGH', role: 'Batsman' },
  { id: 23, name: 'SHIVAM DUBE', role: 'All-Rounder' },
  { id: 24, name: 'MOHAMMED SHAMI', role: 'Bowler' },
  { id: 25, name: 'ISHAN KISHAN', role: 'Wicket-Keeper' },
  { id: 26, name: 'RUTURAJ GAIKWAD', role: 'Batsman' },
  { id: 27, name: 'WASHINGTON SUNDAR', role: 'All-Rounder' },
  { id: 28, name: 'BHUVNESHWAR KUMAR', role: 'Bowler' },
  { id: 29, name: 'PRASIDH KRISHNA', role: 'Bowler' },
  { id: 30, name: 'TILAK VARMA', role: 'Batsman' },
  { id: 31, name: 'RAVI BISHNOI', role: 'Bowler' },
  { id: 32, name: 'JITESH SHARMA', role: 'Wicket-Keeper' },
  { id: 33, name: 'SHARDUL THAKUR', role: 'All-Rounder' },
  { id: 34, name: 'AVESH KHAN', role: 'Bowler' },
  { id: 35, name: 'ABHISHEK SHARMA', role: 'All-Rounder' },
  { id: 36, name: 'SANVIR SINGH', role: 'All-Rounder' },
  { id: 37, name: 'MUKESH KUMAR', role: 'Bowler' },
  { id: 38, name: 'DHRUV JUREL', role: 'Wicket-Keeper' },
  { id: 39, name: 'SAI SUDHARSAN', role: 'Batsman' },
  { id: 40, name: 'HARSHIT RANA', role: 'Bowler' },
  { id: 41, name: 'MAYANK YADAV', role: 'Bowler' },
  { id: 42, name: 'NITISH KUMAR REDDY', role: 'All-Rounder' },
  { id: 43, name: 'VARUN CHAKRAVARTHY', role: 'Bowler' },
  { id: 44, name: 'SHASHANK SINGH', role: 'Batsman' },
  { id: 45, name: 'ASHUTOSH SHARMA', role: 'Batsman' },
  { id: 46, name: 'VAIBHAV ARORA', role: 'Bowler' },
  { id: 47, name: 'KRUNAL PANDYA', role: 'All-Rounder' },
  { id: 48, name: 'DEVDUTT PADIKKAL', role: 'Batsman' },
  { id: 49, name: 'RAHUL TRIPATHI', role: 'Batsman' },
  { id: 50, name: 'T NATARAJAN', role: 'Bowler' },
  { id: 51, name: 'DEEPAK CHAHAR', role: 'Bowler' },
  { id: 52, name: 'KHAREEM SHAIKH', role: 'All-Rounder' },
  { id: 53, name: 'VIJAY SHANKAR', role: 'All-Rounder' },
  { id: 54, name: 'SANDEEP SHARMA', role: 'Bowler' },
  { id: 55, name: 'ANUJ RAWAT', role: 'Wicket-Keeper' },
  { id: 56, name: 'MANISH PANDEY', role: 'Batsman' },
  { id: 57, name: 'CHETAN SAKARIYA', role: 'Bowler' },
  { id: 58, name: 'KARTIK TYAGI', role: 'Bowler' },
  { id: 59, name: 'PRABHSIMRAN SINGH', role: 'Wicket-Keeper' },
  { id: 60, name: 'NEHAL WADHERA', role: 'Batsman' },
  { id: 61, name: 'SHIVAM MAVI', role: 'Bowler' },
  { id: 62, name: 'SUYASH SHARMA', role: 'Bowler' },
  { id: 63, name: 'AYUSH BADONI', role: 'Batsman' },
  { id: 64, name: 'MOHSIN KHAN', role: 'Bowler' },
  { id: 65, name: 'YASH DAYAL', role: 'Bowler' },
  { id: 66, name: 'ABHINAV MANOHAR', role: 'Batsman' },
  { id: 67, name: 'SAI KISHORE', role: 'Bowler' },
  { id: 68, name: 'UMRAN MALIK', role: 'Bowler' },
  { id: 69, name: 'KULDIP SEN', role: 'Bowler' },
  { id: 70, name: 'SAMEER RIZVI', role: 'Batsman' },
  { id: 71, name: 'KUMAR KUSHAGRA', role: 'Wicket-Keeper' },
  { id: 72, name: 'ROBIN MINZ', role: 'Wicket-Keeper' },
  { id: 73, name: 'SWAPNIL SINGH', role: 'All-Rounder' },
  { id: 74, name: 'ANSHUL KAMBOJ', role: 'Bowler' },
  { id: 75, name: 'NAMAN DHIR', role: 'All-Rounder' },
  { id: 76, name: 'RAMANDEEP SINGH', role: 'All-Rounder' },
  { id: 77, name: 'ANGKRISH RAGHUVANSHI', role: 'Batsman' },
  { id: 78, name: 'RASIKH SALAM', role: 'Bowler' },
  { id: 79, name: 'MAYANK DAGAR', role: 'All-Rounder' },
  { id: 80, name: 'SHABAZ AHMED', role: 'All-Rounder' },
];

/**
 * Builds a Fresh Pre-Auction state ready for the live bidding day.
 * All players treated equally as available auction players.
 */
export function buildFreshPreAuctionState(teamsList: Team[] = INITIAL_TEAMS): {
  teams: Team[];
  players: Player[];
  transactions: AuctionTransaction[];
} {
  const teams = teamsList.map(t => ({
    ...t,
    totalPlayers: 0,
    iconPlayersCount: 0,
    auctionPlayersCount: 0,
    iconCost: 0,
    auctionBudget: t.startingPoints || 100000,
    totalPointsSpent: 0,
    pointsRemaining: t.startingPoints || 100000,
    maxSafeBid: Math.max(0, (t.startingPoints || 100000) - (14 * 1000)),
    committeeCash: 0,
    status: 'OK' as const,
  }));

  const players: Player[] = RAW_PLAYERS_LIST.map((p) => ({
    id: p.id,
    code: `P${p.id.toString().padStart(3, '0')}`,
    name: p.name,
        role: p.role,
    auctionOrder: p.id,
    status: 'AVAILABLE' as const,
    soldToTeamId: null,
    soldPrice: 0,
    isIcon: false,
  }));

  const transactions: AuctionTransaction[] = [];

  return { teams, players, transactions };
}

/**
 * Builds an official starter state with sample sales
 */
export function buildOfficialAuctionState(): {
  teams: Team[];
  players: Player[];
  transactions: AuctionTransaction[];
} {
  return buildFreshPreAuctionState();
}

