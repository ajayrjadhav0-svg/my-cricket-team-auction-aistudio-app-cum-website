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
  minBidIncrement: 1000,
  defaultReservePrice: 1000,
  maxVillageLimit: 9999, // No limit: franchises can buy unlimited players from any village
  allowVillageOverride: true,
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

// Sample players pool ready for any league auction - all equal auction players from villages
export const RAW_PLAYERS_LIST: {
  id: number;
  name: string;
  village: string;
  role: PlayerRole;
}[] = [
  { id: 1, name: 'ROHIT SHARMA', village: 'Rampur', role: 'Batsman' },
  { id: 2, name: 'JASPRIT BUMRAH', village: 'Rampur', role: 'Bowler' },
  { id: 3, name: 'RISHABH PANT', village: 'Sonapur', role: 'Wicket-Keeper' },
  { id: 4, name: 'AXAR PATEL', village: 'Khed', role: 'All-Rounder' },
  { id: 5, name: 'MS DHONI', village: 'Bori', role: 'Wicket-Keeper' },
  { id: 6, name: 'RAVINDRA JADEJA', village: 'Khed', role: 'All-Rounder' },
  { id: 7, name: 'VIRAT KOHLI', village: 'Sonapur', role: 'Batsman' },
  { id: 8, name: 'MOHAMMED SIRAJ', village: 'Alibaug', role: 'Bowler' },
  { id: 9, name: 'SHREYAS IYER', village: 'Wadgaon', role: 'Batsman' },
  { id: 10, name: 'ANDRE RUSSELL', village: 'Belapur', role: 'All-Rounder' },
  { id: 11, name: 'SANJU SAMSON', village: 'Alibaug', role: 'Wicket-Keeper' },
  { id: 12, name: 'YUZVENDRA CHAHAL', village: 'Sonapur', role: 'Bowler' },
  { id: 13, name: 'SHIKHAR DHAWAN', village: 'Shirgaon', role: 'Batsman' },
  { id: 14, name: 'ARSHDEEP SINGH', village: 'Shirgaon', role: 'Bowler' },
  { id: 15, name: 'SHUBMAN GILL', village: 'Dhamani', role: 'Batsman' },
  { id: 16, name: 'RASHID KHAN', village: 'Chandrapur', role: 'Bowler' },
  { id: 17, name: 'SURYAKUMAR YADAV', village: 'Rampur', role: 'Batsman' },
  { id: 18, name: 'KL RAHUL', village: 'Alibaug', role: 'Wicket-Keeper' },
  { id: 19, name: 'HARDIK PANDYA', village: 'Khed', role: 'All-Rounder' },
  { id: 20, name: 'KULDEEP YADAV', village: 'Chandrapur', role: 'Bowler' },
  { id: 21, name: 'YASHASVI JAISWAL', village: 'Sonapur', role: 'Batsman' },
  { id: 22, name: 'RINKU SINGH', village: 'Bori', role: 'Batsman' },
  { id: 23, name: 'SHIVAM DUBE', village: 'Wadgaon', role: 'All-Rounder' },
  { id: 24, name: 'MOHAMMED SHAMI', village: 'Sonapur', role: 'Bowler' },
  { id: 25, name: 'ISHAN KISHAN', village: 'Bori', role: 'Wicket-Keeper' },
  { id: 26, name: 'RUTURAJ GAIKWAD', village: 'Khed', role: 'Batsman' },
  { id: 27, name: 'WASHINGTON SUNDAR', village: 'Alibaug', role: 'All-Rounder' },
  { id: 28, name: 'BHUVNESHWAR KUMAR', village: 'Chandrapur', role: 'Bowler' },
  { id: 29, name: 'PRASIDH KRISHNA', village: 'Alibaug', role: 'Bowler' },
  { id: 30, name: 'TILAK VARMA', village: 'Alibaug', role: 'Batsman' },
  { id: 31, name: 'RAVI BISHNOI', village: 'Sonapur', role: 'Bowler' },
  { id: 32, name: 'JITESH SHARMA', village: 'Pimpalgaon', role: 'Wicket-Keeper' },
  { id: 33, name: 'SHARDUL THAKUR', village: 'Wadgaon', role: 'All-Rounder' },
  { id: 34, name: 'AVESH KHAN', village: 'Pimpalgaon', role: 'Bowler' },
  { id: 35, name: 'ABHISHEK SHARMA', village: 'Shirgaon', role: 'All-Rounder' },
  { id: 36, name: 'SANVIR SINGH', village: 'Shirgaon', role: 'All-Rounder' },
  { id: 37, name: 'MUKESH KUMAR', village: 'Bori', role: 'Bowler' },
  { id: 38, name: 'DHRUV JUREL', village: 'Chandrapur', role: 'Wicket-Keeper' },
  { id: 39, name: 'SAI SUDHARSAN', village: 'Alibaug', role: 'Batsman' },
  { id: 40, name: 'HARSHIT RANA', village: 'Sonapur', role: 'Bowler' },
  { id: 41, name: 'MAYANK YADAV', village: 'Sonapur', role: 'Bowler' },
  { id: 42, name: 'NITISH KUMAR REDDY', village: 'Alibaug', role: 'All-Rounder' },
  { id: 43, name: 'VARUN CHAKRAVARTHY', village: 'Alibaug', role: 'Bowler' },
  { id: 44, name: 'SHASHANK SINGH', village: 'Chandrapur', role: 'Batsman' },
  { id: 45, name: 'ASHUTOSH SHARMA', village: 'Chandrapur', role: 'Batsman' },
  { id: 46, name: 'VAIBHAV ARORA', village: 'Sonapur', role: 'Bowler' },
  { id: 47, name: 'KRUNAL PANDYA', village: 'Khed', role: 'All-Rounder' },
  { id: 48, name: 'DEVDUTT PADIKKAL', village: 'Alibaug', role: 'Batsman' },
  { id: 49, name: 'RAHUL TRIPATHI', village: 'Rampur', role: 'Batsman' },
  { id: 50, name: 'T NATARAJAN', village: 'Alibaug', role: 'Bowler' },
  { id: 51, name: 'DEEPAK CHAHAR', village: 'Sonapur', role: 'Bowler' },
  { id: 52, name: 'KHAREEM SHAIKH', village: 'Wadgaon', role: 'All-Rounder' },
  { id: 53, name: 'VIJAY SHANKAR', village: 'Alibaug', role: 'All-Rounder' },
  { id: 54, name: 'SANDEEP SHARMA', village: 'Shirgaon', role: 'Bowler' },
  { id: 55, name: 'ANUJ RAWAT', village: 'Sonapur', role: 'Wicket-Keeper' },
  { id: 56, name: 'MANISH PANDEY', village: 'Alibaug', role: 'Batsman' },
  { id: 57, name: 'CHETAN SAKARIYA', village: 'Khed', role: 'Bowler' },
  { id: 58, name: 'KARTIK TYAGI', village: 'Chandrapur', role: 'Bowler' },
  { id: 59, name: 'PRABHSIMRAN SINGH', village: 'Shirgaon', role: 'Wicket-Keeper' },
  { id: 60, name: 'NEHAL WADHERA', village: 'Shirgaon', role: 'Batsman' },
  { id: 61, name: 'SHIVAM MAVI', village: 'Pimpalgaon', role: 'Bowler' },
  { id: 62, name: 'SUYASH SHARMA', village: 'Sonapur', role: 'Bowler' },
  { id: 63, name: 'AYUSH BADONI', village: 'Sonapur', role: 'Batsman' },
  { id: 64, name: 'MOHSIN KHAN', village: 'Pimpalgaon', role: 'Bowler' },
  { id: 65, name: 'YASH DAYAL', village: 'Pimpalgaon', role: 'Bowler' },
  { id: 66, name: 'ABHINAV MANOHAR', village: 'Alibaug', role: 'Batsman' },
  { id: 67, name: 'SAI KISHORE', village: 'Alibaug', role: 'Bowler' },
  { id: 68, name: 'UMRAN MALIK', village: 'Sonapur', role: 'Bowler' },
  { id: 69, name: 'KULDIP SEN', village: 'Pimpalgaon', role: 'Bowler' },
  { id: 70, name: 'SAMEER RIZVI', village: 'Pimpalgaon', role: 'Batsman' },
  { id: 71, name: 'KUMAR KUSHAGRA', village: 'Bori', role: 'Wicket-Keeper' },
  { id: 72, name: 'ROBIN MINZ', village: 'Bori', role: 'Wicket-Keeper' },
  { id: 73, name: 'SWAPNIL SINGH', village: 'Pimpalgaon', role: 'All-Rounder' },
  { id: 74, name: 'ANSHUL KAMBOJ', village: 'Shirgaon', role: 'Bowler' },
  { id: 75, name: 'NAMAN DHIR', village: 'Shirgaon', role: 'All-Rounder' },
  { id: 76, name: 'RAMANDEEP SINGH', village: 'Shirgaon', role: 'All-Rounder' },
  { id: 77, name: 'ANGKRISH RAGHUVANSHI', village: 'Rampur', role: 'Batsman' },
  { id: 78, name: 'RASIKH SALAM', village: 'Sonapur', role: 'Bowler' },
  { id: 79, name: 'MAYANK DAGAR', village: 'Shirgaon', role: 'All-Rounder' },
  { id: 80, name: 'SHABAZ AHMED', village: 'Bori', role: 'All-Rounder' },
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
    village: p.village,
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

