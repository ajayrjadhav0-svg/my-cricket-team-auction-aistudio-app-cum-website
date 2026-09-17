import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { ActiveNav } from '../../types';

interface AdminAccessGateProps {
  onUnlockSuccess?: () => void;
  onReturnToDashboard: () => void;
}

export const AdminAccessGate: React.FC<AdminAccessGateProps> = ({
  onUnlockSuccess,
  onReturnToDashboard,
}) => {
  const { loginAdmin } = useAuction();
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const success = loginAdmin(passcode);
    setIsSubmitting(false);

    if (success) {
      setPasscode('');
      setErrorMsg('');
      if (onUnlockSuccess) onUnlockSuccess();
    } else {
      setErrorMsg('Incorrect administrator passcode. Access to admin panel denied.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-md p-6 sm:p-8 text-center space-y-6">
        {/* Lock / Shield Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
          <Shield className="w-8 h-8" />
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Lock className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Title and Explanation */}
        <div className="space-y-2">
          <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-extrabold uppercase tracking-wider">
            RESTRICTED ACCESS
          </span>
          <h2 className="font-['Outfit'] font-black text-2xl text-slate-900 tracking-tight">
            ADMIN PANEL IS FOR ORGANIZERS ONLY
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            The Admin Panel is reserved strictly for tournament auction directors. Viewers and spectators have view-only access to live auctions, team rosters, and standings.
          </p>
        </div>

        {/* Admin Passcode Unlock Card */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Are you the Tournament Administrator?
            </span>
            <span className="text-[10px] font-mono text-slate-400">Passcode Required</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPasscode ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter Admin Passcode (e.g. admin123)"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-sm font-mono text-slate-900 outline-hidden transition-all bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !passcode.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-['Outfit'] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>
        </div>

        {/* Return to Spectator Dashboard */}
        <div className="pt-2">
          <button
            onClick={onReturnToDashboard}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Spectator Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
