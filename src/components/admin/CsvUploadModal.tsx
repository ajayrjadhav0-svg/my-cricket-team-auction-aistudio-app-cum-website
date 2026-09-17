import React, { useState, useRef } from 'react';
import { Upload, X, Check, FileText, Download } from 'lucide-react';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCSV: (csvText: string, replaceExisting: boolean) => Promise<{ count: number; message: string } | null>;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  onImportCSV,
}) => {
  if (!isOpen) return null;

  const [csvContent, setCsvContent] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const sample = `Player Name,Role,Zone / Village\nVirat Kohli,Batsman,North Zone\nRohit Sharma,Batsman,West Zone\nJasprit Bumrah,Bowler,West Zone\nRavindra Jadeja,All-Rounder,West Zone\nMS Dhoni,Wicket-Keeper,East Zone\nKL Rahul,Wicket-Keeper,South Zone\nHardik Pandya,All-Rounder,West Zone\nMohammed Shami,Bowler,North Zone\nSuryakumar Yadav,Batsman,West Zone\nKuldeep Yadav,Bowler,Central Zone`;
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_cricket_players.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return;
    setIsImporting(true);
    try {
      const res = await onImportCSV(csvContent, replaceExisting);
      if (res) {
        setCsvContent('');
        onClose();
      }
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                BULK ROSTER IMPORT
              </span>
              <h3 className="font-['Outfit'] font-black text-lg text-white">
                Upload Players CSV Roster
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isImporting}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* File Picker */}
          <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-indigo-400 text-center transition-colors">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-file-input"
            />
            <label
              htmlFor="csv-file-input"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-slate-700">
                Click to browse CSV file or drag here
              </span>
              <span className="text-[11px] text-slate-400">Format: Name, Role, Zone</span>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Or Paste CSV Data Directly
            </label>
            <button
              type="button"
              onClick={handleDownloadSample}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Sample CSV</span>
            </button>
          </div>

          <textarea
            rows={5}
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            placeholder="Virat Kohli,Batsman,North Zone&#10;Rohit Sharma,Batsman,West Zone&#10;Jasprit Bumrah,Bowler,West Zone"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200 cursor-pointer">
            <input
              type="checkbox"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
            />
            <div className="text-xs">
              <span className="font-bold text-amber-950 block">
                Replace Current Player Database
              </span>
              <span className="text-amber-700 text-[11px]">
                If checked, replaces existing roster with this new list.
              </span>
            </div>
          </label>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isImporting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isImporting || !csvContent.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-['Outfit'] font-black text-xs shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isImporting ? 'Importing...' : 'Import Players to Auction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
