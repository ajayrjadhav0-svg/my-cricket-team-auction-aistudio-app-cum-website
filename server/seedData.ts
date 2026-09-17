import { Player, Team, TournamentSettings, PlayerRole, AuctionTransaction } from './types';

export const DEFAULT_SETTINGS: TournamentSettings = {
  tournamentName: 'My Cricket League Auction',
  maxSquadSize: 15,
  maxAuctionPlayers: 13,
  iconPlayersCount: 2,
  iconCostPerPlayer: 15000,
  startingPoints: 100000,
  auctionBudget: 70000,
  freePoints: 0,
  extraPointsAllowed: true,
  extraPointsPenaltyRate: 1, // 1 cash or penalty unit per point over budget
  minBidIncrement: 1000,
  defaultReservePrice: 1000,
  maxVillageLimit: 6, // Optional quota per zone/region (or 99 for no quota)
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
    iconCost: 30000,
    auctionBudget: 70000,
    totalPlayers: 2,
    iconPlayersCount: 2,
    auctionPlayersCount: 0,
    totalPointsSpent: 30000,
    pointsRemaining: 70000,
    maxSafeBid: 58000,
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
    iconCost: 30000,
    auctionBudget: 70000,
    totalPlayers: 2,
    iconPlayersCount: 2,
    auctionPlayersCount: 0,
    totalPointsSpent: 30000,
    pointsRemaining: 70000,
    maxSafeBid: 58000,
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
    iconCost: 30000,
    auctionBudget: 70000,
    totalPlayers: 2,
    iconPlayersCount: 2,
    auctionPlayersCount: 0,
    totalPointsSpent: 30000,
    pointsRemaining: 70000,
    maxSafeBid: 58000,
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
    iconCost: 30000,
    auctionBudget: 70000,
    totalPlayers: 2,
    iconPlayersCount: 2,
    auctionPlayersCount: 0,
    totalPointsSpent: 30000,
    pointsRemaining: 70000,
    maxSafeBid: 58000,
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
    iconCost: 30000,
    auctionBudget: 70000,
    totalPlayers: 2,
    iconPlayersCount: 2,
    auctionPlayersCount: 0,
    totalPointsSpent: 30000,
    pointsRemaining: 70000,
    maxSafeBid: 58000,
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
    iconCost: 30000,
    auctionBudget: 70000,
    totalPlayers: 2,
    iconPlayersCount: 2,
    auctionPlayersCount: 0,
    totalPointsSpent: 30000,
    pointsRemaining: 70000,
    maxSafeBid: 58000,
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
    iconCost: 30000,
    auctionBudget: 70000,
    totalPlayers: 2,
    iconPlayersCount: 2,
    auctionPlayersCount: 0,
    totalPointsSpent: 30000,
    pointsRemaining: 70000,
    maxSafeBid: 58000,
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
    iconCost: 30000,
    auctionBudget: 70000,
    totalPlayers: 2,
    iconPlayersCount: 2,
    auctionPlayersCount: 0,
    totalPointsSpent: 30000,
    pointsRemaining: 70000,
    maxSafeBid: 58000,
    committeeCash: 0,
    status: 'OK',
  },
];

