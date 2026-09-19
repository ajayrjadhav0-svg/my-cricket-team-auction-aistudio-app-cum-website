import React, { useState } from 'react';
import { Menu, Gavel, RefreshCw, Shield, Share2, Check, Eye, Settings, FileCode, Download } from 'lucide-react';
import { ActiveNav } from '../types';
import { useAuction } from '../context/AuctionContext';
import { formatINR } from '../utils/formatters';
import { AdminLoginModal } from './admin/AdminLoginModal';
import { generateClientStandaloneHTML } from '../utils/generateHTMLReport';

interface HeaderProps {
  activeNav: ActiveNav;
  onToggleSidebar: () => void;
  onSelectNav: (nav: ActiveNav) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeNav,
  onToggleSidebar,
  onSelectNav,
}) => {
  const { state, refreshState, role, logoutAdmin, getViewerShareUrl, notification, clearNotification, showNotification } = useAuction();
  const summary = state?.summary;
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);


  const navTitles: Record<ActiveNav, string> = {
    dashboard: 'AUCTION DASHBOARD',
    'live-auction': 'LIVE AUCTION COMMAND DESK',
    register: 'PLAYER SELF-REGISTRATION PORTAL',
    players: 'PLAYER MANAGEMENT ROSTER',
    teams: 'FRANCHISE TEAMS & PURSE',
    'team-squads': 'TEAM SQUADS & ROSTERS',
    'auction-history': 'LIVE AUCTION LEDGER & TRANSACTIONS',
    admin: 'ADMIN CONTROL PANEL',
    settings: 'TOURNAMENT SETTINGS & RULES',
  };

  const handleCopyLink = () => {
    const link = getViewerShareUrl();
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    showNotification('success', 'Viewer share link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleDownloadHtmlFile = () => {
    try {
      if (state) {
        const html = generateClientStandaloneHTML(state);
        const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'myauctionkpl.html');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showNotification('success', 'Downloaded myauctionkpl.html standalone offline report!');
        return;
      }
    } catch (e) {
      console.warn('Fallback to server HTML export', e);
    }
    window.location.href = '/api/export/myauctionkpl.html';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile menu toggle + Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          id="btn-sidebar-toggle"
          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-950 lg:hidden border border-slate-200"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-['Outfit'] font-black text-indigo-600 uppercase tracking-wider">
              {state?.settings?.tournamentName || 'MY CRICKET LEAGUE AUCTION'}
            </span>
            <span className="text-slate-300">•</span>
            <h2 className="font-['Outfit'] font-extrabold text-base md:text-lg text-slate-900 tracking-tight truncate">
              {navTitles[activeNav]}
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            {state?.teams?.length || 0} Teams • {state?.players?.length || 0} Registered Players • {formatINR(state?.settings?.startingPoints || 100000)} Points Purse
          </p>
        </div>
      </div>

      {/* Right: Quick Metrics & Actions */}
      <div className="flex items-center gap-2">
        {/* Viewer vs Admin Mode Indicator */}
        {role === 'admin' ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-bold text-indigo-700 font-['Outfit']">Admin Mode</span>
            </div>
            <button
              onClick={() => logoutAdmin()}
              title="Exit Admin to Spectator View"
              className="text-[11px] text-slate-500 hover:text-rose-600 font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 hover:border-rose-300 transition-colors"
            >
              Exit
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600">
            <Eye className="w-3.5 h-3.5 text-sky-600" />
            <span className="font-semibold text-slate-700 hidden sm:inline">Spectator</span>
          </div>
        )}

        {/* Share Viewer Link Button */}
        <button
          id="btn-header-share-link"
          onClick={handleCopyLink}
          title="Copy Spectator Viewer Link to Share"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
          <span className="hidden md:inline">{copiedLink ? 'Copied' : 'Share Link'}</span>
        </button>


        {/* Committee Cash Tracker */}
        {summary && summary.totalCommitteeCash > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
            <span className="text-slate-500 font-medium">Extra Cash:</span>
            <span className="font-mono font-bold text-emerald-700">
              {formatINR(summary.totalCommitteeCash)}
            </span>
          </div>
        )}

        {/* Sync Button */}
        <button
          id="btn-header-sync"
          onClick={() => refreshState()}
          title="Refresh State from Database"
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 hover:border-slate-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-emerald-600" />
        </button>

        {/* Download Standalone HTML File Button */}
        <button
          id="btn-header-html-report"
          onClick={handleDownloadHtmlFile}
          title="Download Complete Standalone HTML Report (myauctionkpl.html)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-['Outfit'] font-bold text-xs shadow-2xs active:scale-95 transition-all"
        >
          <FileCode className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">HTML Report</span>
          <Download className="w-3 h-3 text-indigo-500 hidden md:inline" />
        </button>

        {/* Live Auction Quick Jump */}
        {activeNav !== 'live-auction' && (
          <button
            id="btn-header-live-auction"
            onClick={() => onSelectNav('live-auction')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-['Outfit'] font-bold text-xs shadow-xs active:scale-95 transition-all"
          >
            <Gavel className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">LIVE AUCTION</span>
          </button>
        )}

        {/* Top-Right Settings / Admin Portal */}
        <button
          id="btn-header-admin-portal"
          onClick={() => {
            if (role === 'admin') {
              onSelectNav('admin');
            } else {
              setIsLoginModalOpen(true);
            }
          }}
          title={role === 'admin' ? 'Admin Panel Controls' : 'Settings & Admin Login'}
          className={`p-2 rounded-xl border flex items-center gap-1.5 transition-all ${
            role === 'admin'
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-2xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-xs font-bold font-['Outfit'] hidden lg:inline">
            {role === 'admin' ? 'Admin Panel' : 'Settings'}
          </span>
        </button>
      </div>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => onSelectNav('admin')}
      />

      {/* Notification Banner Overlay */}
      {notification && (
        <div
          onClick={clearNotification}
          className={`fixed top-16 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-bounce cursor-pointer ${
            notification.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : notification.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <span>{notification.message}</span>
        </div>
      )}
    </header>
  );
};
