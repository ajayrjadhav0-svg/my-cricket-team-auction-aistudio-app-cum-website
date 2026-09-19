import express, { Request, Response } from 'express';
import { db } from './db';
import { generateStandaloneAuctionHTML } from './htmlGenerator';

export const apiRouter = express.Router();

// GET full synchronized auction state
apiRouter.get('/state', (req: Request, res: Response) => {
  try {
    const state = db.getState();
    res.json(state);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET teams
apiRouter.get('/teams', (req: Request, res: Response) => {
  res.json(db.getState().teams);
});

// GET team squad
apiRouter.get('/teams/:id/squad', (req: Request, res: Response) => {
  const squad = db.getTeamSquad(req.params.id);
  res.json(squad);
});

// POST add a new team (Admin)
apiRouter.post('/teams', (req: Request, res: Response) => {
  const result = db.addTeam(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  res.json(result);
});

// PUT update team (Admin)
apiRouter.put('/teams/:id', (req: Request, res: Response) => {
  const result = db.updateTeam(req.params.id, req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  res.json(result);
});

// DELETE team (Admin)
apiRouter.delete('/teams/:id', (req: Request, res: Response) => {
  const result = db.deleteTeam(req.params.id);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  res.json(result);
});

// POST update tournament settings (Admin)
apiRouter.post('/settings', (req: Request, res: Response) => {
  try {
    const updatedState = db.updateSettings(req.body);
    res.json({ message: 'Settings updated successfully', state: updatedState });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET players with search/filtering
apiRouter.get('/players', (req: Request, res: Response) => {
  const { search, role, status } = req.query;
  let players = db.getState().players;

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    players = players.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q)
    );
  }

  if (role && typeof role === 'string' && role !== 'ALL') {
    players = players.filter(p => p.role.toLowerCase() === role.toLowerCase());
  }

  if (status && typeof status === 'string' && status !== 'ALL') {
    players = players.filter(p => p.status.toLowerCase() === status.toLowerCase());
  }

  res.json(players);
});

// POST update live bid
apiRouter.post('/auction/bid', (req: Request, res: Response) => {
  const { playerId, teamId, amount } = req.body;
  if (!playerId || typeof amount !== 'number') {
    return res.status(400).json({ error: 'playerId and amount are required' });
  }

  const updatedState = db.updateBidding(Number(playerId), teamId || null, amount);
  res.json(updatedState);
});

// POST validate sale before confirming
apiRouter.post('/auction/validate', (req: Request, res: Response) => {
  const { playerId, teamId, price } = req.body;
  if (!playerId || !teamId || typeof price !== 'number') {
    return res.status(400).json({ error: 'playerId, teamId, and price are required' });
  }

  const validation = db.validateSale(Number(playerId), teamId, price);
  res.json(validation);
});

// POST sell player
apiRouter.post('/auction/sell', (req: Request, res: Response) => {
  const { playerId, teamId, price, adminOverride } = req.body;
  if (!playerId || !teamId || typeof price !== 'number') {
    return res.status(400).json({ error: 'playerId, teamId, and price are required' });
  }

  const result = db.sellPlayer(Number(playerId), teamId, price, Boolean(adminOverride));
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  res.json({ message: result.message, state: result.state });
});

// POST mark unsold
apiRouter.post('/auction/unsold', (req: Request, res: Response) => {
  const { playerId } = req.body;
  if (!playerId) {
    return res.status(400).json({ error: 'playerId is required' });
  }

  const result = db.markUnsold(Number(playerId));
  res.json(result);
});

// POST reopen sold or unsold player
apiRouter.post('/auction/reopen', (req: Request, res: Response) => {
  const { playerId } = req.body;
  if (!playerId) {
    return res.status(400).json({ error: 'playerId is required' });
  }

  const result = db.reopenPlayer(Number(playerId));
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  res.json(result);
});

// POST navigate auction player (next / prev / jump)
apiRouter.post('/auction/navigate', (req: Request, res: Response) => {
  const { direction, playerId } = req.body;

  if (direction === 'next') {
    return res.json(db.nextPlayer());
  }
  if (direction === 'prev') {
    return res.json(db.prevPlayer());
  }
  if (playerId) {
    return res.json(db.setCurrentPlayer(Number(playerId)));
  }

  res.status(400).json({ error: 'Invalid navigation parameters' });
});

// POST select specific player for auction (Admin feature)
apiRouter.post('/auction/select-player', (req: Request, res: Response) => {
  const { playerId } = req.body;
  if (!playerId) {
    return res.status(400).json({ error: 'playerId is required' });
  }
  const state = db.setCurrentPlayer(Number(playerId));
  res.json({ message: `Player #${playerId} selected for auction`, state });
});

// CRUD for Players
apiRouter.post('/players', (req: Request, res: Response) => {
  const result = db.addPlayer(req.body);
  res.json(result);
});

apiRouter.put('/players/:id', (req: Request, res: Response) => {
  const result = db.updatePlayer(Number(req.params.id), req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  res.json(result);
});

apiRouter.delete('/players/:id', (req: Request, res: Response) => {
  const result = db.deletePlayer(Number(req.params.id));
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  res.json(result);
});

// Erase / Clear all players (Admin)
apiRouter.post('/players/clear', (req: Request, res: Response) => {
  const result = db.clearAllPlayers();
  res.json(result);
});

apiRouter.delete('/players', (req: Request, res: Response) => {
  const result = db.clearAllPlayers();
  res.json(result);
});

// Reset auction state (official, pre-auction, clear, or clear-players)
apiRouter.post('/reset', (req: Request, res: Response) => {
  const { mode } = req.body;
  if (mode === 'clear-players') {
    const result = db.clearAllPlayers();
    return res.json({ message: 'All players cleared', state: result.state });
  }
  const targetMode = mode === 'clear' ? 'clear' : mode === 'official' ? 'official' : 'pre-auction';
  const newState = db.reset(targetMode as any);
  res.json({ message: `Auction reset to ${targetMode} mode`, state: newState });
});

// Bulk CSV Import (Players)
apiRouter.post('/import/csv', (req: Request, res: Response) => {
  const { csvText, replaceExisting } = req.body;
  if (!csvText || typeof csvText !== 'string') {
    return res.status(400).json({ error: 'csvText is required' });
  }
  const result = db.importPlayersFromCSV(csvText, Boolean(replaceExisting));
  res.json({ ...result, state: db.getState() });
});

// Import players legacy
apiRouter.post('/import', (req: Request, res: Response) => {
  const { players } = req.body;
  if (!Array.isArray(players)) {
    return res.status(400).json({ error: 'players array is required' });
  }
  const result = db.importPlayers(players);
  res.json({ message: `Imported ${result.count} players`, state: db.getState() });
});

// Export CSV & Data
apiRouter.get('/export/csv', (req: Request, res: Response) => {
  const { type } = req.query;
  const state = db.getState();

  if (type === 'players_registration' || type === 'players_simple' || type === 'players_basic') {
    const headers = 'SR no,name,role,village\n';
    const rows = state.players
      .map((p, idx) => {
        const sr = p.srNo || idx + 1;
        const village = (p.village || '').replace(/"/g, '""');
        const name = p.name.replace(/"/g, '""');
        return `${sr},"${name}","${p.role}","${village}"`;
      })
      .join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="players_registration_list.csv"');
    return res.send('\uFEFF' + headers + rows);
  }

  if (type === 'history') {
    const headers = 'Time,Auction Order,Player ID,Player Name,Role,Purchased By Team,Sold Price (Points),Penalty Charge (INR)\n';
    const rows = state.transactions
      .map(
        t =>
          `"${t.timestamp}",${t.auctionOrder},"P${t.playerId.toString().padStart(3, '0')}","${t.playerName}","${t.role}","${t.teamName}",${t.soldPrice},${t.committeeCharge}`
      )
      .join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="cricket_auction_history.csv"');
    return res.send(headers + rows);
  }

  if (type === 'squads') {
    const headers = 'Team Name,Short Code,Squad Count,Points Spent,Points Remaining,Player Name,Role,Sold Price (Points)\n';
    const lines: string[] = [];
    state.teams.forEach(team => {
      const squad = state.players.filter(p => p.soldToTeamId === team.id);
      if (squad.length === 0) {
        lines.push(`"${team.name}","${team.shortCode}",0,0,${team.pointsRemaining},"NO PLAYERS YET","",""`);
      } else {
        squad.forEach(p => {
          lines.push(`"${team.name}","${team.shortCode}",${squad.length},${team.totalPointsSpent},${team.pointsRemaining},"${p.name}","${p.role}",${p.soldPrice}`);
        });
      }
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="cricket_team_squads.csv"');
    return res.send(headers + lines.join('\n'));
  }

  // Default export: All players with allocation
  const headers = 'Player ID,Code,Player Name,Role,Status,Team,Sold Price (Points)\n';
  const rows = state.players
    .map(p => {
      const team = p.soldToTeamId ? state.teams.find(t => t.id === p.soldToTeamId)?.name : 'UNSOLD/AVAILABLE';
      return `${p.id},"${p.code}","${p.name}","${p.role}","${p.status}","${team}",${p.soldPrice}`;
    })
    .join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="cricket_auction_players.csv"');
  res.send(headers + rows);
});

// Standalone Single-File HTML Export (can be opened offline anywhere)
apiRouter.get('/export/html', (req: Request, res: Response) => {
  const state = db.getState();
  const isView = req.query.view === '1';
  const html = generateStandaloneAuctionHTML(state);

  const rawHtmlFilename = (req.query.filename as string) || 'myauctionkpl';
  const htmlFilename = rawHtmlFilename.endsWith('.html') ? rawHtmlFilename : `${rawHtmlFilename}.html`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (!isView) {
    res.setHeader('Content-Disposition', `attachment; filename="${htmlFilename}"`);
  }
  return res.send(html);
});

// Direct export for myauctionkpl.html
apiRouter.get('/export/myauctionkpl.html', (req: Request, res: Response) => {
  const state = db.getState();
  const html = generateStandaloneAuctionHTML(state);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="myauctionkpl.html"');
  return res.send(html);
});

// Save current auction database on server with requested file name (e.g. myauctionkpl.json)
apiRouter.post('/save-file', (req: Request, res: Response) => {
  try {
    const rawFileName = req.body?.fileName || req.body?.filename || 'myauctionkpl';
    const savedName = db.saveCustomFile(rawFileName);
    return res.json({
      success: true,
      fileName: savedName,
      message: `Auction database saved as ${savedName} on server!`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to save file' });
  }
});

// JSON Backup Export with filename query or default to myauctionkpl.json
apiRouter.get('/export/json', (req: Request, res: Response) => {
  const state = db.getState();
  const rawFilename = (req.query.filename as string) || 'myauctionkpl';
  const filename = rawFilename.endsWith('.json') ? rawFilename : `${rawFilename}.json`;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.send(JSON.stringify(state, null, 2));
});

// Direct export for myauctionkpl.json
apiRouter.get('/export/myauctionkpl', (req: Request, res: Response) => {
  const state = db.getState();
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="myauctionkpl.json"');
  return res.send(JSON.stringify(state, null, 2));
});
