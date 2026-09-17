import fs from 'fs';
import path from 'path';
import {
  FullAuctionState,
  Player,
  Team,
  AuctionTransaction,
  TournamentSettings,
  DashboardSummary,
  LiveBiddingState,
} from './types';
import {
  DEFAULT_SETTINGS,
  buildFreshPreAuctionState,
  buildOfficialAuctionState,
  INITIAL_TEAMS,
  RAW_PLAYERS_LIST,
} from './seedData';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'cricket_auction_database.json');

class AuctionDatabase {
  private state: FullAuctionState;

  constructor() {
    this.ensureDataDir();
    this.state = this.loadFromDisk();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadFromDisk(): FullAuctionState {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.teams && parsed.players) {
          // Automatic migration: strip icon allocations, remove zone limits & names
          let needsSave = false;

          const villageMap: Record<string, string> = {
            'West Zone': 'Rampur',
            'North Zone': 'Sonapur',
            'South Zone': 'Alibaug',
            'East Zone': 'Bori',
            'Central Zone': 'Chandrapur',
            'Overseas': 'Belapur',
          };

          parsed.players.forEach((p: Player) => {
            if (p.village && villageMap[p.village]) {
              p.village = villageMap[p.village];
              needsSave = true;
            }
            if (p.isIcon || p.status === 'ICON') {
              p.isIcon = false;
              if (p.status === 'ICON') {
                p.status = 'AVAILABLE';
                p.soldToTeamId = null;
                p.soldPrice = 0;
              }
              needsSave = true;
            }
          });

          // Remove pre-allocated icon transactions
          if (parsed.transactions) {
            const originalLength = parsed.transactions.length;
            parsed.transactions = parsed.transactions.filter((t: AuctionTransaction) => !t.isIcon && t.timestamp !== 'Pre-Auction Allocation');
            if (parsed.transactions.length !== originalLength) needsSave = true;
          }

          if (parsed.settings) {
            parsed.settings.maxVillageLimit = 9999;
            parsed.settings.iconPlayersCount = 0;
            parsed.settings.iconCostPerPlayer = 0;
            parsed.settings.maxAuctionPlayers = parsed.settings.maxSquadSize || 15;
            parsed.settings.auctionBudget = parsed.settings.startingPoints || 100000;
          }

          if (needsSave) {
            this.state = parsed;
            this.recalculateAllTeams();
            this.saveToDisk();
          }

          return parsed;
        }
      } catch (err) {
        console.error('Failed to parse database file, re-seeding:', err);
      }
    }

    return this.createPreAuctionState();
  }

  private saveToDisk() {
    try {
      this.ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  }

  public createOfficialState(): FullAuctionState {
    const { teams, players, transactions } = buildOfficialAuctionState();
    const livePlayer = players.find(p => p.status === 'AVAILABLE') || players[0];

    const bidding: LiveBiddingState = {
      currentPlayerId: livePlayer ? livePlayer.id : 1,
      currentBid: DEFAULT_SETTINGS.defaultReservePrice || 1000,
      selectedTeamId: teams[0] ? teams[0].id : null,
      isActive: false,
      bidHistory: [],
    };

    const newState: FullAuctionState = {
      settings: { ...DEFAULT_SETTINGS },
      teams,
      players,
      transactions,
      bidding,
      summary: this.calculateSummary(players, teams),
    };

    this.state = newState;
    this.saveToDisk();
    return this.state;
  }

  public createPreAuctionState(): FullAuctionState {
    const { teams, players, transactions } = buildFreshPreAuctionState();
    const firstAvailable = players.find(p => p.status === 'AVAILABLE') || players[0];

    const bidding: LiveBiddingState = {
      currentPlayerId: firstAvailable ? firstAvailable.id : 1,
      currentBid: DEFAULT_SETTINGS.defaultReservePrice || 1000,
      selectedTeamId: teams[0] ? teams[0].id : null,
      isActive: true,
      bidHistory: [],
    };

    const newState: FullAuctionState = {
      settings: { ...DEFAULT_SETTINGS },
      teams,
      players,
      transactions,
      bidding,
      summary: this.calculateSummary(players, teams),
    };

    this.state = newState;
    this.saveToDisk();
    return this.state;
  }

  private calculateSummary(players: Player[], teams: Team[]): DashboardSummary {
    const totalPlayers = players.length;
    const playersSold = players.filter(p => p.status === 'SOLD').length;
    const playersAvailable = players.filter(p => p.status === 'AVAILABLE').length;
    const playersUnsold = players.filter(p => p.status === 'UNSOLD').length;

    const auctionPointsSpent = players
      .filter(p => p.status === 'SOLD')
      .reduce((sum, p) => sum + (p.soldPrice || 0), 0);

    const totalCommitteeCash = teams.reduce((sum, t) => sum + (t.committeeCash || 0), 0);
    const auctionProgressPct = totalPlayers > 0 ? Math.round((playersSold / totalPlayers) * 100) : 0;
    const completedTeamsCount = teams.filter(t => t.totalPlayers >= (this.state?.settings?.maxSquadSize || 15)).length;

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

  public getState(): FullAuctionState {
    return this.state;
  }

  public getPlayer(playerId: number): Player | undefined {
    return this.state.players.find(p => p.id === playerId);
  }

  public getTeam(teamId: string): Team | undefined {
    return this.state.teams.find(t => t.id === teamId);
  }

  public getTeamSquad(teamId: string): {
    icons: Player[];
    auctionPlayers: Player[];
    total: Player[];
    villageCounts: Record<string, number>;
  } {
    const squad = this.state.players.filter(p => p.soldToTeamId === teamId);

    const villageCounts: Record<string, number> = {};
    squad.forEach(p => {
      const village = p.village || 'General';
      villageCounts[village] = (villageCounts[village] || 0) + 1;
    });

    return {
      icons: [],
      auctionPlayers: squad,
      total: squad,
      villageCounts,
    };
  }

  public recalculateAllTeams() {
    const settings = this.state.settings;

    this.state.teams = this.state.teams.map(team => {
      const squad = this.state.players.filter(p => p.soldToTeamId === team.id);
      const totalPointsSpent = squad.reduce((sum, p) => sum + p.soldPrice, 0);

      const effectiveBudget = (team.startingPoints || settings.startingPoints) + (settings.freePoints || 0);
      const pointsRemaining = effectiveBudget - totalPointsSpent;

      // Extra points penalty cash / charge
      const extraSpent = Math.max(0, totalPointsSpent - effectiveBudget);
      const committeeCash = extraSpent * (settings.extraPointsPenaltyRate || 1);

      const totalCount = squad.length;
      const remainingSlots = Math.max(0, settings.maxSquadSize - totalCount);

      // Safe max bid calculation
      const reserveNeed = remainingSlots > 1 ? (remainingSlots - 1) * settings.minBidIncrement : 0;
      const maxSafeBid = remainingSlots > 0 ? Math.max(0, pointsRemaining - reserveNeed) : 0;

      let status: Team['status'] = 'OK';
      if (totalCount > settings.maxSquadSize) {
        status = 'OVER 13 PLAYERS';
      } else if (pointsRemaining < 0) {
        status = 'OVER POINTS';
      } else if (totalCount === settings.maxSquadSize) {
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

    this.state.summary = this.calculateSummary(this.state.players, this.state.teams);
    this.saveToDisk();
  }

  public updateSettings(newSettings: Partial<TournamentSettings>): FullAuctionState {
    this.state.settings = {
      ...this.state.settings,
      ...newSettings,
    };
    this.recalculateAllTeams();
    this.saveToDisk();
    return this.state;
  }

  public addTeam(teamData: Partial<Team>): { success: boolean; message: string; team?: Team } {
    const name = (teamData.name || 'NEW TEAM').trim().toUpperCase();
    const id = teamData.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (this.state.teams.some(t => t.id === id)) {
      return { success: false, message: `A team with ID "${id}" already exists.` };
    }

    const shortCode = teamData.shortCode || name.slice(0, 3).toUpperCase();
    const color = teamData.color || '#3b82f6';
    const startingPoints = teamData.startingPoints || this.state.settings.startingPoints;
    const auctionBudget = teamData.auctionBudget || this.state.settings.auctionBudget;

    const newTeam: Team = {
      id,
      name,
      shortCode,
      color,
      badgeBg: '#e2e8f0',
      badgeText: '#1e293b',
      startingPoints,
      iconCost: 0,
      auctionBudget,
      totalPlayers: 0,
      iconPlayersCount: 0,
      auctionPlayersCount: 0,
      totalPointsSpent: 0,
      pointsRemaining: auctionBudget,
      maxSafeBid: auctionBudget,
      committeeCash: 0,
      status: 'OK',
    };

    this.state.teams.push(newTeam);
    this.recalculateAllTeams();
    this.saveToDisk();
    return { success: true, message: `Team ${name} added successfully.`, team: newTeam };
  }

  public updateTeam(teamId: string, updates: Partial<Team>): { success: boolean; message: string } {
    const team = this.getTeam(teamId);
    if (!team) return { success: false, message: 'Team not found' };

    if (updates.name) team.name = updates.name.trim().toUpperCase();
    if (updates.shortCode) team.shortCode = updates.shortCode.trim().toUpperCase();
    if (updates.color) team.color = updates.color;
    if (typeof updates.startingPoints === 'number') team.startingPoints = updates.startingPoints;
    if (typeof updates.auctionBudget === 'number') team.auctionBudget = updates.auctionBudget;

    this.recalculateAllTeams();
    this.saveToDisk();
    return { success: true, message: `Team ${team.name} updated successfully.` };
  }

  public deleteTeam(teamId: string): { success: boolean; message: string } {
    const team = this.getTeam(teamId);
    if (!team) return { success: false, message: 'Team not found' };

    // Unassign all players sold to this team
    this.state.players.forEach(p => {
      if (p.soldToTeamId === teamId) {
        p.status = 'AVAILABLE';
        p.soldToTeamId = null;
        p.soldPrice = 0;
        p.isIcon = false;
      }
    });

    this.state.transactions = this.state.transactions.filter(t => t.teamId !== teamId);
    this.state.teams = this.state.teams.filter(t => t.id !== teamId);

    if (this.state.bidding.selectedTeamId === teamId) {
      this.state.bidding.selectedTeamId = this.state.teams[0] ? this.state.teams[0].id : null;
    }

    this.recalculateAllTeams();
    this.saveToDisk();
    return { success: true, message: `Team ${team.name} deleted.` };
  }

  public validateSale(
    playerId: number,
    teamId: string,
    soldPrice: number
  ): {
    valid: boolean;
    error?: string;
    warning?: string;
    villageCount?: number;
    teamRemaining?: number;
    maxSafeBid?: number;
  } {
    const player = this.getPlayer(playerId);
    const team = this.getTeam(teamId);

    if (!player) return { valid: false, error: 'Player not found.' };
    if (!team) return { valid: false, error: 'Team not found.' };

    if (player.status === 'SOLD') {
      return { valid: false, error: `Player is already SOLD to ${player.soldToTeamId}.` };
    }

    const maxSquad = this.state.settings.maxSquadSize || 15;
    if (team.totalPlayers >= maxSquad) {
      return {
        valid: false,
        error: `Team ${team.name} already has ${team.totalPlayers} players (Max squad limit of ${maxSquad} reached).`,
      };
    }

    if (soldPrice <= 0) {
      return { valid: false, error: 'Winning bid must be greater than 0.' };
    }

    const squadInfo = this.getTeamSquad(teamId);
    const currentVillageCount = squadInfo.villageCounts[player.village] || 0;

    let warning: string | undefined;
    if (soldPrice > team.maxSafeBid && team.maxSafeBid > 0) {
      warning = `Bid (${soldPrice.toLocaleString()}) exceeds Safe Max Bid (${team.maxSafeBid.toLocaleString()}). Will trigger extra points cash penalty.`;
    }

    return {
      valid: true,
      warning,
      villageCount: currentVillageCount,
      teamRemaining: team.pointsRemaining,
      maxSafeBid: team.maxSafeBid,
    };
  }

  public sellPlayer(
    playerId: number,
    teamId: string,
    soldPrice: number,
    _adminOverride: boolean = false
  ): { success: boolean; message: string; state?: FullAuctionState } {
    const validation = this.validateSale(playerId, teamId, soldPrice);

    if (!validation.valid) {
      return { success: false, message: validation.error || 'Invalid sale' };
    }

    const player = this.getPlayer(playerId)!;
    const team = this.getTeam(teamId)!;

    player.status = 'SOLD';
    player.soldToTeamId = teamId;
    player.soldPrice = soldPrice;
    player.soldAt = new Date().toISOString();

    this.recalculateAllTeams();

    const updatedTeam = this.getTeam(teamId)!;
    const committeeCharge = updatedTeam.committeeCash;

    const tx: AuctionTransaction = {
      id: `tx-${Date.now()}-${playerId}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      auctionOrder: this.state.transactions.length + 1,
      playerId: player.id,
      playerName: player.name,
      village: player.village,
      role: player.role,
      teamId: team.id,
      teamName: team.name,
      soldPrice,
      committeeCharge,
      isIcon: false,
    };
    this.state.transactions.unshift(tx);

    // Auto-advance to next available player
    const nextPlayer = this.state.players.find(p => p.status === 'AVAILABLE');
    if (nextPlayer) {
      this.state.bidding.currentPlayerId = nextPlayer.id;
      this.state.bidding.currentBid = this.state.settings.defaultReservePrice || 1000;
      this.state.bidding.bidHistory = [];
    }

    this.saveToDisk();
    return {
      success: true,
      message: `Hammer down! Sold ${player.name} to ${team.name} for ${soldPrice.toLocaleString()} pts.`,
      state: this.state,
    };
  }

  public markUnsold(playerId: number): { success: boolean; state: FullAuctionState } {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, state: this.state };

    player.status = 'UNSOLD';
    player.soldToTeamId = null;
    player.soldPrice = 0;

    const nextPlayer = this.state.players.find(p => p.status === 'AVAILABLE');
    if (nextPlayer) {
      this.state.bidding.currentPlayerId = nextPlayer.id;
      this.state.bidding.currentBid = this.state.settings.defaultReservePrice || 1000;
    }

    this.recalculateAllTeams();
    this.saveToDisk();
    return { success: true, state: this.state };
  }

  public reopenPlayer(playerId: number): { success: boolean; message: string; state: FullAuctionState } {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, message: 'Player not found', state: this.state };

    player.status = 'AVAILABLE';
    player.soldToTeamId = null;
    player.soldPrice = 0;
    player.soldAt = undefined;

    this.state.transactions = this.state.transactions.filter(t => t.playerId !== playerId);

    this.state.bidding.currentPlayerId = playerId;
    this.state.bidding.currentBid = this.state.settings.defaultReservePrice || 1000;

    this.recalculateAllTeams();
    this.saveToDisk();
    return { success: true, message: `Player ${player.name} returned to the auction block!`, state: this.state };
  }

  public updateBidding(
    playerId: number,
    teamId: string | null,
    amount: number
  ): FullAuctionState {
    this.state.bidding.currentPlayerId = playerId;
    this.state.bidding.selectedTeamId = teamId;
    this.state.bidding.currentBid = amount;

    if (teamId) {
      this.state.bidding.bidHistory.push({
        teamId,
        amount,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
    }

    this.saveToDisk();
    return this.state;
  }

  public setCurrentPlayer(playerId: number): FullAuctionState {
    const player = this.getPlayer(playerId);
    if (player) {
      this.state.bidding.currentPlayerId = playerId;
      this.state.bidding.currentBid = player.soldPrice > 0 ? player.soldPrice : (this.state.settings.defaultReservePrice || 1000);
      this.state.bidding.bidHistory = [];
      this.saveToDisk();
    }
    return this.state;
  }

  public nextPlayer(): FullAuctionState {
    const currentIndex = this.state.players.findIndex(p => p.id === this.state.bidding.currentPlayerId);
    if (currentIndex >= 0 && currentIndex < this.state.players.length - 1) {
      return this.setCurrentPlayer(this.state.players[currentIndex + 1].id);
    }
    return this.state;
  }

  public prevPlayer(): FullAuctionState {
    const currentIndex = this.state.players.findIndex(p => p.id === this.state.bidding.currentPlayerId);
    if (currentIndex > 0) {
      return this.setCurrentPlayer(this.state.players[currentIndex - 1].id);
    }
    return this.state;
  }

  public addPlayer(newPlayerData: Partial<Player>): { success: boolean; message: string; player?: Player } {
    const nextId = Math.max(...this.state.players.map(p => p.id), 0) + 1;
    const player: Player = {
      id: nextId,
      code: `P${nextId.toString().padStart(3, '0')}`,
      name: (newPlayerData.name || 'NEW PLAYER').trim().toUpperCase(),
      village: newPlayerData.village || 'General',
      role: newPlayerData.role || 'All-Rounder',
      auctionOrder: this.state.players.length + 1,
      status: 'AVAILABLE',
      soldToTeamId: null,
      soldPrice: 0,
      isIcon: false,
    };

    this.state.players.push(player);
    this.recalculateAllTeams();
    this.saveToDisk();
    return { success: true, message: `Added ${player.name} (${player.code})`, player };
  }

  public updatePlayer(playerId: number, updates: Partial<Player>): { success: boolean; message: string } {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, message: 'Player not found' };

    if (updates.name) player.name = updates.name.trim().toUpperCase();
    if (updates.village) player.village = updates.village;
    if (updates.role) player.role = updates.role;
    if (typeof updates.auctionOrder === 'number') player.auctionOrder = updates.auctionOrder;
    if (updates.status) player.status = updates.status;

    this.recalculateAllTeams();
    this.saveToDisk();
    return { success: true, message: `Player ${player.name} updated.` };
  }

  public deletePlayer(playerId: number): { success: boolean; message: string } {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, message: 'Player not found' };

    this.state.players = this.state.players.filter(p => p.id !== playerId);
    this.state.transactions = this.state.transactions.filter(t => t.playerId !== playerId);

    if (this.state.bidding.currentPlayerId === playerId) {
      const fallback = this.state.players[0];
      if (fallback) {
        this.state.bidding.currentPlayerId = fallback.id;
      }
    }

    this.recalculateAllTeams();
    this.saveToDisk();
    return { success: true, message: `Player ${player.name} deleted.` };
  }

  public reset(mode: 'official' | 'pre-auction' | 'clear'): FullAuctionState {
    if (mode === 'clear') {
      // Clear all player transactions and set all players to available with 0 bids
      this.state.players.forEach(p => {
        p.status = 'AVAILABLE';
        p.soldToTeamId = null;
        p.soldPrice = 0;
        p.isIcon = false;
      });
      this.state.transactions = [];
      if (this.state.players[0]) {
        this.state.bidding.currentPlayerId = this.state.players[0].id;
        this.state.bidding.currentBid = this.state.settings.defaultReservePrice || 1000;
      }
      this.recalculateAllTeams();
      this.saveToDisk();
      return this.state;
    }

    if (mode === 'pre-auction') {
      return this.createPreAuctionState();
    } else {
      return this.createOfficialState();
    }
  }

  /**
   * Bulk CSV import for players
   */
  public importPlayersFromCSV(csvText: string, replaceExisting: boolean = false): { count: number; message: string } {
    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return { count: 0, message: 'CSV is empty' };

    // Inspect first line for header
    let startIndex = 0;
    const headerLine = lines[0].toLowerCase();
    if (headerLine.includes('name') || headerLine.includes('player')) {
      startIndex = 1;
    }

    const newPlayers: Array<{ name: string; village: string; role: any; status?: string }> = [];

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      // Split by comma ignoring commas inside quotes
      const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/^"|"$/g, '').trim());
      if (!parts[0]) continue;

      const name = parts[0];
      let village = 'General';
      let role = 'All-Rounder';

      if (parts[1]) {
        const p1 = parts[1];
        if (['batsman', 'bowler', 'all-rounder', 'wicket-keeper'].includes(p1.toLowerCase())) {
          role = p1;
          if (parts[2]) village = parts[2];
        } else {
          village = p1;
          if (parts[2]) role = parts[2];
        }
      }

      // Standardize role
      let standardRole: any = 'All-Rounder';
      const rLower = role.toLowerCase();
      if (rLower.includes('bat')) standardRole = 'Batsman';
      else if (rLower.includes('bowl')) standardRole = 'Bowler';
      else if (rLower.includes('wick') || rLower.includes('wk')) standardRole = 'Wicket-Keeper';
      else standardRole = 'All-Rounder';

      newPlayers.push({ name, village, role: standardRole });
    }

    if (replaceExisting) {
      this.state.players = [];
      this.state.transactions = [];
    }

    let count = 0;
    newPlayers.forEach(p => {
      this.addPlayer({
        name: p.name,
        village: p.village,
        role: p.role,
      });
      count++;
    });

    if (this.state.players[0]) {
      this.state.bidding.currentPlayerId = this.state.players[0].id;
      this.state.bidding.currentBid = this.state.settings.defaultReservePrice || 1000;
    }

    this.recalculateAllTeams();
    this.saveToDisk();
    return { count, message: `Successfully imported ${count} players.` };
  }

  public importPlayers(list: Array<{ id?: number; name: string; village?: string; role?: string }>): { count: number } {
    let count = 0;
    list.forEach(item => {
      if (item.name) {
        this.addPlayer({
          name: item.name,
          village: item.village || 'General',
          role: (item.role as any) || 'All-Rounder',
        });
        count++;
      }
    });
    return { count };
  }
}

export const db = new AuctionDatabase();