// Sample players pool ready for any league auction
export const RAW_PLAYERS_LIST: {
  id: number;
  name: string;
  village: string;
  role: PlayerRole;
  isIconFor?: string;
}[] = [
  // Icon Players (2 per team = 16 icons)
  { id: 1, name: 'ROHIT SHARMA (C)', village: 'West Zone', role: 'Batsman', isIconFor: 'mumbai-titans' },
  { id: 2, name: 'JASPRIT BUMRAH', village: 'West Zone', role: 'Bowler', isIconFor: 'mumbai-titans' },
  { id: 3, name: 'RISHABH PANT (C)', village: 'North Zone', role: 'Wicket-Keeper', isIconFor: 'delhi-strikers' },
  { id: 4, name: 'AXAR PATEL', village: 'West Zone', role: 'All-Rounder', isIconFor: 'delhi-strikers' },
  { id: 5, name: 'MS DHONI (C)', village: 'East Zone', role: 'Wicket-Keeper', isIconFor: 'chennai-royals' },
  { id: 6, name: 'RAVINDRA JADEJA', village: 'West Zone', role: 'All-Rounder', isIconFor: 'chennai-royals' },
  { id: 7, name: 'VIRAT KOHLI (C)', village: 'North Zone', role: 'Batsman', isIconFor: 'bangalore-blasters' },
  { id: 8, name: 'MOHAMMED SIRAJ', village: 'South Zone', role: 'Bowler', isIconFor: 'bangalore-blasters' },
  { id: 9, name: 'SHREYAS IYER (C)', village: 'West Zone', role: 'Batsman', isIconFor: 'kolkata-knights' },
  { id: 10, name: 'ANDRE RUSSELL', village: 'Overseas', role: 'All-Rounder', isIconFor: 'kolkata-knights' },
  { id: 11, name: 'SANJU SAMSON (C)', village: 'South Zone', role: 'Wicket-Keeper', isIconFor: 'rajasthan-riders' },
  { id: 12, name: 'YUZVENDRA CHAHAL', village: 'North Zone', role: 'Bowler', isIconFor: 'rajasthan-riders' },
  { id: 13, name: 'SHIKHAR DHAWAN (C)', village: 'North Zone', role: 'Batsman', isIconFor: 'punjab-warriors' },
  { id: 14, name: 'ARSHDEEP SINGH', village: 'North Zone', role: 'Bowler', isIconFor: 'punjab-warriors' },
  { id: 15, name: 'SHUBMAN GILL (C)', village: 'North Zone', role: 'Batsman', isIconFor: 'gujarat-gliders' },
  { id: 16, name: 'RASHID KHAN', village: 'Overseas', role: 'Bowler', isIconFor: 'gujarat-gliders' },

  // Auction Pool Players (Available for Live Bidding)
  { id: 17, name: 'SURYAKUMAR YADAV', village: 'West Zone', role: 'Batsman' },
  { id: 18, name: 'KL RAHUL', village: 'South Zone', role: 'Wicket-Keeper' },
  { id: 19, name: 'HARDIK PANDYA', village: 'West Zone', role: 'All-Rounder' },
  { id: 20, name: 'KULDEEP YADAV', village: 'Central Zone', role: 'Bowler' },
  { id: 21, name: 'YASHASVI JAISWAL', village: 'North Zone', role: 'Batsman' },
  { id: 22, name: 'RINKU SINGH', village: 'Central Zone', role: 'Batsman' },
  { id: 23, name: 'SHIVAM DUBE', village: 'West Zone', role: 'All-Rounder' },
  { id: 24, name: 'MOHAMMED SHAMI', village: 'North Zone', role: 'Bowler' },
  { id: 25, name: 'ISHAN KISHAN', village: 'East Zone', role: 'Wicket-Keeper' },
  { id: 26, name: 'RUTURAJ GAIKWAD', village: 'West Zone', role: 'Batsman' },
  { id: 27, name: 'WASHINGTON SUNDAR', village: 'South Zone', role: 'All-Rounder' },
  { id: 28, name: 'BHUVNESHWAR KUMAR', village: 'Central Zone', role: 'Bowler' },
  { id: 29, name: 'PRASIDH KRISHNA', village: 'South Zone', role: 'Bowler' },
  { id: 30, name: 'TILAK VARMA', village: 'South Zone', role: 'Batsman' },
  { id: 31, name: 'RAVI BISHNOI', village: 'North Zone', role: 'Bowler' },
  { id: 32, name: 'JITESH SHARMA', village: 'Central Zone', role: 'Wicket-Keeper' },
  { id: 33, name: 'SHARDUL THAKUR', village: 'West Zone', role: 'All-Rounder' },
  { id: 34, name: 'AVESH KHAN', village: 'Central Zone', role: 'Bowler' },
  { id: 35, name: 'ABHISHEK SHARMA', village: 'North Zone', role: 'All-Rounder' },
  { id: 36, name: 'SANVIR SINGH', village: 'North Zone', role: 'All-Rounder' },
  { id: 37, name: 'MUKESH KUMAR', village: 'East Zone', role: 'Bowler' },
  { id: 38, name: 'DHRUV JUREL', village: 'Central Zone', role: 'Wicket-Keeper' },
  { id: 39, name: 'SAI SUDHARSAN', village: 'South Zone', role: 'Batsman' },
  { id: 40, name: 'HARSHIT RANA', village: 'North Zone', role: 'Bowler' },
  { id: 41, name: 'MAYANK YADAV', village: 'North Zone', role: 'Bowler' },
  { id: 42, name: 'NITISH KUMAR REDDY', village: 'South Zone', role: 'All-Rounder' },
  { id: 43, name: 'VARUN CHAKRAVARTHY', village: 'South Zone', role: 'Bowler' },
  { id: 44, name: 'SHASHANK SINGH', village: 'Central Zone', role: 'Batsman' },
  { id: 45, name: 'ASHUTOSH SHARMA', village: 'Central Zone', role: 'Batsman' },
  { id: 46, name: 'VAIBHAV ARORA', village: 'North Zone', role: 'Bowler' },
  { id: 47, name: 'KRUNAL PANDYA', village: 'West Zone', role: 'All-Rounder' },
  { id: 48, name: 'DEVDUTT PADIKKAL', village: 'South Zone', role: 'Batsman' },
  { id: 49, name: 'RAHUL TRIPATHI', village: 'West Zone', role: 'Batsman' },
  { id: 50, name: 'T NATARAJAN', village: 'South Zone', role: 'Bowler' },
  { id: 51, name: 'DEEPAK CHAHAR', village: 'North Zone', role: 'Bowler' },
  { id: 52, name: 'KHAREEM SHAIKH', village: 'West Zone', role: 'All-Rounder' },
  { id: 53, name: 'VIJAY SHANKAR', village: 'South Zone', role: 'All-Rounder' },
  { id: 54, name: 'SANDEEP SHARMA', village: 'North Zone', role: 'Bowler' },
  { id: 55, name: 'ANUJ RAWAT', village: 'North Zone', role: 'Wicket-Keeper' },
  { id: 56, name: 'MANISH PANDEY', village: 'South Zone', role: 'Batsman' },
  { id: 57, name: 'CHETAN SAKARIYA', village: 'West Zone', role: 'Bowler' },
  { id: 58, name: 'KARTIK TYAGI', village: 'Central Zone', role: 'Bowler' },
  { id: 59, name: 'PRABHSIMRAN SINGH', village: 'North Zone', role: 'Wicket-Keeper' },
  { id: 60, name: 'NEHAL WADHERA', village: 'North Zone', role: 'Batsman' },
  { id: 61, name: 'SHIVAM MAVI', village: 'Central Zone', role: 'Bowler' },
  { id: 62, name: 'SUYASH SHARMA', village: 'North Zone', role: 'Bowler' },
  { id: 63, name: 'AYUSH BADONI', village: 'North Zone', role: 'Batsman' },
  { id: 64, name: 'MOHSIN KHAN', village: 'Central Zone', role: 'Bowler' },
  { id: 65, name: 'YASH DAYAL', village: 'Central Zone', role: 'Bowler' },
  { id: 66, name: 'ABHINAV MANOHAR', village: 'South Zone', role: 'Batsman' },
  { id: 67, name: 'SAI KISHORE', village: 'South Zone', role: 'Bowler' },
  { id: 68, name: 'UMRAN MALIK', village: 'North Zone', role: 'Bowler' },
  { id: 69, name: 'KULDIP SEN', village: 'Central Zone', role: 'Bowler' },
  { id: 70, name: 'SAMEER RIZVI', village: 'Central Zone', role: 'Batsman' },
  { id: 71, name: 'KUMAR KUSHAGRA', village: 'East Zone', role: 'Wicket-Keeper' },
  { id: 72, name: 'ROBIN MINZ', village: 'East Zone', role: 'Wicket-Keeper' },
  { id: 73, name: 'SWAPNIL SINGH', village: 'Central Zone', role: 'All-Rounder' },
  { id: 74, name: 'ANSHUL KAMBOJ', village: 'North Zone', role: 'Bowler' },
  { id: 75, name: 'NAMAN DHIR', village: 'North Zone', role: 'All-Rounder' },
  { id: 76, name: 'RAMANDEEP SINGH', village: 'North Zone', role: 'All-Rounder' },
  { id: 77, name: 'ANGKRISH RAGHUVANSHI', village: 'North Zone', role: 'Batsman' },
  { id: 78, name: 'RASIKH SALAM', village: 'North Zone', role: 'Bowler' },
  { id: 79, name: 'MAYANK DAGAR', village: 'North Zone', role: 'All-Rounder' },
  { id: 80, name: 'SHABAZ AHMED', village: 'East Zone', role: 'All-Rounder' },
];

