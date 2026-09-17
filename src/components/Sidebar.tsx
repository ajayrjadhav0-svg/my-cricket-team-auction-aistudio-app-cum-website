import React, { useState } from 'react';
import {
  LayoutDashboard,
  Gavel,
  Users,
  Shield,
  Trophy,
  History,
  Settings,
  Share2,
  Check,
  Eye,
  X,
} from 'lucide-react';
import { ActiveNav } from '../types';
import { useAuction } from '../context/AuctionContext';
import { formatINR, formatPoints } from '../utils/formatters';

interface SidebarProps {
  activeNav: ActiveNav;
  onSelectNav: (nav: ActiveNav) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onSelectNav,
  isOpen,
  onClose,
}) => {
  const { state, role, setRole, getViewerShareUrl, showNotification } = useAuction();
  const summary = state?.summary;
  const [copiedLink, setCopiedLink] = useState(false);

  const navItems: { id: ActiveNav; label: string; icon: React.ReactNode; badge?: string; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'DASHBOARD', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'live-auction', label: 'LIVE AUCTION', icon: <Gavel className="w-5 h-5" />, badge: 'LIVE' },
    { id: 'admin', label: 'ADMIN PANEL', icon: <Shield className="w-5 h-5 text-indigo-600" />, badge: 'ADMIN' },
    { id: 'players', label: 'PLAYERS', icon: <Users className="w-5 h-5" /> },
    { id: 'teams', label: 'TEAMS', icon: <Shield className="w-5 h-5" /> },
    { id: 'team-squads', label: 'TEAM SQUADS', icon: <Trophy className="w-5 h-5" /> },
    { id: 'auction-history', label: 'AUCTION HISTORY', icon: <History className="w-5 h-5" /> },
    { id: 'settings', label: 'SETTINGS', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleCopyViewerLink = () => {
    const link = getViewerShareUrl();
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    showNotification('success', 'Viewer share link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Tournament Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-black font-['Outfit'] text-xl">
              🏏
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-['Outfit'] font-extrabold text-base text-slate-900 tracking-tight leading-tight">
                  {state?.settings?.tournamentName || 'CRICKET LEAGUE'}
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Live Auction Command</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Sync Status Bar & Role Pill */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-700 font-semibold">
              {role === 'admin' ? 'Admin Active' : 'Live Spectator'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-indigo-600 font-bold">
            {summary ? `${summary.playersSold}/${summary.totalPlayers} Sold` : 'Syncing...'}
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            const isAdminTab = item.id === 'admin';

            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => {
                  onSelectNav(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-['Outfit'] font-semibold text-xs sm:text-sm transition-all ${
                  isActive
                    ? isAdminTab
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : 'bg-slate-900 text-white shadow-sm font-bold'
                    : isAdminTab
                    ? 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : isAdminTab ? 'text-indigo-600' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'LIVE'
                        ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Share Viewer Link Card */}
        <div className="p-3 mx-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
              Live Spectators
            </span>
            <span className="text-[10px] font-bold text-slate-500">Real-time</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Share link with viewers to watch live squads and bidding updates.
          </p>
          <button
            onClick={handleCopyViewerLink}
            className="w-full py-1.5 px-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-all"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Viewer Link'}</span>
          </button>
        </div>

        {/* Tournament Mini Metrics Footer */}
        {summary && (
          <div className="p-3.5 m-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Total Spent</span>
              <span className="font-mono font-bold text-slate-900">
                {formatPoints(summary.totalAuctionPointsSpent)} pts
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Committee Cash</span>
              <span className="font-mono font-bold text-emerald-600">
                {formatINR(summary.totalCommitteeCash)}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${summary.auctionProgressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Progress</span>
              <span className="font-bold text-slate-700">{summary.auctionProgressPct}%</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
