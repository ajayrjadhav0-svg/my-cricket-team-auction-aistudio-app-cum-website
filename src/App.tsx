import React, { useState } from 'react';
import { ActiveNav } from './types';
import { AuctionProvider, useAuction } from './context/AuctionContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { LiveAuctionView } from './components/LiveAuctionView';
import { PlayersView } from './components/PlayersView';
import { TeamsView } from './components/TeamsView';
import { TeamSquadsView } from './components/TeamSquadsView';
import { AuctionHistoryView } from './components/AuctionHistoryView';
import { SettingsView } from './components/SettingsView';
import { AdminPanel } from './components/AdminPanel';
import { AdminAccessGate } from './components/admin/AdminAccessGate';
import {
  LayoutDashboard,
  Gavel,
  Users,
  Shield,
  Trophy,
  History,
  Settings,
} from 'lucide-react';

function AuctionAppContent() {
  const { state, role } = useAuction();
  const [activeNav, setActiveNav] = useState<ActiveNav>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedSquadTeamId, setSelectedSquadTeamId] = useState<string>('');

  const defaultTeamId = state?.teams[0]?.id || 'mumbai-titans';

  const handleSelectTeamForSquad = (teamId: string) => {
    setSelectedSquadTeamId(teamId);
    setActiveNav('team-squads');
  };

  const handleNavigateToAuction = () => {
    setActiveNav('live-auction');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-['Inter'] selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Sidebar (Desktop persistent + Mobile drawer) */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Column */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Sticky Header */}
        <Header
          activeNav={activeNav}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onSelectNav={setActiveNav}
        />

        {/* View Router */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 pb-20 lg:pb-8 max-w-7xl w-full mx-auto">
          {activeNav === 'dashboard' && (
            <DashboardView
              onNavigate={setActiveNav}
              onSelectTeamForSquad={handleSelectTeamForSquad}
            />
          )}

          {activeNav === 'live-auction' && <LiveAuctionView />}

          {activeNav === 'admin' && (
            role === 'admin' ? (
              <AdminPanel onSelectNav={setActiveNav} />
            ) : (
              <AdminAccessGate
                onUnlockSuccess={() => setActiveNav('admin')}
                onReturnToDashboard={() => setActiveNav('dashboard')}
              />
            )
          )}

          {activeNav === 'players' && (
            <PlayersView onNavigateToAuction={handleNavigateToAuction} />
          )}

          {activeNav === 'teams' && (
            <TeamsView
              onNavigate={setActiveNav}
              onSelectTeamForSquad={handleSelectTeamForSquad}
            />
          )}

          {activeNav === 'team-squads' && (
            <TeamSquadsView initialTeamId={selectedSquadTeamId || defaultTeamId} />
          )}

          {activeNav === 'auction-history' && <AuctionHistoryView />}

          {activeNav === 'settings' && <SettingsView onSelectNav={setActiveNav} />}
        </main>

        {/* Mobile Bottom Quick Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden flex items-center justify-around py-2 px-1 shadow-md">
          <button
            onClick={() => setActiveNav('dashboard')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-['Outfit'] font-bold ${
              activeNav === 'dashboard'
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveNav('live-auction')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-['Outfit'] font-bold ${
              activeNav === 'live-auction'
                ? 'text-indigo-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className="relative">
              <Gavel className="w-4 h-4 text-amber-500" />
              <span className="absolute -top-1 -right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            </div>
            <span>Auction</span>
          </button>

          <button
            onClick={() => setActiveNav('players')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-['Outfit'] font-bold ${
              activeNav === 'players'
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Players</span>
          </button>

          <button
            onClick={() => setActiveNav('team-squads')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-['Outfit'] font-bold ${
              activeNav === 'team-squads'
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Squads</span>
          </button>

          <button
            onClick={() => setActiveNav('auction-history')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-['Outfit'] font-bold ${
              activeNav === 'auction-history'
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </button>

          <button
            onClick={() => setActiveNav('settings')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-['Outfit'] font-bold ${
              activeNav === 'settings'
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuctionProvider>
      <AuctionAppContent />
    </AuctionProvider>
  );
}
