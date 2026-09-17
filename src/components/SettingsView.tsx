import React, { useState } from 'react';
import {
  Settings,
  Shield,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Database,
  Sliders,
  Share2,
  Eye,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useAuction } from '../context/AuctionContext';
import { ActiveNav } from '../types';
import { formatINR, formatPoints } from '../utils/formatters';
import { AdminLoginModal } from './admin/AdminLoginModal';

interface SettingsViewProps {
  onSelectNav?: (nav: ActiveNav) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onSelectNav }) => {
  const { state, role, logoutAdmin, resetAuction, getViewerShareUrl, showNotification } = useAuction();

  const [confirmMode, setConfirmMode] = useState<'official' | 'pre-auction' | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  if (!state) {
    return <div className="p-8 text-slate-400">Loading settings...</div>;
  }

  const { settings, summary, teams, players } = state;

  const handleExecuteReset = async () => {
    if (!confirmMode) return;
    await resetAuction(confirmMode);
    setConfirmMode(null);
  };

  const handleCopyLink = () => {
    const link = getViewerShareUrl();
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    showNotification('success', 'Viewer share link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Outfit'] font-black text-lg md:text-xl text-slate-900 flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-indigo-600" />
            <span>TOURNAMENT RULES & SYSTEM OVERVIEW</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time auction configuration, live spectator link generator, and system status.
          </p>
        </div>

        {/* Share Link Button */}
        <button
          onClick={handleCopyLink}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-['Outfit'] font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all self-start sm:self-auto"
        >
          <Share2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>{copiedLink ? 'Link Copied!' : 'Copy Viewer Link'}</span>
        </button>
      </div>

      {/* RULES SPECIFICATION CARD */}
      <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-['Outfit'] font-bold text-sm text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>ACTIVE TOURNAMENT RULES & PARAMETERS</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            {role === 'admin' ? 'Admin Access: Modify in Admin Panel' : 'Spectator View'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 block font-semibold uppercase">Tournament Title</span>
            <span className="font-['Outfit'] font-bold text-base text-slate-900 mt-1 block">
              {settings.tournamentName}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 block font-semibold uppercase">Total Starting Purse</span>
            <span className="font-mono font-bold text-base text-indigo-600 mt-1 block">
              {formatPoints(settings.startingPoints)} pts
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 block font-semibold uppercase">Squad Size Limit</span>
            <span className="font-mono font-bold text-base text-slate-900 mt-1 block">
              {settings.maxSquadSize} Players Max
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 block font-semibold uppercase">Free Points Threshold</span>
            <span className="font-mono font-bold text-base text-emerald-600 mt-1 block">
              {formatPoints(settings.freePoints || 70000)} pts
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 block font-semibold uppercase">Over-Limit Fee / Penalty Rate</span>
            <span className="font-['Outfit'] font-bold text-sm text-rose-600 mt-1 block">
              ₹{settings.extraPointsPenaltyRate || 1} per point over free budget
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 block font-semibold uppercase">Village Limit</span>
            <span className="font-mono font-bold text-base text-emerald-600 mt-1 block">
              No Limit (Open)
            </span>
          </div>
        </div>
      </div>

      {/* HIDDEN ADMIN ACCESS SECTION (Only in Settings) */}
      {role === 'admin' ? (
        <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-['Outfit'] font-black text-base md:text-lg text-white">
                  ADMINISTRATOR CONTROL PANEL
                </h3>
                <p className="text-xs text-indigo-200">
                  Full auction management, team purses, roster editing, and live floor control.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onSelectNav && (
                <button
                  onClick={() => onSelectNav('admin')}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-900 font-['Outfit'] font-extrabold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <span>OPEN ADMIN PANEL</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => logoutAdmin()}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              >
                Exit Admin
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-700" />
                <h3 className="font-['Outfit'] font-bold text-sm text-slate-900">
                  Administrator Access
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Admin panel is private and hidden from public viewers. Enter your auction admin passcode to access administrative controls.
              </p>
            </div>

            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-['Outfit'] font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all self-start sm:self-auto shrink-0"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Unlock Admin Panel</span>
            </button>
          </div>
        </div>
      )}

      {/* SPECTATOR / VIEWER MODE INFO CARD */}
      <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-sky-600" />
          <h3 className="font-['Outfit'] font-bold text-sm text-slate-900">
            Spectator & Viewer Real-Time Broadcasting
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Anyone with the spectator link can watch the auction live as bids are called. The viewer view continuously synchronizes live floor bids, sold players, team squad cards, and purse remaining calculations with zero configuration required.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Copy Live Spectator URL</span>
          </button>
        </div>
      </div>

      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          if (onSelectNav) onSelectNav('admin');
        }}
      />

      {/* AUCTION STATE & DATABASE RESET (Admin Only) */}
      {role === 'admin' && (
        <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-['Outfit'] font-bold text-sm text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <span>AUCTION STATE & RESET CONTROLS</span>
          </h3>
          <p className="text-xs text-slate-600">
            Reset the auction state for a fresh live bidding draft or restore default sample data:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Reset to Pre-Auction */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-['Outfit'] font-bold text-sm text-amber-700">
                  Fresh Pre-Auction Draft
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Keeps all registered players and franchises, but resets all auction prices to 0, sets status to AVAILABLE, and restores full team budgets.
                </p>
              </div>
              <button
                onClick={() => setConfirmMode('pre-auction')}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-['Outfit'] font-bold text-xs shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Fresh Pre-Auction</span>
              </button>
            </div>

            {/* Load Official Demo Roster */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-['Outfit'] font-bold text-sm text-indigo-700">
                  Sample Completed Season
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Loads a populated sample state with completed bidding transactions for testing charts, squads, and reporting.
                </p>
              </div>
              <button
                onClick={() => setConfirmMode('official')}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-['Outfit'] font-bold text-xs shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Load Sample Season</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmMode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-['Outfit'] font-black text-rose-600 text-lg">
              Confirm Database Reset
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to reset the auction to{' '}
              <strong className="text-slate-900">
                {confirmMode === 'pre-auction' ? 'Fresh Pre-Auction' : 'Sample Season'}
              </strong>
              ? Current bidding records will be recalculated.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmMode(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
              >
                Execute Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
