import React, { useState } from 'react';
import { UserPlus, X, Check, Gavel } from 'lucide-react';
import { PlayerRole } from '../../types';

interface AddNewPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlayer: (player: {
    name: string;
    role: PlayerRole;
    village: string;
    loadDirectlyToAuction: boolean;
  }) => Promise<boolean>;
}

export const AddNewPlayerModal: React.FC<AddNewPlayerModalProps> = ({
  isOpen,
  onClose,
  onAddPlayer,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [role, setRole] = useState<PlayerRole>('All-Rounder');
  const [village, setVillage] = useState('');
  const [loadDirectlyToAuction, setLoadDirectlyToAuction] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      const ok = await onAddPlayer({
        name: name.trim().toUpperCase(),
        role,
        village: village.trim() || 'General',
        loadDirectlyToAuction,
      });
      if (ok) {
        setName('');
        setVillage('');
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                PLAYER REGISTRATION
              </span>
              <h3 className="font-['Outfit'] font-black text-lg text-white">
                Enter New Player into Auction
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Player Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. VIRAT KOHLI or ROHIT SHARMA"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-['Outfit'] font-bold text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Playing Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as PlayerRole)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Batsman">Batsman</option>
                <option value="Bowler">Bowler</option>
                <option value="All-Rounder">All-Rounder</option>
                <option value="Wicket-Keeper">Wicket-Keeper</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Zone / Village / City
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. North Zone"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 cursor-pointer">
            <input
              type="checkbox"
              checked={loadDirectlyToAuction}
              onChange={(e) => setLoadDirectlyToAuction(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <div className="text-xs">
              <span className="font-bold text-indigo-950 block">
                Put Directly on Live Auction Floor
              </span>
              <span className="text-indigo-700 text-[11px]">
                Immediately sets this player onto the hammer stage for bidding.
              </span>
            </div>
          </label>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-['Outfit'] font-black text-xs shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering...' : 'Register & Enter to Auction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
