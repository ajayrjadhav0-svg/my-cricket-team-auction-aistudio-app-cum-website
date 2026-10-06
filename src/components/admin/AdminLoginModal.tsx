import React, { useState } from 'react';
import { Shield, Lock, User, Eye, EyeOff, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginAdmin } = useAuction();
  const [userId, setUserId] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const success = loginAdmin(userId, password);
    setIsSubmitting(false);

    if (success) {
      setPassword('');
      setErrorMsg('');
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg('Invalid User ID or Password. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-extrabold text-lg text-slate-900 leading-tight">
                Admin Authentication
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tournament Director & Organizer Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick 1-Click Sign In Banner */}
        <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 flex items-center justify-between gap-3 shadow-2xs">
          <div>
            <span className="font-['Outfit'] font-black text-xs text-indigo-900 block">
              Tournament Director & Demo Mode
            </span>
            <span className="text-[11px] text-indigo-700 block">
              1-Click instant sign in with full administrative privileges
            </span>
          </div>
          <button
            type="button"
            id="btn-quick-admin-login"
            onClick={() => {
              loginAdmin('admin', 'admin123');
              onClose();
              if (onSuccess) onSuccess();
            }}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-['Outfit'] shrink-0 shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>1-Click Sign In</span>
          </button>
        </div>

        {/* Security Notice with Auto-fill helper */}
        <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700">Official Admin Credentials:</span>
            <button
              type="button"
              onClick={() => {
                setUserId('admin');
                setPassword('admin123');
                setErrorMsg('');
              }}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 underline"
            >
              Click to Auto-Fill
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-600">
            <span>User ID: <strong className="text-indigo-600">admin</strong></span>
            <span>Password: <strong className="text-indigo-600">admin123</strong></span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Authorized User ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                autoFocus
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="admin"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium text-slate-900 outline-hidden transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Security Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="admin123 (or leave blank for 1-click)"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-sm font-mono text-slate-900 outline-hidden transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMsg && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 font-medium animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              id="btn-admin-submit-login"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-['Outfit'] flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify & Unlock Admin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