/**
 * Builds a Fresh Pre-Auction state ready for the live bidding day.
 */
export function buildFreshPreAuctionState(teamsList: Team[] = INITIAL_TEAMS): {
  teams: Team[];
  players: Player[];
  transactions: AuctionTransaction[];
} {
  const teams = teamsList.map(t => ({
    ...t,
    totalPlayers: t.iconPlayersCount,
    auctionPlayersCount: 0,
    totalPointsSpent: t.iconCost,
    pointsRemaining: t.auctionBudget,
    maxSafeBid: Math.max(0, t.auctionBudget - (12 * 1000)),
    committeeCash: 0,
    status: 'OK' as const,
  }));

  const players: Player[] = RAW_PLAYERS_LIST.map((p, idx) => {
    if (p.isIconFor) {
      return {
        id: p.id,
        code: `P${p.id.toString().padStart(3, '0')}`,
        name: p.name,
        village: p.village,
        role: p.role,
        auctionOrder: p.id,
        status: 'ICON' as const,
        soldToTeamId: p.isIconFor,
        soldPrice: 15000,
        isIcon: true,
      };
    }

    return {
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
    };
  });

  const transactions: AuctionTransaction[] = [];
  players
    .filter(p => p.isIcon && p.soldToTeamId)
    .forEach(p => {
      const team = teams.find(t => t.id === p.soldToTeamId);
      if (team) {
        transactions.push({
          id: `tx-icon-${p.id}`,
          timestamp: 'Pre-Auction Allocation',
          auctionOrder: p.auctionOrder,
          playerId: p.id,
          playerName: p.name,
          village: p.village,
          role: p.role,
          teamId: team.id,
          teamName: team.name,
          soldPrice: 15000,
          committeeCharge: 0,
          isIcon: true,
        });
      }
    });

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
