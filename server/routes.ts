import express, { Request, Response } from 'express';
import { db } from './db';

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

// Reset auction state (official, pre-auction, or clear)
apiRouter.post('/reset', (req: Request, res: Response) => {
  const { mode } = req.body;
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
  const summary = state.summary;
  const isView = req.query.view === '1';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cricket League Auction - Full Report</title>
  <style>
    :root {
      --primary: #4f46e5;
      --slate-900: #0f172a;
      --slate-700: #334155;
      --slate-600: #475569;
      --slate-100: #f1f5f9;
      --slate-50: #f8fafc;
      --border: #e2e8f0;
      --emerald: #059669;
      --rose: #e11d48;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: var(--slate-900); padding: 24px; line-height: 1.5; }
    .container { max-width: 1200px; margin: 0 auto; background: #ffffff; border: 1px solid var(--border); border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border); padding-bottom: 20px; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .title h1 { font-size: 26px; font-weight: 800; color: var(--slate-900); letter-spacing: -0.5px; }
    .title p { font-size: 13px; color: var(--slate-600); margin-top: 4px; }
    .actions { display: flex; gap: 8px; }
    button { background: var(--slate-900); color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
    button:hover { opacity: 0.9; }
    button.secondary { background: var(--slate-100); color: var(--slate-900); border: 1px solid var(--border); }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .metric-card { background: var(--slate-50); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
    .metric-card span { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--slate-600); letter-spacing: 0.5px; }
    .metric-card h3 { font-size: 24px; font-weight: 800; margin-top: 6px; color: var(--slate-900); font-family: monospace; }
    .section-title { font-size: 18px; font-weight: 800; margin: 32px 0 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
    .search-box { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; width: 280px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th { background: var(--slate-100); text-align: left; padding: 10px 14px; font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--slate-700); border-bottom: 1px solid var(--border); }
    td { padding: 12px 14px; border-bottom: 1px solid var(--border); color: var(--slate-700); }
    tr:hover td { background: var(--slate-50); }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge-sold { background: #dcfce7; color: #166534; }
    .badge-unsold { background: #fee2e2; color: #991b1b; }
    .badge-avail { background: #e0f2fe; color: #075985; }
    .team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; margin-top: 16px; }
    .team-card { border: 1px solid var(--border); border-radius: 12px; padding: 16px; background: #ffffff; }
    .team-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .team-header h4 { font-size: 16px; font-weight: 800; }
    .team-stats { font-size: 12px; color: var(--slate-600); margin-bottom: 12px; line-height: 1.6; }
    .squad-list { font-size: 12px; border-top: 1px dashed var(--border); padding-top: 8px; }
    .squad-item { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f8fafc; }
    @media print {
      body { padding: 0; background: #fff; }
      .container { border: none; box-shadow: none; padding: 0; }
      .actions, .search-box { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">
        <h1>🏏 Cricket League Auction — Full Ledger & Squad Report</h1>
        <p>Generated on ${new Date().toLocaleString()} • Standalone Offline Archive</p>
      </div>
      <div class="actions">
        <button onclick="window.print()">🖨️ Print / Save PDF</button>
        <button class="secondary" onclick="exportJSON()">💾 Export JSON</button>
      </div>
    </div>

    <!-- Metrics -->
    <div class="metrics-grid">
      <div class="metric-card">
        <span>Total Registered</span>
        <h3>${summary.totalPlayers}</h3>
      </div>
      <div class="metric-card">
        <span>Sold Players</span>
        <h3 style="color: var(--emerald);">${summary.playersSold}</h3>
      </div>
      <div class="metric-card">
        <span>Unsold Players</span>
        <h3 style="color: var(--rose);">${summary.playersUnsold}</h3>
      </div>
      <div class="metric-card">
        <span>Total Points Spent</span>
        <h3>${summary.totalAuctionPointsSpent.toLocaleString()} pts</h3>
      </div>
      <div class="metric-card">
        <span>Committee Cash</span>
        <h3 style="color: var(--emerald);">₹${summary.totalCommitteeCash.toLocaleString()}</h3>
      </div>
    </div>

    <!-- Teams Summary -->
    <div class="section-title">
      <span>Franchise Squads (${state.teams.length} Teams)</span>
    </div>
    <div class="team-grid">
      ${state.teams
        .map(t => {
          const squad = state.players.filter(p => p.soldToTeamId === t.id);
          return `
        <div class="team-card">
          <div class="team-header">
            <h4>${t.name} (${t.shortCode})</h4>
            <span class="badge ${t.status === 'OK' ? 'badge-sold' : 'badge-unsold'}">${t.status}</span>
          </div>
          <div class="team-stats">
            <div><strong>Squad Size:</strong> ${squad.length} / ${state.settings.maxSquadSize}</div>
            <div><strong>Points Spent:</strong> ${t.totalPointsSpent.toLocaleString()} pts</div>
            <div><strong>Remaining:</strong> ${t.pointsRemaining.toLocaleString()} pts</div>
            ${t.committeeCash > 0 ? `<div><strong>Penalty Fee:</strong> ₹${t.committeeCash.toLocaleString()}</div>` : ''}
          </div>
          <div class="squad-list">
            <strong>Acquired Players:</strong>
            ${
              squad.length === 0
                ? '<div style="color:#94a3b8; padding: 4px 0;">No players purchased yet</div>'
                : squad
                    .map(
                      p => `
              <div class="squad-item">
                <span>${p.name} <small style="color:#64748b;">(${p.role})</small></span>
                <strong style="font-family:monospace;">${p.soldPrice} pts</strong>
              </div>
            `
                    )
                    .join('')
            }
          </div>
        </div>
        `;
        })
        .join('')}
    </div>

    <!-- Auction Ledger -->
    <div class="section-title">
      <span>Auction Hammer Ledger (${state.transactions.length} Transactions)</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>Order</th>
          <th>Time</th>
          <th>Player Name</th>
          <th>Role</th>
          <th>Winning Team</th>
          <th>Hammer Price</th>
          <th>Fee (INR)</th>
        </tr>
      </thead>
      <tbody>
        ${
          state.transactions.length === 0
            ? '<tr><td colspan="7" style="text-align:center; padding: 20px;">No auction transactions recorded yet</td></tr>'
            : state.transactions
                .map(
                  tx => `
          <tr>
            <td>#${tx.auctionOrder}</td>
            <td>${tx.timestamp}</td>
            <td><strong>${tx.playerName}</strong></td>
            <td>${tx.role}</td>
            <td><strong>${tx.teamName}</strong></td>
            <td style="font-family: monospace; font-weight: bold; color: var(--primary);">${tx.soldPrice.toLocaleString()} pts</td>
            <td>${tx.committeeCharge > 0 ? `₹${tx.committeeCharge.toLocaleString()}` : '—'}</td>
          </tr>
        `
                )
                .join('')
        }
      </tbody>
    </table>

    <!-- Complete Player Roster -->
    <div class="section-title">
      <span>Player Master Registry (${state.players.length} Players)</span>
      <input type="text" id="searchInput" class="search-box" placeholder="🔍 Search player, role, or team..." oninput="filterPlayers()">
    </div>
    <table id="playersTable">
      <thead>
        <tr>
          <th>Code</th>
          <th>Player Name</th>
          <th>Role</th>
          <th>Status</th>
          <th>Allocated Team</th>
          <th>Sold Price</th>
        </tr>
      </thead>
      <tbody>
        ${state.players
          .map(p => {
            const team = p.soldToTeamId ? state.teams.find(t => t.id === p.soldToTeamId)?.name : '—';
            const badgeClass = p.status === 'SOLD' ? 'badge-sold' : p.status === 'UNSOLD' ? 'badge-unsold' : 'badge-avail';
            return `
          <tr class="player-row" data-search="${p.code.toLowerCase()} ${p.name.toLowerCase()} ${p.role.toLowerCase()} ${team.toLowerCase()}">
            <td><code>${p.code}</code></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.role}</td>
            <td><span class="badge ${badgeClass}">${p.status}</span></td>
            <td><strong>${team}</strong></td>
            <td style="font-family: monospace; font-weight: bold;">${p.soldPrice > 0 ? `${p.soldPrice.toLocaleString()} pts` : '—'}</td>
          </tr>
          `;
          })
          .join('')}
      </tbody>
    </table>
  </div>

  <script>
    const fullState = ${JSON.stringify(state)};
    function filterPlayers() {
      const q = document.getElementById('searchInput').value.toLowerCase();
      const rows = document.querySelectorAll('.player-row');
      rows.forEach(r => {
        const text = r.getAttribute('data-search') || '';
        r.style.display = text.includes(q) ? '' : 'none';
      });
    }

    function exportJSON() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullState, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "cricket_auction_backup.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (!isView) {
    res.setHeader('Content-Disposition', 'attachment; filename="cricket_auction_report.html"');
  }
  return res.send(html);
});

// JSON Backup Export
apiRouter.get('/export/json', (req: Request, res: Response) => {
  const state = db.getState();
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="cricket_auction_backup.json"');
  return res.send(JSON.stringify(state, null, 2));
});
